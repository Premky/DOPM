import React from 'react';
import { Grid2 } from '@mui/material';
import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';

const BandiMaskebari = () => {
  return (
    <div>
      <Grid2 container>

      </Grid2>
      <Grid2 container>
        <TotalGenderWiseCount />
      </Grid2>
      <Grid2 container>
        <TotalCountOfficeWise />
      </Grid2>
    </div>
  );
};

export default BandiMaskebari;