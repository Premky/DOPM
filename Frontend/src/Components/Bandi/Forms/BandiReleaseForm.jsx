import React, { useEffect, useState } from 'react';
import { Box, Grid, Grid2, Button } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import fetchReleaseReasons from '../../ReuseableComponents/fetchReleaseReasons';
import fetchBandiRelatives from '../../ReuseableComponents/fetchBandiRelatives';

import BandiMuddaTable from '../Tables/BandiMuddaTable';
import BandiAddressTable from '../Tables/BandiAddressTable';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseDatePickerBS from '../../ReuseableComponents/ReuseDatePickerBS';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import Swal from 'sweetalert2';
import axios from 'axios';

const BandiReleaseForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { handleSubmit, control, watch, reset, formState: { errors } } = useForm();

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const bandi_id = watch( 'bandi_id' );
    const { records: releaseReasons, optrecords: releaseRecordsOptions, loading: realeseReasonsLoading } = fetchReleaseReasons( bandi_id );
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
            <Box>
                <Grid2 container spacing={2}>
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseBandi
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                current_office={authState.office_np}
                                type='allbandi'
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <BandiAddressTable bandi_id={bandi_id} />
                            <BandiMuddaTable bandi_id={bandi_id} />
                        </Grid2>
                        <hr />
                        <Grid2 container size={{ xs: 12 }}>
                            <Grid2 size={{ xs: 12, xs: 6, sm: 3 }}>
                                <ReuseSelect
                                    name='reason_id'
                                    label='छुटेको/लगत कट्टाको कारणः'
                                    required={true}
                                    options={releaseRecordsOptions}
                                    control={control}
                                    errors={errors.reason_id}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, xs: 6, sm: 3 }}>
                                <ReuseDatePickerBS
                                    name='decision_date'
                                    label='निर्णय मिति'
                                    control={control}
                                    errors={errors.decision_date}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, xs: 6, sm: 3 }}>
                                <ReuseDatePickerBS
                                    name='apply_date'
                                    label='कार्यान्वयन मिति'
                                    required={true}
                                    control={control}
                                    errors={errors.apply_date}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, xs: 6, sm: 3 }}>
                                <ReuseInput
                                    name='nirnay_officer'
                                    label='निर्णय गर्ने अधिकारी'
                                    control={control}
                                    errors={errors.nirnay_officer}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 container size={{ xs: 12 }}>
                            <Grid2 size={{ xs: 12, xs: 6}}>
                                <ReuseSelect
                                    name='aafanta_id'
                                    label='बुझ्ने मान्छे छान्नुहोस्'
                                    options={relativeOptions}
                                    control={control}
                                    errors={errors.aafanta_id}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, xs: 6}}>
                                <ReuseInput
                                    name='remarks'
                                    label='कैफियत'
                                    control={control}
                                    errors={errors.remarks}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 container>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Button variant='contained' type='submit'>
                                    Save
                                </Button>
                            </Grid2>
                        </Grid2>
                    </form>
                </Grid2>
            </Box>
        </>
    );
};

export default BandiReleaseForm;