import React from 'react';
import { Box, Button, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, Paper } from '@mui/material';

import UseBandiTotalCountACoffice from '../../../ReuseableComponents/UseBandiTotalCountACoffice';
import fetchUserStatus from '../../../ReuseableComponents/fetchUserStatus';
import { useAuth } from '../../../../Context/AuthContext';
import exportOfficeWiseMaskebariExcel from '../../Exports/ExportOfficeWiseMaskebariExcel';
import { Helmet } from 'react-helmet';
import { tableHead2ndRowStyle, tableHeadStyle, tableTotalRowStyle } from '../../../../styles/tableheadStyle';
// import exportCombinedGenderAndOfficeCountExcel from '../../Exports/ExportCombinedGenderAndOfficeCountExcel';
const TotalCountOfficeWise = ( { filters } ) => {
    const { state } = useAuth();
    const onlineStatus = state.is_online;

    const { count, countLoading } = UseBandiTotalCountACoffice( filters );
    const { records: loginStatus, loading: loginLoading } = fetchUserStatus();

    const onlineOfficeIds = new Set(
        loginStatus
            ?.filter( ( user ) => user.is_online === 1 )
            .map( ( user ) => user.office_id )
    );
    // console.log( count );
    const hanldeExport = () => {
        exportOfficeWiseMaskebariExcel( count, onlineOfficeIds );
        // exportCombinedGenderAndOfficeCountExcel(count, onlineOfficeIds)
    };
    // console.log(state)
    // console.log(onlineStatus)

    const tableheadstyle = {
        textAlign: 'center', verticalAlign: 'middle', backgroundColor: 'teal'
    };
    // console.log(loginStatus)
    //For Bottom Totals: 
    const totals = count.reduce(
        ( acc, data ) => {
            acc.totalKaidiMale += data.kaidi_male || 0;
            acc.totalKaidiFemale += data.kaidi_female || 0;
            acc.totalKaidi += data.total_kaidi || 0;
            acc.totalThunuwaMale += data.thunuwa_male || 0;
            acc.totalThunuwaFemale += data.thunuwa_female || 0;
            acc.totalThunuwa += data.total_thunuwa || 0;
            acc.totalMale += data.total_male || 0;
            acc.totalFemale += data.total_female || 0;
            acc.totalKaidi65 += ( data.kaidi_male_65plus || 0 ) + ( data.kaidi_female_65plus || 0 );
            acc.totalThunuwa65 += ( data.thunuwa_male_65plus || 0 ) + ( data.thunuwa_female_65plus || 0 );
            acc.totalAashrit += data.total_aashrit || 0;
            acc.totalEscaped += data.totalEscaped || 0;
            acc.totalReturned += data.totalReturned || 0;
            acc.totalForeign += data.foreign_count || 0;
            acc.totalAll += ( data.total_male || 0 ) + ( data.total_female || 0 );
            return acc;
        },
        {
            totalKaidiMale: 0,
            totalKaidiFemale: 0,
            totalKaidi: 0,
            totalThunuwaMale: 0,
            totalThunuwaFemale: 0,
            totalThunuwa: 0,
            totalMale: 0,
            totalFemale: 0,
            totalKaidi65: 0,
            totalThunuwa65: 0,
            totalAashrit: 0,
            totalEscaped: 0,
            totalReturned: 0,
            totalForeign: 0,
            totalAll: 0,
        }
    );

    return (
        <Box>
            <Helmet>
                <title>PMIS: कार्यालयगत संख्या</title>
                <meta name="description" content="कार्यालय अनुसार कुल कैदीबन्दी संख्या हेर्नुहोस्" />
                <meta name="keywords" content="कुल कैदीबन्दी, कार्यालय अनुसार, कैदी संख्या, थुनुवा संख्या, लिङ्ग अनुसार, ६५ वर्ष माथिका, आश्रित, विदेशी" />
                <meta name="author" content="Your Name or Company" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="canonical" href={window.location.href} />
            </Helmet>
            <Button variant="contained"
                onClick={hanldeExport}
                sx={{ mb: 2 }}
                disabled={countLoading || !count || count.length === 0}>
                Export to Excel
            </Button>
            <Box>
                <TableContainer sx={{ maxWidth: "100%", overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }} component={Paper}>
                    <Table stickyHeader size='small' border='1'>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>प्रदेश</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>क्र.सं.</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>कारागार</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>कुल कैदीबन्दी</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>कैदी</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>कैदी</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>थुनुवा</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>थुनुवा</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>लिङ्ग अनुसार</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>६५ वर्ष माथिका</TableCell>
                                <TableCell sx={{...tableHeadStyle}} rowSpan={2}>आश्रित</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>फरार/फिर्ता</TableCell>
                                <TableCell sx={{...tableHeadStyle}} colSpan={2}>विदेशी</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{...tableHead2ndRowStyle}}>पुरुष</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>महिला</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>पुरुष</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>महिला</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>पुरुष</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>महिला</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>कैदी</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>थुनुवा</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>फरार</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>फिर्ता</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>संख्या</TableCell>
                                <TableCell sx={{...tableHead2ndRowStyle}}>राष्ट्रियता</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {count.map( ( data, index ) => (

                                <TableRow key={index}>
                                    <>
                                        <TableCell>{data.state_name_np}</TableCell>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell
                                            sx={{
                                                backgroundColor: onlineOfficeIds.has( data.office_id ) ? 'green' : 'inherit',
                                                color: onlineOfficeIds.has( data.office_id ) ? 'white' : 'inherit',
                                            }}
                                        >
                                            {data.office_short_name}
                                        </TableCell>

                                        {/* <TableCell sx={{ background: state?.is_online ? 'green' : 'black' }}>{data.office_short_name}</TableCell> */}
                                        <TableCell>{data.total_male + data.total_female || 0}</TableCell>
                                        <TableCell>{data.kaidi_male}</TableCell>
                                        <TableCell>{data.kaidi_female}</TableCell>
                                        <TableCell>{data.total_kaidi}</TableCell>
                                        <TableCell>{data.thunuwa_male}</TableCell>
                                        <TableCell>{data.thunuwa_female}</TableCell>
                                        <TableCell>{data.total_thunuwa}</TableCell>
                                        <TableCell>{data.total_male}</TableCell>
                                        <TableCell>{data.total_female}</TableCell>
                                        <TableCell>{data.kaidi_male_65plus + data.kaidi_female_65plus}</TableCell>
                                        <TableCell>{data.thunuwa_male_65plus + data.thunuwa_female_65plus}</TableCell>
                                        <TableCell>{data.total_aashrit}</TableCell>
                                        <TableCell>{data.totalEscaped}</TableCell>
                                        <TableCell>{data.totalReturned}</TableCell>
                                        <TableCell>{data.foreign_count}</TableCell>
                                        <TableCell>
                                            {data.foreign_countries
                                                .map( c => `${ c.country }-${ c.count }` )
                                                .join( ', ' )}
                                        </TableCell>
                                    </>
                                </TableRow>
                            ) )}
                            {/* <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}> */}
                            <TableRow>
                                <TableCell  sx={{ ...tableTotalRowStyle }} colSpan={3}>कुल जम्मा</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalAll}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalKaidiMale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalKaidiFemale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalKaidi}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalThunuwaMale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalThunuwaFemale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalThunuwa}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalMale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }}>{totals.totalFemale}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalKaidi65}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalThunuwa65}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalAashrit}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalEscaped}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalReturned}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} >{totals.totalForeign}</TableCell>
                                <TableCell sx={{ ...tableTotalRowStyle }} ></TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default TotalCountOfficeWise;