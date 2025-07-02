import { Box, Grid2, Paper, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

const TotalCountAc2Mudda = () => {
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
                                <TableRow>
                                    <TableCell>सि.नं.</TableCell>
                                    <TableCell>मुद्दा</TableCell>
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

                        </Table>
                    </TableContainer>
                </Box>
            </Grid2>
        </div>
    );
};

export default TotalCountAc2Mudda;