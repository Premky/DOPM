// hooks/useBlockList.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useBlockList = () => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState([]);
  const [optrecords, setOptRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/public/prison_blocks`, {
        withCredentials: true,
      });

      const { Status, Result, Error } = res.data;

      if (Status && Array.isArray(Result)) {
        setRecords(Result);

        const formatted = Result.map((block) => ({
          label: block.block_name, // use correct field
          value: block.id,
        }));

        setOptRecords(formatted);
      } else {
        console.log(Error || "No records found");
        setRecords([]);
        setOptRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [BASE_URL]);

  return { records, optrecords, loading };
};

export default useBlockList;
