import { useTheme } from '@emotion/react'
import axios from 'axios'
import React, { useEffect, useState, useTransition } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { NepaliDatePicker } from "nepali-datepicker-reactjs"
import "nepali-datepicker-reactjs/dist/index.css"
import NepaliDate from 'nepali-datetime'
// import Select from 'react-select';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
    FormControl, Container, Select, InputLabel,
    MenuItem
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';

// import ReleasedPrisionersTable from './ReleasedPrisionersTable';
// import PoliceRecordTable from './PoliceRecordTable';
// import Select from '@mui/material'


// import Logout from '../../Login/Logout'
import { useActionState } from 'react'


const PrisionerReleaseForm = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const [isLoading, startTransition] = useTransition();
    const [editing, setEditing] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors }, control } = useForm();

    const currentofficeid = localStorage.getItem('main_office_id')
    const currentofficenp = localStorage.getItem('office_np')

    const [adminOffice, setAdminOffice] = useState([]);
    const [prisioners, setPrisioners] = useState([]);
    const [records, setRecords] = useState([]);
    const [releaseReasons, setReleaseReasons] = useState([]);

    const fetchAdminOffices = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/common/get_admin_office`);
            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Result?.length > 0) {
                    setAdminOffice(Result); //Set the fetched Records
                } else {
                    // alert("No record Found");
                    console.log("No Country Found");
                }
            } else {
                alert(Error || 'Failed to fetch case data.');
                console.log('Failed to fetch case data.')
            }
        } catch (error) {
            console.error('Error fetching delete case:', error);
            alert('An error occurred while fetching case data. Please try again.');
        }
    };

    const fetchReleaseReasons = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/common/get_release_reasons`);
            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Result?.length > 0) {
                    setReleaseReasons(Result); //Set the fetched Records
                } else {
                    // alert("No record Found");
                    console.log("No Reasons Found");
                }
            } else {
                alert(Error || 'Failed to fetch reason data.');
                console.log('Failed to fetch reason data.')
            }
        } catch (error) {
            console.error('Error fetching delete reason:', error);
            alert('An error occurred while fetching reason data. Please try again.');
        }
    };

    const fetchRecords = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/prisioner/get_prisioners`);
            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Result?.length > 0) {
                    setPrisioners(Result); //Set the fetched Records
                    // console.log(Result);
                } else {
                    console.log("No Record Found")
                }
            } else {
                // alert(Error || 'Failed to fetch records.');
                console.log(Error || 'Failed to fetch records.')
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            alert('An error occured while fetching records.');
        }
    };

    const onFormSubmit = async (data) => {
        // setLoading(true);
        startTransition(async () => {
            console.log(data)
            try {
                // const formData = new FormData();
                const url = editing ? `${BASE_URL}/prisioner/update_release_prisioner/${currentData.id}` :
                    `${BASE_URL}/prisioner/add_release_prisioner`;
                const method = editing ? 'PUT' : 'POST';
                const result = await axios({
                    method, url, data,
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                })


                if (result.data.Status) {
                    alert(`Record ${editing ? 'updated' : 'added'} ${result.data.id} successfully!`);
                    reset();
                    setEditing(false);
                    // setCurrentData(null);
                    fetchRecords();
                }

            } catch (err) {
                console.error(err);
                alert('Failed to save.')
            }
        })
    };

    useEffect(() => {
        fetchRecords();
        fetchAdminOffices();
        fetchReleaseReasons();
    }, [])
    return (
        <React.Fragment>
            <div className="col-12">
                <div className="d-flex flex-column px-3 pt-0">
                    
                    <form className="row mt-1 g-3">
                        <Box sx={{ flexGrow: 1 }}>
                            <Grid container spacing={4} >
                                <Grid item xs={12} sm={4} md={3} mt={2}>
                                    <FormControl sx={{ m: .5, minWidth: 215 }} error={!!errors.rank}>
                                        <InputLabel id="office">कारागारको नाम</InputLabel>
                                        <Select
                                            labelId="office_id-label"
                                            id="office"
                                            {...register('office_id', { required: "This field is required." })}
                                            autoWidth
                                            label="मुद्दा"
                                            defaultValue={currentofficeid}
                                        >

                                            {adminOffice.map((data) => (
                                                <MenuItem value={data.id} key={data.id} disabled>{data.office_np}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3} mt={2}>
                                    <FormControl sx={{ m: .5, minWidth: 215 }} error={!!errors.prisioner_name}>
                                        <InputLabel id="prisioner_name">कैदीको नामथर नाम</InputLabel>
                                        <Select
                                            labelId="prisioner_name-label"
                                            id="prisioner_name"
                                            {...register('prisioner_name', { required: "This field is required." })}
                                            autoWidth
                                            label="कैदीको नामथर"
                                        // defaultValue={currentofficeid}
                                        >

                                            {prisioners.map((data) => (
                                                <MenuItem value={data.id} key={data.id}> {data.name_np} ({data.prisioner_type}) ({data.case_np})</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3} mt={2}>
                                    <FormControl sx={{ m: .5, minWidth: 215 }} error={!!errors.reason}>
                                        <InputLabel id="reason">छुटेको कारण</InputLabel>
                                        <Select
                                            labelId="reason-label"
                                            id="reason"
                                            {...register('reason', { required: "This field is required." })}
                                            autoWidth
                                            label="छुटेको कारण"
                                        // defaultValue={currentofficeid}
                                        >

                                            {releaseReasons.map((data) => (
                                                <MenuItem value={data.id} key={data.id}> {data.reasons_np}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* <Grid item xs={12} sm={8} md={6} xl={3}>
                                    <FormControl sx={{ m: .5, minWidth: 215 }} >
                                        <TextField id="reason" label="कारण"
                                            {...register('reason', { required: "This field is required." })}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.reason}
                                        />
                                    </FormControl>
                                </Grid> */}

                                <Grid item xs={12} sm={8} md={6} xl={3}>
                                    <FormControl sx={{
                                        "& input": {
                                            padding: "10px",
                                            fontSize: "16px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                        }
                                    }} error={!!errors.nirnay_miti}>
                                        < div className="col-xl-3 col-md-4 col-sm-12">
                                            <label htmlFor="nirnay_miti">निर्णय मिति<span>*</span></label>
                                            <Controller
                                                name="nirnay_miti"
                                                control={control}
                                                rules={{ required: "This field is required" }}
                                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                                    <NepaliDatePicker
                                                        value={value || ""} // Ensure empty string when no date is selected
                                                        onChange={(nirnay_miti) => {
                                                            onChange(nirnay_miti); // Update form state
                                                        }}
                                                        onBlur={onBlur} // Handle blur
                                                        dateFormat="YYYY-MM-DD" // Customize your date format
                                                        placeholder="Select Nepali Date"
                                                    // ref={ref} // Use ref from react-hook-form
                                                    />
                                                )}
                                            />
                                            {errors.nirnay_miti && <span style={{ color: 'red' }}>{errors.nirnay_miti.message}</span>}
                                        </div>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={8} md={6} xl={3}>
                                    <FormControl sx={{
                                        "& input": {
                                            padding: "10px",
                                            fontSize: "16px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                        }
                                    }} error={!!errors.karyanayan_miti}>
                                        < div className="col-xl-3 col-md-4 col-sm-12">
                                            <label htmlFor="karyanayan_miti">कार्यान्वयन मिति<span>*</span></label>
                                            <Controller
                                                name="karyanayan_miti"
                                                control={control}
                                                rules={{ required: "This field is required" }}
                                                render={({ field: { onChange, onBlur, value, ref } }) => (
                                                    <NepaliDatePicker
                                                        value={value || ""} // Ensure empty string when no date is selected
                                                        onChange={(karyanayan_miti) => {
                                                            onChange(karyanayan_miti); // Update form state
                                                        }}
                                                        onBlur={onBlur} // Handle blur
                                                        dateFormat="YYYY-MM-DD" // Customize your date format
                                                        placeholder="Select Nepali Date"
                                                    // ref={ref} // Use ref from react-hook-form
                                                    />
                                                )}
                                            />
                                            {errors.karyanayan_miti && <span style={{ color: 'red' }}>{errors.karyanayan_miti.message}</span>}
                                        </div>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl sx={{ m: 0.5, minWidth: 215 }} error={!!errors.nirnay_officer}>
                                        <TextField
                                            id="nirnay_officer"
                                            label="निर्णय गर्ने अधिकारी"
                                            {...register('nirnay_officer', { required: "This field is required." })}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.nirnay_officer}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl sx={{ m: 0.5, minWidth: 215 }} error={!!errors.aafanta_name}>
                                        <TextField
                                            id="aafanta_name"
                                            label="आफन्तको नाम नेपालीमा"
                                            {...register('aafanta_name', { required: "This field is required." })}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.aafanta_name}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl sx={{ m: 0.5, minWidth: 215 }} error={!!errors.aafanta_address}>
                                        <TextField
                                            id="aafanta_address"
                                            label="आफन्तको ठेगाना"
                                            {...register('aafanta_address', { required: "This field is required." })}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.aafanta_address}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4} md={3}>
                                    <FormControl sx={{ m: 0.5, minWidth: 215 }} error={!!errors.aafanta_contact}>
                                        <TextField
                                            id="aafanta_contact"
                                            label="आफन्तको सम्पर्क नं."
                                            {...register('aafanta_contact', { required: "This field is required." })}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.aafanta_contact}
                                        />
                                    </FormControl>
                                </Grid>

                                {/* <Grid item xs={12} sm={4} md={3}>
                                    <FormControl sx={{ m: 0.5, minWidth: 215 }} error={!!errors.aafanta_photo}>
                                        <TextField
                                            id="aafanta_photo"
                                            label="आफन्तको फोटो"
                                            {...register('aafanta_photo')}
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.aafanta_photo}
                                        />
                                    </FormControl>
                                </Grid> */}
                            </Grid>
                        </Box>


                        <div className="col-12">
                            <button type="submit" className="btn btn-primary" disabled={isLoading} onClick={handleSubmit(onFormSubmit)} >
                                {/* {loading ? 'Submitting...' : editing ? 'Update Employee' : 'Add Employee'} */}submit
                            </button>
                            <div className="col mb-3">
                                {/* <button className='btn btn-danger' onClick={handleClear}>Clear</button> */}
                            </div>
                        </div>
                    </form>
                </div>
            </div >
            {/* <ReleasedPrisionersTable
                records={records}
                // onEdit={handleEdit}
                // onDelete={handleDelete}
            /> */}
        </React.Fragment >
    )
}

export default PrisionerReleaseForm
