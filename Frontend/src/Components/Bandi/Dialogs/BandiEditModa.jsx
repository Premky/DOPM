import  { useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, TextField, Button, MenuItem
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import "nepali-datepicker-reactjs/dist/index.css";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import useBlockList from "../../ReuseableComponents/FetchApis/useBlockList";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";

const educationOptions = ["थाहा नभएको", "सामान्य पढ्न लेख्न जान्ने", "आठ सम्म", "एस.एल.सी/एस.ई.ई", "+२ वा सो सरह",
    "स्नातक", "स्नातकोत्तर"
];
const genderOptions = ["Male", "Female", "Other"];
const maritalStatusOptions = ["Married", "Unmarried"];

const BandiEditModal = ( {open, onClose, onSave, editingData} ) => {
    const {optrecords, loading}=useBlockList();
    const { control, handleSubmit, reset, formState: { errors } } = useForm( {
        defaultValues: {
            // bandi_type: "",
            // office_bandi_id: "",

            bandi_name: "",
            bandi_name_en: "",
            bandi_education: "",
            gender: "",
            married_status: "",
            bandi_huliya: "",
            dob: "",
            remarks: "",
        }
    } );

    // console.log( editingData );
    useEffect( () => {
        if ( editingData ) reset( editingData );
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    overflow: 'visible',
                },
            }}
            sx={{
                '& .MuiDialog-paper': {
                    overflow: 'visible', // Important to prevent clipping
                },
            }}
        >
            <DialogTitle>बन्दी विवरण सम्पादन गर्नुहोस्</DialogTitle>
            <DialogContent>
                <input type="text" name="bandi_id" value={editingData?.bandi_id} hidden />
                <Grid container spacing={2} mt={1}>
                    {[
                        // { name: "bandi_name", label: "नामथर" },
                        // { name: "dob", label: "जन्म मिति (वि.सं.)" },
                        // { name: "height", label: "उचाइ (से.मी.)" },
                        // { name: "weight", label: "तौल (के.जी.)" },
                        // { name: "bandi_huliya", label: "हुलिया" },
                        // { name: "remarks", label: "कैफियत" },
                    ].map( ( field ) => (
                        <Grid size={{ xs: 6 }} key={field.name}>
                            <Controller
                                name={field.name}
                                control={control}
                                render={( { field: controllerField } ) => (
                                    <TextField
                                        {...controllerField}
                                        label={field.label}
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                    ) )}

                    <Grid size={{ xs: 6 }} style={{ position: 'relative' }}>
                        <ReuseInput
                            name="bandi_name"
                            label="नामथर"
                            placeholder={'कैफियत'}
                            control={control}
                            required={true}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }} style={{ position: 'relative' }}>
                        <ReuseInput
                            name="bandi_name_en"
                            label="Name (In English)"
                            placeholder={'नाम (अंग्रेजीमा)'}
                            control={control}
                            required={true}
                            language='english'
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }} container>
                        <Grid size={{ xs: 6 }} >
                            <ReuseInput
                                name='lagat_no'
                                label="लगत नं."
                                // defaultValue={band_rand_id}
                                required={false}
                                control={control}
                                error={errors.lagat_no} />
                        </Grid>
                        <Grid size={{ xs: 6 }} >
                            <ReuseSelect
                                name='block_no'
                                label="ब्लक नं."
                                options={optrecords}
                                required={false}
                                control={control}
                                error={errors.block_no} />
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12 }} container>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="bandi_education"
                                control={control}
                                render={( { field } ) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="शैक्षिक योग्यता"
                                        fullWidth
                                        size="small"
                                    >
                                        {educationOptions.map( ( opt ) => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ) )}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="gender"
                                control={control}
                                render={( { field } ) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="लिङ्ग"
                                        fullWidth
                                        size="small"
                                    >
                                        {genderOptions.map( ( opt ) => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ) )}
                                    </TextField>
                                )}
                            />
                        </Grid>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="married_status"
                            control={control}
                            render={( { field } ) => (
                                <TextField
                                    {...field}
                                    select
                                    label="वैवाहिक अवस्था"
                                    fullWidth
                                    size="small"
                                >
                                    {maritalStatusOptions.map( ( opt ) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ) )}
                                </TextField>
                            )}
                        />
                    </Grid>


                    <Grid size={{ xs: 12 }} container>
                        <Grid size={{ xs: 6 }}>
                            <ReuseDateField
                                name='enrollment_date_bs'
                                label="दाखिला मिति"
                                required={false}
                                control={control}
                                error={errors.enrollment_date_bs} />
                        </Grid>
                        <Grid size={{ xs: 6 }} style={{ position: 'relative' }}>
                            <ReuseDateField
                                name="dob"
                                control={control}
                                label="जन्म मिति"
                            />
                        </Grid>
                    </Grid>


                    <Grid size={{ xs: 12 }} style={{ position: 'relative' }}>
                        <ReuseInput
                            name="bandi_huliya"
                            label="हुलिया"
                            placeholder={'हुलिया'}
                            control={control}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }} style={{ position: 'relative' }}>
                        <ReuseInput
                            name="remarks"
                            placeholder={'कैफियत'}
                            control={control}
                        />
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit( onSubmit )} variant="contained" color="primary">अपडेट गर्नुहोस्</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BandiEditModal;
