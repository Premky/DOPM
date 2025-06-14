import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { Grid } from '@mui/material';
import NepaliDate from 'nepali-datetime';

import { calculateAge } from '../../../Utils/ageCalculator';
import { calculateDateDetails } from '../../../Utils/dateCalculator';
import ReuseInput from '../ReuseableComponents/ReuseInput';
import ReuseSelect from '../ReuseableComponents/ReuseSelect';
import ReuseCountry from '../ReuseableComponents/ReuseCountry';
import ReuseDistrict from '../ReuseableComponents/ReuseDistrict';
import ReuseMunicipality from '../ReuseableComponents/ReuseMunicipality';
import ReuseState from '../ReuseableComponents/ReuseState';
import ReuseMudda from '../ReuseableComponents/ReuseMudda';
import ReuseOffice from '../ReuseableComponents/ReuseOffice';
import ReuseDateField from '../ReuseableComponents/ReuseDateField';
import ReuseIdCards from '../ReuseableComponents/ReuseIdCards';


const BandiPersonForm = () => {
  const BASE_URL = useBaseURL();

  const {
    handleSubmit, watch, setValue, register, control, formState: { errors },
  } = useForm({
    defaultValues: {
      office_bandi_id: '',
      // other fields...
    },
  });
  const npToday = new NepaliDate();
  const formattedDateNp = npToday.format('YYYY-MM-DD');

  const [muddaCount, setMuddaCount] = useState(1);
  const [age, setAge] = useState();
  const [editing, setEditing] = useState(false);


  const selectedNationality = watch('nationality');
  const selectedState = watch('state_id');
  const selectedDistrict = watch('district_id');
  const selectedbandi_type = watch('bandi_type');
  const selectedIs_amount_fixed = watch("is_fine_fixed");
  const selectedIs_compensation = watch("is_compensation");
  const selectedIs_bigo = watch("is_bigo");
  const bsdob = watch("dob");

  const testVariable = watch('office_bandi_id');
  // console.log('office_bandi_id', testVariable)

  const isSwadeshi = selectedNationality === 'स्वदेशी';



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

  useEffect(() => {
    const getAge = async () => {
      if (bsdob) {
        const a = await calculateAge(bsdob);
        setValue('age', a || '');
      }
    };
    getAge();
  }, [bsdob]);

  const hirasat_date_bs = watch('hirasat_date_bs');
  const release_date_bs = watch('release_date_bs');

  useEffect(() => {
    const calculateKaidDuration = () => {
      console.log('hirasat:', hirasat_date_bs, 'release:', release_date_bs)
      if (hirasat_date_bs && release_date_bs) {
        const arrestAd = new NepaliDate(hirasat_date_bs).getDateObject();
        const releaseAd = new NepaliDate(release_date_bs).getDateObject();
        const todayAd = new NepaliDate(formattedDateNp).getDateObject();

        const kaidDuration = calculateDateDetails(arrestAd, releaseAd);
        const bhuktanDuration = calculateDateDetails(arrestAd, todayAd, kaidDuration);
        const berujuDuration = calculateDateDetails(todayAd, releaseAd, kaidDuration);

        setValue('kaid_duration', `${kaidDuration.years}|${kaidDuration.months}|${kaidDuration.days}` || '');
        setValue('bhuktan_duration', `${bhuktanDuration.years}|${bhuktanDuration.months}|${bhuktanDuration.days}` || '');
        setValue('beruju_duration', `${berujuDuration.years}|${berujuDuration.months}|${berujuDuration.days}` || '');
      }
    };

    if (hirasat_date_bs?.length === 10 && release_date_bs?.length === 10) {
      calculateKaidDuration();
    }

  }, [hirasat_date_bs, release_date_bs, formattedDateNp]);

  const onSubmit = async (data) => {
    // console.log(data);
    try {
      const url = editing ? `${BASE_URL}/bandi/update_bandi/${currentData.id}` :
        `${BASE_URL}/bandi/create_bandi`;
      const method = editing ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url,
        data,
        // headers: {Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data",},
        withCredentials: true
      });
      const { Status, Result, Error } = response.data;
      if (Status) {
        alert('Data submitted successfully!');

        reset(); // Reset the form after successful submission
        setEditing(false); // Reset editing state
        fetchAccidentRecords(); // Fetch updated records
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form.');
    }
  };

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
        <Grid container item xs={12} sm={6} md={3}>
          <Grid item xs={10} sm={9} md={8}>
            <ReuseDateField
              name="dob"
              label="जन्म मिति (वि.सं.)"
              readonly={true}
              required={true}
              control={control}
              error={errors.dob}
            />
          </Grid>
          <Grid item xs={2} sm={3} md={4}>
            <ReuseInput
              name="age"
              label="उमेर"
              required={true}
              control={control}
              error={errors.age}
              type="number"
            />
          </Grid>
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
          <ReuseSelect
            name="bandi_education"
            label="बन्दीको शैक्षिक योग्यता"
            options={[
              { label: 'सामान्य पढ्न लेख्न जान्ने', value: 'सामान्य पढ्न लेख्न जान्ने' },
              { label: 'आठ सम्म', value: 'आठ सम्म' },
              { label: 'एस.एल.सी/एस.ई.ई', value: 'एस.एल.सी/एस.ई.ई' },
              { label: '+२ वा सो सरह', value: '+२ वा सो सरह' },
              { label: 'स्नातक', value: 'स्नातक' },
              { label: 'स्नातकोत्तर', value: 'स्नातकोत्तर' },
            ]}
            required={true}
            control={control}
            error={errors.bandi_education}
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
      </Grid>

      <Grid item container spacing={2}>
        <Grid item xs={12}>
          पक्राउ/हिरासत/थुना/कैद/छुट्ने विवरणः
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseDateField
            name='hirasat_date_bs'
            label='हिरासत परेको मिति'
            placeholder={'YYYY-MM-DD'}
            // defaultValue={selectedBandi.hirasat_date_bs}
            required={true}
            control={control}
            error={errors.hirasat_date_bs}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseDateField
            name="thuna_date_bs"
            label="थुना/कारागार मिती"
            placeholder='YYYY-DD-MM'
            required={true}
            control={control}
            error={errors.thuna_date_bs}
          />
        </Grid>
        {selectedbandi_type === 'कैदी' && (<>
          <Grid item xs={12} sm={6} md={3}>
            <ReuseDateField
              name="release_date_bs"
              label="छुट्ने मिती"
              placeholder='YYYY-DD-MM'
              required={true}
              control={control}
              error={errors.release_date_bs}

            />
          </Grid>
          <Grid item container xs={12} sm={6} md={3}>
            <Grid item xs={4}>
              <ReuseInput
                name="kaid_duration"
                label="केद अवधी"
                required={false}
                control={control}
                error={errors.kaid_duration}
              />
            </Grid>

            <Grid item xs={4}>
              <ReuseInput
                name="bhuktan_duration"
                label="भुक्तान अवधी"
                required={true}
                control={control}
                error={errors.bhuktan_duration}
              />
            </Grid>
            <Grid item xs={4}>
              <ReuseInput
                name="beruju_duration"
                label="बेरुजु अवधी"
                required={true}
                control={control}
                error={errors.beruju_duration}
              />
            </Grid>
          </Grid>
        </>)}
      </Grid>

      <Grid item container spacing={2}>
        <Grid item xs={12}>
          कैदीबन्दीको परिचयपत्रको विवरणः
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <ReuseIdCards
            name="id_card_type"
            label="कार्डको प्रकार"
            defaultvalue={1}
            required={true}
            control={control}
            error={errors.id_card_type}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <ReuseInput
            name="card_no"
            label="परिचय पत्र नं."
            required={true}
            control={control}
            error={errors.card_no}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseDistrict
            name="card_issue_district_id"
            label="जारी जिल्ला"
            required={true}
            control={control}
            error={errors.card_issue_district_id}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <ReuseDateField
            name="card_issue_date"
            label="परिचय पत्र जारी मिती"
            placeholder='YYYY-DD-MM'
            required={true}
            control={control}
            error={errors.card_issue_date}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={2}>
          कैदीबन्दीको ठेगानाः
        </Grid>
        <Grid item xs={10}>
          <Grid item xs={12} sm={6} md={2}>
            <select name='nationality' {...register('nationality')}>
              <option value='स्वदेशी'>स्वदेशी</option>
              <option value='बिदेशी'>बिदेशी</option>
            </select>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <ReuseCountry
            name="nationality_id"
            label="राष्ट्रियता"
            defaultvalue={1}
            readonly={isSwadeshi}
            required={true}
            control={control}
            error={errors.nationality_id}
          />
        </Grid>
        {isSwadeshi === true ? (
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
          <Grid container item spacing={2} key={index} sx={{ mt: 2 }}>
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
                  name={`mudda_phesala_date_${index + 1}`}
                  label='मुद्दा फैसला मिति'
                  placeholder={'YYYY-MM-DD'}
                  required={true}
                  control={control}
                  error={errors[`mudda_phesala_date_${index + 1}`]}
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

      {selectedbandi_type == 'कैदी' && (<>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            जरिवाना रकम तोकिएको छ वा छैं‍न
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ReuseSelect
              name='is_fine_fixed'
              label='छ/छैन'
              options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
              required={true}
              control={control}
              error={errors.is_fine_fixed}
            />
          </Grid>
          {selectedIs_amount_fixed === 1 && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='fine_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.fine_amt}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseSelect
                  name='is_fine_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_fine_paid}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseOffice
                  name='fine_paid_office'
                  label='जरिवाना तिरेको कार्यालय'
                  required={true}
                  control={control}
                  error={errors.fine_paid_office}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseDistrict
                  name='fine_paid_office_district'
                  label='जरिवाना तिरेको जिल्ला'
                  required={true}
                  control={control}
                  error={errors.fine_paid_office_district}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='fine_paid_cn'
                  label='च.नं.'
                  required={true}
                  control={control}
                  error={errors.fine_paid_cn}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12}>
            क्षतिपुर्ती रकम तोकिएको छ वा छैं‍न
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='compensation_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.compensation_amt}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseSelect
                  name='is_compensation_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_compensation_paid}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseOffice
                  name='compensation_paid_office'
                  label='क्षतिपुर्ती तिरेको कार्यालय'
                  required={true}
                  control={control}
                  error={errors.compensation_paid_office}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseDistrict
                  name='compensation_paid_office_district'
                  label='क्षतिपुर्ती तिरेको जिल्ला'
                  required={true}
                  control={control}
                  error={errors.compensation_paid_office_district}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='compensation_paid_cn'
                  label='च.नं.'
                  required={true}
                  control={control}
                  error={errors.compensation_paid_cn}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12}>
            बिगो रकम तोकिएको छ वा छैं‍न
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='bigo_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.compensation_amt}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseSelect
                  name='is_bigo_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_bigo_paid}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseOffice
                  name='bigo_paid_office'
                  label='बिगो तिरेको कार्यालय'
                  required={true}
                  control={control}
                  error={errors.bigo_paid_office}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ReuseDistrict
                  name='bigo_paid_office_district'
                  label='बिगो तिरेको जिल्ला'
                  required={true}
                  control={control}
                  error={errors.bigo_paid_office_district}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <ReuseInput
                  name='bigo_paid_cn'
                  label='च.नं.'
                  required={true}
                  control={control}
                  error={errors.bigo_paid_cn}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
            पुनरावेदनमा नपरेको प्रमाणः
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ReuseOffice
              name='punarabedan_office_id'
              label='पुनरावेदनमा नपरेको कार्यालय'
              required={true}
              control={control}
              error={errors.punarabedan_office_id}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReuseDistrict
              name='punarabedan_office_district'
              label='पुनरावेदनमा नपरेको कार्यालयको जिल्ला'
              required={true}
              control={control}
              error={errors.punarabedan_office_district}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReuseInput
              name='punarabedan_office_ch_no'
              label='पुनरावेदनमा नपरेको प्रमाणको च.नं.'
              required={true}
              control={control}
              error={errors.punarabedan_office_ch_no}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ReuseDateField
              name='punarabedan_office_date'
              label='पुनरावेदनमा नपरेको प्रमाणको पत्र मिति'
              required={true}
              control={control}
              error={errors.punarabedan_office_date}
            />
          </Grid>
        </Grid>
      </>)
      }
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ReuseInput
            name='bandi_remarks'
            label='कैफियत'
            required={false}
            control={control}
            error={errors.bandi_remarks}
          />
        </Grid>
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
