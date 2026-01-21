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
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useBaseURL } from '../../../../Context/BaseURLProvider';
import FamilyModal from '../../Dialogs/FamilyModal';

const FamilyTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_family/${ bandi_id }`;
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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_family/${ id }`, { withCredentials: true } );
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

    const handleEdit = ( data, bandi_id ) => {
        setEditingData( data, bandi_id );
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
                    `${ BASE_URL }/bandi/update_bandi_family/${ id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_family`,
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
                    👨‍👩‍👧‍👦 पारिवारिक सदस्य विवरण
                </Typography>
                <Tooltip title="नयाँ सदस्य थप्नुहोस्">
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
                        कुनै पारिवारिक सदस्य विवरण उपलब्ध छैन
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', overflow: 'auto' }}>
                        <Table size='small' sx={{ tableLayout: 'fixed', width: '100%', minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        सि.नं.
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        नाता
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        नामथर
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        ठेगाना
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        सम्पर्क नं.
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            padding: '12px 8px',
                                            fontSize: '0.9rem',
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        आश्रीत (जन्म मिति)
                                    </TableCell>
                                    ${!print(
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#2c3e50',
                                                padding: '12px 8px',
                                                fontSize: '0.9rem',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            #
                                        </TableCell> )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetchedBandies.map( ( opt, index ) => (
                                    <TableRow
                                        key={opt.id || index}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#f8f9fa',
                                                transition: 'background-color 0.2s ease'
                                            },
                                            borderColor: '#e0e0e0'
                                        }}
                                    >
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {index + 1}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {opt.relation_np || '-'}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {opt.relative_name || '-'}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {opt.relative_address || '-'}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {opt.contact_no || '-'}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                padding: '10px 8px',
                                                fontSize: '0.85rem',
                                                color: '#2c3e50',
                                                borderColor: '#e0e0e0'
                                            }}
                                        >
                                            {opt.is_dependent === 1 ? opt.dob : '-'}
                                        </TableCell>
                                        ${!print(
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    padding: '8px',
                                                    fontSize: '0.85rem',
                                                    borderColor: '#e0e0e0'
                                                }}
                                            >

                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="संपादन गर्नुहोस्">
                                                        <Button
                                                            variant="contained"
                                                            color='primary'
                                                            size='small'
                                                            startIcon={<EditIcon />}
                                                            onClick={() => handleEdit( opt )}
                                                            sx={{ borderRadius: 1, textTransform: 'none', fontSize: '0.75rem', p: '4px 8px' }}
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
                                                            sx={{ borderRadius: 1, textTransform: 'none', fontSize: '0.75rem', p: '4px 8px' }}
                                                        >
                                                            मेटाउनुहोस्
                                                        </Button>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Grid>

            <FamilyModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default FamilyTable;
