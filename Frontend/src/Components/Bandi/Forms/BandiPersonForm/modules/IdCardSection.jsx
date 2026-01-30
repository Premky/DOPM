import React from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import ReuseIdCards from "../../../../ReuseableComponents/ReuseIdCards";
import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseDistrict from "../../../../ReuseableComponents/ReuseDistrict";
import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";

const IdCardSection = () => {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext();

    const idCardType = watch( "id_card_type" );

    const formHeadStyle = {
        color: "blue",
        fontWeight: "bold",
        fontSize: "1.5rem",
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }} sx={formHeadStyle}>
                    बन्दीको परिचयपत्रको विवरणः
                </Grid>

                {/* Card Type */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseIdCards
                        name="id_card_type"
                        label="कार्डको प्रकार"
                        required={true}
                        control={control}
                        error={errors.id_card_type}
                    />
                </Grid>

                {/* Custom Card Name (when type = अन्य / 6) */}
                {Number( idCardType ) === 6 && (
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <ReuseInput
                            name="card_name"
                            label="कार्डको विवरण"
                            required={true}
                            control={control}
                            error={errors.card_name}
                        />
                    </Grid>
                )}

                {/* Card Number */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseInput
                        name="card_no"
                        label="परिचय पत्र नं."
                        required={false}
                        control={control}
                        error={errors.card_no}
                    />
                </Grid>

                {/* Issue District */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseDistrict
                        name="card_issue_district_id"
                        label="जारी जिल्ला"
                        required={false}
                        control={control}
                        error={errors.card_issue_district_id}
                    />
                </Grid>

                {/* Issue Date */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseDateField
                        name="card_issue_date"
                        label="परिचय पत्र जारी मिति"
                        placeholder="YYYY-MM-DD"
                        required={false}
                        maxDate={'today'}
                        control={control}
                        error={errors.card_issue_date}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default IdCardSection;
