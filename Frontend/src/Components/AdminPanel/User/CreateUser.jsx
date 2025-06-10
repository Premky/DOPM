import React, { lazy, Suspense, useEffect, useState, useTransition } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { Box, Button, Divider, Grid2 } from '@mui/material';
import Swal from 'sweetalert2'
import NepaliDate from 'nepali-datetime'
import sha256 from "crypto-js/sha256";

import ReuseInput from '../../ReuseableComponents/ReuseInput';
import ReuseOffice from '../../ReuseableComponents/ReuseOffice';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import UserTable from './UserTable';
import ReusableTable from '../../ReuseableComponents/ReuseTable';
import ReuseBranch from '../../ReuseableComponents/ReuseBranch';
import { Navigate } from 'react-router-dom';
import { useBaseURL } from '../../../Context/BaseURLProvider';

const CreateUser = () => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL');
    const BASE_URL = useBaseURL();
    
    const token = localStorage.getItem('token');
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');

    //Required Variables 
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const defaultOptions = [
        { code: '', label: 'छ', phone: '', value: '1' },
        { code: '', label: 'छैन', phone: '', value: '0' }
    ];
    const [usertypes, setUsertypes] = useState([]);

    const fetchUsertype = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/public/get_usertypes`);
            const { Status, Result, Error } = response.data;
            if (Status) {
                const formatted = Result.map((opt) => ({
                    label: opt.name_en, // Use Nepali name
                    value: opt.id, // Use ID as value
                }));
                setUsertypes(formatted);
                // console.log(formatted)
            } else {
                console.log(Error);
            }
        } catch (error) {
            console.error("Error fetching user types:", error);
        }
    };


    const onFormSubmit = async (data) => {
        setLoading(true);
        try {
            if (!data.password || !data.repassword || data.password !== data.repassword) {
                Swal.fire({
                    icon: "error",
                    title: "ओहो...",
                    text: "पासवर्ड मिलेन",
                });
                return;
            }

            const userData = {
                name_np: data.name_np, usertype: data.usertype, username: data.username, password: data.password, repassword: data.repassword,
                office: data.office, branch: data.branch, is_active: data.is_active
            };
            const url = editing ? `${BASE_URL}/auth/update_user/${userData.username}` : `${BASE_URL}/auth/create_user`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios({
                method, url, data: userData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true
            })
            const { Status, Result, Error } = response.data;
            if (Status) {
                Swal.fire({
                    title: `User ${editing ? 'updated' : 'created'} successfully!`,
                    icon: "success",
                    draggable: true
                });
                reset();
                setEditing(false);
                fetchUsers();
                Navigate('/sadmin/users');
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: err.response.data.Error,
                icon: 'error',
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    }

    const [formattedOptions, setFormattedOptions] = useState([]);
    const fetchUsers = async () => {
        try {
            const url = `${BASE_URL}/auth/get_users`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const { Status, Result, Error } = response.data;
    
            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    const formatted = Result.map((opt, index) => ({
                        sn: `${opt.id ?? `branch-${index}`}`,  // Unique key generation
                        id: index + 1,
                        name: opt.name,
                        username: opt.username,
                        usertype: opt.en_usertype,
                        office_id: opt.office,
                        branch_id: opt.branch,
                        is_active: opt.is_active ? 'छ' : 'छैन',
                    }));
                    
                    setFormattedOptions(formatted);
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
    
    // Handle edit action
    const handleEdit = (row) => {        
        // console.log("Editing user:", row);
        // You can navigate to a different page or open a modal to edit the user        
        setValue('name_np', row.name);
        setValue('username', row.username);
        const matchedUsertype = usertypes.find(ut => ut.label === row.usertype);
        if (matchedUsertype) {
            setValue('usertype', matchedUsertype.value);
            // console.log(matchedUsertype);
        }
        // setValue('usertype', row.usertype);
        setValue('office', row.office_id);
        setValue('branch', row.branch_id);  
        setValue('is_active', row.is_active === 'छ' ? '1' : '0');
        setEditing(true);
        // Example: You can pass the row data to a form for editing
    };

    // Handle delete action
    const handleDelete = async (id) => {
        console.log("Deleting user with id:", id);
        try {
            const url = `${BASE_URL}/auth/delete_user/${id}`;
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Error } = response.data;
            if (Status) {
                Swal.fire({
                    title: "Deleted!",
                    text: "User has been deleted.",
                    icon: "success"
                });
                // Refresh the table data after successful deletion
                fetchUsers();
            } else {
                Swal.fire({
                    title: "Failed to delete the user",
                    text: Error,
                    icon: "error"
                });

            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
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

    const clear = () => {
        reset({
            name_np: "",
            username: "",
            password: "",
            repassword: "",
            office: "",
            branch: "",
            is_active: "",
            usertype: "",
        });
        
    }
    const columns = [
        { field: "id", headerName: "सि.नं." },
        { field: "name", headerName: "नाम" },
        { field: "username", headerName: "प्रयोगकर्ता नाम" },
        { field: "usertype", headerName: "प्रकार" },
        { field: "office_id", headerName: "कार्यालय" },
        { field: "branch_id", headerName: "शाखा" },
        { field: "is_active", headerName: "सक्रय" },
    ];

    useEffect(() => {
        fetchUsertype();
        fetchUsers();
    }, [])

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <Grid2 container spacing={1}>
                        <Grid2 size={{ xs: 12 }}>प्रयोगकर्ता </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseInput
                                name='name_np'
                                label='दर्जा नामथर नेपालीमा'
                                control={control}
                                error={errors.name_np}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseInput
                                name='username'
                                label='Username'
                                length={10}
                                control={control}
                                error={errors.username}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseSelect
                                name='usertype'
                                label='प्रयोगकर्ताको प्रकार'
                                control={control}
                                error={errors.usertype}
                                required
                                options={usertypes}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseOffice
                                name='office'
                                label='कार्यालय'
                                control={control}
                                error={errors.office}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseBranch
                                name='branch'
                                label='शाखा'
                                control={control}
                                error={errors.office}
                                options={usertypes}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseInput
                                name='password'
                                type='password'
                                label='Password'
                                control={control}
                                error={errors.password}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseInput
                                name='repassword'
                                type='password'
                                label='Re-Password'
                                control={control}
                                error={errors.repassword}
                                required
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                            <ReuseSelect
                                name='is_active'
                                label='सक्रिय छ/छैन'
                                control={control}
                                error={errors.is_active}
                                options={defaultOptions}
                                required
                            />
                        </Grid2>
                        <Grid2 container size={{ xs: 12 }}>
                            <Grid2 size={{ xs: 3 }}>
                                <Button variant='contained' type='submit'>Save</Button>
                            </Grid2>
                            <Grid2 size={{ xs: 3 }}>
                                <Button variant='contained' color='error' onClick={clear}>Clear</Button>
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </form>
            </Box>
            <Box>
                <ReusableTable
                    columns={columns}
                    rows={formattedOptions}
                    height="800"
                    showEdit={true}
                    showDelete={true}
                    onEdit={handleEdit}
                    onDelete={deleteDialog}
                />
            </Box>
        </>
    )
}

export default CreateUser