import React, { useEffect, useRef } from "react";
import $ from "jquery";
import { Controller } from "react-hook-form";
import { Box, InputLabel, Typography } from "@mui/material";
import "@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.css";



// Make jQuery global
window.$ = window.jQuery = $;

const ReuseDatePickerSMV5 = ( {
  control,
  name,
  label,
  required = false,
  defaultValue = "",
  options = { miniEnglishDates: true },
  maxDate
} ) => {
  const inputRef = useRef( null );
  const initializedRef = useRef( false );

  useEffect( () => {
    let isMounted = true;


    // Dynamically load the plugin JS
    import( "@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.js" )
      .then( () => {
        if (
          isMounted &&
          inputRef.current &&
          !initializedRef.current &&
          typeof $( inputRef.current ).NepaliDatePicker === "function"
        ) {
          $( inputRef.current ).NepaliDatePicker( {
            ...options,
            ...( maxDate && { maxDate: maxDate }),
          } );
          initializedRef.current = true;
        }
      } )
      .catch( ( err ) => console.error( "Failed to load Nepali Date Picker:", err ) );

    return () => {
      isMounted = false;
    };
  }, [options] );

  return (
    <>
      {/* Label outside Box */}
      <InputLabel id={name} sx={{ mb: 1, display: "block" }}>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          ...( required && { required: "यो फिल्ड अनिवार्य छ" } ),
          pattern: {
            value: /^\d{4}-\d{2}-\d{2}$/,
            message: "मिति YYYY-MM-DD ढाँचामा हुनुपर्छ",
          },
        }}
        render={( { field: { onChange }, fieldState: { error } } ) => (
          <Box sx={{ mb: 2, mt: 1 }}>
            <input
              ref={inputRef}
              id={name}
              type="text"
              placeholder="YYYY-MM-DD"
              autoComplete="off"
              onChange={( e ) => {
                const inputValue = e.target.value.replace( /[^0-9]/g, "" ); // Allow only numbers
                let formatted = inputValue;

                if ( inputValue.length > 4 ) {
                  const year = inputValue.slice( 0, 4 );
                  const month = inputValue.slice( 4, 6 );
                  formatted = `${ year }-${ month }`;
                }
                if ( inputValue.length > 6 ) {
                  const year = inputValue.slice( 0, 4 );
                  let month = inputValue.slice( 4, 6 );
                  let day = inputValue.slice( 6, 8 );

                  // Validate month
                  if ( parseInt( month, 10 ) > 12 ) {
                    month = "12";
                  }
                  // Validate day
                  if ( parseInt( day, 10 ) > 32 ) {
                    day = "32";
                  }

                  formatted = `${ year }-${ month }-${ day }`;
                }

                formatted = formatted.slice( 0, 10 ); // Limit to yyyy-mm-dd
                e.target.value = formatted; // Update input value
                // setFormattedValue( formatted );
                // onChange( formatted ); // internal RHF update
                // if ( typeof propsOnChange === 'function' ) {
                //   propsOnChange( formatted ); // external prop callback
                // }
              }}
              onBlur={() => {
                if ( inputRef.current ) {
                  onChange( inputRef.current.value );
                }
              }}
              className="nepali-datepicker-input"
            />

            {/* Styles to match MUI TextField */}
            <style>{`
              .nepali-datepicker-input {
                width: 100%;
                padding: 10.5px 14px;
                font-size: 0.875rem;
                border-radius: 4px;
                border: 1px solid ${ error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)" };
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
                transition: border-color 0.2s ease-in-out;
                box-sizing: border-box;
                outline: none;
              }
              .nepali-datepicker-input:focus {
                border-color: ${ error ? "#d32f2f" : "#1976d2" };
                box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.25);
              }
            `}</style>

            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                {error.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </>
  );
};

export default ReuseDatePickerSMV5;
