import React, { useState, useCallback } from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper,
    TablePagination,
    Button,
    Menu,
    Box
} from "@mui/material";
import { Helmet } from "react-helmet";

import PayroleTableFilters from "./PayroleTableFilters";
import PayroleRow from "./PayroleTableRow";
import PayroleActionMenu from "./PayroleActionMenu";

import useFetchPayroles from "../useApi/useFetchPayroles";
import exportToExcel from "../Exports/ExcelPayrole";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";
import { grey } from "@mui/material/colors";
import { fontSize, fontStyle, fontWeight } from "@mui/system";

const PayroleTable = ( { status } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const [filters, setFilters] = useState( {} );
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );

    const [menuAnchorEl, setMenuAnchorEl] = useState( null );
    const [menuRowData, setMenuRowData] = useState( null );

    const isCheckboxNotVisible =
        ["clerk", "office_admin"].includes( authState.role_name );

    const {

        data,
        totalKaidi,
        fetchedMuddas,
        fetchedFines,
        fetchedNoPunarabedan,
        refetchNoPunarabedan,
        refetchFines,
        refetchPayrole,
        refetchMuddas,
        loading
    } = useFetchPayroles( filters, page, rowsPerPage );

    const refetchAll = async () => {
        await refetchNoPunarabedan();
        await refetchFines();
        await refetchPayrole();
        await refetchMuddas();
    };

    const handleMenuOpen = ( e, row ) => {
        setMenuAnchorEl( e.currentTarget );
        setMenuRowData( row );
    };

    const handleMenuClose = () => {
        setMenuAnchorEl( null );
        setMenuRowData( null );
    };

    const fetchAllForExport = useCallback( async () => {
        const res = await axios.get(
            `${ BASE_URL }/payrole/get_payroles`,
            {
                params: { ...filters, is_export: 1 },
                withCredentials: true
            }
        );
        return res.data.Result || [];
    }, [BASE_URL, filters] );


    // ✅ Checkbox handler
    const handleCheckboxChange = useCallback( async ( payroleId, newValue ) => {
        try {
            // Optimistic update
            // data.forEach( d => {
            //     if ( d.payrole_id === payroleId ) d.is_checked = newValue;
            // } );

            // setData( prev =>
            //     prev.map( d =>
            //         d.payrole_id === payroleId
            //             ? { ...d, is_checked: newValue }
            //             : d
            //     )
            // );

            // Call API to update server
            await axios.put(
                `${ BASE_URL }/payrole/update_is_payrole_checked/${ payroleId }`,
                { is_checked: newValue },
                { withCredentials: true }
            );

            // Refetch the data for consistency
            refetchPayrole();
        } catch ( err ) {
            console.error( "Failed to update checkbox:", err );
        }
    }, [BASE_URL, data, refetchPayrole] );

    const stickyStyle = ( left, z = 3 ) => ( {
        position: "sticky",
        left,
        zIndex: z,
        background: "#fff"
    } );

   const tableHeadStyle = ( {
        background: "#0e227c",
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: "1rem",
        textAlign: "center",
        border: "1px solid #ddd"
    } );

    return (
        <>
            <Helmet>
                <title>PMIS: प्यारोल सूची</title>
            </Helmet>

            <PayroleTableFilters onChange={setFilters} />

            <Button
                variant="outlined"
                sx={{ mb: 1 }}
                onClick={async () => {
                    const allData = await fetchAllForExport();
                    exportToExcel(
                        allData,
                        fetchedMuddas,
                        fetchedFines,
                        fetchedNoPunarabedan,
                        filters,
                        BASE_URL
                    );
                }
                }
            >
                एक्सेल निर्यात
            </Button>

            <Box>जम्मा: {totalKaidi}</Box>

            <TableContainer sx={{ maxWidth: "100%", overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }} component={Paper}>
                <Table size="small" stickyHeader sx={{ tableLayout: "fixed" }} border={1}>
                    <TableHead >
                        <TableRow sx={{ backgroundColor: grey }}>
                            {!isCheckboxNotVisible && (
                                <TableCell
                                    sx={{ ...tableHeadStyle }}
                                >
                                    ✓
                                </TableCell>
                            )}

                            <TableCell sx={{ ...tableHeadStyle }}>
                                सि.नं.
                            </TableCell>

                            <TableCell sx={{ ...tableHeadStyle }}>
                                स्थिति
                            </TableCell>


                            <TableCell sx={{ ...tableHeadStyle }}>
                                कारागार
                            </TableCell>

                            <TableCell sx={{ ...tableHeadStyle }}>
                                बन्दीको नाम
                            </TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>
                                बन्दी ID
                            </TableCell>

                            <TableCell sx={{ ...tableHeadStyle }}>उमेर/लिङ्ग</TableCell>
                            {/* <TableCell>लिङ्ग</TableCell> */}
                            <TableCell sx={{ ...tableHeadStyle }}>राष्ट्रियता</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>मुद्दाको नाम/नं.</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>जाहेरवाला</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>अन्तिम फैसला</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>थुना परेको मिति</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>कैद अवधि</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>कैद पुरा हुने मिति</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>भुक्तान कैद</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>प्यारोलमा राख्नुपर्ने अवधि</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>पुनरावेदन प्रमाण</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>जरिबाना</TableCell>
                            <TableCell sx={{ ...tableHeadStyle }}>कैफियत</TableCell>
                            {/* <TableCell>अदालतको निर्णय</TableCell> */}
                            <TableCell sx={{ ...tableHeadStyle }}   >#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!loading &&
                            data.map( ( row, i ) => (
                                <PayroleRow
                                    key={row.payrole_id}
                                    data={row}
                                    index={page * rowsPerPage + i + 1}
                                    kaidiMuddas={fetchedMuddas[row.bandi_id] || []}
                                    bandiFines={fetchedFines[row.bandi_id] || []}
                                    bandiNoPunarabedan={fetchedNoPunarabedan[row.bandi_id] || []}
                                    isCheckboxNotVisible={isCheckboxNotVisible}
                                    onCheck={( id, value ) => handleCheckboxChange( id, value )}
                                    onMenuOpen={handleMenuOpen}
                                />
                            ) )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalKaidi}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={( _, p ) => setPage( p )}
                onRowsPerPageChange={( e ) => {
                    setRowsPerPage( parseInt( e.target.value, 10 ) );
                    setPage( 0 );
                }}
                rowsPerPageOptions={[50, 100, 200, 500, 1000]}
            />

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
                        refetchAll={refetchAll}
                    />
                )}
            </Menu>
        </>
    );
};

export default PayroleTable;
