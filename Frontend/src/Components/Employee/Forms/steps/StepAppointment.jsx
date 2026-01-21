import React from "react";
import { Grid, Button, Stack } from "@mui/material";
import { useForm } from "react-hook-form";

import ReuseSelect from "../../../ReuseableComponents/ReuseSelect";
import ReuseDateField from "../../../ReuseableComponents/ReuseDateField";
import ReuseOffice from "../../../ReuseableComponents/ReuseOffice";
import usePosts from "../../APIs/usePosts";
import ReuseInput from "../../../ReuseableComponents/ReuseInput";

const StepAppointment = ( { onNext, onBack } ) => {
  const { handleSubmit, control } = useForm();
  const { posts, optPosts, postsloading, level, optLevel, Levelloading, serviceGroups, optServiceGroups, serviceGroupsloading } = usePosts();

  return (
    <form onSubmit={handleSubmit( onNext )}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="jd"
            label="नयाँ नियुक्ति/सरुवा/काज"
            required={true}
            control={control}
            options={[
              { label: "नयाँ नियुक्ती", value: "नयाँ नियुक्ती" },
              { label: "सरुवा", value: "सरुवा" },
              { label: "काज", value: "काज" },
              { label: "बढुवा", value: "बढुवा" },
              { label: "पदस्थापन", value: "पदस्थापन" },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseDateField
            name="appointment_date_bs"
            label="मिति(वि.सं.)"
            required={true}
            control={control}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseDateField
            name="hajir_miti_bs"
            label="हाजिर मिति(वि.सं.)"
            required={true}
            control={control}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="emp_group"
            label="सेवा समूह"
            required={true}
            control={control}
            options={optServiceGroups}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="emp_level"
            label="श्रेणी/तह"
            required={true}
            control={control}
            options={optLevel}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="emp_post"
            label="पद"
            required={true}
            control={control}
            options={optPosts}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseOffice name="current_office_id" label="कारागार कार्यालय" required={true} control={control} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="is_chief"
            label="कार्यालय प्रमुख हो?"
            required={true}
            control={control}
            options={[
              { label: 'हो', value: 'हो' },
              { label: 'निमित्त', value: 'निमित्त' },
              { label: 'होइन', value: 'होइन' }
            ]}
          // error={errors.is_chief}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="is_current"
            label="के यो हालको विवरण हो?"
            required={true}
            control={control}
            options={[
              { label: 'हो', value: '1' },
              { label: 'होइन', value: '0' },
            ]}
            defaultValue={0}
          // error={errors.is_chief}
          />
        </Grid>
        <Grid>
          <ReuseInput
            name="remarks"
            label="कैफियत"
            required={false}
            control={control}
          // error={errors.is_chief}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2}>
            <Button onClick={onBack}>Back</Button>
            <Button type="submit" variant="contained">
              Next
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default StepAppointment;
