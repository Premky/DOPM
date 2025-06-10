import React, { useEffect, useState } from 'react'
import { Box, Button, Divider, Grid2, IconButton, Typography } from '@mui/material'

import ReuseDateField from '../ReuseableComponents/ReuseDateField'

import { useForm, Controller } from 'react-hook-form'
import ReuseState from '../ReuseableComponents/ReuseState'
import ReuseDistrict from '../ReuseableComponents/ReuseDistrict'
import ReuseMunicipality from '../ReuseableComponents/ReuseMunicipality'
import ReuseInput from '../ReuseableComponents/ReuseInput'
import ReuseVehicles from '../ReuseableComponents/ReuseVehciles'
import ReuseSelect from '../ReuseableComponents/ReuseSelect'
import ReuseAccidentReason from '../ReuseableComponents/ReuseAccidentReason'
import axios from 'axios'
import Swal from 'sweetalert2'
import RemoveIcon from '@mui/icons-material/Remove';
import AccidentShortTable from './AccidentShortTable'
import AccidentLongTable from './AccidentLongTable'
import { useBaseURL } from '../../Context/BaseURLProvider'
import ReuseCountry from '../ReuseableComponents/ReuseCountry'
import ReuseVehicleCategory from '../ReuseableComponents/ReuseVehcileCategory'

const AccidentForm = () => {
    // const BASE_URL = localStorage.getItem('BASE_URL');
    const BASE_URL = useBaseURL();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const [editing, setEditing] = useState(false);

    const [vehicleCount, setVehicleCount] = useState(1); // State to manage vehicle count
    const selectedState = watch("state_id"); // Get the selected state value
    const selectedDistrict = watch("district_id"); // Get the selected district value
    const [accidentType, setAccidentType] = useState([]);
    const [accidentRecords, setAccidentRecords] = useState([]); // State to manage accident records
    // API fetch function
    const fetchData = async (url, params, setStateFunction) => {
        try {
            const response = await axios.get(url, {
                // headers: { Authorization: `Bearer ${token}` },
                params,
                withCredentials: true,
            });
            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Result?.length > 0) {
                    setStateFunction(Result);
                } else {
                    console.log('No records found');
                }
            } else {
                console.error(Error || 'Failed to fetch records');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while fetching data.');
        }
    };


    // Fetch records for Accident Types
    const fetchAccidentTypes = (data) => {
        const params = data || {}; // Pass empty object if no data needed
        fetchData(`${BASE_URL}/public/get_accident_types`, params, (result) => {
            // console.log('Accident Types:', result);
            setAccidentType(result);
        });
    };

    const fetchAccidentRecords = (data) => {
        const params = data || {}; // Pass empty object if no data needed
        fetchData(`${BASE_URL}/accident/get_accident_records`, params, (result) => {
            setAccidentRecords(result);
        });
    };


    useEffect(() => {
        fetchAccidentTypes();
        fetchAccidentRecords();
    }, []); // Fetch accident types on component mount

    const onFormSubmit = async (data) => {
        // console.log('Form Data:', data);
        try {
            const url = editing ? `${BASE_URL}/accident/update_accident/${currentData.id}` :
                `${BASE_URL}/accident/create_accident`;
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
    }
    return (
        <>
            <Box sx={{ flexGrow: 1, margin: 2 }}>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <Grid2>
                        <h4>दैनिक सवारी दुर्घटना विवरण</h4>
                    </Grid2>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDateField
                                name='date'
                                label='दुर्घटना मिति'
                                placeholder={'YYYY-MM-DD'}
                                required={true}
                                control={control}
                                error={errors.date}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseState
                                name='state_id'
                                label='प्रदेश'
                                required
                                control={control}
                                error={errors.state}

                            />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='district_id'
                                label='जिल्ला'
                                required
                                control={control}
                                error={errors.district}
                                selectedState={selectedState}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                            <ReuseMunicipality
                                required
                                name='municipality_id'
                                label='गा.पा./न.पा./उ.न.पा./म.न.पा.'
                                control={control}
                                error={errors.municipality}
                                options={''}
                                selectedDistrict={selectedDistrict}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='number' label='वडा नं.' name='ward' control={control} error={errors.driverward} required/>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='text' label='सडकको नाम' name='road_name' control={control} error={errors.road_name} required />
                        </Grid2>
                        <Grid2>
                            <ReuseInput type='text' label='दुर्घटनाको स्थान' name='accident_location' control={control} error={errors.accidentlocation} required />
                        </Grid2>
                        <Grid2>
                            <ReuseInput type='time' label='दुर्घटनाको समय' name='accident_time' control={control} error={errors.accidenttime} required />
                        </Grid2>

                    </Grid2>

                    <Grid2 container spacing={1} marginTop={2}>
                        सवारी साधनको विवरणः
                    </Grid2>


                    {[...Array(vehicleCount)].map((_, index) => (
                        <Grid2 container spacing={1} marginTop={2} key={index}>

                            <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                                <ReuseVehicles
                                    name={`vehicle_name_${index + 1}`}
                                    label={
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <>सवारीको नाम {index + 1}</>
                                        </Box>
                                    }
                                    required
                                    control={control}
                                    error={errors[`vehicle_name_${index + 1}`]}
                                    options={''}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                                
                                <ReuseVehicleCategory
                                    name={`vehicle_category_${index + 1}`}
                                    label={
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <>सवारीको प्रकार {index + 1}</>
                                        </Box>
                                    }
                                    required
                                    control={control}
                                    error={errors[`vehicle_category_${index + 1}`]}
                                    options={''}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                                <ReuseCountry
                                    name={`vehicle_country_${index + 1}`}
                                    label={<>सवारीको देश {index + 1}</>}
                                    required
                                    control={control}
                                    error={errors[`vehicle_country_${index + 1}`]}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 3, sm: 3, md: 3 }}>
                                <ReuseInput
                                    type="text"
                                    label="कैफियत"
                                    name={`vehicle_remark_${index + 1}`}
                                    control={control}
                                    error={errors[`vehicle_remark_${index + 1}`]}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 1, sm: 1, md: 1 }} marginTop={5}>
                                <Button variant="contained" color="secondary" size='small'
                                    type="button" onClick={() => setVehicleCount(vehicleCount + 1)}>+</Button>
                            </Grid2>
                            <Grid2 size={{ xs: 1, sm: 1, md: 1 }} marginTop={5}>
                                {vehicleCount > 1 ?
                                    <Button variant="contained" color="warning" size='small' spacing={1}
                                        type="button" onClick={() => setVehicleCount(vehicleCount - 1)}><RemoveIcon /></Button>
                                    : null}
                            </Grid2>

                        </Grid2>
                    ))}


                    <Grid2 container spacing={1} marginTop={2}>
                        मानविय क्षतीको विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        मृत्युको विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='पुरुष मृतक संख्या' name='death_male' control={control} error={errors.death_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='महिला मृतक संख्या' name='death_female' control={control} error={errors.death_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालक मृतक संख्या' name='death_boy' control={control} error={errors.death_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालिका मृतक संख्या' name='death_girl' control={control} error={errors.death_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='अन्य मृतक संख्या' name='death_other' control={control} error={errors.death_other} />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        गम्भिर घाइते विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='पुरुष गम्भिर घाइते संख्या' name='gambhir_male' control={control} error={errors.gambhir_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='महिला गम्भिर घाइते संख्या' name='gambhir_female' control={control} error={errors.gambhir_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालक गम्भिर घाइते संख्या' name='gambhir_boy' control={control} error={errors.gambhir_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालिका गम्भिर घाइते संख्या' name='gambhir_girl' control={control} error={errors.gambhir_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='अन्य गम्भिर घाइते संख्या' name='gambhir_other' control={control} error={errors.gambhir_other} />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        साधारण घाइते विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='पुरुष साधारण घाइते संख्या' name='general_male' control={control} error={errors.general_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='महिला साधारण घाइते संख्या' name='general_female' control={control} error={errors.general_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालक साधारण घाइते संख्या' name='general_boy' control={control} error={errors.general_male} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='बालिका साधारण घाइते संख्या' name='general_girl' control={control} error={errors.general_female} />
                        </Grid2>
                        <Grid2 size={{ xs: 3, sm: 2, md: 2 }}>
                            <ReuseInput type='number' label='अन्य साधारण घाइते संख्या' name='general_other' control={control} error={errors.general_other} />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={1} marginTop={2}>
                        चौपायाको क्षतीको विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
                            <ReuseInput type='number' label='चौपाया मृत्यु संख्या' name='animal_death' control={control} error={errors.animal_death} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
                            <ReuseInput type='number' label='चौपाया घाइते संख्या' name='animal_injured' control={control} error={errors.animal_injured} />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={1} marginTop={2}>
                        सवारी दुर्घटनाको विवरणः
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        {
                            accidentType.map((item, index) => (
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                    <ReuseAccidentReason
                                        name={`accident_type_${item.id}`}
                                        label={item.name_np}
                                        required
                                        control={control}
                                        error={errors.accident_type_ + item.id}
                                        options={''}
                                        reason_type={item.id}
                                    />
                                </Grid2>
                            ))
                        }
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='text' label='अनुमानित क्षेती रकम' name='est_amount' control={control} error={errors.est_amount} required/>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='text' label='सवारी क्षेती संख्या' name='damage_vehicle' control={control} error={errors.damage_vehicle} required/>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='text' label='कसरी सवारी दुर्घटना भयो?' name='txt_accident_reason' control={control} error={errors.txt_accident_reason} required/>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='text' label='कैफियत' name='remarks' control={control} error={errors.remarks} />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={1} marginTop={2}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button variant="contained" color="primary" type="submit" >
                                Submit
                            </Button>
                        </Grid2>
                    </Grid2>
                </form>
            </Box >
            <Box sx={{ flexGrow: 1, margin: 2 }}>
                {/* <AccidentShortTable /> */}
                {/* <AccidentLongTable /> */}
            </Box>
        </>
    )
}

export default AccidentForm
