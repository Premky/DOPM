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
import fetchBandiTransferReasons from "../../ReuseableComponents/fetchBandiTransferReasons";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";

const BandiTransfer = ( { open, onClose, onSave, editingData } ) => {
    // console.log(editingData)
    const { records: transferReasons, optrecords:transferReasonsOpt, loading: transferReasonsLoading, refetch } = fetchBandiTransferReasons( bandi_id );
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: "",
            relation_id: "",
            contact_name: "",
            contact_address: "",
            contact_contact_details: "",
        },
    } );
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            reset( {
                bandi_id: editingData.bandi_id || "",
                relation_id: editingData.relation_id || "",
                contact_name: editingData.contact_name || "",
                contact_address: editingData.contact_address || "",
                contact_contact_details: editingData.contact_contact_details || "",
            } );
        } else {
            reset( {
                bandi_id: "",
                relation_id: "",
                contact_name: "",
                contact_address: "",
                contact_contact_details: "",
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
                    name="relation_id"
                    label="नाता"
                    options={transferReasonsOpt}
                    control={control}
                    required={true}
                />

                <Controller
                    name="contact_name"
                    control={control}
                    rules={{ required: "नामथर आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="नामथर"
                            fullWidth
                            margin="dense"
                            error={!!errors.contact_name}
                            helperText={errors.contact_name?.message}
                        />
                    )}
                />

                <Controller
                    name="contact_address"
                    control={control}
                    rules={{ required: "ठेगाना आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="ठेगाना"
                            fullWidth
                            margin="dense"
                            error={!!errors.contact_address}
                            helperText={errors.contact_address?.message}
                        />
                    )}
                />

                <Controller
                    name="contact_contact_details"
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
                            error={!!errors.contact_contact_details}
                            helperText={errors.contact_contact_details?.message}
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

export default BandiTransfer;
