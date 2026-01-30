import React, { useState, useEffect } from 'react';
import { InputLabel, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import NepaliDate from 'nepali-datetime';
import Swal from 'sweetalert2';

const ReuseDateField = ( { name, label, required, control, error, placeholder, onChange: propsOnChange, defaultValue, maxDate } ) => {
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    // console.log(defaultValue)
    return (
        <>
            <InputLabel id={name}>
                {label}
                {required && <span style={{ color: 'red' }}>*</span>}
            </InputLabel>

            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue} // Provide a default value

                rules={{
                    ...( required && {
                        required: {
                            value: true,
                            message: 'यो फिल्ड अनिवार्य छ',
                        },
                    } ),
                    validate: ( value ) => {
                        if ( !value ) return true; // Skip pattern check if empty (and not required)
                        const pattern = /^\d{4}-\d{2}-\d{2}$/;
                        if ( !pattern.test( value ) ) {
                            return pattern.test( value ) || 'मिति YYYY-MM-DD ढाँचामा हुनुपर्छ';
                        }
                        // check max date: 
                        // if ( maxDate ) {
                        //     const inputDate = new Date( value );
                        //     const limitDate = new Date( maxDate );
                        //     if ( inputDate > limitDate ) {
                        //         return `यो मिति आज(${ maxDate }) भन्दा ठुलो हुनु हुँदैन ;`;
                        //     }
                        // }
                        return true;
                    },
                }}

                render={( { field: { onChange, onBlur, value, ref } } ) => {
                    const [formattedValue, setFormattedValue] = useState( value || "" );

                    useEffect( () => {
                        setFormattedValue( value || "" ); // Sync with external changes
                    }, [value] );

                    const handleInputChange = ( e ) => {
                        const raw = e.target.value.replace( /[^0-9]/g, "" );
                        let formatted = raw;

                        if ( raw.length > 4 ) {
                            formatted = `${ raw.slice( 0, 4 ) }-${ raw.slice( 4, 6 ) }`;
                        }
                        if ( raw.length > 6 ) {
                            formatted = `${ raw.slice( 0, 4 ) }-${ raw.slice( 4, 6 ) }-${ raw.slice( 6, 8 ) }`;
                        }

                        formatted = formatted.slice( 0, 10 );

                        setFormattedValue( formatted );
                        onChange( formatted );
                        propsOnChange?.( formatted );
                    };
                    const handleBlur = () => {
                        if ( !formattedValue || formattedValue.length !== 10 ) return;

                        let [y, m, d] = formattedValue.split( "-" ).map( Number );

                        if ( m < 1 ) m = 1;
                        if ( m > 12 ) m = 12;

                        if ( d < 1 ) d = 1;
                        if ( d > 32 ) d = 32;

                        let fixed = `${ y }-${ String( m ).padStart( 2, "0" ) }-${ String( d ).padStart( 2, "0" ) }`;

                        let limitDate = maxDate;
                        if ( !limitDate ) limitDate = "9999-12-32";
                        else if ( limitDate === "today" ) limitDate = formattedDateNp;

                        if ( fixed > limitDate ) {
                            Swal.fire( {
                                // title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
                                title: `यो विवरण मान्य छैन !`,
                                text: `अघिल्लो ${ label } प्रविष्ट गर्ने सुविधा छैन। कृपया ${ label } सच्चयाउनु होला ।`,
                                icon: 'error',
                                draggable: true
                            } );
                            fixed = limitDate;
                        };

                        setFormattedValue( fixed );
                        onChange( fixed );
                    };



                    const handleInputChange1 = ( e ) => {
                        let maxYear, maxMonth, maxDay;
                        if ( maxDate === null || maxDate === "" || maxDate === undefined ) {
                            maxDate = "9999-12-32";
                        } else if ( maxDate === 'today' ) {
                            maxDate = formattedDateNp;
                        } else {
                            maxDate = maxDate;
                        }
                        [maxYear, maxMonth, maxDay] = maxDate.split( "-" ).map( Number );
                        // console.log( maxYear, maxMonth, maxDay );

                        const inputValue = e.target.value.replace( /[^0-9]/g, "" ); // Allow only numbers
                        let formatted = inputValue;


                        if ( inputValue.length > 4 ) {
                            const year = inputValue.slice( 0, 4 );
                            const month = inputValue.slice( 4, 6 );
                            if ( maxYear >= year ) {
                                formatted = `${ year }`;
                            }
                            else {
                                return;
                            }
                            if ( maxMonth >= month && maxYear >= year ) {
                                formatted = `${ year }-${ month }`;
                            }
                            else {
                                return;
                            }

                        }

                        if ( inputValue.length > 6 ) {
                            const year = inputValue.slice( 0, 4 );
                            let month = inputValue.slice( 4, 6 );
                            let day = inputValue.slice( 6, 8 );

                            // Validate month
                            if ( parseInt( month, 10 ) >= 12 ) {
                                month = "12";
                            }
                            // Validate day
                            if ( parseInt( day, 10 ) >= 32 ) {
                                day = "32";
                            }

                            if ( maxYear >= year ) {
                                formatted = `${ year }`;
                            }
                            else {
                                return;
                            }

                            if ( maxMonth >= month && maxYear >= year ) {
                                formatted = `${ year }-${ month }`;
                            }
                            else {
                                return;
                            }

                            if ( maxDay >= day && maxMonth >= month && maxYear >= year ) {
                                formatted = `${ year }-${ month }-${ day }`;
                            }
                            else {
                                return;
                            }

                        }

                        formatted = formatted.slice( 0, 10 ); // Limit to yyyy-mm-dd

                        setFormattedValue( formatted );
                        onChange( formatted ); // internal RHF update
                        if ( typeof propsOnChange === 'function' ) {
                            propsOnChange( formatted ); // external prop callback
                        }
                    };

                    return (
                        <TextField
                            inputRef={ref}
                            id={name}
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!error}
                            helperText={error?.message || ""}
                            required={required}
                            placeholder={defaultValue || placeholder || "YYYY-MM-DD"}
                            value={defaultValue || formattedValue}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            inputProps={{ maxLength: 10 }}
                        />
                    );
                }}
            />
        </>
    );
};

export default ReuseDateField;
