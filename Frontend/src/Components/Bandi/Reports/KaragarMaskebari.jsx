import React, { useState } from 'react';
import { Grid2 } from '@mui/material';
import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';
import TotalReleaseDetails from '../Tables/ForMaskebari/TotalReleaseDetails';
import CountAcMuddaTable from '../Tables/Counts/CountAcMuddaTable';
import TotalCountAc2Mudda from '../Tables/ForMaskebari/TotalCountAc2Mudda';
import TotalofAllFields from '../Tables/ForMaskebari/TotalofAllFields';

import fetchAllReleaseCounts from '../../ReuseableComponents/fetchAllReleaseCounts';
import fetchMuddaWiseCount from '../../ReuseableComponents/fetchMuddaWiseCount';

const KaragarMaskebari = () => {
    const { records: releaseRecords, loading: releaseRecordsLoading } = fetchAllReleaseCounts();
    const { records: muddawiseCount, loading: muddawiseCountLoading } = fetchMuddaWiseCount();

    console.log( muddawiseCount );


    const totals = {
        regular_this_month:
            ( parseInt( releaseRecords[0]?.this_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.this_month?.Total || 0 ) ),

        regular_till_last_month:
            ( parseInt( releaseRecords[0]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[0]?.this_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[1]?.this_month?.Total || 0 ) ),

        kaam_this_month: parseInt( releaseRecords[5]?.this_month?.Total || 0 ),

        kaam_till_now:
            ( parseInt( releaseRecords[5]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[5]?.this_month?.Total || 0 ) ),

        mafi_this_month: parseInt( releaseRecords[4]?.this_month?.Total || 0 ),

        mafi_till_now:
            ( parseInt( releaseRecords[4]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[4]?.this_month?.Total || 0 ) ),

        this_month_155: parseInt( releaseRecords[4]?.this_month?.Total || 0 ),

        till_now_155:
            ( parseInt( releaseRecords[4]?.till_last_month?.Total || 0 ) ) +
            ( parseInt( releaseRecords[4]?.this_month?.Total || 0 ) ),

        // active_count_till_now: releaseRecords[8]. 
    };



    return (
        <div>
            <Grid2 container>

            </Grid2>
            <Grid2 container sx={{ marginTop: 1 }}>
                <TotalofAllFields totals={totals} />
            </Grid2>

            <Grid2 container sx={{ marginTop: 1 }}>
                <TotalReleaseDetails totals={totals} />
            </Grid2>

            <Grid2 container sx={{ marginTop: 1 }}>
                {/* <CountAcMuddaTable /> */}
                <TotalCountAc2Mudda muddawiseCount={muddawiseCount} muddawisetotal={muddawisetotal} />
            </Grid2>
        </div>
    );
};

export default KaragarMaskebari;