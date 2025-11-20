import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputLabel, TextField, Autocomplete } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Box } from '@mui/material';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL
import { useAuth } from '../../Context/AuthContext';

const ReuseBandi = ( { name, label, required, control, error, defaultvalue, type, selected_office } ) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const token = localStorage.getItem( 'token' );

  // State to store office options
  const [formattedOptions, setFormattedOptions] = useState( [] );
  const [loading, setLoading] = useState( true );

  // Fetch office data

  const fetchOffices = async () => {
    setLoading( true );
    try {
      let url;

      url = `${ BASE_URL }/bandi/get_all_office_bandi`;
      if ( selected_office ) {
        url = `${ BASE_URL }/bandi/get_all_office_bandi`;
      }

      if ( authState.office_id ) {
        if ( type === 'acceptedpayrole' ) {
          url = `${ BASE_URL }/bandi/get_accepted_payroles`;
        } else if ( type === 'allbandi' ) {
          url = `${ BASE_URL }/bandi/get_all_office_bandi`;
        }
      }

      const response = await axios.get( url, {
        params: { selected_office, forSelect: true },
        withCredentials: true,
        headers: { 'Cache-Control': 'no-cache' }
      } );

      const { Status, Result, Error } = response.data;

      if ( Status && Array.isArray( Result ) && Result.length > 0 ) {
        const formatted = Result
          .filter( opt => opt?.bandi_id && opt?.bandi_name )
          .map( ( opt, index ) => {
            const bt = opt.bandi_type;
            return {
              label: `${ opt.office_bandi_id } | ${ bt } ${ opt.bandi_name?.trim() } | ${ opt.mudda_name } | ${ index + 1 }`,
              value: opt.bandi_id,
            };
          } );
        setFormattedOptions( formatted );
      } else {
        console.log( 'No records found.' );
      }
    } catch ( error ) {
      console.error( 'Error fetching records:', error );
    } finally {
      setLoading( false );
    }
  };

  // useEffect(() => {
  //     fetchOffices();
  // }, [selected_office]);
  useEffect( () => {    
    fetchOffices();
  }, [selected_office, type, authState.office_id] );

  return (
    <>
      <InputLabel id={name}>
        {/* {label} */}
        बन्दी आई.डि.| नामथर | मुद्दा
        {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <Controller
          name={name}
          control={control}
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
              key={`${ name }_${ value || '' }`}
              id={name}
              options={formattedOptions} // Use fetched districts
              autoHighlight
              getOptionLabel={( option ) => option.label || ''} // Prevents crashes if `label` is missing
              value={formattedOptions.find( ( option ) => option.value === value ) || null} // Ensure selected value matches
              onChange={( _, newValue ) => onChange( newValue ? newValue.value : '' )} // Store only value
              sx={{ width: '100%' }}

              renderOption={( props, option ) => {
                const { key, ...rest } = props; // separate out the key
                return (
                  <Box key={`${ option.value }-${ option.label }`} component="li" {...rest}>
                    {option.label}
                  </Box>
                );
              }}


              renderInput={( params ) => (
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

export default ReuseBandi;
