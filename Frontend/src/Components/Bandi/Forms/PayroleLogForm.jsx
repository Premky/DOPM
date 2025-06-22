import { Box, Grid2 } from '@mui/material'
import React from 'react'
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import { ErrorSharp } from '@mui/icons-material';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseMudda from '../../ReuseableComponents/ReuseMudda';
import ReuseDistrict from '../../ReuseableComponents/ReuseDistrict';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import ReusePayroleBandi from '../../ReuseableComponents/ReusePayroleBandi';

const PayroleLogForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const {
        handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm({
            defaultValues: {
                office_bandi_id: '',
                // other fields...
            },
        });

    const hajir_status = watch('hajir_status');
    const no_hajir_reason = watch('no_hajir_reason');
    const no_hajir_reason_office_type = watch('no_hajir_reason_office_type');
    const no_hajir_is_pratibedan = watch('no_hajir_is_pratibedan');

    return (
        <>
            <Box>
                <form>
                    <Grid2 container>
                        <Grid2 size={{ xs: 12 }}>
                            <ReusePayroleBandi
                                name='bandi_id'
                                label='कैदीको नामथर, ठेगाना, मुद्दा'
                                control={control}
                            />
                        </Grid2>

                        <Grid2 container size={{ xs: 12, sm: 6, md: 4 }}>
                            <Grid2 size={{ xs: 6 }}>
                                <ReuseDateField
                                    name='hajir_current_date'
                                    label='हाजिर मिति'
                                    placeholder='YYYY-MM-DD'
                                    control={control}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 6 }}>
                                <ReuseSelect
                                    name='hajir_status'
                                    label='उपस्थित/अनुउपस्थित'
                                    options={[{ label: 'उपस्थित', value: '1' }, { label: 'अनुउपस्थित', value: '2' }, { label: 'कैद भुक्तान', value: '3' }]}
                                    control={control}
                                />
                            </Grid2>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseDateField
                                name='hajir_next_date'
                                label='हाजिर हुने मिति'
                                placeholder='YYYY-MM-DD'
                                control={control}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseKaragarOffice
                                name='hajir_office'
                                label='हाजिर हुने कार्यालय'
                                control={control}
                            />
                        </Grid2>

                        {hajir_status == '2' && (<>
                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <ReuseSelect
                                    required={true}
                                    name='no_hajir_reason'
                                    label='अनुपश्थितिको कारण'
                                    options={[
                                        { label: 'फरार', value: 'फरार' },
                                        { label: 'अन्य मुद्दामा थुना/हिरासतमा रहेको', value: 'अन्य मुद्दामा थुना/हिरासतमा रहेको' }
                                    ]}
                                    control={control}
                                />
                            </Grid2>
                            {no_hajir_reason == 'अन्य मुद्दामा थुना/हिरासतमा रहेको' && (<>
                                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseMudda
                                        required={true}
                                        name='no_hajir_mudda'
                                        label='मुद्दा'
                                        control={control}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseDistrict
                                        required={true}
                                        name='no_hajir_mudda_district'
                                        label='थुना/हिरासतमा रहेको जिल्ला'
                                        control={control}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseSelect
                                        required={true}
                                        name='no_hajir_reason_office_type'
                                        label='थुना/हिरासतमा रहेको कार्यालय'
                                        options={[
                                            { label: 'कारागार', value: 'कारागार' },
                                            { label: 'अन्य', value: 'अन्य' }
                                        ]}
                                        control={control}
                                    />
                                </Grid2>
                                {no_hajir_reason_office_type == 'कारागार' ? (<>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                        <ReuseKaragarOffice
                                            required={true}
                                            name='office_name'
                                            label='कारागारको नाम'
                                            control={control}
                                        />
                                    </Grid2>
                                </>) : (<>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                        <ReuseInput
                                            required={true}
                                            name='office_name'
                                            label='कार्यालयको नाम'
                                            control={control}
                                        />
                                    </Grid2>
                                </>)}

                            </>)}

                            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                <ReuseSelect
                                    required={true}
                                    name='no_hajir_is_pratibedan'
                                    label='सुरु अदालतमा प्रतिवेदन पेश गरे/नगरेको'
                                    options={[
                                        { label: 'गरेको', value: '1' },
                                        { label: 'नगरेको', value: '0' }
                                    ]}
                                    control={control}
                                />
                            </Grid2>
                            {no_hajir_is_pratibedan == '1' && (
                                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReuseSelect
                                        required={true}
                                        name='no_hajir_is_aadesh'
                                        label='सुरु अदालतबाट आदेश भए/नभएको'
                                        options={[
                                            { label: 'भएको', value: '1' },
                                            { label: 'नभएको', value: '0' }
                                        ]}
                                        control={control}
                                    />
                                </Grid2>
                            )}
                        </>)}

                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                            <ReuseInput
                                name='hajir_remarks'
                                label='कैफियत'
                                control={control}
                            />
                        </Grid2>
                    </Grid2>
                </form>
            </Box>

        </>
    )
}

export default PayroleLogForm;