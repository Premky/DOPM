
// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const fetchTOtalofAllFields = ( bandi_id ) => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState( [] );
  const [optrecords, setOptRecords] = useState( [] );
  const [loading, setLoading] = useState( true );

  useEffect(() => {
  if (!bandi_id) return;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/bandi/get_total_of_all_maskebari_fields/${bandi_id}`, {
        withCredentials: true,
      });

      const { Status, Result, Error } = response.data;
      if (Status) {
        if (Array.isArray(Result)) {
          const formatted = Result.map((opt) => ({
            label: opt.reasons_np,
            value: opt.id,
          }));
          setOptRecords(formatted);
          setRecords(Result);
          console.log(records)
        } else {
          console.log('Expected array but got object');
        }
      } else {
        console.log(Error || 'Failed to fetch records');
      }
    } catch (error) {
      console.error('Failed to fetch payrole log:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchRecords();
}, [BASE_URL, bandi_id]);
  return { records, optrecords, loading };
};

export default fetchTOtalofAllFields;
