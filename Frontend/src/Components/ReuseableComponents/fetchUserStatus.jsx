import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const useOnlineOffices = () => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState([]);
  const [optrecords, setOptRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/get_online_status`, {
          withCredentials: true,
        });
        const { success, data } = response.data;
        if (success && Array.isArray(data)) {
          setRecords(data);
          const formatted = data.map((item) => ({
            label: `${item.office_name} || ${item.is_online ? "Online" : "Offline"}`,
            value: item.office_id,
          }));
          setOptRecords(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch online offices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [BASE_URL]);

  return { records, optrecords, loading };
};

export default useOnlineOffices;
