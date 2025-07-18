import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { Box, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, TextField, Button } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL


const Login = () => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL
    // const BASE_URL = useApiBaseUrl();
    const BASE_URL = useBaseURL();
    const navigate = useNavigate();
    const { dispatch, fetchSession, state, loading } = useAuth();

    const [showPassword, setShowPassword] = useState( false );
    const [values, setValues] = useState( { username: '', password: '' } );
    const [error, setError] = useState( '' );

    if ( loading ) return <>Loading...</>;
    if ( state?.valid && !state.justLoggedIn) {
        return <Navigate to='/bandi' replace />;
    }


    const handleClickShowPassword = () => setShowPassword( ( prev ) => !prev );

    const handleLogin = async ( event ) => {
        event.preventDefault();

        try {
            const response = await axios.post( `${ BASE_URL }/auth/login`, values, { withCredentials: true } );

            Swal.fire( {
                title: "Logging in...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            } );

            if ( response.data.loginStatus ) {
                await fetchSession();
                // dispatch( { type: "LOGIN", payload:{ ...response.data, justLoggedIn:true }} );
                Swal.fire( { title: "Login Success", text: "Redirecting to Home", icon: "success", timer: 1000, showConfirmButton: false } );
                navigate( '/bandi' );
            } else {
                Swal.fire( { title: "Login Failed", text: response.data.error, icon: "error" } );
            }
        } catch ( error ) {
            const message = error.response?.data?.Error || 'Unexpected error occurred' ;
            setError( error.response?.data?.Error || 'Unexpected error occurred' );
            Swal.fire( { title: "Login Error", text: message, icon: "error" } );
            // Swal.fire( { title: "Login Error", text: error.message, icon: "error" } );
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3%' }}>
                <img src='/nepal_gov_logo.png' alt='Nepal Police Logo' height='120px' />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1%', color:'#fc3d03' }}>
                <h1> कारागार व्यवस्थापन विभाग:PMIS </h1>                
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="loginPage">

                <div className='p-3 rounded w-40 border loginForm'>
                    <form onSubmit={handleLogin} >
                        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                            <TextField id="username" label="Username" onChange={( e ) => setValues( { ...values, username: e.target.value } )} fullWidth />
                        </FormControl>
                        <br />
                        <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <OutlinedInput
                                id="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                onChange={( e ) => setValues( { ...values, password: e.target.value } )}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            /> <br />
                            <Button variant="contained" type="submit" fullWidth>Login</Button>
                        </FormControl>
                        <Toaster />
                    </form>
                </div>
            </Box>
        </>
    );
};

export default Login;
