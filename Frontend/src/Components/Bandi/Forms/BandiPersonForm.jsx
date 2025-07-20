import React, { useEffect, useState, useTransition } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { set, useForm } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { Grid } from '@mui/material';
import NepaliDate from 'nepali-datetime';

import { calculateAge } from '../../../../Utils/ageCalculator';
import { calculateBSDate, calculateDateDetails, sumDates } from '../../../../Utils/dateCalculator';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseCountry from '../../ReuseableComponents/ReuseCountry';
import ReuseDistrict from '../../ReuseableComponents/ReuseDistrict';
import ReuseMunicipality from '../../ReuseableComponents/ReuseMunicipality';
import ReuseState from '../../ReuseableComponents/ReuseState';
import ReuseMudda from '../../ReuseableComponents/ReuseMudda';
import ReuseOffice from '../../ReuseableComponents/ReuseOffice';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import ReuseIdCards from '../../ReuseableComponents/ReuseIdCards';
import ReuseRelativeRelations from '../../ReuseableComponents/ReuseRelativeRelations';
import ReuseDatePickerBs from '../../ReuseableComponents/ReuseDatePickerBS';
import ReusePunarabedanOffice from '../../ReuseableComponents/ReusePunarabedanOffice';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import ReusePhotoInput from '../../ReuseableComponents/ReusePhotoInput';
import ReuseDatePickerBS from '../../ReuseableComponents/ReuseDatePickerBS';
import fetchFineTypes from '../../ReuseableComponents/fetchFineTypes';
import fetchDiseases from '../../ReuseableComponents/fetchDiseases';
import fetchDisabilities from '../../ReuseableComponents/fetchDisabilities';
import AddSubMuddaModal from '../Dialogs/AddSubMuddaModal';
import { useAuth } from '../../../Context/AuthContext';

const BandiPersonForm = () => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const {
    handleSubmit, watch, setValue, register, reset, control, formState: { errors },
  } = useForm( {
    mode: 'onBlur',
    defaultValues: {
      office_bandi_id: '',
      // other fields...
    },
  } );
  const npToday = new NepaliDate();
  const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
  const navigate = useNavigate();

  const [muddaCount, setMuddaCount] = useState( 1 );
  const [familyCount, setFamilyCount] = useState( 1 );
  const [contactCount, setContactCount] = useState( 1 );
  const [fineCount, setFineCount] = useState( 1 );
  const [diseaseCount, setDiseaseCount] = useState( 1 );
  const [disabilityCount, setDisabilityCount] = useState( 1 );

  const [age, setAge] = useState();
  const [editing, setEditing] = useState( false );


  const selectedNationality = watch( 'nationality' );
  const selectedState = watch( 'state_id' );
  const selectedDistrict = watch( 'district_id' );
  const selectedbandi_type = watch( 'bandi_type' );
  const selectedIs_amount_fixed = watch( "is_fine_fixed" );
  const selectedIs_compensation = watch( "is_compensation" );
  const selectedIs_bigo = watch( "is_bigo" );
  const bsdob = watch( "dob" );
  const bandiRelation = watch( 'bandi_relative_relation' );
  const idcardtype = watch( 'id_card_type' );
  const is_fine_paid = watch( 'is_fine_paid' );
  const is_bigo_paid = watch( 'is_bigo_paid' );
  const is_compensation_paid = watch( 'is_compensation_paid' );
  const is_life_time = watch( 'is_life_time' );

  const testVariable = watch( 'office_bandi_id' );

  // console.log('office_bandi_id', testVariable)

  const isSwadeshi = selectedNationality === 'स्वदेशी';
  const is_active = watch( 'is_active' );
  const is_ill = watch( 'is_ill' );
  const is_disabled = watch( 'is_disabled' );

  useEffect( () => {
    // console.log( is_active );
  }, [is_active] );


  const genderOptions = [
    { label: 'पुरुष', value: 'male' },
    { label: 'महिला', value: 'female' },
    { label: 'अन्य', value: 'other' }
  ];

  const [modalOpen, setModalOpen] = useState( false );

  const handleAdd = () => {
    setModalOpen( true );
  };

  useEffect( () => {
    const fetchRandomBandiId = async () => {
      try {
        const response = await axios.get( `${ BASE_URL }/bandi/get_random_bandi_id` );
        const { Status, Result } = response.data;
        if ( Status ) {
          setValue( 'office_bandi_id', Result || '' );
        }
      } catch ( err ) {
        console.error( 'Error fetching Bandi ID:', err );
      }
    };
    fetchRandomBandiId();
  }, [BASE_URL, setValue] );

  useEffect( () => {
    const getAge = async () => {
      if ( bsdob ) {
        const a = await calculateAge( bsdob );
        setValue( 'age', a || '' );
      }
    };
    getAge();
  }, [bsdob] );

  const hirasat_date_bs = watch( 'hirasat_date_bs' );
  const release_date_bs = watch( 'release_date_bs' );
  const hirasat_years = watch( 'hirasat_years' );
  const hirasat_months = watch( 'hirasat_months' );
  const hirasat_days = watch( 'hirasat_days' );

  useEffect( () => {
    const calculateKaidDuration = () => {
      if ( hirasat_date_bs && release_date_bs ) {
        const kaidDuration = calculateBSDate( hirasat_date_bs, release_date_bs );
        const bhuktanDuration = calculateBSDate( hirasat_date_bs, formattedDateNp, kaidDuration );
        const berujuDuration = calculateBSDate( formattedDateNp, release_date_bs, kaidDuration );

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
    formattedDateNp,
    hirasat_years,
    hirasat_months,
    hirasat_days,
    setValue,
  ] );


  const onSubmit = async ( data ) => {
    // console.log( data );
    try {
      const url = editing
        ? `${ BASE_URL }/bandi/update_bandi/${ currentData.id }`
        : `${ BASE_URL }/bandi/create_bandi`;

      const method = editing ? 'PUT' : 'POST';

      //use formdata compulsary to upload images 
      const formData = new FormData();

      //Append all fields except arrays/objects
      for ( const key in data ) {
        if ( key === 'photo' && data[key]?.[0] ) {
          //Handle Photo file (from file input)
          formData.append( 'photo', data[key][0] ); //if using MUI FileInput, it's usually array
        } else if ( Array.isArray( data[key] ) ) {
          //Handle family array or others
          formData.append( key, JSON.stringify( data[key] ) );
        } else {
          formData.append( key, data[key] );
        }
      }

      const response = await axios( {
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data', },
        withCredentials: true,
      } );

      const { Status, Result, Error } = response.data;

      if ( Status ) {
        Swal.fire( 'थपियो!', 'रिकर्ड सफलतापूर्वक थपियो', 'success' );
        // console.log( response );
        const bandi_id = Result;
        // console.log( bandi_id );
        navigate( `/bandi/view_saved_record/${ bandi_id }` ); // <-- fixed here
        reset();
        setEditing( false );

      } else {
        Swal.fire( 'त्रुटि!', Error || 'रिकर्ड थप्न सकिएन', 'error' );
      }
    } catch ( error ) {
      console.error( 'Error submitting form:', error );
      const errMsg = error.message ? error.message : 'डेटा बुझाउँदा समस्या आयो।';
      Swal.fire( 'त्रुटि!', errMsg, 'error' );
      // Swal.fire( 'त्रुटि!', 'डेटा बुझाउँदा समस्या आयो।', 'error' );
    }
  };

  const { optrecords: fineTypesOpt, loading: fineTypesLoading } = fetchFineTypes();
  const { optrecords: diseasesOpt, loading: diseasesLoading } = fetchDiseases();
  const { optrecords: disabilitiesOpt, loading: disablilitiesLoading } = fetchDisabilities();

  const formHeadStyle = { color: 'blue', fontWeight: 'bold' };

  return (
    <form onSubmit={handleSubmit( onSubmit )}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }} sx={formHeadStyle}>
          बन्दीको विवरणः
        </Grid>
        <Grid container size={{ xs: 9, sm: 8, md: 10 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name='office_bandi_id'
              label="बन्दीको आई.डि."
              // defaultValue={band_rand_id}
              required={true}
              control={control}
              error={errors.office_bandi_id} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name='lagat_no'
              label="लगत नं."
              // defaultValue={band_rand_id}
              required={false}
              control={control}
              error={errors.lagat_no} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseSelect
              name="bandi_type"
              label="बन्दीको प्रकार"
              required={true}
              control={control}
              options={[{ label: 'कैदी', value: 'कैदी' },
              { label: 'थुनुवा', value: 'थुनुवा' },
              ]}
              error={errors.bandi_type}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name="bandi_name"
              label="बन्दीको नाम"
              required={true}
              control={control}
              error={errors.bandi_name}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseSelect
              name="gender"
              label="लिङ्ग"
              required={true}
              control={control}
              error={errors.gender}
              options={genderOptions}
            />
          </Grid>
          <Grid container size={{ xs: 12, sm: 6, md: 3 }}>
            <Grid size={{ xs: 10, sm: 9, md: 8 }}>
              {/* <ReuseDateField */}
              <ReuseDatePickerBS
                name="dob"
                label="जन्म मिति (वि.सं.)"
                readonly={true}
                required={true}
                control={control}
                error={errors.dob}
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 3, md: 4 }}>
              <ReuseInput
                name="age"
                label="उमेर"
                required={false}
                control={control}
                error={errors.age}
                type="number"
              />
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseSelect
              name="married_status"
              label="वैवाहिक अवस्था"
              required={true}
              control={control}
              error={errors.married_status}
              options={[
                { label: 'विवाहित', value: 'Married' },
                { label: 'अविवाहित', value: 'Unmarried' },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseSelect
              name="bandi_education"
              label="बन्दीको शैक्षिक योग्यता"
              options={[
                { label: 'थाहा नभएको', value: 'थाहा नभएको' },
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

          {/* <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseInput
              hidden
              name="bandi_height"
              label="बन्दीको उचाई"
              required={false}
              control={control}
              error={errors.bandi_height}
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseInput
              hidden
              name="bandi_weight"
              label="बन्दीको तौल"
              required={false}
              control={control}
              error={errors.bandi_weight}
            />
          </Grid> */}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name="bandi_huliya"
              label="बन्दीको हुलिया"
              required={true}
              control={control}
              error={errors.bandi_huliya}
            />
          </Grid>
        </Grid>

        <Grid size={{ xs: 3, sm: 4, md: 2 }}>

          <ReusePhotoInput
            name="photo"
            label="फोटो"
            required={true}
            control={control}
            error={errors.photo}
          />
        </Grid>
      </Grid>
      <hr />

      <Grid container spacing={0}>
        <Grid size={{ xs: 12 }} sx={{ mb: 0, ...formHeadStyle }}>
          बन्दीको मुद्दा विवरणः
          {( authState.office_id === 1 ) || ( authState.office_id === 2 ) && (
            <button onClick={() => handleAdd()}>Add</button>
          )}
          <AddSubMuddaModal
            open={modalOpen}
            onClose={() => setModalOpen( false )}
            BASE_URL={BASE_URL}
          // editingData={editingData}
          />
        </Grid>

        {[...Array( muddaCount )].map( ( _, index ) => {          
          const muddaCondition = watch( `mudda_condition_${ index + 1 }` );

          return (
            <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReuseMudda
                  name={`mudda_id_${ index + 1 }`}
                  label="मुद्दा"
                  required={true}
                  control={control}
                  error={errors[`mudda_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReuseInput
                  name={`mudda_no_${ index + 1 }`}
                  label="मुद्दा नं."
                  required={true}
                  control={control}
                  error={errors[`mudda_no_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReuseInput
                  name={`vadi_${ index + 1 }`}
                  label="वादी वा जाहेरवालाको नाम"
                  required={true}
                  control={control}
                  error={errors[`vadi_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReuseOffice
                  name={`mudda_office_${ index + 1 }`}
                  label="मुद्दा रहेको निकाय"
                  required={true}
                  control={control}
                  error={errors[`mudda_office_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ReuseSelect
                  name={`mudda_condition_${ index + 1 }`}
                  label="मुद्दाको अवस्था?"
                  required={true}
                  control={control}
                  options={[
                    { label: 'चालु', value: 1 },
                    { label: 'अन्तिम भएको', value: 0 },
                  ]}                  
                  error={errors[`mudda_condition_${ index + 1 }`]}
                />
              </Grid>

              {/* ✅ Conditionally show 'मुद्दा फैसला मिति' */}
              {selectedbandi_type === 'कैदी' && muddaCondition === 0 && (                
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <ReuseDateField
                      name={`mudda_phesala_date_${ index + 1 }`}
                      label="मुद्दा फैसला मिति"
                      placeholder="YYYY-MM-DD"
                      required={true}
                      control={control}
                      error={errors[`mudda_phesala_date_${ index + 1 }`]}
                    />
                  </Grid>                
              )}

              <Grid size={{ xs: 11, sm: 5, md: 2 }}>
                <ReuseSelect
                  name={`is_main_mudda_${ index + 1 }`}
                  label="मुख्य मुददा हो/होइन?"
                  required={true}
                  control={control}
                  options={[
                    { label: 'होइन', value: 0 },
                    { label: 'हो', value: 1 },
                  ]}
                  error={errors[`is_main_mudda_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 11, sm: 5, md: 2 }}>
                <ReuseSelect
                  name={`is_last_mudda_${ index + 1 }`}
                  label="अन्तिम मुददा हो/होइन?"
                  required={true}
                  control={control}
                  options={[
                    { label: 'होइन', value: 0 },
                    { label: 'हो', value: 1 },
                  ]}
                  error={errors[`is_last_mudda_${ index + 1 }`]}
                />
              </Grid>

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  type="button"
                  onClick={() => setMuddaCount( muddaCount + 1 )}
                >
                  +
                </Button>
              </Grid>

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 3 }}>
                {muddaCount > 1 && (
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    type="button"
                    onClick={() => setMuddaCount( muddaCount - 1 )}
                  >
                    <RemoveIcon />
                  </Button>
                )}
              </Grid>
            </Grid>
          );
        } )}
      </Grid>

      <hr />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }} sx={formHeadStyle}>
          पक्राउ/हिरासत/थुना/कैद/छुट्ने विवरणः
        </Grid>

        <Grid container size={{ xs: 12, sm: 6, md: 3 }}>
          <Grid size={{ xs: 12 }}>हिरासत/थुनामा बसेको अवधी</Grid>
          <Grid size={{ xs: 4 }}>
            <ReuseInput
              name="hirasat_years"
              label="वर्ष"
              placeholder='वर्ष'
              type='number'
              // defaultValue={0}
              required={true}
              control={control}
              error={errors.hirasat_years}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <ReuseInput
              name="hirasat_months"
              label="महिना "
              placeholder='महिना'
              type='number'
              // defaultValue={0}
              required={true}
              control={control}
              error={errors.hirasat_months}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <ReuseInput
              name="hirasat_days"
              label="दिन"
              placeholder='दिन'
              // defaultValue={0}
              type='number'
              required={true}
              control={control}
              error={errors.hirasat_days}
            />
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <ReuseDatePickerBs
            name='hirasat_date_bs'
            label='थुना/कैद परेको मिती'
            placeholder={'YYYY-MM-DD'}
            // defaultValue={selectedBandi.hirasat_date_bs}
            required={true}
            control={control}
            error={errors.hirasat_date_bs}
          />

        </Grid>

        {selectedbandi_type === 'कैदी' && ( <>

          <Grid size={{ xs: 2 }}>
            <ReuseSelect
              name="is_life_time"
              label="आजिवन कैद हो/होइन?"
              required={false}
              options={[
                { value: '1', label: 'हो' },
                { value: '0', label: 'होइन' }
              ]}
              control={control}
              error={errors.is_life_time}
            />
          </Grid>
          {is_life_time == 0 && ( <>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseDateField
                name="release_date_bs"
                label="छुट्ने मिती"
                placeholder='YYYY-MM-DD'
                required={true}
                control={control}
                error={errors.release_date_bs}
              />
            </Grid>


            <Grid container size={{xs:12}} >
              <Grid size={{ xs: 2 }}>
                <ReuseInput
                  name="total_kaid_duration"
                  label="जम्मा कैद अवधी"
                  required={false}
                  control={control}
                  error={errors.total_kaid_duration}
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <ReuseInput
                  name="bhuktan_duration"
                  label="भुक्तान अवधी"
                  required={true}
                  control={control}
                  error={errors.bhuktan_duration}
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <ReuseInput
                  name="total_bhuktan_duration"
                  label="जम्मा भुक्तान अवधी"
                  required={true}
                  control={control}
                  error={errors.total_bhuktan_duration}
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <ReuseInput
                  name="beruju_duration"
                  label="बाँकी अवधी"
                  required={true}
                  control={control}
                  error={errors.beruju_duration}
                />
              </Grid>
            </Grid>
          </>
          )}
        </> )}
      </Grid>
      <hr />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }} sx={formHeadStyle}>
          बन्दीको परिचयपत्रको विवरणः
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <ReuseIdCards
            name="id_card_type"
            label="कार्डको प्रकार"
            defaultvalue={1}
            required={true}
            control={control}
            error={errors.id_card_type}
          />
        </Grid>
        {idcardtype === 6 && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseInput
                name="card_name"
                label="कार्डको विवरण"
                required={false}
                control={control}
                error={errors.card_name}
              />
            </Grid>
          </>
        )}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <ReuseInput
            name="card_no"
            label="परिचय पत्र नं."
            required={false}
            control={control}
            error={errors.card_no}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ReuseDistrict
            name="card_issue_district_id"
            label="जारी जिल्ला"
            required={false}
            control={control}
            error={errors.card_issue_district_id}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ReuseDateField
            name="card_issue_date"
            label="परिचय पत्र जारी मिती"
            placeholder='YYYY-MM-DD'
            // required={idcardtype !== 6 || idcardtype==''}
            required={false}
            control={control}
            error={errors.card_issue_date}
          />
        </Grid>
      </Grid>
      <hr />
      <Grid container spacing={2}>
        <Grid size={{xs:2}} sx={formHeadStyle}>
          बन्दीको ठेगानाः
        </Grid>
        <Grid size={{xs:10}}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <select name='nationality' {...register( 'nationality' )}>
              <option value='स्वदेशी'>स्वदेशी</option>
              <option value='विदेशी'>विदेशी</option>
            </select>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseState
                name="state_id"
                label="प्रदेश"
                required={true}
                control={control}
                error={errors.state_id}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseDistrict
                name="district_id"
                label="जिल्ला"
                required={true}
                control={control}
                error={errors.district_id}
                selectedState={selectedState}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ReuseMunicipality
                name="municipality_id"
                label="गा.पा./न.पा./उ.न.पा./म.न.पा."
                required={true}
                control={control}
                error={errors.municipality_id}
                selectedDistrict={selectedDistrict}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
          <Grid size={{ xs: 12, sm:6, md:10 }}>
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
      <hr />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }} sx={formHeadStyle}>
          पारिवारीक/आश्रित विवरणः
        </Grid>
        {[...Array( familyCount )].map( ( _, index ) => {
          const currentRelation = watch( `family[${ index }].bandi_relative_relation` );
          const isDependent = watch( `family[${ index }].is_dependent` );
          // console.log( isDependent );
          return (
            <Grid container size={{xs:12}} key={index}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseRelativeRelations
                  name={`family[${ index }].bandi_relative_relation`}
                  label="बन्दीसंगको नाता"
                  required={false}
                  control={control}
                  error={errors?.family?.[index]?.bandi_relative_relation}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseInput
                  name={`family[${ index }].bandi_relative_name`}
                  label="नामथर"
                  control={control}
                  error={errors?.family?.[index]?.bandi_relative_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseInput
                  name={`family[${ index }].bandi_relative_address`}
                  label="ठेगाना"
                  control={control}
                  error={errors?.family?.[index]?.bandi_relative_address}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseSelect
                  name={`family[${ index }].is_dependent`}
                  label="आश्रीत हो/होइन?"
                  options={[
                    { value: 1, label: 'हो' },
                    { value: 0, label: 'होइन' }
                  ]}
                  control={control}
                  error={errors?.family?.[index]?.is_dependent}
                />
              </Grid>

              {isDependent === 1 && (
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseDatePickerBs
                    name={`family[${ index }].bandi_relative_dob`}
                    label="जन्म मिति"
                    type="number"
                    control={control}
                    error={errors?.family?.[index]?.bandi_relative_dob}
                  />
                </Grid>
              )}

              {isDependent === 0 && (
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseInput
                    name={`family[${ index }].bandi_relative_contact_no`}
                    label="सम्पर्क नं."
                    onlyDigits={true}
                    minLength={10}
                    maxLength={10}
                    control={control}
                    error={errors?.family?.[index]?.bandi_relative_contact_no}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  type="button"
                  onClick={() => setFamilyCount( familyCount + 1 )}
                >
                  +
                </Button>
              </Grid>

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                {familyCount > 1 && (
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    type="button"
                    onClick={() => setFamilyCount( familyCount - 1 )}
                  >
                    <RemoveIcon />
                  </Button>
                )}
              </Grid>
            </Grid>
          );
        } )}

      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }} sx={formHeadStyle}>
          सम्पर्क व्यक्ति
        </Grid>
        {[...Array( contactCount )].map( ( _, index ) => {
          // const currentRelation = watch( `contact[${ index }].bandi_relative_relation` );

          return (
            <Grid container size={{xs:12}} key={index}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseRelativeRelations
                  name={`conatact_person[${ index }].relation_id`}
                  label="बन्दीसंगको नाता"
                  required={true}
                  control={control}
                  error={errors?.conatact_person?.[index]?.relation_id}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseInput
                  name={`conatact_person[${ index }].contact_name`}
                  label="नामथर"
                  required={true}
                  control={control}
                  error={errors?.conatact_person?.[index]?.contact_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseInput
                  name={`conatact_person[${ index }].contact_address`}
                  label="ठेगाना"
                  required={true}
                  control={control}
                  error={errors?.conatact_person?.[index]?.contact_address}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <ReuseInput
                  name={`conatact_person[${ index }].contact_contact_details`}
                  label="सम्पर्क नं."
                  onlyDigits={true}
                  minLength={10}
                  maxLength={10}
                  required={true}
                  control={control}
                  error={errors?.conatact_person?.[index]?.contact_contact_details}
                />
              </Grid>

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  type="button"
                  onClick={() => setContactCount( contactCount + 1 )}
                >
                  +
                </Button>
              </Grid>

              <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                {contactCount > 1 && (
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    type="button"
                    onClick={() => setContactCount( contactCount - 1 )}
                  >
                    <RemoveIcon />
                  </Button>
                )}
              </Grid>
            </Grid>
          );
        } )}

      </Grid>

      {selectedbandi_type == 'कैदी' && ( <>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }} sx={formHeadStyle}>
            जरिवाना/क्षतिपुर्ती/विगो रकम तोकिएको छ वा छैं‍न
          </Grid>

          {[...Array( fineCount )].map( ( _, index ) => {
            // const currentRelation = watch( `contact[${ index }].bandi_relative_relation` );
            const selectedIs_amount_fixed = watch( `fine[${ index }].is_fine_fixed` );
            const is_fine_paid = watch( `fine[${ index }].is_fine_paid` );
            const is_jariwana = watch( `fine[${ index }].is_jariwana` );
            return (
              <Grid container size={{xs:12}} key={index}>
                <>

                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <ReuseSelect
                      name={`fine[${ index }].is_fine_fixed`}
                      label='छ/छैन'
                      options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                      defaultValue='0'
                      required={true}
                      control={control}
                      error={errors?.fine?.[index]?.is_fine_fixed}
                    />
                  </Grid>
                  {selectedIs_amount_fixed === 1 && (
                    <>
                      <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <ReuseSelect
                          name={`fine[${ index }].fine_type`}
                          label="प्रकार"
                          options={fineTypesOpt}
                          required={true}
                          control={control}
                          error={errors?.fine?.[index]?.fine_type}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ReuseInput
                          name={`fine[${ index }].fine_amt`}
                          label='रकम'
                          required={true}
                          control={control}
                          error={errors?.fine?.[index]?.fine_amt}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <ReuseSelect
                          name={`fine[${ index }].is_fine_paid`}
                          label='तिरेको छ/छैन'
                          options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                          required={true}
                          control={control}
                          error={errors?.fine?.[index]?.is_fine_paid}
                        />
                      </Grid>
                      {is_fine_paid === 1 && (
                        <>
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseOffice
                              name={`fine[${ index }].fine_paid_office`}
                              label="जरिवाना तिरेको निकाय"
                              required={true}
                              control={control}
                              error={errors?.fine?.[index]?.fine_paid_office}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDistrict
                              name={`fine[${ index }].fine_paid_office_district`}
                              label="जरिवाना तिरेको जिल्ला"
                              required={true}
                              control={control}
                              error={errors?.fine?.[index]?.fine_paid_office_district}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                              name={`fine[${ index }].fine_paid_cn`}
                              label="च.नं."
                              required={true}
                              control={control}
                              error={errors?.fine?.[index]?.fine_paid_cn}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                              name={`fine[${ index }].fine_paid_date`}
                              label="जरिवाना तिरेको मिति"
                              placeholder="YYYY-MM-DD"
                              required={true}
                              control={control}
                              error={errors?.fine?.[index]?.fine_paid_date}
                            />
                          </Grid>
                        </>
                      )}
                    </>
                  )}
                </>

                <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    type="button"
                    onClick={() => setFineCount( fineCount + 1 )}
                  >
                    +
                  </Button>
                </Grid>

                <Grid size={{ xs: 1, sm: 1, md: 1 }} sx={{ mt: 5 }}>
                  {fineCount > 1 && (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      type="button"
                      onClick={() => setFineCount( fineCount - 1 )}
                    >
                      <RemoveIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          } )}

          {/* <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseSelect
              name='is_fine_fixed'
              label='छ/छैन'
              options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
              defaultValue='0'
              required={true}
              control={control}
              error={errors.is_fine_fixed}
            />
          </Grid>
          {selectedIs_amount_fixed === 1 && (
            <>
              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseInput
                  name='fine_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.fine_amt}
                />
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseSelect
                  name='is_fine_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_fine_paid}
                />
              </Grid>
              {is_fine_paid === 1 && (
                <>
                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseOffice
                      name="fine_paid_office"
                      label="जरिवाना तिरेको निकाय"
                      required={true}
                      control={control}
                      error={errors.fine_paid_office}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseDistrict
                      name="fine_paid_office_district"
                      label="जरिवाना तिरेको जिल्ला"
                      required={true}
                      control={control}
                      error={errors.fine_paid_office_district}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseInput
                      name="fine_paid_cn"
                      label="च.नं."
                      required={true}
                      control={control}
                      error={errors.fine_paid_cn}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseDateField
                      name="fine_paid_date"
                      label="जरिवाना तिरेको मिति"
                      placeholder="YYYY-MM-DD"
                      required={true}
                      control={control}
                      error={errors.fine_paid_date}
                    />
                  </Grid>
                </>
              )}


            </>
          )} */}
        </Grid>

        {/* <Grid container spacing={2}>
          <Grid size={{xs:12}} sx={formHeadStyle}>
            क्षतिपुर्ती रकम तोकिएको छ वा छैं‍न
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseSelect
              name='is_compensation'
              label='छ/छैन'
              options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
              defaultValue='0'
              required={true}
              control={control}
              error={errors.is_compensation}
            />
          </Grid>

          {selectedIs_compensation == 1 && (
            <>
              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseInput
                  name='compensation_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.compensation_amt}
                />
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseSelect
                  name='is_compensation_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_compensation_paid}
                />
              </Grid>
              {is_compensation_paid === 1 && (
                <>
                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseOffice
                      name='compensation_paid_office'
                      label='क्षतिपुर्ती तिरेको निकाय'
                      required={true}
                      control={control}
                      error={errors.compensation_paid_office}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseDistrict
                      name='compensation_paid_office_district'
                      label='क्षतिपुर्ती तिरेको जिल्ला'
                      required={true}
                      control={control}
                      error={errors.compensation_paid_office_district}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseInput
                      name='compensation_paid_cn'
                      label='च.नं.'
                      required={true}
                      control={control}
                      error={errors.compensation_paid_cn}
                    />
                  </Grid>
                  <Grid size={{xs:12, sm:6, md:3}}>
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
            </>
          )}

        </Grid>

        <Grid container spacing={2}>
          <Grid size={{xs:12}} sx={formHeadStyle}>
            बिगो रकम तोकिएको छ वा छैं‍न
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseSelect
              name='is_bigo'
              label='छ/छैन'
              options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
              defaultValue='0'
              required={true}
              control={control}
              error={errors.is_bigo}
            />
          </Grid>

          {selectedIs_bigo == 1 && (
            <>
              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseInput
                  name='bigo_amt'
                  label='रकम'
                  required={true}
                  control={control}
                  error={errors.compensation_amt}
                />
              </Grid>

              <Grid size={{xs:12, sm:6, md:3}}>
                <ReuseSelect
                  name='is_bigo_paid'
                  label='तिरेको छ/छैन'
                  options={[{ label: 'छ', value: 1 }, { label: 'छैन', value: '0' }]}
                  required={true}
                  control={control}
                  error={errors.is_bigo_paid}
                />
              </Grid>
              {is_bigo_paid === 1 && (
                <>
                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseOffice
                      name='bigo_paid_office'
                      label='बिगो तिरेको निकाय'
                      required={true}
                      control={control}
                      error={errors.bigo_paid_office}
                    />
                  </Grid>

                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseDistrict
                      name='bigo_paid_office_district'
                      label='बिगो तिरेको जिल्ला'
                      required={true}
                      control={control}
                      error={errors.bigo_paid_office_district}
                    />
                  </Grid>
                  <Grid size={{xs:12, sm:6, md:3}}>
                    <ReuseInput
                      name='bigo_paid_cn'
                      label='च.नं.'
                      required={true}
                      control={control}
                      error={errors.bigo_paid_cn}
                    />
                  </Grid>
                  <Grid size={{xs:12, sm:6, md:3}}>
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
            </>
          )}
        </Grid> */}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }} sx={formHeadStyle}>
            पुनरावेदनमा नपरेको प्रमाणः
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReusePunarabedanOffice
              name='punarabedan_office_id'
              label='पुनरावेदनमा नपरेको कार्यालय'
              required={false}
              control={control}
              error={errors.punarabedan_office_id}
            />
          </Grid>

          {/* <Grid size={{xs:12, sm:6, md:3}}>
            <ReuseDistrict
              name='punarabedan_office_district'
              label='पुनरावेदनमा नपरेको कार्यालयको जिल्ला'
              required={false}
              control={control}
              error={errors.punarabedan_office_district}
            />
          </Grid> */}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name='punarabedan_office_ch_no'
              label='पुनरावेदनमा नपरेको प्रमाणको च.नं.'
              required={false}
              control={control}
              error={errors.punarabedan_office_ch_no}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ReuseInput
              name='punarabedan_office_date'
              label='पुनरावेदनमा नपरेको प्रमाणको पत्र मिति'
              required={false}
              control={control}
              error={errors.punarabedan_office_date}
            />
          </Grid>
        </Grid>
      </> )
      }

      <hr />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Grid size={{ xs: 12 }}>
            <Box sx={formHeadStyle}>बन्दीको स्वास्थ्य अवस्थाः</Box>
          </Grid>

          {[...Array( diseaseCount )].map( ( _, index ) => {
            const isIll = watch( `disease[${ index }].is_ill` );

            return (
              <Grid container spacing={2} key={`disease-${ index }`}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseSelect
                    name={`disease[${ index }].is_ill`}
                    label="बिरामी हो/होइन?"
                    required
                    control={control}
                    defaultValue={0}
                    options={[
                      { label: 'होइन', value: 0 },
                      { label: 'हो', value: 1 },
                    ]}
                    error={errors?.disease?.[index]?.is_ill}
                  />
                </Grid>

                {isIll === 1 && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <ReuseSelect
                        name={`disease[${ index }].disease_id`}
                        label="रोग"
                        required
                        options={diseasesOpt}
                        control={control}
                        error={errors?.disease?.[index]?.disease_id}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                      <ReuseInput
                        name={`disease[${ index }].disease_name`}
                        label="अन्य भए रोगको नाम"
                        control={control}
                        error={errors?.disease?.[index]?.disease_name}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDiseaseCount( diseaseCount + 1 )}
                  >
                    +
                  </Button>
                </Grid>

                <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                  {diseaseCount > 1 && (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => setDiseaseCount( diseaseCount - 1 )}
                    >
                      <RemoveIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          } )}
        </Grid>

        {/* Divider */}
        <Grid size={{ xs: 12 }}><hr />
          <Grid size={{ xs: 12 }}>
            <Box sx={formHeadStyle}>बन्दीको अपाङ्गताको अवस्थाः</Box>
          </Grid>
          {/* Disability Section */}
          {[...Array( disabilityCount )].map( ( _, index ) => {
            const isDisabled = watch( `disability[${ index }].is_disabled` );

            return (
              <Grid container spacing={2} key={`disability-${ index }`}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <ReuseSelect
                    name={`disability[${ index }].is_disabled`}
                    label="अपाङ्ग हो/होइन?"
                    required
                    control={control}
                    defaultValue={0}
                    options={[
                      { label: 'होइन', value: 0 },
                      { label: 'हो', value: 1 },
                    ]}
                    error={errors?.disability?.[index]?.is_disabled}
                  />
                </Grid>

                {isDisabled === 1 && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <ReuseSelect
                        name={`disability[${ index }].disability_id`}
                        label="अपाङ्गताको प्रकार"
                        required
                        options={disabilitiesOpt}
                        control={control}
                        error={errors?.disability?.[index]?.disability_id}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ReuseInput
                        name={`disability[${ index }].disability_name`}
                        label="अन्य भए अपांगताको नाम"
                        control={control}
                        error={errors?.disability?.[index]?.disability_name}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDisabilityCount( disabilityCount + 1 )}
                  >
                    +
                  </Button>
                </Grid>

                <Grid size={{ xs: 1 }} sx={{ mt: 5 }}>
                  {disabilityCount > 1 && (
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => setDisabilityCount( disabilityCount - 1 )}
                    >
                      <RemoveIcon />
                    </Button>
                  )}
                </Grid>
              </Grid>
            );
          } )}
        </Grid>
      </Grid>


      <hr />
      <Grid container spacing={2}>
        <Grid size={{xs:12}} sx={formHeadStyle}>
          बन्दीको स्वास्थय बिमा विवरणः
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>

          <ReuseSelect
            name="is_active"
            label="छ/छैन?"
            required={true}
            control={control}
            options={[{ label: 'छैन', value: 0 },
            { label: 'छ', value: 1 },
            ]}
            defaultValue={0}
            error={errors.is_active}
          />
        </Grid>
        {is_active == 1 && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseDatePickerBs
                name="insurance_from"
                label="बिमा देखी"
                required={true}
                control={control}
                error={errors.insurance_from}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <ReuseDatePickerBs
                name="insurance_to"
                label="बिमा देखी"
                required={true}
                control={control}
                error={errors.insurance_to}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2} >
        <Grid size={{ xs: 12 }}>
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
        <Grid size={{ xs: 12 }}>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
          {/* {contactCount === 1 ? (
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              onClick={() =>
                Swal.fire( {
                  icon: 'warning',
                  title: 'सम्पर्क व्यक्ति अपुग',
                  text: 'दुई जना सम्पर्क व्यक्ति अनिवार्य छ।',
                  confirmButtonText: 'हुन्छ',
                } )
              }
            >
              Submit
            </Button>


          )} */}

        </Grid>

      </Grid>
    </form >
  );
};

export default BandiPersonForm;
