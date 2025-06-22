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
import ReuseBandi from "../../ReuseableComponents/ReuseBandi";
import ReusePayroleNos from "../../ReuseableComponents/ReusePayroleNos";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict"

import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";

const PyarolKaragarStatusModal = ({ open, onClose, data, kaidimuddas, onSave }) => {
  const BASE_URL = useBaseURL();
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pyarole_rakhan_upayukat: "",
      dopmremark: "",
    },
  });


  const [payroleNosDetails, setPayroleNosDetails] = useState([]);

  const fetchPayrolNos = async () => {
    try {
      const url = `${BASE_URL}/public/get_payrole_nos`;
      const response = await axios.get(url, {}, { withCredentials: true });

      const { Status, Result, Error } = response.data;

      if (Status) {
        if (Array.isArray(Result) && Result.length > 0) {
          // const formatted = Result.map((opt) => ({
          //   label: opt.payrole_no_name, // Use Nepali name
          //   value: opt.id, // Use ID as value
          // }));
          setPayroleNosDetails(Result);
        } else {
          console.log('No Payrole_No records found.');
        }
      } else {
        console.log(Error || 'Failed to fetch Payrole no.');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  useEffect(() => {
    fetchPayrolNos();
  }, []);

  // console.log(data)
  useEffect(() => {
    if (data) {
      reset({
        dopmremark: data?.dopmremark || "",
        pyarole_rakhan_upayukat: data?.pyarole_rakhan_upayukat || "",
      });
    }
  }, [data, reset]);

  const onSubmit = (formValues) => {
    onSave({ ...data, ...formValues });
    onClose();
  };

  const fullAddress =
    data?.nationality === "स्वदेशी"
      ? `${data?.city_name_np}-${data?.wardno}, ${data?.district_name_np}, ${data?.state_name_np}, ${data?.country_name_np}`
      : `${data?.bidesh_nagarik_address_details}, ${data?.country_name_np}`;

  const muddaName = kaidimuddas?.[0]?.mudda_name || "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>प्यारोल अवस्था </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <input type='text' value={`${data?.id || ""}`} hidden />
            <input type='text' name="payrole_id" value={`${data?.payrole_id || ""}`} hidden />
            <TextField
              fullWidth
              label="कैदी नाम र ठेगाना"
              value={`${data?.bandi_name || ""}, ${fullAddress}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <input type="text" value={`${data?.mudda_id || ''}`} hidden />
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="मुद्दा"
              value={data?.mudda_name}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="beruju"
                label="बेरुजु भए"
                value={`${data?.hirasat_years || 0}|${data?.hirasat_months || 0}|${data?.hirasat_days || 0}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="arrest_date"
                label="थुनामा परेको मिति"
                value={`${data?.thuna_date_bs || '0000-00-00'}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                name="release_date"
                label="छुट्ने मिति"
                value={`${data?.release_date_bs || '0000-00-00'}`}
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
              {...register("payrole_result", { required: true })}
              error={!!errors.result}
              helperText={errors.payrole_result ? "चयन गर्नुहोस्" : ""}
            >
              <MenuItem value="5">पास</MenuItem>
              <MenuItem value="6">फेल</MenuItem>
            </TextField>
          </Grid>


          <Grid item xs={12}>
            <TextField
              {...register("payrole_decision_remark")}
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
        <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
          सेभ गर्नुहोस्
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PyarolKaragarStatusModal;
