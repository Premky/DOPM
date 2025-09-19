import React from 'react';
import { Box, Button, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';

import UseBandiTotalCountACoffice from '../../../ReuseableComponents/UseBandiTotalCountACoffice';
import fetchUserStatus from '../../../ReuseableComponents/fetchUserStatus';
import { useAuth } from '../../../../Context/AuthContext';
import exportOfficeWiseMaskebariExcel from '../../Exports/ExportOfficeWiseMaskebariExcel';
import { Helmet } from 'react-helmet';
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
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <TableContainer>
                    <Table size='small' border='1'>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={tableheadstyle} rowSpan={2}>प्रदेश</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>क्र.सं.</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>कारागार</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>कुल कैदीबन्दी</TableCell>
                                <TableCell sx={tableheadstyle} colSpan={2}>कैदी</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>कैदी</TableCell>
                                <TableCell sx={tableheadstyle} colSpan={2}>थुनुवा</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>थुनुवा</TableCell>
                                <TableCell sx={tableheadstyle} colSpan={2}>लिङ्ग अनुसार</TableCell>
                                <TableCell sx={tableheadstyle} colSpan={2}>६५ वर्ष माथिका</TableCell>
                                <TableCell sx={tableheadstyle} rowSpan={2}>आश्रित</TableCell>
                                <TableCell sx={tableheadstyle} colSpan={2}>विदेशी</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={tableheadstyle}>पुरुष</TableCell>
                                <TableCell sx={tableheadstyle}>महिला</TableCell>
                                <TableCell sx={tableheadstyle}>पुरुष</TableCell>
                                <TableCell sx={tableheadstyle}>महिला</TableCell>
                                <TableCell sx={tableheadstyle}>पुरुष</TableCell>
                                <TableCell sx={tableheadstyle}>महिला</TableCell>
                                <TableCell sx={tableheadstyle}>कैदी</TableCell>
                                <TableCell sx={tableheadstyle}>थुनुवा</TableCell>
                                <TableCell sx={tableheadstyle}>संख्या</TableCell>
                                <TableCell sx={tableheadstyle}>राष्ट्रियता</TableCell>
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
                                        <TableCell>{data.foreign_count}</TableCell>
                                        <TableCell>
                                            {data.foreign_countries
                                                .map( c => `${ c.country }-${ c.count }` )
                                                .join( ', ' )}
                                        </TableCell>
                                    </>
                                </TableRow>
                            ) )}
                            <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                                <TableCell colSpan={3}>कुल जम्मा</TableCell>
                                <TableCell>{totals.totalAll}</TableCell>
                                <TableCell>{totals.totalKaidiMale}</TableCell>
                                <TableCell>{totals.totalKaidiFemale}</TableCell>
                                <TableCell>{totals.totalKaidi}</TableCell>
                                <TableCell>{totals.totalThunuwaMale}</TableCell>
                                <TableCell>{totals.totalThunuwaFemale}</TableCell>
                                <TableCell>{totals.totalThunuwa}</TableCell>
                                <TableCell>{totals.totalMale}</TableCell>
                                <TableCell>{totals.totalFemale}</TableCell>
                                <TableCell>{totals.totalKaidi65}</TableCell>
                                <TableCell>{totals.totalThunuwa65}</TableCell>
                                <TableCell>{totals.totalAashrit}</TableCell>
                                <TableCell>{totals.totalForeign}</TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default TotalCountOfficeWise;