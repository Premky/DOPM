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
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import PayroleResultModal from "../Dialogs/PayroleResultModal";
import PayroleTableFilters from "./PayroleTableFilters";
// import PayroleExportButton from "./PayroleExportButton";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { useAuth } from "../../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import BandiFullReportPDF from "../View/BandiFullReportPDF";
import PayroleActionMenu from "./PayroleActionMenu";
// import exportToExcel from "../../Exports/ExcelPayrole";
import exportToExcel from "../Exports/ExcelPayrole";
import exportCharacterToExcel from "../Exports/ExcelPayroleCharacter";
import useFetchPayroles from "../useApi/useFetchPayroles";
import NepaliDate from 'nepali-datetime';
import useFetchAllBandiFines from "../../Apis_to_fetch/useFetchAllBandiFines";

const PayroleTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const navigate = useNavigate();

    // const [data, setData] = useState( [] );
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    // const [fetchedMuddas, setFetchedMuddas] = useState( {} );
    // const [authState, setAuthState] = useState( { office_id: 1, role_name: "admin" } );
    const [filters, setFilters] = useState( {} );
    const [openEl, setOpenEl] = useState( null );
    const [anchorEl, setAnchorEl] = useState( null );
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


    return (
        <>
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
                        data={menuRowData}
                        onClose={handleMenuClose}
                        onResultClick={() => {
                            // console.log( "Result click for:", menuRowData );
                            handleMenuClose();
                        }} />
                )}
            </Menu>
            <Box>जम्मा: {totalKaidi}</Box>
            <PayroleTableFilters onChange={( newFilters ) => setFilters( newFilters )} />
            <TableContainer>
                <Table size="small" stickyHeader border={1}>
                    <TableHead >
                        <TableRow sx={{ background: "blue" }}>
                            <TableCell sx={{ position: "sticky", left: 0, zIndex: 3 }} >चेक</TableCell>
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
                            <TableCell>भुक्तान कैद</TableCell>
                            <TableCell>प्यारोलमा राख्नुपर्ने कैद</TableCell>
                            <TableCell>पुनरावेदन प्रमाण</TableCell>
                            <TableCell>जरिवाना प्रमाण</TableCell>
                            <TableCell>कैफियत (कार्यालय)</TableCell>
                            <TableCell>कैफियत (विभाग)</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredKaidi.map( ( data, index ) => {
                            const kaidiMuddas = fetchedMuddas[data.bandi_id] || [];
                            const bandiFines = fetchedFines[data.bandi_id] || [];
                            const bandiNoPunarabedan = fetchedNoPunarabedan[data.bandi_id] || [];
                            // console.log( bandiFines );
                            const rowStyle = {
                                backgroundColor:
                                    getRowBackgroundColor( data.pyarole_rakhan_upayukat )
                            };
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
                                            {index + 1}  {data.payrole_status}
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
                                        <TableCell>{kaidiMuddas[0]?.punarabedan_office}<br />{kaidiMuddas[0]?.mudda_phesala_antim_office_date}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {/* कैद अवधि */}
                                            {/* {totalKaidDuration?.totalDays} दिन <br />
                                            {kaidDuration?.totalDays} din <br /> */}
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
                                        {/* <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {bhuktanDuration.formattedDuration}
                                            <br />  {calculateBSDate( data.release_date_bs, current_date, calculateBSDate( data.thuna_date_bs, data.release_date_bs ).totalDays ).percentage}
                                        </TableCell> */}
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
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
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
                                            {bandiFines.map( ( fine, i ) => (
                                                <>
                                                    <Fragment key={`fine-${ data.id }-${ i }`}>
                                                        {( fine.deposit_office === undefined || fine.deposit_office === '' || fine.deposit_office === null ) && ( <>
                                                            {i + 1}. {fine.deposit_office}को च.नं. {fine.deposit_ch_no}, मिति {fine.deposit_date} गतेको पत्रबाट रु.{fine.deposit_amount}  {fine.fine_name_np} {fine.amount_deposited == true ?('बुझाएको'):('नबुझाएको')} ।
                                                            <hr />
                                                        </> )}
                                                    </Fragment>
                                                </>

                                            ) )}

                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.remarks}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.dopm_remarks}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            <IconButton onClick={( e ) => handleMenuOpen( e, data )}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>

                                    {kaidiMuddas.slice( 1 ).map( ( mudda, i ) => (
                                        <TableRow key={`mudda-${ data.id }-${ i }`} sx={rowStyle}>
                                            <TableCell>{mudda.mudda_name}</TableCell>
                                            <TableCell>{mudda.vadi}</TableCell>
                                            <TableCell>{mudda.punarabedan_office}<br />{mudda.mudda_phesala_antim_office_date}</TableCell>
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
