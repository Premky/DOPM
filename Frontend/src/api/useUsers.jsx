import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

export const useUserAPI = () => {
  const BASE_URL = useBaseURL();
  const axiosInstance = axios.create( { baseURL: BASE_URL } );
  /**
   * Fetch all users
   * Returns array of { id, username, permissions: [...] }
   */
  const getUsers = async () => {
    try {
      const response = await axiosInstance.get( "auth/get_users", { withCredentials: true } );
      return response.data; // assume backend returns { result: [...] }
    } catch ( error ) {
      console.error( "Error fetching users:", error );
      throw error;
    }
  };

  /**
   * Assign multiple permissions to a user
   * @param {number} userId - User ID
   * @param {array} permissionIds - Array of permission IDs
   */
  const assignUserPermissions = async ( userId, permissionIds ) => {
    try {
      const response = await axiosInstance.post(
        `/users/${ userId }/permissions`,
        { permissions: permissionIds },
        { withCredentials: true }
      );
      return response.data;
    } catch ( error ) {
      console.error( "Error assigning user permissions:", error );
      throw error;
    }
  };

  return { getUsers, assignUserPermissions };
};
