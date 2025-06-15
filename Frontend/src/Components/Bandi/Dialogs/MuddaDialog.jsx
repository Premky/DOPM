import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Grid2 } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";


const MuddaEditDialog = ({ open, onClose, data, onSave }) => {
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
        onSave({ ...data, ...formValues }); // merge original ID & values
        onClose();
    };

    const mudda_condition = watch('mudda_condition')
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>मुद्दा सम्पादन गर्नुहोस्</DialogTitle>
            <DialogContent>
                <Grid2 container spacing={2}>
                    <Grid2 xs={12} md={12}>
                        <ReuseMudda
                            name="mudda_id"
                            label="मुद्दा"
                            control={control}
                            error={errors.mudda_id}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseInput
                            name="mudda_no"
                            label="मुद्दा नं."
                            control={control}
                            error={errors.mudda_no}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseSelect
                            name='mudda_condition'
                            label="मुद्दाको अवस्था?"
                            required={true}
                            control={control}
                            options={[
                                { label: 'चालु', value: 1 },
                                { label: 'अन्तिम भएको', value: 0 },
                            ]}
                            error={errors.mudda_condition}
                        />
                    </Grid2>

                    <Grid2 xs={12} sm={6}>
                        <ReuseOffice
                            name='mudda_phesala_antim_office_id'
                            label="फैसला भएको कार्यालय"
                            required={true}
                            control={control}
                            error={errors.mudda_phesala_antim_office_id}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseDistrict
                            name='mudda_phesala_antim_office_district'
                            label="फैसला भएको जिल्ला"
                            required={true}
                            control={control}
                            error={errors.mudda_phesala_antim_office_district}
                        />
                    </Grid2>
                    {mudda_condition == 0 && (<>
                        <Grid2 xs={12} sm={6}>
                            <ReuseDateField
                                name='mudda_phesala_antim_office_date'
                                label="फैसला भएको मिति"
                                placeholder="YYYY-MM-DD"
                                required={true}
                                control={control}
                                error={errors.mudda_phesala_antim_office_date}
                            />
                        </Grid2>
                    </>)}

                    <Grid2 xs={12} sm={6}>
                        <ReuseSelect
                            name={`is_main_mudda`}
                            label="मुख्य मुददा हो/होइन?"
                            required={true}
                            control={control}
                            options={[
                                { label: 'होइन', value: 0 },
                                { label: 'हो', value: 1 },
                            ]}
                            error={errors[`is_main_mudda`]}
                        />
                    </Grid2>
                    <Grid2 xs={12} sm={6}>
                        <ReuseSelect
                            name={`is_last_mudda`}
                            label="अन्तिम मुददा हो/होइन?"
                            required={true}
                            control={control}
                            options={[
                                { label: 'होइन', value: 0 },
                                { label: 'हो', value: 1 },
                            ]}
                            error={errors[`is_last_mudda`]}
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

export default MuddaEditDialog;