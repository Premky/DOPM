import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';

export default function NepaliIME() {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { remarks: '' },
  });
  const [localValue, setLocalValue] = useState('');
  const isComposing = useRef(false);

  const onSubmit = (data) => alert(JSON.stringify(data));

  useEffect(() => {
    reset({ remarks: localValue });
  }, [localValue, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="remarks"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="कैफियत"
            variant="outlined"
            fullWidth
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              if (!isComposing.current) {
                field.onChange(e);
              }
            }}
            onCompositionStart={() => (isComposing.current = true)}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              setLocalValue(e.target.value);
              field.onChange(e);
            }}
          />
        )}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Submit
      </Button>
    </form>
  );
}
