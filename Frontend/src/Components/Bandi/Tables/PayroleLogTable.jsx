import { Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

const PayroleLogTable = () => {
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
                <TableCell>ठेगाना</TableCell>
                <TableCell>हाजिर भएको मिति</TableCell>
                <TableCell>हाजिर हुने मिति</TableCell>
                <TableCell>हाजिर हुने कार्यालय</TableCell>
                <TableCell>अनुपस्थितिको कारण</TableCell>
                <TableCell>सुरु अदालतमा प्रतिवेदन पेश गरे/नगरेको</TableCell>
                <TableCell>आदेश भए नभएको</TableCell>
                <TableCell>कैफियत</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
      </Grid2>
    </div>
  );
};

export default PayroleLogTable;