import React from "react";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useBaseURL } from "../../../../Context/BaseURLProvider";

const StepConfirm = ( { data, photo, onBack } ) => {
    const BASE_URL = useBaseURL();

    const submit = async () => {
        try {
            const formData = new FormData();
            Object.entries( data ).forEach( ( [k, v] ) => formData.append( k, v ) );
            if ( photo ) formData.append( "photo", photo );

            await axios.post( `${ BASE_URL }/emp/create_new_employee`, formData, {
                headers: { "Content-Type": "multipart/form-data" }, withCredentials: true,
            } );

            alert( "Employee Created Successfully" );
        } catch ( err ) {
            console.error( err );
            alert( "Error creating employee" );
        }
    };

    return (
        <>
            <Typography variant="h6">Confirm Employee Creation</Typography>
            <pre>{JSON.stringify( data, null, 2 )}</pre>

            <Stack direction="row" spacing={2}>
                <Button onClick={onBack}>Back</Button>
                <Button variant="contained" onClick={submit}>
                    Create Employee
                </Button>
                {photo && (
                    <Avatar
                        src={URL.createObjectURL( photo )}
                        sx={{ width: 120, height: 120 }}
                    />
                )}

            </Stack>
        </>
    );
};

export default StepConfirm;
