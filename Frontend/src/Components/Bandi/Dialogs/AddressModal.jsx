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
import ReuseCountry from "../../ReuseableComponents/ReuseCountry";
import ReuseState from "../../ReuseableComponents/ReuseState";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseMunicipality from "../../ReuseableComponents/ReuseMunicipality";
import ReuseInput from "../../ReuseableComponents/ReuseInput";


const AddressModal = ({ open, onClose, onSave, editingData }) => {
    const {
        control,
        handleSubmit,
        reset,
        register,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: { editingData },
    });
    // console.log(editingData)
    useEffect(() => {
        if (editingData) {
            console.log(editingData)
            reset({
                id: editingData.id || "", // ✅ Include this
                bandi_id: editingData.bandi_id || "",
                nationality_id: editingData.country_id || "",
                province_id: editingData.state_id || "",
                district_id: editingData.district_id || "",
                gapa_napa_id: editingData.city_id || "",
                wardno: editingData.wardno || "",
                bidesh_nagarik_address_details: editingData.bidesh_nagarik_address_details || "",
            });
        } else {
            reset({
                id:"",
                bandi_id: "",
                nationality_id: 1,
                province_id: "",
                district_id: "",
                gapa_napa_id: "",
                wardno: "",
                bidesh_nagarik_address_details: ""
            });
        }
    }, [editingData, reset]);

    const onSubmit = (data) => {
        console.log('data:', data, 'id:', editingData?.id)
        onSave(data, editingData?.id);
        onClose();
    };

    const nationality_id = watch("nationality_id");
    const province_id = watch("province_id");
    const district_id = watch("district_id");

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />
                <input type="hidden" {...register("id")} />
                <ReuseCountry
                    name="nationality_id"
                    label="देश"
                    control={control}
                    required={true}
                    error={errors.nationality_id}
                />

                {nationality_id == 1 ? (<>
                    <ReuseState
                        name="province_id"
                        label="प्रदेश"
                        control={control}
                        required={true}
                        error={errors.province_id}
                    />

                    <ReuseDistrict
                        name="district_id"
                        label="जिल्ला"
                        control={control}
                        required={true}
                        error={errors.district_id}
                        selectedState={province_id}
                    />

                    <ReuseMunicipality
                        name="gapa_napa_id"
                        label="गा.पा./न.पा."
                        control={control}
                        required={true}
                        error={errors.gapa_napa_id}
                        selectedDistrict={district_id}
                    />

                    <ReuseInput
                        name="wardno"
                        label="वडा नं."
                        control={control}
                        required={true}
                    />
                </>) : (<>
                    <ReuseInput
                        name="bidesh_nagarik_address_details"
                        label="ठेगाना"
                        control={control}
                        required={true}
                        language='english'
                    />
                </>)}
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

export default AddressModal;
