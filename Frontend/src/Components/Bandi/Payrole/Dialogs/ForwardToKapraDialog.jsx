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
                id: editingData.id || "", // ✅ Include this
                payrole_id: editingData.payrole_id || "",
                to_user: editingData.to_user || "",
                to_role: editingData.to_role || "",
            } );
        } else {
            reset( {
                id: "",
                payrole_id: "",
                to_user: "",
                to_role: "",
            } );
        }
    }, [editingData, reset] );

    const onSubmit = ( data ) => {
        console.log( 'data:', data, 'id:', editingData?.id );
        onSave( data, editingData?.id );
        onClose();
    };


    const fullAddress =
        editingData?.nationality === "स्वदेशी"
            ? `${ editingData?.city_name_np }-${ editingData?.wardno }, ${ editingData?.district_name_np }, ${ editingData?.state_name_np }, ${ editingData?.country_name_np }`
            : `${ editingData?.bidesh_nagarik_address_details }, ${ editingData?.country_name_np }`;

    //   const muddaName = kaidimuddas?.[0]?.mudda_name || "";
    const { records: userRoles, optrecords: optUserRoles, loading: userRolesLoading } = useFetchUserRolesUsedInProcess();
    const { records: userActions, optrecords: optUserActions, loading: userActionsLoading } = useFetchAllowedActions(editingData?.payrole_status);

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
                    options={optUserActions
                        // authState.role_id <= 2 ? (
                        //     optUserRoles.filter( ( opt ) => opt.id === authState.role_id + 1 ) // Corrected the comparison
                        // ) : (
                        //     optUserRoles.filter( ( opt ) => opt.id > authState.role_id )
                        // )
                    }
                    control={control}
                    required={true}
                />

                {/* <ReuseInput
                    name="user_id"
                    label="नाम"
                    control={control}
                    required={true}
                /> */}

                {/* <Grid size={{ xs: 12 }}>
                    <TextField
                        select
                        label="प्यारोल पास / फेल"
                        fullWidth
                        defaultValue={editingData?.pyarole_rakhan_upayukat}
                        {...register( "pyarole_rakhan_upayukat", { required: true } )}
                        error={!!errors.pyarole_rakhan_upayukat}
                        helperText={errors.pyarole_rakhan_upayukat ? "चयन गर्नुहोस्" : ""}
                    >
                        <MenuItem value="योग्य">योग्य</MenuItem>
                        <MenuItem value="अयोग्य">अयोग्य</MenuItem>
                        <MenuItem value="छलफल">छलफल</MenuItem>
                        <MenuItem value="कागजात अपुग">कागजात अपुग</MenuItem>
                    </TextField>
                </Grid> */}

                <ReuseInput
                    name="remarks"
                    label="कैफियत"
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

export default ForwardToKapraDialog;
