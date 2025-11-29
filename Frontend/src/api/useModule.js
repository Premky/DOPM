import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

export const useModuleAPI = () => {
  const BASE_URL = useBaseURL(); // safe to call here
  const axiosInstance = axios.create({ baseURL: BASE_URL });

  const getModules = async () => {
    try {
      const response = await axiosInstance.get("/permission/modules",{withCredentials:true});
    //   console.log(response.data.result.result)
      return response.data.result.result;
    } catch (error) {
      console.error("Error fetching modules:", error);
      throw error;
    }
  };

  return { getModules };
};
