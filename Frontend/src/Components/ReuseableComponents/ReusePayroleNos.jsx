import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
import { InputLabel, TextField, Autocomplete } from '@mui/material';
import { Controller, useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL

const ReusePayroleNos = ( { name, label, required, readonly, control, setValue, error, defaultvalue, is_only_active } ) => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL');
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem( 'token' );

    // State to store district options
    const [formattedOptions, setFormattedOptions] = useState( [] );

    //Watch current field value
    const currentValue = useWatch( { control, name } );

    const fetchOptions = async () => {
        try {
            const url = `${ BASE_URL }/public/get_payrole_nos`;
            const response = await axios.get( url, {
                headers: { Authorization: `Bearer ${ token }` },
                withCredentials: true,
                params: { is_only_active }
            } );

            const { Status, Result, Error } = response.data;

            if ( Status ) {
                if ( Array.isArray( Result ) && Result.length > 0 ) {
                    const formatted = Result.map( ( opt ) => ( {
                        label: `${ opt.payrole_no_name } (${ opt.payrole_decision_date })`, // Use Nepali name
                        value: opt.id, // Use ID as value
                        is_active: opt.is_active,
                    } ) );

                    // ➕ prepend "सबै"
                    const withAllOption = [
                        { label: 'सबै', value: 'all', is_active: false },
                        ...formatted
                    ];
                    setFormattedOptions( withAllOption );
                } else {
                    console.log( 'No Payrole No records found.' );
                }
            } else {
                console.log( Error || 'Failed to fetch Payrole no.' );
            }
        } catch ( error ) {
            console.error( 'Error fetching records:', error );
        }
    };

    useEffect( () => {
        fetchOptions();
    }, [] );

    //Set default value after options load and is empty:
    useEffect( () => {
        if ( !formattedOptions.length ) return;
        //For all value 
        if ( currentValue !== undefined && currentValue !== null && currentValue !== '' ) return;


        // Filter active nos 
        const activeOptions = formattedOptions.filter( o => o.is_active && o.value !== '' );

        // set default only the field is empty:
        if ( activeOptions.length > 0 ) {
            // const defaultOption = activeOptions.length === 1 ? activeOptions[0] : activeOptions[activeOptions.length - 1]; //active or last active value
            const defaultOption = activeOptions[0]; //first active value
            setValue( name, defaultOption.value, {
                shouldValidate: true,
                shouldDirty: false
            } );
        }
    }, [formattedOptions, currentValue, name, setValue] );
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
                    ...( required && {
                        required: {
                            value: true,
                            message: 'यो फिल्ड अनिवार्य छ',
                        },
                    } )
                }}
                render={( { field: { onChange, value, ref } } ) => (
                    <Autocomplete
                        id={name}
                        options={formattedOptions} // Use fetched districts
                        autoHighlight
                        getOptionLabel={( option ) => option.label || ''} // Prevents crashes if `label` is missing
                        value={formattedOptions.find( ( option ) => option.value === value ) || null} // Ensure selected value matches
                        onChange={( _, newValue ) => onChange( newValue ? newValue.value : '' )} // Store only value
                        sx={{ width: '100%' }}
                        // renderOption={(props, option) => (
                        //     <Box key={option.value} component="li" {...props}>
                        //         {option.label}
                        //     </Box>
                        // )}
                        disabled={readonly}

                        renderInput={( params ) => (
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

export default ReusePayroleNos;
