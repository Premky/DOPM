// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useAllEmployees = () => {
  const BASE_URL = useBaseURL();

  const [records, setRecords] = useState([]);
  const [optrecords, setOptRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/emp/list`,
        { withCredentials: true }
      );

      // console.log("EMP RESPONSE:", response.data);

      const { success, data } = response.data;

      if (success && Array.isArray(data)) {
        setRecords(data);

        const formatted = data.map((emp) => ({
          label: `${emp.sanket_no} ${emp.name_in_nepali}`,
          value: emp.id, // ✅ better than sanket_no
        }));

        setOptRecords(formatted);
      } else {
        console.warn("No employee data found");
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [BASE_URL]);

  return {
    records,
    optrecords,
    loading,
    refetch: fetchRecords,
  };
};

export default useAllEmployees;
