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

import { useBaseURL } from '../../../../Context/BaseURLProvider';
import IdCardModal from '../../Dialogs/IdCardModal';

const BandiIDTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_id_card/${ bandi_id }`;
            // console.log( url );
            const response = await axios.get( url );

            const { Status, Result, Error } = response.data;

            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    setFetchedBandies( Result );
                    // console.log(fetchedBandies)
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

    // ✅ Fetch select options
    const [govtIdOptions, setGovtIdOptions] = useState( [] );
    const fetchGovtIdOptions = async () => {
        try {
            const response = await axios.get( `${ BASE_URL }/public/get_id_cards` );
            const { Status, Result } = response.data;
            if ( Status ) {
                setGovtIdOptions( Result ); // Expected Result = [{ id: 1, name_np: 'नागरिकता' }, ...]
            }
        } catch ( err ) {
            console.error( "Error fetching govt ID options", err );
        }
    };

    useEffect( () => {
        fetchGovtIdOptions();
    }, [] );

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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_ids/${ id }`, { withCredentials: true } );
                if ( res.data.Status ) {
                    Swal.fire( 'Deleted!', 'Record has been deleted.', 'success' );
                    // fetchBandies(); // Re-fetch updated data
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

    // ✅ EDIT handler
    const handleEdit = ( data, bandi_id ) => {
        setEditingData( data );
        setModalOpen( true );
    };
    const handleAdd = ( bandi_id ) => {
        setEditingData( { bandi_id } );
        setModalOpen( true );
    };

    const handleSave = async ( formData, id ) => {
        try {
            if ( id ) {
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_IdCard/${ id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_IdCard`,
                    { ...formData, bandi_id: bandi_id },
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'नयाँ डेटा थपियो ।', 'success' );
            }

            fetchBandies();
        } catch ( error ) {
            Swal.fire( 'त्रुटि!', 'सर्भर अनुरध असफल भयो ।', 'error' );
        }
    };


    return (
        <Grid container spacing={2.5}>
            <Grid container size={{ xs: 12 }} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    🆔 कैदीबन्दीको परिचय पत्रको विवरण
                </Typography>
                {( fetchedBandies.length === 0 ) && (
                    <Tooltip title="नयाँ परिचय पत्र थप्नुहोस्">
                        <Button
                            variant='contained'
                            size='small'
                            startIcon={<AddIcon />}
                            onClick={() => handleAdd( bandi_id )}
                            sx={{ borderRadius: 1, textTransform: 'none' }}
                        >
                            थप्नुहोस्
                        </Button>
                    </Tooltip>
                )}
            </Grid>

            <Grid size={{ xs: 12 }}>
                {loading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : fetchedBandies.length === 0 ? (
                    <Box sx={{
                        py: 3,
                        textAlign: 'center',
                        color: '#95a5a6',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1
                    }}>
                        कुनै परिचय पत्रको विवरण उपलब्ध छैन
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        width: '100%',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid #e0e0e0',
                        overflow: 'auto'
                    }}>
                        <Table size='small' sx={{ tableLayout: 'fixed', width: '100%', minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>सि.नं.</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>परिचय पत्र</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>परिचय पत्र नं.</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>जारी जिल्ला</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>जारी मिति</TableCell>
                                    {!print &&(
                                        <TableCell align="center" sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}>#</TableCell> )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetchedBandies.map( ( opt, index ) => (
                                    <TableRow key={opt.id || index} sx={{
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa',
                                            transition: '0.2s'
                                        }
                                    }}>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.govt_id_name_np || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.card_no || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.card_issue_district_name || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.card_issue_date || ''}</TableCell>
                                        {!print &&(
                                            <TableCell align="center" sx={{ padding: '10px 8px' }}>
                                                <Tooltip title="संपादन गर्नुहोस्">
                                                    <Button
                                                        variant="contained"
                                                        color='success'
                                                        size='small'
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
                                                        color='error'
                                                        size='small'
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
            </Grid>
            <IdCardModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiIDTable;
