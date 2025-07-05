import { Grid2, Table, TableCell, TableContainer, TableHead, TableBody, TableRow } from '@mui/material';
import React from 'react';

const TotalReleaseDetails = ( { totals } ) => {
    
    



    return (
        <div>
            <Grid2 container>
            </Grid2>
            <Grid2 container>
                <TableContainer>
                    <Table border='1' size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2}>अदालतको आदेश वा नियमित छुट</TableCell>
                                <TableCell colSpan={2}>कामदारी सुविधा पाएका</TableCell>
                                <TableCell colSpan={2}>माफि मिनाहा पाएका छुट</TableCell>
                                <TableCell colSpan={2}>मुलुकी फौजदारी कार्यविधीको दफा १५५</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>हाल सम्मको</TableCell>
                                <TableCell>यो महिनाको</TableCell>
                                <TableCell>हाल सम्मको</TableCell>
                                <TableCell>यो महिनाको</TableCell>
                                <TableCell>हाल सम्मको</TableCell>
                                <TableCell>यो महिनाको</TableCell>
                                <TableCell>हाल सम्मको</TableCell>
                                <TableCell>यो महिनाको</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{totals.regular_till_last_month}</TableCell>
                                <TableCell>{totals.regular_this_month}</TableCell>
                                <TableCell>{totals.kaam_till_now}</TableCell>
                                <TableCell>{totals.kaam_this_month}</TableCell>
                                <TableCell>{totals.mafi_till_now}</TableCell>
                                <TableCell>{totals.mafi_this_month}</TableCell>
                                <TableCell>{totals.till_now_155}</TableCell>
                                <TableCell>{totals.this_month_155}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid2>
        </div>
    );
};

export default TotalReleaseDetails;