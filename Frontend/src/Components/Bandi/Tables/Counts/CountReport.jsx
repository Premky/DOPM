import axios from 'axios'
import NepaliDate from 'nepali-datetime'
import React, { lazy, Suspense, useEffect, useState, useTransition } from 'react'
import { useController, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useBaseURL } from '../../../../Context/BaseURLProvider'
import { useAuth } from '../../../../Context/AuthContext'
import { Grid2 } from '@mui/material'
import ReuseDateField from '../../../ReuseableComponents/ReuseDateField'
import ReuseKaragarOffice from '../../../ReuseableComponents/ReuseKaragarOffice'
// import {NepaliDatePicker} from 'nepali-datepicker-reactjs'
// import 'nepali-datepicker-reactjs/dist/index.css'

const current_date = new NepaliDate().format('YYYY-MM-DD');
const fyy = new NepaliDate().format('YYYY');
const fm = new NepaliDate().format('MM');
const fy = fyy + '-4-1';

const LazyCountAcMuddaTableBody = lazy(() => import('./CountAcMuddaTable'));

const CountReport = () => {
    const BASE_URL = useBaseURL();

    const { control, watch } = useForm();

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

    const fetchRecords = async (data) => {
        try {
            const url = `${BASE_URL}/bandi/get_prisioners_count`;
            const queryParams = new URLSearchParams({
                startDate: data?.startDate || current_date,
                endDate: data?.endDate || current_date, // <-- FIXED this line
            }).toString();


            const fullUrl = `${url}?${queryParams}`;
            console.log(fullUrl)
            const response = await axios.get(fullUrl, {
                withCredentials: true
            });
            const { Status, Result, Error } = response.data;
            console.log(Result)
            if (Status) {
                if (Result?.length > 0) {
                    setRecords(Result);
                    calculateTotals(Result);
                } else {
                    console.error("No Record Found")
                }
            } else {
                console.error(Error || 'Failed to fetch bandi count record.')
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

    const selectedOffice = watch('selectedOffice');
    const startDate = watch('startDate');
    const endDate = watch('endDate');

    useEffect(() => {
        startTransition(() => {
            fetchRecords({ startDate, endDate, selectedOffice });
        });
    }, [startDate, endDate, selectedOffice]);

    return (
        <>
            <Grid2 container >
                <Grid2 size={{ xs: 12 }}>
                    कैदीबन्दीको संख्यात्मक विवरण
                </Grid2>
                <Grid2 container size={{ xs: 12 }}>
                    <Grid2 size={{ sm: 6, md: 3 }}>
                        <ReuseKaragarOffice
                            name='selectedOffice'
                            label='कार्यालय'
                            control={control}
                        />
                    </Grid2>
                    <Grid2 size={{ sm: 6, md: 3 }}>
                        <ReuseDateField
                            name='startDate'
                            label='देखी'
                            control={control}
                        />
                    </Grid2>
                    <Grid2 size={{ sm: 6, md: 3 }}>
                        <ReuseDateField
                            name='endDate'
                            label='सम्म'
                            control={control}
                        />
                    </Grid2>
                </Grid2>
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