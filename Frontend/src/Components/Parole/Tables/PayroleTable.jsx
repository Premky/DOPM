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

import axios from "axios";
import Swal from "sweetalert2";
import { calculateBSDate } from "../../../../Utils/dateCalculator";
import PayroleTableFilters from "./PayroleTableFilters";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import PayroleActionMenu from "./PayroleActionMenu";
import exportToExcel from "../Exports/ExcelPayrole";
import exportCharacterToExcel from "../Exports/ExcelPayroleCharacter";
import useFetchPayroles from "../useApi/useFetchPayroles";
import NepaliDate from 'nepali-datetime';
import useFetchAllBandiFines from "../../Bandi/Apis_to_fetch/useFetchAllBandiFines";
import { Helmet } from "react-helmet";


const PayroleTable = ( { status } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const navigate = useNavigate();
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [filters, setFilters] = useState( {} );
    const [formattedDateNp, setFormattedDateNp] = useState( "2081-03-01" );
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    // const [totalKaidi, setTotalKaidi] = useState( 0 );

    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };
    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };


    const { data, totalKaidi, loading, error, fetchedMuddas, fetchedFines, fetchedNoPunarabedan,
        refetchNoPunarabedan, refetchFines, refetchPayrole, refetchMuddas } =
        useFetchPayroles( filters, page, rowsPerPage );

    const refetchAll = async () => {
        // setLoading( true );
        await refetchNoPunarabedan();
        await refetchFines();
        await refetchPayrole();
        await refetchMuddas();
        // setLoading( false );
    };

    const { bandiFinesMap, loading: bandiFineLoading, refetchBandiFine: fetchBandiFineRecords } = useFetchAllBandiFines();
    // console.log(data)
    useEffect( () => {
        if ( data ) setFilteredKaidi( data );
    }, [data] );

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
    const thStickyStyle = { position: "sticky", left: 0, zIndex: 3, background: '#6765EC', color: 'white', fontSize: '1.3em', fontWeight: 'bold' };
    const thStyle = { background: '#6765EC', color: 'white', fontSize: '1.3em', fontWeight: 'bold' };

    return (
        <>
            <Helmet>
                <title>PMIS: प्यारोल सूची</title>
            </Helmet>
            <Button onClick={() => exportToExcel( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL )} variant="outlined" color="primary" sx={{ m: 1 }}>
                एक्सेल निर्यात
            </Button>
            <Button onClick={() => exportCharacterToExcel( filteredKaidi, fetchedMuddas, fetchedFines, fetchedNoPunarabedan, filters, BASE_URL )} variant="outlined" color="primary" sx={{ m: 1 }}>
                चालचलन फर्मेट
            </Button>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean( menuAnchorEl )}
                onClose={handleMenuClose}
            >
                {menuRowData && (
                    <PayroleActionMenu
                        oldStatus={status}
                        data={menuRowData}
                        onClose={handleMenuClose}
                        onResultClick={() => {
                            // console.log( "Result click for:", menuRowData );
                            handleMenuClose();
                        }}
                        refetchAll={refetchAll} />
                )}
            </Menu>
            <Box>जम्मा: {totalKaidi}</Box>
            <PayroleTableFilters onChange={( newFilters ) => setFilters( newFilters )} />
            <TableContainer>
                <Table size="small" stickyHeader border={1}>
                    <TableHead stickyHeader>
                        <TableRow>
                            <TableCell sx={thStickyStyle} >चेक</TableCell>
                            <TableCell sx={thStickyStyle}>सि.नं.</TableCell>
                            <TableCell sx={thStickyStyle}>बान्दी (id)</TableCell>
                            <TableCell sx={thStickyStyle}>कारागार कार्यालय</TableCell>
                            <TableCell sx={thStickyStyle}>कैदी नाम</TableCell>
                            <TableCell sx={thStyle}>उमेर</TableCell>
                            <TableCell sx={thStyle}>लिङ्ग</TableCell>
                            <TableCell sx={thStyle}>राष्ट्रियता</TableCell>
                            <TableCell sx={thStyle}>मुद्दा</TableCell>
                            <TableCell sx={thStyle}>जाहेरवाला</TableCell>
                            <TableCell sx={thStyle}>अन्तिम फैसला</TableCell>
                            <TableCell sx={thStyle}>थुना मिति</TableCell>
                            <TableCell sx={thStyle}>कैद अवधि</TableCell>
                            <TableCell sx={thStyle}>छुट मिति</TableCell>
                            <TableCell sx={thStyle}>भुक्तान कैद</TableCell>
                            <TableCell sx={thStyle}>प्यारोलमा राख्नुपर्ने कैद</TableCell>
                            <TableCell sx={thStyle}>पुनरावेदन प्रमाण</TableCell>
                            <TableCell sx={thStyle}>जरिवाना प्रमाण</TableCell>
                            <TableCell sx={thStyle}>कैफियत (कार्यालय)</TableCell>
                            <TableCell sx={thStyle}>कैफियत (विभाग)</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredKaidi
                            .map( ( data, index ) => {
                                const kaidiMuddas = fetchedMuddas[data.bandi_id] || [];
                                const bandiFines = fetchedFines[data.bandi_id] || [];
                                const bandiNoPunarabedan = fetchedNoPunarabedan[data.bandi_id] || [];
                                const statusColorCode = data?.pyarole_rakhan_upayukat || data?.payrole_status;
                                const rowStyle = { backgroundColor: getRowBackgroundColor( statusColorCode ) };
                                const kaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs );
                                const bhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, kaidDuration );
                                const bakiDuration = calculateBSDate( current_date, data.release_date_bs, kaidDuration );

                                const hirasatDays = data?.hirasat_days || 0;
                                const hirasatMonths = data?.hirasat_months || 0;
                                const hirasatYears = data?.hirasat_years || 0;
                                let totalKaidDuration;
                                let totalBhuktanDuration;
                                let totalBakiDuration;
                                if ( hirasatDays > 0 || hirasatMonths > 0 || hirasatYears > 0 ) {
                                    totalKaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs, 0, hirasatYears, hirasatMonths, hirasatDays );
                                    totalBhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, totalKaidDuration, hirasatYears, hirasatMonths, hirasatDays );
                                    totalBakiDuration = calculateBSDate( current_date, data.release_date_bs, totalKaidDuration );
                                }
                                // console.log(kaidiMuddas)
                                return (
                                    <Fragment key={data.id}>
                                        <TableRow sx={rowStyle}>
                                            <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                                <Checkbox
                                                    checked={Boolean( data.is_checked )}
                                                    onChange={() => handleCheckboxChange( data.payrole_id, !data.is_checked )}
                                                />
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                                {index + 1}
                                                {/* {data.payrole_status} */}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                                {data.office_bandi_id}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1} sx={{ position: "sticky", left: 0, zIndex: 3, backgroundColor: rowStyle }}>
                                                {data.letter_address}
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
                                            <TableCell>{kaidiMuddas[0]?.mudda_office}<br />{kaidiMuddas[0]?.mudda_phesala_antim_office_date}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {/* कैद अवधि */}
                                                {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? (
                                                    <>
                                                        जम्मा कैदः <br />
                                                        {totalKaidDuration?.formattedDuration}
                                                        <hr />
                                                        हिरासत/थुना अवधीः <br />
                                                        {data?.hirasat_years || 0} | {data?.hirasat_months || 0} | {data?.hirasat_days || 0}
                                                        <hr />
                                                        बेरुजु कैदः <br />
                                                    </>
                                                ) : null}
                                                {kaidDuration?.formattedDuration}
                                            </TableCell>

                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.release_date_bs}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {/*भुक्तान अवधी*/}
                                                {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? ( <>
                                                    {totalBhuktanDuration?.formattedDuration}
                                                    <hr />
                                                    {totalBhuktanDuration?.percentage != null ? `${ totalBhuktanDuration.percentage }%` : '–'}
                                                </> ) : (
                                                    <>
                                                        {bhuktanDuration?.formattedDuration} <hr />
                                                        {bhuktanDuration?.percentage}%
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {( data.hirasat_days || data.hirasat_months || data.hirasat_years ) ? ( <>
                                                    {totalBakiDuration?.formattedDuration}
                                                    <hr />
                                                    {totalBakiDuration?.percentage != null ? `${ totalBakiDuration.percentage }%` : '–'}
                                                </> ) : (
                                                    <>
                                                        {bakiDuration?.formattedDuration} <hr />
                                                        {bakiDuration?.percentage}%
                                                    </>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                rowSpan={kaidiMuddas.length || 1}
                                                style={bandiNoPunarabedan.length === 0 ? { background: 'red' } : {}}
                                            >
                                                {bandiNoPunarabedan.map( ( noPunrabedan, i ) => (
                                                    <>
                                                        <Fragment key={`noPunrabedan-${ data.id }-${ i }`}>
                                                            {i + 1}. {noPunrabedan.punarabedan_office}को च.नं. {noPunrabedan.punarabedan_office_ch_no}, मिति {noPunrabedan.punarabedan_office_date} गतेको पत्र ।
                                                            <hr />
                                                        </Fragment>
                                                    </>

                                                ) )}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {bandiFines
                                                    .filter( ( fine ) => fine.deposit_ch_no && fine.deposit_ch_no !== '' )
                                                    .map( ( fine, i ) => (
                                                        <div key={`fine-${ data.id }-${ i }`}>
                                                            {i + 1}. {fine.deposit_office}को च.नं. {fine.deposit_ch_no}, मिति {fine.deposit_date} गतेको पत्रबाट रु.
                                                            {fine.deposit_amount} {fine.fine_name_np}{" "}
                                                            {fine.amount_deposited === 1 ? 'बुझाएको' :
                                                                <span style={{ color: 'red' }}>नबुझाएको</span>
                                                            } ।
                                                            <hr />
                                                        </div>
                                                    ) )}
                                            </TableCell>

                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.remark}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.dopm_remarks}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                <IconButton
                                                    onClick={( e ) =>
                                                        handleMenuOpen( e, {
                                                            ...data,
                                                            bandiFines,
                                                            kaidiMuddas,
                                                            bandiNoPunarabedan
                                                        } )
                                                    }
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>

                                            </TableCell>
                                        </TableRow>

                                        {kaidiMuddas.slice( 1 ).map( ( mudda, i ) => (
                                            <TableRow key={`mudda-${ data.id }-${ i }`} sx={rowStyle}>
                                                <TableCell>{mudda.mudda_name}</TableCell>
                                                <TableCell>{mudda.vadi}</TableCell>
                                                <TableCell>{mudda.mudda_office}<br />{mudda.mudda_phesala_antim_office_date}</TableCell>
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
