import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import NepaliDate from 'nepali-datetime';
import Select from 'react-select';
// import { useForm, Controller } from 'react-hook-form'

import { Box, Button, Grid2 as Grid, Grid2,} from '@mui/material'
import XportKasur from '../XportKasur';
import ReuseDateField from '../../../ReuseableComponents/ReuseDateField';
import ReuseInput from '../../../ReuseableComponents/ReuseInput';
import ReusableTable from '../../../ReuseableComponents/ReuseTable';
import { useAuth } from '../../../../Context/AuthContext';
import Swal from 'sweetalert2';
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect';
import { useBaseURL } from '../../../../Context/BaseURLProvider'; // Import the custom hook for base URL

const DailyKasurForm = () => {
    const { pmis } = useParams();
    const { state } = useAuth();
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const [BASE_URL, setBASE_URL] = useState(localStorage.getItem('BASE_URL'));
    const BASE_URL = useBaseURL();
    const token = state.token;

    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    const { register, handleSubmit, reset, setValue, formState: { errors }, control } = useForm();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const [currentPunishment, setCurrentPunishment] = useState([]);
    const [fetchedKasur, setFetchedKasur] = useState([]);

    // const exp_office_name = localStorage.getItem('oid')
    const exp_office_name = state.office_id;
    const [currnetOffice, setCurrentOffice] = useState([]);

    const columns = [
        { field: "sn", headerName: "सि.नं." },
        { field: "date", headerName: "मिति" },
        { field: "kasur_np", headerName: "कसुर" },
        { field: "count", headerName: "संख्या", isVisible: false },
        { field: "fine", headerName: "जरीवाना" },
        // { field: "office_id", headerName: "कार्यालय" },
    ];

    const [formattedOptions, setFormattedOptions] = useState([]);

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

    const fetchCurrentOffice = async () => {
        try {
            const result = await axios.get(`${BASE_URL}/public/currentoffice/${exp_office_name}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        withCredentials: true,
                        Authorization: `Bearer ${token}`
                    }
                });
            if (result.data.Status) {
                setCurrentOffice(result.data.Result[0]);
                // console.log(result.data.Result);
            } else {
                alert(result.data.Error);
                console.error(result.data.Error);
            }
        } catch (err) {
            console.log(err);
        }
    }

    const fetchKasur = async () => {
        try {
            const result = await axios.get(`${BASE_URL}/av/kashurs`,
                {
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` }
                });
            if (result.data.Status) {
                const options = result.data.Result.map(opt => ({
                    value: opt.id,
                    label: opt.name_np
                }));
                setFetchedKasur(options);
            } else {
                alert(result.data.Error);
                console.error(result.data.Error);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const fetchPunishment = async () => {
        try {
            const url = `${BASE_URL}/av/kasur_data`;
            const response = await axios.get(url, {
                // headers: { Authorization: `Bearer ${state.token}` },
                withCredentials: true,
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    //Add serial numbers (sn) to each row
                    const formattedData = Result.map((item, index) => ({
                        ...item,
                        sn: index + 1,
                    }));
                    // console.log(formattedData);
                    setFormattedOptions(formattedData);
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

    const onFormSubmit = async (data) => {
        setLoading(true);
        try {
            const url = editing
                ? `${BASE_URL}/av/update_kasurs/${currentPunishment.id}`
                : `${BASE_URL}/av/add_kasurs`;
            const method = editing ? 'PUT' : 'POST';

            const result = await axios({
                method,
                url,
                data,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (result.data.Status) {
                Swal.fire({
                    title: `Record ${editing ? 'updated' : 'added'} successfully!`,
                    icon: "success",
                    draggable: true
                });
                // alert(`Record ${editing ? 'updated' : 'added'} successfully!`);
                reset(); // Clear the form after submission
                setEditing(false);
                fetchPunishment(); // Refresh the punishment list
            } else {
                alert(result.data.Error || 'Failed to submit the form.');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            alert('Error occurred during form submission.');
        } finally {
            setLoading(false);
        }
    };


    const handleEdit = (data) => {
        setCurrentPunishment(data); // Set the current punishment data
        // console.log(currentPunishment, currentPunishment.id)
        setEditing(true); // Enable editing mode

        // Use setValue to populate the form fields
        setValue("date", convertToNepaliDate(data.date)); // Convert and set Nepali date
        setValue("kasur_id", data.kasur_id); // Set the vehicle ID
        setValue("count", data.count); // Set count value
        setValue("fine", data.fine); // Set fine value

    };


    const convertToNepaliDate = (isoDate) => {
        const datePart = isoDate.split('T')[0]; // Extract just the date part
        return datePart; // Return in the format needed for the NepaliDatePicker
    };

    const handleDelete = async (id) => {
        try {
            const url = `${BASE_URL}/av/delete_kasurs/${id}`;
            const result = await axios.delete(url, {
                headers: { Authorization: `Bearer ${state.token}`, withCredentials: true }
            });
            if (result.data.Status) {
                // alert('Record deleted successfully.');
                Swal.fire({
                    title: "Record deleted successfully.",
                    icon: "success",
                    draggable: true
                });
                fetchPunishment(); // Refresh table
            } else {
                alert('Failed to delete record.');
            }
        } catch (err) {
            console.error('Error occurred while deleting the record:', err);
            alert('Error occurred while deleting the record.');
        }
    };


    const handleClear = (e) => {
        e.preventDefault();
        if (loading) {
            setLoading(false);
        } else {
            reset();
            setEditing(false);
        }
    }

    useEffect(() => {
        fetchPunishment();
        fetchKasur();
        fetchCurrentOffice();
    }, [BASE_URL]);




    return (
        <>

            <Box sx={{ flexGrow: 1, margin: 5 }}>
                <Grid2>
                    <h4> कसुर विवरण</h4>
                </Grid2>
                <Grid2 container spacing={1}>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                        <ReuseDateField
                            name='date'
                            label='मिति'
                            placeholder='YYYY-MM-DD'
                            control={control}
                            required
                            error={errors.date}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                        <ReuseSelect
                            name='kasur_id'
                            label='कसुर'
                            required
                            control={control}
                            error={errors.kasur_id}
                            options={fetchedKasur}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                        <ReuseInput
                            name='count'
                            label='संख्या'
                            // placeholder='YYYY-MM-DD'
                            control={control}
                            required
                            error={errors.count}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}> {/* Use 'xs' instead of 'size' */}
                        <ReuseInput
                            name='fine'
                            label='राजस्व'
                            // placeholder='YYYY-MM-DD'
                            control={control}
                            required
                            error={errors.fine}
                        />
                    </Grid2>

                </Grid2>
                <Grid2 container spacing={4} className='mt-3'>

                    <Button
                        variant="contained"
                        type='submit'
                        disabled={loading} onClick={handleSubmit(onFormSubmit)} >
                        {loading ? 'Submitting...' : editing ? 'Update' : 'Add'}

                    </Button>
                    <Button variant="contained" type='submit' onClick={handleClear}>
                        Clear
                    </Button>
                </Grid2>
                <Grid2>
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
                </Grid2>

            </Box>
        </>
    )
}

export default DailyKasurForm;