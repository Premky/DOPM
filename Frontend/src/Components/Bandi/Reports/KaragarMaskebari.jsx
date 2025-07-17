import React, { useMemo, useState } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
// import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
// import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';
// import TotalReleaseDetails from '../Tables/ForMaskebari/TotalReleaseDetails';
// import CountAcMuddaTable from '../Tables/Counts/CountAcMuddaTable';
import TotalCountAc2Mudda from '../Tables/ForMaskebari/TotalCountAc2Mudda';
// import TotalofAllFields from '../Tables/ForMaskebari/TotalofAllFields';

import fetchAllReleaseCounts from '../../ReuseableComponents/fetchAllReleaseCounts';
// import fetchMuddaWiseCount from '../../ReuseableComponents/fetchMuddaWiseCount';
import fetchMuddaGroupWiseCount from '../Apis_to_fetch/fetchMuddaGroupWiseCount';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../Context/AuthContext';
import { exportToExcel } from '../Exports/ExcelMaskebariCount';
import NepaliDate from 'nepali-datetime';

const KaragarMaskebari = () => {
    const { state: authState } = useAuth();
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
    const fy_date = fy + '-04-01';

    const { records: releaseRecords, loading: releaseRecordsLoading } = fetchAllReleaseCounts();


    const { control, watch, handleSubmit } = useForm();
    // console.log( muddawisetotal );
    // console.log( releaseRecords );
    const selectedOffice = watch( 'searchOffice' );
    const nationality = watch( 'nationality' );
    const startDate = watch( 'startDate' );
    const endDate = watch( 'endDate' );

    const filters = useMemo( () => ( {
        startDate: startDate || current_date,
        endDate: endDate || current_date,
        nationality: nationality || '',
        selectedOffice: selectedOffice || ''
    } ), [startDate, endDate, nationality, selectedOffice, current_date] );

    const {
        records: muddawiseCount,
        muddawisetotal,
        loading: muddawiseCountLoading
    } = fetchMuddaGroupWiseCount( { filters } );

    const swadeshiFilters = useMemo( () => ( {
        startDate: startDate || current_date,
        endDate: endDate || current_date,
        nationality: 'स्वदेशी',
        selectedOffice: selectedOffice || ''
    } ), [startDate, endDate, selectedOffice, current_date] );

    const bideshiFilters = useMemo( () => ( {
        startDate: startDate || current_date,
        endDate: endDate || current_date,
        nationality: 'विदेशी',
        selectedOffice: selectedOffice || ''
    } ), [startDate, endDate, selectedOffice, current_date] );

    const {
        records: swadeshiCount,
        muddawisetotal: swadeshiTotal,
        loading: swadeshiLoading
    } = fetchMuddaGroupWiseCount( { filters: swadeshiFilters } );

    const {
        records: bideshiCount,
        muddawisetotal: bideshiTotal,
        loading: bideshiLoading
    } = fetchMuddaGroupWiseCount( { filters: bideshiFilters } );



    const totals = {
        regular_this_month:
            ( parseInt( releaseRecords[0]?.this_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.this_month?.Total || 0 ) ),

        regular_till_last_month:
            ( parseInt( releaseRecords[0]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[0]?.this_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.this_month?.Total || 0 ) ),

        payroll_till_this_month: ( parseInt( releaseRecords[2]?.this_month?.Total || 0 ) ),

        mafi_this_month: parseInt( releaseRecords[3]?.this_month?.Total || 0 ),

        mafi_till_now:
            ( parseInt( releaseRecords[3]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[3]?.this_month?.Total || 0 ) ),

        kaam_this_month: parseInt( releaseRecords[4]?.this_month?.Total || 0 ),
        kaam_till_now:
            ( parseInt( releaseRecords[4]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[4]?.this_month?.Total || 0 ) ),

        this_month_155: parseInt( releaseRecords[5]?.this_month?.Total || 0 ),
        till_now_155:
            ( parseInt( releaseRecords[5]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[5]?.this_month?.Total || 0 ) ),

        this_month_transfer: parseInt( releaseRecords[6]?.this_month?.Total || 0 ),
        this_month_death: parseInt( releaseRecords[7]?.this_month?.Total || 0 ),
        this_month_active: parseInt( releaseRecords[8]?.till_last_month?.Total || 0 ),
        this_month_added: parseInt( releaseRecords[9]?.this_month?.Total || 0 ),
        this_month_dependent: parseInt( releaseRecords[10]?.this_month?.Total || 0 ),

    };

    // console.log(releaseRecords)

    return (
        <div>
            <Grid container >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {/* Welcome {authState.user} from {authState.office_np} */}
                    </Typography>

                    <form
                    // onSubmit={handleSubmit( onSubmit )}
                    >
                        <Grid container spacing={2}>
                        {authState.office_id==1 || authState.office_id==2 && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ReuseKaragarOffice
                                    name="searchOffice"
                                    label="Office"
                                    control={control}
                                    name_type='short'
                                    disabled={authState.office_id >= 3}
                                />
                            </Grid>
                        )}

                            {/* <Grid size={{ xs: 12, sm: 4 }}>
                                <ReuseSelect
                                    name="nationality"
                                    label='राष्ट्रियता'
                                    options={[
                                        { label: 'स्वदेशी', value: 'स्वदेशी' },
                                        { label: 'विदेशी', value: 'बिदेशी' }
                                    ]}
                                    control={control}
                                />
                            </Grid> */}

                            {/* <Grid container size={{ xs: 12, sm: 4 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <ReuseDatePickerBS
                                        name="startDate"
                                        control={control}
                                        label="देखी"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <ReuseDatePickerBS
                                        name="endDate"
                                        control={control}
                                        label="सम्म"
                                    />
                                </Grid>
                            </Grid>

                            <Grid xs={6} sm={3}>
                                <Controller
                                    name="ageFrom"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField
                                            {...field}
                                            label="Min Age"
                                            fullWidth
                                            type="number"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={6} sm={3}>
                                <Controller
                                    name="ageTo"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField
                                            {...field}
                                            label="Max Age"
                                            fullWidth
                                            type="number"
                                        />
                                    )}
                                />
                            </Grid> */}

                            <Grid xs={12}>
                                {/* <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                                    रिपोर्ट लिई ल्याउनुहोस्
                                </Button> */}
                                <Button onClick={() => exportToExcel(
                                    releaseRecords,
                                    swadeshiCount,
                                    swadeshiTotal,
                                    bideshiCount,
                                    bideshiTotal,
                                    '2082/2083',
                                    '<महिनाको>'
                                )}
                                    variant='contained'
                                    color='success'
                                >Download</Button>

                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Grid>
            {/* <Grid container sx={{ marginTop: 1 }}>
                <TotalofAllFields totals={totals} />
            </Grid>

            <Grid container sx={{ marginTop: 1 }}>
                <TotalReleaseDetails totals={totals} />
            </Grid> */}
            <Grid container sx={{ marginTop: 1 }}>
                स्वदेशी बन्दीहरुको संख्या
            </Grid>
            <Grid container sx={{ marginTop: 1 }}>
                {/* <CountAcMuddaTable /> */}
                <TotalCountAc2Mudda muddawiseCount={swadeshiCount} muddawisetotal={swadeshiTotal} />
            </Grid>
            <Grid container sx={{ marginTop: 1 }}>
                विदेशी बन्दीहरुको संख्या
            </Grid>
            <Grid container sx={{ marginTop: 1 }}>
                {/* <CountAcMuddaTable /> */}
                <TotalCountAc2Mudda muddawiseCount={bideshiCount} muddawisetotal={bideshiTotal} />
            </Grid>
        </div>
    );
};

export default KaragarMaskebari;