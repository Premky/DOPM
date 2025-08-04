// hooks/useBandiRanks.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const useBandiRanks = () => {
  const BASE_URL = useBaseURL();
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/public/get_bandi_ranks`);
        setRanks(response.data.Result || []);
      } catch (error) {
        console.error("Failed to fetch ranks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, [BASE_URL]);

  return { ranks, loading };
};

export default useBandiRanks;
