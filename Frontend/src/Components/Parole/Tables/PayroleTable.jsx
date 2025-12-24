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

const PayroleTable = ({ status }) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuRowData, setMenuRowData] = useState(null);

    const isCheckboxNotVisible =
        ["clerk", "office_admin"].includes(authState.role_name);

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
    } = useFetchPayroles(filters, page, rowsPerPage);

    const refetchAll = async () => {
        await refetchNoPunarabedan();
        await refetchFines();
        await refetchPayrole();
        await refetchMuddas();
    };

    const handleMenuOpen = (e, row) => {
        setMenuAnchorEl(e.currentTarget);
        setMenuRowData(row);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setMenuRowData(null);
    };

    // ✅ Checkbox handler
    const handleCheckboxChange = useCallback(async (payroleId, newValue) => {
        try {
            // Optimistic update
            data.forEach(d => {
                if (d.payrole_id === payroleId) d.is_checked = newValue;
            });

            // Call API to update server
            await axios.put(
                `${BASE_URL}/payrole/update_is_payrole_checked/${payroleId}`,
                { is_checked: newValue },
                { withCredentials: true }
            );

            // Refetch the data for consistency
            refetchPayrole();
        } catch (err) {
            console.error("Failed to update checkbox:", err);
        }
    }, [BASE_URL, data, refetchPayrole]);

    return (
        <>
            <Helmet>
                <title>PMIS: प्यारोल सूची</title>
            </Helmet>

            <PayroleTableFilters onChange={setFilters} />

            <Button
                variant="outlined"
                sx={{ mb: 1 }}
                onClick={() =>
                    exportToExcel(
                        data,
                        fetchedMuddas,
                        fetchedFines,
                        fetchedNoPunarabedan,
                        filters,
                        BASE_URL
                    )
                }
            >
                एक्सेल निर्यात
            </Button>

            <Box>जम्मा: {totalKaidi}</Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {!isCheckboxNotVisible && <TableCell>✓</TableCell>}
                            <TableCell>सि.नं.</TableCell>
                            <TableCell>स्थिति</TableCell>
                            <TableCell>बन्दी ID</TableCell>
                            {/* <TableCell>प्यारोल नं.</TableCell> */}
                            <TableCell>कारागार</TableCell>
                            <TableCell>कैदीको नाम</TableCell>
                            <TableCell>उमेर</TableCell>
                            <TableCell>लिङ्ग</TableCell>
                            <TableCell>राष्ट्रियता</TableCell>
                            <TableCell>मुद्दाको नाम/नं.</TableCell>
                            <TableCell>जाहेरवाला</TableCell>
                            <TableCell>अन्तिम फैसला </TableCell>
                            <TableCell>थुना परेको मिति</TableCell>
                            <TableCell>कैद अवधि</TableCell>
                            <TableCell>कैद पुरा हुने मिति</TableCell>
                            <TableCell>भुक्तान कैद</TableCell>
                            <TableCell>प्यारोलमा राख्नुपर्ने अवधि</TableCell>
                            <TableCell>पुनरावेदन प्रमाण</TableCell>
                            <TableCell>जरिबाना</TableCell>
                            <TableCell>कैफियत</TableCell>
                            <TableCell>अदालतको निर्णय</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!loading &&
                            data.map((row, i) => (
                                <PayroleRow
                                    key={row.payrole_id}
                                    data={row}
                                    index={page * rowsPerPage + i + 1}
                                    kaidiMuddas={fetchedMuddas[row.bandi_id] || []}
                                    bandiFines={fetchedFines[row.bandi_id] || []}
                                    bandiNoPunarabedan={fetchedNoPunarabedan[row.bandi_id] || []}
                                    isCheckboxNotVisible={isCheckboxNotVisible}
                                    onCheck={(id, value) => handleCheckboxChange(id, value)}
                                    onMenuOpen={handleMenuOpen}
                                />
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalKaidi}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
            />

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
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
