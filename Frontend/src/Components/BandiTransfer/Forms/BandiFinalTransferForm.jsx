import { useState, useEffect } from 'react';
import { Box, Grid, Button } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import NepaliDate from 'nepali-datetime';
import fetchBandiRelatives from '../../ReuseableComponents/fetchBandiRelatives';

import BandiMuddaTable from '../../Bandi/Tables/For View/BandiMuddaTable';
import BandiAddressTable from '../../Bandi/Tables/For View/BandiAddressTable';
import FamilyTable from '../../Bandi/Tables/For View/FamilyTable';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';

import ReuseInput from '../../ReuseableComponents/ReuseInput';
import Swal from 'sweetalert2';
import axios from 'axios';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import useFetchBandiTransferReasons from '../Fetch_APIs/useFetchBandiTransferReasons';
import BandiKaidTable from '../../Bandi/Tables/For View/BandiKaidTable';
import useFetchBandiForTransfer from '../Fetch_APIs/useFetchBandiForTransfer';

const BandiTransferForm = ( { status } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const { handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm();

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const bandi_id = watch( 'bandi_id' );
    const reason_id = watch( 'reason_id' );
    const { records: releaseReasons, optrecords: releaseRecordsOptions, loading: realeseReasonsLoading } = useFetchBandiTransferReasons( bandi_id );
    const { records: relatives, optrecords: relativeOptions, loading: loadingRelatives } = fetchBandiRelatives( bandi_id );

    const onFormSubmit = async ( data ) => {
        console.log(data)
        setEditing(data.id ? true : false);
        setLoading( true );
        try {
            const url = editing ? `${ BASE_URL }/bandiTransfer/update_bandi_final_transfer/${ data.id }` :
                `${ BASE_URL }/bandiTransfer/create_bandi_final_transfer1`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios( {
                method, url, data: data,
                params:{status},
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

    const { records: bandis, optrecords: bandisOpt, loading: bandisLoading, refetch: fetchBandiForTransfer } = useFetchBandiForTransfer( { status } );

    useEffect( () => {
        if ( status === 'sent_by_clerk' && bandis.length > 0 ) {
            const bandi = bandis[0];
            setValue('id', bandi?.id);
            setValue( 'decision_date', bandi?.decision_date );
            setValue( 'apply_date', bandi?.apply_date || formattedDateNp );
            setValue( 'transfer_from_date', bandi?.transfer_from_date );
            setValue( 'proposed_karagar_office', bandi?.recommended_to_office_id );
            setValue( 'final_to_office_id', bandi?.recommended_to_office_id );
            setValue( 'reason_id', bandi?.transfer_reason_id || 100 );
            setValue( 'reason_details', bandi?.transfer_reason || '' );
            setValue( 'remarks', bandi?.remarks || '' );
        }
    }, [status, bandis, setValue] ); // ✅ don't include reason_id here

    // console.log(status)
    return (
        <>
            <Box>
                <Grid container spacing={2}>
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid size={{ xs: 12 }}>
                            <ReuseSelect
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                options={bandisOpt}
                                loading={bandisLoading}
                            />
                            {/* <ReuseBandi
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                current_office={authState.office_np}
                                type='allbandi'
                            /> */}
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <BandiKaidTable bandi_id={bandi_id} />
                            <BandiAddressTable bandi_id={bandi_id} />
                            <BandiMuddaTable bandi_id={bandi_id} />
                            <FamilyTable bandi_id={bandi_id} />
                        </Grid>

                        <hr />
                        <Grid container size={{ xs: 12 }}>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='decision_date'
                                    label='निर्णय मिति'
                                    required={true}
                                    placeholder={'YYYY-MM-DD'}
                                    control={control}
                                    errors={errors.decision_date}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='apply_date'
                                    label='कार्यान्वयन मिति'
                                    placeholder={'YYYY-MM-DD'}
                                    required={true}
                                    control={control}
                                    errors={errors.apply_date}
                                />
                            </Grid>

                            {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name='nirnay_officer'
                                    label='निर्णय गर्ने अधिकारी'
                                    control={control}
                                    errors={errors.nirnay_officer}
                                />
                            </Grid> */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseKaragarOffice
                                    name='proposed_karagar_office'
                                    label='स्थानान्तरण गर्न प्रस्तावित कारागार'
                                    options={relativeOptions}
                                    control={control}
                                    required={true}
                                    errors={errors.proposed_karagar_office}
                                />
                            </Grid>
                            {status === 'sent_by_clerk' && (

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseKaragarOffice
                                        name='final_to_office_id'
                                        label='स्थानान्तरण भएको कारागार'
                                        options={relativeOptions}
                                        control={control}
                                        required={true}
                                        errors={errors.final_to_office_id}
                                    />
                                </Grid>
                            )}
                        </Grid>
                        <Grid container size={{ xs: 12 }}>
                            <Grid size={{ xs: 3 }}>
                                <ReuseSelect
                                    name='reason_id'
                                    label='कारण'
                                    options={releaseRecordsOptions}
                                    control={control}
                                    required={true}
                                    errors={errors.reason_id}
                                />
                            </Grid>
                            <Grid size={{ xs: 9 }}>
                                <ReuseInput
                                    name='reason_details'
                                    label='कारण विवरण'
                                    control={control}
                                    errors={errors.reason_details}
                                    required={reason_id === 100}
                                />
                            </Grid>
                        </Grid>
                        <Grid container size={{ xs: 12 }}>
                            <Grid size={{ xs: 12 }}>
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

export default BandiTransferForm;