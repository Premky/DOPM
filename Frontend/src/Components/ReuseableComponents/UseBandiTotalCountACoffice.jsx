// hooks/useBandiRanks.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const UseBandiTotalCountACoffice = () => {
  const BASE_URL = useBaseURL();
  const [count, setCount] = useState([]);
  const [countLoading, setCountLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/bandi/get_office_wise_count`,{withCredentials:true});
        setCount(response.data.Result || []);
        console.log(response.data.Result)
      } catch (error) {
        console.error("Failed to fetch count:", error);
      } finally {
        setCountLoading(false);
      }
    };

    fetchRecords();
  }, [BASE_URL]);

    const totals = count.reduce((acc, curr) => {
    Object.keys(curr).forEach((key) => {
      if (typeof curr[key] === 'number') {
        acc[key] = (acc[key] || 0) + curr[key];
      }
    });
    return acc;
  }, {});


  return { count, countLoading, totals };
};

export default UseBandiTotalCountACoffice;
