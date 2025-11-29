import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

/**
 * Custom hook to provide permission APIs with dynamic baseURL
 */
export const usePermissionAPI = () => {
  const BASE_URL = useBaseURL();
  const axiosInstance = axios.create({ baseURL: BASE_URL });

  const getPermissions = async () => {
    try {
      const res = await axiosInstance.get("/permission/permissions",{withCredentials:true});
      return res.data;
    } catch (err) {
      console.error("Error fetching permissions:", err);
      throw err;
    }
  };

  const createPermission = async (data) => {
    try {
      const res = await axiosInstance.post("/permission/permissions", data);
      return res.data;
    } catch (err) {
      console.error("Error creating permission:", err);
      throw err;
    }
  };

  const deletePermission = async (id) => {
    try {
      const res = await axiosInstance.delete(`/permission/permissions/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting permission:", err);
      throw err;
    }
  };

  return { getPermissions, createPermission, deletePermission };
};
