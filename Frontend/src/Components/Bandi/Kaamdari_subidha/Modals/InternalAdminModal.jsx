import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Grid,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import NepaliDate from "nepali-datetime";

import ReuseKaragarOffice from "../../../ReuseableComponents/ReuseKaragarOffice";
import ReuseInput from "../../../ReuseableComponents/ReuseInput";
import ReuseBandi from "../../../ReuseableComponents/ReuseBandi";
import ReuseBandiRanks from "../../../ReuseableComponents/ReuseBandiRanks";
import ReuseDateField from "../../../ReuseableComponents/ReuseDateField";

import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import { calculateTotalConcession } from "../../../../../Utils/calculateTotalConcession";

const InternalAdminModal = ({ open, onClose, onSave, editingData }) => {
    const BASE_URL =useBaseURL();
    const current_date = new NepaliDate().format("YYYY-MM-DD");

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: editingData || {},
    });

    const appointment_start_date_bs = watch("appointment_start_date_bs");
    const appointment_end_date_bs = watch("appointment_end_date_bs");
    const internal_admin_post_id = watch("internal_admin_post_id");

    const [ranks, setRanks] = useState([]);

    const fetchBandiRanks = async() => {
        const url = `${BASE_URL}/public/get_bandi_ranks`;
        const response = await axios.get(url);
        // console.log(response)
        setRanks(response.data.Result)
    }
    useEffect(()=>{fetchBandiRanks()},[])
    // Calculate appointment duration and update form
    useEffect(() => {
        // console.log('office_id',internal_admin_post_id)
        if (appointment_start_date_bs && appointment_end_date_bs) {
            const duration = calculateBSDate(
                appointment_start_date_bs,
                appointment_end_date_bs
            );
            setValue("appointment_duration", duration.rawFormatted || "");

            if (internal_admin_post_id) {
                // Calculate total concession based on ranks and appointment
                // Assuming you have a function to get ranks list somewhere
                // For example, pass ranks via props or fetch them here.
                // Here, I'll assume a static empty array; replace as needed
                
                console.log('duration', duration, 'rank', ranks, 'id', internal_admin_post_id)
                const concession = calculateTotalConcession(
                    duration,
                    ranks,
                    internal_admin_post_id
                );
                console.log(concession)

                if (concession) {
                    setValue("facility_years", concession.years || 0);
                    setValue("facility_months", concession.months || 0);
                    setValue("facility_days", concession.days || 0);
                }
            }
        }
    }, [
        appointment_start_date_bs,
        appointment_end_date_bs,
        internal_admin_post_id,
        setValue,
    ]);

    // Reset form when editingData changes
    useEffect(() => {
        reset(editingData || {});
    }, [editingData, reset]);

    // On submit handler passes clean data only
    const onSubmit = (data) => {
        onSave(data, editingData?.id);
        onClose();
    };

    const office_id = watch('office_id')

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <Grid container spacing={2}>
                        {/* Office */}
                        <Grid item xs={12} sm={6}>

                            <ReuseKaragarOffice
                                name="office_id"
                                control={control}
                                label="कार्यालय"
                                disabled={false} // you can pass prop to disable if needed
                                error={errors.office_id}
                            />

                        </Grid>

                        {/* Chalani No */}
                        <Grid item xs={12} sm={6}>
                            <ReuseInput
                                name="chalani_no"
                                control={control}
                                rules={{ required: "चलानी नं. आवश्यक छ" }}

                                label="चलानी नं."
                                error={errors.chalani_no}
                            />
                        </Grid>

                        {/* Chalani Date */}
                        <Grid item xs={12} sm={6}>

                            <ReuseDateField
                                name="chalani_date"
                                control={control}
                                defaultValue={current_date}
                                rules={{ required: "चलानी मिति आवश्यक छ" }}
                                label="चलानी मिति"
                                placeholder="YYYY-MM-DD"
                                error={errors.chalani_date}
                            />

                        </Grid>

                        {/* Bandi */}
                        <Grid item xs={12}>
                            <ReuseBandi
                                name="bandi_id"
                                control={control}
                                rules={{ required: "बन्दीको नामथर आवश्यक छ" }}

                                label="बन्दीको नामथर"
                                error={errors.bandi_id}
                                selected_office={office_id}
                            // You can pass selected_office if needed
                            />
                        </Grid>

                        {/* Bandi Address */}
                        <Grid item xs={12} sm={6}>

                            <ReuseInput

                                name="bandi_address"
                                control={control}
                                label="ठेगाना"
                                error={errors.bandi_address}
                            />

                        </Grid>

                        {/* Bandi Mudda */}
                        <Grid item xs={12} sm={6}>

                            <ReuseInput
                                name="bandi_mudda"
                                control={control}

                                label="मुद्दा"
                                error={errors.bandi_mudda}
                            />

                        </Grid>

                        {/* Internal Admin Post */}
                        <Grid item xs={12}>
                            <ReuseBandiRanks
                                name="internal_admin_post_id"
                                control={control}
                                rules={{ required: "पद आवश्यक छ" }}
                                label="पद"
                                error={errors.internal_admin_post_id}
                            />
                        </Grid>

                        {/* Appointment Start Date */}
                        <Grid item xs={12} sm={6}>
                            <ReuseDateField
                                name="appointment_start_date_bs"
                                control={control}
                                rules={{ required: "नियुक्ती मिति (देखि) आवश्यक छ" }}
                                label="नियुक्ती मिति (देखि)"
                                error={errors.appointment_start_date_bs}
                            />
                        </Grid>
                        {/* Appointment End Date */}
                        <Grid item xs={12} sm={6}>
                            <ReuseDateField
                                name="appointment_end_date_bs"
                                control={control}
                                rules={{ required: "नियुक्ती मिति (सम्म) आवश्यक छ" }}

                                label="नियुक्ती मिति (सम्म)"
                                error={errors.appointment_end_date_bs}
                            />
                        </Grid>
                        {/* Appointment Duration (read-only) */}
                        <Grid item xs={12}>
                            <ReuseInput
                                name="appointment_duration"
                                control={control}
                                label="नियुक्ती अवधी"
                                disabled
                                error={errors.appointment_duration}
                            />
                        </Grid>

                        {/* Facility years, months, days */}
                        <Grid item xs={12} sm={4}>

                            <ReuseInput
                                name="facility_years"
                                control={control}
                                label="सुविधा वर्ष"
                                error={errors.facility_years}
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <ReuseInput
                                name="facility_months"
                                control={control}

                                label="सुविधा महिना"
                                error={errors.facility_months}
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>


                            <ReuseInput
                                name="facility_days"
                                control={control}

                                label="सुविधा दिन"
                                error={errors.facility_days}
                                type="number"
                            />

                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    रद्द गर्नुहोस्
                </Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
                    {editingData ? "अपडेट गर्नुहोस्" : "थप्नुहोस्"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InternalAdminModal;
