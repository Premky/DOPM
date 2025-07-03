import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { Button, Grid, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { calculateAge, inCalculateAge } from '../../../../Utils/ageCalculator';
import BandiEditModal from '../Dialogs/BandiEditModa';
import Swal from 'sweetalert2';

const BandiTable = ( { bandi_id } ) => {
    const BASE_URL = useBaseURL();
    // const { bandi_id } = useParams();

    const [fetchedBandi, setFetchedBandies] = useState( [] );
    const [loading, setLoading] = useState( false );

    const fetchBandies = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi/${ bandi_id }`;
            const response = await axios.get( url );
            const { Status, Result, Error } = response.data;
            // console.log('URL:',url, Result)
            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    setFetchedBandies( Result[0] );
                    // console.log( Result );
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

    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );
    const handleEdit = ( data, bandi_id ) => {
        setEditingData( data, bandi_id );
        setModalOpen( true );
    };
    const handleAdd = ( bandi_id ) => {
        setEditingData( { bandi_id } );
        setModalOpen( true );
    };

    const handleSave = async ( formData, id ) => {
        // console.log(id)
        try {
            if ( formData.bandi_id ) {
                await axios.put(
                    `${ BASE_URL }/bandi/update_bandi/${ formData.bandi_id }`,
                    formData,
                    { withCredentials: true }
                );
                Swal.fire( 'सफल भयो !', 'डेटा अपडेट गरियो', 'success' );
            // } else {
            //     await axios.post(
            //         `${ BASE_URL }/bandi/create_bandi_family`,
            //         { ...formData, bandi_id: bandi_id },
            //         { withCredentials: true }
            //     );
            //     Swal.fire( 'सफल भयो !', 'नयाँ डेटा थपियो ।', 'success' );
            }

            fetchBandies();
        } catch ( error ) {
            Swal.fire( 'त्रुटि!', 'सर्भर अनुरध असफल भयो ।', 'error' );
        }
    };
    return (
        <>
            <BandiEditModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />
            <Grid item container spacing={2}>
                <Grid container item xs={12}>
                    <Grid>
                        <h3>बन्दी विवरणः</h3>
                    </Grid>
                    <Grid marginTop={2}>
                        <Button variant="contained" color='success' onClick={() => handleEdit(fetchedBandi)}>✏️</Button>
                        {/* &nbsp; <Button variant='contained' size='small' onClick={() => handleEdit( fetchedBandi )}>Edit</Button> */}
                    </Grid>
                </Grid>
                
                <Grid item xs={12}>
                    <TableContainer>
                        <Table size='small' border={1}>
                            <TableRow>
                                <TableCell>बन्दी आई.डि.</TableCell>
                                <TableCell>{fetchedBandi.office_bandi_id}</TableCell>
                                <TableCell>बन्दी प्रकार</TableCell>
                                <TableCell>{fetchedBandi.bandi_type}</TableCell>
                                <TableCell rowSpan={5} colSpan={2} align='center'>
                                    <img
                                        src={fetchedBandi.photo_path ? `${ BASE_URL }${ fetchedBandi.photo_path }` : '/default-avatar.png'}
                                        alt="Bandi"
                                        style={{ height: 150, width: 150, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>नामथर</TableCell>
                                <TableCell>{fetchedBandi.bandi_name}</TableCell>
                                <TableCell>लिङ्ग</TableCell>
                                <TableCell>{fetchedBandi.gender == 'Male' ? 'पुरुष' : fetchedBandi.gender == 'Female' ? 'महिला' : 'अन्य'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>जन्म मिति/उमेरः</TableCell>
                                <TableCell>{fetchedBandi.dob} ({fetchedBandi.current_age} वर्ष)</TableCell>
                                <TableCell>वैवाहिक अवस्था</TableCell>
                                <TableCell>{fetchedBandi.married_status}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>शेक्षिक योग्यता</TableCell>
                                <TableCell>{fetchedBandi.bandi_education}</TableCell>
                                <TableCell>हुलिया</TableCell>
                                <TableCell>{fetchedBandi.bandi_huliya}</TableCell>
                            </TableRow>
                            {/* <TableRow>
                                <TableCell>उचाई</TableCell>
                                <TableCell>{fetchedBandi.height}</TableCell>
                                <TableCell>तौल</TableCell>
                                <TableCell>{fetchedBandi.weight}</TableCell>
                            </TableRow> */}
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    );
};

export default BandiTable;