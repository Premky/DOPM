import React, { useEffect, lazy, useMemo, useState } from "react";
import { Grid, Button, useScrollTrigger } from "@mui/material";
import { useForm } from "react-hook-form";
import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseMudda from "../../ReuseableComponents/ReuseMudda";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import { useAuth } from "../../../Context/AuthContext";

import useFetchBandiForTransfer from "../Fetch_APIs/useFetchBandiForTransfer";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import useFetchRoleBasedTransferStatus from "../Fetch_APIs/useFetchRoleBasedTransferStatus";
import TransferCommonLetterDocx from "../Exports/TransferCommonLetterDocx";
// import exportToExcel from "../../Exports/ExcelPayrole";

const TableFilters = ( { onChange } ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        formState: { errors },
        setValue
    } = useForm( {
        defaultValues: {
            searchOffice: "",
            searchToOffice: "",
            searchStatus: "",
            nationality: "",
            searchbandi_name: "",
            searchmudda_id: "",
            searchchecked: false,
            searchis_checked: false,
        },

    } );

    const searchOffice = watch( 'searchOffice' );
    const searchToOffice = watch( 'searchToOffice' );
    const nationality = watch( 'nationality' );
    const searchStatus = watch( 'searchStatus' );
    const searchmudda_id = watch( 'searchmudda_id' );
    const searchbandi_name = watch( 'searchbandi_name' );
    const searchchecked = watch( 'searchchecked' );
    const searchis_checked = watch( 'is_checked' );

    //Watch Variables
    // Build filters object
    const filters = {
        searchOffice,
        searchToOffice,
        nationality,
        searchStatus,
        searchmudda_id,
        searchbandi_name,
        searchchecked,
        searchis_checked,
    };

    const memoFilters = useMemo( () => filters, [
        filters?.searchOffice,
        filters?.searchToOffice,
        filters?.nationality,
        filters?.searchStatus,
        filters?.searchmudda_id,
        filters?.searchbandi_name,
        filters?.searchchecked,
        filters?.searchis_checked,
    ] );

    const { data: filteredKaidi, totalKaidi, loading, error, fetchedMuddas, refetchTransferHisotry, refetchMuddas, refetchData } = useFetchBandiForTransfer( memoFilters ); // page, rowsPerPage
    const onSubmit = ( data ) => {
        onChange( data );
    };
    useEffect( () => {
        const currentFilters = {
            searchOffice,
            searchToOffice,
            nationality,
            searchStatus,
            searchmudda_id,
            searchbandi_name,
            searchchecked,
            searchis_checked,
        };
        onChange( currentFilters );
    }, [
        searchOffice,
        searchToOffice,
        nationality,
        searchStatus,
        searchmudda_id,
        // searchbandi_name,
        searchchecked,
        searchis_checked,
    ] );


    const roleBasedStatus1 = {
        clerk: [
            { label: 'पेश नगरेको', value: 'initiate_transfer' },
            { label: 'पेश गरेको(कारागार प्रशासक)', value: 'pending_office_admin' },
        ]
        , office_admin: [
            { label: 'पेश नगरेको(कारागार प्रशासक)', value: 'pending_office_admin' },
            { label: 'पेश गरेको(बन्दी शाखा)', value: 'pending_supervisor' },
            { label: 'अस्विकार गरेको(बन्दी शाखा)', value: 'rejected_office_admin' },
        ],
        supervisor: [
            { label: 'पेश नगरेको', value: 'pending_supervisor' },
            { label: 'स्विकृत गरेको', value: 'pending_admin' },
            { label: 'अस्विकार गरेको', value: 'rejected_by_supervisor' },
        ],
        headoffice_approver: [
            { label: 'पेश नगरेको', value: 'pending_admin' },
            { label: 'स्विकृत गरेको', value: 'pending_top_level' },
            { label: 'अस्विकार गरेको', value: 'rejected_by_admin' },
        ],
        top_level: [
            { label: 'स्विकृत गरेको', value: 'pending_top_level' },
            { label: 'अस्विकार गरेको', value: 'rejected_by_top_level' },
        ],
    };

    const { optrecords: roleBasedStatus, refetchRoleBasedTransferStatus: fetchRoleBasedTransferStatus } = useFetchRoleBasedTransferStatus();
    useEffect( () => {
        if ( roleBasedStatus?.length > 0 && authState?.role_name ) {
            const userDefault = {
                clerk: 'initiate_transfer',
                office_admin: 'pending_office_admin',
                supervisor: 'pending_supervisor',
                headoffice_approver: 'pending_admin',
                top_level: 'pending_top_level',
                superadmin: 'pending_superadmin'
            };

            const defaultStatus = userDefault[authState.role_name];
            const defaultOption = roleBasedStatus.find( opt => opt.value === defaultStatus );
            if ( defaultOption ) {
                setValue( 'searchStatus', defaultOption.value );
            }
        }
    }, [roleBasedStatus, authState.role_name, setValue] );


    // console.log( roleBasedStatus );
    return (
        <form onSubmit={handleSubmit( onSubmit )}>
            <Grid container spacing={2} alignItems="flex-end">

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseKaragarOffice
                        name="searchOffice"
                        label="कारागार कार्यालय (देखी)"
                        control={control}
                        error={errors.searchOffice}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseKaragarOffice
                        name="searchToOffice"
                        label="स्थानान्तरण भएको कारागार"
                        control={control}
                        error={errors?.searchToOffice}
                    />
                </Grid>

                {/* <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseSelect
                        name="searchRole"
                        label="प्रयोगकर्ता"
                        // options={roleBasedStatus[authState.role] || roleBasedStatus[authState.role_name]}
                        options={roleBasedStatus}
                        control={control}
                        error={errors.searchStatus}
                    />
                </Grid> */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseSelect
                        name="searchStatus"
                        label="स्थिति"
                        // options={roleBasedStatus[authState.role] || roleBasedStatus[authState.role_name]}
                        options={roleBasedStatus}
                        control={control}
                        error={errors.searchStatus}
                    // defaultValue={rol}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseSelect
                        name="nationality"
                        label="राष्ट्रियता"
                        options={[
                            { value: "स्वदेशी", label: "स्वदेशी" },
                            { value: "विदेशी", label: "विदेशी" },
                        ]}
                        control={control}
                        error={errors.nationality}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseMudda
                        name="searchmudda_id"
                        label="मुद्दा"
                        control={control}
                        error={errors.searchmudda_id}
                    />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 1 }}>
                    <ReuseSelect
                        name='is_checked'
                        label='चेक भए/नभएको'
                        options={[{ label: 'सबै', value: '' }, { label: 'छ', value: '1' }, { label: 'छैन', value: '0' }]}
                        control={control}
                    />
                </Grid> */}

                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseInput
                        name="searchbandi_name"
                        label="कैदी नाम"
                        control={control}
                        error={errors.searchbandi_name}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <Button variant="contained" type="submit" sx={{ m: 1 }}>Search</Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <Button variant="outlined" type="button" onClick={() => { reset(); onChange( {} ); }} sx={{ m: 1 }}>
                        Reset
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    {authState.office_id == 2 && (
                        <TransferCommonLetterDocx data={filteredKaidi} />
                    )}

                </Grid>


            </Grid>
        </form>
    );
};

export default TableFilters;
