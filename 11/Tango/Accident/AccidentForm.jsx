import React, { lazy, Suspense, useEffect, useState, useTransition } from 'react'
import { useTheme } from '@emotion/react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import NepaliDate from 'nepali-datetime'
import { Box, Grid2 as Grid, Grid2, InputLabel, TextField } from '@mui/material'
import { useBaseURL } from '../../../Context/BaseURLProvider' // Import the custom hook for base URL
const AccidentForm = () => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem('token');
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();

    return (
        <>
            <Box sx={{ flexGrow: 1, margin: 5 }}>
                <Grid2 container spacing={4}>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <InputLabel id="office">कारागारको नाम</InputLabel>
                        <TextField id="standard-basic" size='small' />
                    </Grid2>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>
                    <Grid2 item xs={12} sm={4} md={3} mt={2}>
                        <label htmlFor="name">Name</label>
                        <input type='text' name='name' />
                    </Grid2>
                </Grid2>

            </Box>
        </>
    )
}

export default AccidentForm
