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
  type = 'text',
  readonly,
  maxLength,
  minLength,
  inputProps,
  defaultValue,
  onlyDigits = false,
  language, // 'english' | 'nepali'
}) => {
  // Define character patterns
  const patterns = {
    english: /^[a-zA-Z0-9\s.,!?'"@#%^&*()\-_=+[\]{}<>\\/|`~;:]*$/,
    nepali: /^[\u0900-\u097F\s०१२३४५६७८९.,!?'"@#%^&*()\-_=+[\]{}<>\\/|`~;:]*$/,
  };

  // Validation rules for react-hook-form
  const rules = {
    ...(required && {
      required: {
        value: true,
        message: 'यो फिल्ड अनिवार्य छ',
      },
    }),
    ...(minLength && {
      minLength: {
        value: minLength,
        message: `कम्तिमा ${minLength} अंक हुनुपर्छ`,
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `अधिकतम ${maxLength} अंक मात्र हुनसक्छ`,
      },
    }),
    ...(onlyDigits && {
      pattern: {
        value: /^[0-9]*$/,
        message: 'कृपया केवल अंकहरू प्रविष्ट गर्नुहोस्',
      },
    }),
  };

  // Handle IME-based input safely (for Nepali typing)
  const handleBeforeInput = (e) => {
    if (!language) return;

    const data = e.data;
    if (!data) return; // Allow system/IME control keys

    const isValid = patterns[language].test(data);
    if (!isValid) {
      e.preventDefault();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    if (!language) return;
    const pasted = e.clipboardData.getData('text');
    const isValid = patterns[language].test(pasted);
    if (!isValid) e.preventDefault();
  };

  // ✅ Custom onChange validation to show error live
  const handleChange = (e, field, onChange) => {
    const val = e.target.value;

    if (language) {
      const isValid = patterns[language].test(val);
      if (!isValid) {
        field.onChange(''); // clear invalid text
        return;
      }
    }

    onChange(val);
  };

  return (
    <>
      <InputLabel id={name}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue ?? ''}
        rules={{
          ...rules,
          validate: (value) => {
            if (!value) return true; // skip empty validation
            if (language === 'english' && !patterns.english.test(value)) {
              return 'कृपया केवल अंग्रेजी अक्षरहरू मात्र प्रविष्ट गर्नुहोस्';
            }
            if (language === 'nepali' && !patterns.nepali.test(value)) {
              return 'कृपया केवल नेपाली अक्षरहरू मात्र प्रविष्ट गर्नुहोस्';
            }
            return true;
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value ?? ''}
            id={name}
            variant="outlined"
            size="small"
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error?.message || ''}
            required={required}
            placeholder={placeholder}
            type={type}
            InputProps={{
              readOnly: readonly,
            }}
            inputProps={{
              maxLength: maxLength || 255,
              onBeforeInput: handleBeforeInput,
              onPaste: handlePaste,
              ...(inputProps || {}),
            }}
            onChange={(e) => handleChange(e, field, field.onChange)}
          />
        )}
      />
    </>
  );
};

export default ReuseInput;