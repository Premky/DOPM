import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'


const FamilyTable = () => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}></Grid>
                <Grid item xs={12}>
                    कैदीबन्दीको पारिवारीको विवरणः
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table border={2}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">सि.नं.</TableCell>
                                    <TableCell align="center">नामथर</TableCell>
                                    <TableCell align="center">ठेगाना</TableCell>
                                    <TableCell align="center">सम्पर्क नं.</TableCell>
                                    <TableCell align="center">#</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="center"> </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    )
}

export default FamilyTable