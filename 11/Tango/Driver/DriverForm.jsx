import React, { lazy, Suspense, useEffect, useState, useTransition } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import NepaliDate from 'nepali-datetime'
import { Box, Button, Divider, Grid2, InputLabel, TextField, Typography } from '@mui/material';
import Swal from 'sweetalert2'

import ReuseInput from '../../ReuseableComponents/ReuseInput'
import ReuseSelect from '../../ReuseableComponents/ReuseSelect'
import ReuseDateField from '../../ReuseableComponents/ReuseDateField'
import ReuseCountry from '../../ReuseableComponents/ReuseCountry'
import ReuseState from '../../ReuseableComponents/ReuseState'
import ReuseDistrict from '../../ReuseableComponents/ReuseDistrict'
import ReuseMunicipality from '../../ReuseableComponents/ReuseMunicipality'
import ReuseVehicles from '../../ReuseableComponents/ReuseVehciles'
import ReuseLisenceCategory from '../../ReuseableComponents/ReuseLisenceCategory'
import ReusableTable from '../../ReuseableComponents/ReuseTable'
import ReuseMedical from '../../ReuseableComponents/ReuseMedical';
import { useBaseURL } from '../../../Context/BaseURLProvider';
const DriverForm = () => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL') 
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem('token');
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();

    //Required Variables 
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    //Variables
    const [currentDriver, setCurrentDriver] = useState(null);

    const mentalOptions = [{ label: 'ठिक', value: '1' }, { label: 'बेठिक', value: '0' }];
    const eyeOptions = [{ label: 'देख्‍ने', value: '1' }, { label: 'नदेख्‍ने', value: '0' }];
    const earOptions = [{ label: 'सुन्ने', value: '1' }, { label: 'नसुन्ने', value: '0' }];
    const medicineOptions = [{ label: 'गर्ने', value: '1' }, { label: 'नगर्ने', value: '0' }];
    const selectedState = watch("state"); // Get the selected state value
    const selectedDistrict = watch("district"); // Get the selected district value
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);


    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log(file)
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const columns = [
        { field: "sn", headerName: "सि.नं." },
        { field: "vehicledistrict", headerName: "जिल्ला" },
        { field: "vehicle_name", headerName: "सवारी साधन", isVisible: false },
        { field: "vehicle_no", headerName: "गाडी नं." },
        { field: "start_route", headerName: "देखी" },
        { field: "end_route", headerName: "सम्म" },
        { field: "drivername", headerName: "चालक" },
        // { field: "driverdob", headerName: "जन्म मिति" },
        // { field: "country", headerName: "देश" },
        // { field: "state", headerName: "प्रदेश" },
        // { field: "district", headerName: "जिल्ला" },
        // { field: "municipality", headerName: "स्थानिय तह" },
        // { field: "driverward", headerName: "वडा नं." },
        // { field: "driverfather", headerName: "चालकको बाबुको नाम" },
        { field: "lisence_no", headerName: "स.चा. अनुमती पत्र नं." },
        { field: "lisencecategory", headerName: "वर्ग" },
        // { field: "driverctz_no", headerName: "नागरिकता नं." },
        // { field: "ctz_iss", headerName: "जारी जिल्ला" },
        // { field: "mentalhealth", headerName: "मानसिक स्वास्थ्य" },
        // { field: "drivereye", headerName: "आँखा" },
        // { field: "driverear", headerName: "कान" },
        // { field: "drivermedicine", headerName: "औषधी सेवन कर्ता" },
        { field: "driverphoto", headerName: "फोटो" },
        // { field: "remarks", headerName: "कैफियत" },
    ];

    const [formattedOptions, setFormattedOptions] = useState([]);
    const fetchDrivers = async () => {
        try {
            const url = `${BASE_URL}/driver/get_drivers`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    setFormattedOptions(Result);
                } else {
                    console.log('No records found.');
                }
            } else {
                console.log(Error || 'Failed to fetch.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const [editableData, setEditableData] = useState(null);
    const handleEdit = (row) => {
        setEditing(true)
        // console.log("Editing row:", row);
        const values = {
            country: row.country_id,
            ctz_iss: row.ctziss_id,
            district: row.district_id,
            driverctz_no: row.driverctz_no,
            driverdob: row.driverdob,
            driverear: row.driverear,
            drivereye: row.drivereye,
            driverfather: row.driverfather,
            drivermedicine: row.drivermedicine,
            drivername: row.drivername,
            driverphoto: row.driverphoto,
            driverward: row.driverward,
            end_route: row.end_route,
            id: row.id,
            lisence_no: row.lisence_no,
            lisencecategory: row.category_id,
            mentalhealth: row.mentalhealth,
            municipality: row.municipality_id,
            remarks: row.remarks,
            start_route: row.start_route,
            state: row.state_id,
            vehicle_name: row.vehiclename_id,
            vehicle_no: row.vehicle_no,
            vehicledistrict: row.vehicledistrict_id,
        };
        setEditableData(values);
        reset(values);
        console.log(values)
    };

    const handleDelete = async (id) => {
        console.log("Deleting row with id:", id);

        try {
            const url = `${BASE_URL}/driver/delete_driver/${id}`;
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Error } = response.data;
            if (Status) {
                // alert("Driver record deleted successfully.");
                Swal.fire({
                    title: "Deleted!",
                    text: "Driver record deleted successfully.",
                    icon: "success"
                });
                fetchDrivers(); // Re-fetch the drivers after deletion
            } else {
                console.log(Error || 'Failed to delete.');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };
    

    const deleteDialog = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    }


    const onFormSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("vehicledistrict", data.vehicledistrict);
            formData.append("drivername", data.drivername);
            formData.append("driverdob", data.driverdob);
            formData.append("driverage", data.driverage);
            formData.append("vehicle_no", data.vehicle_no);
            formData.append("vehicle_name", data.vehicle_name);
            formData.append("state", data.state);
            formData.append("district", data.district);
            formData.append("municipality", data.municipality);
            formData.append("driverward", data.driverward);
            formData.append("country", data.country);
            formData.append("driverfather", data.driverfather);
            formData.append("lisence_no", data.lisence_no);
            formData.append("lisencecategory", data.lisencecategory);
            formData.append("driverctz_no", data.driverctz_no);
            formData.append("ctz_iss", data.ctz_iss);
            formData.append("mentalhealth", data.mentalhealth);
            formData.append("drivereye", data.drivereye);
            formData.append("driverear", data.driverear);
            formData.append("drivermedicine", data.drivermedicine);
            formData.append("start_route", data.start_route);
            formData.append("end_route", data.end_route);
            formData.append("remarks", data.remarks);
            formData.append("image", selectedImage)
            console.log(selectedImage)
            // Append the image if it exists
            // if (data.driverphoto) {
            //     formData.append("image", data.driverphoto);
            // }

            const url = editing ? `${BASE_URL}/driver/update_driver/${data.id}` : `${BASE_URL}/driver/add_driver`;
            const method = editing ? "PUT" : "POST";

            const response = await axios({
                method,
                url,
                data: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            });

            if (response.data.Status) {
                Swal.fire({
                    title: `Driver ${editing ? "updated" : "added"} successfully!`,
                    icon: "success",
                    draggable: true
                });
                reset();
                setEditing(false);
                fetchDrivers(); // Refresh the driver list
            } else {
                Swal.fire({
                    title: response.data.message,
                    icon: "error",
                    draggable: true
                });
            }
        } catch (err) {
            console.log(err)
            Swal.fire({
                title: err.response?.data?.message || "An error occurred",
                icon: "error",
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

   
   

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <Grid2 container spacing={1}>
                        <Grid2 size={12}>
                            सवारी साधनको विरणः
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                            <ReuseDistrict
                                name='vehicledistrict'
                                label='जिल्ला'
                                required
                                control={control}
                                error={errors.vehicledistrict}
                                options={''}
                            />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseVehicles
                                name='vehicle_name'
                                label='सवारी साधनको नाम'
                                required
                                control={control}
                                error={errors.vehicle_name}
                                options={''}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='vehicle_no'
                                label='सवारी साधनको नं.'
                                required
                                control={control}
                                error={errors.vehicle_no}
                            />
                        </Grid2>
                        <Grid2 container size={{ xs: 12, sm: 6, md: 3 }}>

                            <Grid2 size={{ xs: 6, sm: 6 }}>
                                <ReuseInput
                                    name='start_route'
                                    placeholder='देखी'
                                    control={control}
                                    error={errors.start_route}
                                    label='सवारी चल्ने रुट(देखी)'
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 6, sm: 6 }}>
                                <ReuseInput
                                    name='end_route'
                                    placeholder='सम्म'
                                    control={control}
                                    error={errors.end_route}
                                    label='(सम्म)'
                                />
                            </Grid2>
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput label='चालकको नाम' name='drivername' control={control} error={errors.drivername} />
                        </Grid2>
                        <Grid2 container size={{ xs: 6, sm: 6, md: 3 }}>
                            <Grid2 size={9}>
                                <ReuseDateField
                                    name='driverdob'
                                    label='जन्म मिति'
                                    placeholder='YYYY-MM-DD'
                                    control={control}
                                    required
                                    error={errors.driverdob}
                                />
                            </Grid2>
                            <Grid2 size={3}>
                                <ReuseInput readonly
                                    label='उमेर' name='driverage' control={control} error={errors.driverage} />
                            </Grid2>
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseCountry
                                name='country'
                                label='देश'
                                required
                                control={control}
                                error={errors.country}

                            />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseState
                                name='state'
                                label='प्रदेश'
                                required
                                control={control}
                                error={errors.state}

                            />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='district'
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
                                name='municipality'
                                label='गा.पा./न.पा./उ.न.पा./म.न.पा.'
                                control={control}
                                error={errors.municipality}
                                options={''}
                                selectedDistrict={selectedDistrict}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput type='number' label='वडा नं.' name='driverward' control={control} error={errors.driverward} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput label='बुबाको नाम' name='driverfather' control={control} error={errors.driverfather} />
                        </Grid2>
                        <Grid2 container size={{ xs: 12, sm: 6, md: 3 }}>
                            <Grid2 size={8}>
                                <ReuseInput label='सवारी चालक प्र.प्र.नं.' name='lisence_no'
                                    control={control} error={errors.lisence_no} />
                            </Grid2>
                            <Grid2 size={4}>
                                <ReuseLisenceCategory
                                    name='lisencecategory'
                                    label='वर्ग'
                                    required
                                    control={control}
                                    error={errors.lisencecategory}
                                    options={''}
                                />
                            </Grid2>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput label='नागरीकता नं.' name='driverctz_no' required control={control} error={errors.driverctz_no} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseDistrict
                                name='ctz_iss'
                                label='जारी जिल्ला'
                                required
                                control={control}
                                error={errors.ctz_iss}
                                options={''}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMedical
                                medicaltype='mental'
                                name='mentalhealth'
                                label='मानसिक/शारीरिक अवस्था'
                                required
                                control={control}
                                error={errors.mentalhealth}
                                options={mentalOptions}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMedical
                                medicaltype='eye'
                                name='drivereye'
                                label='आँखा देख्‍ने/नदेख्‍ने'
                                required
                                control={control}
                                error={errors.drivereye}
                                options={eyeOptions} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMedical
                                medicaltype='ear'
                                name='driverear'
                                label='कान सुन्ने/नसुन्ने'
                                required
                                control={control}
                                error={errors.driverear}
                                options={earOptions}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseMedical
                                medicaltype='medicine'
                                name='drivermedicine'
                                label='औषधि सेवा गर्ने/नगर्ने'
                                required
                                control={control}
                                error={errors.drivermedicine}
                                options={medicineOptions}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <InputLabel id="driverphoto">
                                चालकको फोटो <span style={{ color: "red" }}>*</span>
                            </InputLabel>

                            <Controller
                                name="driverphoto"
                                control={control}
                                rules={{ required: "फोटो आवश्यक छ" }} // Validation
                                render={({ field: { onChange, value, ref } }) => (
                                    <input

                                        type="file"
                                        accept="image/*"
                                        ref={ref}
                                        onChange={(e) => {
                                            onChange(e.target.files[0]); // Store file in react-hook-form
                                            handleImageChange(e); // Call your custom function
                                        }}
                                        style={{ display: "block", marginTop: "8px" }}
                                    />
                                )}
                            />
                            {errors.driverphoto && (
                                <Typography color="error" variant="caption">
                                    {errors.driverphoto.message}
                                </Typography>
                            )}
                        </Grid2>


                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseInput
                                name='remarks'
                                label='कैफियत'
                                control={control}
                                error={errors.remarks}
                            />
                        </Grid2>
                        <Grid2 size={12}>
                            <Grid2 size={4}>
                                <Button size="medium" variant="contained" type="submit">
                                    {loading ? 'Saving...' : editing ? 'Update' : 'Add'}
                                </Button>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </form>
                <Box>
                    <ReusableTable
                        columns={columns}
                        rows={formattedOptions}
                        height="800"
                        width="100%"
                        showEdit={true}
                        showDelete={true}
                        onEdit={handleEdit}
                        onDelete={deleteDialog}
                    />
                </Box>
            </Box>
        </>
    )
}

export default DriverForm
