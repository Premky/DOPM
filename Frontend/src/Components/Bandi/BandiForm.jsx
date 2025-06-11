import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios'
import { Box, Button, Divider, Grid2, IconButton, InputLabel, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import NepaliDate from 'nepali-datetime'

import ReuseCountry from '../ReuseableComponents/ReuseCountry'
import ReuseState from '../ReuseableComponents/ReuseState'
import ReuseDistrict from '../ReuseableComponents/ReuseDistrict'
import ReuseMunicipality from '../ReuseableComponents/ReuseMunicipality'
import ReuseInput from '../ReuseableComponents/ReuseInput'
import ReuseVehicles from '../ReuseableComponents/ReuseVehciles'
import ReuseSelect from '../ReuseableComponents/ReuseSelect'
import ReuseDateField from '../ReuseableComponents/ReuseDateField'
import Swal from 'sweetalert2'
import RemoveIcon from '@mui/icons-material/Remove';
import ReuseOffice from '../ReuseableComponents/ReuseOffice';
import ReuseMudda from '../ReuseableComponents/ReuseMudda';
import { Label } from '@mui/icons-material';


const BandiForm = () => {
    const BASE_URL = useBaseURL();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const [editing, setEditing] = useState(false);
    const [isLoading, startTransition] = useTransition();

    const selectedState = watch("state_id"); // Get the selected state value
    const selectedDistrict = watch("district_id"); // Get the selected district value
    const selectedBandiType = watch("bandi_type");
    const selectedNagrik = watch("nagrik");
    const selectedIs_fine = watch("is_fine");
    const selectedIs_fine_paid = watch("is_fine_paid");
    const selectedIs_compensation = watch("is_compensation");
    const selectedIs_compensation_paid = watch("is_compensation_paid");
    const selectedIs_bigo = watch("is_bigo");
    const selectedIs_bigo_paid = watch("is_bigo_paid");

    const [is_bandi, setIs_Bandi] = useState(1);
    const [bandiType, setBandiType] = useState([]);
    const [muddaCount, setMuddaCount] = useState(1);
    const [calcKaidDuration, setCalcKaidDuration] = useState();
    const [calcBerujuDuration, setCalcBerujuDuration] = useState();

    const arrestDate = watch('arrest_date');
    const kaidDate = watch('kaid_date');
    const releaseDate = watch('release_date');

    const calculateKaidDuration = () => {
        if (arrestDate && releaseDate) {
            const kaidduration = calculateDateDetails(arrestDate, releaseDate);
            setCalcKaidDuration(kaidduration)
            const berujuduration = calculateDateDetails(releaseDate, formattedDateNp);
            setCalcBerujuDuration(berujuduration)
            console.log(formattedDateNp)
        }
    };


    const calculateDateDetails = (startDateStr, endDateStr) => {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (isNaN(startDate) || isNaN(endDate)) return null;

        let totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (totalDays < 0) totalDays = 0;

        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return {
            years,
            months,
            days,
            totalDays,
        };
    };

    // Nepali Date
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const day = npToday.getDay();
    const weekDays = ['आइतवार', 'सोमवार', 'मङ्‍गलवार', 'बुधवार', 'बिहिवार', 'शुक्रवार', 'शनिवार'];
    const dayName = weekDays[day];


    const fetchBandiType = async () => {
        try {
            const url = `${BASE_URL}/public/get_bandi_type`;
            const response = await axios.get(url);

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    const formatted = Result.map((opt) => ({
                        label: opt.bandi_type_name, // Use Nepali name
                        value: opt.id, // Use ID as value
                        // state_id: opt.state_id, // Store state_id to filter
                    }));
                    setBandiType(formatted);
                    // console.log('type:', bandiType)
                } else {
                    console.log('No bandi types records found.');
                }
            } else {
                console.log(Error || 'Failed to fetch bandi types.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    const [band_rand_id, setBand_rand_id] = useState('');
    const fetchRandomBandiId = async () => {
        const response = await axios.get(`${BASE_URL}/bandi/get_random_bandi_id`)
        const { Status, Result, Error } = response.data;
        // console.log(response.data.Result)
        setBand_rand_id(response.data.Result)
    }
    useEffect(() => {
        fetchBandiType();
        fetchRandomBandiId();
    }, []);



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

    const ram = () => {
        console.log('prem')
    }
    return (
        <>
            <Box sx={{ flexGrow: 1, margin: 2 }}>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <Grid2>
                        <h4>नयाँ बन्दी दाखिला</h4>
                    </Grid2>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseOffice
                                name='office'
                                label='कार्यालयको नामः'
                                control={control}
                                error={errors.office}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='cn'
                                label='च.नं.'
                                control={control}
                                error={errors.cn}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='cn_date'
                                label='पत्र मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={false}
                                control={control}
                                error={errors.cn_date}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>

                            <InputLabel htmlFor='regd'>कैदी दर्ता नं.</InputLabel>

                            <input
                                name='regd'
                                id='regd'
                                readOnly
                                value={band_rand_id}
                            />

                            {errors?.regd && (
                                <div style={{ color: 'red', fontSize: '12px' }}>{errors.regd.message}</div>
                            )}

                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='regd_date'
                                label='दर्ता मिति'
                                placeholder={'YYYY-MM-DD'}
                                control={control}
                                error={errors.regd_date}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='file'
                                label='पत्र'
                                type='file'
                                control={control}
                                error={errors.cn}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='dakhila_date'
                                label='दाखिला मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={true}
                                control={control}
                                error={errors.dakhila_date}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='entry_type'
                                label='दाखिला किसिम'
                                options={[{label:'नयाँ बन्दी थप', value:'1'}, {label:'सरुवा भई आएको', value:'5'}]}
                                required={true}
                                control={control}
                                error={errors.entry_type}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='bandi_type'
                                label='बन्दी किसिम'
                                options={bandiType}
                                required={true}
                                control={control}
                                error={errors.bandi_type}
                            />
                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bandi_name'
                                label='बन्दीको नाम'
                                required={true}
                                control={control}
                                error={errors.bandi_name}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='gender'
                                label='लिङ्ग'
                                options={[{ label: 'पुरुष', value: 'M' }, { label: 'महिला', value: 'F' }, { label: 'अन्य', value: 'O' },]}
                                required={true}
                                control={control}
                                error={errors.gender}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='bandi_dob'
                                label='जन्म मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={true}
                                control={control}
                                error={errors.bandi_dob}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='nagrik'
                                label='नागरीक'
                                options={[{ label: 'स्वदेशी', value: 1 }, { label: 'विदेशी', value: 2 }]}
                                required={true}
                                control={control}
                                error={errors.nagrik}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseCountry
                                name='nationality'
                                label='राष्ट्रियता'
                                required={true}
                                defaultValue={selectedNagrik === 1 ? 1 : ''}
                                readonly={selectedNagrik === 1 ? 'True' : 'False'}
                                control={control}
                                error={errors.nationality}
                            />
                        </Grid2>
                    </Grid2>
                    {selectedNagrik === 1 && (
                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                                <ReuseState
                                    name='state_id'
                                    label='प्रदेश'
                                    required={true}
                                    control={control}
                                    error={errors.state_id}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                                <ReuseDistrict
                                    name='district_id'
                                    label='जिल्ला'
                                    required
                                    control={control}
                                    error={errors.district_id}
                                    selectedState={selectedState}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                                <ReuseMunicipality
                                    required
                                    name='municipality_id'
                                    label='गा.पा./न.पा./उ.न.पा./म.न.पा.'
                                    control={control}
                                    error={errors.municipality_id}
                                    options={''}
                                    selectedDistrict={selectedDistrict}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name='ward'
                                    label='वडा नं.'
                                    type='number'
                                    required={true}
                                    control={control}
                                    error={errors.ward}
                                />
                            </Grid2>
                        </Grid2>
                    )}
                    {selectedNagrik === 2 && (

                        <Grid2 size={{ xs: 6, sm: 6, md: 12 }}>
                            <ReuseInput
                                name={`bideshi_nagrik_address`}
                                label='विदेशी नागरीकको ठेगाना र विवरण'
                                required={true}
                                control={control}
                                error={errors[`bideshi_nagrik_address`]}
                            />
                        </Grid2>
                    )}

                    <Grid2 container spacing={1}>
                        {[...Array(muddaCount)].map((_, index) => (
                            <Grid2 container spacing={1} marginTop={2} key={index} size={{ xs: 12 }}>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseMudda
                                        name={`mudda_${index + 1}`}
                                        label='मुद्दा'
                                        required={true}
                                        control={control}
                                        error={errors[`mudda_${index + 1}`]}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 10, sm: 4, md: 2 }}>
                                    <ReuseInput
                                        name={`mudda_no_${index + 1}`}
                                        label='मुद्दा नं.'
                                        required={true}
                                        control={control}
                                        error={errors[`mudda_no_${index + 1}`]}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 10, sm: 4, md: 2 }}>
                                    <ReuseInput
                                        name={`vadi_${index + 1}`}
                                        label='वादी वा जाहेरवालाको नाम'
                                        required={true}
                                        control={control}
                                        error={errors[`vadi_${index + 1}`]}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 10, sm: 4, md: 2 }}>
                                    <ReuseSelect
                                        name={`is_main_mudda_${index + 1}`}
                                        label='मुख्य मुददा हो/होइन?'
                                        required={true}
                                        control={control}
                                        options={[
                                            { label: 'होइन', value: 0 },
                                            { label: 'हो', value: 1 }
                                        ]}
                                        error={errors[`is_main_mudda_${index + 1}`]}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 1, sm: 1, md: 1 }} marginTop={5}>
                                    <Button variant="contained" color="secondary" size='small'
                                        type="button" onClick={() => setMuddaCount(muddaCount + 1)}>+</Button>
                                </Grid2>
                                <Grid2 size={{ xs: 1, sm: 1, md: 1 }} marginTop={5}>
                                    {muddaCount > 1 ?
                                        <Button variant="contained" color="warning" size='small' spacing={1}
                                            type="button" onClick={() => setMuddaCount(muddaCount - 1)}><RemoveIcon /></Button>
                                        : null}
                                </Grid2>
                            </Grid2>
                        ))}


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
                                required={true}
                                control={control}
                                error={errors.release_date}
                                onChange={calculateKaidDuration}
                            />
                        </Grid2>

                        <Grid2 container size={{ xs: 12, sm: 6, md: 3 }}>
                            <Grid2 xs={12} sm={6} md={3}>
                                <div>
                                    <p>कैद अवधि </p>
                                    {`${calcKaidDuration?.years || 0} | ${calcKaidDuration?.months || 0} | ${calcKaidDuration?.days || 0}`}
                                </div>

                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <div>
                                    <p>कैद अवधि </p>
                                    {`${calcBerujuDuration?.years || 0} | ${calcBerujuDuration?.months || 0} | ${calcBerujuDuration?.days || 0}`}
                                </div>
                            </Grid2>
                        </Grid2>


                    </Grid2>

                    <>
                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseOffice
                                    name='last_faisala_office'
                                    label='मुद्दाको अन्तिम कारवाही गर्ने निकाय'
                                    required={true}
                                    control={control}
                                    error={errors.last_faisala_office}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='last_faisala_date'
                                    label='फैसला मिति'
                                    placeholder='YYYY-MM-DD'
                                    required={true}
                                    control={control}
                                    error={errors.last_faisala_date}
                                />
                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 12 }}>
                                पुनरावेदन नपरेको प्रमाण
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseOffice
                                    name='no_punravedn_office'
                                    label='पुनरावेदन नपरेको कार्यालय'
                                    required={true}
                                    control={control}
                                    error={errors.no_punravedn_office}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDistrict
                                    name='no_punravedn_district'
                                    label='पुनरावेदन नपरेको जिल्ला'
                                    required={true}
                                    control={control}
                                    error={errors.no_punravedn_district}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseInput
                                    name='no_punravedn_cn'
                                    label='च.नं.'
                                    required={true}
                                    control={control}
                                    error={errors.no_punravedn_cn}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseDateField
                                    name='no_punravedn_date'
                                    label='पुनरावेदन मिति'
                                    placeholder='YYYY-MM-DD'
                                    required={true}
                                    control={control}
                                    error={errors.no_punravedn_date}
                                />
                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={1}>
                            <Grid2 size={{ xs: 12 }}>
                                जरिवाना रकम तोकिएको छ वा छैं‍न
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                <ReuseSelect
                                    name='is_fine'
                                    label='छ/छैन'
                                    options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                    required={true}
                                    control={control}
                                    error={errors.is_fine}
                                />
                            </Grid2>
                            {selectedIs_fine === 1 && (
                                <>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='fine_amt'
                                            label='रकम'
                                            required={true}
                                            control={control}
                                            error={errors.fine_amt}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseSelect
                                            name='is_fine_paid'
                                            label='तिरेको छ/छैन'
                                            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                            required={true}
                                            control={control}
                                            error={errors.is_fine_paid}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseOffice
                                            name='fine_paid_office'
                                            label='जरिवाना तिरेको कार्यालय'
                                            required={true}
                                            control={control}
                                            error={errors.fine_paid_office}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDistrict
                                            name='fine_paid_office_district'
                                            label='जरिवाना तिरेको जिल्ला'
                                            required={true}
                                            control={control}
                                            error={errors.fine_paid_office_district}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='fine_paid_cn'
                                            label='च.नं.'
                                            required={true}
                                            control={control}
                                            error={errors.fine_paid_cn}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDateField
                                            name='fine_paid_date'
                                            label='जरिवाना तिरेको मिति'
                                            placeholder='YYYY-MM-DD'
                                            required={true}
                                            control={control}
                                            error={errors.fine_paid_date}
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
                                    name='is_compensation'
                                    label='छ/छैन'
                                    options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                    required={true}
                                    control={control}
                                    error={errors.is_compensation}
                                />
                            </Grid2>

                            {selectedIs_compensation == 1 && (
                                <>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='compensation_amt'
                                            label='रकम'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_amt}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseSelect
                                            name='is_compensation_paid'
                                            label='तिरेको छ/छैन'
                                            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                            required={true}
                                            control={control}
                                            error={errors.is_compensation_paid}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseOffice
                                            name='compensation_paid_office'
                                            label='क्षतिपुर्ती तिरेको कार्यालय'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_paid_office}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDistrict
                                            name='compensation_paid_office_district'
                                            label='क्षतिपुर्ती तिरेको जिल्ला'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_paid_office_district}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='compensation_paid_cn'
                                            label='च.नं.'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_paid_cn}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDateField
                                            name='compensation_paid_date'
                                            label='क्षतिपुर्ती तिरेको मिति'
                                            placeholder='YYYY-MM-DD'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_paid_date}
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
                                    name='is_bigo'
                                    label='छ/छैन'
                                    options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                    required={true}
                                    control={control}
                                    error={errors.is_bigo}
                                />
                            </Grid2>

                            {selectedIs_bigo == 1 && (
                                <>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='bigo_amt'
                                            label='रकम'
                                            required={true}
                                            control={control}
                                            error={errors.compensation_amt}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseSelect
                                            name='is_bigo_paid'
                                            label='तिरेको छ/छैन'
                                            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                            required={true}
                                            control={control}
                                            error={errors.is_bigo_paid}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseOffice
                                            name='bigo_paid_office'
                                            label='बिगो तिरेको कार्यालय'
                                            required={true}
                                            control={control}
                                            error={errors.bigo_paid_office}
                                        />
                                    </Grid2>

                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDistrict
                                            name='bigo_paid_office_district'
                                            label='बिगो तिरेको जिल्ला'
                                            required={true}
                                            control={control}
                                            error={errors.bigo_paid_office_district}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseInput
                                            name='bigo_paid_cn'
                                            label='च.नं.'
                                            required={true}
                                            control={control}
                                            error={errors.bigo_paid_cn}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                        <ReuseDateField
                                            name='bigo_paid_date'
                                            label='बिगो तिरेको मिति'
                                            placeholder='YYYY-MM-DD'
                                            required={true}
                                            control={control}
                                            error={errors.bigo_paid_date}
                                        />
                                    </Grid2>
                                </>
                            )}

                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='remarks'
                                label='कैफियत'
                                // required={true}
                                control={control}
                                error={errors.remarks}
                            />
                        </Grid2>
                    </>
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary" disabled={isLoading} onClick={handleSubmit(onFormSubmit)} >
                            {/* {loading ? 'Submitting...' : editing ? 'Update Employee' : 'Add Employee'} */}submit
                        </button>
                        <div className="col mb-3">
                            {/* <button className='btn btn-danger' onClick={handleClear}>Clear</button> */}
                        </div>
                    </div>
                </form>
            </Box>

        </>
    )
}

export default BandiForm