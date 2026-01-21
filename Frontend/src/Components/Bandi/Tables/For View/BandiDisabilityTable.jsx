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

import useFetchBandiDisabilities from '../../Apis_to_fetch/fetchBandiDisabilities';

import DisabilityModal from '../../Dialogs/DisabilityModal';

const BandiDisabilityTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data

    const { records: bandiDisability, loading: bandiDisabilityLoading, refetch } = useFetchBandiDisabilities( bandi_id );
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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_disability/${ id }`, { withCredentials: true } );
                if ( res.data.Status ) {
                    Swal.fire( 'Deleted!', 'Record has been deleted.', 'success' );
                    refetch( id ); // Re-fetch updated data
                } else {
                    Swal.fire( 'Error!', 'Failed to delete record.', 'error' );
                }
            } catch ( err ) {
                console.error( err );
                Swal.fire( 'Error!', 'Something went wrong.', 'error' );
            }
        }
    };

    const handleEdit = ( data ) => {
        setEditingData( data );
        // console.log(editingData)
        setModalOpen( true );
    };
    const handleAdd = ( bandi_id ) => {
        setEditingData( { bandi_id } );
        setModalOpen( true );
    };

    const handleSave = async ( formData, id ) => {
        // const id = editingData?.id; // ✅ Get the ID if editing
        // console.log( id );
        try {

            if ( id ) {
                // Update existing contact
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_disability/${ id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                // Create new contact (wrap formData in array)
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_disability`,
                    {
                        bandi_id: bandi_id,
                        bandi_disability: [formData],
                    },
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'नयाँ डेटा थपियो ।', 'success' );
            }

            await refetch();
            setModalOpen( false );

        } catch ( error ) {
            console.error( "❌ Axios Error:", error ); // Helpful for debugging
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
                    ♿ अलोपत्व विवरण
                </Typography>
                <Tooltip title="नयाँ अलोपत्व थप्नुहोस्">
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
                {bandiDisabilityLoading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : bandiDisability.length === 0 ? (
                    <Box sx={{
                        py: 3,
                        textAlign: 'center',
                        color: '#95a5a6',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1
                    }}>
                        कुनै अलोपत्व विवरण उपलब्ध छैन
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
                                    }}>अलोपत्व</TableCell>
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
                                {bandiDisability.map( ( opt, index ) => (
                                    <TableRow key={opt.id || index} sx={{
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa',
                                            transition: '0.2s'
                                        }
                                    }}>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{index + 1}</TableCell>
                                        {!print && (
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
                                        </TableCell>)}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Grid>
            <DisabilityModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiDisabilityTable;
