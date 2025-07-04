import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Grid2 } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseDatePickerBS from "../../ReuseableComponents/ReuseDatePickerBS";

const FineEditDialog = ({ open, onClose, onSave, editingData }) => {
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
            reset({ ...editingData }); // ⬅️ important!
        }
    }, [editingData, reset]);

    const onSubmit = (data) => {
        onSave(data, editingData?.id);
        onClose();
    };

    const mudda_condition = watch('mudda_condition')
    const amount_deposited = watch('amount_deposited')
    const amount_fixed = watch('amount_fixed')
    return (
         <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>जरिवाना/क्षतिपुर्ती/बिगो विवरण {editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                    <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />

                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <ReuseSelect
                            name="fine_type"
                            label="जरिवाना/क्षतिपुर्ती/बिगो"
                            options={[
                                {label:'जरिवाना', value:'जरिवाना'},
                                {label:'क्षतिपुर्ति', value:'क्षतिपुर्ती'},
                                {label:'विगो तथा कोष', value:'विगो तथा कोष'}
                            ]}
                            readonly={true}
                            control={control}
                            error={errors.fine_type}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <ReuseSelect
                            name='amount_fixed'
                            label='छ/छैन'
                            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                            required={true}
                            control={control}
                            error={errors.amount_fixed}
                        />
                    </Grid2>
                    {amount_fixed == 1 && (
                        <>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <ReuseSelect
                                    name='amount_deposited'
                                    label='तिरेको छ/छैन'
                                    options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                                    required={true}
                                    control={control}
                                    error={errors.amount_deposited}
                                />
                            </Grid2>
                            {amount_deposited == 1 && (<>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <ReuseOffice
                                        name='deposit_office'
                                        label="कार्यालय"
                                        required={true}
                                        control={control}
                                        error={errors.deposit_office}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <ReuseDistrict
                                        name='deposit_district'
                                        label="फैसला भएको जिल्ला"
                                        required={true}
                                        control={control}
                                        error={errors.deposit_district}
                                    />
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <ReuseInput
                                        name='deposit_ch_no'
                                        label="च.नं."
                                        required={true}
                                        control={control}
                                        options={[
                                            { label: 'होइन', value: 0 },
                                            { label: 'हो', value: 1 },
                                        ]}
                                        error={errors.deposit_ch_no}
                                    />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <ReuseDatePickerBS
                                        name='deposit_date'
                                        label="मिति"
                                        placeholder='YYYY-MM-DD'
                                        required={true}
                                        control={control}
                                        error={errors.deposit_date}
                                    />
                                </Grid2>
                            </>)}

                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <ReuseInput
                                    name='deposit_amount'
                                    label="रकम"
                                    required={true}
                                    control={control}
                                    error={errors.deposit_amount}
                                />
                            </Grid2>
                        </>
                    )}



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

export default FineEditDialog;