import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReusableTable from '../../ReuseableComponents/ReuseTable';

const PayroleLogTable = ( { records } ) => {
  // console.log( "Records received in PayroleLogTable:", records );

  const columns = [
    { field: "payrole_id", headerName: "बैठक नं." },
    { field: "bandi_name", headerName: "बन्दिको नामथर" },
    { field: "mudda_name", headerName: "मुद्दा" },
    { field: "hajir_date", headerName: "हाजिर मिति" },
    { field: "next_hajir_date", headerName: "हाजिर हुने मिति" },
    { field: "hajir_remarks", headerName: "कैफियत" },
  ];

  const [rows, setRows] = useState( [] );

  useEffect( () => {
    setRows( records.map( rec => ( { ...rec, id: rec.id  } ) ) );
  }, [records] );

  return (
    <div>
      <Grid container sx={{ marginTop: 2 }}>
        <ReusableTable
          columns={columns}
          rows={rows}
        />
      </Grid>
    </div>
  );
};

export default PayroleLogTable;

