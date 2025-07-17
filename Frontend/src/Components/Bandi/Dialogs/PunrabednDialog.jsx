import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReusePunarabedanOffice from "../../ReuseableComponents/ReusePunarabedanOffice";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";



const PunrabednDialog = ({ open, onClose, onSave, editingData }) => {
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset, // 👈 this will reset the form with new data
    } = useForm({
        defaultValues: editingData || {}, // initially empty
    });

    useEffect(() => {
        if (editingData) {
            reset(editingData); // ⬅️ important!
        }
    }, [editingData, reset]);

    const onSubmit = (data) => {
        onSave(data, editingData?.id);
        onClose();
    }

    const mudda_condition = watch('mudda_condition')
    const amount_deposited = watch('amount_deposited')
    const amount_fixed = watch('amount_fixed')
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>पुनरावेदनमा नपरेको प्रमाण विवरण संपादित गर्नुहोस्</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12}}>
                        <ReusePunarabedanOffice
                            name='punarabedan_office_id'
                            label="कार्यालय"
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_id}
                            // name_type='short'
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12}}>
                        <ReuseDistrict
                            name='punarabedan_office_district'
                            label="फैसला भएको जिल्ला"
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_district}
                        />
                    </Grid> */}

                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ReuseDateField
                            name='punarabedan_office_date'
                            label="मिति"
                            placeholder='YYYY-MM-DD'
                            required={true}
                            control={control}
                            error={errors.punarabedan_office_date}
                        />
                    </Grid>
                </Grid>
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