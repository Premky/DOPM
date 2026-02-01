import React from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReusePunarabedanOffice from "../../../../ReuseableComponents/ReusePunarabedanOffice";


const PunrabedanSection = () => {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext();
    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Typography sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }}>
                        पुनरावेदनमा नपरेको प्रमाणः
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReusePunarabedanOffice
                        name='punarabedan_office_id'
                        label='पुनरावेदनमा नपरेको कार्यालय'
                        required={false}
                        control={control}
                        error={errors.punarabedan_office_id}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseInput
                        name='punarabedan_office_ch_no'
                        label='पुनरावेदनमा नपरेको प्रमाणको च.नं.'
                        required={false}
                        control={control}
                        error={errors.punarabedan_office_ch_no}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseInput
                        name='punarabedan_office_date'
                        label='पुनरावेदनमा नपरेको प्रमाणको पत्र मिति'
                        required={false}
                        control={control}
                        error={errors.punarabedan_office_date}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default PunrabedanSection;
