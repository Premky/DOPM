import React, { useEffect, useRef, useState } from "react";
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

import ReuseInput from "../../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../../ReuseableComponents/ReuseSelect";
import useFetchUserRolesUsedInProcess from "../../Apis_to_fetch/useFetchUserRolesUsedInProcess";
import { useAuth } from "../../../../Context/AuthContext";
import useFetchAllowedActions from "../../Apis_to_fetch/useFetchAllowedActions";

const ForwardToKapraDialog = ( { open, onClose, onSave, editingData } ) => {
    const { state: authState } = useAuth();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            id: '',
            payrole_id: '',
            to_user: '',
            to_role: '',
            remarks: '',
        },
    } );

    const isComposing = useRef( false );
    const [localValue, setLocalValue] = useState( '' );

    useEffect( () => {
        reset( {
            id: editingData?.id || '',
            payrole_id: editingData?.payrole_id || '',
            to_user: editingData?.to_user || '',
            to_role: editingData?.to_role || '',
            remarks: editingData?.remarks || '',
        } );
        setLocalValue( editingData?.remarks || '' );
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        onSave( data, editingData?.id );
        onClose();
    };

    const fullAddress =
        editingData?.nationality === "स्वदेशी"
            ? `${ editingData?.city_name_np }-${ editingData?.wardno }, ${ editingData?.district_name_np }, ${ editingData?.state_name_np }, ${ editingData?.country_name_np }`
            : `${ editingData?.bidesh_nagarik_address_details }, ${ editingData?.country_name_np }`;

    //   const muddaName = kaidimuddas?.[0]?.mudda_name || "";
    const { records: userRoles, optrecords: optUserRoles, loading: userRolesLoading } = useFetchUserRolesUsedInProcess();
    const { records: userActions, optrecords: optUserActions, loading: userActionsLoading } = useFetchAllowedActions( editingData?.payrole_status );

    // console.log( optUserRoles );
    let customUserRoles;
    if ( authState.role_name == 'clerk' ) {
        customUserRoles = [{ value: 'office_admin', lable: 'कारागार प्रशासक' }];
    } else if ( authState.role_name == 'office_admin' ) {
        customUserRoles = [{ value: 'supervisor', lable: 'विभागमा पेश गर्नुहोस्' }];
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingData ? "संपादन गर्नुहोस्" : "नयाँ थप्नुहोस्"}</DialogTitle>
            <DialogContent>
                <input type='text' value={`${ editingData?.id || "" }`} hidden />
                <input type='text' name="payrole_id" value={`${ editingData?.payrole_id || "" }`} hidden />
                <TextField
                    sx={{ mt: 1 }}
                    fullWidth
                    label="कैदी नाम र ठेगाना"
                    value={`${ editingData?.office_bandi_id || "" }, ${ editingData?.bandi_name || "" }, ${ fullAddress }`}
                    InputProps={{ readOnly: true }}
                />
                <ReuseSelect
                    name="to_role"
                    label="प्राप्तकर्ताको भुमिका"
                    options={optUserActions}                    
                    control={control}
                    required={true}
                />

                <Controller                    
                    name="remarks"
                    control={control}
                    defaultValue={editingData?.remarks || ""}
                    render={( { field } ) => (
                        <TextField                            
                            {...field}
                            label={authState.role_name=='office_admin'?"कारागार प्रशासकको राय":"कैफियत"}
                            variant="outlined"
                            fullWidth
                            defaultValue={editingData?.remarks || ""}
                            onChange={field.onChange}
                        />
                    )}
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

export default ForwardToKapraDialog;
