import React from 'react';
import { Grid } from '@mui/material';
import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';

import { MaskebariExport } from '../Exports/ExcelMaskebariCount';

//Export data to Excel
const exportMaskebari = async()=>{
   await exportToExcel(releasedCounts, records, totals, foreignrecords, foreignTotals, fy, fm);
}

const BandiMaskebari = () => {
  return (
    <div>
      <Grid container>

      </Grid>
      <Grid container>
        <TotalGenderWiseCount />
      </Grid>
      <Grid container>
        <TotalCountOfficeWise />
      </Grid>
    </div>
  );
};

export default BandiMaskebari;