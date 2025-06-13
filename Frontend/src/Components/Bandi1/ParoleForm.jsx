import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios'
import { Box, Button, Divider, Grid2, IconButton, InputLabel, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import NepaliDate from 'nepali-datetime'
import { calculateDateDetails } from '../../../Utils/dateCalculator';
import ReuseSelect from '../ReuseableComponents/ReuseSelect';
import ReuseParoleCount from '../ReuseableComponents/ReuseParoleCount';
import ReuseDateField from '../ReuseableComponents/ReuseDateField';
import ReuseBandi from '../ReuseableComponents/ReuseBandi';
import ReuseInput from '../ReuseableComponents/ReuseInput';
import ReuseDistrict from '../ReuseableComponents/ReuseDistrict';
import ReuseState from '../ReuseableComponents/ReuseState';
import ReuseMunicipality from '../ReuseableComponents/ReuseMunicipality';
import ReuseMudda from '../ReuseableComponents/ReuseMudda';
import ReuseOffice from '../ReuseableComponents/ReuseOffice';


const ParoleForm = () => {
    const BASE_URL = useBaseURL();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoading, startTransition] = useTransition();
    const [calcKaidDuration, setCalcKaidDuration] = useState();
    const [calcBhuktanDuration, setCalcBhuktanDuration] = useState();
    const [calcBerujuDuration, setCalcBerujuDuration] = useState();

    const selectedState = watch("state_id"); // Get the selected state value
    const selectedDistrict = watch("district_id"); // Get the selected district value
    const arrestDate = watch('arrest_date');
    const kaidDate = watch('kaid_date');
    const releaseDate = watch('release_date');
    const selected_jariwana_amount_fixed = watch("jariwana_amount_fixed");
    const selectedIs_fine_paid = watch("is_fine_paid");
    const selectedkashtipurti_amount_fixed = watch("kashtipurti_amount_fixed");
    const selectedIs_compensation_paid = watch("is_compensation_paid");
    const selectedbigo_and_kosh_amount_fixed = watch("bigo_and_kosh_amount_fixed");
    const selectedIs_bigo_paid = watch("is_bigo_paid");

    const bandi_name_id = watch('bandi_name');
    const bandi_dob = watch('bandi_dob');
    const selectedno_punravedn_office = watch('no_punravedn_office');

    // Nepali Date
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const day = npToday.getDay();
    const weekDays = ['आइतवार', 'सोमवार', 'मङ्‍गलवार', 'बुधवार', 'बिहिवार', 'शुक्रवार', 'शनिवार'];
    const dayName = weekDays[day];

    const calculateKaidDuration = () => {
        if (arrestDate && releaseDate) {
            const arrestAd = new NepaliDate(arrestDate).getDateObject(); // Convert BS → JS Date
            const releaseAd = new NepaliDate(releaseDate).getDateObject();
            const todayAd = new NepaliDate(formattedDateNp).getDateObject();

            const kaidDuration = calculateDateDetails(arrestAd, releaseAd);
            const bhuktanDuration = calculateDateDetails(arrestAd, todayAd, kaidDuration);
            const berujuDuration = calculateDateDetails(todayAd, releaseAd, kaidDuration);

            setCalcKaidDuration(kaidDuration);
            setCalcBhuktanDuration(bhuktanDuration);
            setCalcBerujuDuration(berujuDuration);

            console.log('kaidDurPer', berujuDuration)
        }
    };


    const fetchData = async (url, params = {}) => {
        try {
            setLoading(true);

            const response = await axios.get(url, {
                params,
                withCredentials: true,
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                return { success: true, data: Result };
            } else {
                console.error(Error || 'Failed to fetch records');
                return { success: false, data: null };
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            return { success: false, data: null };
        } finally {
            setLoading(false);
        }
    };

    const [selectedBandi, setSelectedBandi] = useState({});
    useEffect(() => {
        const fetch = async () => {
            if (bandi_name_id) {
                const url = `${BASE_URL}/bandi/get_selected_bandi/${bandi_name_id}`;
                const result = await fetchData(url);
                if (result.success && result.data) {
                    setSelectedBandi(result.data);
                    console.log(selectedBandi)

                    // 👇 Set other values manually
                    setValue('bandi_dob', result.data.dob || '');
                    setValue('state_id', result.data.province || '');
                    setValue('district_id', result.data.district_id || '');
                    setValue('gapa_napa_id', result.data.gapa_napa_id || '');
                    setValue('mudda_id', result.data.mudda_id || '');
                    setValue('mudda_no', result.data.mudda_no || '');
                    setValue('wardno', result.data.wardno || '');
                    setValue('mudda_phesala_antim_office_id', result.data.mudda_phesala_antim_office_id || '');
                    setValue('mudda_phesala_antim_office_date', result.data.mudda_phesala_antim_office_date || '');
                    setValue('punarabedan_office_name', result.data.punarabedan_office_name || '');
                    setValue('punarabedan_office_district', result.data.punarabedan_office_district || '');
                    setValue('punarabedan_office_date', result.data.punarabedan_office_date || '');
                    setValue('jariwana_amount_fixed', result.data.jariwana_amount_fixed || '');
                    setValue('jariwana_amount_deoposite_district', result.data.jariwana_amount_deoposite_district || '');
                    setValue('is_fine_paid', result.data.is_fine_paid || '');

                } else {
                    setSelectedBandi({});
                    setValue('bandi_dob', '');
                    setValue('state_id', 0);
                    setValue('district_id', 0);
                    setValue('gapa_napa_id', 0);
                    setValue('mudda_id', '');
                    setValue('mudda_no', '');
                    setValue('wardno', '');
                    setValue('mudda_phesala_antim_office_id', '');
                    setValue('mudda_phesala_antim_office_date', '');
                    setValue('punarabedan_office_name', '');
                    setValue('punarabedan_office_district', '');
                    setValue('punarabedan_office_date', '');
                    setValue('jariwana_amount_fixed', '');
                    setValue('jariwana_amount_deoposite_district', '');
                    setValue('is_fine_paid', '');
                }
            }
        };
        fetch();
    }, [bandi_name_id, BASE_URL, setValue]);


    const onFormSubmit = async (data) => {
        // console.log('Form Data:', data);
        try {
            const url = editing ? `${BASE_URL}/bandi/update_bandi/${currentData.id}` :
                `${BASE_URL}/bandi/create_bandi`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios({
                method,
                url,
                data,
                // headers: {Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data",},
                withCredentials: true
            });
            const { Status, Result, Error } = response.data;
            if (Status) {
                alert('Data submitted successfully!');

                reset(); // Reset the form after successful submission
                setEditing(false); // Reset editing state
                fetchAccidentRecords(); // Fetch updated records
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form.');
        }
    }
    return (
        <>
            <Box sx={{ flexGrow: 1, margin: 2 }}>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <Grid2>
                        <h4>प्यारोल दाखिला</h4>
                    </Grid2>

                    <Grid2 container spacing={1}>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseParoleCount
                                name='payrole_no_id'
                                label='प्यारोल संख्या'
                                required={true}
                                control={control}
                                error={errors.payrole_no_id}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='payrole_ganana_date'
                                label='गणना मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={true}
                                control={control}
                                error={errors.payrole_calculation_date}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='payrole_entry_date'
                                label='दाखिला मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={true}
                                control={control}
                                error={errors.dakhila_date}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseBandi
                                name='bandi_name'
                                label='बन्दीको नाम'
                                required={true}
                                control={control}
                                error={errors.bandi_name}
                            />
                        </Grid2>

                        <Grid2 container size={{ xs: 12, sm: 6, md: 3 }}>
                            <Grid2 size={{ xs: 9, sm: 9, md: 9 }}>
                                <ReuseDateField
                                    name='bandi_dob'
                                    label='जन्म मिती'
                                    placeholder={'YYYY-MM-DD'}
                                    defaultValue={selectedBandi.dob}
                                    required={true}
                                    control={control}
                                    error={errors.bandi_dob}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                                <ReuseInput
                                    name='age'
                                    label='जन्म मिती'
                                    defaultValue={selectedBandi.age}
                                    required={true}
                                    control={control}
                                    error={errors.age}
                                />
                            </Grid2>

                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseState
                                name='state_id'
                                label='प्रदेश'
                                required={true}
                                control={control}
                                error={errors.state_id}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='district_id'
                                label='जिल्ला'
                                required={true}
                                control={control}
                                error={errors.district_id}
                            />
                        </Grid2>
                        <Grid2 container size={{ xs: 12, sm: 6, md: 3 }}>
                            <Grid2 size={{ xs: 9, sm: 9, md: 9 }}>
                                <ReuseMunicipality
                                    name='gapa_napa_id'
                                    label='गाउँपालिका/नगरपालिका'
                                    required={true}
                                    control={control}
                                    error={errors.gapa_napa_id}
                                    selectedDistrict={watch('district_id')}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                                <ReuseInput
                                    name='wardno'
                                    label='वडा नं.'
                                    defaultValue={selectedBandi.wardno}
                                    required={true}
                                    control={control}
                                    error={errors.wardno}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMudda
                                name='mudda_id'
                                label='मुददा'
                                required={true}
                                control={control}
                                error={errors.mudda_id}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                            <ReuseInput
                                name='mudda_no'
                                label='मुद्दा नं.'
                                defaultValue={selectedBandi.mudda_no}
                                required={true}
                                control={control}
                                error={errors.mudda_no}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                            <ReuseInput
                                name='wadi'
                                label='मुद्दा नं.'
                                defaultValue={selectedBandi.wadi}
                                required={true}
                                control={control}
                                error={errors.wadi}
                            />
                        </Grid2>

                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 12 }}>
                                हिरासत, छुट्टिजाने, जम्मा सजाय
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='arrest_date'
                                    label='हिरासत परेको मिति'
                                    placeholder={'YYYY-MM-DD'}
                                    defaultValue={selectedBandi.arrest_date}
                                    required={true}
                                    control={control}
                                    error={errors.arrest_date}
                                    onChange={calculateKaidDuration} // ✅ this triggers the diff calc
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='kaid_date'
                                    label='कैद वा थुनामा परेको मिति'
                                    placeholder={'YYYY-MM-DD'}
                                    defaultValue={selectedBandi.kaid_date}
                                    required={true}
                                    control={control}
                                    error={errors.kaid_date}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='release_date'
                                    label='छुटीजाने मिति'
                                    placeholder={'YYYY-MM-DD'}
                                    defaultValue={selectedBandi.release_date}
                                    required={true}
                                    control={control}
                                    error={errors.release_date}
                                    onChange={calculateKaidDuration}
                                />
                            </Grid2>

                            <Grid2 container size={{ xs: 12, sm: 6, md: 3 }} onClick={calculateKaidDuration}>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <div>
                                        <p>कैद अवधि </p>
                                        {`${calcKaidDuration?.years || 0} | ${calcKaidDuration?.months || 0} | ${calcKaidDuration?.days || 0}`}
                                    </div>

                                </Grid2><Grid2 size={{ xs: 12, sm: 4 }}>
                                    <div>
                                        <p>भुक्तान अवधि</p>
                                        {calcBhuktanDuration
                                            ? `${calcBhuktanDuration.years || 0} | ${calcBhuktanDuration.months || 0} | ${calcBhuktanDuration.days || 0} (${calcBhuktanDuration.percentage || 0} %)`
                                            : "N/A"}
                                    </div>
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <div>
                                        <p>बाँकी अवधि</p>
                                        {calcBerujuDuration
                                            ? calcBerujuDuration.years > 0
                                                ? `${calcBerujuDuration.years || 0} | ${calcBerujuDuration.months || 0} | ${calcBerujuDuration.days || 0} (${calcBerujuDuration.percentage || 0} %)`
                                                : `${calcBerujuDuration.totalDays || 0} दिन (${calcBerujuDuration.percentage || 0} %)`
                                            : "N/A"}
                                    </div>
                                </Grid2>

                            </Grid2>

                            {/* <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                                <ReuseInput
                                    name='kaid_bhuktan_percentage'
                                    label='भुक्तान अवधी र प्रतिशत'
                                    defaultValue={selectedBandi.kaid_bhuktan_percentage}
                                    required={true}
                                    control={control}
                                    error={errors.kaid_bhuktan_percentage}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                                <ReuseInput
                                    name='banki_bhuktan_percentage'
                                    label='बाँकी अवधी र प्रतिशत'
                                    defaultValue={selectedBandi.banki_bhuktan_percentage}
                                    required={true}
                                    control={control}
                                    error={errors.banki_bhuktan_percentage}
                                />
                            </Grid2> */}


                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseOffice
                                    name='mudda_phesala_antim_office_id'
                                    label='मुद्दाको अन्तिम कारवाही गर्ने निकाय'
                                    required={true}
                                    control={control}
                                    error={errors.mudda_phesala_antim_office_id}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='mudda_phesala_antim_office_date'
                                    label='फैसला मिति'
                                    placeholder='YYYY-MM-DD'
                                    required={true}
                                    control={control}
                                    error={errors.mudda_phesala_antim_office_date}
                                />
                            </Grid2>

                            <Grid2 container spacing={1}>
                                <Grid2 size={{ xs: 12 }}>
                                    पुनरावेदन नपरेको प्रमाण
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseSelect
                                        name='punarabedan_office_name'
                                        label='पुनरावेदन नपरेको कार्यालय'
                                        options={[
                                            { label: 'सर्वोच्च अदालत', value: 'सर्वोच्च अदालत' },
                                            { label: 'जि.स.व.का.', value: 'जि.स.व.का.' },
                                            { label: 'उ.स.व.का.', value: 'उ.स.व.का.' },
                                            { label: 'महान्यायाधिवक्ताको कार्यालय', value: 'महान्यायाधिवक्ताको कार्यालय' },
                                            { label: 'वि.स.व.का.', value: 'वि.स.व.का.' }
                                        ]}
                                        required={true}
                                        control={control}
                                        error={errors.punarabedan_office_name}
                                    />
                                </Grid2>

                                {selectedno_punravedn_office !== 'सर्वोच्च अदालत' && (
                                    <>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDistrict
                                                name='punarabedan_office_district'
                                                label='पुनरावेदन नपरेको जिल्ला'
                                                required={true}
                                                control={control}
                                                error={errors.punarabedan_office_district}
                                            />
                                        </Grid2>
                                    </>
                                )}

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseInput
                                        name='punarabedan_office_ch_no'
                                        label='च.नं.'
                                        defaultValue={selectedBandi.punarabedan_office_ch_no}
                                        required={true}
                                        control={control}
                                        error={errors.punarabedan_office_ch_no}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseDateField
                                        name='punarabedan_office_date'
                                        label='प्रमाण मिति'
                                        placeholder='YYYY-MM-DD'
                                        required={true}
                                        control={control}
                                        error={errors.punarabedan_office_date}
                                    />
                                </Grid2>
                            </Grid2>
                            <Grid2 container spacing={1}>
                                <Grid2 size={{ xs: 12 }}>
                                    जरिवाना रकम तोकिएको छ वा छैं‍न
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseSelect
                                        name='jariwana_amount_fixed'
                                        label='छ/छैन'
                                        options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: 0 }]}
                                        required={true}
                                        control={control}
                                        error={errors.jariwana_amount_fixed}
                                    />
                                </Grid2>
                                {selected_jariwana_amount_fixed === 1 && (
                                    <>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='jariwana_amount_deoposite_amount'
                                                label='रकम'
                                                defaultValue={selectedBandi?.jariwana_amount_deoposite_amount || ""}
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deoposite_amount}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseSelect
                                                name='jariwana_amount_deposite'
                                                label='तिरेको छ/छैन'
                                                options={[{ label: 'छ', value: 'छ' }, { label: 'छैन', value: 'छैन' }]}
                                                // options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: 0 }]}
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deposite}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseOffice
                                                name='jariwana_amount_deoposite_office'
                                                label='जरिवाना तिरेको कार्यालय'
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deoposite_office}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDistrict
                                                name='jariwana_amount_deoposite_district'
                                                label='जरिवाना तिरेको जिल्ला'
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deoposite_district}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='jariwana_amount_deoposite_office_ch_no'
                                                label='च.नं.'
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deoposite_office_ch_no}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDateField
                                                name='jariwana_amount_deoposite_office_date'
                                                label='जरिवाना तिरेको मिति'
                                                placeholder='YYYY-MM-DD'
                                                required={true}
                                                control={control}
                                                error={errors.jariwana_amount_deoposite_office_date}
                                            />
                                        </Grid2>
                                    </>
                                )}
                            </Grid2>

                            <Grid2 container spacing={1}>
                                <Grid2 size={{ xs: 12 }}>
                                    क्षतिपुर्ती रकम तोकिएको छ वा छैं‍न
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseSelect
                                        name='kashtipurti_amount_fixed'
                                        label='छ/छैन'
                                        options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                        required={true}
                                        control={control}
                                        error={errors.kashtipurti_amount_fixed}
                                    />
                                </Grid2>

                                {selectedkashtipurti_amount_fixed == 1 && (
                                    <>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='kashtipurti_amount_deoposite_amount'
                                                label='रकम'
                                                required={true}
                                                control={control}
                                                error={errors.compensation_amt}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseSelect
                                                name='kashtipurti_amount_deposite'
                                                label='तिरेको छ/छैन'
                                                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                                required={true}
                                                control={control}
                                                error={errors.kashtipurti_amount_deposite}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseOffice
                                                name='kashtipurti_amount_deoposite_office'
                                                label='क्षतिपुर्ती तिरेको कार्यालय'
                                                required={true}
                                                control={control}
                                                error={errors.kashtipurti_amount_deoposite_office}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDistrict
                                                name='kashtipurti_amount_deoposite_district'
                                                label='क्षतिपुर्ती तिरेको जिल्ला'
                                                required={true}
                                                control={control}
                                                error={errors.kashtipurti_amount_deoposite_district}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='kashtipurti_amount_deoposite_office_ch_no'
                                                label='च.नं.'
                                                required={true}
                                                control={control}
                                                error={errors.kashtipurti_amount_deoposite_office_ch_no}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDateField
                                                name='kashtipurti_amount_deoposite_office_date'
                                                label='क्षतिपुर्ती तिरेको मिति'
                                                placeholder='YYYY-MM-DD'
                                                required={true}
                                                control={control}
                                                error={errors.kashtipurti_amount_deoposite_office_date}
                                            />
                                        </Grid2>
                                    </>
                                )}
                            </Grid2>

                            <Grid2 container spacing={1}>
                                <Grid2 size={{ xs: 12 }}>
                                    बिगो रकम तोकिएको छ वा छैं‍न
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseSelect
                                        name='bigo_and_kosh_amount_fixed'
                                        label='छ/छैन'
                                        options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                        required={true}
                                        control={control}
                                        error={errors.bigo_and_kosh_amount_fixed}
                                    />
                                </Grid2>

                                {selectedbigo_and_kosh_amount_fixed == 1 && (
                                    <>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='bigo_and_kosh_amount_deoposite_amount'
                                                label='रकम'
                                                required={true}
                                                control={control}
                                                error={errors.compensation_amt}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseSelect
                                                name='bigo_and_kosh_amount_deposite'
                                                label='तिरेको छ/छैन'
                                                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                                required={true}
                                                control={control}
                                                error={errors.bigo_and_kosh_amount_deposite}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseOffice
                                                name='bigo_and_kosh_amount_deoposite_office'
                                                label='बिगो तिरेको कार्यालय'
                                                required={true}
                                                control={control}
                                                error={errors.bigo_and_kosh_amount_deoposite_office}
                                            />
                                        </Grid2>

                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDistrict
                                                name='bigo_and_kosh_amount_deoposite_district'
                                                label='बिगो तिरेको जिल्ला'
                                                required={true}
                                                control={control}
                                                error={errors.bigo_paid_office_district}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseInput
                                                name='bigo_and_kosh_amount_deoposite_office_ch_no'
                                                label='च.नं.'
                                                required={true}
                                                control={control}
                                                error={errors.bigo_and_kosh_amount_deoposite_office_ch_no}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                            <ReuseDateField
                                                name='bigo_and_kosh_amount_deoposite_office_date'
                                                label='बिगो तिरेको मिति'
                                                placeholder='YYYY-MM-DD'
                                                required={true}
                                                control={control}
                                                error={errors.bigo_and_kosh_amount_deoposite_office_date}
                                            />
                                        </Grid2>
                                    </>
                                )}

                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={1}>

                            <ReuseInput
                                name='old_birami_asakt_status'
                                label='बृद्ध, रोगी वा अशक्त भए सो समेत उल्लेख गर्ने'
                                // required={true}
                                defaultValue={selectedBandi.old_birami_asakt_status}
                                control={control}
                                error={errors.old_birami_asakt_status}
                            />

                        </Grid2>



                    </Grid2>
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary" disabled={isLoading} onClick={handleSubmit(onFormSubmit)} >
                            {/* {loading ? 'Submitting...' : editing ? 'Update Employee' : 'Add Employee'} */}submit
                        </button>
                        <div className="col mb-3">
                            {/* <button className='btn btn-danger' onClick={handleClear}>Clear</button> */}
                        </div>
                    </div>
                </form>
            </Box >
        </>
    )
}

export default ParoleForm