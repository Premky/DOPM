import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import ReusePayroleNos from "../../ReuseableComponents/ReusePayroleNos";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";

import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import Swal from "sweetalert2";

const PyarolKaragarStatusModal = ( { open, onClose, data, kaidimuddas, onSave } ) => {
  const BASE_URL = useBaseURL();

  const {
    handleSubmit,
    register,
    reset,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm( {
    defaultValues: {
      mudda_id: "",
      mudda_name: "",
      pyarole_rakhan_upayukat: "",
      dopmremark: "",
      payrole_result: "",
      payrole_decision_remark: "",
      payrole_nos: "",
      payrole_decision_date: null,
      payrole_granted_court: "",
      payrole_granted_aadesh_date: null,
      payrole_granted_letter_no: "",
      payrole_granted_letter_date: null,
      hajir_office: "",
      hajir_current_date_bs: null,
      hajir_next_date_bs: null,
    },
  } );

  // console.log(data)
  useEffect( () => {
    if ( data ) {
      const selectedMudda = data.muddas?.find(
        ( mudda ) => mudda.is_main_mudda === 1 && mudda.is_last_mudda === 1
      );
      console.log( selectedMudda );

      reset( {
        mudda_id: selectedMudda?.mudda_id || "",
        mudda_name: selectedMudda?.mudda_name || "",
        pyarole_rakhan_upayukat: data?.pyarole_rakhan_upayukat || "",
        dopmremark: data?.dopmremark || "",
        payrole_result: data?.payrole_result || "",
        payrole_decision_remark: data?.payrole_decision_remark || "",
        payrole_nos: data?.payrole_nos || "",
        payrole_decision_date: data?.payrole_decision_date || null,
        payrole_granted_court: data?.payrole_granted_court || "",
        payrole_granted_aadesh_date: data?.payrole_granted_aadesh_date || null,
        payrole_granted_letter_no: data?.payrole_granted_letter_no || "",
        payrole_granted_letter_date: data?.payrole_granted_letter_date || null,
        hajir_office: data?.hajir_office || "",
        hajir_current_date_bs: data?.hajir_current_date_bs || null,
        hajir_next_date_bs: data?.hajir_next_date_bs || null,
      } );
      // console.log( "After reset:", getValues() );
      // console.log( 'data',data );

    }
  }, [data, kaidimuddas, reset] );


  const onSubmit = async ( formValues ) => {
    try {
      const payload = {
        ...data,
        ...formValues,
        payrole_id: data?.payrole_id,
      };
      console.log( payload );
      const response = await axios.put( `${ BASE_URL }/bandi/update_payrole_decision/${ data?.payrole_id }`, payload, { withCredentials: true } );
      if ( response.data.Status ) {
        Swal.fire( "Success", "Data has beedn saved successfully", "success" );
        onClose();
      } else {
        Swal.fire( "Error", response.data.Error || "Failed to save data", "error" );
      }
    } catch ( error ) {
      Swal.fire( "Error", "An error occured while saving data", "error" );
      console.log( error );
    }
  };

  const fullAddress =
    data?.nationality === "स्वदेशी"
      ? `${ data?.city_name_np }-${ data?.wardno }, ${ data?.district_name_np }, ${ data?.state_name_np }, ${ data?.country_name_np }`
      : `${ data?.bidesh_nagarik_address_details }, ${ data?.country_name_np }`;

  // const muddaName = kaidimuddas?.[0]?.mudda_name || "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>प्यारोल अवस्था </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <input type='text' value={`${ data?.id || "" }`} hidden />
            <input type='text' name="payrole_id" value={`${ data?.payrole_id || "" }`} hidden />
            <TextField
              fullWidth
              name={data?.bandi_id}
              label="कैदी नाम र ठेगाना"
              value={`${ data?.bandi_name || "" }, ${ fullAddress }`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <input
            type="text"
            name="mudda_id"
            {...register( 'mudda_id' )}
          />

          <Grid item xs={12}>
            <TextField
              name="mudda_name"
              fullWidth
              label="मुद्दा"
              value={data?.mudda_name}
              InputProps={{ readOnly: true }}
              {...register( "mudda_name" )}

            />
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="beruju"
                label="बेरुजु भए"
                value={`${ data?.hirasat_years || 0 }|${ data?.hirasat_months || 0 }|${ data?.hirasat_days || 0 }`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="thuna_date_bs"
                label="थुनामा परेको मिति"
                value={`${ data?.thuna_date_bs || '1950-01-01' }`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="release_date"
                label="छुट्ने मिति"
                value={`${ data?.release_date_bs || '1950-01-01' }`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Grid item container xs={12}>
            <Grid item xs={6}>
              <ReusePayroleNos
                label="प्यारोल बोर्डको निर्णय नं."
                name='payrole_nos'
                control={control}
              />
            </Grid>
            <Grid item xs={6}>
              <ReuseDateField
                name='payrole_decision_date'
                label="प्यारोल बोर्डको निर्णय मिति"
                control={control}
              />
            </Grid>

          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={6}>
              <ReuseOffice
                fullWidth
                name="payrole_granted_court"
                label="प्यारोल आदेश गर्ने अदालत"
                control={control}
                error={!!errors.payrole_granted_letter_date}
              />
            </Grid>
            <Grid item xs={6}>
              <ReuseDateField
                fullWidth
                name="payrole_granted_aadesh_date"
                label="प्यारोल आदेश मिति(अदालतबाट)"
                control={control}
                error={!!errors.payrole_granted_letter_date}
              />
            </Grid>
            <Grid item xs={6}>
              <ReuseInput
                fullWidth
                name="payrole_granted_letter_no"
                label="सुरु जिल्ला अदालतको च.नं."
                control={control}
                error={!!errors.payrole_granted_letter_no}
              />
            </Grid>
            <Grid item xs={6}>
              <ReuseDateField
                fullWidth
                name="payrole_granted_letter_date"
                label="मिति"
                control={control}
                error={!!errors.payrole_granted_letter_date}
              />
            </Grid>


          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              required
              label="अदालतबाट प्यारोल पास / फेल"
              fullWidth
              defaultValue={data?.payrole_result}
              {...register( "payrole_result", { required: true } )}
              error={!!errors.result}
              helperText={errors.payrole_result ? "चयन गर्नुहोस्" : ""}
            >
              <MenuItem value="5">पास</MenuItem>
              <MenuItem value="6">फेल</MenuItem>
            </TextField>
          </Grid>


          <Grid item xs={12}>
            <TextField
              {...register( "payrole_decision_remark" )}
              label="कैफियत"
              required
              defaultValue={data?.payrole_decision_remark}
              fullWidth
              multiline
              rows={3}
              error={!!errors.payrole_decision_remark}
            />
          </Grid>


          <Grid item container xs={12}>
            <Grid item xs={4}>
              <ReuseKaragarOffice name='hajir_office'
                label='प्यारोल बस्ने जिल्ला/कारागार'
                control={control} />
            </Grid>
            <Grid item xs={4}>
              <ReuseDateField
                name='hajir_current_date_bs'
                label='प्यारोल बसेको मिति'
                placeholder='YYYY-MM-DD'
                control={control} />
            </Grid>
            <Grid item xs={4}>
              <ReuseDateField
                name='hajir_next_date_bs'
                label='हाजिर हुने मिति'
                placeholder='YYYY-MM-DD'
                control={control} />
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>रद्द गर्नुहोस्</Button>
        <Button
          onClick={handleSubmit( onSubmit )}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          सेभ गर्नुहोस्
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PyarolKaragarStatusModal;
