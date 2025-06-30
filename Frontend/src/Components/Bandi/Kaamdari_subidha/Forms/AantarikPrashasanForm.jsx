import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Grid2, Box } from '@mui/material'
import { useBaseURL } from '../../../../Context/BaseURLProvider'
import { useAuth } from '../../../../Context/AuthContext'
import { useForm } from 'react-hook-form'


import ReuseKaragarOffice from '../../../ReuseableComponents/ReuseKaragarOffice'

const AantarikPrashasanForm = () => {
    const BASE_URL = useBaseURL();
    const {state: authState} = useAuth();

    const {
        handleSubmit, watch, setValue, control, formState:{errors}
    } = useForm()

    
    return (
        <>
            <Box>
                <Grid2 container>
                    <Grid2 size={{ xs: 12 }}>आन्तिरक प्रशासन दाखिला</Grid2>
                    <Grid2 container size={{ xs: 12 }}>
                        <Grid2 size={{ xs: 3 }}>
                            <ReuseKaragarOffice
                                name='office_id'
                                label='कार्यालय'
                                control={control}
                                error={errors.office_id}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 size={{ xs: 12 }}>
                        sadfa
                    </Grid2>
                </Grid2>
            </Box>
        </>
    )
}

export default AantarikPrashasanForm