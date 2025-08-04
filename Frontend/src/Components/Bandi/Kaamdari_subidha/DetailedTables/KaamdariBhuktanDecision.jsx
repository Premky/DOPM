import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BandiShortTable from "../../Tables/BandiShortTable";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { Button, Grid, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const KaamdariBhuktanDecision = () => {
  const BASE_URL = useBaseURL();
  const params = useParams();
  const subidha_id = params.id;

  const [bandies, setBandies] = useState(null);

  const fetchBandies = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/bandi/get_all_internal_admin`,
        {
          params: { subidha_id },
          withCredentials: true
        }
      );
      // console.log(subidha_id)
      setBandies(response.data.Result[0] || []);
      console.log(response.data.Result)
    } catch (error) {
      console.error("Failed to fetch bandies:", error);
    }
  };

  useEffect(() => {
    fetchBandies();
  }, [subidha_id]);

  return (
    <>
      <Grid container size={{ xs: 12 }}>
        <Grid size={{xs:12}}>
          <BandiShortTable bandi_id={bandies?.bandi_id} />
        </Grid>
        <Grid size={{xs:12, sm:6}}>
          <TableContainer>
            a;dslkf
          </TableContainer>
        </Grid>
      </Grid>

    </>
  );
};

export default KaamdariBhuktanDecision;
