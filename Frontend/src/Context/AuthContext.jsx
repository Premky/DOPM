import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import axios from 'axios';
import { useBaseURL } from './BaseURLProvider';

const AuthContext = createContext();

// Initial state for authentication context
const initialState = {
    user: null,
    office_np: null,
    branch_np: null,
    office_id: null,
    is_online: null,
    valid: false,
};

// Reducer function to handle authentication actions
const authReducer = ( state, action ) => {
    switch ( action.type ) {
        case "LOGIN":
            return { ...state, ...action.payload, justLoggedIn: true };
        case "CLEAR_JUST_LOGGED_IN":
            return { ...state, justLoggedIn: false };
        case "LOGOUT":
            return initialState;
        default:
            return state;
    }
};

// AuthProvider component that provides authentication context to the app
export const AuthProvider = ( { children } ) => {
    const BASE_URL = useBaseURL();
    const [state, dispatch] = useReducer( authReducer, initialState );
    const [loading, setLoading] = useState( true );

    const fetchSession = async () => {
        try {
            const response = await axios.get( `${ BASE_URL }/auth/session`, { withCredentials: true } );
            if ( response.data.loggedIn ) {
                // console.log(response.data)
                const authData = {
                    user: response.data.user.username,
                    office_np: response.data.user.office_np,
                    office_id: response.data.user.office_id,
                    usertype_en: response.data.user.usertype_en,
                    usertype_np: response.data.user.usertype_np,
                    is_online: response.data.user.is_online,
                    valid: true,
                    justLoggedIn: true,
                };
                // console.log(authData)
                dispatch( { type: "LOGIN", payload:authData } );
            } else {
                dispatch( { type: "LOGOUT" } );
            }
        } catch ( error ) {
            dispatch( { type: "LOGOUT" } );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchSession(); // always run once on mount
    }, [] );


    useEffect( () => {
        if ( state.justLoggedIn ) {
            dispatch( { type: "CLEAR_JUST_LOGGED_IN" } );
        }
    }, [state.justLoggedIn] );


    useEffect( () => {
        if ( !state.valid ) return; // don't run inactivity timer if not logged in 

        let timeout;
        const resetTimer = () => {
            clearTimeout( timeout );
            timeout = setTimeout( () => {
                dispatch( { type: 'LOGOUT' } );
                axios.post( `${ BASE_URL }/auth/logout`, {}, { withCredentials: true } );
            }, 11 * 60 * 1000 ); // 11 minutes
        };

        //List of events that reset the timer
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach( event => window.addEventListener( event, resetTimer ) );
        resetTimer();
        return () => {
            clearTimeout( timeout );
            events.forEach( event => window.removeEventListener( event, resetTimer ) );
        };
    }, [state.valid, BASE_URL] );

    //For Logout Mark
    useEffect( () => {
        const interval = setInterval( () => {
            axios.post( `${ BASE_URL }/auth/login_ping`, {}, { withCredentials: true } );
        }, 60 * 1000 );
        return () => clearInterval( interval );
    }, [state.valid, BASE_URL] );


    return (
        <AuthContext.Provider value={{ state, dispatch, fetchSession, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication context in other components
export const useAuth = () => useContext( AuthContext );
