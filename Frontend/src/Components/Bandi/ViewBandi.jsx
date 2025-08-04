import React from 'react';
import { useParams } from 'react-router-dom';
import BandiTable from './Tables/For View/BandiTable';
import FamilyTable from './Tables/For View/FamilyTable';
import BandiIDTable from './Tables/For View/BandiIDTable';
import BandiMuddaTable from './Tables/For View/BandiMuddaTable';
import BandiFineTable from './Tables/For View/BandiFineTable';
import BandiPunrabednTable from './Tables/For View/BandiPunrabednTable.jsx';
import BandiAddressTable from './Tables/For View/BandiAddressTable.jsx';
import BandiKaidTable from './Tables/For View/BandiKaidTable.jsx';
import BandiContactPersonTable from './Tables/For View/ContactPersonTable.jsx';
import BandiDiseasesTable from './Tables/For View/BandiDiseasesTable.jsx';
import BandiDisabilityTable from './Tables/For View/BandiDisabilityTable.jsx';
import { Grid } from '@mui/material';
import BandiTransferHistoryTable from './Tables/For View/BandiTransferHistoryTable.jsx';

const ViewBandi = ( { bandi } ) => {
    const params = useParams();

    // Prefer the passed prop, fallback to param
    const bandi_id = bandi ? bandi : params.bandi_id;

    return (
        <>
            <Grid container spacing={2} sx={{ marginBottom: '0px' }}>
                <Grid size={{ xs: 12 }}>
                    <BandiTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiMuddaTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiKaidTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiAddressTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FamilyTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiContactPersonTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiIDTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiFineTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiPunrabednTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <BandiDiseasesTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <BandiDisabilityTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiTransferHistoryTable bandi_id={bandi_id}/>
                </Grid>
            </Grid>
        </>
    );
};

export default ViewBandi;