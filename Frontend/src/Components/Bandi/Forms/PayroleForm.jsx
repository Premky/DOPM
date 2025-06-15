import React, { useEffect } from 'react'
import ReusePayroleNos from '../../ReuseableComponents/ReusePayroleNos'
import { useForm } from 'react-hook-form';
import { Box, Button, Grid2 } from '@mui/material';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import ViewBandi from '../ViewBandi'
const PayroleForm = () => {
  const {
    handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm({
      defaultValues: {
        office_bandi_id: '',
        // other fields...
      },
    });

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
      const url = editing ? `${BASE_URL}/admin/update_office/${editableData.id}` : `${BASE_URL}/admin/add_office`;
      const method = editing ? 'PUT' : 'POST';
      const response = await axios({
        method, url, data: data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <ViewBandi bandi={bandi_id} />
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Button variant="contained">Contained</Button>
            </Grid2>
          </Grid2>
        </form>
      </Box >
    </>
  )
}

export default PayroleForm