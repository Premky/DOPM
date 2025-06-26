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
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";


const MuddaDialog = ({ open, onClose, onSave, editingData }) => {
    const {
        control, handleSubmit, reset, formState: { errors },
    } = useForm({
        defaultValues: {
            bandi_id: "",
            mudda_id: "",
            mudda_list: "",
            mudda_no: "",
            vadi: "",
            mudda_condition: "",
            mudda_phesala_antim_office_id: "",
            mudda_phesala__antim_office_name: "",
            mudda_phesala_antim_office_district: "",
            mudda_phesala_antim_office_date: "",
            is_last_mudda: "",
            is_main_mudda: ""
        },
    });

    useEffect(() => {
        if (editingData) {
            reset({
                bandi_id: bandi_id,
                mudda_id: mudda_id,
                mudda_list: mudda_list,
                mudda_no: mudda_no || "",
                vadi: vadi || "",
                mudda_condition: mudda_condition || "",
                mudda_phesala_antim_office_id: mudda_phesala_antim_office_id || "",
                mudda_phesala_antim_office_name: mudda_phesala_antim_office_name || "",
                mudda_phesala_antim_office_district: mudda_phesala_antim_office_district || "",
                mudda_phesala_antim_office_date: mudda_phesala_antim_office_date || "",
                is_last_mudda: is_last_mudda || "",
                is_main_mudda: is_main_mudda || ""
            });
        } else {
            reset({
                bandi_id: "",
                mudda_id: "",
                mudda_list: "",
                mudda_no: "",
                vadi: "",
                mudda_condition: "",
                mudda_phesala_antim_office_id: "",
                mudda_phesala__antim_office_name: "",
                mudda_phesala_antim_office_district: "",
                mudda_phesala_antim_office_date: "",
                is_last_mudda: "",
                is_main_mudda: ""
            })
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

                <ReuseMudda
                    name="mudda_id"
                    label="मुद्दा"
                    control={control}
                    required={true}
                />

                <ReuseInput
                    name="mudda_no"
                    label="मुद्दा नं."
                    control={control}
                    required={true}
                />

                <ReuseSelect
                    name={`mudda_condition`}
                    label="मुद्दाको अवस्था?"
                    required={true}
                    control={control}
                    options={[
                        { label: 'चालु', value: 1 },
                        { label: 'अन्तिम भएको', value: 0 },
                    ]}
                    error={errors[`mudda_condition`]}
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

export default MuddaDialog;