import { Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

const PayroleLogTable = ({ records }) => {
  console.log("Records received in PayroleLogTable:", records);

  return (
    <div>
      <Grid2 container sx={{ marginTop: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>सि.नं.</TableCell>
                <TableCell>नामथर/ठेगाना</TableCell>
                <TableCell>मुद्दा</TableCell>
                <TableCell>हाजिर भएको मिति</TableCell>
                <TableCell>हाजिर हुने मिति</TableCell>
                {/* <TableCell></TableCell> */}
                <TableCell>कैफियत</TableCell>
                <TableCell>#</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records?.length > 0 ? (
                records.map((data, index) => (
                  <TableRow key={data.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{data.bandi_name}</TableCell>
                    <TableCell>{data.mudda_name}</TableCell>
                    <TableCell>{data.hajir_current_date}</TableCell>
                    <TableCell>{data.hajir_next_date}</TableCell>
                    {/* <TableCell>{data.payrole_reason}</TableCell> */}
                    <TableCell>{data.remark}</TableCell>
                    <TableCell>#</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    कुनै डेटा उपलब्ध छैन
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid2>
    </div>
  );
};

export default PayroleLogTable;
