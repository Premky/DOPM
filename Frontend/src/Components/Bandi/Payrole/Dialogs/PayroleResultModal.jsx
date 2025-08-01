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
import ReuseBandi from "../../../ReuseableComponents/ReuseBandi";
import Swal from "sweetalert2";

const PayroleResultModal = ( { open, onClose, data, kaidimuddas, onSave, payrole_status } ) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm( {
    defaultValues: {
      payrole_id:"",
      pyarole_rakhan_upayukat: "",
      dopmremark: "",
    },
  } );

  // console.log(data)
  useEffect( () => {
    if ( data ) {
      reset( {
        payrole_id: data?.payrole_id || "",
        dopmremark: data?.dopmremark || "",
        pyarole_rakhan_upayukat: data?.pyarole_rakhan_upayukat || "",
      } );
    }
  }, [data, reset] );

  const onSubmit = async ( formValues ) => {
    onSave( formValues);
        onClose();
  };



  const fullAddress =
    data?.nationality === "स्वदेशी"
      ? `${ data?.city_name_np }-${ data?.wardno }, ${ data?.district_name_np }, ${ data?.state_name_np }, ${ data?.country_name_np }`
      : `${ data?.bidesh_nagarik_address_details }, ${ data?.country_name_np }`;

  const muddaName = kaidimuddas?.[0]?.mudda_name || "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <form onSubmit={handleSubmit( onSubmit )}>
          <Grid container spacing={2} mt={1}>
            <input type="hidden" {...register( "payrole_id" )} value={data?.payrole_id || ""} />
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="कैदी नाम र ठेगाना"
                value={`${ data?.bandi_name || "" }, ${ fullAddress }`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="प्यारोल पास / फेल"
                fullWidth
                {...register( "pyarole_rakhan_upayukat", { required: true } )}
                error={!!errors.pyarole_rakhan_upayukat}
                helperText={errors.pyarole_rakhan_upayukat ? "चयन गर्नुहोस्" : ""}
              >
                <MenuItem value="योग्य">योग्य</MenuItem>
                <MenuItem value="अयोग्य">अयोग्य</MenuItem>
                <MenuItem value="छलफल">छलफल</MenuItem>
                <MenuItem value="कागजात अपुग">कागजात अपुग</MenuItem>
                <MenuItem value="पास">पास</MenuItem>
                <MenuItem value="फेल">फेल</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                {...register( "dopmremark" )}
                label="कैफियत"
                fullWidth
                multiline
                rows={3}
                error={!!errors.dopmremark}
              />
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
            <Button type="submit" variant="contained" color="success">
              सेभ गर्नुहोस्
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>

  );
};

export default PayroleResultModal;
