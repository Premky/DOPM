import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import { InputLabel, TextField, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Box } from '@mui/material';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL

const ReuseIdCards = ({ name, label, required, readonly, control, error, defaultvalue }) => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL');
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem('token');

    // State to store district options
    const [formattedOptions, setFormattedOptions] = useState([]);


    const fetchIdCard = async () => {
        try {
            const url = `${BASE_URL}/public/get_id_cards`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                // console.log(Result)
                if (Array.isArray(Result) && Result.length > 0) {
                    const formatted = Result.map((opt) => ({
                        label: opt.govt_id_name_np, // Use Nepali name
                        value: opt.id, // Use ID as value
                    }));
                    setFormattedOptions(formatted);
                } else {
                    console.log('No id Card records found.');
                }
            } else {
                console.log(Error || 'Failed to fetch countries.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    useEffect(() => {
        fetchIdCard();
    }, []);

    return (
        <>
            <InputLabel id={name}>
                {label}
                {required && <span style={{ color: 'red' }}>*</span>}
            </InputLabel>

            <Controller
                name={name}
                control={control}
                defaultValue={defaultvalue}

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
                        id={name}
                        options={formattedOptions} // Use fetched districts
                        autoHighlight
                        getOptionLabel={(option) => option.label || ''} // Prevents crashes if `label` is missing
                        value={formattedOptions.find((option) => option.value === value) || null} // Ensure selected value matches
                        onChange={(_, newValue) => onChange(newValue ? newValue.value : '')} // Store only value
                        // onChange={(_, newValue) => onChange(newValue ? newValue : '')} // Store Full Object
                        sx={{ width: '100%' }}
                        // renderOption={(props, option) => (
                        //     <Box key={option.value} component="li" {...props}>
                        //         {option.label}
                        //     </Box>
                        // )}
                        disabled={readonly}

                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={ref}
                                variant="outlined"
                                size="small"
                                fullWidth
                                margin="normal"
                                error={!!error}
                                helperText={error?.message || ""}
                                required={required}
                                inputProps={{
                                    ...params.inputProps,
                                    readOnly: readonly,
                                }}
                            />
                        )}

                    />
                )}
            />
        </>
    );
};

export default ReuseIdCards;
