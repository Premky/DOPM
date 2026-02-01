import React, { useEffect } from "react";
import { Grid, Typography } from "@mui/material";

import ReuseDateField from "../../../../ReuseableComponents/ReuseDateField";
import ReuseInput from "../../../../ReuseableComponents/ReuseInput";

import { useFormContext } from "react-hook-form";
import ReuseSelect from "../../../../ReuseableComponents/ReuseSelect";
import { calculateBSDate, sumDates } from "../../../../../../Utils/dateCalculator";
import ReusePdfInput from "../../../../ReuseableComponents/ReusePDFInput";

const KaidDetailsSection = ( {formattedDateNp} ) => {
  const currentdate = formattedDateNp;

  const {
    control,
    watch,
    errors,
    setValue
  } = useFormContext();
  const selectedbandi_type = watch( 'bandi_type' );
  const is_life_time = watch( "is_life_time" );
  const hirasat_date_bs = watch( 'hirasat_date_bs' );
  const release_date_bs = watch( 'release_date_bs' );
  const hirasat_years = watch( 'hirasat_years' );
  const hirasat_months = watch( 'hirasat_months' );
  const hirasat_days = watch( 'hirasat_days' );

  useEffect( () => {
    const calculateKaidDuration = () => {
      if ( hirasat_date_bs && release_date_bs ) {
        const kaidDuration = calculateBSDate( hirasat_date_bs, release_date_bs );
        const bhuktanDuration = calculateBSDate( hirasat_date_bs, currentdate, kaidDuration );
        const berujuDuration = calculateBSDate( currentdate, release_date_bs, kaidDuration );

        const totalkaidDuration = sumDates( hirasat_years, hirasat_months, hirasat_days, kaidDuration );
        const totalBhuktanDuration = sumDates( hirasat_years, hirasat_months, hirasat_days, bhuktanDuration );

        setValue( 'kaid_duration', `${ kaidDuration.years }|${ kaidDuration.months }|${ kaidDuration.days }` );
        setValue( 'total_kaid_duration', `${ totalkaidDuration.totalYears }|${ totalkaidDuration.totalMonths }|${ totalkaidDuration.totalDays }` );
        setValue( 'total_bhuktan_duration', `${ totalBhuktanDuration.totalYears }|${ totalBhuktanDuration.totalMonths }|${ totalBhuktanDuration.totalDays }` );
        setValue( 'bhuktan_duration', `${ bhuktanDuration.years }|${ bhuktanDuration.months }|${ bhuktanDuration.days }` );
        setValue( 'beruju_duration', `${ berujuDuration.years }|${ berujuDuration.months }|${ berujuDuration.days }` );
      }
    };

    if ( hirasat_date_bs?.length === 10 && release_date_bs?.length === 10 ) {
      calculateKaidDuration();
    }
  }, [
    hirasat_date_bs,
    release_date_bs,
    currentdate,
    hirasat_years,
    hirasat_months,
    hirasat_days,
    setValue,
  ] );

  return (
    <>
      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12 }}
          sx={{ color: "blue", fontWeight: "bold", fontSize: "1.5rem" }}
        >
          पक्राउ/हिरासत/थुना/कैद/छुट्ने विवरण
        </Grid>

        {/* हिरासत अवधि */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Grid container>
            <Grid size={{ xs: 12 }}>
              हिरासत/थुनामा बसेको अवधि
            </Grid>

            <Grid size={{ xs: 4 }}>
              <ReuseInput
                name="hirasat_years"
                label="वर्ष"
                type="number"
                required
                control={control}
                error={errors?.hirasat_years}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <ReuseInput
                name="hirasat_months"
                label="महिना"
                type="number"
                required
                control={control}
                error={errors?.hirasat_months}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <ReuseInput
                name="hirasat_days"
                label="दिन"
                type="number"
                required
                control={control}
                error={errors?.hirasat_days}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* थुना मिति */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ReuseDateField
            name="hirasat_date_bs"
            label="थुना/कैद परेको मिति"
            placeholder="YYYY-MM-DD"
            required
            maxDate={'today'}
            control={control}
            error={errors?.hirasat_date_bs}
          />
        </Grid>

        {/* कैदी सम्बन्धित विवरण */}
        {selectedbandi_type === "कैदी" && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseSelect
              name={`is_life_time`}
              label="आजीवन कैद?"
              options={[
                { label: "हो", value: 1 },
                { label: "होइन", value: 0 },
              ]}
              control={control}
            />
          </Grid>
        )}
        {selectedbandi_type === "कैदी" && is_life_time == 0 && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDateField
                name="release_date_bs"
                label="छुट्ने मिति"
                placeholder="YYYY-MM-DD"
                required
                control={control}
                error={errors?.release_date_bs}
              />
            </Grid>

            <Grid container size={{ xs: 12 }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <ReuseInput
                  name="total_kaid_duration"
                  label="जम्मा कैद अवधि"
                  control={control}
                  error={errors?.total_kaid_duration}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <ReuseInput
                  name="bhuktan_duration"
                  label="भुक्तान अवधि"
                  required
                  control={control}
                  error={errors?.bhuktan_duration}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <ReuseInput
                  name="total_bhuktan_duration"
                  label="जम्मा भुक्तान अवधि"
                  required
                  control={control}
                  error={errors?.total_bhuktan_duration}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <ReuseInput
                  name="beruju_duration"
                  label="बाँकी अवधि"
                  required
                  control={control}
                  error={errors?.beruju_duration}
                />
              </Grid>
            </Grid>
          </>
        )}
        {/* <Grid size={{ xs: 12, sm: 3 }}>
          <ReusePdfInput
            name="kaid_pdf"
            label="थुनुवा/कैदी पुर्जी(PDF मात्र)"
            required
            control={control}
            error={errors?.kaid_pdf}
          />
        </Grid> */}
      </Grid>
    </>
  );
};

export default KaidDetailsSection;
