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
import KaidModal from '../../Dialogs/KaidModal';
import { calculateBSDate } from '../../../../../Utils/dateCalculator';

const BandiKaidTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    const [fetchedBandies, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );

    // ✅ Fetch data
    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_kaid_details/${ bandi_id }`;
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
        const result = await Swal.fire( {
            title: `Are You Sure?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        } );

        if ( result.isConfirmed ) {
            try {
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi_kaid_details/${ id }`, { withCredentials: true } );
                if ( res.data.Status ) {
                    Swal.fire( 'Deleted!', 'Record has been deleted.', 'success' );
                    setFetchedBandies(prev => prev.filter(item => item.id !== id));
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
                    `${ BASE_URL }/bandi/update_bandi_kaid_details/${ id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            } else {
                await axios.post(
                    `${ BASE_URL }/bandi/create_bandi_kaid_details`,
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
            <Grid container size={{ xs: 12 }}>
                <Grid>
                    <h3>कैदीबन्दीको कैद विवरणः</h3>
                </Grid>
                <Grid marginTop={2}>
                    {/* &nbsp; <Button variant='contained' size='small' onClick={() => handleAdd(bandi_id)}>Add</Button> */}
                </Grid>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TableContainer component={Paper}>
                    <Table size='small' border={2}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">सि.नं.</TableCell>
                                <TableCell align="center">बन्दी प्रकार</TableCell>
                                <TableCell align="center">हिरासत अवधी</TableCell>
                                <TableCell align="center">थुना/कैद परेको मिति</TableCell>
                                <TableCell align="center">छुट्ने मिति</TableCell>
                                <TableCell align="center">कैद अवधी</TableCell>
                                <TableCell align="center">#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fetchedBandies.map( ( opt, index ) => (
                                <TableRow key={opt.id || index}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell align="center">{opt.bandi_type || ''}</TableCell>

                                    <TableCell align="center">{opt.hirasat_years || '0'}|{opt.hirasat_months || '0'}|{opt.hirasat_days || '0'}</TableCell>
                                    <TableCell align="center">{opt.thuna_date_bs || ''}</TableCell>
                                    <TableCell align="center">
                                        {opt.is_life_time == 1 ? 'आजिवन' : opt.bandi_type == "कैदी" ? opt.release_date_bs : ''}
                                    </TableCell>
                                    <TableCell align="center">
                                        {opt.is_life_time == 1 ? 'आजिवन' : opt.bandi_type == "कैदी" ? ( calculateBSDate( opt.thuna_date_bs, opt.release_date_bs, '', opt.hirasat_years, opt.hirasat_months, opt.hirasat_days ).formattedDuration ) : ''}
                                    </TableCell>
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
            <KaidModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
        </Grid>
    );
};

export default BandiKaidTable;
