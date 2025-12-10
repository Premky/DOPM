import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

export const useRoleAPI = () => {
  const BASE_URL = useBaseURL();
  const axiosInstance = axios.create({ baseURL: BASE_URL });

  const getRoles = async () => {
    try {
      const response = await axiosInstance.get("/permission/roles", { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  };

  const assignRolePermissions = async (roleId, permissionsIds) => {
    try {
      // FIXED ↓↓↓
      const response = await axiosInstance.post(
        `/permission/roles/${roleId}/permissions`,
        { permissions: permissionsIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error Assigning Role Permissions:", error);
      throw error;
    }
  };

  return { getRoles, assignRolePermissions };
};
