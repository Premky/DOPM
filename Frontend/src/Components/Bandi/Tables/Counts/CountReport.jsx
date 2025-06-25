import axios from 'axios'
import NepaliDate from 'nepali-datetime'
import React, { lazy, Suspense, useEffect, useState, useTransition } from 'react'
import { useController, useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useBaseURL } from '../../../../Context/BaseURLProvider'
import { useAuth } from '../../../../Context/AuthContext'
import { Grid2, Box, Typography, Button, TextField } from '@mui/material'
import ReuseDateField from '../../../ReuseableComponents/ReuseDateField'
import ReuseKaragarOffice from '../../../ReuseableComponents/ReuseKaragarOffice'
import ReusePayroleStatus from '../../../ReuseableComponents/ReusePayroleStatus'
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect'

import { exportToExcel } from './ExportCountToExcel'
// import {NepaliDatePicker} from 'nepali-datepicker-reactjs'
// import 'nepali-datepicker-reactjs/dist/index.css'

const current_date = new NepaliDate().format('YYYY-MM-DD');
const fyy = new NepaliDate().format('YYYY');
const fm = new NepaliDate().format('MM');
const fy = fyy + '-4-1';

const LazyCountAcMuddaTableBody = lazy(() => import('./CountAcMuddaTable'));

const CountReport = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { control, watch, handleSubmit } = useForm();

    const [isLoading, startTransition] = useTransition();
    const [records, setRecords] = useState([]);
    const [totals, setTotals] = useState({
        KaidiMale: 0,
        KaidiFemale: 0,
        ThunuwaMale: 0,
        ThunuwaFemale: 0,
        TotalAashrit: 0,
        Total: 0,
    });

    const selectedOffice = watch('searchOffice');
    const startDate = watch('startDate');
    const endDate = watch('endDate');

    const fetchRecords = async (data) => {
        try {
            const url = `${BASE_URL}/bandi/get_prisioners_count`;
            console.log(selectedOffice)
            const queryParams = new URLSearchParams({
                startDate: data?.startDate || current_date,
                endDate: data?.endDate || current_date,
                office_id: selectedOffice || '', // Optional filter
                nationality: data?.nationality || '',     // Optional filter
                ageFrom: data?.ageFrom || '',             // Optional filter
                ageTo: data?.ageTo || '',                 // Optional filter
            });

            // console.log(office_id)
            const fullUrl = `${url}?${queryParams.toString()}`;
            console.log("Fetching URL:", fullUrl);

            const response = await axios.get(fullUrl, { withCredentials: true });

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Result?.length > 0) {
                    setRecords(Result);
                    calculateTotals(Result);
                } else {
                    console.warn("No Record Found");
                    setRecords([]);
                }
            } else {
                console.error(Error || 'Failed to fetch bandi count record.');
            }
        } catch (error) {
            console.error('Error fetching bandi count record:', error);
        }
    };


    const calculateTotals = (data) => {
        const totals = data.reduce(
            (acc, record) => ({
                KaidiTotal: acc.KaidiTotal + (parseInt(record.KaidiTotal) || 0),
                ThunuwaTotal: acc.ThunuwaTotal + (parseInt(record.ThunuwaTotal) || 0),
                KaidiMale: acc.KaidiMale + (parseInt(record.KaidiMale) || 0),
                KaidiFemale: acc.KaidiFemale + (parseInt(record.KaidiFemale) || 0),
                ThunuwaMale: acc.ThunuwaMale + (parseInt(record.ThunuwaMale) || 0),
                ThunuwaFemale: acc.ThunuwaFemale + (parseInt(record.ThunuwaFemale) || 0),
                SumOfArrestedInDateRange: acc.SumOfArrestedInDateRange + (parseInt(record.TotalArrestedInDateRange) || 0),
                SumOfReleasedInDateRange: acc.SumOfReleasedInDateRange + (parseInt(record.TotalReleasedInDateRange) || 0),
                ThunuwaAgeAbove65: acc.ThunuwaAgeAbove65 + (parseInt(record.ThunuwaAgeAbove65) || 0),
                Nabalak: acc.Nabalak + (parseInt(record.Nabalak) || 0),
                Nabalika: acc.Nabalika + (parseInt(record.Nabalika) || 0),
                Total: acc.Total + (parseInt(record.Total) || 0),
            }),
            {
                KaidiTotal: 0, ThunuwaTotal: 0, KaidiMale: 0, KaidiFemale: 0, ThunuwaMale: 0, ThunuwaFemale: 0,
                SumOfArrestedInDateRange: 0, SumOfReleasedInDateRange: 0, ThunuwaAgeAbove65: 0, Nabalak: 0, Nabalika: 0, Total: 0
            }
        );
        setTotals(totals);
    };

    const ExportCountReport = async()=>{
        await exportToExcel(startDate, endDate, records, totals, fy, fm, current_date);
    };

    useEffect(() => {
        startTransition(() => {
            fetchRecords({ startDate, endDate, selectedOffice });
        });
    }, [startDate, endDate, selectedOffice]);

    const onSubmit = (formData) => {
        fetchRecords(formData);
    };

    
    return (
        <>

            <Grid2 container >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {/* Welcome {authState.user} from {authState.office_np} */}
                    </Typography>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid2 container spacing={2}>
                            <Grid2 xs={12} sm={4}>
                                <ReuseKaragarOffice
                                    name="searchOffice"
                                    label="Office"
                                    control={control}
                                    disabled={authState.office_id >= 3}
                                />
                            </Grid2>

                            <Grid2 xs={12} sm={4}>
                                {/* <Controller
                                    name="nationality"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Nationality"
                                            variant="outlined"
                                        />
                                    )}
                                /> */}
                                <ReuseSelect
                                    name="nationality"
                                    label='राष्ट्रियता'
                                    options={[
                                        { label: 'स्वदेशी', value: 'स्वदेशी' },
                                        { label: 'विदेशी', value: 'बिदेशी' }
                                    ]}
                                    control={control}
                                />
                            </Grid2>

                            <Grid2 xs={6} sm={3}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Start Date (BS)"
                                            fullWidth
                                            type="text"
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={6} sm={3}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="End Date (BS)"
                                            fullWidth
                                            type="text"
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={6} sm={3}>
                                <Controller
                                    name="ageFrom"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Min Age"
                                            fullWidth
                                            type="number"
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={6} sm={3}>
                                <Controller
                                    name="ageTo"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Max Age"
                                            fullWidth
                                            type="number"
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={12}>
                                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                                    रिपोर्ट लिई ल्याउनुहोस्
                                </Button>
                                <Button onClick={ExportCountReport} variant="outlined" sx={{ mt: 2, ml: 2 }}>
                                    एक्सेल निर्यात
                                </Button>
                            </Grid2>
                        </Grid2>
                    </form>
                </Box>
            </Grid2>
            <Grid2 container>
                <Suspense fallback={<div>Loading...</div>}>
                    {!isLoading && <LazyCountAcMuddaTableBody records={records} totals={totals} />}
                </Suspense>
            </Grid2>
        </>
    )
}

export default CountReport