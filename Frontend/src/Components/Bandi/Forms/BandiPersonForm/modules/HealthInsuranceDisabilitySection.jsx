import React, { useState } from "react";
import { Grid, Button, Box } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import { useFormContext } from "react-hook-form";

import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import ReuseInput from "../../../../ReuseableComponents/ReuseInput";
import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";

import fetchDiseases from "../../../../ReuseableComponents/fetchDiseases";
import fetchDisabilities from "../../../../ReuseableComponents/fetchDisabilities";

const HealthInsuranceDisabilitySection = () => {
  const { control, watch, formState: { errors } } = useFormContext();

  const [diseaseCount, setDiseaseCount] = useState(1);
  const [disabilityCount, setDisabilityCount] = useState(1);

  const { optrecords: diseasesOpt } = fetchDiseases();
  const { optrecords: disabilitiesOpt } = fetchDisabilities();

  const isInsuranceActive = watch("is_active");

  const sectionTitle = {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "blue",
    mb: 1,
  };

  return (
    <>
      {/* ================= Health / Disease ================= */}
      <Box sx={sectionTitle}>बन्दीको स्वास्थ्य अवस्था</Box>

      {[...Array(diseaseCount)].map((_, index) => {
        const isIll = watch(`disease[${index}].is_ill`);

        return (
          <Grid container spacing={2} key={`disease-${index}`}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseSelect
                name={`disease[${index}].is_ill`}
                label="बिरामी हो/होइन?"
                control={control}
                defaultValue={0}
                options={[
                  { label: "होइन", value: 0 },
                  { label: "हो", value: 1 },
                ]}
                error={errors?.disease?.[index]?.is_ill}
              />
            </Grid>

            {isIll === 1 && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <ReuseSelect
                    name={`disease[${index}].disease_id`}
                    label="रोग"
                    control={control}
                    options={diseasesOpt}
                    error={errors?.disease?.[index]?.disease_id}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <ReuseInput
                    name={`disease[${index}].disease_name`}
                    label="अन्य भए रोगको नाम"
                    control={control}
                    error={errors?.disease?.[index]?.disease_name}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => setDiseaseCount(diseaseCount + 1)}
              >
                +
              </Button>
            </Grid>

            <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
              {diseaseCount > 1 && (
                <Button
                  size="small"
                  color="warning"
                  variant="contained"
                  onClick={() => setDiseaseCount(diseaseCount - 1)}
                >
                  <RemoveIcon />
                </Button>
              )}
            </Grid>
          </Grid>
        );
      })}

      <hr />

      {/* ================= Disability ================= */}
      <Box sx={sectionTitle}>बन्दीको अपाङ्गताको अवस्था</Box>

      {[...Array(disabilityCount)].map((_, index) => {
        const isDisabled = watch(`disability[${index}].is_disabled`);

        return (
          <Grid container spacing={2} key={`disability-${index}`}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseSelect
                name={`disability[${index}].is_disabled`}
                label="अपाङ्ग हो/होइन?"
                control={control}
                defaultValue={0}
                options={[
                  { label: "होइन", value: 0 },
                  { label: "हो", value: 1 },
                ]}
                error={errors?.disability?.[index]?.is_disabled}
              />
            </Grid>

            {isDisabled === 1 && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <ReuseSelect
                    name={`disability[${index}].disability_id`}
                    label="अपाङ्गताको प्रकार"
                    control={control}
                    options={disabilitiesOpt}
                    error={errors?.disability?.[index]?.disability_id}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <ReuseInput
                    name={`disability[${index}].disability_name`}
                    label="अन्य भए अपाङ्गताको नाम"
                    control={control}
                    error={errors?.disability?.[index]?.disability_name}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => setDisabilityCount(disabilityCount + 1)}
              >
                +
              </Button>
            </Grid>

            <Grid size={{ xs: 1 }} sx={{ mt: 4 }}>
              {disabilityCount > 1 && (
                <Button
                  size="small"
                  color="warning"
                  variant="contained"
                  onClick={() => setDisabilityCount(disabilityCount - 1)}
                >
                  <RemoveIcon />
                </Button>
              )}
            </Grid>
          </Grid>
        );
      })}

      <hr />

      {/* ================= Health Insurance ================= */}
      <Box sx={sectionTitle}>बन्दीको स्वास्थ्य बिमा विवरण</Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <ReuseSelect
            name="is_active"
            label="बिमा छ/छैन?"
            control={control}
            defaultValue={0}
            options={[
              { label: "छैन", value: 0 },
              { label: "छ", value: 1 },
            ]}
            error={errors.is_active}
          />
        </Grid>

        {isInsuranceActive === 1 && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseDateField
                name="insurance_from"
                label="बिमा देखी"
                control={control}
                error={errors.insurance_from}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseDateField
                name="insurance_to"
                label="बिमा सम्म"
                control={control}
                error={errors.insurance_to}
              />
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
};

export default HealthInsuranceDisabilitySection;
