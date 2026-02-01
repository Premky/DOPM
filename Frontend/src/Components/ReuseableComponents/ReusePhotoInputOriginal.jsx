import { useEffect, useState } from 'react';
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

const ReusePhotoInput = ( {
  name,
  label,
  required,
  control,
  error,
  defaultValue,
  maxSizeMB, // optional (e.g., 1)
  allowedTypes = null, // optional, e.g. /jpeg|jpg|png/
  showAvatar = true
} ) => {
  const [previewUrl, setPreviewUrl] = useState( null );
  const [fileName, setFileName] = useState(null);
  const [uploadError, setUploadError] = useState( '' );
  const [loading, setLoading] = useState( false );

  // ✅ Helper function to convert image to JPG
  const convertToJPG = ( file ) => {
    return new Promise( ( resolve, reject ) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = ( e ) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement( 'canvas' );
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext( '2d' );
        ctx.drawImage( img, 0, 0 );
        canvas.toBlob(
          ( blob ) => {
            if ( !blob ) return reject( new Error( 'Blob creation failed' ) );
            const newFile = new File( [blob], file.name.replace( /\.\w+$/, '.jpg' ), {
              type: 'image/jpeg',
            } );
            resolve( newFile );
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => reject( new Error( 'Image load error' ) );
      reader.readAsDataURL( file );
    } );
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
        defaultValue={defaultValue || null}
        rules={{
          ...( required && {
            required: {
              value: true,
              message: 'यो फिल्ड अनिवार्य छ',
            },
          } ),
        }}
        render={( { field: { onChange, value, ...field } } ) => {
          const handleImageChange = async ( e ) => {
            const file = e.target.files[0];
            if ( !file ) return;

            setUploadError( '' );
            setLoading( true );

            try {
              let finalFile = file;
              setFileName(file.name);
              const fileType = file.type.split( '/' )[1]?.toLowerCase();

              // ✅ Optional type validation
              if ( allowedTypes && !allowedTypes.test( fileType ) ) {
                const confirmConvert = window.confirm(
                  'यो फोटो अनुमत प्रकारमा छैन। JPG फर्म्याटमा रूपान्तरण गर्न चाहनुहुन्छ?'
                );
                if ( confirmConvert ) {
                  try {
                    finalFile = await convertToJPG( file );
                    setFileName(finalFile.name);
                  } catch ( err ) {
                    console.error( err );
                    setUploadError( 'फोटो रूपान्तरण गर्दा समस्या आयो।' );
                    setPreviewUrl( null );
                    setFileName('');
                    onChange( null );
                    return;
                  }
                } else {
                  setUploadError( 'कृपया JPG, JPEG वा PNG फाइल मात्र अपलोड गर्नुहोस्।' );
                  setPreviewUrl( null );
                  onChange( null );
                  return;
                }
              }

              // ✅ Compress if too large
              if ( maxSizeMB && finalFile.size > maxSizeMB * 1024 * 1024 ) {
                try {
                  const options = {
                    maxSizeMB,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                  };
                  const compressed = await imageCompression( finalFile, options );
                  finalFile = compressed;
                  setFileName(finalFile.name);
                } catch ( compressionError ) {
                  console.error( compressionError );
                  setUploadError( 'फोटो कम्प्रेस गर्दा समस्या आयो।' );
                  setPreviewUrl( null );
                  onChange( null );
                  return;
                }
              }

              // ✅ Generate preview
              const reader = new FileReader();
              reader.onloadend = () => setPreviewUrl( reader.result );
              reader.readAsDataURL( finalFile );
              onChange( finalFile );
            } finally {
              setLoading( false );
            }
          };

          // ✅ If value is existing photo URL
          useEffect( () => {
            if ( typeof value === 'string' ) {
              setPreviewUrl( value );
            }
          }, [value] );

          return (
            <Box mt={1}>
              {showAvatar && (
                <Avatar
                  variant="rounded"
                  src={previewUrl || undefined}
                  sx={{ width: 150, height: 150, mb: 1 }}
                >
                  {!previewUrl && <Person sx={{ fontSize: 60 }} />}
                </Avatar>
              )}

              <Button
                variant="contained"
                component="label"
                size="small"
                disabled={loading}
              >
                {loading
                  ? `कृपया पर्खनुहोस्...`
                  : previewUrl
                    ? `${fileName} फोटो परिवर्तन गर्नुहोस्`
                    : `फोटो छान्नुहोस्`}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                />
              </Button>

              {showAvatar && previewUrl && !loading && (
                <Button
                  onClick={() => {
                    setPreviewUrl( null );
                    onChange( null );
                  }}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                >              
                हटाउनुहोस् 
                </Button>
              )}

              {( error || uploadError ) && (
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