import React, { useEffect, lazy, useMemo } from "react";
import { Grid, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import ReuseKaragarOffice from "../../../ReuseableComponents/ReuseKaragarOffice";
import ReuseMudda from "../../../ReuseableComponents/ReuseMudda";
import ReuseSelect from "../../../ReuseableComponents/ReuseSelect";
import ReuseInput from "../../../ReuseableComponents/ReuseInput";
import ReusePayroleNos from "../../../ReuseableComponents/ReusePayroleNos";
import { useAuth } from "../../../../Context/AuthContext";

import useFetchPayroles from "../useApi/useFetchPayroles";
import exportToExcel from "../../Exports/ExcelPayrole";

const PayroleTableFilters = ( { onChange } ) => {
    const { state: authState } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            searchOffice: "",
            searchpayroleStatus: "",
            nationality: "",
            searchbandi_name: "",
            searchmudda_id: "",
            searchpyarole_rakhan_upayukat: "",
            searchpayrole_no_id: "",
            searchchecked: false,
            searchis_checked: false,
        },

    } );

    const searchOffice = watch( 'searchOffice' );
    const nationality = watch( 'nationality' );
    const searchpayroleStatus = watch( 'searchpayroleStatus' );
    const searchpyarole_rakhan_upayukat = watch( 'pyarole_rakhan_upayukat' );
    const searchpayrole_no_id = watch( 'payrole_no_id' );
    const searchmudda_id = watch( 'searchmudda_id' );
    const searchbandi_name = watch( 'searchbandi_name' );
    const searchchecked = watch( 'searchchecked' );
    const searchis_checked = watch( 'is_checked' );

    //Watch Variables
    // Build filters object
    const filters = {
        searchOffice,
        nationality,
        searchpayroleStatus,
        searchpyarole_rakhan_upayukat,
        searchpayrole_no_id,
        searchmudda_id,
        searchbandi_name,
        searchchecked,
        searchis_checked,
    };
    
    const memoFilters = useMemo( () => filters, [
        filters?.searchOffice,
        filters?.nationality,
        filters?.searchpayroleStatus,
        filters?.searchpyarole_rakhan_upayukat,
        filters?.searchpayrole_no_id,
        filters?.searchmudda_id,
        filters?.searchbandi_name,
        filters?.searchchecked,
        filters?.searchis_checked,
    ] );

    const { data: filteredKaidi, totalKaidi, loading, error, fetchedMuddas, refetchMuddas, refetchData } = useFetchPayroles( memoFilters ); // page, rowsPerPage
    const onSubmit = ( data ) => {
        onChange( data );
    };
    useEffect( () => {
        const currentFilters = {
            searchOffice,
            nationality,
            searchpayroleStatus,
            searchpyarole_rakhan_upayukat,
            searchpayrole_no_id,
            searchmudda_id,
            searchbandi_name,
            searchchecked,
            searchis_checked,
        };
        onChange( currentFilters );
    }, [
        searchOffice,
        nationality,
        searchpayroleStatus,
        searchpyarole_rakhan_upayukat,
        searchpayrole_no_id,
        searchmudda_id,
        // searchbandi_name,
        searchchecked,
        searchis_checked,
    ] );

    const roleBasedStatus = {
        user: [
            { label: 'पेश नगरेको', value: '1' },
            { label: 'पेश गरेको', value: '2' },
        ]
        , office_approver: [
            { label: 'पेश नगरेको', value: '1' },
            { label: 'पेश गरेको', value: '2' },
        ],
        jr_officer: [
            { label: 'पेश गरेको', value: '3' },
            { label: 'स्विकृत गरेको', value: '4' },
            { label: 'प्यारोल सिफारिस भएको', value: '5' },
        ],
    };

    return (
        <form onSubmit={handleSubmit( onSubmit )}>
            <Grid container spacing={2} alignItems="flex-end">
                {authState.office_id == 1 || authState.office_id == 2 && (
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <ReuseKaragarOffice
                            name="searchOffice"
                            label="कारागार कार्यालय"
                            control={control}
                            error={errors.searchOffice}
                        />
                    </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseSelect
                        name="searchpayroleStatus"
                        label="प्यारोल स्थिति"
                        options={roleBasedStatus[authState.role] || roleBasedStatus[authState.role_name]}
                        control={control}
                        error={errors.searchpayroleStatus}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }}>
                    <ReuseSelect
                        name='pyarole_rakhan_upayukat'
                        label='नतिजा'
                        options={[
                            { label: 'सबै', value: '' },
                            { label: 'योग्य', value: 'योग्य' },
                            { label: 'अयोग्य', value: 'अयोग्य' },
                            { label: 'पास', value: 'पास' },
                            { label: 'फेल', value: 'फेल' },
                            { label: 'छलफल', value: 'छलफल' },
                            { label: 'कागजात अपुग', value: 'कागजात अपुग' }
                        ]}
                        control={control}
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
                <Grid size={{ xs: 12, sm: 1 }}>
                    <ReuseSelect
                        name='is_checked'
                        label='चेक भए/नभएको'
                        options={[{ label: 'सबै', value: '' }, { label: 'छ', value: '1' }, { label: 'छैन', value: '0' }]}
                        control={control}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 1 }}>
                    <ReusePayroleNos
                        name='payrole_no_id'
                        label='प्यारोल संख्या'
                        control={control}
                    />
                </Grid>
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
                    <Button variant="outlined" onClick={() => { reset(); onChange( {} ); }} sx={{ m: 1 }}>
                        Reset
                    </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    {/* <Button onClick={() => exportToExcel( filteredKaidi, fetchedMuddas )} variant="outlined" color="primary" sx={{ m: 1 }}>
                        एक्सेल निर्यात
                    </Button> */}
                </Grid>


            </Grid>
        </form>
    );
};

export default PayroleTableFilters;
