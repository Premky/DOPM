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
import FamilyModal from '../../Dialogs/FamilyModal';
import AddressModal from '../../Dialogs/AddressModal';

const BandiAddressTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_address/${ bandi_id }`;
            const response = await axios.get( url, { withCredentials: true } );

            const { Status, Result, Error } = response.data;

            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    setFetchedBandies( Result );
                } else {
                    console.log( 'No address record found.' );
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
                await axios.delete( `${ BASE_URL }/bandi/delete_bandi_address/${ id }` );
                fetchBandies();
                Swal.fire( 'हटाइयो!', 'रिकर्ड सफलतापूर्वक मेटाइयो।', 'success' );
            } catch ( error ) {
                Swal.fire( 'त्रुटि!', 'डेटा मेटाउँदा समस्या आयो।', 'error' );
            }
        }
    };

    const handleEdit = ( data, bandi_id ) => {
        // setEditingData(data, bandi_id);
        console.log(data)
        setEditingData( data );
        setModalOpen( true );
    };
    const handleAdd = ( bandi_id ) => {
        setEditingData( { bandi_id } );
        setModalOpen( true );
    };

    const handleSave = async ( formData, id ) => {
        console.log('formdata', formData)
        console.log( id );
        try {
            if ( id ) {
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi_address/${ id }`,
                    formData,
                    { withCredentials: true }
                );

                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_address`,
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
        <Grid container spacing={2}>
            <Grid container size={{xs:12}}>
                <Grid>
                    <h3>कैदीबन्दीको हालको ठेगानाः</h3>
                </Grid>
                <Grid marginTop={2}>
                    {/* &nbsp; <Button variant='contained' size='small' onClick={() => handleAdd(bandi_id)}>Add</Button> */}
                </Grid>
            </Grid>
            <Grid size={{xs:12}}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">देश</TableCell>
                                <TableCell align="center">प्रदेश</TableCell>
                                <TableCell align="center">जिल्ला</TableCell>
                                <TableCell align="center">गा.पा./न.पा.</TableCell>
                                <TableCell align="center">वडा नं.</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map( ( opt, index ) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.country_name_np || ''}</TableCell>
                                    {opt.country_name_np == 'नेपाल' ? (
                                        <>
                                            <TableCell align="center">{opt.state_name_np || ''}</TableCell>
                                            <TableCell align="center">{opt.district_name_np || ''}</TableCell>
                                            <TableCell align="center">{opt.city_name_np || ''}</TableCell>
                                            <TableCell align="center">{opt.wardno || ''}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell align="center" colSpan={4}>{opt.bidesh_nagarik_address_details}</TableCell>
                                        </>
                                    )}

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
            <AddressModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiAddressTable;
