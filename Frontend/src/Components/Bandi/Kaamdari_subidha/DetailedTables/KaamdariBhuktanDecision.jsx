import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'

import BandiShortTable from '../../Tables/BandiShortTable';

const KaamdariBhuktanDecision = () => {
  const params = useParams();
  // Prefer the passed prop, fallback to param
  // const subidha_id = subidha_no ? subidha_no : params.id;
  const subidha_id = params.id;

  // console.log((subidha_id))
  const [bandies, setBandies] = useState([]);
  const fetchBandies = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/bandi/get_all_internal_admin`,
        {
          params: { subidha_id },
          withCredentials: true
        }
      );
      console.log('kajdsfl')
      setBandies(response.data.Result || []);
      console.log(response.data.Result)
    } catch (error) {
      console.error("Failed to fetch bandies:", error);
    }
  };

  useEffect(() => {
    fetchBandies();
  });


  return (
    <>
      {bandies}
      {/* <BandiShortTable bandi_id={subidha_id} /> */}
    </>
  )
}

export default KaamdariBhuktanDecision