import React, { useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import {useDebounce} from 'use-debounce';
import TotalGenderWiseCount from '../Tables/ForMaskebari/TotalGenderWiseCount';
import TotalCountOfficeWise from '../Tables/ForMaskebari/TotalCountOfficeWise';

import { MaskebariExport } from '../Exports/ExcelMaskebariCount';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import { useForm } from 'react-hook-form';
import ReuseDateField from '../../ReuseableComponents/ReuseDateField';
import { useAuth } from '../../../Context/AuthContext';
//Export data to Excel
const exportMaskebari = async () => {
  await exportToExcel( releasedCounts, records, totals, foreignrecords, foreignTotals, fy, fm );
};

const BandiMaskebari = () => {
  const { control, watch } = useForm();
  const { state: authState } = useAuth();

  //Watch Variables//
    const searchKaragarOffice = watch('karagar_office');
    const searchStartDate = watch('start_date');
    const searchEndDate = watch('end_date');

    //decounced Variables, so update only happens after given interval of time
    const [debounceKaragarOffice] = useDebounce(searchKaragarOffice, 100)
    const [debounceStartDate] = useDebounce(searchStartDate, 300)
    const [deobounceEndDate] = useDebounce(searchEndDate, 300)

    // const filters={searchKaragarOffice, searchStartDate, searchEndDate}
    const filters = useMemo(()=>({
      searchKaragarOffice:debounceKaragarOffice,
      searchStartDate:debounceStartDate, 
      searchEndDate:deobounceEndDate
    }),[debounceKaragarOffice, debounceStartDate, deobounceEndDate])
    
  return (
    <Box>
      <form>
        <Grid size={{ xs: 12, md: 12, sm: 12 }} spacing={2} container>
          {(authState.office_id == 0 || authState.office_id == 0) && (
            <Grid size={{ xs: 4 }}>
              <ReuseKaragarOffice
                name='karagar_office'
                control={control}
                label='कारागार कार्यालय'
              />
            </Grid>
          )}
          <Grid size={{ xs: 4 }}>
            <ReuseDateField
              name='start_date'
              control={control}
              label='सुरु मिति'
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <ReuseDateField
              name='end_date'
              control={control}
              label='अन्तिम मिति'
            />
          </Grid>
        </Grid>
      </form>
      <Grid container>
        <TotalGenderWiseCount filters={filters}/>
      </Grid>
      <Grid container>
        <TotalCountOfficeWise filters={filters}/>
      </Grid>
    </Box>
  );
};

export default BandiMaskebari;