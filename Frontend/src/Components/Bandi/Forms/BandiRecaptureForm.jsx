import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Grid,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import ReuseEscapedBandi from "../../ReuseableComponents/ReuseEscapedBandi";
import { useBaseURL } from '../../../Context/BaseURLProvider';

const BandiRecaptureForm = () => {
    const BASE_URL = useBaseURL();
    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm( {
        defaultValues: {
            escape_id: "",
            bandi_id: "",
            office_bandi_id: "",
            escape_date_bs: "",
            escape_date_ad: "",
            escape_method: "",
            notified_by: "",
            notified_at: "",
            status: "recaptured",
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
    const escapeId = watch( "escape_id" );

    useEffect(()=>{
        if(!escapeId) return;
        const fetchEscapeDetails = async()=>{
            try{
                const {data} = await axios.get(
                    `${BASE_URL}/bandi/get_escaped_bandi/${escapeId}`,{withCredentials:true}
                );
                const {Status, Result}=data;
                console.log(Result)
                if(data.Status){
                    //auto populate form
                    reset({
                        ...Result[0],                        
                        escape_id:escapeId,
                        status:Result.status||"recaptured", //fallback
                    });
                }else{
                    Swal.fire("Error","Could not fetch escape details", "error");
                }
            }catch(err){
                console.error(err);
                Swal.fire("Error", err?.response?.data?.Error||"सर्भरमा समस्या आयो।","error");
            }
        };
        fetchEscapeDetails();
    },[escapeId, BASE_URL, reset]);

    const onFormSubmit = async ( data ) => {
        setLoading( true );
        try {
            const url = `${ BASE_URL }/bandi/update_recapture_bandi/${ data.escape_id }` ;
            const method = 'PUT' ;
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
    
    return (
        <Box p={3} sx={{ background: "#fff", borderRadius: 2, boxShadow: 2 }}>
            <HelmetProvider>
                <Helmet>
                    <title>PMIS: बन्दी पक्राउ फारम</title>                    
                </Helmet>
            </HelmetProvider>
            <Typography variant="h6" mb={2}>
                फरार बन्दी पुनः पक्राउ परेको विवरण प्रविष्टि फारम
            </Typography>

            <form onSubmit={handleSubmit( onFormSubmit )}>
                <Grid container spacing={2}>

                    {/* Escape Date BS */}
                    <Grid size={{ xs: 12 }}>
                        <ReuseEscapedBandi
                            name='escape_id'
                            label='बन्दी'
                            required={true}
                            control={control}                            
                            type='allbandi'
                        />
                    </Grid>                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseDateField
                            name="escape_date_bs"
                            label='भागेको मिति'
                            control={control}
                            required
                            errors={errors.escape_date_bs}
                        />
                    </Grid>

                    {/* Notified By */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseInput
                            name="notified_by"
                            label='जानकारी गराउने'
                            control={control}
                            errors={errors.notified_by}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <ReuseDateField
                            name="notified_at"
                            label='जानकारी मिति'
                            control={control}
                            required={true}
                            errors={errors.notified_at}
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
                    {status === "recaptured" && (
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

export default BandiRecaptureForm;
