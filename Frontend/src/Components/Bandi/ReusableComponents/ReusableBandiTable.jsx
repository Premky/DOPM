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
import axios from "axios";
import { set } from "react-hook-form";

const ReusableBandiTable = ( {
    language = "",
    filters = {},
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


    //Export Handler
    const handleExport = async () => {
        try {
            setExporting( true );

            const response = await axios.get( `${ BASE_URL }/bandi/export_office_bandi_excel`, { params: filters, responseType: 'blob', withCredentials: true } );
            const blob = new Blob( [response.data] );
            const url = window.URL.createObjectURL( blob );
            const link = document.createElement( 'a' );
            link.href = url;
            link.download = `${ language === "en" ? "Bandi_Details.xlsx" : "बन्दी_विवरण.xlsx" }`;
            document.body.appendChild( link );
            link.click();
            link.remove();
            window.URL.revokeObjectURL( url );
        } catch ( error ) {
            console.error( 'Export failed:', error );
            Swal.fire( 'Error', 'Export failed', 'error' );
            setExporting( false );
        } finally {
            setExporting( false );
        }
    };


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

                    {/* < a href={`${ BASE_URL }/bandi/export_office_bandi_excel?language=${ language }&includePhoto=${ includePhoto ? 1 : 0 }`}>
                        <Button variant="outlined" disabled={exporting}>
                            {exporting ? (
                                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                    <CircularProgress size={16} /> {t( "निर्यात हुँदैछ...", "Exporting..." )}
                                </span>
                            ) : (
                                t( "एक्सेल निर्यात", "Export to Excel" )
                            )}
                        </Button>
                    </a> */}


                    <Button variant="outlined" onClick={() => handleExport()} disabled={exporting}>
                        {exporting ? (
                            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <CircularProgress size={16} /> {t( "निर्यात हुँदैछ...", "Exporting..." )}
                            </span>
                        ) : (
                            t( "एक्सेल निर्यात", "Export to Excel" )
                        )}
                    </Button>
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