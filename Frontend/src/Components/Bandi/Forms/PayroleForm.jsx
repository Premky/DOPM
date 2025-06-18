import React, { useEffect, useState } from 'react'
import ReusePayroleNos from '../../ReuseableComponents/ReusePayroleNos'
import { useForm } from 'react-hook-form';
import { Box, Button, Grid2, useScrollTrigger } from '@mui/material';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import ViewBandi from '../ViewBandi'
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
const PayroleForm = () => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();

  const {
    handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm({
      defaultValues: {
        office_bandi_id: '',
        // other fields...
      },
    });

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Watch Variables
  const payrole_no = watch('payrole_no');
  const bandi_id = watch('bandi_id');
  // End of Watch Variables

  useEffect(() => {
    console.log(bandi_id)
  }, [bandi_id])

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      // console.log(data)
      const url = editing ? `${BASE_URL}/bandi/update_office/${editableData.id}` : `${BASE_URL}/bandi/create_payrole`;
      const method = editing ? 'PUT' : 'POST';
      const response = await axios({
        method, url, data: data,
        withCredentials: true
      })
      const { Status, Result, Error } = response.data;
      console.log(response)
      if (Status) {
        Swal.fire({
          title: `Office ${editing ? 'updated' : 'created'} successfully!`,
          icon: "success",
          draggable: true
        });
        reset();
        setEditing(false);
        fetchOffices();
      } else {
        Swal.fire({
          title: response.data.nerr,
          icon: 'error',
          draggable: true
        });
      }

    } catch (err) {
      console.error(err);
      Swal.fire({
        title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
        icon: 'error',
        draggable: true
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Grid2 container spacing={1}>
            <Grid2 size={12}>
              कार्यालयको विवरणः
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <ReusePayroleNos
                name='payrole_no'
                label='प्यारोल संख्या'
                required={true}
                control={control}
                error={errors._no}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_count_date'
                label='प्यारोल गणना मिति'
                required={true}
                control={control}
                error={errors.payrole_count_date}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name='payrole_entry_date'
                label='प्यारोल दाखिला मिति'
                required={true}
                control={control}
                error={errors.payrole_entry_date}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseBandi
                name='bandi_id'
                label='बन्दी'
                required={true}
                control={control}
                error={errors.bandi_id}
                current_office = {authState.office_np}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            {bandi_id ?
              <>
                <ViewBandi bandi={bandi_id} /> <br />
              </> : <></>
            }
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <ReuseInput
                name='other_details'
                label="बृद्ध, रोगी, वा अशक्त भए सो समेत उल्लेख गर्ने"
                // defaultValue={band_rand_id}
                required={true}
                control={control}
                error={errors.other_details} />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <ReuseInput
                name='payrole_reason'
                label="प्यारोलमा राख्न सिफारिस गर्नुको आधार र कारण"
                // defaultValue={band_rand_id}
                required={true}
                control={control}
                error={errors.payrole_reason} />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <ReuseInput
                name='payrole_remarks'
                label="कैफियत"
                // defaultValue={band_rand_id}
                required={true}
                control={control}
                error={errors.payrole_remarks} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained" type='save'>Submit</Button>
            </Grid2>
          </Grid2>
        </form>
      </Box >
    </>
  )
}

export default PayroleForm