import { Box, Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseMudda from '../../ReuseableComponents/ReuseMudda';
import ReuseDistrict from '../../ReuseableComponents/ReuseDistrict';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReusePayroleBandi from '../../ReuseableComponents/ReusePayroleBandi';
import ReusableTable from '../../ReuseableComponents/ReuseTable';
import PayroleLogTable from '../Tables/PayroleLogTable';
import fetchPayroleLogs from '../../ReuseableComponents/fetchPayroleLog';
import Swal from 'sweetalert2';
import axios from 'axios';

const PayroleLogForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const {
        handleSubmit,
        watch,
        setValue,
        register,
        reset,
        control,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: '', // ✅ this was missing!
            office_bandi_id: '',
            hajir_status: '',
            hajir_current_date: null,
            hajir_next_date: null,
            hajir_office: '',
            no_hajir_reason: '',
            no_hajir_mudda: '',
            no_hajir_mudda_district: '',
            no_hajir_reason_office_type: '',
            no_hajir_is_pratibedan: '',
            no_hajir_is_aadesh: '',
            office_name: '',
            hajir_remarks: '',
        },
    } );

    // Destructure watched fields for clarity    
    const hajir_status = watch( 'hajir_status' );
    const no_hajir_reason = watch( 'no_hajir_reason' );
    const no_hajir_reason_office_type = watch( 'no_hajir_reason_office_type' );
    const no_hajir_is_pratibedan = watch( 'no_hajir_is_pratibedan' );
    const bandi_id = watch( 'bandi_id' );
    const { records: logRecords, optrecords: optLogRecords, loading: logLoadig } = fetchPayroleLogs( bandi_id );


    const [editing, setEditing] = useState( false );
    const onSubmit = async ( data ) => {
        const payload = {
            ...data,
            ...( data.hajir_status !== '2' && {
                no_hajir_reason: '',
                no_hajir_mudda: '',
                no_hajir_mudda_district: '',
                no_hajir_reason_office_type: '',
                no_hajir_is_pratibedan: '',
                no_hajir_is_aadesh: '',
                office_name: '',
            } ),
        };

        try {
            const url = editing
                ? `${ BASE_URL }/payrole/update_payrole/${ currendData.id }`
                : `${ BASE_URL }/payrole/create_payrole_log`;
            const method = editing ? 'PUT' : 'POST';

            // const formData = new FormData();
            // for ( const key in payload ) {
            //     formData.append( key, payload[key] );
            // }

            const response = await axios( {
                method,
                url,
                data: payload,
                // headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            } );


            const { Status, Result, Error } = response.data;
            if ( Status ) {
                Swal.fire( 'थपियो!', 'रेकर्ड सफलतापूर्वक थपियो', 'success' );
                const payrole_id = Result;
                reset();
                setEditing( false );
            } else {
                Swal.fire( 'त्रुटि!', Error || 'रेकर्ड थप्न सकिएन', 'error' );
            }
        } catch ( error ) {
            console.log( 'Error submitting form:', error );
            Swal.fire( 'त्रुटि!', 'डेटा बुझाउँदा समस्या आयो ।', 'error' );
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit( onSubmit )}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <ReusePayroleBandi
                        name="bandi_id"
                        label="कैदीको नामथर, ठेगाना, मुद्दा"
                        control={control}
                        required={true}
                    />
                </Grid>

                <Grid container size={{ sm: 6 }} spacing={2}>
                    <Grid size={{ sm: 6 }}>
                        <ReuseDateField
                            name="hajir_current_date"
                            label="हाजिर मिति"
                            placeholder="YYYY-MM-DD"
                            control={control}
                            required={true}
                        />
                    </Grid>
                    <Grid size={{ sm: 6 }}>
                        <ReuseSelect
                            name="hajir_status"
                            label="उपस्थित/अनुउपस्थित"
                            options={[
                                { label: 'उपस्थित', value: '1' },
                                { label: 'अनुउपस्थित', value: '2' },
                                { label: 'कैद भुक्तान', value: '3' },
                            ]}
                            control={control}
                            required={true}
                        />
                    </Grid>
                </Grid>
                {hajir_status !== '3' && ( <>
                    <Grid size={{ sm: 6 }}>
                        <ReuseDateField
                            name="hajir_next_date"
                            label="हाजिर हुने मिति"
                            placeholder="YYYY-MM-DD"
                            control={control}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseKaragarOffice
                            name="hajir_office"
                            label="हाजिर हुने कार्यालय"
                            control={control}
                        />
                    </Grid>
                </> )}



                {hajir_status === '2' && (
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseSelect
                                required
                                name="no_hajir_reason"
                                label="अनुपश्थितिको कारण"
                                options={[
                                    { label: 'फरार', value: 'फरार' },
                                    {
                                        label: 'अन्य मुद्दामा थुना/हिरासतमा रहेको',
                                        value: 'अन्य मुद्दामा थुना/हिरासतमा रहेको',
                                    },
                                ]}
                                control={control}
                            />
                        </Grid>

                        {no_hajir_reason === 'अन्य मुद्दामा थुना/हिरासतमा रहेको' && (
                            <>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseMudda
                                        required
                                        name="no_hajir_mudda"
                                        label="मुद्दा"
                                        control={control}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseDistrict
                                        required
                                        name="no_hajir_mudda_district"
                                        label="थुना/हिरासतमा रहेको जिल्ला"
                                        control={control}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseSelect
                                        required
                                        name="no_hajir_reason_office_type"
                                        label="थुना/हिरासतमा रहेको कार्यालय"
                                        options={[
                                            { label: 'कारागार', value: 'कारागार' },
                                            { label: 'अन्य', value: 'अन्य' },
                                        ]}
                                        control={control}
                                    />
                                </Grid>

                                {no_hajir_reason_office_type === 'कारागार' ? (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <ReuseKaragarOffice
                                            required
                                            name="office_name"
                                            label="कारागारको नाम"
                                            control={control}
                                        />
                                    </Grid>
                                ) : (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <ReuseInput
                                            required
                                            name="office_name"
                                            label="कार्यालयको नाम"
                                            control={control}
                                        />
                                    </Grid>
                                )}
                            </>
                        )}

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseSelect
                                required
                                name="no_hajir_is_pratibedan"
                                label="सुरु अदालतमा प्रतिवेदन पेश गरे/नगरेको"
                                options={[
                                    { label: 'गरेको', value: '1' },
                                    { label: 'नगरेको', value: '0' },
                                ]}
                                control={control}
                            />
                        </Grid>

                        {no_hajir_is_pratibedan === '1' && (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ReuseSelect
                                    required
                                    name="no_hajir_is_aadesh"
                                    label="सुरु अदालतबाट आदेश भए/नभएको"
                                    options={[
                                        { label: 'भएको', value: '1' },
                                        { label: 'नभएको', value: '0' },
                                    ]}
                                    control={control}
                                />
                            </Grid>
                        )}
                    </>
                )}

                <Grid size={{ xs: 12 }}>
                    <ReuseInput
                        name="hajir_remarks"
                        label="कैफियत"
                        control={control}
                    />
                </Grid>

                <Grid xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                        सेभ गर्नुहोस्
                    </Button>
                </Grid>
            </Grid>
            <Grid container>
                <PayroleLogTable records={logRecords} />

            </Grid>
        </Box>
    );
};

export default PayroleLogForm;