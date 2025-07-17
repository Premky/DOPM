// PayroleTable.jsx – Final version with full cell merging and advanced features

import React, { useEffect, useState, Fragment } from "react";
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
    Checkbox
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import Swal from "sweetalert2";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import PayroleResultModal from "../Dialogs/PayroleResultModal";
import PayroleTableFilters from "./PayroleTableFilters";
// import PayroleExportButton from "./PayroleExportButton";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { useAuth } from "../../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const PayroleTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState( [] );
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [fetchedMuddas, setFetchedMuddas] = useState( {} );
    // const [authState, setAuthState] = useState( { office_id: 1, role_name: "admin" } );
    const [filters, setFilters] = useState( {} );
    const [openEl, setOpenEl] = useState( null );
    const [anchorEl, setAnchorEl] = useState( null );
    const [formattedDateNp, setFormattedDateNp] = useState( "2081-03-01" );
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const [totalKaidi, setTotalKaidi] = useState( 0 );

    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };

    const fetchData = async () => {
        try {
            const {
                searchOffice,
                nationality,
                searchpayroleStatus,
                searchpyarole_rakhan_upayukat,
                searchpayrole_no_id,
                searchmudda_id,
                searchbandi_name,
                searchchecked,
                searchis_checked
            } = filters || {};

            // Assuming page and rowsPerPage are defined in state somewhere
            const res = await axios.get( `${ BASE_URL }/payrole/get_payroles`, {
                params: {
                    page,
                    limit: rowsPerPage,
                    searchOffice,
                    nationality,
                    searchpayroleStatus,
                    searchpyarole_rakhan_upayukat,
                    searchpayrole_no_id,
                    searchmudda_id,
                    searchbandi_name,
                    searchchecked,
                    searchis_checked,
                },
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
                withCredentials: true,
            } );
            console.log( res.data );
            setData( res.data.Result || [] );
            setFilteredKaidi( res.data.Result || [] );
            setTotalKaidi( response.data.TotalCount );  //Total Count 

            // If needed, fetch muddās here too:
            // const muddaRes = await axios.get(`${BASE_URL}/bandi/get_bandi_mudda`, { withCredentials: true });
            // setFetchedMuddas(muddaRes.data || {});

        } catch ( err ) {
            console.error( "Fetch error", err );
        }
    };


    useEffect( () => {
        fetchData();
    }, [filters] );

    const fetchMuddas = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_mudda`;
            const response = await axios.get( url, { withCredentials: true } );
            const { Status, Result, Error } = response.data;

            if ( Status ) {
                // Group muddas by bandi_id
                const grouped = {};
                Result.forEach( ( mudda ) => {
                    const bandiId = mudda.bandi_id;
                    if ( !grouped[bandiId] ) grouped[bandiId] = [];
                    grouped[bandiId].push( mudda );
                } );
                setFetchedMuddas( grouped ); // grouped is now an object like { 1: [mudda1, mudda2], 2: [mudda1] }
                // console.log(fetchedMuddas)
            } else {
                console.warn( Error || 'Failed to fetch mudda.' );
                setFetchedMuddas( {} );
            }
        } catch ( error ) {
            console.error( 'Error fetching muddas:', error );
        }
    };
    useEffect( () => {
        fetchMuddas();
    }, [] );


    const handleElClick = ( event ) => setAnchorEl( event.currentTarget );
    const handleElClose = () => setAnchorEl( null );
    const handleEdit = ( row ) => navigate( `/bandi/view_saved_record/${ row.id }` );
    const handleUpdatePayrole = ( row ) => navigate(`/bandi/view_saved_record/${ row.id }` );
    const handleChangePayroleStatus = ( row, newStatus ) => console.log( "Change status", row, newStatus );
    const handleReturn = ( row, returnToStatus ) => console.log( "Return", row, returnToStatus );
    const handleForwardDialog = ( row, forwardToStatus ) => console.log( "Forward", row, forwardToStatus );
    const handleResult = ( row, status ) => console.log( "Result", row, status );
    const handleCheckboxChange = ( id, value ) => console.log( "Checkbox", id, value );

    // useEffect( () => {
    //     let filtered = [...data];
    //     console.log( filtered );
    //     if ( filters?.searchOffice ) {
    //         filtered = filtered.filter( item => item.current_office_id == filters.searchOffice );
    //     }

    //     if ( filters?.searchpayroleStatus ) {
    //         filtered = filtered.filter( item => item.payrole_status == filters.searchpayroleStatus );
    //     }

    //     if ( filters?.nationality ) {
    //         filtered = filtered.filter( item => item.nationality === filters.nationality );
    //     }

    //     if ( filters?.searchbandi_name ) {
    //         const name = filters.searchbandi_name.toLowerCase();
    //         filtered = filtered.filter( item => item.bandi_name.toLowerCase().includes( name ) );
    //     }

    //     if ( filters?.searchmudda_id ) {
    //         filtered = filtered.filter( item =>
    //             ( fetchedMuddas[item.bandi_id] || [] ).some( mudda => mudda.mudda_id == filters.searchmudda_id )
    //         );
    //     }

    //     setFilteredKaidi( filtered );
    // }, [filters, data, fetchedMuddas] );

    return (
        <>
            <PayroleTableFilters onChange={( newFilters ) => setFilters( newFilters )} />
            <TableContainer>
                <Table size="small" stickyHeader border={1}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ position: "sticky", left: 0, zIndex: 3 }}>चेक</TableCell>
                            <TableCell sx={{ position: "sticky", left: 0, zIndex: 3 }}>सि.नं.</TableCell>
                            <TableCell sx={{ position: "sticky", left: 50, zIndex: 3 }}>बान्दी (id)</TableCell>
                            <TableCell sx={{ position: "sticky", left: 50, zIndex: 3 }}>कारागार कार्यालय</TableCell>
                            <TableCell sx={{ position: "sticky", left: 50, zIndex: 3 }}>कैदी नाम</TableCell>
                            <TableCell>उमेर</TableCell>
                            <TableCell>लिङ्ग</TableCell>
                            <TableCell>राष्ट्रियता</TableCell>
                            <TableCell>मुद्दा</TableCell>
                            <TableCell>जाहेरवाला</TableCell>
                            <TableCell>अन्तिम फैसला</TableCell>
                            <TableCell>थुना मिति</TableCell>
                            <TableCell>कैद अवधि</TableCell>
                            <TableCell>छुट मिति</TableCell>
                            <TableCell>भुक्तान</TableCell>
                            <TableCell>बाँकी</TableCell>
                            <TableCell>पुनरावेदन प्रमाण</TableCell>
                            <TableCell>जरिवाना प्रमाण</TableCell>
                            <TableCell>कैफियत (विभाग)</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredKaidi.map( ( data, index ) => {
                            const kaidiMuddas = fetchedMuddas[data.bandi_id] || [];
                            const rowStyle = {
                                backgroundColor:
                                    authState.office_id <= 2 || data.payrole_status >= 3
                                        ? data.pyarole_rakhan_upayukat === "छ"
                                            ? "#bbeba4"
                                            : "#f9d1d5"
                                        : "white"
                            };

                            return (
                                <Fragment key={data.id}>
                                    <TableRow sx={rowStyle}>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                            <Checkbox checked={data.is_checked} onChange={() => handleCheckboxChange( data.payrole_id, !data.is_checked )} />
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                            {data.letter_address}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                            {data.office_name}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 50, zIndex: 3, backgroundColor: rowStyle }}>
                                            {data.bandi_name}
                                            <br />
                                            {data.nationality === "स्वदेशी"
                                                ? `${ data.city_name_np }-${ data.wardno }, ${ data.district_name_np }`
                                                : `${ data.bidesh_nagarik_address_details }, ${ data.country_name_np }`}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.current_age}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.gender === "Male" ? "पुरुष" : data.gender === "Female" ? "महिला" : "अन्य"}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.country_name_np} ({data.nationality})</TableCell>
                                        <TableCell>{kaidiMuddas[0]?.mudda_name}</TableCell>
                                        <TableCell>{kaidiMuddas[0]?.vadi}</TableCell>
                                        <TableCell>{kaidiMuddas[0]?.mudda_phesala_antim_office_date}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{calculateBSDate( data.thuna_date_bs, data.release_date_bs ).formattedDuration}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.release_date_bs}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{calculateBSDate( "2081-03-01", data.thuna_date_bs ).formattedDuration}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{calculateBSDate( data.release_date_bs, "2081-03-01" ).formattedDuration}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.punarabedan_office_ch_no}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.fine_summary}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.dopm_remarks}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            <Button variant="contained" color="primary" onClick={() => handleUpdatePayrole( data )}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {kaidiMuddas.slice( 1 ).map( ( mudda, i ) => (
                                        <TableRow key={`mudda-${ data.id }-${ i }`} sx={rowStyle}>
                                            <TableCell>{mudda.mudda_name}</TableCell>
                                            <TableCell>{mudda.vadi}</TableCell>
                                            <TableCell>{mudda.mudda_phesala_antim_office_date}</TableCell>
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

export default PayroleTable;
