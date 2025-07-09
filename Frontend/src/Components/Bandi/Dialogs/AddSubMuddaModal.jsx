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
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import fetchMuddaGroups from "../../ReuseableComponents/FetchApis/fetchMuddaGroups";

const AddSubMuddaModal = ( { open, onClose, onSave, editingData } ) => {
    console.log( editingData );
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            mudda_group_id: "",            
            mudda_name: ""
        },
    } );

    const { optrecords, loading } = fetchMuddaGroups();
    // console.log(editingData)
    // useEffect( () => {
    //     if ( editingData ) {
    //         reset( {
    //             bandi_id: editingData.bandi_id || "",
    //             disease_id: editingData.disease_id || "",
    //             disease_name: editingData.disease_name || ""
    //         } );
    //     } else {
    //         reset( {
    //             bandi_id: "",
    //             disease_id: "",
    //             disease_name: ""
    //         } );
    //     }
    // }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <ReuseSelect
                    name="mudda_group_id"
                    label="मुद्दा समुह"
                    options={optrecords}
                    control={control}
                    required={true}
                    error={!!errors.disease_id}
                    helperText={errors.disease_id?.message}
                />

                <Controller
                    name="mudda_name"
                    control={control}
                    rules={{ required: "मुद्दा आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="थप गर्नुपर्ने मुद्दा"
                            fullWidth
                            margin="dense"
                            error={!!errors.mudda_name}
                            helperText={errors.mudda_name?.message}
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

export default AddSubMuddaModal;
