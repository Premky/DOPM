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

import { useBaseURL } from '../../../../Context/BaseURLProvider';

import DisabilityModal from '../../Dialogs/DisabilityModal';
import fetchBandiTransferHistory from '../../../ReuseableComponents/FetchApis/fetchBandiTransferHistory';
import BandiTransfer from '../../Dialogs/BandiTransferModal';

const BandiTransferHistoryTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data

    const { records: bandiTransferHistory, loading: bandiTransferHistoryLoading, refetch } = fetchBandiTransferHistory( bandi_id );
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
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_family/${ id }` );
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
                    `${ BASE_URL }/bandi/update_bandi_transfer_history/${ id }`,
                    formData,
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
                    `${ BASE_URL }/bandi/create_bandi_transfer_history`,
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
        <Grid container spacing={2}>
            <BandiTransfer
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
            <Grid container size={{ xs: 12 }}>
                <Grid>
                    <h3> यस अघि सरुवा विवरणः</h3>
                </Grid>
                <Grid marginTop={2}>
                    &nbsp; <Button variant='contained' size='small' onClick={() => handleAdd( bandi_id )}>Add</Button>
                </Grid>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">कारागार</TableCell>
                                <TableCell align="center">देखी</TableCell>
                                <TableCell align="center">सम्म</TableCell>
                                <TableCell align="center">कारण</TableCell>
                                <TableCell align="center">कैफियत</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bandiTransferHistory.map( ( opt, index ) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.transfer_to_office_fn}</TableCell>
                                    <TableCell align="center">{opt.transfer_from_date}</TableCell>
                                    <TableCell align="center">{opt.transfer_to_date}</TableCell>
                                    <TableCell align="center">{opt.transfer_reason_np}</TableCell>
                                    <TableCell align="center">{opt.transfer_reason}</TableCell>

                                    <TableCell align="center">
                                        <Grid item container alignContent='center' spacing={2}>
                                            <Grid item>
                                                <Button variant="contained" color='success' onClick={() => handleEdit( opt )}>✏️</Button>
                                            </Grid>
                                            <Grid item>
                                                <Button variant="contained" color='error' onClick={() => handleDelete( opt.id )}>🗑️</Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ) )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

        </Grid>
    );
};

export default BandiTransferHistoryTable;
