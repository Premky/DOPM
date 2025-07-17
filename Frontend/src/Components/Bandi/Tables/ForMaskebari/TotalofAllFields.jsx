import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import fetchTOtalofAllFields from '../../../ReuseableComponents/fetchTotalofAllFields';

const TotalofAllFields = () => {
    const {records:totals, loading:totoalsLoading}=fetchTOtalofAllFields();
    // console.log(totals)
    return (
        <div>
            
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <TableContainer>
                        <Table border={1} size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>सि.नं.</TableCell>
                                    <TableCell>विवरण</TableCell>
                                    <TableCell>पुरुष</TableCell>
                                    <TableCell>महिला</TableCell>
                                    <TableCell>जम्मा</TableCell>
                                    <TableCell>कैफियत</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>१</TableCell>
                                    <TableCell>अघिल्लो महिनाको संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>२</TableCell>
                                    <TableCell>यस महिनाको थप संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{totals.this_month_added}</TableCell>
                                    <TableCell></TableCell>

                                </TableRow>
                                <TableRow>
                                    <TableCell>३</TableCell>
                                    <TableCell>यस महिनामा छुटेको संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>

                                </TableRow>
                                <TableRow>
                                    <TableCell>४</TableCell>
                                    <TableCell>यस महिनामा सरुवा भएको संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{totals.this_month_active}</TableCell>
                                    <TableCell></TableCell>

                                </TableRow>
                                <TableCell>५</TableCell>
                                <TableCell>यस महिनामा मृत्यु भएको संख्या</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>{totals.this_month_dead}</TableCell>
                                <TableCell></TableCell>
                                <TableRow>
                                    <TableCell>६</TableCell>
                                    <TableCell>यस महिनामा कायम रहेको कैदीबन्दी संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>

                                </TableRow>
                                <TableRow>
                                    <TableCell>७</TableCell>
                                    <TableCell>हालको आश्रित बालबालिकाको संख्या</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>{totals.this_month_dependent}</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>जम्माः</TableCell>
                                    <TableCell>जम्माः</TableCell>
                                    <TableCell>जम्माः</TableCell>
                                    <TableCell>जम्माः</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            
        </div>
    );
};

export default TotalofAllFields;