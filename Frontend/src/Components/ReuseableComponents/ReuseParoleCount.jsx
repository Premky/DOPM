import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputLabel, TextField, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Box } from '@mui/material';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL

const ReuseParoleCount = ({ name, label, required, control, error, defaultvalue }) => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL');
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem('token');

    // State to store office options
    const [formattedOptions, setFormattedOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch office data
    const fetchOffices = async () => {
        try {
            const url = `${BASE_URL}/public/get_parole_nos`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    // console.log(Result)
                    const formatted = Result.map((opt) => ({
                        label: opt.payrole_no_name, // Use Nepali name
                        value: opt.id, // Use ID as value
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
    }

    useEffect(() => {
        fetchOffices();
    }, []);
    useEffect(() => {
        fetchOffices();
    }, []);
    return (
        <>
            <InputLabel id={name}>
                {label}
                {required && <span style={{ color: 'red' }}>*</span>}
            </InputLabel>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <Controller
                    name={name}
                    control={control}
                    rules={{
                        ...(required && {
                            required: {
                                value: true,
                                message: 'यो फिल्ड अनिवार्य छ',
                            },
                        })
                    }}
                    render={({ field: { onChange, value, ref } }) => (
                        <Autocomplete
                            key={`${name}_${value || ''}`}
                            id={name}
                            options={formattedOptions} // Use fetched districts
                            autoHighlight
                            getOptionLabel={(option) => option.label || ''} // Prevents crashes if `label` is missing
                            value={formattedOptions.find((option) => option.value === value) || null} // Ensure selected value matches
                            onChange={(_, newValue) => onChange(newValue ? newValue.value : '')} // Store only value
                            sx={{ width: '100%' }}

                            renderOption={(props, option) => {
                                const { key, ...rest } = props; // separate out the key
                                return (
                                    <Box key={`${option.value}-${option.label}`} component="li" {...rest}>
                                        {option.label}
                                    </Box>
                                );
                            }}


                            renderInput={(params) => (
                                <TextField
                                    // defaultValue=''
                                    {...params}
                                    inputRef={ref}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    margin="normal"
                                    error={!!error}
                                    helperText={error?.message || ""}
                                    required={required}
                                />
                            )}
                        />

                    )}
                />
            )}
        </>
    );
};

export default ReuseParoleCount;
