import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import { Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { Grid } from '@mui/material';

import ReuseInput from '../ReuseableComponents/ReuseInput';
import ReuseSelect from '../ReuseableComponents/ReuseSelect';
import ReuseCountry from '../ReuseableComponents/ReuseCountry';
import ReuseDistrict from '../ReuseableComponents/ReuseDistrict';
import ReuseMunicipality from '../ReuseableComponents/ReuseMunicipality';
import ReuseState from '../ReuseableComponents/ReuseState';
import ReuseMudda from '../ReuseableComponents/ReuseMudda';
import ReuseOffice from '../ReuseableComponents/ReuseOffice';
import ReuseDateField from '../ReuseableComponents/ReuseDateField';


const BandiPersonForm = () => {
  const BASE_URL = useBaseURL();

  const {
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      office_bandi_id: '',
      // other fields...
    },
  });

  const [muddaCount, setMuddaCount] = useState(1);


  const selectedNationality = watch('nationality_id');
  const selectedState = watch('state_id');
  const selectedDistrict = watch('district_id');
  const selectedbandi_type = watch('bandi_type');
  const selectedIs_amount_fixed = watch("is_amount_fixed");
  const selectedIs_compensation = watch("is_compensation");
  const selectedIs_bigo = watch("is_bigo");
  const testVariable = watch('office_bandi_id');
  // console.log('office_bandi_id', testVariable)

  const onSubmit = (data) => {
    console.log(data);
    // Submit data to backend
  };

  const genderOptions = [
    { label: 'पुरुष', value: 'male' },
    { label: 'महिला', value: 'female' },
  ];

  useEffect(() => {
    const fetchRandomBandiId = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/bandi/get_random_bandi_id`);
        const { Status, Result } = response.data;
        if (Status) {
          setValue('office_bandi_id', Result || '');
        }
      } catch (err) {
        console.error('Error fetching Bandi ID:', err);
      }
    };
    fetchRandomBandiId();
  }, [BASE_URL, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name='office_bandi_id'
            label="बन्दीको आई.डि."
            // defaultValue={band_rand_id}
            required={true}
            control={control}
            error={errors.office_bandi_id} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseSelect
            name="bandi_type"
            label="कैदी/बन्दी"
            required={true}
            control={control}
            error={errors.bandi_type}
            options={[{ label: 'कैदी', value: 'कैदी' },
            { label: 'बन्दी', value: 'बन्दी' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_name"
            label="बन्दीको नाम"
            required={true}
            control={control}
            error={errors.bandi_name}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReuseSelect
            name="gender"
            label="लिङ्ग"
            required={true}
            control={control}
            error={errors.gender}
            options={genderOptions}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="dob"
            label="जन्म मिति (वि.सं.)"
            required={true}
            control={control}
            error={errors.dob}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="age"
            label="उमेर"
            required={true}
            control={control}
            error={errors.age}
            type="number"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseSelect
            name="married_status"
            label="वैवाहिक अवस्था"
            required={true}
            control={control}
            error={errors.married_status}
            options={[{ label: 'विवाहित', value: 'married' },
            { label: 'अविवाहित', value: 'unmarried' },
            ]}
          />
        </Grid>


        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_education"
            label="बन्दीको शैक्षिक योग्यता"
            required={true}
            control={control}
            error={errors.bandi_education}
            type="number"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_height"
            label="बन्दीको उचाई"
            required={true}
            control={control}
            error={errors.bandi_height}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_weight"
            label="बन्दीको तौल"
            required={true}
            control={control}
            error={errors.bandi_weight}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_huliya"
            label="बन्दीको हुलिया"
            required={true}
            control={control}
            error={errors.bandi_huliya}
          />
        </Grid>

        {/* <Grid item xs={12} sm={6} md={3}>
          <ReuseInput
            name="bandi_face_color"
            label="बन्दीको रङ"
            required={true}
            control={control}
            error={errors.bandi_face_color}
          />
        </Grid> */}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          कैदीबन्दीको ठेगानाः
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <ReuseCountry
            name="nationality_id"
            label="राष्ट्रियता"
            defaultvalue={1}
            required={true}
            control={control}
            error={errors.nationality_id}
          />
        </Grid>
        {selectedNationality === 1 ? (
          <>
            <Grid item xs={12} sm={6} md={2}>
              <ReuseState
                name="state_id"
                label="प्रदेश"
                required={true}
                control={control}
                error={errors.state_id}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ReuseDistrict
                name="district_id"
                label="जिल्ला"
                required={true}
                control={control}
                error={errors.district_id}
                selectedState={selectedState}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseMunicipality
                name="municipality_id"
                label="गा.पा./न.पा./उ.न.पा./म.न.पा."
                required={true}
                control={control}
                error={errors.municipality_id}
                selectedDistrict={selectedDistrict}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <ReuseInput
                name="wardno"
                label="वडा नं."
                type="number"
                required={true}
                control={control}
                error={errors.ward_no}
              />
            </Grid>
          </>
        ) : <>
          <Grid item xs={12} sm={6} md={10}>
            <ReuseInput
              name="bidesh_nagrik_address_details"
              label="विदेशी नागरिक भए (ठेगाना)"
              required={true}
              control={control}
              error={errors.bidesh_nagrik_address_details}
            />
          </Grid>
        </>}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          कैदीबन्दीको मुद्दा विवरणः
        </Grid>

        {[...Array(muddaCount)].map((_, index) => (
          <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <ReuseMudda
                name={`mudda_id_${index + 1}`}
                label="मुद्दा"
                required={true}
                control={control}
                error={errors[`mudda_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseInput
                name={`mudda_no_${index + 1}`}
                label="मुद्दा नं."
                required={true}
                control={control}
                error={errors[`mudda_no_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseInput
                name={`vadi_${index + 1}`}
                label="वादी वा जाहेरवालाको नाम"
                required={true}
                control={control}
                error={errors[`vadi_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseOffice
                name={`mudda_office_${index + 1}`}
                label="मुद्दा रहेको कार्यालय"
                required={true}
                control={control}
                error={errors[`mudda_office_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseDistrict
                name={`mudda_district_${index + 1}`}
                label="मुद्दा रहेको जिल्ला"
                required={true}
                control={control}
                error={errors[`mudda_district_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ReuseSelect
                name={`mudda_condition_${index + 1}`}
                label="मुद्दाको अवस्था?"
                required={true}
                control={control}
                options={[
                  { label: 'चालु', value: 1 },
                  { label: 'बेचालु', value: 0 },
                ]}
                error={errors[`mudda_condition_${index + 1}`]}
              />
            </Grid>

            {selectedbandi_type == 'कैदी' && (
              <Grid item xs={12} sm={6} md={3}>
                <ReuseDateField
                  name='mudda_phesala_date'
                  label='मुद्दा फैसला मिति'
                  placeholder={'YYYY-MM-DD'}
                  required={true}
                  control={control}
                  error={errors.mudda_phesala_date}
                />
              </Grid>
            )}

            <Grid item xs={11} sm={5} md={2}>
              <ReuseSelect
                name={`is_main_mudda_${index + 1}`}
                label="मुख्य मुददा हो/होइन?"
                required={true}
                control={control}
                options={[
                  { label: 'होइन', value: 0 },
                  { label: 'हो', value: 1 },
                ]}
                error={errors[`is_main_mudda_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={11} sm={5} md={2}>
              <ReuseSelect
                name={`is_last_mudda_${index + 1}`}
                label="अन्तिम मुददा हो/होइन?"
                required={true}
                control={control}
                options={[
                  { label: 'होइन', value: 0 },
                  { label: 'हो', value: 1 },
                ]}
                error={errors[`is_main_mudda_${index + 1}`]}
              />
            </Grid>

            <Grid item xs={1} sm={1} md={1} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                type="button"
                onClick={() => setMuddaCount(muddaCount + 1)}
              >
                +
              </Button>
            </Grid>

            <Grid item xs={1} sm={1} md={1} sx={{ mt: 3 }}>
              {muddaCount > 1 && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  type="button"
                  onClick={() => setMuddaCount(muddaCount - 1)}
                >
                  <RemoveIcon />
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12}>
          जरिवाना रकम तोकिएको छ वा छैं‍न
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <ReuseSelect
            name='is_amount_fixed'
            label='छ/छैन'
            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
            required={true}
            control={control}
            error={errors.is_amount_fixed}
          />
        </Grid>
        {selectedIs_amount_fixed === 1 && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='fine_amt'
                label='रकम'
                required={true}
                control={control}
                error={errors.fine_amt}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseSelect
                name='is_fine_paid'
                label='तिरेको छ/छैन'
                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                required={true}
                control={control}
                error={errors.is_fine_paid}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseOffice
                name='fine_paid_office'
                label='जरिवाना तिरेको कार्यालय'
                required={true}
                control={control}
                error={errors.fine_paid_office}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseDistrict
                name='fine_paid_office_district'
                label='जरिवाना तिरेको जिल्ला'
                required={true}
                control={control}
                error={errors.fine_paid_office_district}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='fine_paid_cn'
                label='च.नं.'
                required={true}
                control={control}
                error={errors.fine_paid_cn}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <ReuseDateField
                name='fine_paid_date'
                label='जरिवाना तिरेको मिति'
                placeholder='YYYY-MM-DD'
                required={true}
                control={control}
                error={errors.fine_paid_date}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12}>
          क्षतिपुर्ती रकम तोकिएको छ वा छैं‍न
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <ReuseSelect
            name='is_compensation'
            label='छ/छैन'
            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
            required={true}
            control={control}
            error={errors.is_compensation}
          />
        </Grid>

        {selectedIs_compensation == 1 && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='compensation_amt'
                label='रकम'
                required={true}
                control={control}
                error={errors.compensation_amt}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseSelect
                name='is_compensation_paid'
                label='तिरेको छ/छैन'
                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                required={true}
                control={control}
                error={errors.is_compensation_paid}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseOffice
                name='compensation_paid_office'
                label='क्षतिपुर्ती तिरेको कार्यालय'
                required={true}
                control={control}
                error={errors.compensation_paid_office}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseDistrict
                name='compensation_paid_office_district'
                label='क्षतिपुर्ती तिरेको जिल्ला'
                required={true}
                control={control}
                error={errors.compensation_paid_office_district}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='compensation_paid_cn'
                label='च.नं.'
                required={true}
                control={control}
                error={errors.compensation_paid_cn}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <ReuseDateField
                name='compensation_paid_date'
                label='क्षतिपुर्ती तिरेको मिति'
                placeholder='YYYY-MM-DD'
                required={true}
                control={control}
                error={errors.compensation_paid_date}
              />
            </Grid>
          </>
        )}

      </Grid>

      <Grid container spacing={2}>
        <Grid xs={12}>
          बिगो रकम तोकिएको छ वा छैं‍न
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <ReuseSelect
            name='is_bigo'
            label='छ/छैन'
            options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
            required={true}
            control={control}
            error={errors.is_bigo}
          />
        </Grid>

        {selectedIs_bigo == 1 && (
          <>
            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='bigo_amt'
                label='रकम'
                required={true}
                control={control}
                error={errors.compensation_amt}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseSelect
                name='is_bigo_paid'
                label='तिरेको छ/छैन'
                options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                required={true}
                control={control}
                error={errors.is_bigo_paid}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseOffice
                name='bigo_paid_office'
                label='बिगो तिरेको कार्यालय'
                required={true}
                control={control}
                error={errors.bigo_paid_office}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <ReuseDistrict
                name='bigo_paid_office_district'
                label='बिगो तिरेको जिल्ला'
                required={true}
                control={control}
                error={errors.bigo_paid_office_district}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <ReuseInput
                name='bigo_paid_cn'
                label='च.नं.'
                required={true}
                control={control}
                error={errors.bigo_paid_cn}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <ReuseDateField
                name='bigo_paid_date'
                label='बिगो तिरेको मिति'
                placeholder='YYYY-MM-DD'
                required={true}
                control={control}
                error={errors.bigo_paid_date}
              />
            </Grid>
          </>
        )}

      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Grid>
      </Grid>
    </form >
  );
};

export default BandiPersonForm;
