import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    TextareaAutosize,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import fetchBandiTransferReasons from "../../ReuseableComponents/fetchBandiTransferReasons";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseInput from "../../ReuseableComponents/ReuseInput";

const BandiEscapeModal = ( { open, onClose, onSave, editingData, bandi_id } ) => {
    // console.log(editingData)
    const { records: transferReasons, optrecords: transferReasonsOpt, loading: transferReasonsLoading, refetch } = fetchBandiTransferReasons( bandi_id );
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: "",
            escaped_from_office_id: "",
            escape_date_bs: "",
            escape_method: "",
            status: "",
            recapture_date_bs: "",
            enrollment_date_bs: "",
            recaptured_by: "",
            recapture_location: "",
            recapture_notes: "",
            
        },
    } );
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            reset( {
                bandi_id: editingData.bandi_id || "",
                escaped_from_office_id: editingData.escaped_from_office_id || "",
                escape_date_bs: editingData.escape_date_bs || "",
                escape_method: editingData.escape_method || "",
                status: editingData.status || "",
                recapture_date_bs: editingData.recapture_date_bs || "",
                enrollment_date_bs: editingData.enrollment_date_bs || "",
                recaptured_by: editingData.recaptured_by || "",
                recapture_location: editingData.recapture_location || "",
                recapture_notes: editingData.recapture_notes || "",
                
            } );
        } else {
            reset( {
                bandi_id: "",
                escaped_from_office_id: "",
                escape_date_bs: "",
                escape_method: "",
                status: "",
                recapture_date_bs: "",
                enrollment_date_bs: "",
                recaptured_by: "",
                recapture_location: "",
                recapture_notes: "",
                
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
                <Grid container>
                    <Grid size={{ xs: 6 }}>
                        <ReuseKaragarOffice
                            name="escaped_from_office_id"
                            label="हालको कार्यालय"
                            control={control}
                            required={true}
                            error={!!errors.escaped_from_office_id}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <ReuseKaragarOffice
                            name="transfer_to_office_id"
                            label="सरुवा भएको कार्यालय"
                            control={control}
                            required={true}
                            error={!!errors.transfer_to_office_id}
                        />
                    </Grid>
                </Grid>

                <Grid>
                    <ReuseSelect
                        name="transfer_reason_id"
                        label="सरुवाको कारण"
                        options={transferReasonsOpt}
                        control={control}
                        required={true}
                        error={!!errors.transfer_reason_id}
                    />
                </Grid>

                <Grid>
                    <ReuseInput
                        name="transfer_reason"
                        label="सरुवा विवरण"
                        control={control}
                        margin="dense"
                        error={!!errors.transfer_reason}
                        helperText={errors.transfer_reason?.message}
                    />
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 6 }}>
                        <ReuseDateField
                            name='escape_date_bs'
                            label='भागेको मिति'
                            placeholder='YYYY-MM-DD'
                            required={true}
                            control={control}
                            error={!!errors.escape_date_bs}
                        />
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                        <ReuseDateField
                            name='transfer_to_date'
                            label='सम्म'
                            placeholder='YYYY-MM-DD'
                            required={true}
                            control={control}
                            error={!!errors.transfer_to_date}
                        />
                    </Grid>
                    <Grid size={{xs:12}}>
                        <ReuseInput
                            name="escape_method"
                            label="भाग्ने विधि तरिका"
                            control={control}
                            margin="dense"
                            error={!!errors.escape_method}                            
                        />
                    </Grid>
                </Grid>


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

export default BandiEscapeModal;
