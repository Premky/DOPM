import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material"; 
import { useForm, Controller } from "react-hook-form";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import fetchMuddaGroups from "../../ReuseableComponents/FetchApis/fetchMuddaGroups";
import axios from "axios";

const AddSubMuddaModal = ( { open, onClose, onSave, editingData, BASE_URL, refetch, setModalOpen } ) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            mudda_group_id: "",
            mudda_name: ""
        },
    } );

    const { optrecords, loading } = fetchMuddaGroups();

    const onSubmit = async ( data ) => {
        try {
            // console.log( '📤 Attempting to send data...' );
            // console.log( '🔗 BASE_URL:', BASE_URL );
            // console.log( '📦 Payload:', data );

            const response = await axios.post( `${ BASE_URL }/bandi/create_mudda`, data, {
                withCredentials: true,
            } );

            console.log( '✅ Axios Response:', response.data );           

            alert( 'Saved!' );            
            setModalOpen( false );
            onClose();
        } catch ( error ) {
            if ( error.response ) {
                console.error( "❌ Server error:", error.response.data );
                console.error( "🔢 Status code:", error.response.status );
                console.error( "📄 Headers:", error.response.headers );
            } else if ( error.request ) {
                console.error( "🚫 No response received from server." );
                console.error( "📬 Request details:", error.request );
            } else {
                console.error( "⚠️ Error during request setup:", error.message );
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle><span style={{color:'red'}}>कृपया मुद्दा थप्नु अगाडी त्यो मुद्दा पहिले नै अवस्थित छ/छैन एकिन गर्नुहोला ।</span></DialogTitle>
            <DialogContent>
                <ReuseSelect
                    name="mudda_group_id"
                    label="मुद्दा समुह"
                    options={optrecords}
                    control={control}
                    required={true}
                    error={!!errors.mudda_group_id}
                    helperText={errors.mudda_group_id?.message}
                />

                <Controller
                    name="mudda_name"
                    control={control}
                    rules={{ required: "मुद्दा आवश्यक छ" }}
                    render={( { field } ) => (
                        <TextField
                            {...field}
                            label="थप गर्नुपर्ने मुद्दा"
                            fullWidth
                            margin="dense"
                            error={!!errors.mudda_name}
                            helperText={errors.mudda_name?.message}
                        />
                    )}
                />
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

export default AddSubMuddaModal;
