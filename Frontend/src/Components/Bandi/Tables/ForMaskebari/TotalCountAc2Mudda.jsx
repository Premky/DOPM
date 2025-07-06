import { Box, Grid2, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

const TotalCountAc2Mudda = ( { muddawiseCount, muddawisetotal } ) => {
    return (
        <div>
            <Grid2 container>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <TableContainer component={Paper}>
                        <Table size='small' border={1}>

                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2}>सि.नं.</TableCell>
                                    <TableCell rowSpan={2}>मुद्दाको विवरण</TableCell>
                                    <TableCell rowSpan={2}>कुल जम्मा</TableCell>
                                    <TableCell colSpan={2}>जम्मा</TableCell>
                                    <TableCell colSpan={2}>पुरुष</TableCell>
                                    <TableCell colSpan={2}>महिला</TableCell>
                                    <TableCell colSpan={2}>६५ वर्ष माथिका</TableCell>
                                    <TableCell rowSpan={2}>कैफियत</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>कैदी</TableCell>
                                    <TableCell>थुनुवा</TableCell>
                                    <TableCell>कैदी</TableCell>
                                    <TableCell>थुनुवा</TableCell>
                                    <TableCell>कैदी</TableCell>
                                    <TableCell>थुनुवा</TableCell>
                                    <TableCell>कैदी</TableCell>
                                    <TableCell>थुनुवा</TableCell>
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
                                        <TableCell></TableCell>
                                    </TableRow>
                                ) )}
                                <TableRow>
                                    <TableCell colSpan={2}>जम्मा</TableCell> {/* मुद्दा */}
                                    <TableCell>{muddawisetotal.Total}</TableCell>
                                    <TableCell>{muddawisetotal.KaidiTotal}</TableCell>
                                    <TableCell>{muddawisetotal.ThunuwaTotal}</TableCell>
                                    <TableCell>{muddawisetotal.KaidiMale}</TableCell>
                                    <TableCell>{muddawisetotal.ThunuwaMale}</TableCell>
                                    <TableCell>{muddawisetotal.KaidiFemale}</TableCell>
                                    <TableCell>{muddawisetotal.ThunuwaFemale}</TableCell>
                                    <TableCell>{muddawisetotal.KaidiAgeAbove65}</TableCell>
                                    <TableCell>{muddawisetotal.ThunuwaAgeAbove65}</TableCell>
                                    
                                </TableRow>

                            </TableBody>

                        </Table>
                    </TableContainer>
                </Box>
            </Grid2>
        </div>
    );
};

export default TotalCountAc2Mudda;