import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

// src/hooks/useUserMenus.js

export const useUserMenus = () => {
    const BASE_URL = useBaseURL();
    const axiosInstance = axios.create( { baseURL: BASE_URL } );
    const getUserMenus = async () => {
        try {
            const res = await axiosInstance.get( "/permission/user_menus" );
            return res.data.result;
        } catch ( err ) {
            console.error( "Error fetching user menus:", err );
            return [];
        }
    };

    return { getUserMenus };
};
