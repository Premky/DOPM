import React from 'react';
import { useParams } from 'react-router-dom';
import { Grid2 } from '@mui/material';

import BandiTable from '../../Tables/For View/BandiTable';
import BandiAddressTable from '../../Tables/For View/BandiAddressTable';
import BandiKaidTable from '../../Tables/For View/BandiKaidTable';
import BandiIDTable from '../../Tables/For View/BandiIDTable';
import BandiMuddaTable from '../../Tables/For View/BandiMuddaTable';
import BandiPunrabednTable from '../../Tables/For View/BandiPunrabednTable.jsx';

const PreviewBandi = () => {
    const params = useParams();
    const bandi_id = bandi ? bandi : params.bandi_id;
    return (
        <div>
            <Grid2 container spacing={2} sx={{ marginBottom: '0px' }}>
                <Grid2 size={{ xs: 12 }}>
                    <BandiTable bandi_id={bandi_id} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <BandiKaidTable bandi_id={bandi_id} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <BandiAddressTable bandi_id={bandi_id} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <BandiIDTable bandi_id={bandi_id} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <BandiMuddaTable bandi_id={bandi_id} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                    <BandiPunrabednTable bandi_id={bandi_id} />
                </Grid2>
            </Grid2>
        </div>
    );
};

export default PreviewBandi;