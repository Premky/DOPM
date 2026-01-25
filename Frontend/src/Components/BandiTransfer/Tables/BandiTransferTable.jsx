// PayroleTable.jsx – Final version with full cell merging and advanced features

import React, { useEffect, useState, Fragment, lazy } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Button,
    Checkbox,
    Typography
} from "@mui/material";
import NepaliDate from 'nepali-datetime';
import MoreVertIcon from "@mui/icons-material/MoreVert";

import TableFilters from "./TableFilters";
// import PayroleExportButton from "./PayroleExportButton";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import TableActionMenu from "./TableActionMenu";
// import BandiFullReportPDF from "../../Bandi/Payrole/View/BandiFullReportPDF";
// import exportToExcel from "../../Exports/ExcelPayrole";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import useFetchBandiForTransfer from "../Fetch_APIs/useFetchBandiForTransfer";
import exportToExcel from "../Exports/ExportBandiTransferTable";

const BandiTransferTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const navigate = useNavigate();

    const [filters, setFilters] = useState( {} );
    const [openEl, setOpenEl] = useState( null );
    const [anchorEl, setAnchorEl] = useState( null );
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const [refreshKey, setRefreshKey] = useState( 0 );

    // const [totalKaidi, setTotalKaidi] = useState( 0 );

    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };


    const {
        data: filteredKaidi,
        totalKaidi,
        loading,
        error,
        fetchedMuddas,
        fetchedTransferHistory,
        refetchTransferHisotry,
        refetchData,
        refetchMuddas
    } = useFetchBandiForTransfer( filters, page, rowsPerPage );


    // console.log( "Filtered Kaidi:", filteredKaidi );
    const [menuAnchorEl, setMenuAnchorEl] = useState( null );
    const [menuRowData, setMenuRowData] = useState( null );

    const handleMenuOpen = ( event, row ) => {
        setMenuAnchorEl( event.currentTarget );
        setMenuRowData( row );
    };
    const handleMenuClose = () => {
        setMenuAnchorEl( null );
        setMenuRowData( null );
    };

    const refetchAll = async () => {
        // setLoading( true );
        await refetchTransferHisotry();
        await refetchData();
        await refetchMuddas();
        // setLoading( false );
    };



    const statusValue = ( status_id ) => {
        switch ( status_id ) {
            case 3: case 5: case 7: case 9: case 11:
                return 'अस्विकार'; // अस्विकार (Reject)

            case 4: case 6: case 8: case 10:
                return 'कारवाही हुँदैछ'; // In process

            case 12:
                return 'स्विकृत भएको तर पठाउन बाँकी';

            case 13:
                return 'पठाएको/स्विकार गर्न बाँकी';

            case 15:
                return 'स्थानान्तरण भइसकेको';

            default:
                return 'कुनै कारवाही नभएको';
        }
    };


    const bgColor = ( status_id ) => {
        switch ( status_id ) {
            case 3: case 5: case 7: case 9: case 11:
                return '#ff6f6f'; // अस्विकार (Reject)
            case 4: case 6: case 8: case 10:
                return '#f8df7aff'; // पठाउन बाँकी वा स्विकार गर्न बाँकी
            case 12:
                return '#ffcc00';
            case 13:
                return '#767876ff'; // पठाएको र स्विकार गरेको
            case 15:
                return '#66ff66'; // पठाएको र स्विकार गरेको
            default:
                return 'rgba(255, 255, 255, 1)'; // Default white background
        }
    };

    const tableHeadColor = 'red';
    const stickyTableHeadStyle = {
        background: '#1976d2',
        textAlign: 'center',
        position: "sticky",
        left: 0,
        zIndex: 3
    };
    const tableHeadStyle = {
        background: '#1976d2',
        textAlign: 'center',
    };
    // console.log( filteredKaidi );
    return (
        <>
            <Helmet>
                <title>बन्दी सरुवा तालिका</title>
                <meta name="description" content="बन्दी सरुवा तालिका" />
                <meta name="keywords" content="बन्दी सरुवा तालिका" />
                <meta name="author" content="कारागार व्यवस्थापन विभाग" />
            </Helmet>

            <Button onClick={() => exportToExcel( filteredKaidi, fetchedMuddas, fetchedTransferHistory, BASE_URL, authState )} variant="outlined" color="primary" sx={{ m: 1 }}>
                एक्सेल निर्यात (पत्र)
            </Button>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean( menuAnchorEl )}
                onClose={handleMenuClose}
            >
                {menuRowData && (
                    <TableActionMenu
                        data={menuRowData}
                        onClose={handleMenuClose}
                        onResultClick={() => {
                            // console.log( "Result click for:", menuRowData );
                            handleMenuClose();
                        }}
                        refetchAll={refetchAll}
                    />
                )}
            </Menu>
            <TableFilters onChange={( newFilters ) => setFilters( newFilters )} />
            <Typography variant="h6">
                {filteredKaidi.length} {t( "वटा विवरण भेटियो", "Records Found" )}
            </Typography>
            <TableContainer>
                <Table size="small" stickyHeader border={1}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1976d2' }}>
                            {/* <TableCell rowSpan={3} sx={{ position: "sticky", left: 0, zIndex: 3 }}>चेक</TableCell> */}
                            <TableCell rowSpan={3} sx={stickyTableHeadStyle}>सि.नं.</TableCell>
                            <TableCell rowSpan={3} sx={stickyTableHeadStyle}>बान्दी (id)</TableCell>
                            <TableCell rowSpan={3} sx={stickyTableHeadStyle}>कारागार कार्यालय</TableCell>
                            <TableCell rowSpan={3} sx={stickyTableHeadStyle}>बन्दीको नामथर र स्थायी ठेगाना</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle} >मुद्दा</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>जन्म मिति/उमेर</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>थुनामा परेको मिति</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>छुट्ने मिति जरिवाना वापत समेत</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>बन्दीको किसिम (थुनुवा भएमा सम्बन्धित न्यायिक निकायको स्वीकृती)</TableCell>
                            <TableCell colSpan={3} sx={tableHeadStyle}>जेलमा बसेको विवरण (शुरुदेखि हालसम्म)</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>सरुवा गर्न चाहेको कारागारको नाम र कारण</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>पुर्व कारागारबाट प्राप्त आचरण सम्बन्धि विवरण</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>अवस्था</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>कैफियत</TableCell>
                            <TableCell rowSpan={3} sx={tableHeadStyle}>#</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell rowSpan={2} sx={tableHeadStyle}>कारागारको नाम</TableCell>
                            <TableCell colSpan={2} sx={tableHeadStyle}>मिति</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={tableHeadStyle}>देखी</TableCell>
                            <TableCell sx={tableHeadStyle}>सम्म</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredKaidi.map( ( data, index ) => {
                            const kaidiMuddas = fetchedMuddas[data.bandi_id] || [];
                            const kaidiTransferHistory = fetchedTransferHistory[data.bandi_id] || [];
                            const rowSpan = Math.max( kaidiTransferHistory.length, 1 ); // ensure at least 1 row

                            return (
                                <Fragment key={`${ data.id }-${ index }`}>
                                    {/* First row */}
                                    <TableRow sx={{ background: bgColor( data.status_id ) }}>
                                        <TableCell rowSpan={rowSpan}>{index + 1} {data.transfer_id}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.office_bandi_id}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.current_office_name}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.bandi_name}</TableCell>
                                        <TableCell rowSpan={rowSpan}>
                                            {kaidiMuddas.map( ( m, i ) => (
                                                <span key={i}>
                                                    {m.mudda_name}
                                                    {i < kaidiMuddas.length - 1 ? ', ' : ''}
                                                </span>
                                            ) )}
                                        </TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.dob} <hr /> {data.current_age} वर्ष</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.thuna_date_bs}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.release_date_bs}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.bandi_type}</TableCell>
                                        <TableCell>{kaidiTransferHistory[0]?.to_office_name || '-'}</TableCell>
                                        <TableCell>{kaidiTransferHistory[0]?.transfer_from_date || '-'}</TableCell>
                                        <TableCell>{kaidiTransferHistory[0]?.transfer_to_date || '-'}</TableCell>
                                        <TableCell rowSpan={rowSpan}>
                                            {
                                                data.final_to_office_name ? ( <>{data.final_to_office_name}</> ) : ( <>{data.recommended_to_office_name || ''}</> )
                                            }<hr />
                                            <br />
                                            <strong>{data.transfer_reason_np} </strong><br />

                                            {data.transfer_reason && ( <>
                                                <hr />
                                                <br />
                                                <em>{data.transfer_reason}</em>
                                            </> )}
                                        </TableCell>
                                        <TableCell rowSpan={rowSpan}>
                                            {/* पुर्व कारागारबाट प्राप्त आचरण सम्बन्धि विवरण */}
                                            {data.bandi_character || ''}
                                        </TableCell>
                                        <TableCell rowSpan={rowSpan}>{statusValue( data.status_id )}</TableCell>
                                        <TableCell rowSpan={rowSpan}>{data.remarks}</TableCell>
                                        <TableCell rowSpan={rowSpan}>
                                            <IconButton onClick={( e ) => handleMenuOpen( e, data )}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {/* Remaining rows for transfer history (skip first) */}

                                    {kaidiTransferHistory.slice( 1 ).map( ( t, idx ) => (
                                        <TableRow key={`${ data.id }-transfer-${ idx }`} sx={{ background: bgColor( data.status_id ) }}>
                                            {/* No repeat of merged cells here */}
                                            <TableCell>{t.from_office_name}</TableCell>
                                            <TableCell>{t.transfer_from_date}</TableCell>
                                            <TableCell>{t.mudda_phesala_antim_office_date}</TableCell>
                                        </TableRow>
                                    ) )}
                                </Fragment>
                            );
                        } )}

                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[25, 50, 100, 500]}
                component="div"
                count={totalKaidi}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export default BandiTransferTable;
