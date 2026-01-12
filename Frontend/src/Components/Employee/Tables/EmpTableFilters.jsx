import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseSelect from "../../ReuseableComponents/ReuseSelect";
import ReuseInput from "../../ReuseableComponents/ReuseInput";
import usePosts from "../APIs/usePosts";

const EmpTableFilters = ( { onChange } ) => {
    const {
        control,
        watch,
        reset
    } = useForm( {
        defaultValues: {
            office_id: "",
            emp_type: "all",
            jd: "all",
            is_chief: "all",
            search: "",
            sanket_no: "",
            post: "",
        },
    } );

    // Watch fields
    const office_id = watch( "office_id" );
    const emp_type = watch( "emp_type" );
    const jd = watch( "jd" );
    const is_chief = watch( "is_chief" );
    const search = watch( "search" );
    const sanket_no = watch( "sanket_no" );
    const post = watch( "post" );

    // Notify parent on change
    useEffect( () => {
        onChange( {
            office: office_id || "all",
            empType: emp_type || "all",
            jd: jd || "all",
            isChief: is_chief || "all",
            search: search || "",
            sanket_no: sanket_no || "",
            post: post || "",
        } );
    }, [office_id, emp_type, jd, is_chief, search, sanket_no, post, onChange] );

    const { optLevel, optPosts, optServiceGroups } = usePosts();

    return (
        <Box mb={2}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseKaragarOffice
                        name="office_id"
                        label="कार्यालय"
                        control={control}
                        includeAll
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseInput
                        name="search"
                        label="नाम खोज्नुहोस्"
                        control={control}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseInput
                        name="sanket_no"
                        label="कर्मचारी संकेत नं."
                        control={control}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseSelect
                        name="emp_type"
                        label="कर्मचारी प्रकार"
                        control={control}
                        options={[
                            { label: "सबै", value: "all" },
                            { label: "स्थायी", value: "स्थायी" },
                            { label: "अस्थायी", value: "अस्थायी" },
                            { label: "करार", value: "करार" },
                        ]}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseSelect
                        name="post"
                        label="पद"
                        control={control}
                        options={optPosts}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseSelect
                        name="jd"
                        label="दरबन्दी स्थिति"
                        control={control}
                        options={[
                            { label: "सबै", value: "all" },
                            { label: "दरबन्दी", value: "दरबन्दी" },
                            { label: "काज", value: "काज" },
                            { label: "कामकाज", value: "कामकाज" },
                        ]}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                    <ReuseSelect
                        name="is_chief"
                        label="कारागार प्रशासक"
                        control={control}
                        options={[
                            { label: "सबै", value: "all" },
                            { label: "हो", value: "हो" },
                            { label: "होइन", value: "होइन" },
                            { label: "निमित्त", value: "निमित्त" },
                        ]}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmpTableFilters;
