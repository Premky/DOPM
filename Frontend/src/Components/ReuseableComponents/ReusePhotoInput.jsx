import React, { useEffect, useState } from 'react';
import {
  InputLabel,
  Avatar,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { Person } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';

const ReusePhotoInput = ({
  name,
  label,
  required,
  control,
  error,
  defaultValue,
  maxSizeMB // optional (e.g., 1)
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <>
      <InputLabel id={name}>
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || null}
        rules={{
          ...(required && {
            required: {
              value: true,
              message: 'यो फिल्ड अनिवार्य छ',
            },
          }),
        }}
        render={({ field: { onChange, value, ...field } }) => {
          const handleImageChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setUploadError('');
            setLoading(true);

            try {
              if (!file.type.startsWith('image/')) {
                setUploadError('कृपया मात्र फोटो (image) फाइल अपलोड गर्नुहोस्।');
                setPreviewUrl(null);
                onChange(null);
                return;
              }

              let finalFile = file;

              // ✅ If maxSizeMB is defined, check and compress if needed
              if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
                const options = {
                  maxSizeMB,
                  maxWidthOrHeight: 1024,
                  useWebWorker: true,
                };
                try {
                  const compressed = await imageCompression(file, options);
                  finalFile = compressed;
                } catch (compressionError) {
                  console.error(compressionError);
                  setUploadError('फोटो कम्प्रेस गर्दा समस्या आयो।');
                  setPreviewUrl(null);
                  onChange(null);
                  return;
                }
              }

              // ✅ Generate preview
              const reader = new FileReader();
              reader.onloadend = () => setPreviewUrl(reader.result);
              reader.readAsDataURL(finalFile);
              onChange(finalFile);
            } finally {
              setLoading(false);
            }
          };

          // ✅ If value is already a string (existing photo URL)
          useEffect(() => {
            if (typeof value === 'string') {
              setPreviewUrl(value);
            }
          }, [value]);

          return (
            <Box mt={1}>
              <Avatar
                variant="rounded"
                src={previewUrl || undefined}
                sx={{ width: 150, height: 150, mb: 1 }}
              >
                {!previewUrl && <Person sx={{ fontSize: 60 }} />}
              </Avatar>

              <Button
                variant="contained"
                component="label"
                size="small"
                disabled={loading}
              >
                {loading
                  ? 'कृपया पर्खनुहोस्...'
                  : previewUrl
                  ? 'फोटो परिवर्तन गर्नुहोस्'
                  : 'फोटो छान्नुहोस्'}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
              </Button>

              {(error || uploadError) && (
                <Typography color="error" variant="body2" mt={1}>
                  {uploadError || error?.message}
                </Typography>
              )}
            </Box>
          );
        }}
      />
    </>
  );
};

export default ReusePhotoInput;
