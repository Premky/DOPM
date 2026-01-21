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
import MuddaEditDialog from '../../Dialogs/MuddaDialog';

import { useBaseURL } from '../../../../Context/BaseURLProvider';
import { calculateBSDate } from '../../../../../Utils/dateCalculator';


const BandiMuddaTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_mudda/${ bandi_id }`;
            const response = await axios.get( url );

            const { Status, Result, Error } = response.data;

            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    setFetchedBandies( Result );
                    console.log( fetchedBandies );
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
            const response = await axios.get( `${ BASE_URL }/public/get_mudda` );
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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_mudda_details/${ id }`, { withCredentials: true } );
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
                    `${ BASE_URL }/bandi/update_bandi_mudda/${ id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_mudda`,
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
                    ⚖️ कैदीबन्दीको मुद्दाको विवरण
                </Typography>
                <Tooltip title="नयाँ मुद्दा थप्नुहोस्">
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
                        कुनै मुद्दा विवरण उपलब्ध छैन
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
                                    }}>मुद्दा</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>मुद्दा नं.</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>मुद्दा अवस्था</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>मुद्दा फैसला गर्ने अन्तिम निकाय</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>मुद्दा फैसला मिती</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>थुना परेको मिति</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>छुट्ने मिति</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>कैद अवधी</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>मुख्य मुद्दा हो?</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>अन्तिम मुद्दा हो?</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>कैदी/थुनुवा पुर्जी</TableCell>
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
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.mudda_name || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.mudda_no || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.mudda_condition == 1 ? 'चालु' : 'अन्तिम भएको' || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.office_name_with_letter_address}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.mudda_phesala_antim_office_date}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.thuna_date_bs}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{
                                            opt.is_life_time == 1 ? ( "आजिवन" ) : ( opt.release_date_bs )
                                        }</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{
                                            opt.is_life_time == 1 ? ( "आजिवन" ) : ( calculateBSDate( opt.thuna_date_bs, opt.release_date_bs, '', opt.hirasat_years, opt.hirasat_months, opt.hirasat_days ).formattedDuration )
                                        }</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.is_main_mudda ? 'हो' : 'होइन'}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.is_last_mudda ? 'हो' : 'होइन'}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>
                                            {opt.thunuwa_or_kaidi_purji ?
                                                ( <a
                                                    href={`${ BASE_URL }${ opt.thunuwa_or_kaidi_purji }`}
                                                    download
                                                >
                                                    डउनलोड गर्नुहोस्
                                                </a> ) : ( 'कुनै फाइल छैन।' )
                                            }
                                        </TableCell>
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
                                            </TableCell> )}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* 🔽 Insert this right after your TableContainer or at the end of return */}
                <MuddaEditDialog
                    open={modalOpen}
                    onClose={() => setModalOpen( false )}
                    editingData={editingData}
                    onSave={handleSave}
                />
            </Grid>
        </Grid>
    );
};

export default BandiMuddaTable;
