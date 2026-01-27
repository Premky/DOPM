import React from "react";
import { Grid, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";
import ReusePhotoInput from "../../../../ReuseableComponents/ReusePhotoInput";

import useBlockList from "../../../../ReuseableComponents/FetchApis/useBlockList";


const PersonalInfo = () => {
    const { control } = useFormContext();
    const { optrecords: blockListOpt, loading: blockListLoading } = useBlockList();

    return ( <>
        <Typography variant="h6" gutterBottom>
            व्यक्तिगत विवरण
        </Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseInput name="office_bandi_id" label="बन्दी आईडी" control={control} readonly={true} required={true} />
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
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseDateField
                    name="enrollment_date_bs"
                    label="दाखिला मिति (बि.स.)"
                    control={control}
                    required={true}
                    maxDate={"today"}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseSelect name="bandi_type" label="बन्दी प्रकार" control={control} options={[
                    { value: "कैदी", label: "कैदी" },
                    { value: "थुनुवा", label: "थुनुवा" },
                ]} required={true} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseInput name="bandi_name" label="बन्दीको नाम(नेपालीमा)" control={control} required={true} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseInput name="bandi_name_en" label="Name (In English)" control={control} required={true} language='english' />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseSelect
                    name="gender"
                    label="लिङ्ग"
                    control={control}
                    options={[
                        { value: "पुरुष", label: "पुरुष" },
                        { value: "महिला", label: "महिला" },
                    ]}
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
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseSelect
                    name="married_status"
                    label="विवाहित अवस्था"
                    control={control}
                    options={[
                        { value: "विवाहित", label: "विवाहित" },
                        { value: "अविवाहित", label: "अविवाहित" },
                        { value: "प्रत्यक्ष", label: "प्रत्यक्ष" },
                    ]}
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
                    required={true}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReuseInput
                    name="bandi_huliya"
                    label="बन्दीको हुलिया"
                    control={control}
                    required={true}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ReusePhotoInput
                    name="photo"
                    label="बन्दीको फोटो"
                    control={control}
                    required={true}
                    maxSizeMB={0.5} // optional
                    allowedTypes={/jpeg|jpg|png|gif|webp|jfif/} // optional
                />
            </Grid>


        </Grid>
    </> );
};
export default PersonalInfo;