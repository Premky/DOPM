import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import FineEditDialog from '../Dialogs/FineDialog';

import { useBaseURL } from '../../../Context/BaseURLProvider';

const BandiFineTable = ({ bandi_id }) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState([]);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${BASE_URL}/bandi/get_bandi_fine/${bandi_id}`;
            const response = await axios.get(url);

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    setFetchedBandies(Result);
                    // console.log(fetchedBandies)
                } else {
                    console.log('No records found.');
                    setFetchedBandies([]);
                }
            } else {
                console.log(Error || 'Failed to fetch.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (bandi_id) {
            fetchBandies();
        }
    }, [bandi_id]);

    // ✅ DELETE handler
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'पक्का हुनुहुन्छ?',
            text: 'यो विवरण मेटाइनेछ!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'मेटाउनुहोस्',
            cancelButtonText: 'रद्द गर्नुहोस्',
        });

        if (confirm.isConfirmed) {
            try {
                await axios.delete(`${BASE_URL}/bandi/delete_bandi_id_details/${id}`);
                fetchBandies();
                Swal.fire('हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success');
            } catch (error) {
                Swal.fire('त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error');
            }
        }
    };

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const handleEdit = (data) => {
        setSelectedData(data);
        setEditDialogOpen(true);
    };


    const handleSave = async (updatedData) => {
        try {
            await axios.put(
                `${BASE_URL}/bandi/update_bandi_fine/${updatedData.id}`,
                updatedData,
                { withCredentials: true } // ✅ Fix: wrap inside object
            );
            fetchBandies();
            Swal.fire('सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success');
        } catch (err) {
            Swal.fire('त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error');
        }
    };



    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h3>कैदीबन्दीको जरिवाना/क्षतिपुर्ती/बिगो विवरणः</h3>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">जरिवाना/क्षतिपुर्ती/बिगो विवरण</TableCell>
                                <TableCell align="center">तोकिएको छ/छैन?</TableCell>
                                <TableCell align="center">तिरे/नतिरेको?</TableCell>
                                <TableCell align="center">कार्यालय</TableCell>
                                <TableCell align="center">जिल्ला</TableCell>
                                <TableCell align="center">च.नं.</TableCell>
                                <TableCell align="center">मिति</TableCell>
                                <TableCell align="center">रकम</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map((opt, index) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.fine_type || ''}</TableCell>
                                    <TableCell align="center">{opt.amount_fixed ? 'छ' : 'छैन'}</TableCell>
                                    <TableCell align="center">{opt.amount_deposited ? 'तिरेको' : 'नतिरेको' || ''}</TableCell>
                                    <TableCell align="center">{opt.office_name_nep}</TableCell>
                                    <TableCell align="center">{opt.district_name_np}</TableCell>
                                    <TableCell align="center">{opt.deposit_ch_no}</TableCell>
                                    <TableCell align="center">{opt.deposit_date}</TableCell>
                                    <TableCell align="center">{opt.deposit_amount}</TableCell>

                                    <TableCell align="center">
                                        <Grid container spacing={2}>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color='success'
                                                    onClick={() => handleEdit(opt)}
                                                >
                                                    ✏️
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color='error'
                                                    onClick={() => handleDelete(opt.id)}
                                                >
                                                    🗑️
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* 🔽 Insert this right after your TableContainer or at the end of return */}
                <FineEditDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    data={selectedData}
                    onSave={handleSave}
                />

            </Grid>
        </Grid>
    );
};

export default BandiFineTable;
