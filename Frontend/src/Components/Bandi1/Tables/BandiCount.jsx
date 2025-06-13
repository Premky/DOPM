import React from 'react'
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
    FormControl, Container, Select, InputLabel,
    MenuItem
} from '@mui/material';
const CountryWiseReport = ({ records, totals, type }) => {
    return (
        <>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={20}>
                            {`मुद्दा अनुसारको ${type === 'nepali' ? 'स्वदेशी' : 'विदेशी'} कैदीबन्दीहरुको संख्याः`}
                        </TableCell>

                    </TableRow>
                    <TableRow className='bg-primary bg-gradient'>
                        <TableCell align="center" rowSpan={2}>सि.नं.</TableCell>
                        <TableCell align="center" rowSpan={2}>मुद्दा</TableCell>
                        <TableCell align="center" colSpan={3}>जम्मा</TableCell>
                        <TableCell align="center" colSpan={2}>पुरुष</TableCell>
                        <TableCell align="center" colSpan={2}>महिला</TableCell>
                        {totals.TotalAashrit > 0 && <TableCell align="center" colSpan={2}>आश्रित</TableCell>}
                        {totals.TotalNabalkrNabalik > 0 && <TableCell align="center" colSpan={2}>नाबालक/नाबालिका</TableCell>}
                        <TableCell align="center" colSpan={2}>६५ वर्ष माथिका</TableCell>
                        <TableCell align="center" rowSpan={2}>कैफियत</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center" className='bg-secondary'>कैदी</TableCell>
                        <TableCell align="center" className='bg-secondary'>थुनुवा</TableCell>
                        <TableCell align="center" className='bg-secondary fw-bold'>जम्मा</TableCell>
                        <TableCell align="center" className='bg-secondary bg-gradient'>कैदी</TableCell>
                        <TableCell align="center" className='bg-secondary bg-gradient'>थुनुवा</TableCell>
                        <TableCell align="center" className='bg-secondary'>कैदी</TableCell>
                        <TableCell align="center" className='bg-secondary'>थुनुवा</TableCell>
                        {totals.TotalAashrit > 0 && <>
                            <TableCell align="center" className='bg-secondary bg-gradient'>नाबालक</TableCell>
                            <TableCell align="center" className='bg-secondary bg-gradient'>नाबालिका</TableCell>
                        </>}
                        {totals.TotalNabalkrNabalik > 0 && <>
                            <TableCell align="center" className='bg-secondary bg-gradient'>कैदी</TableCell>
                            <TableCell align="center" className='bg-secondary bg-gradient'>थुनुवा</TableCell>
                        </>}
                        <TableCell align="center" className='bg-secondary'>कैदी</TableCell>
                        <TableCell align="center" className='bg-secondary'>थुनुवा</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {records.map((record, index) => (
                        <TableRow key={index}>
                            <TableCell align='center'>{index + 1}</TableCell>
                            <TableCell>{record.CaseNameNP}</TableCell>
                            <TableCell align='center'>{record.KaidiTotal}</TableCell>
                            <TableCell align='center'>{record.ThunuwaTotal}</TableCell>
                            <TableCell align='center' className='fw-bold'>{parseInt(record.ThunuwaTotal) + parseInt(record.KaidiTotal)}</TableCell>
                            <TableCell align='center' className='bg-gradient'>{record.KaidiMale}</TableCell>
                            <TableCell align='center' className='bg-gradient'>{record.ThunuwaMale}</TableCell>
                            <TableCell align='center'>{record.KaidiFemale}</TableCell>
                            <TableCell align='center'>{record.ThunuwaFemale}</TableCell>
                            {totals.TotalAashrit > 0 &&
                                <><TableCell align='center' className='bg-gradient'>{record.Maashrit}</TableCell>
                                    <TableCell align='center' className='bg-gradient'>{record.Faashrit}</TableCell>
                                </>}
                            {totals.TotalNabalkTotalAashritrNabalik > 0 &&
                                <><TableCell align='center' className='bg-gradient'>{record.KaidiNabalak}</TableCell>
                                    <TableCell align='center' className='bg-gradient'>{record.ThunuwaNabalak}</TableCell>
                                </>}


                            <TableCell align='center'>{record.KaidiAgeAbove65}</TableCell>
                            <TableCell align='center'>{record.ThunuwaAgeAbove65}</TableCell>
                            <TableCell align='center'>{record.CountryName || ''}</TableCell>
                        </TableRow>
                    ))}
                    <TableRow key='total' >
                        <TableCell className='bg-primary fw-bold' colSpan={2}>जम्मा</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.KaidiTotal}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.ThunuwaTotal}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{parseInt(totals.KaidiTotal) + parseInt(totals.ThunuwaTotal)}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.KaidiMale}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.ThunuwaMale}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.KaidiFemale}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.ThunuwaFemale}</TableCell>
                        {totals.TotalAashrit > 0 && <>
                            <TableCell align='center' className='bg-success fw-bold'>{totals.Maashrit}</TableCell>
                            <TableCell align='center' className='bg-success fw-bold'>{totals.Faashrit}</TableCell>
                        </>}
                        {
                            totals.TotalNabalkrNabalik > 0 && <>
                                <TableCell align='center' className='bg-success fw-bold'>{totals.KaidiNabalak}</TableCell>
                                <TableCell align='center' className='bg-success fw-bold'>{totals.ThunuwaNabalak}</TableCell>
                            </>}
                        <TableCell align='center' className='bg-success fw-bold'>{totals.KaidiAgeAbove65}</TableCell>
                        <TableCell align='center' className='bg-success fw-bold'>{totals.ThunuwaAgeAbove65}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    )
}

export default CountryWiseReport