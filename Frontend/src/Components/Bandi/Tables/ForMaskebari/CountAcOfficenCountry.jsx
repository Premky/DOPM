import { useState, useMemo } from 'react';
import { Box, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../../../../Context/AuthContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import useFetchCountryAcToOffice from '../../../Apis/useFetchCountryAcToOffice';
import useFetchCountAcToCountry from '../../Apis_to_fetch/useFetchCountAcToCountry';
import { useForm } from 'react-hook-form';
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect';
import fetchBandiStatus from '../../../ReuseableComponents/FetchApis/fetchBandiStatus';

const CountAcOfficenCountry = () => {
  const { state } = useAuth();
  const { control, watch } = useForm();

  //Watch Variables//
  const bandi_status = watch( 'bandi_status', 1 ); // default value

  const filters = useMemo( () => ( {
    bandi_status
  } ), [bandi_status] );

  const { records: countries } = useFetchCountryAcToOffice( filters );
  const { records: count_ac_country } = useFetchCountAcToCountry( bandi_status, filters );
  const { records: bandiStatus, optrecords: bandiStatusOpt, loading: bandiStatusLoading } = fetchBandiStatus();
  //  console.log( count_ac_country );
  const [sortBy, setSortBy] = useState( 'office_name_np' );
  const [sortDir, setSortDir] = useState( 'asc' );

  const handleSort = ( column ) => {
    if ( sortBy === column ) {
      setSortDir( sortDir === 'asc' ? 'desc' : 'asc' );
    } else {
      setSortBy( column );
      setSortDir( 'asc' );
    }
  };

  const sortedData = useMemo( () => {
    if ( !count_ac_country ) return [];

    return [...count_ac_country].sort( ( a, b ) => {
      // Sort by office name
      if ( sortBy === 'office_name_np' ) {
        return sortDir === 'asc'
          ? a.office_name_np.localeCompare( b.office_name_np )
          : b.office_name_np.localeCompare( a.office_name_np );
      }

      // Sort by total
      if ( sortBy === 'जम्मा' ) {
        const aTotal = a.countries.reduce( ( sum, c ) => sum + c.total, 0 );
        const bTotal = b.countries.reduce( ( sum, c ) => sum + c.total, 0 );
        return sortDir === 'asc' ? aTotal - bTotal : bTotal - aTotal;
      }

      // Sort by country
      const countryName = sortBy;
      const aValue = a.countries.find( c => c.country_name === countryName )?.total || 0;
      const bValue = b.countries.find( c => c.country_name === countryName )?.total || 0;
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    } );
  }, [count_ac_country, sortBy, sortDir] );



  // Excel export
  const handleExport = async () => {
    const ExcelJs = await import( 'exceljs' );
    const saveAs = await import( 'file-saver' );

    const workbook = new ExcelJs.Workbook();
    const sheet = workbook.addWorksheet( 'Country Wise Count' );

    const header = ['सि.नं.', 'कारागार कार्यालय', ...countries.map( c => c.country_name_np ), 'जम्मा'];
    sheet.addRow( header );

    sortedData.forEach( ( officeData, index ) => {
      const row = [index + 1, officeData.office_name_np];
      let officeTotal = 0;
      countries.forEach( c => {
        const countryData = officeData.countries.find( x => x.country_name === c.country_name_np );
        const value = countryData ? countryData.total : 0;
        officeTotal += value;
        row.push( value );
      } );
      row.push( officeTotal );
      sheet.addRow( row );
    } );

    const totalRow = ['जम्मा', ''];
    countries.forEach( c => {
      const countryTotal = sortedData.reduce( ( sum, officeData ) => {
        const countryData = officeData.countries.find( x => x.country_name === c.country_name_np );
        return sum + ( countryData ? countryData.total : 0 );
      }, 0 );
      totalRow.push( countryTotal );
    } );
    const grandTotal = sortedData.reduce( ( sum, officeData ) => sum + officeData.countries.reduce( ( s, c ) => s + c.total, 0 ), 0 );
    totalRow.push( grandTotal );
    sheet.addRow( totalRow );

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs.saveAs( new Blob( [buffer] ), 'CountryWiseCount.xlsx' );
  };

  return (
    <div>
      <HelmetProvider>
        <Helmet>
          <title>PMIS: देश अनुसारको संख्या</title>
        </Helmet>
      </HelmetProvider>

      <Grid container>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Grid container size={{ xs: 12 }} spacing={2}>
            <Grid size={{ xs: 3 }}>
              <ReuseSelect
                name="bandi_status"
                label='बन्दीको अवस्था'
                control={control}
                options={[
                  ...bandiStatusOpt,
                  { label: "कारागारमा", value: 1 }
                ]}

                defaultValue={1}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <br /> <br />
              <Button variant="contained" onClick={handleExport} sx={{ mb: 2 }}>
                Export to Excel
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table size="small" border={1}>
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort( 'office_name_np' )}>
                    सि.नं.
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort( 'office_name_np' )}>
                    कारागार कार्यालय
                  </TableCell>
                  <TableCell colSpan={countries.length} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    देश
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleSort( 'जम्मा' )}>
                    जम्मा
                  </TableCell>
                </TableRow>
                <TableRow>
                  {countries.map( ( data, index ) => (
                    <TableCell
                      key={index}
                      sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => handleSort( data.country_name_np )}
                    >
                      {data.country_name_np}
                    </TableCell>
                  ) )}
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedData.map( ( officeData, index ) => {
                  let officeTotal = 0;
                  return (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{officeData.office_name_np}</TableCell>

                      {countries.map( ( country, cIndex ) => {
                        const countryData = officeData.countries.find( c => c.country_name === country.country_name_np );
                        const value = countryData ? countryData.total : 0;
                        officeTotal += value;
                        return <TableCell key={cIndex}>{value}</TableCell>;
                      } )}

                      <TableCell sx={{ fontWeight: 'bold' }}>{officeTotal}</TableCell>
                    </TableRow>
                  );
                } )}

                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total</TableCell>
                  {countries.map( ( country, cIndex ) => {
                    const countryTotal = sortedData.reduce( ( sum, officeData ) => {
                      const countryData = officeData.countries.find( c => c.country_name === country.country_name_np );
                      return sum + ( countryData ? countryData.total : 0 );
                    }, 0 );
                    return <TableCell key={cIndex} sx={{ fontWeight: 'bold' }}>{countryTotal}</TableCell>;
                  } )}
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {sortedData.reduce( ( sum, officeData ) => sum + officeData.countries.reduce( ( rowSum, c ) => rowSum + c.total, 0 ), 0 )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Grid>
    </div >
  );
};

export default CountAcOfficenCountry;
