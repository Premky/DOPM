import React from 'react';
import { Box, Grid, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import UseBandiTotalCountACoffice from '../../../ReuseableComponents/UseBandiTotalCountACoffice';

const TotalGenderWiseCount = ({filters}) => {
    console.log(filters)
    const { totals, countLoading } = UseBandiTotalCountACoffice(filters);
    // console.log( totals );
    return (
        <Box>
            <Grid>
                <TableContainer>
                    <Table size='small' border='1'>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>कैदी पुरुष</b></TableCell>
                                <TableCell>{totals.kaidi_male}</TableCell>
                                <TableCell><b>थुनुवा पुरुष</b></TableCell>
                                <TableCell>{totals.thunuwa_male}</TableCell>
                                <TableCell><b>पुरुष संख्या</b></TableCell>
                                <TableCell>{totals.total_male}</TableCell>
                                <TableCell><b>६५ वर्ष माथिको संख्या</b></TableCell>
                                <TableCell>{totals.kaidi_male_65plus + totals.kaidi_female_65plus + totals.thunuwa_male_65plus + totals.thunuwa_female_65plus}</TableCell>
                                <TableCell><b>कैदी बालक</b></TableCell>
                                <TableCell>{totals.aashrit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>कैदी महिला</b></TableCell>
                                <TableCell>{totals.kaidi_female}</TableCell>
                                <TableCell><b>थुनुवा महिला</b></TableCell>
                                <TableCell>{totals.thunuwa_female}</TableCell>
                                <TableCell><b>महिला संख्या</b></TableCell>
                                <TableCell>{totals.total_female}</TableCell>
                                <TableCell><b>आश्रित बालबालिका</b></TableCell>
                                <TableCell>{totals.total_aashrit}</TableCell>
                                <TableCell><b>कैदी बालिका</b></TableCell>
                                <TableCell>{totals.aashrit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>कैदी अन्य</b></TableCell>
                                <TableCell>{totals.kaidi_other}</TableCell>
                                <TableCell><b>थुनुवा अन्य</b></TableCell>
                                <TableCell>{totals.thunuwa_other}</TableCell>
                                <TableCell><b>अन्य संख्या</b></TableCell>
                                <TableCell>{totals.total_other}</TableCell>
                                <TableCell><b></b></TableCell>
                                <TableCell>{totals.aashrit}</TableCell>
                                <TableCell><b></b></TableCell>
                                <TableCell>{totals.aashrit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><b>कुल कैदी</b></TableCell>
                                <TableCell>{totals.total_kaidi}</TableCell>
                                <TableCell><b>कुल थुनुवा</b></TableCell>
                                <TableCell>{totals.total_thunuwa}</TableCell>
                                <TableCell><b>कुल संख्या</b></TableCell>
                                <TableCell>{totals.total_kaidi + totals.total_thunuwa}</TableCell>
                                <TableCell><b>विदेशी संख्या</b></TableCell>
                                <TableCell>{totals.foreign_count}</TableCell>
                                <TableCell><b>थुनुवा बालक</b></TableCell>
                                <TableCell>{totals.aashrit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={8} sx={{ textAlign: 'center', verticalAlign: 'middle' }}><i>
                                    कुल कैदीबन्दीमा बालसुधार गृहका बालबालिकाहरु समावेश छैन ।
                                </i></TableCell>
                                <TableCell><b>थुनुवा बालिका</b></TableCell>
                                <TableCell>'बालिका'</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={8} sx={{ textAlign: 'center', verticalAlign: 'middle' }}><i>
                                   कैदी र बन्दीको संख्यामा बृद्ध र विदेशी समेत समावेश गरिएको छ ।
                                </i></TableCell>
                                <TableCell><b>सुधार गृहका जम्मा</b></TableCell>
                                <TableCell>'जम्मा'</TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>
            </Grid>
        </Box>
    );
};

export default TotalGenderWiseCount;