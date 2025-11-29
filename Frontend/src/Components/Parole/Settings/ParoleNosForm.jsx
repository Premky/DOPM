import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, FormControlLabel, Grid, Table, TableBody, TableHead, useScrollTrigger } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import ReusePayroleNos from '../../ReuseableComponents/ReusePayroleNos';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import { Helmet } from 'react-helmet';
import useFetchParoleNos from '../useApi/useFetchParoleNos';

const PayroleNosForm = ( { status } ) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();

  const {
    handleSubmit, watch, setValue, register, reset, control, formState: { errors } } = useForm( {
      defaultValues: {
        office_bandi_id: '',
        // other fields...
      },
    } );

  const [loading, setLoading] = useState( false );
  const [editing, setEditing] = useState( false );

  // Watch Variables
  const payrole_no = watch( 'payrole_no' );
  // End of Watch Variables

  const onFormSubmit = async ( data ) => {
    setLoading( true );
    try {
      // console.log( data );
      const url = editing ? `${ BASE_URL }/parole/update_office/${ editableData.id }` : `${ BASE_URL }/parole/create_parole_nos`;
      const method = editing ? 'PUT' : 'POST';
      const response = await axios( {
        method, url, data: data,
        withCredentials: true
      } );
      const { Status, Result, Error } = response.data;
      // console.log( response );
      if ( Status ) {
        Swal.fire( {
          title: `Record ${ editing ? 'updated' : 'saved' } successfully!`,
          icon: "success",
          draggable: true
        } );
        reset();
        setEditing( false );
        // fetchOffices();
      } else {
        Swal.fire( {
          title: response.data.nerr,
          icon: 'error',
          draggable: true
        } );

      }

    } catch ( err ) {
      console.error( err );

      Swal.fire( {
        title: err?.response?.data.message || "सर्भरमा समस्या आयो ।",
        // text: err?.response?.data.message || "सर्भरमा समस्या आयो ।",
        icon: 'error',
        // confirmButtonText: 'Cool'
        draggable: true
      } );
    } finally {
      setLoading( false );
    }
  };

  const { records: paroleNos, loading: paroleNosLoading } = useFetchParoleNos();

  // console.log( payrole_no );
  return (
    <>
      <Helmet>
        <title>PMIS: प्यारोल निर्णय Setting</title>
        <meta name="description" content="प्यारोल Setting" />
        <meta name="keywords" content="प्यारोल संख्या " />
        <meta name="author" content="कारागार व्यवस्थापन विभाग" />
      </Helmet>
      <Box sx={{ flexGrow: 1 }}>

        <form onSubmit={handleSubmit( onFormSubmit )}>
          <Grid container spacing={1} mt={1}>
            <Grid size={12}>
              प्यारोल बैठक विवरणः
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseInput
                name='payrole_no_name'
                label='प्यारोल बैठक नं.'
                required={true}
                control={control}
                error={errors.payrole_no_name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_calculation_date'
                label='प्यारोल गणना मिति'
                required={false}
                control={control}
                error={errors.payrole_calculation_date}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_decision_date'
                label='प्यारोल निर्णय मिति मिति'
                required={false}
                control={control}
                error={errors.payrole_decision_date}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseInput
                name='parole_granted_letter_no'
                label='प्यारोल स्विकृत भएको (च.नं.)'
                required={true}
                control={control}
                error={errors.parole_granted_letter_no}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='parole_granted_letter_date'
                label='प्यारोल स्विकृत भएको मिति'
                required={true}
                control={control}
                error={errors.parole_granted_letter_date}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseSelect
                name='is_active'
                label='सक्रिय छ/छैन?'
                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: 0 }]}
                required={true}
                control={control}
                error={errors.is_active}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained" type='save'>Submit</Button>
            </Grid>
          </Grid>
        </form>

        <Box sx={{ mt: 1 }}>
          <Table border='1'>
            <TableHead>
              <th>सि.नं.</th>
              <th>प्यारोल नं.</th>
              <th>प्यारोल गणना मिति</th>
              <th>निर्णय मिति</th>
              <th>प्यारोल च.नं.</th>
              <th>प्यारोले पत्र मिति</th>
              <th>Is Active</th>
              <th>#</th>
            </TableHead>
            <TableBody>
              {paroleNos.map( ( data, i ) => {
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>;
              } )}
            </TableBody>
          </Table>
        </Box>
      </Box >
    </>
  );
};

export default PayroleNosForm;