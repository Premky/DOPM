import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios'
import { Box, Button, Divider, Grid2, IconButton, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

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
import ReuseBandi from '../ReuseableComponents/ReuseBandi';


const BandiFamilyForm = () => {
    const BASE_URL = useBaseURL();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const [editing, setEditing] = useState(false);
    const [isLoading, startTransition] = useTransition();

    const selectedState = watch("state_id"); // Get the selected state value
    const selectedDistrict = watch("district_id"); // Get the selected district value
    const selectedmarried_status = watch("married_status");
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

    useEffect(() => {
        fetchBandiType();
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
                        <h4>बन्दीको थप विवरण दाखिला</h4>
                    </Grid2>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseBandi
                                name='bandi_id'
                                label='कैदीबन्दीको नाम'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='citizenship_no'
                                label='नागरिकता नं.'
                                control={control}
                                error={errors.citizenship_no}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='issue_date'
                                label='जारी मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={false}
                                control={control}
                                error={errors.issue_date}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='issue_district'
                                label='जारी जिल्ला'
                                required={false}
                                control={control}
                                error={errors.issue_district}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='relative_name'
                                label='नजिकको आफन्तको नाम'
                                required={true}
                                control={control}
                                error={errors.relative_name}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='address'
                                label='नजिकको आफन्तको ठेगाना'
                                control={control}
                                error={errors.relative_address}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='relative_contact_no'
                                label='नजिकको आफन्तको सम्पर्क नं.'
                                control={control}
                                error={errors.relative_contact_no}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='married_status'
                                label='बैवाहिक अवस्था'
                                options={[{ label: 'विवाहित', value: 1 }, { label: 'अविवाहित', value: 0 }]}
                                required={true}
                                control={control}
                                error={errors.married_status}
                            />
                        </Grid2>
                        {selectedmarried_status == 1 && (
                            <>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseInput name='husband_wife_name'
                                        label='पति/पत्निको नामथर'
                                        required={true}
                                        control={control}
                                        error={errors.husband_wife_name}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ReuseInput name='no_of_children'
                                        type='number'
                                        label='बच्चाहरुको संख्या'
                                        required={true}
                                        control={control}
                                        error={errors.no_of_children}
                                    />
                                </Grid2>
                            </>
                        )}
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='father_name'
                                label='बाबुको नामथर'
                                required={true}
                                control={control}
                                error={errors.father_name}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='mother_name'
                                label='आमाको नामथर'
                                required={true}
                                control={control}
                                error={errors.mother_name}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput name='grand_father_name'
                                label='बाजेको नामथर'
                                required={true}
                                control={control}
                                error={errors.grand_father_name}
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

export default BandiFamilyForm