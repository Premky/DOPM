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
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseOffice from "../../ReuseableComponents/ReuseOffice";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseDatePickerSMV5 from "../../ReuseableComponents/ReuseDatePickerSMV5";
import ReuseDatePickerBS from "../../ReuseableComponents/ReuseDatePickerBS";
import NepaliDate from 'nepali-datetime';

const MuddaDialog = ( { open, onClose, onSave, editingData } ) => {
    const {
        control, handleSubmit, reset, formState: { errors },
    } = useForm( {
        defaultValues: {
            bandi_id: "",
            mudda_id: "",
            mudda_list: "",
            mudda_no: "",
            vadi: "",
            vadi_en: "",
            mudda_condition: "",
            mudda_phesala_antim_office_id: "",
            mudda_phesala_antim_office_name: "",
            mudda_phesala_antim_office_district: "",
            mudda_phesala_antim_office_date: "",
            is_life_time: "",
            thuna_date_bs: "",
            release_date_bs: "",
            is_last_mudda: "",
            is_main_mudda: ""
        },
    } );

    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );

    useEffect( () => {
        // console.log( editingData );
        if ( editingData ) {
            reset( { ...editingData } );
        } else {
            reset( {
                bandi_id: "",
                mudda_id: "",
                mudda_list: "",
                mudda_no: "",
                vadi: "",
                vadi_en:"",
                mudda_condition: "",
                mudda_phesala_antim_office_id: "",
                mudda_phesala_antim_office_name: "",
                mudda_phesala_antim_office_district: "",
                mudda_phesala_antim_office_date: "",
                is_life_time: "",
                thuna_date_bs: "",
                release_date_bs: "",
                is_last_mudda: "",
                is_main_mudda: "",
            } );;
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
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />

                <ReuseMudda
                    name="mudda_id"
                    label="मुद्दा"
                    control={control}
                    required={true}
                />
                <Grid size={{ xs: 12 }}>
                    <ReuseInput
                        name="vadi"
                        label="वादी वा जाहेरवालाको नाम(नेपालीमा)"
                        control={control}
                        required={true}
                        errors={errors.vadi}
                        language='nepali'
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <ReuseInput
                        name="vadi_en"
                        label="वादी वा जाहेरवालाको नाम(IN ENGLISH)"
                        control={control}
                        required={true}
                        errors={errors.vadi_en}
                        language='english'
                    />
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ReuseInput
                            name="mudda_no"
                            label="मुद्दा नं."
                            control={control}
                            required={true}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
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

                    </Grid>
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        <ReuseOffice
                            name="mudda_phesala_antim_office_id"
                            label="मुद्दा फैसला गर्ने कार्यालय"
                            required={true}
                            control={control}
                            error={errors.mudda_phesala_antim_office_id}
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 6 }}>
                        <ReuseDistrict
                            name="mudda_phesala_antim_office_district"
                            label="मुद्दा फैसला गर्ने जिल्ला"
                            required={true}
                            control={control}
                            error={errors.mudda_phesala_antim_office_district}
                        />
                    </Grid> */}
                </Grid>

                <Grid container>
                    <Grid size={{ xs: 12 }}>
                        हिरासत बसेको अवधी
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseInput
                            name="hirasat_years"
                            label="वर्ष"
                            type="number"
                            control={control}
                            required={true}
                            defaultValue={0}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseInput
                            name="hirasat_months"
                            label="महिना"
                            type="number"
                            control={control}
                            required={true}
                            defaultValue={0}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseInput
                            name="hirasat_days"
                            label="दिन"
                            type="number"
                            control={control}
                            required={true}
                            defaultValue={0}
                        />
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseDatePickerBS
                        // <ReuseDatePickerSMV5
                        // <ReuseDateField
                            name="thuna_date_bs"
                            label="थुना परेको मिति"
                            placeholder='YYYY-MM-DD'
                            required={true}
                            control={control}
                            error={errors.thuna_date_bs}   // 👈 you’re passing this
                            open={open}
                            maxDate={formattedDateNp}
                        />

                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseSelect
                            name="is_life_time"
                            label="आजिवन सजाय हो/होइन?"
                            options={[
                                { value: 0, label: 'होइन' },
                                { value: 1, label: 'हो' }
                            ]}
                            required={false}
                            control={control}
                            error={errors.is_life_time}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseDateField
                            name="release_date_bs"
                            label="छुट्ने मिति"
                            placeholder='YYYY-MM-DD'
                            required={false}
                            control={control}
                            error={errors.release_date_bs}
                        />
                    </Grid>
                </Grid>
                <Grid container>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <ReuseDateField
                            name="mudda_phesala_antim_office_date"
                            label="फैसला मिति"
                            placeholder='YYYY-MM-DD'
                            required={false}
                            control={control}
                            error={errors.mudda_phesala_antim_office_district}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <ReuseSelect
                            name="is_main_mudda"
                            label="मुख्य मुद्दा हो/होइन?"
                            options={[
                                { label: 'होइन', value: 0 },
                                { label: 'हो', value: 1 },
                            ]}
                            defaultValue={0}
                            required={true}
                            control={control}
                            error={errors.is_main_mudda}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                        <ReuseSelect
                            name="is_last_mudda"
                            label="अन्तिम मुद्दा हो/होइन?"
                            options={[
                                { label: 'होइन', value: 0 },
                                { label: 'हो', value: 1 },
                            ]}
                            required={true}
                            control={control}
                            error={errors.is_last_mudda}
                        />
                    </Grid>
                </Grid>

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

export default MuddaDialog;