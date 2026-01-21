import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Typography,
    Tooltip,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import FineEditDialog from '../../Dialogs/FineDialog';

import { useBaseURL } from '../../../../Context/BaseURLProvider';
import { set } from 'react-hook-form';

const BandiFineTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            setLoading( true );
            const url = `${ BASE_URL }/bandi/get_bandi_fine/${ bandi_id }`;
            const response = await axios.get( url, { withCredentials: true } );

            const { Status, Result, Error } = response.data;

            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    setFetchedBandies( Result );
                } else {
                    console.log( 'No records found.' );
                    setFetchedBandies( [] );
                }
            } else {
                console.log( Error || 'Failed to fetch.' );
            }
        } catch ( error ) {
            console.error( 'Error fetching records:', error );
        } finally {
            setLoading( false );
        }
    };
    useEffect( () => {
        if ( bandi_id ) {
            fetchBandies();
        }
    }, [bandi_id] );

    // ✅ DELETE handler
    const handleDelete = async ( id ) => {
        const result = await Swal.fire( {
            title: `Are You Sure?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        } );

        if ( result.isConfirmed ) {
            try {
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_fines/${ id }`, { withCredentials: true } );
                if ( res.data.Status ) {
                    Swal.fire( 'Deleted!', 'Record has been deleted.', 'success' );
                    setFetchedBandies( prev => prev.filter( item => item.id !== id ) );
                } else {
                    Swal.fire( 'Error!', 'Failed to delete record.', 'error' );
                }
            } catch ( err ) {
                console.error( err );
                Swal.fire( 'Error!', 'Something went wrong.', 'error' );
            }
        }
    };

    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    const handleEdit = ( data ) => {
        setEditingData( data );
        setModalOpen( true );
    };

    const handleAdd = ( bandi_id ) => {
        setEditingData( { bandi_id } );
        setModalOpen( true );
    };

    const handleSave = async ( data ) => {
        try {
            if ( data.id ) {
                // EDIT
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_fine/${ data.id }`,
                    data,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो!', 'डेटा अपडेट गरियो।', 'success' );
            } else {
                // CREATE
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_fine`,
                    data,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो!', 'नयाँ डेटा थपियो।', 'success' );
            }
            fetchBandies();
        } catch ( err ) {
            console.error( "Save error:", err );
            Swal.fire( 'त्रुटि!', err?.response?.data?.message || 'डेटा सेभ गर्न सकिएन।', 'error' );
        }
    };

    return (
        <Grid container spacing={2.5}>
            <Grid container size={{ xs: 12 }} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 1 }}>
                    💰 जरिवाना विवरण
                </Typography>
                <Tooltip title="नयाँ जरिवाना थप्नुहोस्">
                    <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => handleAdd( bandi_id )} sx={{ borderRadius: 1, textTransform: 'none' }}>थप्नुहोस्</Button>
                </Tooltip>
            </Grid>
            <Grid size={{ xs: 12 }}>
                {loading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={40} /></Box>
                ) : fetchedBandies.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', color: '#95a5a6', backgroundColor: '#f8f9fa', borderRadius: 1 }}>कुनै जरिवाना विवरण उपलब्ध छैन</Box>
                ) : (
                    <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', overflow: 'auto' }}>
                        <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>सि.नं.</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>जरिवाना</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>निर्धारण</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>स्थिति</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>कार्यालय</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>जिल्ला</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>च.नं.</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>मिति</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>रकम</TableCell>
                                    {!print && (
                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}
                                        >
                                            #
                                        </TableCell>
                                    )}

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetchedBandies.map( ( opt, index ) => (
                                    <TableRow key={opt.id || index} sx={{ '&:hover': { backgroundColor: '#f8f9fa', transition: '0.2s' } }}>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.fine_name_np || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.amount_fixed ? 'छ' : 'छैन'}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.amount_deposited ? 'तिरेको' : 'नतिरेको'}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.office_name_nep || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.district_name_np || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.deposit_ch_no || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.deposit_date || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.deposit_amount || ''}</TableCell>
                                        {!print && (
                                            <TableCell align="center" sx={{ padding: '10px 8px' }}>
                                                <Tooltip title="संपादन गर्नुहोस्">
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleEdit( opt )}
                                                        sx={{ borderRadius: 0.5, textTransform: 'none', mr: 1 }}
                                                    >
                                                        संपादन
                                                    </Button>
                                                </Tooltip>

                                                <Tooltip title="मेटाउनुहोस्">
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleDelete( opt.id )}
                                                        sx={{ borderRadius: 0.5, textTransform: 'none' }}
                                                    >
                                                        मेटाउनुहोस्
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        )}

                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <FineEditDialog open={modalOpen} onClose={() => setModalOpen( false )} editingData={editingData} onSave={handleSave} />
            </Grid>
        </Grid>
    );
};

export default BandiFineTable;
