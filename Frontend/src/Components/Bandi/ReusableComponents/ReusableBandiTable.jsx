import { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Box, TextField, TablePagination,
    Dialog, DialogTitle, DialogContent
} from '@mui/material';

import { useBaseURL } from '../../../Context/BaseURLProvider';
import { finalReleaseDateWithFine } from '../../../../Utils/dateCalculator';
import { useAuth } from '../../../Context/AuthContext';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ReusableBandiTable = ( {
    language = '',
    rows = [],
    columns = [],
    primaryMergeKey = 'bandi_id',
    title = '',
    showView = false,
    showEdit = false,
    showDelete = false,
    onView,
    onEdit,
    onDelete,
} ) => {
    const BASE_URL = useBaseURL() || '';
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const [filterText, setFilterText] = useState( '' );
    const [photoPreviewOpen, setPhotoPreviewOpen] = useState( false );
    const [photoToPreview, setPhotoToPreview] = useState( '' );

    const rowsWithComputed = useMemo( () => {
        return rows.map( row => ( {
            ...row,
            remaining_days_to_release: finalReleaseDateWithFine(
                row.thuna_date_bs,
                row.release_date_bs,
                row.total_jariwana_amount
            ) || 0
        } ) );
    }, [rows] );

    const { state: authState } = useAuth();
    const filteredRows = useMemo( () => {
        if ( !filterText ) return rowsWithComputed;
        return rowsWithComputed.filter( bandi =>
            bandi.bandi_name?.toLowerCase().includes( filterText.toLowerCase() ) ||
            bandi.bandi_name_en?.toLowerCase().includes( filterText.toLowerCase() ) ||
            bandi.office_bandi_id?.toString().includes( filterText.toLowerCase() )
        );
    }, [rowsWithComputed, filterText] );

    const [orderBy, setOrderBy] = useState( null );
    const [order, setOrder] = useState( 'asc' );
    const [includePhoto, setIncludePhoto] = useState( false );

    const handleSort = ( field ) => {
        if ( orderBy === field ) {
            setOrder( order === 'asc' ? 'desc' : 'asc' );
        } else {
            setOrderBy( field );
            setOrder( 'asc' );
        }
    };

    const sortedRows = useMemo( () => {
        if ( !orderBy ) return filteredRows;

        return [...filteredRows].sort( ( a, b ) => {
            const aValue = a[orderBy] ?? '';
            const bValue = b[orderBy] ?? '';

            if ( typeof aValue === 'number' && typeof bValue === 'number' ) {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return order === 'asc'
                ? String( aValue ).localeCompare( String( bValue ) )
                : String( bValue ).localeCompare( String( aValue ) );
        } );
    }, [filteredRows, orderBy, order] );

    const paginatedRows = useMemo( () => {
        return sortedRows.slice( page * rowsPerPage, ( page + 1 ) * rowsPerPage );
    }, [sortedRows, page, rowsPerPage] );


    const handleChangePage = ( event, newPage ) => setPage( newPage );
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };

    const bandiTypeMap = {
        "थुनुवा": "Detainee",
        "कैदी": "Prisoner"
    };


    const handleExport = async () => {
        const ExcelJS = await import( "exceljs" );
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet( "बन्दी विवरण" );
        const { saveAs } = await import( "file-saver" );

        // ⬅️ Toggle from UI
        const includePhoto = true;

        // Build dynamic headers
        const bandiHeaders = columns.filter( c => c.field !== "photo_path" ).map( c => c.headerName );

        let headerRow = [];

        if ( language === "en" ) {
            headerRow = [
                "S.N.",
                ...bandiHeaders,
                "Country",
                "Date of Birth(A.D.)",
                "Date of Birth(B.S.)",
                "Mudda Group",
                "Case",
                "Case No.",
                "Complainant",
                "Decision Office",
                "Decision Date"
            ];
        } else {
            headerRow = [
                "सि.नं.",
                ...bandiHeaders,
                "देश",
                "जन्म मिति(ई.सं.)",
                "जन्म मिति(वि.सं.)",
                "मुद्दा समूह",
                "मुद्दा",
                "मुद्दा नं.",
                "जाहेरवाला",
                "फैसला गर्ने कार्यालय",
                "फैसला मिति"
            ];
        }

        // ➕ ADD PHOTO HEADER
        if ( includePhoto ) {
            headerRow.push( language === "en" ? "Photo" : "फोटो" );
        }

        worksheet.addRow( headerRow );

        let excelRowIndex = 2;

        for ( let bandiIndex = 0; bandiIndex < filteredRows.length; bandiIndex++ ) {
            const bandi = filteredRows[bandiIndex];
            const muddaList = bandi.muddas?.length ? bandi.muddas : [{}];
            const muddaCount = muddaList.length;

            for ( let idx = 0; idx < muddaCount; idx++ ) {
                const mudda = muddaList[idx];

                let rowData = [
                    idx === 0 ? bandiIndex + 1 : "",
                    ...columns.filter( col => col.field !== "photo_path" ).map( col => {
                        if ( col.field === "bandi_address" ) {
                            if ( bandi.nationality === "स्वदेशी" ) {
                                return language === "en"
                                    ? `${ bandi.state_name_en }, ${ bandi.district_name_en }, ${ bandi.city_name_en } - ${ bandi.wardno }, ${ bandi.country_name_en }`
                                    : `${ bandi.state_name_np }, ${ bandi.district_name_np }, ${ bandi.city_name_np } - ${ bandi.wardno }, ${ bandi.country_name_np }`;
                            } else {
                                return language === "en"
                                    ? `${ bandi.bidesh_nagarik_address_details }, ${ bandi.country_name_en }`
                                    : `${ bandi.bidesh_nagarik_address_details }, ${ bandi.country_name_np }`;
                            }
                        }

                        if ( col.field === "bandi_type" ) {
                            if ( language === "en" ) {
                                return bandiTypeMap[bandi[col.field]] || bandi[col.field] || "";
                            } else {
                                const reverseMap = { Detainee: "थुनुवा", Prisoner: "कैदी" };
                                return reverseMap[bandi[col.field]] || bandi[col.field] || "";
                            }
                        }

                        return idx === 0 ? bandi[col.field] || "" : "";
                    } ),
                    language === "en" ? bandi.country_name_en : bandi.country_name_np,
                    bandi.dob_ad ? new Date( bandi.dob_ad ) : "",
                    bandi.dob || "",
                    language === "en" ? mudda.mudda_group_name : mudda.mudda_group_name,
                    language === "en" ? mudda.mudda_name_en : mudda.mudda_name,
                    mudda.mudda_no || "",
                    language === "en" ? mudda.vadi_en : mudda.vadi,
                    language === "en"
                        ? mudda.mudda_phesala_antim_office_en
                        : mudda.mudda_phesala_antim_office,
                    mudda.mudda_phesala_antim_office_date || ""
                ];

                // ➕ ADD EMPTY PHOTO CELL
                if ( includePhoto ) rowData.push( "" );

                worksheet.addRow( rowData );
            }

            // MERGE CELLS FOR MULTIPLE MUDDAS
            if ( muddaCount > 1 ) {
                const colCount = headerRow.length - ( includePhoto ? 1 : 0 );

                worksheet.mergeCells( `A${ excelRowIndex }:A${ excelRowIndex + muddaCount - 1 }` );

                columns.filter( c => c.field !== "photo_path" ).forEach( ( col, idx ) => {
                    const cIndex = idx + 2;
                    worksheet.mergeCells(
                        `${ worksheet.getCell( excelRowIndex, cIndex ).address }:${ worksheet.getCell(
                            excelRowIndex + muddaCount - 1,
                            cIndex
                        ).address }`
                    );
                } );
            }

            // ADD IMAGE INTO MERGED ROW
            if ( includePhoto && bandi.photo_path ) {
                try {
                    const imgUrl = `${ BASE_URL }${ bandi.photo_path }`;
                    const res = await fetch( imgUrl );
                    const imgBuffer = await res.arrayBuffer();

                    const imageId = workbook.addImage( {
                        buffer: imgBuffer,
                        extension: "jpeg"
                    } );

                    const photoCol = headerRow.length; // last column
                    const rowStart = excelRowIndex - 1;
                    const rowEnd = rowStart + muddaCount - 1;

                    worksheet.getColumn( photoCol ).width = 25;

                    worksheet.addImage( imageId, {
                        tl: { col: photoCol - 1, row: rowStart },
                        ext: { width: 120, height: 150 }
                    } );

                    for ( let r = rowStart; r <= rowEnd; r++ ) {
                        worksheet.getRow( r + 1 ).height = 110;
                    }
                } catch ( err ) {
                    console.log( "IMAGE ERROR:", err );
                }
            }

            excelRowIndex += muddaCount;
        }

        // AUTO COLUMN WIDTHS
        worksheet.columns.forEach( column => {
            let max = 10;
            column.eachCell( { includeEmpty: true }, cell => {
                const len = cell.value ? cell.value.toString().length : 0;
                if ( len > max ) max = len;
            } );
            column.width = max + 2;
        } );

        // STYLING
        worksheet.eachRow( row => {
            row.eachCell( cell => {
                cell.font = { name: "Kalimati", size: 12 };
                cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
            } );
        } );

        worksheet.getRow( 1 ).eachCell( cell => {
            cell.font = { name: "Kalimati", size: 14, bold: true };
        } );

        worksheet.views = [{ state: "frozen", ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs( new Blob( [buffer] ), language === "en" ? "Bandi_Records.xlsx" : "बन्दी_विवरण.xlsx" );
    };


    // console.log(paginatedRows);
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h3>  {filteredRows.length} {language == 'en' ? 'Records Found' : 'वटा विवरण भेटियो'}  </h3>
                <Box mb={2}>
                    <TextField
                        label={language == 'en' ? "Prisoner's Name/Bandi ID" : 'बन्दीको नाम/संकेत नं.ले खोज्नुहोस्'}
                        variant="outlined"
                        size="small"
                        value={filterText}
                        onChange={( e ) => setFilterText( e.target.value )}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={includePhoto}
                            onChange={( e ) => setIncludePhoto( e.target.checked )}
                        />
                        {language === 'en' ? 'Include Photo' : 'फोटो समावेश गर्नुहोस्'}
                    </label>
                    <Button variant="outlined" onClick={handleExport}>
                        {language === 'en' ? 'Export to Excel' : 'एक्सेल निर्यात'}
                    </Button>
                </Box>
            </Box>

            <Dialog open={photoPreviewOpen} onClose={() => setPhotoPreviewOpen( false )} maxWidth="sm" fullWidth>
                <DialogTitle>फोटो</DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <img
                        src={photoToPreview}
                        alt="Preview"
                        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', objectFit: 'contain' }}
                    />
                </DialogContent>
            </Dialog>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>

                            <TableCell align="center"> {language == 'en' ? 'S.N.' : 'सि.नं.'} </TableCell>
                            {/* <TableCell align="center">कारागार कार्यालय</TableCell> */}
                            {columns.map( col => (
                                <TableCell key={col.field} align="center"
                                    onClick={() => handleSort( col.field )}
                                    style={{ cursor: 'pointer', fontWeight: orderBy === col.field ? 'bold' : 'normal' }}
                                >{col.headerName}
                                    {orderBy === col.field ? ( order === 'asc' ? ' 🔼' : ' 🔽' ) : ''}
                                </TableCell>
                            ) )}
                            <TableCell align="center">{language == 'en' ? 'Case' : 'मुद्दा'}</TableCell>
                            <TableCell align="center">{language == 'en' ? 'Complainant' : 'जाहेरवाला'}</TableCell>
                            <TableCell align="center">{language == 'en' ? 'Decision Office/Date' : 'फैसला कार्यालय/मिति'} </TableCell>
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

                                    {muddaIndex === 0 && columns.map( col => {
                                        const value = bandi[col.field];
                                        return (
                                            <TableCell key={col.field} rowSpan={rowSpan} align="center">
                                                {col.renderCell
                                                    ? col.renderCell( { value, row: bandi } )
                                                    : col.field === 'photo_path' && value ? (
                                                        <img
                                                            src={`${ BASE_URL }${ value }`}
                                                            alt="बन्दी"
                                                            onClick={() => {
                                                                setPhotoToPreview( `${ BASE_URL }${ value }` );
                                                                setPhotoPreviewOpen( true );
                                                            }}
                                                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                                        />
                                                    ) : (
                                                        value || ''
                                                    )}
                                            </TableCell>
                                        );
                                    } )}

                                    <TableCell align="center">{language == 'en' ? mudda?.mudda_name_en : mudda?.mudda_name} </TableCell>
                                    <TableCell align="center"> {language == 'en' ? mudda?.vadi_en : mudda?.vadi} </TableCell>
                                    <TableCell align="center">{( mudda?.mudda_phesala_antim_office || '' ) + ' ' + ( mudda?.mudda_phesala_antim_office_date || '' )}</TableCell>

                                    {muddaIndex === 0 && (
                                        <TableCell rowSpan={rowSpan} align="center">
                                            {
                                                ( bandi.current_office_id === authState.office_id || authState.office_id === 2 ) && (
                                                    ( bandi.is_under_facility === 0 || bandi.is_under_facility === null ) && (
                                                        <a
                                                            href={`/bandi/view_saved_record/${ bandi.id }`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ textDecoration: "none", color: "inherit" }}
                                                        >
                                                            <Button variant="outlined" size="small" color="primary">VIEW</Button>
                                                        </a>
                                                    )
                                                )
                                            }

                                            {showEdit && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => onEdit?.( bandi )}
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    Edit
                                                </Button>
                                            )}

                                            {showDelete && <Button variant="outlined" size="small" color="error" onClick={() => onDelete?.( bandi )}>Delete</Button>}
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