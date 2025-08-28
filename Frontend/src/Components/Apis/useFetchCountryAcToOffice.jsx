import axios from "axios";
import { useEffect, useState } from "react";
import { useBaseURL } from "../../Context/BaseURLProvider";

const useFetchCountryAcToOffice = () => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState([]);
  const [optrecords, setOptRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/public/get_countries_ac_to_office`,
        { withCredentials: true }
      );
      const { Status, Result, Error } = response.data;

      if (Status && Array.isArray(Result)) {
        // Format for dropdowns if needed
        const formatted = Result.map((opt) => ({
          label: opt.country_name_np,
          value: opt.id,
        }));

        setOptRecords(formatted);
        setRecords(Result);
      } else {
        console.log("No records found");
      }
    } catch (error) {
      console.error("❌ Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, [BASE_URL]);

  return { records, optrecords, loading, refetch: fetchCountries };
};

export default useFetchCountryAcToOffice;
