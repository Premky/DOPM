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
import Swal from "sweetalert2";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import axios from "axios";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";


const ForwardDialog = ( { open, onClose, onSave, editingData } ) => {
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
    // console.log(editingData)
    useEffect( () => {
        if ( editingData ) {
            // console.log( editingData );
            reset( {
                id: editingData.transfer_id || "", // ✅ Include this
                transfer_id: editingData.transfer_id || "",
                to_user: editingData.to_user || "",
                to_role: editingData.to_role || "",
            } );
        } else {
            reset( {
                id: "",
                transfer_id: "",
                to_user: "",
                to_role: "",
            } );
        }
    }, [editingData, reset] );
    // console.log( 'data:', data, 'id:', editingData?.transfer_id );

    const onSubmit = async ( data ) => {
        // console.log( "data:", data );
        onSave( data, editingData?.transfer_id );
        onClose();
    };

    //   const muddaName = kaidimuddas?.[0]?.mudda_name || "";
    const { records: userRoles, optrecords: optUserRoles, loading: userRolesLoading } = useFetchUserRolesUsedInProcess();
    let customRoles;
    if ( authState.role_name == 'clerk' ) {
        customRoles = [
            { value: "office_admin", label: "कारागार प्रशासक" }
        ];
    }
    else if ( authState.role_name == 'office_admin' ) {
        customRoles = [{ value: "pending_supervisor", label: "विभागामा पेश" }];
    }
    else if ( authState.role_name == 'supervisor' ) {
        customRoles = [
            { value: "pending_admin", label: "पेश गर्नुहोस्(शा.अ.)" },
            { value: "pending_top_level", label: "पेश गर्नुहोस्(निर्देशक)" },
            { value: "rejected_office_admin", label: "रद्द गर्नुहोस्" }

        ];
    }
    else if ( authState.role_name == 'pending_admin' ) {
        customRoles = [
            { value: "pending_top_level", label: "पेश गर्नुहोस् (निर्देशक)" },
            { value: "pending_supervisor", label: "पेश गर्नुहोस् (महानिर्देशक)" },
            // { value: "", label: "रद्द गर्नुहोस्" }
        ];
    }
    else if ( authState.role_name == 'pending_top_level' ) {
        customRoles = [
            { value: "pending_supervisor", label: "पेश गर्नुहोस् (महानिर्देशक)" },
            { value: "pending_supervisor", label: "रद्द गर्नुहोस्" }
        ];
    }

    const role_id = watch( "role_id" );
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>पेश गर्नुहोस्:</DialogTitle>
            <DialogContent>
                <input type='text' value={`${ editingData?.id || "" }`} hidden />
                <input type='text' name="payrole_id" value={`${ editingData?.payrole_id || "" }`} hidden />
                <TextField
                    sx={{ mt: 1 }}
                    fullWidth
                    label="कैदी नाम र ठेगाना"
                    value={`${ editingData?.office_bandi_id || "" } | ${ editingData?.bandi_type || "" } ${ editingData?.bandi_name || "" }, `}
                    InputProps={{ readOnly: true }}
                />
                {authState.role_id != 2 && (
                    <>
                        <ReuseDateField
                            name="decision_date"
                            label="निर्णय मिति"
                            placeholder={"YYYY-MM-DD"}
                            control={control}
                            required={true}
                        />
                        <ReuseKaragarOffice
                            name="recommended_to_office_id"
                            label="सरुवा भएको कारागार"
                            defaultValue={1}
                            control={control}
                            required={true}
                        // disabled={true}
                        />
                    </>
                )}

                <ReuseSelect
                    name="to_status"
                    label='प्राप्तकर्ताको भुमिका'
                    options={
                        customRoles
                        // authState.role_id <= 2 ? (
                        //     optUserRoles.filter( ( opt ) => opt.id === authState.role_id + 1 ) // Corrected the comparison
                        // ) : (
                        //     optUserRoles.filter( ( opt ) => opt.id > authState.role_id )
                        // )

                    }
                    control={control}
                    required={true}
                />


                {( role_id === 4 || role_id === 5 ) && (
                    <ReuseInput
                        name="user_id"
                        label="नाम"
                        control={control}
                        required={true}
                    />
                )}

                <ReuseInput
                    name="remarks"
                    label="संक्षिप्त व्यहोरा"
                    control={control}
                    required={false}
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

export default ForwardDialog;
