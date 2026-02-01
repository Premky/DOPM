import React, { useState } from 'react';
import { Grid, Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { useFormContext } from 'react-hook-form';

import ReuseSelect from '../../../../ReuseableComponents/ReuseSelect';
import ReuseInput from '../../../../ReuseableComponents/ReuseInput';
import ReuseOffice from '../../../../ReuseableComponents/ReuseOffice';
import ReuseDistrict from '../../../../ReuseableComponents/ReuseDistrict';
import fetchFineTypes from '../../../../ReuseableComponents/fetchFineTypes';

const FineSection = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  // ✅ local dynamic row control
  const [fineCount, setFineCount] = useState(1);

  // ✅ fetch fine types
  const { optrecords: fineTypesOpt } = fetchFineTypes();

  return (
    <Grid container spacing={2}>
      <Grid
        size={{ xs: 12 }}
        sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'blue' }}
      >
        धरौटी/जरिवाना/क्षतिपुर्ती/विगो रकम तोकिएको छ वा छैन
      </Grid>

      {[...Array(fineCount)].map((_, index) => {
        const isFineFixed = watch(`fine[${index}].is_fine_fixed`);
        const isFinePaid = watch(`fine[${index}].is_fine_paid`);

        return (
          <Grid container spacing={2}  key={index} size={{ xs: 12}}>
            {/* छ / छैन */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseSelect
                name={`fine[${index}].is_fine_fixed`}
                label="छ/छैन"
                options={[
                  { label: 'छ', value: 1 },
                  { label: 'छैन', value: 0 },
                ]}
                defaultValue={0}
                required
                control={control}
                error={errors?.fine?.[index]?.is_fine_fixed}
              />
            </Grid>

            {isFineFixed === 1 && (
              <>
                {/* Fine Type */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <ReuseSelect
                    name={`fine[${index}].fine_type`}
                    label="प्रकार"
                    options={fineTypesOpt}
                    required
                    control={control}
                    error={errors?.fine?.[index]?.fine_type}
                  />
                </Grid>

                {/* Amount */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseInput
                    name={`fine[${index}].fine_amt`}
                    label="रकम (English मा)"
                    type="number"
                    required
                    control={control}
                    error={errors?.fine?.[index]?.fine_amt}
                  />
                </Grid>

                {/* Paid? */}
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseSelect
                    name={`fine[${index}].is_fine_paid`}
                    label="तिरेको छ/छैन"
                    options={[
                      { label: 'छ', value: 1 },
                      { label: 'छैन', value: 0 },
                    ]}
                    required
                    control={control}
                    error={errors?.fine?.[index]?.is_fine_paid}
                  />
                </Grid>

                {isFinePaid === 1 && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <ReuseOffice
                        name={`fine[${index}].fine_paid_office`}
                        label="जरिवाना तिरेको निकाय"
                        required
                        control={control}
                        error={errors?.fine?.[index]?.fine_paid_office}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <ReuseDistrict
                        name={`fine[${index}].fine_paid_office_district`}
                        label="जरिवाना तिरेको जिल्ला"
                        required
                        control={control}
                        error={errors?.fine?.[index]?.fine_paid_office_district}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <ReuseInput
                        name={`fine[${index}].fine_paid_cn`}
                        label="च.नं."
                        required
                        control={control}
                        error={errors?.fine?.[index]?.fine_paid_cn}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <ReuseInput
                        name={`fine[${index}].fine_paid_date`}
                        label="जरिवाना तिरेको मिति"
                        placeholder="YYYY-MM-DD"
                        required
                        control={control}
                        error={errors?.fine?.[index]?.fine_paid_date}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            {/* Add / Remove buttons */}
            <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
              <Button
                variant="contained"
                size="small"
                type="button"
                onClick={() => setFineCount(fineCount + 1)}
              >
                +
              </Button>
            </Grid>

            <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
              {fineCount > 1 && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  type="button"
                  onClick={() => setFineCount(fineCount - 1)}
                >
                  <RemoveIcon />
                </Button>
              )}
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FineSection;
