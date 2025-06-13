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
import ReuseBandi from '../ReuseableComponents/ReuseBandi';


const BandiReleaseForm = () => {
    const BASE_URL = useBaseURL();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoading, startTransition] = useTransition();

    const selected_bandid_id = watch("bandi_name");

    const [is_bandi, setIs_Bandi] = useState(1);

    // Nepali Date
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const day = npToday.getDay();
    const weekDays = ['आइतवार', 'सोमवार', 'मङ्‍गलवार', 'बुधवार', 'बिहिवार', 'शुक्रवार', 'शनिवार'];
    const dayName = weekDays[day];

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


    const [selectedBandi, setSelectedBandi] = useState({}); // Assuming it's an object, not an array

    useEffect(() => {
        const fetch = async () => {
            if (selected_bandid_id) {
                const url = `${BASE_URL}/bandi/get_selected_bandi/${selected_bandid_id}`;
                const result = await fetchData(url);
                if (result.success && result.data) {
                    setSelectedBandi(result.data);
                    setValue('mudda', result.data.mudda_id); // 👈 set mudda value manually
                } else {
                    setSelectedBandi({});
                    setValue('mudda', ''); // reset mudda if no result
                }
            }
        };
        fetch();
    }, [selected_bandid_id, setValue]);


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
                        <h4>बन्दी कैदमुक्त दाखिला</h4>
                    </Grid2>
                    <Grid2 container spacing={1}>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='bandi_activity_type'
                                label='थुनामुक्त किसिम'
                                options={[
                                    { label: 'अदालतको आदेश वा नियमित कैद मुक्त', value: 6 },
                                    { label: 'मुलुकी फौजदारी १५५ बमोजिम कैद मुक्त', value: 7 },
                                    { label: 'कामदारी सुविधाबाट कैद मुक्त', value: 8 },
                                    { label: 'प्यारोलबाट कैद मुक्त', value: 9 }
                                ]}
                                required={true}
                                control={control}
                                error={errors.office}
                            />
                        </Grid2>
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
                    </Grid2>

                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12 }}>
                            पत्रको विवरणः
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseOffice
                                name='receive_from_office_id'
                                label='कार्यालयको नाम'
                                required={true}
                                control={control}
                                error={errors.receive_from_office_id}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='cn'
                                label='पत्रको च.नं.'
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
                            <ReuseBandi
                                name='bandi_name'
                                label='बन्दीको नाम'
                                required={true}
                                control={control}
                                error={errors.bandi_name}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMudda
                                name={`mudda`}
                                label='मुद्दा'
                                defaultValue={selectedBandi.mudda_id}
                                required={true}
                                control={control}
                                setValue={setValue}  // 👈 this is necessary
                                error={errors[`mudda`]}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 10, sm: 4, md: 2 }}>
                            <ReuseInput
                                name={`mudda_no`}
                                label='मुद्दा नं.'
                                defaultValue={selectedBandi.mudda_no}
                                required={true}
                                control={control}
                                error={errors[`mudda_no`]}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 10, sm: 4, md: 2 }}>
                            <ReuseInput
                                name={`vadi`}
                                label='वादी वा जाहेरवालाको नाम'
                                required={true}
                                control={control}
                                error={errors[`vadi`]}
                            />
                        </Grid2>

                    </Grid2>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bujhiline_person_name'
                                label='बुझिलिनेको विवरण नाम'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_name}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bujhiline_person_contact_no'
                                label='बुझिलिनेको सम्पर्क नं.'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_contact_no}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bujhiline_person_address'
                                label='बुझिलिनेको विवरण नाम'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_address}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bujhiline_person_relation'
                                label='बुझिलिनेको विवरण नाम'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_relation}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='bujhiline_person_document_no'
                                label='बुझिलिनेको ना.प्र.नं./रा.नं./ला.नं.'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_document_no}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='bujhiline_person_document_issue_dist'
                                label='जारी जिल्ला'
                                required={true}
                                control={control}
                                error={errors.bujhiline_person_document_issue_dist}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='signature_by_id'
                                label='हस्ताक्षर गर्ने'
                                required={true}
                                control={control}
                                error={errors.signature_by_id}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='remark'
                                label='हस्ताक्षर गर्ने'
                                required={true}
                                control={control}
                                error={errors.name = 'remark'}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={1}>
                        <ReuseSelect
                            name='template_letter_type_id'
                            label='पत्रको किसिम'
                            options={[
                                { label: 'अदालतको आदेश वा नियमित कैद मुक्त', value: 6 },
                                { label: 'मुलुकी फौजदारी १५५ बमोजिम कैद मुक्त', value: 7 },
                                { label: 'कामदारी सुविधाबाट कैद मुक्त', value: 8 },
                                { label: 'प्यारोलबाट कैद मुक्त', value: 9 }
                            ]}
                            required={true}
                            control={control}
                            error={errors.template_letter_type_id}
                        />
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
            </Box>

        </>
    )
}

export default BandiReleaseForm