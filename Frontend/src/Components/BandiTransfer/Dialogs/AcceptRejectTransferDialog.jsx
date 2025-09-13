import React, { useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    MenuItem
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";


import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import useFetchUserRolesUsedInProcess from "../../Bandi/Apis_to_fetch/useFetchUserRolesUsedInProcess";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import { useAuth } from "../../../Context/AuthContext";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";


const AcceptRejectTransferDialog = ( { open, onClose, onSave, editingData } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const {
        control,
        handleSubmit,
        reset,
        register,
        watch,
        formState: { errors },
    } = useForm( {
        defaultValues: { editingData },
    } );
    // console.log( editingData );
    useEffect( () => {
        if ( editingData ) {
            // console.log( editingData );
            reset( {
                id: editingData.transfer_id || "", // ✅ Include this
                bandi_id:editingData.office_bandi_id||"",
                transfer_date:editingData.transfer_date||"",
                transfer_id: editingData.transfer_id || "",
                to_user: editingData.to_user || "",
                to_role: editingData.to_role || "",
                to_status: editingData.to_status || "",
            } );
        } else {
            reset( {
                id: "",
                bandi_id:"",
                transfer_date:editingData.transfer_date||"",
                transfer_id: "",
                to_user: "",
                to_role: "",
                to_status: "",
            } );
        }
    }, [editingData, reset] );
    // console.log( 'data:', data, 'id:', editingData?.transfer_id );
    // onSave( data, editingData?.transfer_id );

    const onSubmit = async ( data ) => {
        onSave( data, editingData );
        onClose();
    };

    //   const muddaName = kaidimuddas?.[0]?.mudda_name || "";
    const { records: userRoles, optrecords: optUserRoles, loading: userRolesLoading } = useFetchUserRolesUsedInProcess();
    const to_status = watch( "to_status" );
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>स्विकार/अस्विकार गर्नुहोस्ः</DialogTitle>
            <DialogContent>
                <input type='text' value={`${ editingData?.office_bandi_id || "" }`}  name="office_bandi_id" hidden/>                
                <TextField
                    sx={{ mt: 1 }}
                    fullWidth
                    label="कैदी नाम र ठेगाना"
                    value={`${ editingData?.office_bandi_id || "" } | ${ editingData?.bandi_type || "" } ${ editingData?.bandi_name || "" }, `}
                    InputProps={{ readOnly: true }}
                />
                {/* <ReuseSelect
                    name="to_status"
                    label="पद"
                    options={
                        [
                            { label: 'कारागार प्रशासक', value: 'office_admin' }                            
                        ]
                        // optUserRoles.filter( ( opt ) => opt.id < authState.role_id )
                    }
                    control={control}
                    required={true}
                    error={errors?.to_role}
                /> */}

                <ReuseDateField
                    name="transfer_date"
                    label="दाखिला मिति"
                    placeholder="YYYY-MM-DD"
                    control={control}
                    required={true}
                    error={errors?.transfer_date}
                />
                <ReuseSelect
                    name="to_status"
                    label="अवस्था"
                    options={
                        [
                            { label: 'स्विकार', value: 'received' },
                            { label: 'अस्विकार', value: 'not_received' }
                        ]
                        // optUserRoles.filter( ( opt ) => opt.id < authState.role_id )
                    }
                    control={control}
                    required={true}
                    error={errors?.to_status}
                />

                <ReuseInput
                    name="remarks"
                    label="संक्षिप्त व्यहोरा"
                    control={control}
                    required={to_status == 'not_received'}
                    error={errors?.remarks}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit( onSubmit )} variant="contained" color="primary">
                    पेश गर्नुहोस्
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AcceptRejectTransferDialog;
