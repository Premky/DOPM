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
import fetchBandiTransferHistory from '../../../ReuseableComponents/FetchApis/fetchBandiTransferHistory';
import BandiTransfer from '../../Dialogs/BandiTransferModal';
import fetchBandiReleaseDetails from '../../../ReuseableComponents/FetchApis/fetchBandiReleaseDetails';

const BandiReleaseTable = ( { bandi_id, print = false } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data

    const { records: bandiReleaseData, loading: bandiReleaseDataLoading, refetch } = fetchBandiReleaseDetails( bandi_id );
    // console.log(bandiTransferHistory)
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
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_release/${ id }` );
                // fetchBandies();
                Swal.fire( 'हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success' );
            } catch ( error ) {
                Swal.fire( 'त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error' );
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
        try {
            let response;
            if ( id ) {
                // Update existing contact
                response = await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_release/${ id }`,
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
                    `${ BASE_URL }/bandi/create_bandi_release`,
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
            // await refetch();
            setModalOpen( false );
        } catch ( error ) {
            console.error( "❌ Axios Error:", error );
            Swal.fire( 'त्रुटि!', error.message || 'सर्भर अनुरोध असफल भयो ।', 'error' );
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
                    🔓 कैदीबन्दीको कैदमुक्त विवरण
                </Typography>
                <Tooltip title="नयाँ विवरण थप्नुहोस्">
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
                {bandiReleaseDataLoading ? (
                    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : bandiReleaseData.length === 0 ? (
                    <Box sx={{
                        py: 3,
                        textAlign: 'center',
                        color: '#95a5a6',
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1
                    }}>
                        कुनै कैदमुक्त विवरण उपलब्ध छैन
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
                                    }}>कारण</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>कार्यान्वयन मिति</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>निर्णय गर्ने अधिकारी</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>बुझ्ने मान्छे</TableCell>
                                    <TableCell align="center" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        padding: '12px 8px',
                                        fontSize: '0.9rem',
                                        borderColor: '#e0e0e0'
                                    }}>कैफियत</TableCell>
                                    ${!print(
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
                                {bandiReleaseData.map( ( opt, index ) => (
                                    <TableRow key={opt.id || index} sx={{
                                        '&:hover': {
                                            backgroundColor: '#f8f9fa',
                                            transition: '0.2s'
                                        }
                                    }}>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{index + 1}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.reasons_np}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.karnayan_miti}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.nirnay_officer}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.relative_name}</TableCell>
                                        <TableCell align="center" sx={{ padding: '10px 8px' }}>{opt.remarks}</TableCell>
                                        ${!print( <TableCell align="center" sx={{ padding: '10px 8px' }}>-</TableCell> )}
                                    </TableRow>
                                ) )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Grid>

            <BandiTransfer
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiReleaseTable;
