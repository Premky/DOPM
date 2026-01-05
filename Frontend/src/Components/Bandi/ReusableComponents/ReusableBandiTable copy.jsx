// ReusableBandiTable.jsx
import React, { useCallback, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
    TextField,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Typography,
} from "@mui/material";

import { useBaseURL } from "../../../Context/BaseURLProvider";
import { finalReleaseDateWithFine } from "../../../../Utils/dateCalculator";
import { useAuth } from "../../../Context/AuthContext";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * ReusableBandiTable
 *
 * - Splits responsibilities: rendering vs export helpers
 * - Performance notes:
 *   * ExcelJS and file-saver are imported at top-level (no dynamic import on each click)
 *   * Export image fetching happens only when includePhoto === true
 *   * Images are fetched in parallel (Promise.allSettled) and only buffers used
 *   * Merge ranges are collected and applied after rows are added (fewer expensive ops)
 *   * Export shows a loading state & basic progress
 *
 * Props:
 *  - language, rows, columns, primaryMergeKey, title, showView/showEdit/showDelete, onView/onEdit/onDelete
 */

const ReusableBandiTable = ( {
    language = "",
    rows = [],
    columns = [],
    primaryMergeKey = "bandi_id",
    title = "",
    showView = false,
    showEdit = false,
    showDelete = false,
    onView,
    onEdit,
    onDelete,
} ) => {
    const BASE_URL = useBaseURL() || "";
    const { state: authState } = useAuth();

    // UI state
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const [filterText, setFilterText] = useState( "" );
    const [orderBy, setOrderBy] = useState( null );
    const [order, setOrder] = useState( "asc" );
    const [photoPreviewOpen, setPhotoPreviewOpen] = useState( false );
    const [photoToPreview, setPhotoToPreview] = useState( "" );
    const [includePhoto, setIncludePhoto] = useState( false );

    // Export state
    const [exporting, setExporting] = useState( false );
    const [exportProgress, setExportProgress] = useState( { done: 0, total: 0 } );

    // small translation helper
    const t = ( np, en ) => ( language === "en" ? en : np );

    // 1) compute derived rows (cached)
    const rowsWithComputed = useMemo(
        () =>
            rows.map( ( r ) => ( {
                ...r,
                remaining_days_to_release:
                    finalReleaseDateWithFine(
                        r.thuna_date_bs,
                        r.release_date_bs,
                        r.total_jariwana_amount
                    ) || 0,
            } ) ),
        [rows]
    );

    // 2) filtering (client-side; move to server if dataset large)
    const filteredRows = useMemo( () => {
        if ( !filterText ) return rowsWithComputed;
        const q = filterText.toLowerCase();
        return rowsWithComputed.filter(
            ( b ) =>
                b.bandi_name?.toLowerCase().includes( q ) ||
                b.bandi_name_en?.toLowerCase().includes( q ) ||
                String( b.office_bandi_id || "" ).toLowerCase().includes( q )
        );
    }, [rowsWithComputed, filterText] );

    // 3) sorting
    const sortedRows = useMemo( () => {
        if ( !orderBy ) return filteredRows;
        // create shallow copy
        const arr = [...filteredRows];
        arr.sort( ( a, b ) => {
            const aVal = a[orderBy] ?? "";
            const bVal = b[orderBy] ?? "";
            if ( typeof aVal === "number" && typeof bVal === "number" ) {
                return order === "asc" ? aVal - bVal : bVal - aVal;
            }
            return order === "asc"
                ? String( aVal ).localeCompare( String( bVal ) )
                : String( bVal ).localeCompare( String( aVal ) );
        } );
        return arr;
    }, [filteredRows, orderBy, order] );

    // 4) pagination
    const paginatedRows = useMemo(
        () => sortedRows.slice( page * rowsPerPage, ( page + 1 ) * rowsPerPage ),
        [sortedRows, page, rowsPerPage]
    );

    const handleSort = useCallback(
        ( field ) => {
            if ( orderBy === field ) {
                setOrder( ( o ) => ( o === "asc" ? "desc" : "asc" ) );
            } else {
                setOrderBy( field );
                setOrder( "asc" );
            }
        },
        [orderBy]
    );

    const handleChangePage = ( event, newPage ) => setPage( newPage );
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };

    // bandi type translation helper
    const bandiTypeMap = useMemo(
        () => ( {
            थुनुवा: "Detainee",
            कैदी: "Prisoner",
        } ),
        []
    );
    const bandiTypeMapReverse = useMemo(
        () => ( { Detainee: "थुनुवा", Prisoner: "कैदी" } ),
        []
    );

    // ---------- EXPORT HELPERS ----------
    // returns extension string from content-type or URL
    const getImgExtFromResponseOrUrl = ( res, url ) => {
        try {
            const ct = res?.headers?.get?.( "content-type" ) || "";
            if ( ct.includes( "png" ) ) return "png";
            if ( ct.includes( "jpeg" ) || ct.includes( "jpg" ) ) return "jpeg";
        } catch ( e ) { }
        if ( url?.toLowerCase().endsWith( ".png" ) ) return "png";
        return "jpeg";
    };

    // fetch images in parallel and return a map url -> { buffer, ext }.
    // resilient: returns only fulfilled ones.
    const fetchImages = async ( urls = [], onProgress ) => {
        if ( !urls || urls.length === 0 ) return {};
        const results = await Promise.allSettled(
            urls.map( async ( u, i ) => {
                // don't fetch falsy urls
                if ( !u ) return { url: u, ok: false, reason: "empty" };
                // attempt fetch
                const res = await fetch( u );
                if ( !res.ok ) throw new Error( `HTTP ${ res.status }` );
                const arrayBuffer = await res.arrayBuffer();
                const ext = getImgExtFromResponseOrUrl( res, u );
                onProgress?.( i );
                return { url: u, ok: true, buffer: arrayBuffer, ext };
            } )
        );

        const map = {};
        results.forEach( ( r ) => {
            if ( r.status === "fulfilled" ) {
                const v = r.value;
                if ( v && v.ok ) map[v.url] = { buffer: v.buffer, ext: v.ext };
            }
        } );
        return map;
    };

    /**
     * handleExport
     * - includePhoto is read from component state (includePhoto)
     * - optimized: prepares headers, adds rows, collects merge ranges, applies merges once,
     *   and inserts images after rows are added (image buffers fetched ahead-of-time)
     */
    const handleExport = useCallback(
        async ( opts = {} ) => {
            try {
                setExporting( true );
                setExportProgress( { done: 0, total: 0 } );

                // use the component state includePhoto (so user checkbox affects export)
                const addPhotos = Boolean( includePhoto );

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet( t( "बन्दी विवरण", "Bandi Details" ) );

                // Build headers (exclude internal photo_path column, we add separate Photo column if requested)
                const headerCols = columns.filter( ( c ) => c.field !== "photo_path" );
                const bandiHeaders = headerCols.map( ( c ) => c.headerName );

                const baseFooterCols = [
                    t( "देश", "Country" ),
                    t( "जन्म मिति(ई.सं.)", "Date of Birth(A.D.)" ),
                    t( "जन्म मिति(वि.सं.)", "Date of Birth(B.S.)" ),
                    t( "मुद्दा समूह", "Mudda Group" ),
                    t( "मुद्दा", "Case" ),
                    t( "मुद्दा नं.", "Case No." ),
                    t( "जाहेरवाला", "Complainant" ),
                    t( "फैसला गर्ने कार्यालय", "Decision Office" ),
                    t( "फैसला मिति", "Decision Date" ),
                ];

                // final header row
                const headerRow = [t( "सि.नं.", "S.N." ), ...bandiHeaders, ...baseFooterCols];
                if ( addPhotos ) headerRow.push( t( "फोटो", "Photo" ) );

                worksheet.addRow( headerRow );
                // style header row
                worksheet.getRow( 1 ).font = { name: "Kalimati", size: 14, bold: true };

                // Pre-calc image URLs only if addPhotos
                // We'll collect image URLs for bandi rows (only once per bandi)
                const imageUrls = [];
                const bandiIndexToImageUrl = new Map(); // map bandiIndex -> url or null
                if ( addPhotos ) {
                    filteredRows.forEach( ( b, idx ) => {
                        const url = b.photo_path ? `${ BASE_URL }${ b.photo_path }` : null;
                        bandiIndexToImageUrl.set( idx, url );
                        if ( url ) imageUrls.push( url );
                    } );
                }

                // Fetch images in parallel (if any). Keep progress
                let imgBuffers = {};
                if ( addPhotos && imageUrls.length > 0 ) {
                    setExportProgress( { done: 0, total: imageUrls.length } );
                    // fetchImages will call onProgress with index of url being processed
                    imgBuffers = await fetchImages( imageUrls, ( i ) => {
                        setExportProgress( ( p ) => ( { ...p, done: p.done + 1 } ) );
                    } );
                }

                // We'll gather merge ranges and image placements to run after rows insertion
                const mergeRanges = [];
                const imagePlacements = []; // { bandiIndexRowStart, bandiRowCount, imgUrl }

                // Start inserting rows
                let currentRowNumber = 2; // excel row index (1-based), headers occupy row 1

                for ( let bIdx = 0; bIdx < filteredRows.length; bIdx++ ) {
                    const bandi = filteredRows[bIdx];
                    const muddaList = bandi.muddas?.length ? bandi.muddas : [{}];
                    const muddaCount = muddaList.length;

                    for ( let mIdx = 0; mIdx < muddaCount; mIdx++ ) {
                        const mudda = muddaList[mIdx];

                        // populate columns (respect order in headerCols)
                        const bandiValues = headerCols.map( ( col ) => {
                            // special-case fields:
                            if ( col.field === "bandi_address" ) {
                                if ( bandi.nationality === "स्वदेशी" ) {
                                    return language === "en"
                                        ? `${ bandi.state_name_en || "" }, ${ bandi.district_name_en || "" }, ${ bandi.city_name_en || "" } - ${ bandi.wardno || "" }, ${ bandi.country_name_en || "" }`
                                        : `${ bandi.state_name_np || "" }, ${ bandi.district_name_np || "" }, ${ bandi.city_name_np || "" } - ${ bandi.wardno || "" }, ${ bandi.country_name_np || "" }`;
                                } else {
                                    return language === "en"
                                        ? `${ bandi.bidesh_nagarik_address_details || "" }, ${ bandi.country_name_en || "" }`
                                        : `${ bandi.bidesh_nagarik_address_details || "" }, ${ bandi.country_name_np || "" }`;
                                }
                            }

                            if ( col.field === "bandi_type" ) {
                                return language === "en"
                                    ? bandiTypeMap[bandi[col.field]] || bandi[col.field] || ""
                                    : bandiTypeMapReverse[bandi[col.field]] || bandi[col.field] || "";
                            }
                            return mIdx === 0 ? bandi[col.field] ?? "" : "";
                        } );

                        const finalRow = [
                            mIdx === 0 ? bIdx + 1 : "",
                            ...bandiValues,
                            language === "en" ? bandi.country_name_en || "" : bandi.country_name_np || "",
                            bandi.dob_ad ? new Date( bandi.dob_ad ) : "",
                            bandi.dob || "",
                            language === "en" ? mudda?.mudda_group_name_en || "" : mudda?.mudda_group_name || "",
                            language === "en" ? mudda?.mudda_name_en || "" : mudda?.mudda_name || "",
                            mudda?.mudda_no || "",
                            language === "en" ? mudda?.vadi_en || "" : mudda?.vadi || "",
                            language === "en" ? mudda?.mudda_phesala_antim_office_en || "" : mudda?.mudda_phesala_antim_office || "",
                            mudda?.mudda_phesala_antim_office_date || "",
                        ];

                        if ( addPhotos ) finalRow.push( "" ); // placeholder cell for photo column

                        worksheet.addRow( finalRow );

                        currentRowNumber++;
                    } // end mudda loop

                    // if multiple mudda rows for this bandi, collect merge ranges
                    if ( muddaCount > 1 ) {
                        // merge SN column
                        mergeRanges.push( `A${ currentRowNumber - muddaCount }:${ "A" }${ currentRowNumber - 1 }` ); // placeholder - we'll compute exact string below
                        // merge bandi column blocks (headerCols)
                        const startRow = currentRowNumber - muddaCount;
                        const endRow = currentRowNumber - 1;
                        headerCols.forEach( ( col, colIdx ) => {
                            const colNumber = colIdx + 2; // SN is column 1
                            mergeRanges.push(
                                `${ worksheet.getCell( startRow, colNumber ).address }:${ worksheet.getCell( endRow, colNumber ).address }`
                            );
                        } );

                        // merge Country, DOB AD, DOB BS
                        const footerStartCol = 1 + bandiHeaders.length + 1; // column index of Country
                        const footerColsToMerge = [footerStartCol, footerStartCol + 1, footerStartCol + 2];

                        footerColsToMerge.forEach( ( colNumber ) => {
                            mergeRanges.push(
                                `${ worksheet.getCell( startRow, colNumber ).address }:${ worksheet.getCell( endRow, colNumber ).address }`
                            );
                        } );

                        // if photo column exists, we'll merge that later too
                        if ( addPhotos ) {
                            const photoColIndex = headerRow.length; // last column index
                            mergeRanges.push(
                                `${ worksheet.getCell( currentRowNumber - muddaCount, photoColIndex ).address }:${ worksheet.getCell(
                                    currentRowNumber - 1,
                                    photoColIndex
                                ).address }`
                            );
                        }
                    }

                    // queue image placement for this bandi (if addPhotos and image exists)
                    if ( addPhotos ) {
                        const imgUrl = bandi.photo_path ? `${ BASE_URL }${ bandi.photo_path }` : null;
                        if ( imgUrl ) {
                            // row index in excel where this bandi starts:
                            const bandiStartRow = currentRowNumber - muddaCount;
                            imagePlacements.push( {
                                url: imgUrl,
                                startRow: bandiStartRow,
                                rowCount: muddaCount,
                            } );
                        }
                    }
                } // end bandi loop

                // APPLY merges (unique and valid)
                // filter duplicates and invalid ranges
                // Note: some merge ranges were added as "Astart:Aend" strings already; keep as-is
                const uniqueMerges = Array.from( new Set( mergeRanges ) ).filter( Boolean );
                uniqueMerges.forEach( ( r ) => {
                    try {
                        worksheet.mergeCells( r );
                    } catch ( e ) {
                        // ignore invalid merge formats (defensive)
                        // console.warn("merge failed", r, e);
                    }
                } );

                // ADD IMAGES (we already fetched buffers above)
                if ( addPhotos && imagePlacements.length > 0 ) {
                    for ( const placement of imagePlacements ) {
                        const url = placement.url;
                        const info = imgBuffers[url];
                        if ( !info ) continue;
                        // add image
                        const ext = info.ext || "jpeg";
                        const imageId = workbook.addImage( {
                            buffer: info.buffer,
                            extension: ext,
                        } );
                        // compute column to place the photo: last column
                        const photoColIndex = headerRow.length; // 1-based
                        // place image in bounding box covering the merged rows
                        worksheet.addImage( imageId, {
                            tl: { col: photoColIndex - 1, row: placement.startRow - 1 },
                            ext: { width: 120, height: 150 },
                        } );

                        // set column width and row heights for rows spanned
                        worksheet.getColumn( photoColIndex ).width = 25;
                        for ( let r = 0; r < placement.rowCount; r++ ) {
                            worksheet.getRow( placement.startRow + r ).height = 110;
                        }
                    }
                }

                // Auto-fit column widths (careful: running eachCell on huge sheets may be heavy)
                // For medium datasets this is fine. If you have thousands of rows, consider skipping this block.
                worksheet.columns.forEach( ( col ) => {
                    let max = 10;
                    col.eachCell( { includeEmpty: true }, ( cell ) => {
                        const v = cell.value;
                        const len = v ? v.toString().length : 0;
                        if ( len > max ) max = len;
                    } );
                    col.width = max + 2;
                } );

                // Styling for all cells
                worksheet.eachRow( ( row ) => {
                    row.eachCell( ( cell ) => {
                        cell.font = { name: "Kalimati", size: 12 };
                        cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
                    } );
                } );

                worksheet.views = [{ state: "frozen", ySplit: 1 }];

                const buffer = await workbook.xlsx.writeBuffer();
                saveAs( new Blob( [buffer] ), language === "en" ? "Bandi_Records.xlsx" : "बन्दी_विवरण.xlsx" );
            } catch ( err ) {
                console.error( "Export failed:", err );
                // you may want to show toast here
            } finally {
                setExporting( false );
                setExportProgress( { done: 0, total: 0 } );
            }
        },
        // dependencies: careful to include only primitives or stable references
        [filteredRows, columns, includePhoto, language, BASE_URL, bandiTypeMap, bandiTypeMapReverse]
    );

    // --------- Render ---------
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    {filteredRows.length} {t( "वटा विवरण भेटियो", "Records Found" )}
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                    <TextField
                        label={t( "बन्दीको नाम/संकेत नं.ले खोज्नुहोस्", "Prisoner's Name/Bandi ID" )}
                        variant="outlined"
                        size="small"
                        value={filterText}
                        onChange={( e ) => setFilterText( e.target.value )}
                    />

                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={includePhoto} onChange={( e ) => setIncludePhoto( e.target.checked )} />
                        {t( "फोटो समावेश गर्नुहोस्", "Include Photo" )}
                    </label>

                    < a href={`${ BASE_URL }/bandi/export_office_bandi_excel?language=${ language }&includePhoto=${ includePhoto ? 1 : 0 }`}>
                        <Button variant="outlined" disabled={exporting}>
                            {exporting ? (
                                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                    <CircularProgress size={16} /> {t( "निर्यात हुँदैछ...", "Exporting..." )}
                                </span>
                            ) : (
                                t( "एक्सेल निर्यात", "Export to Excel" )
                            )}
                        </Button>
                    </a>


                    {/* <Button variant="outlined" onClick={() => handleExport()} disabled={exporting}>
                        {exporting ? (
                            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <CircularProgress size={16} /> {t( "निर्यात हुँदैछ...", "Exporting..." )}
                            </span>
                        ) : (
                            t( "एक्सेल निर्यात", "Export to Excel" )
                        )}
                    </Button> */}
                </Box>
            </Box>

            <Dialog open={photoPreviewOpen} onClose={() => setPhotoPreviewOpen( false )} maxWidth="sm" fullWidth>
                <DialogTitle>{t( "फोटो", "Photo" )}</DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <img src={photoToPreview} alt="Preview" style={{ width: "100%", maxWidth: 400, borderRadius: 8, objectFit: "contain" }} />
                </DialogContent>
            </Dialog>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">{t( "सि.नं.", "S.N." )}</TableCell>
                            {columns.map( ( col ) => (
                                <TableCell
                                    key={col.field}
                                    align="center"
                                    onClick={() => handleSort( col.field )}
                                    style={{ cursor: "pointer", fontWeight: orderBy === col.field ? "bold" : "normal" }}
                                >
                                    {col.headerName}
                                    {orderBy === col.field ? ( order === "asc" ? " 🔼" : " 🔽" ) : ""}
                                </TableCell>
                            ) )}
                            <TableCell align="center">{t( "मुद्दा", "Case" )}</TableCell>
                            <TableCell align="center">{t( "मुद्दा नं.", "Case No." )}</TableCell>
                            <TableCell align="center">{t( "जाहेरवाला", "Complainant" )}</TableCell>
                            <TableCell align="center">{t( "फैसला कार्यालय/मिति", "Decision Office/Date" )}</TableCell>
                            <TableCell align="center">#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedRows.map( ( bandi, bandiIndex ) => {
                            const muddaList = bandi.muddas?.length ? bandi.muddas : [{}];
                            const rowSpan = muddaList.length;

                            return muddaList.map( ( mudda, muddaIndex ) => (
                                <TableRow key={`${ bandi[primaryMergeKey] }-${ muddaIndex }`}>
                                    {muddaIndex === 0 && (
                                        <TableCell rowSpan={rowSpan} align="center">
                                            {page * rowsPerPage + bandiIndex + 1}
                                        </TableCell>
                                    )}

                                    {muddaIndex === 0 &&
                                        columns.map( ( col ) => {
                                            const value = bandi[col.field];
                                            return (
                                                <TableCell key={col.field} rowSpan={rowSpan} align="center">
                                                    {col.renderCell ? (
                                                        col.renderCell( { value, row: bandi } )
                                                    ) : col.field === "photo_path" && value ? (
                                                        <img
                                                            src={`${ BASE_URL }${ value }`}
                                                            alt="बन्दी"
                                                            onClick={() => {
                                                                setPhotoToPreview( `${ BASE_URL }${ value }` );
                                                                setPhotoPreviewOpen( true );
                                                            }}
                                                            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
                                                        />
                                                    ) : (
                                                        value ?? ""
                                                    )}
                                                </TableCell>
                                            );
                                        } )}

                                    <TableCell align="center">{language === "en" ? mudda?.mudda_name_en : mudda?.mudda_name}</TableCell>
                                    <TableCell align="center">{mudda?.mudda_no}</TableCell>
                                    <TableCell align="center">{language === "en" ? mudda?.vadi_en : mudda?.vadi}</TableCell>
                                    <TableCell align="center">{`${ mudda?.mudda_phesala_antim_office || "" } ${ mudda?.mudda_phesala_antim_office_date || "" }`}</TableCell>

                                    {muddaIndex === 0 && (
                                        <TableCell rowSpan={rowSpan} align="center">
                                            {( bandi.current_office_id === authState.office_id || authState.office_id === 2 ) &&
                                                ( bandi.is_under_facility === 0 || bandi.is_under_facility === null ) && (
                                                    <a href={`/bandi/view_saved_record/${ bandi.bandi_id }`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                                                        <Button variant="outlined" size="small" color="primary">
                                                            VIEW
                                                        </Button>
                                                    </a>
                                                )}

                                            {showEdit && (
                                                <Button variant="outlined" size="small" color="secondary" onClick={() => onEdit?.( bandi )} style={{ marginLeft: 8 }}>
                                                    Edit
                                                </Button>
                                            )}

                                            {showDelete && (
                                                <Button variant="outlined" size="small" color="error" onClick={() => onDelete?.( bandi )} style={{ marginLeft: 8 }}>
                                                    Delete
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ) );
                        } )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[25, 50, 100, 200, 500]}
                component="div"
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default ReusableBandiTable;