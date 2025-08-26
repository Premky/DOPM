import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import PayroleDetailsTable from '../Parole/View/PayroleDetailsTable.jsx';
import {Helmet} from "react-helmet";
import BandiReleaseTable from './Tables/For View/BandiReleaseTable.jsx';

const ViewBandi = ( { bandi } ) => {
    const params = useParams();
    const location = useLocation();
    const [urlLocation, setUrlLocation] = React.useState( location.pathname );
    useEffect( () => {
        if ( location.pathname.startsWith( "/payrole/view_saved_record" ) ) {
            setUrlLocation( "parole" );
        } else if ( location.pathname.startsWith( "/bandi/view_saved_record" ) ) {
            setUrlLocation( "bandi" );
        }
    }, [location.pathname] );
    // Prefer the passed prop, fallback to param
    const bandi_id = bandi ? bandi : params.bandi_id;

    return (
        <>
        <Helmet>
                <title>PMIS: बन्दी विस्तृत विवरण</title>
                <meta name="description" content="बन्दी सम्बन्धि सबै विवरणहरु हेर्नुहोस्" />
                <meta name="keywords" content="बन्दी, बन्दी विवरण, बन्दी जानकारी, बन्दी रेकर्ड, बन्दी डाटा" />
                <meta name="author" content="Your Name or Company" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="canonical" href={window.location.href} />
        </Helmet>
            <Grid container spacing={2} sx={{ marginBottom: '0px' }}>
                {urlLocation === "parole" && (
                    <Grid size={{ xs: 12 }}>
                        <PayroleDetailsTable bandi_id={bandi_id} />
                    </Grid>
                )}
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
                    <BandiTransferHistoryTable bandi_id={bandi_id} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <BandiReleaseTable bandi_id={bandi_id}/>
                </Grid>
            </Grid>
        </>
    );
};

export default ViewBandi;