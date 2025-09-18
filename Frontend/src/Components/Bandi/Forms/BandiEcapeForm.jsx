// src/Components/Bandi/BandiEscapeForm.jsx

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Grid,
} from "@mui/material";
import axios from "axios";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet";
import ReuseBandi from "../../ReuseableComponents/ReuseBandi";
import BandiAddressTable from "../Tables/For View/BandiAddressTable";
import BandiMuddaTable from "../Tables/For View/BandiMuddaTable";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import Swal from "sweetalert2";
import { useBaseURL } from '../../../Context/BaseURLProvider';

const BandiEscapeForm = () => {
    const BASE_URL = useBaseURL();
    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm( {
        defaultValues: {
            bandi_id: "",
            office_bandi_id: "",
            escape_date_bs: "",
            escape_date_ad: "",
            escape_method: "",
            notified_by: "",
            status: "escaped",
            recapture_date_bs: "",
            recapture_date_ad: "",
            recaptured_by: "",
            recapture_location: "",
            recapture_notes: "",
        },
    } );

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const status = watch( "status" );

    const onSubmit = async ( data ) => {
        try {
            setLoading( true );
            const res = await axios.post( "http://localhost:5000/api/bandi_escape", data );
            if ( res.status === 200 ) {
                alert( "Escape details saved successfully!" );
                reset();
                if ( onSuccess ) onSuccess();
            }
        } catch ( err ) {
            console.error( err );
            alert( "Failed to save escape details!" );
        } finally {
            setLoading( false );
        }
    };

    const onFormSubmit = async ( data ) => {
        setLoading( true );
        try {
            // console.log(data)
            const url = editing ? `${ BASE_URL }/bandi/update_escape_bandi/${ editableData.id }` : `${ BASE_URL }/bandi/create_escape_bandi`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios( {
                method, url, data: data,
                withCredentials: true
            } );
            const { Status, Result, Error } = response.data;
            // console.log( response );
            if ( Status ) {
                Swal.fire( {
                    title: `Bandi ${ editing ? 'updated' : 'created' } successfully!`,
                    icon: "success",
                    draggable: true
                } );
                reset();
                setEditing( false );
                // fetchOffices();
            } else {
                Swal.fire( {
                    title: response.data.nerr,
                    icon: 'error',
                    draggable: true
                } );
            }

        } catch ( err ) {
            console.error( err );
            Swal.fire( {
                title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
                icon: 'error',
                draggable: true
            } );
        } finally {
            setLoading( false );
        }
    };

    const bandi_id = watch( 'bandi_id' );
    return (
        <Box p={3} sx={{ background: "#fff", borderRadius: 2, boxShadow: 2 }}>
            <HelmetProvider>
                <Helmet>
                    <title>PMIS: बन्दी फरार/पक्राउ फारम</title>
                    <meta name="description" content="बन्दी फरार/पक्राउ सम्बन्धि फारम भर्नुहोस्" />
                    <meta name="keywords" content="बन्दी, बन्दी फरार, पक्राउ फारम, बन्दी विवरण, बन्दी रेकर्ड" />
                    <meta name="author" content="कारागार व्यवस्थापन विभाग" />
                </Helmet>
            </HelmetProvider>
            <Typography variant="h6" mb={2}>
                फरार बन्दी प्रविष्टि फारम
            </Typography>

            <form onSubmit={handleSubmit( onFormSubmit )}>
                <Grid container spacing={2}>

                    {/* Escape Date BS */}
                    <Grid size={{ xs: 12 }}>
                        <ReuseBandi
                            name='bandi_id'
                            label='बन्दी'
                            required={true}
                            control={control}
                            // error={errors.bandi_id}
                            // current_office={authState.office_np}
                            type='allbandi'
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <BandiAddressTable bandi_id={bandi_id} />
                        <BandiMuddaTable bandi_id={bandi_id} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseDateField
                            name={"escape_date_bs"}
                            label='भागेको मिति'
                            control={control}
                            required={true}
                            errors={errors.decision_date}
                        />
                    </Grid>

                    {/* Status */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Controller
                            name="status"
                            control={control}
                            render={( { field } ) => (
                                <TextField {...field} select fullWidth label="Status" required>
                                    <MenuItem value="escaped">फरार</MenuItem>
                                    <MenuItem value="self_present">स्वयं उपस्थित</MenuItem>
                                    <MenuItem value="recaptured">पक्राउ परेको</MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>

                    {/* Escape Method */}
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="escape_method"
                            control={control}
                            render={( { field } ) => (
                                <TextField {...field} fullWidth multiline label="भाग्ने विधि/तरिका" />
                            )}
                        />
                    </Grid>

                    {/* Recapture Fields (only show if recaptured) */}
                    {( status === "recaptured" || status === "self_present" ) && (
                        <>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <ReuseDateField
                                    name="recapture_date_bs"
                                    label='पक्राउ मिति'
                                    control={control}
                                    required={true}
                                    errors={errors.decision_date}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="recaptured_by"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} fullWidth multiline label="पक्राउ गर्ने व्यक्ती/निकाय" />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="recapture_location"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} fullWidth label="पक्राउ परेको स्थान" />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="recapture_notes"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} fullWidth multiline label="कैफियत" />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="is_researched"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} select fullWidth label="घटनाको अनुसन्धान गरे/नगरेको" required>
                                            <MenuItem value="1">गरेको</MenuItem>
                                            <MenuItem value="0">नगरेको</MenuItem>                                            
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="is_reported"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} select fullWidth label="प्रतिवेदन गरे/नगरेको" required>
                                            <MenuItem value="1">गरेको</MenuItem>
                                            <MenuItem value="0">नगरेको</MenuItem>                                            
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="is_action_taken"
                                    control={control}
                                    render={( { field } ) => (
                                        <TextField {...field} select fullWidth label="कारवाही गरे/नगरेको" required>
                                            <MenuItem value="1">गरेको</MenuItem>
                                            <MenuItem value="0">नगरेको</MenuItem>                                            
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>

                {/* Submit */}
                <Box mt={3} textAlign="right">
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default BandiEscapeForm;
