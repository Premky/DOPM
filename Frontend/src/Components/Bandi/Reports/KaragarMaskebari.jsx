import React, { useMemo, useState } from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import TotalCountAc2Mudda from '../Tables/ForMaskebari/TotalCountAc2Mudda';
import fetchAllReleaseCounts from '../../ReuseableComponents/fetchAllReleaseCounts';
import fetchMuddaGroupWiseCount from '../Apis_to_fetch/fetchMuddaGroupWiseCount';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../Context/AuthContext';
import { exportToExcel } from '../Exports/ExcelMaskebariCount';
import NepaliDate from 'nepali-datetime';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const KaragarMaskebari = () => {
    const { state: authState } = useAuth();
    const office_np = authState.office_np;
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const fy = new NepaliDate().format( 'YYYY' ); //Support for filter
    const fy_date = fy + '-04-01';
    const monthNamesNp = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'];
    const { records: releaseRecords, loading: releaseRecordsLoading } = fetchAllReleaseCounts();


    const { control, watch, handleSubmit } = useForm();
    // console.log( muddawisetotal );
    // console.log( releaseRecords );
    const selectedOffice = watch( 'searchOffice' );
    const nationality = watch( 'nationality' );
    const startDate = watch( 'startDate' );
    const endDate = watch( 'endDate' );

    const filters = useMemo( () => ( {
        startDate: startDate,
        endDate: endDate,
        nationality: nationality || '',
        selectedOffice: selectedOffice || ''
    } ), [startDate, endDate, nationality, selectedOffice, current_date] );

    const validEndDate = endDate || current_date;
    const to_year = validEndDate.split( "-" )[0];
    const to_month_index = parseInt( validEndDate.split( "-" )[1], 10 ) - 1; // months are 0-indexed
    const monthName = monthNamesNp[to_month_index];
    // console.log( to_month_index );
    const {
        records: muddawiseCount,
        muddawisetotal,
        loading: muddawiseCountLoading
    } = fetchMuddaGroupWiseCount( { filters } );

    const swadeshiFilters = useMemo( () => ( {
        startDate: startDate,
        endDate: endDate,
        nationality: 'स्वदेशी',
        selectedOffice: selectedOffice || ''
    } ), [startDate, endDate, selectedOffice, current_date] );

    const bideshiFilters = useMemo( () => ( {
        startDate: startDate,
        endDate: endDate,
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
            <HelmetProvider>
                <Helmet>
                    <title>PMIS: कारागार मस्केबारी रिपोर्ट</title>
                    <meta name="description" content="कारागार मस्केबारी सम्बन्धि रिपोर्ट हेर्नुहोस्" />
                    <meta name="keywords" content="कारागार, मस्केबारी, रिपोर्ट, बन्दी, बन्दी संख्या, बन्दी विवरण" />
                    <meta name="author" content="कारागार व्यवस्थापन विभाग" />
                </Helmet>
            </HelmetProvider>
            <Grid container >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {/* Welcome {authState.user} from {authState.office_np} */}
                    </Typography>

                    <form
                    // onSubmit={handleSubmit( onSubmit )}
                    >
                        <Grid container spacing={2}>
                            {/* {authState.office_id} */}
                            {authState.office_id == 1 || authState.office_id == 2 && (
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

                            <Grid container size={{ xs: 12, sm: 6 }}>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <ReuseDateField
                                        name="startDate"
                                        control={control}
                                        placeholder={"देखी"}
                                        label="मिति"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <ReuseDateField
                                        name="endDate"
                                        control={control}
                                        placeholder={"सम्म"}
                                        label="–"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Button
                                        variant='contained'
                                        type='submit'
                                    >Search</Button>
                                </Grid>
                            </Grid>

                            {/*<Grid xs={6} sm={3}>
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
                                    // '2082/2083',
                                    to_year,
                                    monthName || '<महिना>',
                                    current_date,
                                    office_np
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