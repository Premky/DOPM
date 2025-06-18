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
import { useEffect } from "react";
import ReuseBandi from "../../ReuseableComponents/ReuseBandi";

const PayroleStatusModal = ({ open, onClose, data, kaidimuddas, onSave }) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pyarole_rakhan_upayukat: "",
      dopmremark: "",
    },
  });

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
      <DialogTitle>प्यारोल पास फेल</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <input type='text' value={`${data?.id || ""}`} hidden/>
            <input type='text' name="payrole_id" value={`${data?.payrole_id || ""}`} hidden/>
            <TextField
              fullWidth
              label="कैदी नाम र ठेगाना"
              value={`${data?.bandi_name || ""}, ${fullAddress}`}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <input type="text" value={`${data?.mudda_id||''}`} hidden/>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="मुद्दा"
              value={data?.mudda_name}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register("dopmremark")}
              label="कैफियत"
              defaultValue={data?.dopmremark}
              fullWidth
              multiline
              rows={3}
              error={!!errors.dopmremark}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="प्यारोल पास / फेल"
              fullWidth
              defaultValue={data?.pyarole_rakhan_upayukat}
              {...register("pyarole_rakhan_upayukat", { required: true })}
              error={!!errors.pyarole_rakhan_upayukat}
              helperText={errors.pyarole_rakhan_upayukat ? "चयन गर्नुहोस्" : ""}
            >
              <MenuItem value="छ">पास</MenuItem>
              <MenuItem value="छैन">फेल</MenuItem>
            </TextField>
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

export default PayroleStatusModal;
