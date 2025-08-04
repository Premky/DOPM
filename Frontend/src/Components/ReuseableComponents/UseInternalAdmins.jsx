// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const useInternalAdmins = () => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState([]);
  const [recordsLoading, setrecordsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/bandi/get_all_internal_admin`,{withCredentials:true});
        setRecords(response.data.Result || []);
      } catch (error) {
        console.error("Failed to fetch ranks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [BASE_URL]);

  return { records, recordsLoading };
};

export default useInternalAdmins;
