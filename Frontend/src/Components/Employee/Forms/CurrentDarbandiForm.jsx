import React, { useEffect, useState } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import { Box, Button, Grid } from '@mui/material';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import Swal from 'sweetalert2';
import axios from 'axios';
import usePosts from '../APIs/usePosts';



const CurrentDarbandiForm = ({editing, currentData, onClose, onSuccess}) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { handleSubmit, reset, control, formState: { errors } } = useForm( { mode: 'all' } );
    // console.log( 'CurrentDarbandiForm props:', { editing, currentData, onClose, onSuccess } );
    useEffect( () => {
        if ( editing && currentData ) {
            reset( {                
                emp_post: currentData.post_id,
                emp_level: currentData.level_id,
                emp_group: currentData.service_group_id,
                no_of_darbandi: currentData.darbandi,
                remarks_post: currentData.remarks_post,
            } );
        } else {
            reset();
        }
    }, [editing, currentData, reset] );
    
    const onFormSubmit = async ( data ) => {

        try {
            const url = editing
                ? `${ BASE_URL }/emp/update_current_darbandi/${ currentData.id }`
                : `${ BASE_URL }/emp/create_current_darbandi`;
            const method = editing ? 'PUT' : 'POST';

            // console.log( 'Form Data:', data );
            const response = await axios( {
                method,
                url,
                data: data,
                withCredentials: true
            } );
            const { Status, Result, Error } = response.data;
            if ( Status ) {
                Swal.fire( 'थपियो!', 'रिकर्ड सफलतापूर्वक थपियो', 'success' );                
                reset();                
                onSuccess();
                onClose();                
            } else {
                Swal.fire( 'त्रुटि!', Error || 'रिकर्ड थप्न सकिएन', 'error' );
            }
        } catch ( error ) {
            console.log( 'Error submitting form', error );
            Swal.fire( 'त्रुटि!', 'डेटा बुझाउँदा समस्या आयो।', 'error' );
        }
    };

    const formHeadStyle = { color: 'blue', fontWeight: 'bold' };
    const { posts, optPosts, postsloading, level, optLevel, Levelloading, serviceGroups, optServiceGroups, serviceGroupsloading } = usePosts();



    return (
        <>
            <Box>
                <Grid container spacing={0}>
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid container spacing={2}>
                            <Grid item size={{ xs: 12 }} sx={formHeadStyle}>
                                दरबन्दी फारम
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseSelect
                                    name="emp_post"
                                    label="कर्मचारीको पद"
                                    required={true}
                                    control={control}
                                    options={optPosts}
                                    error={errors.emp_post}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseSelect
                                    name="emp_level"
                                    label="कर्मचारीको श्रेणी/तह"
                                    required={true}
                                    control={control}
                                    options={optLevel}
                                    error={errors.emp_level}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseSelect
                                    name="emp_group"
                                    label="सेवा समुह"
                                    required={true}
                                    control={control}
                                    options={optServiceGroups}
                                    error={errors.emp_group}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name="no_of_darbandi"
                                    label="दरबन्दी संख्या"
                                    type='number'
                                    required={false}
                                    control={control}
                                    error={errors.no_of_darbandi}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name="remarks_post"
                                    label="कैफियत"
                                    required={false}
                                    control={control}
                                    error={errors.remarks_post}
                                />
                            </Grid>
                            <Grid>
                                <Button variant='contained' type='submit' color='primary' >
                                    {editing ? 'परिमार्जन गर्नुहोस्' : 'थप्नुहोस्'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Box>
        </>
    );
};

export default CurrentDarbandiForm;;