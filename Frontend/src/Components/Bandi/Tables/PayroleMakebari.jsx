import { Box, Button, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import PayroleMaskebariCountDialog from '../Dialogs/PayroleMaskebariCountDialog';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import nepaliYearsMonths from '../../../../Utils/nepaliYearsMonths';

import exportMaskebariCountToExcel from '../Exports/ExcelPayroleMaskebariCount';
// import ReuseOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
const PayroleMakebari = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();

    const { control, watch } = useForm();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [records, setRecords] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/bandi/payrole_maskebari_count`, {
                withCredentials: true,
            });
            const { Status, Result } = response.data;
            if (Status) {
                setRecords(Result);
                calculateTotals(Result);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [totals, setTotals] = useState({});
    const calculateTotals = (data) => {
        const sumFields = [
            'total_decision_count_female', 'total_decision_count_male', 'total_decision_count_other', 'total_decision_count',
            'total_payrole_count_female', 'total_payrole_count_male', 'total_payrole_count_other', 'total_payrole_count',
            'total_current_payrole_count_female', 'total_current_payrole_count_male', 'total_current_payrole_count_other', 'total_current_payrole_count',
            'total_no_from_court_count_female', 'total_no_from_court_count_male', 'total_no_from_court_count_other', 'total_no_from_court_count',
            'total_bhuktan_count_female', 'total_bhuktan_count_male', 'total_bhuktan_count_other', 'total_bhuktan_count',
            'total_in_district_wise_count_female', 'total_in_district_wise_count_male', 'total_in_district_wise_count_other', 'total_in_district_wise_count',
            'total_out_district_wise_count_female', 'total_out_district_wise_count_male', 'total_out_district_wise_count_other', 'total_out_district_wise_count',
            'total_no_payrole_count_female', 'total_no_payrole_count_male', 'total_no_payrole_count_other', 'total_no_payrole_count',
            'total_payrole_regulation_female', 'total_payrole_regulation_male', 'total_payrole_regulation_other', 'total_payrole_regulation'
        ];

        const totals = {};
        sumFields.forEach(field => {
            totals[field] = data.reduce((acc, curr) => acc + (parseInt(curr[field]) || 0), 0);
        });
        setTotals(totals);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (formData) => {
        fetchData();
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'डेटा मेटाउन चाहनुहुन्छ?',
            showCancelButton: true,
            confirmButtonText: 'हो',
            cancelButtonText: 'रद्द',
        });
        if (!confirm.isConfirmed) return;

        try {
            await axios.delete(`${BASE_URL}/bandi/create_payrole_maskebari_count/${id}`, {
                withCredentials: true,
            });
            Swal.fire('मेटाइयो!', 'रेकर्ड सफलतापूर्वक मेटाइयो।', 'success');
            fetchData();
        } catch (err) {
            console.error(err);
            Swal.fire('त्रुटि!', 'रेकर्ड मेटाउन सकिएन।', 'error');
        }
    };

    const officeid = watch('selected_office');
    const yearbs = watch('selected_year');
    const monthbs = watch('selected_month');

    const [filteredRecords, setFilteredRecords] = useState([]);
    const [filteredSum, setFilteredSum] = useState([]);
    useEffect(() => {
        if (officeid || yearbs || monthbs) {
            // Apply filters normally
            let filtered = records;
            if (officeid) {
                filtered = filtered.filter(a => a.office_id == officeid);
            }
            if (yearbs) {
                filtered = filtered.filter(a => a.year_bs == yearbs);
            }
            if (monthbs) {
                filtered = filtered.filter(a => a.month_bs == monthbs);
            }
            setFilteredRecords(filtered);
        } else {
            // Group and sum by office_id
            const grouped = {};

            records.forEach(record => {
                const officeKey = record.office_id;

                if (!grouped[officeKey]) {
                    // Initialize with non-numeric fields
                    grouped[officeKey] = {
                        office_id: record.office_id,
                        office_name: record.office_name,
                        created_office_name: record.created_office_name,
                        year_bs: 'All',
                        month_bs: 'All',
                        remarks: record.remarks || '',
                    };

                    // Initialize numeric fields with parsed numbers
                    Object.keys(record).forEach(key => {
                        const value = record[key];
                        if (!isNaN(value) && value !== null && value !== '') {
                            grouped[officeKey][key] = parseFloat(value);
                        }
                    });
                } else {
                    // Sum all numeric fields
                    Object.keys(record).forEach(key => {
                        const value = record[key];
                        if (!isNaN(value) && value !== null && value !== '') {
                            const num = parseFloat(value);
                            if (!grouped[officeKey][key]) grouped[officeKey][key] = 0;
                            grouped[officeKey][key] += num;
                        }
                    });

                    // Concatenate remarks
                    if (record.remarks) {
                        grouped[officeKey].remarks += '; ' + record.remarks;
                    }
                }
            });

            setFilteredRecords(Object.values(grouped));
        }
    }, [officeid, yearbs, monthbs, records]);


    return (
        <>
            <Box>
                <Button onClick={() => {
                    setSelectedData(null);
                    setEditDialogOpen(true);
                }} variant="contained" sx={{ mb: 2 }}>नयाँ थप्नुहोस्</Button>


                <Grid2 container>
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                        <PayroleMaskebariCountDialog
                            open={editDialogOpen}
                            onClose={() => setEditDialogOpen(false)}
                            data={selectedData}
                            onSave={handleSave}
                        />
                    </Grid2>
                </Grid2>

                <Grid2 container>
                    <Grid2 container size={{ xs: 12 }}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseKaragarOffice
                                name='selected_office'
                                label='कार्यालय'
                                control={control}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                            <ReuseSelect
                                name='selected_year'
                                label='वर्ष'
                                options={nepaliYearsMonths.yearoptions}
                                control={control}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}><ReuseSelect
                            name='selected_month'
                            label='महिना'
                            options={nepaliYearsMonths.monthsoptions}
                            control={control}
                        /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}><br /><br />
                            <Button variant='contained' color='success' size='large'
                                onClick={() => exportMaskebariCountToExcel(filteredRecords, totals)}>
                                {/* <FontAwesomeIcon icon="fa-duotone fa-solid fa-file-spreadsheet" style={{ "--fa-primary-color": "#000000", "--fa-secondary-color": "#00ff59", }} /> */}
                                Export to Excel
                            </Button>
                        </Grid2>
                    </Grid2>
                    <TableContainer>
                        <Table border='1'>
                            <TableHead>
                                <TableRow sx={{ alignContent: "center" }}>
                                    <TableCell rowSpan={3}>क्र.सं.</TableCell>
                                    <TableCell rowSpan={2}>कारागार कार्यालयको नाम</TableCell>
                                    <TableCell colSpan={4}>प्यारोल बोर्डबाट प्यारोलमा राख्न सिफारिस भएका कुल संख्या<br />
                                        (प्यारोल बोर्डको पहिलो बैठक देखि हालसम्मा प्यारोलमा राख्न सिफारिस भएका कुल संख्या उल्लेख गर्ने)
                                    </TableCell>
                                    <TableCell colSpan={4}>हाल सम्म प्यारोलमा रहेका कुल संख्या<br />
                                        (प्यारोल बोर्डको पहिलो बैठक देखि हालसम्मा प्यारोलमा राख्न सिफारिस भएकाहरु मध्ये शुरु जिल्ला अदालतको आदेश बमोजिम प्यारोलमा रहेका जम्मा संख्या)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        प्यारोल बोर्डबाट सिफारिस भएकाहरु मध्ये अदालतबाट प्यारोलमा राख्ने नमिल्ने भनि आदेश भएका संख्या
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        प्यारोलमा रहेका मध्ये कैद भुक्तान भएका संख्या <br />
                                        (तहाँ कारागारबाट अन्य कारागारमा प्यारोलमा रही कैद भुक्तान भएकाहरुको संख्या समेत जोड्ने)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        हाल प्यारोलमा रहेका जम्मा संख्या <br />
                                        (अन्य जि्लामा गएका हाल नियमित रुपमा तारेखमा रहेका समेत जोड्ने र शर्त पालना नभएकाहरु अन्य जि्लाबाट आएकाहरु नियमित हाजिर भएकाहरु समेत समावेश नगर्ने)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        अन्य जिल्लाबाट आएकाहरुको जिल्लागत कैदी संख्या <br />
                                        (हाल नियमित तारेखमा रहेका मात्र उल्लेख गर्ने)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        अन्य जिल्लामा गएकाहरुको जि्लागत कैदी संख्या <br />
                                        (अन्य जिल्लामा गएका हाल नियमित तारेखमा रहेकाको संख्या उल्लेख गर्ने)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        शर्त पालना नगर्नेको संख्या <br />
                                        (तहाँ जिल्लाबाट प्यारोलमा रहेको वा अन्य जिल्लाबाट आएको वा अन्य जिल्ला गएको सो समेत खुलाउने)
                                    </TableCell>
                                    <TableCell colSpan={4}>
                                        शर्त पालना गर्नेको संख्या
                                    </TableCell>
                                    <TableCell rowSpan={3}>
                                        कैफियत
                                    </TableCell>
                                    <TableCell rowSpan={3}>Action</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                    <TableCell>महिला</TableCell><TableCell>पुरुष</TableCell><TableCell>अन्य</TableCell><TableCell>जम्मा</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>कुल जम्मा</TableCell>
                                    <TableCell>{totals.total_decision_count_female}</TableCell>
                                    <TableCell>{totals.total_decision_count_male}</TableCell>
                                    <TableCell>{totals.total_decision_count_other}</TableCell>
                                    <TableCell>{totals.total_decision_count}</TableCell>
                                    <TableCell>{totals.total_payrole_count_female}</TableCell>
                                    <TableCell>{totals.total_payrole_count_male}</TableCell>
                                    <TableCell>{totals.total_payrole_count_other}</TableCell>
                                    <TableCell>{totals.total_payrole_count}</TableCell>
                                    <TableCell>{totals.total_no_from_court_count_female}</TableCell>
                                    <TableCell>{totals.total_no_from_court_count_male}</TableCell>
                                    <TableCell>{totals.total_no_from_court_count_other}</TableCell>
                                    <TableCell>{totals.total_no_from_court_count}</TableCell>
                                    <TableCell>{totals.total_bhuktan_count_female}</TableCell>
                                    <TableCell>{totals.total_bhuktan_count_male}</TableCell>
                                    <TableCell>{totals.total_bhuktan_count_other}</TableCell>
                                    <TableCell>{totals.total_bhuktan_count}</TableCell>
                                    <TableCell>{totals.total_current_payrole_count_female}</TableCell>
                                    <TableCell>{totals.total_current_payrole_count_male}</TableCell>
                                    <TableCell>{totals.total_current_payrole_count_other}</TableCell>
                                    <TableCell>{totals.total_current_payrole_count}</TableCell>
                                    <TableCell>{totals.total_in_district_wise_count_female}</TableCell>
                                    <TableCell>{totals.total_in_district_wise_count_male}</TableCell>
                                    <TableCell>{totals.total_in_district_wise_count_other}</TableCell>
                                    <TableCell>{totals.total_in_district_wise_count}</TableCell>
                                    <TableCell>{totals.total_out_district_wise_count_female}</TableCell>
                                    <TableCell>{totals.total_out_district_wise_count_male}</TableCell>
                                    <TableCell>{totals.total_out_district_wise_count_other}</TableCell>
                                    <TableCell>{totals.total_out_district_wise_count}</TableCell>
                                    <TableCell>{totals.total_no_payrole_count_female}</TableCell>
                                    <TableCell>{totals.total_no_payrole_count_male}</TableCell>
                                    <TableCell>{totals.total_no_payrole_count_other}</TableCell>
                                    <TableCell>{totals.total_no_payrole_count}</TableCell>
                                    <TableCell>{totals.total_payrole_regulation_female}</TableCell>
                                    <TableCell>{totals.total_payrole_regulation_male}</TableCell>
                                    <TableCell>{totals.total_payrole_regulation_other}</TableCell>
                                    <TableCell>{totals.total_payrole_regulation}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRecords.map((row, i) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>{row.office_name}</TableCell>
                                        <TableCell>{row.total_decision_count_female}</TableCell>
                                        <TableCell>{row.total_decision_count_male}</TableCell>
                                        <TableCell>{row.total_decision_count_other}</TableCell>
                                        <TableCell>{row.total_decision_count}</TableCell>
                                        <TableCell>{row.total_payrole_count_female}</TableCell>
                                        <TableCell>{row.total_payrole_count_male}</TableCell>
                                        <TableCell>{row.total_payrole_count_other}</TableCell>
                                        <TableCell>{row.total_payrole_count}</TableCell>
                                        <TableCell>{row.total_no_from_court_count_female}</TableCell>
                                        <TableCell>{row.total_no_from_court_count_male}</TableCell>
                                        <TableCell>{row.total_no_from_court_count_other}</TableCell>
                                        <TableCell>{row.total_no_from_court_count}</TableCell>
                                        <TableCell>{row.total_bhuktan_count_female}</TableCell>
                                        <TableCell>{row.total_bhuktan_count_male}</TableCell>
                                        <TableCell>{row.total_bhuktan_count_other}</TableCell>
                                        <TableCell>{row.total_bhuktan_count}</TableCell>
                                        <TableCell>{row.total_current_payrole_count_female}</TableCell>
                                        <TableCell>{row.total_current_payrole_count_male}</TableCell>
                                        <TableCell>{row.total_current_payrole_count_other}</TableCell>
                                        <TableCell>{row.total_current_payrole_count}</TableCell>
                                        <TableCell>{row.total_in_district_wise_count_female}</TableCell>
                                        <TableCell>{row.total_in_district_wise_count_male}</TableCell>
                                        <TableCell>{row.total_in_district_wise_count_other}</TableCell>
                                        <TableCell>{row.total_in_district_wise_count}</TableCell>
                                        <TableCell>{row.total_out_district_wise_count_female}</TableCell>
                                        <TableCell>{row.total_out_district_wise_count_male}</TableCell>
                                        <TableCell>{row.total_out_district_wise_count_other}</TableCell>
                                        <TableCell>{row.total_out_district_wise_count}</TableCell>
                                        <TableCell>{row.total_no_payrole_count_female}</TableCell>
                                        <TableCell>{row.total_no_payrole_count_male}</TableCell>
                                        <TableCell>{row.total_no_payrole_count_other}</TableCell>
                                        <TableCell>{row.total_no_payrole_count}</TableCell>
                                        <TableCell>{row.total_payrole_regulation_female}</TableCell>
                                        <TableCell>{row.total_payrole_regulation_male}</TableCell>
                                        <TableCell>{row.total_payrole_regulation_other}</TableCell>
                                        <TableCell>{row.total_payrole_regulation}</TableCell>
                                        <TableCell>{row.remarks}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => {
                                                setSelectedData(row);
                                                setEditDialogOpen(true);
                                            }} size="small" variant="outlined">Edit</Button>
                                            <Button onClick={() => handleDelete(row.id)} size="small" variant="outlined" color="error" sx={{ ml: 1 }}>Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid2>
                <Box>


                </Box>
            </Box>
        </>
    )
}

export default PayroleMakebari