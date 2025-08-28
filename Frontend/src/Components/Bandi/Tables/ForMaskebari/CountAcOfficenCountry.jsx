import React from 'react';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../../../../Context/AuthContext';
import { Helmet } from 'react-helmet';
import useFetchCountryAcToOffice from '../../../Apis/useFetchCountryAcToOffice';
import useFetchCountAcToCountry from '../../Apis_to_fetch/useFetchCountAcToCountry';

const CountAcOfficenCountry = () => {
  const { state } = useAuth();
  const { records: countries, refetch } = useFetchCountryAcToOffice();
  const { records: count_ac_country } = useFetchCountAcToCountry();
  console.log( count_ac_country );
  return (
    <div>
      <Helmet>
        <title>PMIS: देश अनुसारको संख्या</title>
        <meta name="description" content="देश अनुसार कुल कैदीबन्दी संख्या हेर्नुहोस्" />
        <meta name="keywords" content="कुल कैदीबन्दी, देश अनुसार, कैदी संख्या, थुनुवा संख्या, लिङ्ग अनुसार, ६५ वर्ष माथिका, आश्रित, विदेशी" />
        <meta name="author" content="DOPM" />
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
                  <TableCell colSpan={countries.length}>देश</TableCell>
                </TableRow>
                <TableRow>
                  {countries.map( ( data, index ) => (
                    <TableCell key={index}>{data.country_name_np}</TableCell>
                  ) )}
                </TableRow>
              </TableHead>

              <TableBody>
                {count_ac_country.map( ( data, index ) => (
                  <TableRow>
                    <TableCell key={index}>{index+1}</TableCell>
                    <TableCell key={index}>{data.office_id} {data.office_name_np} </TableCell>
                    {countries.map( ( country, index ) => (
                      <TableCell key={index}>{country.country_name_np==data.country_name? data.Total:0}</TableCell>
                    ) )}
                  </TableRow>
                ) )}
              </TableBody>

            </Table>
          </TableContainer>
        </Box>
      </Grid>
    </div>
  );
};

export default CountAcOfficenCountry;