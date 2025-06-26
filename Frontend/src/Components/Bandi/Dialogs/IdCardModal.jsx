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
import ReuseIdCards from "../../ReuseableComponents/ReuseIdCards";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";

const IdCardModal = ({ open, onClose, onSave, editingData }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            bandi_id: "",
            card_type_id: "",
            card_no: "",
            card_issue_district: "",
            card_issue_date: "",
        },
    });
    // console.log(editingData)
    useEffect(() => {
        if (editingData) {
            reset({
                bandi_id: editingData.bandi_id || "",
                card_type_id: editingData.card_type_id || "",
                card_no: editingData.card_no || "",
                card_issue_district: editingData.card_issue_district || "",
                card_issue_date: editingData.card_issue_date || "",
            });
        } else {
            reset({
                bandi_id: "",
                card_type_id: "",
                card_no: "",
                card_issue_district: "",
                card_issue_date: "",
            });
        }
    }, [editingData, reset]);

    const onSubmit = (data) => {
        onSave(data, editingData?.id);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />

                <ReuseIdCards
                    name="card_type_id"
                    label="कार्ड"
                    control={control}
                    required={true}
                />

                <Controller
                    name="card_no"
                    control={control}
                    rules={{ required: "नामथर आवश्यक छ" }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="नामथर"
                            fullWidth
                            margin="dense"
                            error={!!errors.card_no}
                            helperText={errors.card_no?.message}
                        />
                    )}
                />

                <ReuseDistrict
                    name="card_issue_district"
                    label="जारी जिल्ला"
                    control={control}
                    required={true}
                />

                <ReuseDateField
                    name="card_issue_date"
                    label="जारी मिति"
                    control={control}
                    required={true}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
                    {editingData ? "अपडेट गर्नुहोस्" : "थप्नुहोस्"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IdCardModal;
