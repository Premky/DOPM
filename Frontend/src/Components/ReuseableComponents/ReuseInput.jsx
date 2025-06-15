import React from 'react';
import { InputLabel, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

const ReuseInput = ({
  name,
  label,
  required,
  control,
  error,
  placeholder,
  type,
  readonly,
  length,
  maxLength,
}) => {
  return (
    <>
      <InputLabel id={name}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        rules={{
          ...(required && {
            required: {
              value: true,
              message: 'यो फिल्ड अनिवार्य छ',
            },
          }),
        }}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''} // <== this is important
            id={name}
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error?.message || ''}
            required={required}
            placeholder={placeholder}
            type={type || 'text'}
            InputProps={{ readOnly: readonly }}
            inputProps={{ maxLength: maxLength || 255 }}
          />
        )}
      />
    </>
  );
};

export default ReuseInput;
