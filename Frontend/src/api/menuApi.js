// src/api/menuApi.js
import axios from "axios";
import { useBaseURL } from "../Context/BaseURLProvider";

export async function getUserMenus() {
    const BASE_URL = useBaseURL();
  try {
    const res = await axios.post(
      `${ BASE_URL }/auth/get_menus`,
      {},
      { withCredentials: true }
    );

    return res.data?.menus || []; // adjust based on your backend response
  } catch (err) {
    console.error("Failed to load menus", err);
    return [];
  }
}
