import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import fetchDisabilities from "../../ReuseableComponents/fetchDisabilities";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
const DisabilityModal = ( { open, onClose, onSave, editingData } ) => {
        
    console.log( editingData );
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: "",
            disability_id: "",
            disability_name: ""
        },
    } );

    const { optrecords, loading } = fetchDisabilities();
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            reset( {
                bandi_id: editingData.bandi_id || "",
                disability_id: editingData.disability_id || "",
                disability_name: editingData.disability_name || ""
            } );
        } else {
            reset( {
                bandi_id: "",
                disability_id: "",
                disability_name: ""
            } );
        }
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id}
                    hidden
                />
                <ReuseSelect
                    name="disability_id"
                    label="अशक्तता"
                    options={optrecords}
                    control={control}
                    required={true}
                    error={!!errors.disability_id}
                    helperText={errors.disability_id?.message}
                />

                <Controller
                    name="disability_name"
                    control={control}
                    // rules={{ required: "ठेगाना आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="अन्य भए"
                            fullWidth
                            margin="dense"
                            error={!!errors.disability_name}
                            helperText={errors.disability_name?.message}
                        />
                    )}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit( onSubmit )} variant="contained" color="primary">
                    {editingData ? "अपडेट गर्नुहोस्" : "थप्नुहोस्"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DisabilityModal;
