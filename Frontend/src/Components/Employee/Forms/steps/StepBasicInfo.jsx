import React from "react";
import { Grid, Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

// import ReuseInput from "../../ReuseableComponents/ReuseInput";

import ReuseSelect from "../../../ReuseableComponents/ReuseSelect";
import ReuseDateField from "../../../ReuseableComponents/ReuseDateField";
import ReuseState from "../../../ReuseableComponents/ReuseState";
import ReuseDistrict from "../../../ReuseableComponents/ReuseDistrict";
import ReuseMunicipality from "../../../ReuseableComponents/ReuseMunicipality";
import ReusePhotoInput from "../../../ReuseableComponents/ReusePhotoInput";
import ReuseInput from "../../../ReuseableComponents/ReuseInput";

const StepBasicInfo = ( { onNext } ) => {
  const { control, handleSubmit, watch } = useForm( { mode: "all" } );
  const watchProvince = watch( "province_id" );
  const watchDistrict = watch( "district_id" );

  return (
    <form onSubmit={handleSubmit( onNext )}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseInput
            name="name_in_nepali"
            label="नाम (नेपाली)"
            required={true}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseInput
            name="name_in_english"
            label="Name (English)"
            required={true}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="emp_type"
            label="कर्माचरी प्रकार"
            required={true}
            control={control}
            options={[
              { label: "स्थायी", value: "स्थायी" },
              { label: "करार", value: "करार" },
              { label: "ज्यालादारी", value: "ज्यालादारी" },
              { label: "बढुवा", value: "बढुवा" },
              { label: "पदस्थापन", value: "पदस्थापन" },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseInput
            name="sanket_no"
            label="संकेत नं"
            required={true}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseInput
            name="mobile_no"
            label="मोबाइल नं"
            required={true}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseInput
            name="email"
            label="इमेल"
            required={true}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="gender"
            label="लिङ्ग"
            required={true}
            control={control}
            options={[
              { label: "पुरुष", value: "पुरुष" },
              { label: "महिला", value: "महिला" },
              { label: "अन्य", value: "अन्य" },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseDateField
            name="dob"
            label="जन्म मिति"
            required={true}
            control={control}
            maxDate={'today'}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ReuseSelect
            name="married_status"
            label="वैवाहिक अवस्था"
            required={true}
            control={control}
            options={[{ label: "विवाहित", value: "विवाहित" }, { label: "अविवाहित", value: "अविवाहित" }, { label: "एकल", value: "एकल" }]}
          />
        </Grid>


        {/* Address */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReuseState
            name="province_id"
            label="प्रदेश"
            required={true}
            control={control}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <ReuseDistrict
            name="district_id"
            label="जिल्ला"
            required={true}
            control={control}
            selectedState={watchProvince}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReuseMunicipality
            name="municipality_id"
            label="गा.पा./न.पा."
            required={true}
            control={control}
            selectedDistrict={watchDistrict}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <ReuseInput
            name="ward_no"
            label="वडा नं."
            required={true}
            control={control}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ReusePhotoInput
            name="photo"
            label="फोटो"
            required={true}
            control={control}
            maxSizeMB={0.5}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button type="submit" variant="contained">
            Next
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default StepBasicInfo;
