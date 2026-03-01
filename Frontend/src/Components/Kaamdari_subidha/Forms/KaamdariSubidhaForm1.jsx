import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Grid, useScrollTrigger } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';
import useInternalAdmins from '../../ReuseableComponents/UseInternalAdmins';

import ViewBandi from '../../Bandi/ViewBandi';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseMudda from '../../ReuseableComponents/ReuseMudda';
import ReusePayroleNos from '../../ReuseableComponents/ReusePayroleNos';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';

const KaamdariSubidhaForm = () => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const { records, recordsLoading } = useInternalAdmins();
  console.log( records );

  const {
    handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm( {
      defaultValues: {
        office_bandi_id: '',
        // other fields...
      },
    } );

  // const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState( false );

  // Watch Variables
  const payrole_no = watch( 'payrole_no' );
  const bandi_id = watch( 'bandi_id' );
  // End of Watch Variables

  const [bandi, setBandi] = useState( null );
  const fetchBandi = async () => {
    try {
      const bandies = await axios.get( `${ BASE_URL }/bandi/get_bandi/${ bandi_id }`, {
        withCredentials: true
      } );
      setBandi( bandies.data.Result[0] );
      setValue( 'mudda_id', bandi.mudda_id || '' );
      console.log( bandi );
      // console.log(bandies.data);
    } catch ( err ) {
      console.error( err );
    }
  };
  useEffect( () => {
    console.log( bandi_id );
    fetchBandi();
  }, [bandi_id] );

  const onFormSubmit = async ( data ) => {
    setLoading( true );
    try {
      // console.log(data)
      const url = editing ? `${ BASE_URL }/bandi/update_office/${ editableData.id }` : `${ BASE_URL }/bandi/create_payrole`;
      const method = editing ? 'PUT' : 'POST';
      const response = await axios( {
        method, url, data: data,
        withCredentials: true
      } );
      const { Status, Result, Error } = response.data;
      console.log( response );
      if ( Status ) {
        Swal.fire( {
          title: `Office ${ editing ? 'updated' : 'created' } successfully!`,
          icon: "success",
          draggable: true
        } );
        reset();
        setEditing( false );
        fetchOffices();
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
        title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
        icon: 'error',
        draggable: true
      } );
    } finally {
      setLoading( false );
    }
  };
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <form onSubmit={handleSubmit( onFormSubmit )}>
          <Grid container spacing={1}>
            <Grid size={12}>
              पत्रको विवरणः
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseBandi
                name='bandi_id'
                label='बन्दी'
                required={true}
                control={control}
                error={errors.bandi_id}
                current_office={authState.office_np}
                type='allbandi'
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {bandi?.payrole_id ?
              <>
                <Grid sx={{ color: 'red' }}>
                  यो कैदीको प्यारोल अगाडी नै आवेदन गरी सकेको
                </Grid>
              </> : <></>
            }
          </Grid>
          <Grid container spacing={2}>
            {bandi_id ?
              <>
                <ViewBandi bandi={bandi_id} /> <br />
              </> : <></>
            }
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ReuseInput
                name='other_details'
                label="बृद्ध, रोगी, वा अशक्त भए सो समेत उल्लेख गर्ने"
                // defaultValue={band_rand_id}
                required={true}
                control={control}
                error={errors.other_details} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ReuseInput
                name='payrole_reason'
                label="कामदारि सुबिधामा राख्न सिफारिस गर्नुको आधार र कारण"
                // defaultValue={band_rand_id}
                required={true}
                control={control}
                error={errors.payrole_reason} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ReuseInput
                name='payrole_remarks'
                label="कैफियत"
                // defaultValue={band_rand_id}
                required={false}
                control={control}
                error={errors.payrole_remarks} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained" type='save'
                disabled={bandi?.payrole_id || ''} // Disable if payrole_id is falsy
              >Submit</Button>
            </Grid>
          </Grid>
        </form>
      </Box >
    </>
  );
};

export default KaamdariSubidhaForm;