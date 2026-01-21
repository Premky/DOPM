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

import BandiTransfer from '../../Dialogs/BandiTransferModal';
import { useAuth } from '../../../../Context/AuthContext';
import fetchBandiEscape from '../../Apis_to_fetch/useFetchBandiEscape';
import BandiEscapeModal from '../../Dialogs/BandiEscapeModal';


const BandiEscapeTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth()||{};;

    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data    
    const { records: bandiEscapeDetails, loading: EscapeDetailsLoading, refetch } = fetchBandiEscape( bandi_id );

    // ✅ DELETE handler
    const handleDelete = async ( id ) => {
        const confirm = await Swal.fire( {
            title: 'पक्का हुनुहुन्छ?',
            text: 'यो विवरण मेटाइनेछ!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'मेटाउनुहोस्',
            cancelButtonText: 'रद्द गर्नुहोस्',
        } );

        if ( confirm.isConfirmed ) {
            try {
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_escape_details/${ id }` );
                Swal.fire( 'हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success' );
            } catch ( error ) {
                Swal.fire( 'त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error' );
            }
        }
    };

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
            let response;
            if ( id ) {
                response = await axios.put(
                    `${ BASE_URL }/bandiTransfer/update_bandi_escape_details/${ id }`,
                    { bandi_transfer_details: [formData] },
                    { withCredentials: true }
                );

                if ( response.data.Status ) {
                    Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
                } else {
                    throw new Error( response.data.message || 'अपडेट गर्न सकिएन ।' );
                }
            } else {
                response = await axios.post(
                    `${ BASE_URL }/bandiTransfer/create_bandi_escape_details`,
                    {
                        bandi_id: bandi_id,
                        bandi_transfer_details: [formData],
                    },
                    { withCredentials: true }
                );
                if ( response.data.Status ) {
                    Swal.fire( 'सफल भयो !', 'नयाँ डेटा थपियो ।', 'success' );
                } else {
                    throw new Error( response.data.message || 'थप्न सकिएन ।' );
                }
            }
            setModalOpen( false );
        } catch ( error ) {
            console.error( "❌ Axios Error:", error );
            Swal.fire( 'त्रुटि!', error.message || 'सर्भर अनुरोध असफल भयो ।', 'error' );
        }
    };

    const shouldShowDeleteButton = ( opt, role_Id ) => {
        return opt.is_completed === 'Pending' || role_Id === 99;
    };

    return (
        <Grid container spacing={2.5}>
            <Grid container size={{ xs: 12 }} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 1 }}>
                    🚨 अहिले सम्म भागेको विवरण
                </Typography>
                <Tooltip title="नयाँ विवरण थप्नुहोस्">
                    <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => handleAdd( bandi_id )} sx={{ borderRadius: 1, textTransform: 'none' }}>थप्नुहोस्</Button>
                </Tooltip>
            </Grid>

            <Grid size={{ xs: 12 }}>
                {EscapeDetailsLoading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={40} /></Box>
                ) : bandiEscapeDetails.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', color: '#95a5a6', backgroundColor: '#f8f9fa', borderRadius: 1 }}>कुनै भागेको विवरण उपलब्ध छैन</Box>
                ) : (
                    <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', overflow: 'auto' }}>
                        <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>सि.नं.</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>कारागार</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>भागेको मिति</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>विधि</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>अवस्था</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>पक्राउ मिति</TableCell>
                                    {!print && (
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>#</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bandiEscapeDetails.map( ( opt, index ) => (
                                    <TableRow key={opt.id || index} sx={{ '&:hover': { backgroundColor: '#f8f9fa', transition: '0.2s' } }}>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.escaped_from_office || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.escape_date_bs || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.escape_method || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.status || ''}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.recapture_date_bs || ''}</TableCell>
                                        {!print && (
                                            <TableCell align="center" sx={{ padding: '10px 8px' }}>
                                                {shouldShowDeleteButton( opt, authState?.role_Id ) && (
                                                    <>
                                                        <Tooltip title="संपादन गर्नुहोस्">
                                                            <Button variant="contained" color='success' size='small' startIcon={<EditIcon />} onClick={() => handleEdit( opt )} sx={{ borderRadius: 0.5, textTransform: 'none', mr: 1 }}>संपादन</Button>
                                                        </Tooltip>
                                                        <Tooltip title="मेटाउनुहोस्">
                                                            <Button variant="contained" color='error' size='small' startIcon={<DeleteIcon />} onClick={() => handleDelete( opt.id )} sx={{ borderRadius: 0.5, textTransform: 'none' }}>मेटाउनुहोस्</Button>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                <BandiEscapeModal open={modalOpen} onClose={() => setModalOpen( false )} onSave={handleSave} editingData={editingData} />
            </Grid>
        </Grid>
    );
};

export default BandiEscapeTable;
