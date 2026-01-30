import React, { useState } from "react";
import { Grid, Button, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import ReuseRelativeRelations from "../../../../ReuseableComponents/ReuseRelativeRelations";
import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import { useFormContext } from "react-hook-form";
import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";

const FamilySection = () => {
    const { control, errors, watch } = useFormContext();
    const [familyCount, setFamilyCount] = useState( 1 );

    return (
        <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 12 }}>
                <Typography sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }}>
                    पारिवारीक / आश्रित विवरणः
                </Typography>
            </Grid>

            {[...Array( familyCount )].map( ( _, index ) => {
                const isDependent = watch( `family[${ index }].is_dependent` );

                return (
                    <Grid container spacing={2} size={{ xs: 12 }} key={index}>
                        {/* Relation */}
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <ReuseRelativeRelations
                                name={`family[${ index }].bandi_relative_relation`}
                                label="बन्दीसँगको नाता"
                                control={control}
                                error={errors?.family?.[index]?.bandi_relative_relation}
                            />
                        </Grid>

                        {/* Name */}
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <ReuseInput
                                name={`family[${ index }].bandi_relative_name`}
                                label="नामथर"
                                control={control}
                                error={errors?.family?.[index]?.bandi_relative_name}
                            />
                        </Grid>

                        {/* Address */}
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name={`family[${ index }].bandi_relative_address`}
                                label="ठेगाना"
                                control={control}
                                maxLength={180}
                                error={errors?.family?.[index]?.bandi_relative_address}
                            />
                        </Grid>

                        {/* Dependent */}
                        <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                            <ReuseSelect
                                name={`family[${ index }].is_dependent`}
                                label="आश्रित हो / होइन?"
                                options={[
                                    { label: "हो", value: 1 },
                                    { label: "होइन", value: 0 },
                                ]}
                                defaultValue={0}
                                control={control}
                                error={errors?.family?.[index]?.is_dependent}
                            />
                        </Grid>

                        {/* Conditional Fields */}
                        {isDependent === 1 && (
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <ReuseDateField
                                    name={`family[${ index }].bandi_relative_dob`}
                                    label="जन्म मिति"
                                    control={control}
                                    error={errors?.family?.[index]?.bandi_relative_dob}
                                    maxDate={'today'}
                                />
                            </Grid>
                        )}

                        {isDependent === 0 && (
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <ReuseInput
                                    name={`family[${ index }].bandi_relative_contact_no`}
                                    label="सम्पर्क नं."
                                    onlyDigits
                                    minLength={10}
                                    maxLength={10}
                                    control={control}
                                    error={errors?.family?.[index]?.bandi_relative_contact_no}
                                />
                            </Grid>
                        )}

                        {/* Add / Remove Buttons */}
                        <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setFamilyCount( familyCount + 1 )}
                            >
                                +
                            </Button>
                        </Grid>

                        <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
                            {familyCount > 1 && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="small"
                                    onClick={() => setFamilyCount( familyCount - 1 )}
                                >
                                    <RemoveIcon />
                                </Button>
                            )}
                        </Grid>

                        {/* Divider */}
                        {familyCount > 1 && (
                            <Grid size={{ xs: 12 }}>
                                <hr style={{ borderStyle: "dashed", borderColor: "#ccc" }} />
                            </Grid>
                        )}
                    </Grid>
                );
            } )}
        </Grid>
    );
};

export default FamilySection;
