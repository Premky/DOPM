import React, { useState } from "react";
import { Grid, Button, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { useFormContext } from "react-hook-form";

import ReuseRelativeRelations from "../../../../ReuseableComponents/ReuseRelativeRelations";
import ReuseInput from "../../../../ReuseableComponents/ReuseInput";

const ContactPersonSection = () => {
    const { control, formState: { errors } } = useFormContext();
    const [contactCount, setContactCount] = useState( 1 );

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem", color: "blue" }}>
                        सम्पर्क व्यक्ति
                    </Typography>
                </Grid>

                {[...Array( contactCount )].map( ( _, index ) => (
                    <Grid container spacing={2} key={index}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseRelativeRelations
                                name={`contact_person[${ index }].relation_id`}
                                label="बन्दीसँगको नाता"
                                required
                                control={control}
                                error={errors?.contact_person?.[index]?.relation_id}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name={`contact_person[${ index }].contact_name`}
                                label="नामथर"
                                required
                                control={control}
                                error={errors?.contact_person?.[index]?.contact_name}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name={`contact_person[${ index }].contact_address`}
                                label="ठेगाना"
                                required
                                maxLength={180}
                                control={control}
                                error={errors?.contact_person?.[index]?.contact_address}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <ReuseInput
                                name={`contact_person[${ index }].contact_contact_details`}
                                label="सम्पर्क नं."
                                required
                                onlyDigits
                                minLength={10}
                                maxLength={10}
                                control={control}
                                error={errors?.contact_person?.[index]?.contact_contact_details}
                            />
                        </Grid>

                        {/* Add button */}
                        <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                            <Button
                                variant="contained"
                                size="small"
                                type="button"
                                onClick={() => setContactCount( contactCount + 1 )}
                            >
                                +
                            </Button>
                        </Grid>

                        {/* Remove button */}
                        <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                            {contactCount > 1 && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="small"
                                    type="button"
                                    onClick={() => setContactCount( contactCount - 1 )}
                                >
                                    <RemoveIcon />
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                ) )}
            </Grid>
        </>
    );
};

export default ContactPersonSection;
