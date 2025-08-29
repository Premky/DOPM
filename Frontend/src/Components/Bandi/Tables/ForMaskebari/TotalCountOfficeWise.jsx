import React from 'react';
import { Box,Button, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';

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
    console.log(count)
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
                                        <TableCell>{data.foreign_countries}</TableCell>
                                    </>
                                </TableRow>
                            ) )}

                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default TotalCountOfficeWise;