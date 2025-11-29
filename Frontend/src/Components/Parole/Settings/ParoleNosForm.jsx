import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Button, Grid, Table, TableBody,
  TableHead, TableRow, TableCell
} from '@mui/material';

import NepaliDate from 'nepali-datetime';

import Swal from 'sweetalert2';
import axios from 'axios';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import { Helmet } from 'react-helmet';
import useFetchParoleNos from '../useApi/useFetchParoleNos';
import ReuseDatePickerSMV5 from '../../ReuseableComponents/ReuseDatePickerSMV5';

const PayroleNosForm = () => {
  const BASE_URL = useBaseURL();
  const npToday = new NepaliDate();
  const formattedDateNp = npToday.format( 'YYYY-MM-DD' );

  const { state: authState } = useAuth();

  const {
    handleSubmit, watch, setValue, register, reset, control,
    formState: { errors }
  } = useForm( {
    defaultValues: {
      payrole_no_name: "",
      payrole_calculation_date: "",
      payrole_decision_date: "",
      parole_granted_letter_no: "",
      parole_granted_letter_date: "",
      parole_no_bandi_granted: "",
      is_active: 1,
    }
  } );

  const [loading, setLoading] = useState( false );
  const [editing, setEditing] = useState( false );
  const [editableData, setEditableData] = useState( null );

  const { records: paroleNos, loading: paroleNosLoading, refetch } = useFetchParoleNos();
  // console.log(paroleNos[0])
  // ---------------------------
  // 🟢 CREATE OR UPDATE HANDLER
  // ---------------------------
  const onFormSubmit = async ( data ) => {
    setLoading( true );

    try {
      const url = editing
        ? `${ BASE_URL }/parole/update_parole_nos/${ editableData.id }`
        : `${ BASE_URL }/parole/create_parole_nos`;

      const method = editing ? "PUT" : "POST";

      const response = await axios( {
        method,
        url,
        data,
        withCredentials: true
      } );

      if ( response.data.Status ) {
        Swal.fire( {
          icon: "success",
          title: editing ? "Updated Successfully!" : "Saved Successfully!"
        } );

        reset();
        setEditing( false );
        setEditableData( null );
        refetch(); // refresh table

      } else {
        Swal.fire( {
          icon: "error",
          title: response.data.Error || "Error occurred!"
        } );
      }
    } catch ( err ) {
      console.error( err );
      Swal.fire( {
        icon: 'error',
        title: err.response?.data?.message || "Server error!"
      } );
    } finally {
      setLoading( false );
    }
  };

  // ---------------------------
  // 🟡 EDIT HANDLER
  // ---------------------------
  const handleEdit = ( row ) => {
    setEditing( true );
    setEditableData( row );

    reset( {
      payrole_no_name: row.payrole_no_name,
      payrole_calculation_date: row.payrole_calculation_date,
      payrole_decision_date: row.payrole_decision_date,
      parole_granted_letter_no: row.parole_granted_letter_no,
      parole_granted_letter_date: row.parole_granted_letter_date,
      parole_no_bandi_granted: row.parole_no_bandi_granted,
      is_active: row.is_active,
    } );
  };

  // ---------------------------
  // 🔴 DELETE HANDLER
  // ---------------------------
  const handleDelete = async ( id ) => {
    const confirm = await Swal.fire( {
      title: "Are you sure?",
      text: "This will permanently delete the record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    } );

    if ( !confirm.isConfirmed ) return;

    try {
      const res = await axios.delete( `${ BASE_URL }/parole/delete_parole_nos/${ id }`, {
        withCredentials: true
      } );

      if ( res.data.Status ) {
        Swal.fire( { icon: "success", title: "Deleted Successfully!" } );
        refetch();
      } else {
        Swal.fire( { icon: "error", title: res.data.Error } );
      }
    } catch ( error ) {
      console.error( error );
      Swal.fire( {
        icon: "error",
        title: error.response?.data?.message || "Server error!"
      } );
    }
  };

  return (
    <>
      <Helmet>
        <title>PMIS: Parole Decision Setting</title>
      </Helmet>

      <Box sx={{ flexGrow: 1 }}>
        <form onSubmit={handleSubmit( onFormSubmit )}>
          <Grid container spacing={1} mt={1}>

            <Grid size={{ xs: 12 }}>प्यारोल बैठक विवरणः</Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseInput
                name="payrole_no_name"
                label="प्यारोल बैठक नं."
                required={true}
                control={control}
                error={errors.payrole_no_name}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDatePickerSMV5
                name="payrole_calculation_date"
                label="प्यारोल गणना मिति"
                control={control}
                error={errors.payrole_calculation_date}
                maxDate={formattedDateNp}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDatePickerSMV5
                name="payrole_decision_date"
                label="प्यारोल निर्णय मिति"
                control={control}
                error={errors.payrole_decision_date}
                maxDate={formattedDateNp}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseInput
                name="parole_granted_letter_no"
                label="प्यारोल स्विकृत (च.नं.)"
                required={false}
                control={control}
                error={errors.parole_granted_letter_no}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDatePickerSMV5
                name="parole_granted_letter_date"
                label="प्यारोल स्विकृत मिति"
                control={control}
                error={errors.parole_granted_letter_date}
                maxDate={formattedDateNp}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseInput
                name="parole_no_bandi_granted"
                label="प्यारोल पाएको संख्या"
                required={false}
                control={control}
                error={errors.parole_no_bandi_granted}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseSelect
                name="is_active"
                label="सक्रिय?"
                options={[{ label: "छ", value: 1 }, { label: "छैन", value: 0 }]}
                control={control}
                required={true}
                error={errors.is_active}
              />
            </Grid>

            <Grid size={{ xs: 12 }} mt={2}>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? "Saving..." : editing ? "Update" : "Save"}
              </Button>
              {editing && (
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => {
                    reset();
                    setEditing( false );
                    setEditableData( null );
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Grid>
          </Grid>
        </form>

        {/* --------------------------- */}
        {/* 📌 TABLE SECTION */}
        {/* --------------------------- */}
        <Box sx={{ mt: 3 }}>
          <Table border="1">
            <TableHead>
              <TableRow>
                <TableCell>सि.नं.</TableCell>
                <TableCell>बैठक नं.</TableCell>
                <TableCell>गणना मिति</TableCell>
                <TableCell>निर्णय मिति</TableCell>
                <TableCell>च.नं.</TableCell>
                <TableCell>पत्र मिति</TableCell>
                <TableCell>प्यारोल पाएको संख्या</TableCell>
                <TableCell>सक्रिय?</TableCell>
                <TableCell>#</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paroleNos.map( ( row, i ) => (
                <TableRow key={row.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{row.payrole_no_name}</TableCell>
                  <TableCell>{row.payrole_calculation_date}</TableCell>
                  <TableCell>{row.payrole_decision_date}</TableCell>
                  <TableCell>{row.parole_granted_letter_no}</TableCell>
                  <TableCell>{row.parole_granted_letter_date}</TableCell>
                  <TableCell>{row.parole_no_bandi_granted}</TableCell>
                  <TableCell>{row.is_active ? "छ" : "छैन"}</TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEdit( row )}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete( row.id )}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ) )}
              <TableRow>
                <TableCell colSpan={6}>कुल जम्मा</TableCell>
                <TableCell>{paroleNos[0]?.total_granted}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </Box>

      </Box >
    </>
  );
};

export default PayroleNosForm;
