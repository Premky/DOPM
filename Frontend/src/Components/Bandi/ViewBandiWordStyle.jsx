import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import {
  Grid,
  Box,
  Button,
  Paper,
  Typography,
  Tooltip,
  AppBar,
  Toolbar,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';

import {
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Screen-view tables
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
import BandiTransferHistoryTable from './Tables/For View/BandiTransferHistoryTable.jsx';
import PayroleDetailsTable from '../Parole/View/PayroleDetailsTable.jsx';
import BandiEscapeTable from './Tables/For View/BandiEscapeTable.jsx';
import BandiReleaseTable from './Tables/For View/BandiReleaseTable.jsx';

// ✅ PRINT LAYOUT (IMPORTANT)
import ViewBandiPrintLayout from './ViewBandiPrintLayout.jsx';

/* ---------------- PRINT CSS ---------------- */
const PRINT_CSS = `
@media screen {
  .print-only { display: none; }
}

@media print {
  body * {
    visibility: hidden;
  }

  .print-only,
  .print-only * {
    visibility: visible;
  }

  .print-only {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 12mm;
  }

  .no-print,
  .MuiAppBar-root,
  button {
    display: none !important;
  }

  @page {
    size: A4;
    margin: 12mm;
  }
}
`;

const SectionBox = ( { children, fullWidth = true } ) => (
  <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
      {children}
    </Paper>
  </Grid>
);

const ViewBandiWordStyle = ( { bandi } ) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [urlLocation, setUrlLocation] = useState( 'bandi' );
  const [isLoading, setIsLoading] = useState( false );
  const [error, setError] = useState( null );

  useEffect( () => {
    setUrlLocation(
      location.pathname.startsWith( '/parole' ) ? 'parole' : 'bandi'
    );
  }, [location.pathname] );

  const bandi_id = bandi || params.bandi_id;
  const office_bandi_id = bandi || params.office_bandi_id;

  const [isPrinting, setIsPrinting] = useState( false );

  /* ---------------- PRINT HANDLER ---------------- */
  const handlePrint = () => {
    document.title = `बन्दी विवरण - ${ office_bandi_id }`;
    setIsPrinting( true );

    setTimeout( () => {
      window.print();
      setIsPrinting( false );
    }, 100 );
  };


  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>PMIS: बन्दी विस्तृत विवरण</title>
          <style>{PRINT_CSS}</style>
        </Helmet>
      </HelmetProvider>

      {/* ---------------- APP BAR ---------------- */}
      <AppBar position="sticky" className="no-print">
        <Toolbar>
          {/* <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate( -1 )}
          >
            Back
          </Button> */}

          <Typography sx={{ flexGrow: 1 }}>
            बन्दी विवरण प्रणाली
          </Typography>

          <Tooltip title="Print / Save as PDF">
            <Button
              color="inherit"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ---------------- SCREEN CONTENT ---------------- */}
      <Box sx={{ px: 2, py: 2 }} className="no-print">
        {error && <Alert severity="error">{error}</Alert>}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Grid container spacing={2}>
          {urlLocation === 'parole' && (
            <SectionBox fullWidth>
              <PayroleDetailsTable bandi_id={bandi_id} />
            </SectionBox>
          )}
          {/* {bandi_id}, {office_bandi_id} */}
          <SectionBox><BandiTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiMuddaTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiKaidTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiAddressTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><FamilyTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiContactPersonTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiIDTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiFineTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiPunrabednTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiDiseasesTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiDisabilityTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiTransferHistoryTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiEscapeTable bandi_id={bandi_id} /></SectionBox>
          <SectionBox><BandiReleaseTable bandi_id={bandi_id} /></SectionBox>
        </Grid>
      </Box>

      {/* ---------------- PRINT CONTENT ONLY ---------------- */}
      {isPrinting && (
        <div className="print-only">
          <ViewBandiPrintLayout
            bandi_id={bandi_id}
            office_bandi_id={office_bandi_id}
          />
        </div>
      )}

    </>
  );
};

export default ViewBandiWordStyle;
