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
    Box
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NepaliDate from 'nepali-datetime';

import axios from "axios";
import Swal from "sweetalert2";
import { calculateBSDate } from "../../../../Utils/dateCalculator";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
// import EmpActionMenu from "./EmpActionMenu";
// import EmpTableFilters from "./EmpTableFilters";

// import exportToExcel from "../Exports/ExcelPayrole";
// import exportCharacterToExcel from "../Exports/ExcelPayroleCharacter";
// import useFetchPayroles from "../useApi/useFetchPayroles";
// import useFetchAllBandiFines from "../../Bandi/Apis_to_fetch/useFetchAllBandiFines";
import { Helmet } from "react-helmet";
import useAllEmployes from "../APIs/useAllEmp";


const AllEmployeTable = ( { status } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const navigate = useNavigate();
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [filters, setFilters] = useState( {} );
    
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    // const [totalKaidi, setTotalKaidi] = useState( 0 );
    const { records: empRecords, loading:empLoading } = useAllEmployes();
    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };


    // const { data, totalKaidi, loading, error, fetchedMuddas, fetchedFines, fetchedNoPunarabedan,
    //     refetchNoPunarabedan, refetchFines, refetchPayrole, refetchMuddas } =
    //     useFetchPayroles( filters, page, rowsPerPage );

    const refetchAll = async () => {
        // setLoading( true );
        await refetchNoPunarabedan();
        await refetchFines();
        await refetchPayrole();
        await refetchMuddas();
        // setLoading( false );
    };    
    // console.log(data)
    // useEffect( () => {
    //     if ( data ) setFilteredKaidi( data );
    // }, [data] );

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

    const handleCheckboxChange = async ( id, newValue ) => {
        // console.log( newValue );
        try {
            await axios.put( `${ BASE_URL }/payrole/update_is_payrole_checked/${ id }`, {
                is_checked: newValue
            }, { withCredentials: true } );
            refetchPayrole();
            // Optionally update local state or re-fetch
        } catch ( err ) {
            console.error( 'Update failed:', err );
        }
    };

    const getRowBackgroundColor = ( status ) => {
        switch ( status ) {
            case 3:
                return "#f57272ff";
            case 7:
                return "#f57272ff";
            case "योग्य":
                return "#bbeba4";
            case "फेल":
                return "#f57272ff";
            // Add more specific colors if needed
            case "अयोग्य":
                return "#eaf883ff";
            case "छलफल":
                return "#b9d5eeff";
            case "कागजात अपुग":
                return "#77e2e2ff";
            case "पास":
                return "#3bed35ff";
            default:
                return "white";
        }
    };

    // const thStickyStyle = '#7161cdff';
    const thStickyStyle = {background: '#6765EC', color: 'white', fontSize: '1.1em', fontWeight: 'bold' };
    const thStyle = { background: '#6765EC', color: 'white', fontSize: '1.1em', fontWeight: 'bold' };
            console.log(empRecords)
    return (
        <>
            <Helmet>
                <title>PMIS: सबै कर्मचारी</title>
            </Helmet>
            <Button onClick={() => exportToExcel( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL )} variant="outlined" color="primary" sx={{ m: 1 }}>
                एक्सेल निर्यात
            </Button>            
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean( menuAnchorEl )}
                onClose={handleMenuClose}
            >
                {menuRowData && ( <></>
                    // <EmpActionMenu
                    //     oldStatus={status}
                    //     data={menuRowData}
                    //     onClose={handleMenuClose}
                    //     onResultClick={() => {
                    //         // console.log( "Result click for:", menuRowData );
                    //         handleMenuClose();
                    //     }}
                    //     refetchAll={refetchAll} />
                )}
            </Menu>
            {/* <Box>जम्मा: {totalKaidi}</Box> */}
            {/* <PayroleTableFilters onChange={( newFilters ) => setFilters( newFilters )} /> */}
            <TableContainer>
                <Table size="small" stickyHeader border={1}>
                    <TableHead stickyHeader>
                        <TableRow>
                            <TableCell sx={thStickyStyle}>सि. नं.</TableCell>
                            <TableCell sx={thStickyStyle}>कार्यालय</TableCell>
                            <TableCell sx={thStickyStyle}>कर्मचारी प्रकार</TableCell>
                            <TableCell sx={thStickyStyle}>क.स.नं.</TableCell>
                            <TableCell sx={thStyle}>तह</TableCell>
                            <TableCell sx={thStyle}>सेवा समूह</TableCell>
                            <TableCell sx={thStyle}>पद</TableCell>
                            <TableCell sx={thStyle}>नामथर</TableCell>
                            <TableCell sx={thStyle}>सुरु नियुक्ती मिति(वि.सं.)</TableCell>
                            <TableCell sx={thStyle}>हालको पदको नियुक्ती मिति(वि.सं.)</TableCell>
                            <TableCell sx={thStyle}>कार्यायमा सरुवा/पदस्थापन भएको निर्णय मिति</TableCell>
                            <TableCell sx={thStyle}>कार्यालयमा हाजिर मिति</TableCell>
                            <TableCell sx={thStyle}>दरबन्दी/ काज/ कामकाज</TableCell>
                            <TableCell sx={thStyle}>काजमा भए पदाधिकार रहेको निकाय</TableCell>
                            <TableCell sx={thStyle}>स्विकृत दरबन्दी</TableCell>
                            <TableCell sx={thStyle}>कार्यरत</TableCell>
                            <TableCell sx={thStyle}>रिक्त</TableCell>
                            <TableCell sx={thStyle}>कारागार प्रशासक?</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {empRecords
                            .map( ( data, index ) => {  
                                const statusColorCode = data?.pyarole_rakhan_upayukat || data?.payrole_status;
                                const rowStyle = { backgroundColor: getRowBackgroundColor( statusColorCode ) };                              
                                return (
                                    <Fragment key={data.id}>
                                        <TableRow sx={rowStyle}>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {index + 1} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.current_office_np} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.emp_type} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.sanket_no} </TableCell>                                                                                        
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.level_name_np} </TableCell>                                            
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.group_name_np} </TableCell>                                            
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.post_name_np} </TableCell>                                            
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.name} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.appointment_date_bs} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.current_post_appointment_date_bs} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.current_post_appointment_date_bs} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.hajir_miti_bs} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.jd} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.current_office_np} </TableCell>                                            
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.approved_darbandi} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.working_count} </TableCell>
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.rikt} </TableCell>                                             
                                            <TableCell sx={{ backgroundColor: rowStyle }}> {data?.last_jd_entry?.is_office_chief} </TableCell>                                            
                                        </TableRow>                                        
                                    </Fragment>
                                );
                            } )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[25, 50, 100, 500]}
                component="div"
                // count={totalKaidi}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export default AllEmployeTable;
