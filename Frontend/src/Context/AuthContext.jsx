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
    valid: false,
};

// Reducer function to handle authentication actions
const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return { ...state, ...action.payload };
        case "LOGOUT":
            return initialState;
        default:
            return state;
    }
};

// AuthProvider component that provides authentication context to the app
export const AuthProvider = ({ children }) => {
    const BASE_URL = useBaseURL();
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/session`, { withCredentials: true });
            if (response.data.loggedIn) {
                const authData = {
                    user: response.data.user.username,
                    office_np: response.data.user.office_np,
                    office_id: response.data.user.office_id,
                    valid: true,
                };
                dispatch({ type: "LOGIN", payload: authData });
            } else {
                dispatch({ type: "LOGOUT" });
            }
        } catch (error) {
            dispatch({ type: "LOGOUT" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch, fetchSession, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access authentication context in other components
export const useAuth = () => useContext(AuthContext);
