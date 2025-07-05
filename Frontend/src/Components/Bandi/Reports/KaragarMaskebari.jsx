import React from 'react';
import { Grid2 } from '@mui/material';
import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';
import TotalReleaseDetails from '../Tables/ForMaskebari/TotalReleaseDetails';
import CountAcMuddaTable from '../Tables/Counts/CountAcMuddaTable';
import TotalCountAc2Mudda from '../Tables/ForMaskebari/TotalCountAc2Mudda';
import TotalofAllFields from '../Tables/ForMaskebari/TotalofAllFields';
import fetchAllReleaseCounts from '../../ReuseableComponents/fetchAllReleaseCounts'

const KaragarMaskebari = () => {
    const {records:releaseRecords, loading:releaseRecordsLoading}=fetchAllReleaseCounts();
    return (
        <div>
            <Grid2 container>

            </Grid2>
            <Grid2 container sx={{marginTop:1}}>
                <TotalofAllFields />
            </Grid2>

            <Grid2 container sx={{marginTop:1}}>
                <TotalReleaseDetails />
            </Grid2>

            <Grid2 container sx={{marginTop:1}}>
                {/* <CountAcMuddaTable /> */}
                <TotalCountAc2Mudda/>
            </Grid2>
        </div>
    );
};

export default KaragarMaskebari;