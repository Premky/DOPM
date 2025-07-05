import { Grid2, Table, TableCell, TableContainer, TableHead, TableBody, TableRow } from '@mui/material';
import React from 'react';

const TotalReleaseDetails = ( { releaseRecords } ) => {
    const getCount = ( gender, reasonId, period ) => {
        return (
            releaseRecords.find(
                r => r.gender === gender && r.reason_id === reasonId && r.period === period
            )?.count || 0
        );
    };

    const regular_this_month =
        ( releaseRecords[1]?.this_month?.Male || 0 ) +
        ( releaseRecords[1]?.this_month?.Female || 0 ) +
        ( releaseRecords[1]?.this_month?.Other || 0 ) +
        ( releaseRecords[2]?.this_month?.Male || 0 ) +
        ( releaseRecords[2]?.this_month?.Female || 0 ) +
        ( releaseRecords[2]?.this_month?.Other || 0 );
    const regular_till_last_month =
        ( releaseRecords[1]?.till_last_month?.Male || 0 ) +
        ( releaseRecords[1]?.till_last_month?.Female || 0 ) +
        ( releaseRecords[1]?.till_last_month?.Other || 0 ) +
        ( releaseRecords[2]?.till_last_month?.Male || 0 ) +
        ( releaseRecords[2]?.till_last_month?.Female || 0 ) +
        ( releaseRecords[2]?.till_last_month?.Other || 0 ) + regular_this_month;

    const kaam_this_month =
        ( releaseRecords[5]?.this_month?.Male || 0 ) +
        ( releaseRecords[5]?.this_month?.Female || 0 ) +
        ( releaseRecords[5]?.this_month?.Other || 0 )         
    const kaam_till_now =
        ( releaseRecords[5]?.till_last_month?.Male || 0 ) +
        ( releaseRecords[5]?.till_last_month?.Female || 0 ) +     
        ( releaseRecords[5]?.till_last_month?.Other || 0 ) + kaam_this_month;

    const mafi_this_month =
        ( releaseRecords[4]?.this_month?.Male || 0 ) +
        ( releaseRecords[4]?.this_month?.Female || 0 ) +
        ( releaseRecords[4]?.this_month?.Other || 0 )         
    const mafi_till_now =
        ( releaseRecords[4]?.till_last_month?.Male || 0 ) +
        ( releaseRecords[4]?.till_last_month?.Female || 0 ) +     
        ( releaseRecords[4]?.till_last_month?.Other || 0 ) + mafi_this_month;

    const this_month_155 =
        ( releaseRecords[4]?.this_month?.Male || 0 ) +
        ( releaseRecords[4]?.this_month?.Female || 0 ) +
        ( releaseRecords[4]?.this_month?.Other || 0 )         
    const till_now_155 =
        ( releaseRecords[4]?.till_last_month?.Male || 0 ) +
        ( releaseRecords[4]?.till_last_month?.Female || 0 ) +     
        ( releaseRecords[4]?.till_last_month?.Other || 0 ) + this_month_155;


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
                                <TableCell>{regular_till_last_month}</TableCell>
                                <TableCell>{regular_this_month}</TableCell>
                                <TableCell>{kaam_till_now}</TableCell>
                                <TableCell>{kaam_this_month}</TableCell>
                                <TableCell>{mafi_till_now}</TableCell>
                                <TableCell>{mafi_this_month}</TableCell>
                                <TableCell>{till_now_155}</TableCell>
                                <TableCell>{this_month_155}</TableCell>
                            </TableRow>                            
                        </TableBody>

                    </Table>
                </TableContainer>
            </Grid2>
        </div>
    );
};

export default TotalReleaseDetails;