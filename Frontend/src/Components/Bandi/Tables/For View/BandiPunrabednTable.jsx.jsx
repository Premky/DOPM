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
import PunrabednDialog from '../../Dialogs/PunrabednDialog';

import { useBaseURL } from '../../../../Context/BaseURLProvider';

const BandiPunrabednTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_punrabedn/${ bandi_id }`;
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
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_id_details/${ id }` );
                fetchBandies();
                Swal.fire( 'हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success' );
            } catch ( error ) {
                Swal.fire( 'त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error' );
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
                fetchBandies();
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                console.log("📦 Payload to server:", formData);
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

    return (
        <Grid container spacing={2}>
            <Grid container size={{xs:12}}>
                <Grid>
                    <h3>पुनरावेदनमा नपरेको प्रमाण विवरणः</h3>
                </Grid>
                <Grid marginTop={2}>
                    &nbsp; <Button variant='contained' size='small' onClick={() => handleAdd( bandi_id )}>Add</Button>
                </Grid>
            </Grid>
            <Grid size={{xs:12}}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">पुनरावेदन नपरेको कार्यालय</TableCell>
                                <TableCell align="center">पुनरावेदन नपरेको जिल्ला</TableCell>
                                <TableCell align="center">पुनरावेदन नपरेको प्रमाणको च.नं.</TableCell>
                                <TableCell align="center">पुनरावेदनमा नपरेको प्रमाणको पत्र मिति</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map( ( opt, index ) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.office_name_with_letter_address || ''}</TableCell>
                                    <TableCell align="center">{opt.district_name_np || ''}</TableCell>
                                    <TableCell align="center">{opt.punarabedan_office_ch_no || ''}</TableCell>
                                    <TableCell align="center">{opt.punarabedan_office_date || ''}</TableCell>

                                    <TableCell align="center">
                                        <Grid container spacing={2}>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color='success'
                                                    onClick={() => handleEdit( opt )}
                                                >
                                                    ✏️
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color='error'
                                                    onClick={() => handleDelete( opt.id )}
                                                >
                                                    🗑️
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            ) )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* 🔽 Insert this right after your TableContainer or at the end of return */}
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
