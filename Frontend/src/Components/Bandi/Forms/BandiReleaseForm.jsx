import React, { useEffect, useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';


import useFetchBandiReleaseReasons from '../Apis_to_fetch/useFetchBandiReleaseReasons';
import fetchBandiRelatives from '../../ReuseableComponents/fetchBandiRelatives';

import BandiMuddaTable from '../Tables/For View/BandiMuddaTable';
import BandiAddressTable from '../Tables/For View/BandiAddressTable';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import Swal from 'sweetalert2';
import axios from 'axios';
import FamilyTable from '../Tables/For View/FamilyTable';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const BandiReleaseForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { handleSubmit, control, watch, reset, formState: { errors } } = useForm();

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const bandi_id = watch( 'bandi_id' );
    const reason_id = watch( 'reason_id' );
    const { records: releaseReasons, optrecords: releaseRecordsOptions, loading: realeseReasonsLoading } = useFetchBandiReleaseReasons( bandi_id );
    const { records: relatives, optrecords: relativeOptions, loading: loadingRelatives } = fetchBandiRelatives( bandi_id );

    const onFormSubmit = async ( data ) => {
        setLoading( true );
        try {
            // console.log(data)
            const url = editing ? `${ BASE_URL }/bandi/update_release_bandi/${ editableData.id }` : `${ BASE_URL }/bandi/create_release_bandi`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios( {
                method, url, data: data,
                withCredentials: true
            } );
            const { Status, Result, Error } = response.data;
            console.log( response );
            if ( Status ) {
                Swal.fire( {
                    title: `Office ${ editing ? 'updated' : 'created' } successfully!`,
                    icon: "success",
                    draggable: true
                } );
                reset();
                setEditing( false );
                // fetchOffices();
            } else {
                Swal.fire( {
                    title: response.data.nerr,
                    icon: 'error',
                    draggable: true
                } );
            }

        } catch ( err ) {
            console.error( err );
            Swal.fire( {
                title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
                icon: 'error',
                draggable: true
            } );
        } finally {
            setLoading( false );
        }
    };

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>PMIS: बन्दी छुट्टी/लगत कट्टा फारम</title>
                    <meta name="description" content="बन्दी छुट्टी/लगत कट्टा सम्बन्धि फारम भर्नुहोस्" />
                    <meta name="keywords" content="बन्दी, बन्दी छुट्टी, लगत कट्टा, फारम, बन्दी विवरण, बन्दी रेकर्ड" />
                    <meta name="author" content="कारागार व्यवस्थापन विभाग" />
                </Helmet>
            </HelmetProvider>
            <Box>
                <Grid container spacing={2}>
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid size={{ xs: 12 }}>
                            <ReuseBandi
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                current_office={authState.office_np}
                                type='allbandi'
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <BandiAddressTable bandi_id={bandi_id} />
                            <BandiMuddaTable bandi_id={bandi_id} />
                            <FamilyTable bandi_id={bandi_id} />
                        </Grid>

                        <hr />
                        <Grid container size={{ xs: 12 }}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseSelect
                                    name='reason_id'
                                    label='छुटेको/लगत कट्टाको कारणः'
                                    required={true}
                                    options={releaseRecordsOptions}
                                    control={control}
                                    errors={errors.reason_id}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='decision_date'
                                    label='निर्णय मिति'
                                    control={control}
                                    required={true}
                                    errors={errors.decision_date}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='apply_date'
                                    label='कार्यान्वयन मिति'
                                    required={true}
                                    control={control}
                                    errors={errors.apply_date}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name='nirnay_officer'
                                    label='निर्णय गर्ने अधिकारी'
                                    control={control}
                                    required={true}
                                    errors={errors.nirnay_officer}
                                />
                            </Grid>
                        </Grid>
                        <Grid container size={{ xs: 12 }}>
                            {( reason_id != 2 && reason_id != 6 ) && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <ReuseSelect
                                        name='aafanta_id'
                                        label='बुझ्ने मान्छे छान्नुहोस्'
                                        options={relativeOptions}
                                        control={control}
                                        required={( reason_id != 2 && reason_id != 6 )}
                                        errors={errors.aafanta_id}
                                    />
                                </Grid>
                            )}

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ReuseInput
                                    name='remarks'
                                    label='कैफियत'
                                    control={control}
                                    errors={errors.remarks}
                                />
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Button variant='contained' type='submit'>
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Box>
        </>
    );
};

export default BandiReleaseForm;