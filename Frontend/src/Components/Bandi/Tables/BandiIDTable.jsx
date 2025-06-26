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

import { useBaseURL } from '../../../Context/BaseURLProvider';
import IdCardModal from '../Dialogs/IdCardModal';

const BandiIDTable = ({ bandi_id }) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${BASE_URL}/bandi/get_bandi_id_card/${bandi_id}`;
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

    // ✅ Fetch select options
    const [govtIdOptions, setGovtIdOptions] = useState([]);
    const fetchGovtIdOptions = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/public/get_id_cards`);
            const { Status, Result } = response.data;
            if (Status) {
                setGovtIdOptions(Result); // Expected Result = [{ id: 1, name_np: 'नागरिकता' }, ...]
            }
        } catch (err) {
            console.error("Error fetching govt ID options", err);
        }
    };

    useEffect(() => {
        fetchGovtIdOptions();
    }, []);

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

    // ✅ EDIT handler
    const handleEdit = (data, bandi_id) => {
        setEditingData(data, bandi_id);
        setModalOpen(true);
    };
    const handleAdd = (bandi_id) => {
        setEditingData({ bandi_id });
        setModalOpen(true);
    };

    const handleSave = async (formData, id) => {
        try {
            if (id) {
                await axios.put(
                    `${BASE_URL}/bandi/update_bandi_IdCard/${id}`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire('सफल भयो !', 'डेटा अपडेट गरियो', 'success');
            } else {
                await axios.post(
                    `${BASE_URL}/bandi/create_bandi_IdCard`,
                    { ...formData, bandi_id: bandi_id },
                    { withCredentials: true }
                );
                Swal.fire('सफल भयो !', 'नयाँ डेटा थपियो ।', 'success');
            }

            fetchBandies();
        } catch (error) {
            Swal.fire('त्रुटि!', 'सर्भर अनुरध असफल भयो ।', 'error');
        }
    };


    return (
        <Grid container spacing={2}>
            <Grid container item xs={12}>
                <Grid>
                    <h3>कैदीबन्दीको परिचय पत्रको विवरणः</h3>
                </Grid>
                <Grid marginTop={2}>
                    &nbsp; <Button variant='contained' size='small' onClick={() => handleAdd(bandi_id)}>Add</Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">परिचय पत्र</TableCell>
                                <TableCell align="center">परिचय पत्र नं.</TableCell>
                                <TableCell align="center">जारी जिल्ला</TableCell>
                                <TableCell align="center">जारी मिति</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map((opt, index) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.govt_id_name_np || ''}</TableCell>
                                    <TableCell align="center">{opt.card_no || ''}</TableCell>
                                    <TableCell align="center">{opt.card_issue_district || ''}</TableCell>
                                    <TableCell align="center">{opt.card_issue_date || ''}</TableCell>
                                    <TableCell align="center">
                                        <Grid item container alignContent='center' spacing={2}>
                                            <Grid item>
                                                <Button variant="contained" color='success' onClick={() => handleEdit(opt)}>✏️</Button>
                                            </Grid>
                                            <Grid item>
                                                <Button variant="contained" color='error' onClick={() => handleDelete(opt.id)}>🗑️</Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <IdCardModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiIDTable;
