import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Grid2 } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";


const PunrabednDialog = ({ open, onClose, data, onSave }) => {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset, // 👈 this will reset the form with new data
    } = useForm({
        defaultValues: data || {}, // initially empty
    });
    // console.log(data)
    // ⏱ Update form values when `data` changes
    useEffect(() => {
        if (data) {
            reset(data); // ⬅️ important!
        }
    }, [data, reset]);

    const onSubmit = (formValues) => {
        console.log(formValues)
        onSave({ ...data, ...formValues }); // merge original ID & values
        onClose();
    };

    const mudda_condition = watch('mudda_condition')
    const amount_deposited = watch('amount_deposited')
    const amount_fixed = watch('amount_fixed')
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>पुनरावेदनमा नपरेको प्रमाण विवरण संपादित गर्नुहोस्</DialogTitle>
            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 xs={12} sm={6}>
                        <ReuseOffice
                            name='punarabedan_office_id'
                            label="कार्यालय"
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_id}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseDistrict
                            name='punarabedan_office_district'
                            label="फैसला भएको जिल्ला"
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_district}
                        />
                    </Grid2>

                    <Grid2 xs={12} sm={6}>
                        <ReuseInput
                            name='punarabedan_office_ch_no'
                            label="च.नं."
                            required={true}
                            control={control}
                            options={[
                                { label: 'होइन', value: 0 },
                                { label: 'हो', value: 1 },
                            ]}
                            error={errors.punarabedan_office_ch_no}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseDateField
                            name='punarabedan_office_date'
                            label="मिति"
                            placeholder='YYYY-MM-DD'
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_date}
                        />
                    </Grid2>
                </Grid2>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit(onSubmit)} variant="contained">
                    अपडेट गर्नुहोस्
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PunrabednDialog;