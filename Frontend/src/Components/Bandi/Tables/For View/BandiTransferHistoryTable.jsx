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

import DisabilityModal from '../../Dialogs/DisabilityModal';
import fetchBandiTransferHistory from '../../../ReuseableComponents/FetchApis/fetchBandiTransferHistory';
import BandiTransfer from '../../Dialogs/BandiTransferModal';
import { useAuth } from '../../../../Context/AuthContext';


const BandiTransferHistoryTable = ( { bandi_id, print=false } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth()||{};

    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data
    const { records: bandiTransferHistory, loading: bandiTransferHistoryLoading, refetch } = fetchBandiTransferHistory( bandi_id );

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
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_family/${ id }` );
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
                // Update existing contact
                response = await axios.put(
                    `${ BASE_URL }/bandiTransfer/update_bandi_old_transfer_history/${ id }`,
                    { bandi_transfer_details: [formData] },
                    { withCredentials: true }
                );

                if ( response.data.Status ) {
                    Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
                } else {
                    throw new Error( response.data.message || 'अपडेट गर्न सकिएन ।' );
                }
            } else {
                // Create new contact
                response = await axios.post(
                    `${ BASE_URL }/bandiTransfer/create_bandi_old_transfer_history`,
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
                    ➡️ स्थानान्तरण इतिहास
                </Typography>
                <Tooltip title="नयाँ स्थानान्तरण थप्नुहोस्">
                    <Button variant='contained' size='small' startIcon={<AddIcon />} onClick={() => handleAdd(bandi_id)} sx={{ borderRadius: 1, textTransform: 'none' }}>थप्नुहोस्</Button>
                </Tooltip>
            </Grid>

            <Grid size={{ xs: 12 }}>
                {bandiTransferHistoryLoading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={40} /></Box>
                ) : bandiTransferHistory.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center', color: '#95a5a6', backgroundColor: '#f8f9fa', borderRadius: 1 }}>कुनै स्थानान्तरण विवरण उपलब्ध छैन</Box>
                ) : (
                <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', overflow: 'auto' }}>
                    <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>सि.नं.</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>स्थानान्तरण गरेको कारागार</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>स्थानान्तरण मिति</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>स्थानान्तरण को कारण</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>पत्र क्रमांक</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>अनुगमन अवस्था</TableCell>
                                ${!print(<TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50', padding: '12px 8px', fontSize: '0.9rem' }}>#</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bandiTransferHistory.map((opt, index) => (
                                <TableRow key={opt.id || index} sx={{ '&:hover': { backgroundColor: '#f8f9fa', transition: '0.2s' } }}>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{index + 1}</TableCell>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.transfer_from_office || ''}</TableCell>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.transfer_date_bs || ''}</TableCell>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.transfer_reason || ''}</TableCell>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.letter_crn || ''}</TableCell>
                                    <TableCell align="center" sx={{ padding: '10px 8px', fontSize: '0.85rem' }}>{opt.is_completed || ''}</TableCell>
                                    ${!print(
                                    <TableCell align="center" sx={{ padding: '10px 8px' }}>
                                        {shouldShowDeleteButton(opt, authState?.role_Id) && (
                                            <>
                                                <Tooltip title="संपादन गर्नुहोस्">
                                                    <Button variant="contained" color='success' size='small' startIcon={<EditIcon />} onClick={() => handleEdit(opt)} sx={{ borderRadius: 0.5, textTransform: 'none', mr: 1 }}>संपादन</Button>
                                                </Tooltip>
                                                <Tooltip title="मेटाउनुहोस्">
                                                    <Button variant="contained" color='error' size='small' startIcon={<DeleteIcon />} onClick={() => handleDelete(opt.id)} sx={{ borderRadius: 0.5, textTransform: 'none' }}>मेटाउनुहोस्</Button>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                )}
                <BandiTransfer open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editingData={editingData} />
            </Grid>
        </Grid>
    );
};

export default BandiTransferHistoryTable;
