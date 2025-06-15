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

const FamilyTable = ({ bandi_id }) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${BASE_URL}/bandi/get_bandi_family/${bandi_id}`;
            const response = await axios.get(url);

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    setFetchedBandies(Result);
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
                await axios.delete(`${BASE_URL}/bandi/delete_bandi_family/${id}`);
                fetchBandies();
                Swal.fire('हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success');
            } catch (error) {
                Swal.fire('त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error');
            }
        }
    };

    // ✅ EDIT handler
    const handleEdit = async (data) => {
        const { value: formValues } = await Swal.fire({
            title: 'संपादन गर्नुहोस्',
            html:
                `<input id="swal-relation" class="swal2-input" placeholder="नाता" value="${data.relation_np || ''}">` +
                `<input id="swal-name" class="swal2-input" placeholder="नामथर" value="${data.relative_name || ''}">` +
                `<input id="swal-address" class="swal2-input" placeholder="ठेगाना" value="${data.relative_address || ''}">` +
                `<input id="swal-contact" class="swal2-input" placeholder="सम्पर्क नं." value="${data.contact_no || ''}">`,
            focusConfirm: false,
            confirmButtonText: 'अपडेट गर्नुहोस्',  // ✅ Custom button label
            showCancelButton: true,
            cancelButtonText: 'रद्द गर्नुहोस्',
            preConfirm: () => {
                return {
                    relation_np: document.getElementById('swal-relation').value,
                    relative_name: document.getElementById('swal-name').value,
                    relative_address: document.getElementById('swal-address').value,
                    contact_no: document.getElementById('swal-contact').value
                };
            }
        });

        if (formValues) {
            try {
                await axios.put(`${BASE_URL}/bandi/update_bandi_family/${data.id}`, formValues);
                fetchBandies();
                Swal.fire('सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success');
            } catch (error) {
                Swal.fire('त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error');
            }
        }
    };


    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <h3>कैदीबन्दीको पारिवारीको विवरणः</h3>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">नाता</TableCell>
                                <TableCell align="center">नामथर</TableCell>
                                <TableCell align="center">ठेगाना</TableCell>
                                <TableCell align="center">सम्पर्क नं.</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map((opt, index) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.relation_np || ''}</TableCell>
                                    <TableCell align="center">{opt.relative_name || ''}</TableCell>
                                    <TableCell align="center">{opt.relative_address || ''}</TableCell>
                                    <TableCell align="center">{opt.contact_no || ''}</TableCell>
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
        </Grid>
    );
};

export default FamilyTable;
