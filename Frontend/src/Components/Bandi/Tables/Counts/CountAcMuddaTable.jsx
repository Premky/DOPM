import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const CountAcMuddaTable = ({ records, totals, startDate, endDate }) => {
    // console.log(records)
    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow className="bg-primary">
                            <TableCell align="center" rowSpan={2}>सि.नं.</TableCell>
                            <TableCell align="center" rowSpan={2}>कार्यालय</TableCell>
                            <TableCell align="center" rowSpan={2}>मुद्दा</TableCell>
                            <TableCell align="center" colSpan={4}>जम्मा</TableCell>
                            <TableCell align="center" colSpan={3}>कैदी</TableCell>
                            <TableCell align="center" colSpan={3}>थुनुवा</TableCell>
                            <TableCell align="center" rowSpan={2}>आएको संख्या</TableCell>
                            <TableCell align="center" rowSpan={2}>छुटेको संख्या</TableCell>
                            <TableCell align="center" rowSpan={2}>कैफियत</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="center" className="bg-secondary">कैदी</TableCell>
                            <TableCell align="center" className="bg-secondary">थुनुवा</TableCell>
                            <TableCell align="center" className="bg-secondary">आश्रित</TableCell>
                            <TableCell align="center" className="bg-secondary fw-bold">जम्मा</TableCell>
                            <TableCell align="center" className="bg-secondary bg-gradient">पुरुष</TableCell>
                            <TableCell align="center" className="bg-secondary bg-gradient">महिला</TableCell>
                            <TableCell align="center" className="bg-secondary bg-gradient fw-bold">जम्मा</TableCell>
                            <TableCell align="center" className="bg-secondary">पुरुष</TableCell>
                            <TableCell align="center" className="bg-secondary">महिला</TableCell>
                            <TableCell align="center" className="bg-secondary fw-bold">जम्मा</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell>
                                    {/* Link to case details */}
                                    <Link to={`/bandi/details/${record.office_name}`}>
                                        {record.office_name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link to={`/bandi/details/${record.mudda_id}`}>
                                        {record.mudda_name}
                                    </Link>
                                </TableCell>
                                <TableCell align="center">
                                    <Link to={`/bandi/details/${record.mudda_id}/कैदी`}>
                                        {record.KaidiTotal}
                                    </Link>
                                </TableCell>
                                <TableCell align="center">
                                    <Link to={`/bandi/details/${record.mudda_id}/थुनुवा`}>
                                        {record.ThunuwaTotal}
                                    </Link>
                                </TableCell>
                                <TableCell align="center">
                                    {parseInt(record.Nabalak||0) + parseInt(record.Nabalika||0)}
                                </TableCell>
                                <TableCell align="center" className="fw-bold">
                                    {parseInt(record.ThunuwaTotal) + parseInt(record.KaidiTotal)}
                                </TableCell>
                                <TableCell align="center">{record.KaidiMale}</TableCell>
                                <TableCell align="center">{record.KaidiFemale}</TableCell>
                                <TableCell align="center" className="fw-bold">
                                    {parseInt(record.KaidiMale) + parseInt(record.KaidiFemale)}
                                </TableCell>
                                <TableCell align="center">{record.ThunuwaMale}</TableCell>
                                <TableCell align="center">{record.ThunuwaFemale}</TableCell>
                                <TableCell align="center" className="fw-bold">
                                    {parseInt(record.ThunuwaMale) + parseInt(record.ThunuwaFemale)}
                                </TableCell>
                                <TableCell align="center">
                                    <Link to={`/police/details/${record.CaseNameNP}/in/${startDate}/to/${endDate}`}>
                                        {record.TotalArrestedInDateRange}
                                    </Link>
                                </TableCell>
                                <TableCell align="center">{record.TotalReleasedInDateRange}</TableCell>
                            </TableRow>
                        ))}
                        {/* Totals row */}
                        <TableRow key="total">
                            <TableCell className="bg-primary fw-bold" colSpan={3}>जम्मा</TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {totals.KaidiTotal}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {totals.ThunuwaTotal}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {parseInt(totals.Nabalak) + parseInt(totals.Nabalika)}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {parseInt(totals.KaidiTotal) + parseInt(totals.ThunuwaTotal) + parseInt(totals.Nabalak) + parseInt(totals.Nabalika)}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">{totals.KaidiMale}</TableCell>
                            <TableCell align="center" className="bg-success fw-bold">{totals.KaidiFemale}</TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {parseInt(totals.KaidiMale) + parseInt(totals.KaidiFemale)}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">{totals.ThunuwaMale}</TableCell>
                            <TableCell align="center" className="bg-success fw-bold">{totals.ThunuwaFemale}</TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {parseInt(totals.ThunuwaMale) + parseInt(totals.ThunuwaFemale)}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {totals.SumOfArrestedInDateRange}
                            </TableCell>
                            <TableCell align="center" className="bg-success fw-bold">
                                {totals.SumOfReleasedInDateRange}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default CountAcMuddaTable;
