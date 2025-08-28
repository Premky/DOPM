import React from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../../../../Context/AuthContext';
import { Helmet } from 'react-helmet';

const CountAcOfficenCountry = () => {
  const { state } = useAuth();
  return (
    <div>
      <Helmet>
        <title>PMIS: देश अनुसारको संख्या</title>
        <meta name="description" content="देश अनुसार कुल कैदीबन्दी संख्या हेर्नुहोस्" />
        <meta name="keywords" content="कुल कैदीबन्दी, देश अनुसार, कैदी संख्या, थुनुवा संख्या, लिङ्ग अनुसार, ६५ वर्ष माथिका, आश्रित, विदेशी" />
        <meta name="author" content="Your Name or Company" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Grid container>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <TableContainer component={Paper}>
            <Table size='small' border={1}>

              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2}>सि.नं.</TableCell>
                  <TableCell rowSpan={2}>कारागार कार्यालय</TableCell>
                  <TableCell colSpan={2}>देश</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>नेपाल</TableCell>
                  <TableCell>भारत</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>


              </TableBody>

            </Table>
          </TableContainer>
        </Box>
      </Grid>
    </div>
  );
};

export default CountAcOfficenCountry;