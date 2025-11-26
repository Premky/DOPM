// src/hooks/useAxios.js
import { useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useBaseURL } from "../Context/BaseURLProvider";

export const useAxios = () => {
  const BASE_URL = useBaseURL(); // get base URL dynamically
  console.log(BASE_URL)
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: baseURL.replace(/\/api\/?$/, "") || "http://localhost:3003",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Global response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          Swal.fire(
            "Access Denied!",
            "You are not allowed to access this page or perform this action.",
            "error"
          );
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseURL]);

  return api;
};
