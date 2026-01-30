import React from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseMunicipality from "../../../../ReuseableComponents/ReuseMunicipality";
import ReuseDistrict from "../../../../ReuseableComponents/ReuseDistrict";
import ReuseState from "../../../../ReuseableComponents/ReuseState";
import ReuseCountry from "../../../../ReuseableComponents/ReuseRelativeRelations";
import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";


const AddressSection = () => {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext();

    const nationality = watch( "nationality" );
    const selectedState = watch( "state_id" );
    const selectedDistrict = watch( "district_id" );

    const isSwadeshi = nationality === "स्वदेशी";

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{xs:12}}>
                    <Typography sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }}>
                        बन्दीको ठेगानाः
                    </Typography>
                </Grid>

                {/* Nationality */}
                <Grid size={{xs:12, sm:6, md:2}}>
                    <ReuseSelect
                        name="nationality"
                        label="राष्ट्रियता"
                        required
                        control={control}
                        error={errors.nationality}
                        options={[
                            { label: "स्वदेशी", value: "स्वदेशी" },
                            { label: "विदेशी", value: "विदेशी" },
                        ]}
                    />
                </Grid>

                {/* Country */}
                <Grid size={{xs:12, sm:6, md:2}}>
                    <ReuseCountry
                        name="nationality_id"
                        label="देश"
                        defaultvalue={1}
                        readonly={isSwadeshi}
                        required
                        control={control}
                        error={errors.nationality_id}
                    />
                </Grid>

                {/* Swadeshi Address */}
                {isSwadeshi ? (
                    <>
                        <Grid size={{xs:12, sm:6, md:2}}>
                            <ReuseState
                                name="state_id"
                                label="प्रदेश"
                                required
                                control={control}
                                error={errors.state_id}
                            />
                        </Grid>

                        <Grid size={{xs:12, sm:6, md:2}}>
                            <ReuseDistrict
                                name="district_id"
                                label="जिल्ला"
                                required
                                selectedState={selectedState}
                                control={control}
                                error={errors.district_id}
                            />
                        </Grid>

                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseMunicipality
                                name="municipality_id"
                                label="गा.पा./न.पा./उ.न.पा./म.न.पा."
                                required
                                selectedDistrict={selectedDistrict}
                                control={control}
                                error={errors.municipality_id}
                            />
                        </Grid>

                        <Grid size={{xs:12, sm:6, md:1}}>
                            <ReuseInput
                                name="wardno"
                                label="वडा नं."
                                type="number"
                                language="english"
                                required
                                control={control}
                                error={errors.wardno}
                            />
                        </Grid>
                    </>
                ) : (
                    /* Foreign Address */
                    <Grid size={{xs:12, md:8}}>
                        <ReuseInput
                            name="bidesh_nagrik_address_details"
                            label="विदेशी नागरिकको ठेगाना (English)"
                            required
                            language="english"
                            control={control}
                            error={errors.bidesh_nagrik_address_details}
                        />
                    </Grid>
                )}
            </Grid>
        </>
    );
};

export default AddressSection;
