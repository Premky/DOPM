import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import { tableHeadStyle, tableTotalRowStyle } from '../../../../styles/tableheadStyle.jsx';



const TotalCountAc2Mudda = ( { muddawiseCount, muddawisetotal } ) => {
    return (
        <div>
            <Grid container>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <TableContainer sx={{ maxWidth: "100%", overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }} component={Paper}>
                        <Table size="small" stickyHeader sx={{ tableLayout: "fixed" }} border={1}>

                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{...tableHeadStyle}} rowSpan={2}>सि.नं.</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} rowSpan={2}>मुद्दाको विवरण</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} rowSpan={2}>कुल जम्मा</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} colSpan={2}>जम्मा</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} colSpan={2}>पुरुष</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} colSpan={2}>महिला</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} colSpan={2}>६५ वर्ष माथिका</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} colSpan={2}>फरार/फिर्ता</TableCell>
                                    <TableCell sx={{...tableHeadStyle}} rowSpan={2}>कैफियत</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 1}}>कैदी</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 1}}>थुनुवा</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>कैदी</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>थुनुवा</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>कैदी</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>थुनुवा</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>कैदी</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>थुनुवा</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>फरार</TableCell>
                                    <TableCell sx={{...tableHeadStyle, position: 'sticky', top: 30, zIndex: 2}}>फिर्ता</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray( muddawiseCount ) && muddawiseCount.map( ( item, index ) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell> {/* सि.नं. */}
                                        <TableCell>{item.mudda_name}</TableCell> {/* मुद्दा */}
                                        <TableCell>{item.Total}</TableCell>
                                        <TableCell>{item.KaidiTotal}</TableCell>
                                        <TableCell>{item.ThunuwaTotal}</TableCell>
                                        <TableCell>{item.KaidiMale}</TableCell>
                                        <TableCell>{item.ThunuwaMale}</TableCell>
                                        <TableCell>{item.KaidiFemale}</TableCell>
                                        <TableCell>{item.ThunuwaFemale}</TableCell>
                                        <TableCell>{item.KaidiAgeAbove65}</TableCell>
                                        <TableCell>{item.ThunuwaAgeAbove65}</TableCell>
                                        <TableCell>{item.totalEscaped}</TableCell>
                                        <TableCell>{item.totalReturned}</TableCell>
                                        <TableCell>
                                            {item.country_name && !item.country_name.startsWith( "नेपाल" ) && item.country_name}
                                        </TableCell>

                                    </TableRow>
                                ) )}
                                <TableRow>
                                    <TableCell sx={{...tableTotalRowStyle}} colSpan={2}>जम्मा</TableCell> {/* मुद्दा */}
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.Total}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.KaidiTotal}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.ThunuwaTotal}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.KaidiMale}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.ThunuwaMale}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.KaidiFemale}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.ThunuwaFemale}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.KaidiAgeAbove65}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.ThunuwaAgeAbove65}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.totalEscaped}</TableCell>
                                    <TableCell sx={{...tableTotalRowStyle}}>{muddawisetotal.totalReturned}</TableCell>

                                </TableRow>

                            </TableBody>

                        </Table>
                    </TableContainer>
                </Box>
            </Grid>
        </div>
    );
};

export default TotalCountAc2Mudda;