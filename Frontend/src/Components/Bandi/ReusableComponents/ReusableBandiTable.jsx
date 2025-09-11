import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Button, Box, TextField, TablePagination,
    Dialog, DialogTitle, DialogContent
} from '@mui/material';

import { useBaseURL } from '../../../Context/BaseURLProvider';
import { finalReleaseDateWithFine } from '../../../../Utils/dateCalculator';

const ReusableBandiTable = ( {
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


    const filteredRows = useMemo( () => {
        if ( !filterText ) return rowsWithComputed;
        return rowsWithComputed.filter( bandi =>
            bandi.bandi_name?.toLowerCase().includes( filterText.toLowerCase() ) ||
            bandi.office_bandi_id?.toString().includes( filterText.toLowerCase() )
        );
    }, [rowsWithComputed, filterText] );

    const [orderBy, setOrderBy] = useState( null );
    const [order, setOrder] = useState( 'asc' );

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

    const handleExport = async () => {
        const ExcelJS= await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet( 'बन्दी विवरण' );
        const { saveAs } = await import( "file-saver" );

        const bandiHeaders = columns.filter( c => c.field !== 'photo_path' ).map( c => c.headerName );
        worksheet.addRow( ['सि.नं.', ...bandiHeaders,'देश', 'मुद्दा', 'जाहेरवाला', 'फैसला गर्ने कार्यालय', 'फैसला मिति'] );

        let excelRowIndex = 2;
        filteredRows.forEach( ( bandi, bandiIndex ) => {
            const muddaList = bandi.muddas?.length ? bandi.muddas : [{}];
            const muddaCount = muddaList.length;
            console.log( muddaList );
            muddaList.forEach( ( mudda, idx ) => {
                let rowData = [
                    idx === 0 ? bandiIndex + 1 : '',
                    ...columns.filter( col => col.field !== 'photo_path' ).map( col => {
                        if ( col.field === 'bandi_address' ) {
                            if ( bandi.nationality === 'स्वदेशी' ) {
                                return `${ bandi.state_name_np || '' }, ${ bandi.district_name_np || '' }, ${ bandi.city_name_np || '' } - ${ bandi.wardno || '' }, ${ bandi.country_name_np || '' }`;
                            } else {
                                return `${ bandi.bidesh_nagarik_address_details || '' }, ${ bandi.country_name_np || '' }`;
                            }
                        }
                        return idx === 0 ? bandi[col.field] || '' : '';
                    } ),
                    bandi.country_name_np || '',
                    mudda?.mudda_name || '',
                    mudda?.vadi || '0',
                    mudda?.mudda_phesala_antim_office || '',
                    mudda?.mudda_phesala_antim_office_date || ''
                ];
                worksheet.addRow( rowData );
            } );

            if ( muddaCount > 1 ) {
                worksheet.mergeCells( `A${ excelRowIndex }:A${ excelRowIndex + muddaCount - 1 }` );
                columns.filter( c => c.field !== 'photo_path' ).forEach( ( col, idx ) => {
                    const colNumber = idx + 2;
                    worksheet.mergeCells(
                        worksheet.getCell( excelRowIndex, colNumber ).address +
                        ':' +
                        worksheet.getCell( excelRowIndex + muddaCount - 1, colNumber ).address
                    );
                } );
            }
            excelRowIndex += muddaCount;
        } );

        worksheet.columns.forEach( column => {
            let maxLength = 10;
            column.eachCell( { includeEmpty: true }, cell => {
                const length = cell.value ? cell.value.toString().length : 0;
                if ( length > maxLength ) maxLength = length;
            } );
            column.width = maxLength + 2;
        } );
        worksheet.eachRow( row => {
            row.eachCell( cell => {
                cell.font = { name: 'Kalimati', size: 12 }; // Set font for each cell     
                cell.alignment = {
                    wrapText: true,                    
                    vertical: 'middle',
                    horizontal: 'center'
                };
            } );
        } );
        worksheet.getRow( 1 ).eachCell( cell => {
            cell.font = { name: 'Kalimati', size: 14, bold: true };
        } );
        worksheet.views = [{ state: "frozen", ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob( [buffer], { type: 'application/octet-stream' } );
        saveAs( blob, 'bandi_records.xlsx' );
    };

    // console.log(paginatedRows);
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h2>{title}</h2>
                <Box mb={2}>
                    <TextField
                        label="बन्दीको नाम/संकेत नं.ले खोज्नुहोस्"
                        variant="outlined"
                        size="small"
                        value={filterText}
                        onChange={( e ) => setFilterText( e.target.value )}
                    />
                </Box>
                <Button variant="outlined" onClick={handleExport}>एक्सेल निर्यात</Button>
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
                            <TableCell align="center">सि.नं.</TableCell>
                            {/* <TableCell align="center">कारागार कार्यालय</TableCell> */}
                            {columns.map( col => (
                                <TableCell key={col.field} align="center"
                                    onClick={() => handleSort( col.field )}
                                    style={{ cursor: 'pointer', fontWeight: orderBy === col.field ? 'bold' : 'normal' }}
                                >{col.headerName}
                                    {orderBy === col.field ? ( order === 'asc' ? ' 🔼' : ' 🔽' ) : ''}
                                </TableCell>
                            ) )}
                            <TableCell align="center">मुद्दा</TableCell>
                            <TableCell align="center">जाहेरवाला</TableCell>
                            <TableCell align="center">फैसला कार्यालय/मिति</TableCell>
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

                                    <TableCell align="center">{mudda?.mudda_name || ''}</TableCell>
                                    <TableCell align="center">{mudda?.vadi || '0'}</TableCell>
                                    <TableCell align="center">{( mudda?.mudda_phesala_antim_office || '' ) + ' ' + ( mudda?.mudda_phesala_antim_office_date || '' )}</TableCell>

                                    {muddaIndex === 0 && (
                                        <TableCell rowSpan={rowSpan} align="center">
                                            {( bandi.is_under_facility === 0 || bandi.is_under_facility === null ) && (
                                                <a
                                                    href={`/bandi/view_saved_record/${ bandi.id }`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "none", color: "inherit" }}
                                                >
                                                    <Button variant="outlined" size="small" color="primary">VIEW</Button>
                                                </a>
                                            )}


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
