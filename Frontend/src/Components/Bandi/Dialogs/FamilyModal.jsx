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
import ReuseRelativeRelations from "../../ReuseableComponents/ReuseRelativeRelations";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseDatePickerBS from "../../ReuseableComponents/ReuseDatePickerBS";

const FamilyModal = ( { open, onClose, onSave, editingData } ) => {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: "",
            relation_np: "",
            relative_name: "",
            relative_address: "",
            contact_no: "",
            is_dependent: "",
            dob: "",
        },
    } );
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            reset( {
                bandi_id: editingData.bandi_id || "",
                relation_np: editingData.relation_id || "",
                relative_name: editingData.relative_name || "",
                relative_address: editingData.relative_address || "",
                contact_no: editingData.contact_no || "",
                is_dependent: editingData.is_dependent || "",
                dob: editingData.dob || "",
            } );
        } else {
            reset( {
                bandi_id: "",
                relation_np: "",
                relative_name: "",
                relative_address: "",
                contact_no: "",
                is_dependent: "",
                dob: "",
            } );
        }
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    const isDependent = watch( "is_dependent" );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />

                <ReuseRelativeRelations
                    name="relation_np"
                    label="नाता"
                    control={control}
                    required={true}
                />


                <Controller
                    name="relative_name"
                    control={control}
                    rules={{ required: "नामथर आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="नामथर"
                            fullWidth
                            margin="dense"
                            error={!!errors.relative_name}
                            helperText={errors.relative_name?.message}
                        />
                    )}
                />

                <Controller
                    name="relative_address"
                    control={control}
                    rules={{ required: "ठेगाना आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="ठेगाना"
                            fullWidth
                            margin="dense"
                            error={!!errors.relative_address}
                            helperText={errors.relative_address?.message}
                        />
                    )}
                />

                <Controller
                    name="contact_no"
                    control={control}
                    rules={{
                        required: "सम्पर्क नम्बर आवश्यक छ",
                        pattern: {
                            value: /^[0-9]{7,15}$/,
                            message: "मान्य सम्पर्क नम्बर राख्नुहोस्",
                        },
                    }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="सम्पर्क नं."
                            fullWidth
                            margin="dense"
                            error={!!errors.contact_no}
                            helperText={errors.contact_no?.message}
                        />
                    )}
                />
                {/* <Grid size={{ xs: 12, sm: 6, md: 2 }}> */}
                <ReuseSelect
                    name={`is_dependent`}
                    label="आश्रीत हो/होइन?"
                    options={[
                        { value: 1, label: 'हो' },
                        { value: 0, label: 'होइन' }
                    ]}
                    control={control}
                    error={errors?.is_dependent}
                />
                {/* </Grid> */}
                {isDependent === 1 && (

                    <ReuseDatePickerBS
                        name={`dob`}
                        label="जन्म मिति"
                        type="number"
                        control={control}
                        error={errors?.bandi_relative_dob}
                    />
                )}
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

export default FamilyModal;
