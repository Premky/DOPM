import React from 'react';
import { useParams } from 'react-router-dom';
import { Grid } from '@mui/material';


import BandiAddressTable from '../../Bandi/Tables/For View/BandiAddressTable';
import BandiKaidTable from '../../Bandi/Tables/For View/BandiKaidTable';
import BandiIDTable from '../../Bandi/Tables/For View/BandiIDTable';
import BandiMuddaTable from '../../Bandi/Tables/For View/BandiMuddaTable';
import BandiPunrabednTable from '../../Bandi/Tables/For View/BandiPunrabednTable.jsx';
import BandiFineTable from '../../Bandi/Tables/For View/BandiFineTable.jsx';
import PayroleDetailsTable from './PayroleDetailsTable.jsx';
import BandiTable from '../../Bandi/Tables/For View/BandiTable.jsx';

const PreviewBandi = ({bandi}) => {
    const params = useParams();
    const bandi_id = bandi ? bandi : params.bandi_id;
    return (
        <div>
            <Grid container spacing={2} sx={{ marginBottom: '0px' }}>

                {/* <Grid size={{ xs: 12 }}>
                    <PayroleDetailsTable bandi_id={bandi_id} />
                </Grid> */}

                <Grid size={{ xs: 12 }}>
                    <BandiTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiKaidTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiAddressTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiIDTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiMuddaTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiPunrabednTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiFineTable bandi_id={bandi_id} />
                </Grid>
            </Grid>
        </div>
    );
};

export default PreviewBandi;