import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import ReuseMudda from "../../../../ReuseableComponents/ReuseMudda";
import ReuseOffice from "../../../../ReuseableComponents/ReuseOffice";
import ReuseDatePickerSMV5 from "../../../../ReuseableComponents/ReuseDatePickerSMV5";
import ReusePhotoInput from "../../../../ReuseableComponents/ReusePhotoInput";

import fetchMuddaGroups from "../../../../ReuseableComponents/FetchApis/fetchMuddaGroups";
import { calculateBSDate } from "../../../../../../Utils/dateCalculator";

import { useFormContext } from "react-hook-form";

const MuddaSection = () => {
    const { control, errors, watch, setValue } = useFormContext();
    const [muddaCount, setMuddaCount] = useState( 1 );
    const { optrecords: muddaGroups } = fetchMuddaGroups();

    useEffect( () => {
        [...Array( muddaCount )].forEach( ( _, index ) => {
            const thuna = watch( `thuna_date_bs_${ index + 1 }` );
            const release = watch( `release_date_bs_${ index + 1 }` );

            if ( thuna && release ) {
                const d = calculateBSDate( thuna, release );
                setValue(
                    `total_kaid_duration_${ index + 1 }`,
                    `${ d.years }|${ d.months }|${ d.days }`
                );
            }
        } );
    }, [muddaCount, watch, setValue] );

    return (
        <Grid container spacing={2}>
            <Grid size={{xs:12}}>
                <Typography sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }}>
                    बन्दीको मुद्दा विवरणः
                </Typography>
            </Grid>

            {[...Array( muddaCount )].map( ( _, index ) => {
                const i = index + 1;
                const muddaGroupId = watch( `mudda_group_id${ i }` );
                const muddaCondition = watch( `mudda_condition_${ i }` );
                const isLifeTime = watch( `is_life_time_${ i }` );

                return (
                    <Grid container spacing={2} key={i}>
                        {/* Mudda Group */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseSelect
                                name={`mudda_group_id${ i }`}
                                label="मुद्दा समूह"
                                options={muddaGroups}
                                required
                                control={control}
                                error={errors?.[`mudda_group_id${ i }`]}
                            />
                        </Grid>

                        {/* Mudda */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseMudda
                                name={`mudda_id_${ i }`}
                                label="मुद्दा"
                                muddaGroupId={muddaGroupId}
                                required
                                control={control}
                                error={errors?.[`mudda_id_${ i }`]}
                            />
                        </Grid>

                        {/* Mudda No */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseInput
                                name={`mudda_no_${ i }`}
                                label="मुद्दा नं."
                                required
                                control={control}
                                error={errors?.[`mudda_no_${ i }`]}
                            />
                        </Grid>

                        {/* Vadi */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseInput
                                name={`vadi_${ i }`}
                                label="वादी / जाहेरवाला"
                                required
                                control={control}
                                error={errors?.[`vadi_${ i }`]}
                            />
                        </Grid>

                        {/* Office */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseOffice
                                name={`mudda_office_${ i }`}
                                label="मुद्दा रहेको निकाय"
                                required
                                control={control}
                                error={errors?.[`mudda_office_${ i }`]}
                            />
                        </Grid>

                        {/* Thuna Date */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseDatePickerSMV5
                                name={`thuna_date_bs_${ i }`}
                                label="थुना / कैद परेको मिति"
                                maxDate={'today'}
                                required
                                control={control}
                                error={errors?.[`thuna_date_bs_${ i }`]}
                            />
                        </Grid>

                        {/* Mudda Condition */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseSelect
                                name={`mudda_condition_${ i }`}
                                label="मुद्दाको अवस्था"
                                options={[
                                    { label: "चालु", value: 1 },
                                    { label: "अन्तिम", value: 0 },
                                ]}
                                required
                                control={control}
                                error={errors?.[`mudda_condition_${ i }`]}
                            />
                        </Grid>

                        {/* Purji */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReusePhotoInput
                                name={`thunuwa_or_kaidi_purji_${ i }`}
                                label="थुनुवा / कैदी पुर्जी"
                                required
                                control={control}
                                error={errors?.[`thunuwa_or_kaidi_purji_${ i }`]}
                                showAvatar={false}
                                maxSizeMB={0.5}
                            />
                        </Grid>

                        {/* Conditional (Final Mudda) */}
                        {muddaCondition === 0 && (
                            <>
                                <Grid size={{xs:12, sm:6, md:3}}>
                                    <ReuseSelect
                                        name={`is_life_time_${ i }`}
                                        label="आजीवन कैद?"
                                        options={[
                                            { label: "हो", value: 1 },
                                            { label: "होइन", value: 0 },
                                        ]}
                                        control={control}
                                    />
                                </Grid>

                                {isLifeTime === 0 && (
                                    <Grid size={{xs:12, sm:6, md:3}}>
                                        <ReuseDatePickerSMV5
                                            name={`release_date_bs_${ i }`}
                                            label="छुट्ने मिति"
                                            required
                                            control={control}
                                            error={errors?.[`release_date_bs_${ i }`]}
                                        />
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* Duration */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseInput
                                name={`total_kaid_duration_${ i }`}
                                label="जम्मा कैद अवधि"
                                control={control}
                                error={errors?.[`total_kaid_duration_${ i }`]}
                            />
                        </Grid>

                        {/* Main / Last */}
                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseSelect
                                name={`is_main_mudda_${ i }`}
                                label="मुख्य मुद्दा?"
                                options={[
                                    { label: "हो", value: 1 },
                                    { label: "होइन", value: 0 },
                                ]}
                                required
                                control={control}
                            />
                        </Grid>

                        <Grid size={{xs:12, sm:6, md:3}}>
                            <ReuseSelect
                                name={`is_last_mudda_${ i }`}
                                label="अन्तिम मुद्दा?"
                                options={[
                                    { label: "हो", value: 1 },
                                    { label: "होइन", value: 0 },
                                ]}
                                required
                                control={control}
                            />
                        </Grid>

                        {/* Add / Remove */}
                        <Grid size={{xs:1}} sx={{ mt: 4 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setMuddaCount( muddaCount + 1 )}
                            >
                                +
                            </Button>
                        </Grid>

                        <Grid size={{xs:1}} sx={{ mt: 4 }}>
                            {muddaCount > 1 && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="small"
                                    onClick={() => setMuddaCount( muddaCount - 1 )}
                                >
                                    <RemoveIcon />
                                </Button>
                            )}
                        </Grid>

                        <Grid size={{xs:12}}>
                            <hr style={{ borderStyle: "dashed" }} />
                        </Grid>
                    </Grid>
                );
            } )}
        </Grid>
    );
};

export default MuddaSection;
