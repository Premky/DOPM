import React from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";
import ReusePhotoInput from "../../../../ReuseableComponents/ReusePhotoInput";

import useBlockList from "../../../../ReuseableComponents/FetchApis/useBlockList";


const PersonalInfo = () => {
    const { control, watch, formState: { errors } } = useFormContext();
    const { optrecords: blockListOpt, loading: blockListLoading } = useBlockList();

    const OfficeBandiId = watch( "office_bandi_id" );    // to re-render on change

    return ( <>
        <Typography sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }} gutterBottom>
            पारिवारीक / आश्रित विवरणः
        </Typography>
        <Grid container spacing={2}>
            <Grid container size={{ xs: 12, sm: 9, md: 9 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseInput name="office_bandi_id" label="बन्दी आईडी" control={control} readonly={true} required={true} defaultValue={OfficeBandiId} error={errors?.office_bandi_id} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseInput name="lagat_no" label="लगत नं" control={control} required={false} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseSelect
                        name="block_no"
                        label="ब्लक नं"
                        control={control}
                        options={blockListOpt}
                        required={true}
                        disabled={blockListLoading}
                        error={errors?.block_no}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseDateField
                        name="enrollment_date_bs"
                        label="दाखिला मिति (बि.स.)"
                        control={control}
                        required={true}
                        maxDate={"today"}
                        error={errors?.enrollment_date_bs}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseSelect name="bandi_type" label="बन्दी प्रकार" control={control} options={[
                        { value: "कैदी", label: "कैदी" },
                        { value: "थुनुवा", label: "थुनुवा" },
                    ]} required={true}
                        error={errors?.bandi_type}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseInput name="bandi_name" label="बन्दीको नाम(नेपालीमा)" control={control} required={true} error={errors?.bandi_name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseInput name="bandi_name_en" label="Name (In English)" control={control} required={true} language='english' error={errors?.bandi_name_en} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseSelect
                        name="gender"
                        label="लिङ्ग"
                        control={control}
                        options={[
                            { label: 'पुरुष', value: 'male' },
                            { label: 'महिला', value: 'female' },
                            { label: 'अन्य', value: 'other' }
                        ]}
                        error={errors?.gender}
                        required={true}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseDateField
                        name="dob"
                        label="जन्म मिति"
                        control={control}
                        placeholder={"YYYY-MM-DD"}
                        required={true}
                        maxDate={"today"}
                        error={errors?.dob}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseSelect
                        name="married_status"
                        label="विवाहित अवस्था"
                        control={control}
                        options={[
                            { value: "Married", label: "विवाहित" },
                            { value: "Unmarried", label: "अविवाहित" },
                        ]}
                        error={errors?.married_status}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseSelect
                        name="bandi_education"
                        label="शैक्षिक योग्यता"
                        control={control}
                        options={[
                            { label: 'थाहा नभएको', value: 'थाहा नभएको' },
                            { label: 'नपढेको', value: 'नपढेको' },
                            { label: 'सामान्य पढ्न लेख्न जान्ने', value: 'सामान्य पढ्न लेख्न जान्ने' },
                            { label: 'आठ सम्म', value: 'आठ सम्म' },
                            { label: 'एस.एल.सी/एस.ई.ई', value: 'एस.एल.सी/एस.ई.ई' },
                            { label: '+२ वा सो सरह', value: '+२ वा सो सरह' },
                            { label: 'स्नातक', value: 'स्नातक' },
                            { label: 'स्नातकोत्तर', value: 'स्नातकोत्तर' },
                        ]}
                        error={errors?.bandi_education}
                        required={true}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <ReuseInput
                        name="bandi_huliya"
                        label="बन्दीको हुलिया"
                        control={control}
                        required={true}
                        error={errors?.bandi_huliya}
                    />
                </Grid>


            </Grid>
            <Grid container size={{ xs: 12, sm: 3, md: 3 }}>
                <ReusePhotoInput
                    name="bandi_photo"
                    label="बन्दीको फोटो"
                    control={control}
                    required={true}
                    maxSizeMB={0.5} // optional
                    allowedTypes={/jpeg|jpg|png|gif|webp|jfif/} // optional
                    error={errors?.bandi_photo}
                />
            </Grid>

        </Grid>
    </> );
};
export default PersonalInfo;