import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputLabel,
  FormHelperText,
} from '@mui/material';

const ReuseCheckboxGroup = ( {
  name,
  label,
  control,
  options = [],
  required = false,
  error,
} ) => {
  const allIds = options.map( ( opt ) => opt.id );

  return (
    <>
      <InputLabel id={`${ name }_label`}>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={[]} // start empty
        rules={{
          validate: ( selected ) =>
            !required || allIds.every( ( id ) => selected.includes( id ) )
              ? true
              : 'सबै विकल्पहरू चयन गर्नु अनिवार्य छ।',
        }}
        render={( { field } ) => {
          const { value = [], onChange } = field;

          const handleChange = ( checked, id ) => {
            if ( checked ) {
              onChange( [...value, id] );
            } else {
              onChange( value.filter( ( v ) => v !== id ) );
            }
          };

          return (
            <>
              <FormGroup>
                {options.map( ( opt ) => (
                  <FormControlLabel
                    key={opt.id}
                    control={
                      <>
                        <Checkbox
                          checked={value.includes( opt.id )}
                          onChange={( e ) => handleChange( e.target.checked, opt.id )}
                        />
                        
                      </>
                    }
                    label={<>{opt.characters_np} <span style={{ color: 'red' }}> *</span></>}
                  />
                ) )}
              </FormGroup>
              {error && (
                <FormHelperText sx={{ color: 'red' }}>
                  {error.message}
                </FormHelperText>
              )}
            </>
          );
        }}
      />
    </>
  );
};

export default ReuseCheckboxGroup;
