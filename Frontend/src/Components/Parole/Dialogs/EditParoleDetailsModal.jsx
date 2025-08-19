import React, { useEffect } from "react";
import NepaliDate from 'nepali-datetime';
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
import ReusePayroleNos from "../../ReuseableComponents/ReusePayroleNos";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseDistrict from "../../ReuseableComponents/ReuseDistrict";
import ReuseMunicipality from "../../ReuseableComponents/ReuseMunicipality";
import ReuseCourt from "../../ReuseableComponents/ReuseCourt";


const ParoleModal = ( { open, onClose, onSave, editingData } ) => {
    const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm( {
        defaultValues: { editingData },
    } );
    const selectedDistrictId = watch( 'recommended_district' );
    
    useEffect( () => {
        if ( editingData ) {
            console.log( editingData );
            reset( {
                bandi_id: editingData.bandi_id || "",
                payrole_no_id: editingData.payrole_no_id || "",
                payrole_entry_date: editingData.payrole_entry_date || current_date,
                recommended_district: editingData.recommended_district || "",
                recommended_city: editingData.recommended_city || "",
                recommended_tole_ward: editingData.recommended_tole_ward || "",
                recommended_court_id: editingData.recommended_court_id || "",                
            } );
        } else {
            reset( {
                bandi_id: "",
                payrole_no_id: "",
                payrole_entry_date: current_date,
                recommended_district: "",
                recommended_city: "",
                recommended_tole_ward: "",
                recommended_court_id: "",                
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

                <Grid size={{ xs: 6 }}>
                    <ReusePayroleNos
                        name="payrole_no_id"
                        label="प्यारोल बैठक नं."
                        control={control}
                        required={true}
                        error={errors.bandi_type}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseDateField
                        name='payrole_entry_date'
                        label='प्यारोल दाखिला मिति'
                        required={true}
                        control={control}
                        error={errors.payrole_entry_date}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    प्यारोल बस्न इच्छुक स्थानिय तहः
                </Grid>
                <Grid size={{ xs: 12 }} container>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseDistrict
                            name='recommended_district'
                            label='जिल्ला'
                            required={true}
                            control={control}
                            error={errors.recommended_district}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseMunicipality
                            name='recommended_city'
                            label='स्थानिय तह'
                            required={true}
                            control={control}
                            error={errors.recommended_city}
                            selectedDistrict={selectedDistrictId}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseInput
                            name='recommended_tole_ward'
                            label='टोल/वडा नं.'
                            required={true}
                            control={control}
                            error={errors.tole_ward}
                        />
                    </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseCourt
                        name='recommended_court_id'
                        label='पेश गर्ने अदालत'
                        required={true}
                        control={control}
                        office_categories_id={3}
                    />
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

export default ParoleModal;
