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
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseDateField from "../../ReuseableComponents/ReuseDateField";


const ApprovalDialog = ( { open, onClose, onSave, editingData } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,
        watch,
        formState: { errors },
    } = useForm( {
        defaultValues: { editingData },
    } );
    // console.log( editingData );
    useEffect( () => {
        if ( editingData ) {
            console.log( editingData );
            setValue( 'final_to_office_id', editingData.final_to_office_id || editingData.recommended_to_office_id );
            reset( {
                id: editingData.transfer_id || "", // ✅ Include this
                transfer_id: editingData.transfer_id || "",
                decision_date: editingData.decision_date || "",
                to_user: editingData.to_user || "",
                to_role: editingData.to_role || "",
                final_to_office_id: editingData.final_to_office_id || editingData.recommended_to_office_id,
                remarks: editingData.remarks || ""
            } );
        } else {
            reset( {
                id: "",
                transfer_id: "",
                decision_date: "",
                to_user: "",
                to_role: "",
                final_to_office_id: "",
                remarks: ""
            } );
        }
    }, [editingData, reset] );

    const onSubmit = async ( data ) => {
        onSave( data, editingData );
        onClose();
    };

    //   const muddaName = kaidimuddas?.[0]?.mudda_name || "";
    const { records: userRoles, optrecords: optUserRoles, loading: userRolesLoading } = useFetchUserRolesUsedInProcess();
    const role_id = watch( "role_id" );
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Approval Dialog</DialogTitle>
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
                <ReuseDateField
                    name="decision_date"
                    label="निर्णय मिति"
                    placeholder={"YYYY-MM-DD"}
                    control={control}
                    required={true}
                />
                <ReuseSelect
                    name="to_status"
                    label="प्राप्तकर्ताको भुमिका"
                    options={
                        [
                            { label: 'कारागार प्रशासक', value: 'to_send' }
                        ]
                        // optUserRoles.filter( ( opt ) => opt.id < authState.role_id )
                    }
                    control={control}
                    required={true}
                />

                <ReuseKaragarOffice
                    name="final_to_office_id"
                    label="सरुवा भएको कारागार"
                    defaultValue={1}
                    control={control}
                    required={true}
                // disabled={true}
                />

                {/* <ReuseInput
                    name="remarks"
                    label="संक्षिप्त व्यहोरा"
                    control={control}
                    required={false}
                /> */}
                <Grid size={{ xs: 12 }}>
                    <TextField
                        {...register( "remarks" )}
                        label="कैफियत"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.remarks}
                    />
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">रद्द गर्नुहोस्</Button>
                <Button onClick={handleSubmit( onSubmit )} variant="contained" color="primary">
                    स्विकृत
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalDialog;
