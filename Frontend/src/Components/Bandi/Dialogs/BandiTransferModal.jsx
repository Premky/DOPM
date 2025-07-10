import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid2,
    TextareaAutosize,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import fetchBandiTransferReasons from "../../ReuseableComponents/fetchBandiTransferReasons";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import { Label } from "@mui/icons-material";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseDatePickerBS from "../../ReuseableComponents/ReuseDatePickerBS";

const BandiTransfer = ( { open, onClose, onSave, editingData, bandi_id } ) => {
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
            transfer_from_office_id: "",
            transfer_to_office_id: "",
            transfer_from_date: "",
            transfer_to_date: "",
            transfer_reason_id: "",
            transfer_reason: "",
            
        },
    } );
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            reset( {
                bandi_id: editingData.bandi_id || "",
                transfer_from_office_id: editingData.transfer_from_office_id || "",
                transfer_to_office_id: editingData.transfer_to_office_id || "",
                transfer_from_date: editingData.transfer_from_date || "",
                transfer_to_date: editingData.transfer_to_date || "",
                transfer_reason_id: editingData.transfer_reason_id || "",
                transfer_reason: editingData.transfer_reason || "",
                
            } );
        } else {
            reset( {
                bandi_id: "",
                transfer_from_office_id: "",
                transfer_to_office_id: "",
                transfer_from_date: "",
                transfer_to_date: "",
                transfer_reason_id: "",
                transfer_reason: "",
                
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
                <Grid2 container>
                    <Grid2 size={{ xs: 6 }}>
                        <ReuseKaragarOffice
                            name="transfer_from_office_id"
                            label="हालको कार्यालय"
                            control={control}
                            required={true}
                            error={!!errors.transfer_from_office_id}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 6 }}>
                        <ReuseKaragarOffice
                            name="transfer_to_office_id"
                            label="जान चाहेको कार्यालय"
                            control={control}
                            required={true}
                            error={!!errors.transfer_to_office_id}
                        />
                    </Grid2>
                </Grid2>

                <Grid2>
                    <ReuseSelect
                        name="transfer_reason_id"
                        label="सरुवाको कारण"
                        options={transferReasonsOpt}
                        control={control}
                        required={true}
                        error={!!errors.transfer_reason_id}
                    />
                </Grid2>

                <Grid2>
                    <ReuseInput
                        name="transfer_reason"
                        label="सरुवा विवरण"
                        control={control}
                        margin="dense"
                        error={!!errors.transfer_reason}
                        helperText={errors.transfer_reason?.message}
                    />
                </Grid2>

                <Grid2 container>
                    <Grid2 size={{ xs: 6 }}>
                        <ReuseDatePickerBS
                            name='transfer_from_date'
                            label='देखी'
                            required={true}
                            control={control}
                            error={!!errors.transfer_from_date}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 6 }}>
                        <ReuseDatePickerBS
                            name='transfer_to_date'
                            label='सम्म'
                            required={true}
                            control={control}
                            error={!!errors.transfer_to_date}
                        />
                    </Grid2>
                    {/* <Grid2 size={{xs:12}}>
                        <ReuseInput
                            name="remarks"
                            label="कैफियत"
                            control={control}
                            margin="dense"
                            error={!!errors.remarks}
                            helperText={errors.remarks?.message}
                        />
                    </Grid2> */}
                </Grid2>


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
