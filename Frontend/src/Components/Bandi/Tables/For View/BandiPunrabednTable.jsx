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
import PunrabednDialog from '../../Dialogs/PunrabednDialog';

import { useBaseURL } from '../../../../Context/BaseURLProvider';

const BandiPunrabednTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            setLoading( true );
            const url = `${ BASE_URL }/bandi/get_bandi_punrabedn/${ bandi_id }`;
            const response = await axios.get( url, { withCredentials: true } );

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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_punrabedan_details/${ id }`, { withCredentials: true } );
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

    const handleSave = async ( formData, id ) => {
        try {
            if ( id ) {
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_punrabedn/${ id }`,
                    formData,
                    { withCredentials: true } // ✅ Fix: wrap inside object
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                console.log( "📦 Payload to server:", formData );
                await axios.post( `${ BASE_URL }/bandi/create_bandi_punrabedn`, formData, { withCredentials: true } );
                Swal.fire( 'सफल भयो !', 'नयाँ डेटा थपियो ।', 'success' );
            }
            fetchBandies();
        } catch ( error ) {
            // Swal.fire('त्रुटि!', 'सर्भर अनुरध असफल भयो ।', 'error');
            Swal.fire( 'त्रुटि!', error.response?.data?.message || error.message || 'Unknown error', 'error' );
            // Swal.fire( 'त्रुटि!', `${ error }`, 'error' );
        }
    };
    if ( loading ) {
        return (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={40} />
            </Box>
        );
    }
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
                    ⚖️ पुनरावेदनमा नपरेको प्रमाण विवरण
                </Typography>
                <Tooltip title="नयाँ प्रमाण थप्नुहोस्">
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
            </Grid>

            <Grid size={{ xs: 12 }}>
                {fetchedBandies.length === 0 ? (
                    <Box sx={{
                        py: 3,
                        textAlign: 'center',
                        color: '#95a5a6',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1
                    }}>
                        कुनै पुनरावेदन प्रमाण उपलब्ध छैन
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        width: '100%',
                        borderRadius: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: '1px solid #e0e0e0',
                        overflow: 'auto'
                    }}>
                        <Table size='small' border={2} sx={{ tableLayout: 'fixed', width: '100%' }}>
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
                                    }}>पुनरावेदन नपरेको कार्यालय</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>प्रमाणको च.नं.</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>पत्र मिति</TableCell>
                                    {!print && (
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
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.office_name_with_letter_address || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.punarabedan_office_ch_no || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.punarabedan_office_date || ''}</TableCell>
                                        {!print && (
                                            <TableCell align="center" sx={{ padding: '10px 8px' }}>
                                                <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
                                                    <Grid item>
                                                        <Tooltip title="सम्पादन गर्नुहोस्">
                                                            <Button
                                                                variant="contained"
                                                                color='success'
                                                                size='small'
                                                                startIcon={<EditIcon />}
                                                                onClick={() => handleEdit( opt )}
                                                                sx={{ borderRadius: 0.5, textTransform: 'none' }}
                                                            >
                                                                सम्पादन
                                                            </Button>
                                                        </Tooltip>
                                                    </Grid>
                                                    <Grid item>
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
                                                    </Grid>
                                                </Grid>
                                            </TableCell> )}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <PunrabednDialog
                    open={modalOpen}
                    onClose={() => setModalOpen( false )}
                    editingData={editingData}
                    onSave={handleSave}
                />

            </Grid>
        </Grid>
    );
};

export default BandiPunrabednTable;
