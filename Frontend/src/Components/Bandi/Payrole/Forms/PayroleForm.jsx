import React, { useEffect, useState } from 'react';
import ReusePayroleNos from '../../../ReuseableComponents/ReusePayroleNos';
import { useForm } from 'react-hook-form';
import { Box, Button, FormControlLabel, Grid, useScrollTrigger } from '@mui/material';
import ReuseDateField from '../../../ReuseableComponents/ReuseDateField';
import ReuseBandi from '../../../ReuseableComponents/ReuseBandi';
import ViewBandi from '../../ViewBandi';
import ReuseInput from '../../../ReuseableComponents/ReuseInput';
import { useBaseURL } from '../../../../Context/BaseURLProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../../../Context/AuthContext';
import useFetchBandi from '../useApi/useFetchBandi';
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect';
import { CheckBox } from '@mui/icons-material';
import ReuseCheckboxGroup from '../../ReusableComponents/ReuseCharactersCheckbox';
import useFetchPayroleConditions from '../useApi/useFetchPayroleConditions';
import ReuseDistrict from '../../../ReuseableComponents/ReuseDistrict';
import ReuseMunicipality from '../../../ReuseableComponents/ReuseMunicipality';

const PayroleForm = () => {
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
  // fetchBandi function remains same
  useEffect( () => {
    if ( bandi_id ) fetchBandi();
  }, [bandi_id] );

  // New useEffect to set mudda_id after bandi is set
  useEffect( () => {
    if ( bandi && bandi.mudda_id ) {
      setValue( 'mudda_id', bandi.mudda_id );
    }
  }, [bandi] );


  const onFormSubmit = async ( data ) => {
    setLoading( true );
    try {
      console.log( data );
      const url = editing ? `${ BASE_URL }/bandi/update_office/${ editableData.id }` : `${ BASE_URL }/payrole/create_payrole`;
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
  const selectedDistrictId=watch('recommended_district');
  const { records: payroleBandi, optrecords: payroleBandiOpt, loading: payroleBandiLoading } = useFetchBandi();
  const { records: conditions, optrecords: conditionsOpt, loading: conditionsLoading } = useFetchPayroleConditions();
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <form onSubmit={handleSubmit( onFormSubmit )}>
          <Grid container spacing={1}>
            <Grid size={12}>
              कारागार कार्यालयको नामः
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseSelect
                name='bandi_id'
                label='बन्दी'
                required={true}
                control={control}
                options={payroleBandiOpt}
                error={errors.bandi_id}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReusePayroleNos
                name='payrole_no'
                label='प्यारोल संख्या'
                required={true}
                control={control}
                error={errors._no}
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_count_date'
                label='प्यारोल गणना मिति'
                required={true}
                control={control}
                error={errors.payrole_count_date}
              />
            </Grid> */}

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_entry_date'
                label='प्यारोल दाखिला मिति'
                required={true}
                control={control}
                error={errors.payrole_entry_date}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDistrict
                name='recommended_district'
                label='प्यारोल बस्ने इच्छुक जिल्ला'
                required={true}
                control={control}
                error={errors.recommended_district}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseMunicipality
                name='recommended_city'
                label='प्यारोल बस्ने इच्छुक स्थानिय तह'
                required={true}
                control={control}
                error={errors.recommended_city}
                selectedDistrict={selectedDistrictId}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 6, md: 3 }} >
              <ReuseMudda
                name='mudda_id'
                label='मुददा'
                required={true}
                control={control}
                error={errors.mudda_id}
              />
            </Grid> */}

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
              <ReuseCheckboxGroup
                name="character_conditions"
                label="चरित्र सर्तहरू"
                control={control}
                options={conditions} // [{ id: 1, name: "शुद्ध आचरण" }, ...]
                required={true}
                error={errors.character_conditions}
              />
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

export default PayroleForm;