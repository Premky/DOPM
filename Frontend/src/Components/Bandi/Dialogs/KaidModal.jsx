import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseDatePickerBS from "../../ReuseableComponents/ReuseDatePickerBS";


const KaidModal = ( { open, onClose, onSave, editingData } ) => {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm( {
        defaultValues: { editingData },
    } );
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            console.log( editingData );
            reset( {
                bandi_id: editingData.bandi_id || "",
                bandi_type: editingData.bandi_type || "",
                hirasat_years: editingData.hirasat_years || "",
                hirasat_months: editingData.hirasat_months || "",
                hirasat_days: editingData.hirasat_days || "",
                thuna_date_bs: editingData.thuna_date_bs || "",
                release_date_bs: editingData.release_date_bs || "",
                is_life_time: editingData.is_life_time || false,
            } );
        } else {
            reset( {
                bandi_id: "",
                bandi_type: 1,
                hirasat_years: "",
                hirasat_months: "",
                hirasat_days: "",
                thuna_date_bs: "",
                release_date_bs: "",
                is_life_time: false,
            } );
        }
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    const bandi_type = watch( "bandi_type" );
    const is_life_time = watch( "is_life_time" );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />

                <Grid size={{ xs: 12 }}>

                    <ReuseSelect
                        name="bandi_type"
                        label="बन्दी प्रकार"
                        options={[
                            { label: 'कैदी', value: 'कैदी' }, { label: 'थुनुवा', value: 'थुनुवा' }
                        ]}
                        control={control}
                        required={true}
                        error={errors.bandi_type}
                    />
                </Grid>

                <Grid container spacing={2} size={{ xs: 12 }}>
                    <Grid size={{ xs: 4 }}>
                        <ReuseInput
                            type="number"
                            name="hirasat_years"
                            label="हिरासत बसेको अवधी (वर्ष)"
                            placeholder='वर्ष'
                            defaultValue={0}
                            control={control}
                            required={true}
                            error={errors.hirasat_years}
                        />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                        <ReuseInput
                            name="hirasat_months"
                            label="हिरासत बसेको अवधी (महिना)"
                            placeholder='महिना'
                            defaultValue={0}
                            type='number'
                            control={control}
                            required={true}
                            error={errors.hirasat_months}
                        />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                        <ReuseInput
                            name="hirasat_days"
                            label="हिरासत बसेको अवधी (दिन)"
                            placeholder='दिन'
                            defaultValue={0}
                            type='number'
                            required={false}
                            control={control}
                            error={errors.hirasat_days}
                        />
                    </Grid>
                </Grid>

                <ReuseDatePickerBS
                    name="thuna_date_bs"
                    label="थुना/कैद परेको मितिः"
                    control={control}
                    required={true}
                    error={errors.thuna_date_bs}
                />
                <ReuseSelect
                    name="is_life_time"
                    label="आजिवन कैद हो/होइन?"
                    required={false}
                    options={[
                        { value: '1', label: 'हो' },
                        { value: '0', label: 'होइन' }
                    ]}
                    control={control}
                    error={errors.is_life_time}
                />

                {bandi_type == 'कैदी' ? (
                     is_life_time==0 && ( <ReuseDateField
                        name="release_date_bs"
                        label="छुटी जाने मिति"
                        control={control}
                        required={true}
                        error={errors.release_date_bs}
                    /> )

                ) : ( <></> )}
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

export default KaidModal;
