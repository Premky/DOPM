import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";

const CourtDecisionDialog = ( { open, onClose, onSave, data } ) => {
  const { control, errors, handleSubmit } = useForm( {
    defaultValues: {
      payrole_id: data?.payrole_id,
      payrole_granted_court: "",
      payrole_granted_aadesh_date: "",
      payrole_granted_letter_no: "",
      payrole_granted_letter_date: "",
      payrole_result: "",
      court_remarks: ""
    }
  } );

  const submit = ( data ) => {
    onSave( data );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>अदालतको निर्णय</DialogTitle>

      <DialogContent>
        {/* <input type='text' value={`${ editingData?.id || "" }`} hidden />
        <input type='text' name="payrole_id" value={`${ editingData?.payrole_id || "" }`} hidden />
        <TextField
          sx={{ mt: 1 }}
          fullWidth
          label="कैदी नाम र ठेगाना"
          value={`${ editingData?.office_bandi_id || "" }, ${ editingData?.bandi_name || "" }, ${ fullAddress }`}
          InputProps={{ readOnly: true }}
        /> */}

        {/* <Controller
          name="payrole_granted_court"
          control={control}
          render={( { field } ) => (
            <TextField {...field} label="अदालत" fullWidth margin="dense" />
          )}
        /> */}

        <ReuseOffice
          name="payrole_granted_court"
          label="अदालत"
          required={true}
          control={control}
        // error={errors.payrole_granted_court}
        />

        {/* <Controller
          name="payrole_granted_aadesh_date"
          control={control}
          render={( { field } ) => (
            <TextField {...field} label="आदेश मिति (BS)" fullWidth margin="dense" />
          )}
        /> */}

        <ReuseDateField
          name="payrole_granted_aadesh_date"
          label="आदेश मिति (BS)"
          placeholder='YYYY-MM-DD'
          required={true}
          control={control}
        // error={errors.payrole_granted_aadesh_date}
        />

        <Controller
          name="payrole_granted_letter_no"
          control={control}
          render={( { field } ) => (
            <TextField {...field} label="अदालतको पत्रको च.नं." fullWidth margin="dense" />
          )}
        />

        <Controller
          name="payrole_granted_letter_date"
          control={control}
          render={( { field } ) => (
            <TextField {...field} label="पत्र मिति (BS)" fullWidth margin="dense" />
          )}
        />

        <Controller
          name="payrole_result"
          control={control}
          render={( { field } ) => (
            <TextField {...field} select label="निर्णय" fullWidth margin="dense">
              <MenuItem value="पास">स्वीकृत</MenuItem>
              <MenuItem value="फेल">अस्वीकृत</MenuItem>
            </TextField>
          )}
        />

        <Controller
          name="court_remarks"
          control={control}
          render={( { field } ) => (
            <TextField {...field} label="कैफियत" fullWidth multiline rows={3} />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>रद्द</Button>
        <Button onClick={handleSubmit( submit )} variant="contained">
          सुरक्षित गर्नुहोस्
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourtDecisionDialog;
