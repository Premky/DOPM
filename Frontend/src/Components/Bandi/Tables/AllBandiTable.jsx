import { Box, Button, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import ReuseOffice from '../../ReuseableComponents/ReuseOffice';
import ReusePayroleStatus from '../../ReuseableComponents/ReusePayroleStatus';
import PayroleStatusModal from '../Dialogs/PayroleStatusModal';
import Swal from 'sweetalert2';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import exportToExcel from '../Exports/ExcelPayrole';
import '../../../index.css'
import { useNavigate } from 'react-router-dom';

const AllBandiTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format('YYYY-MM-DD');
    useEffect(() => {
        setValue('searchOffice', authState.office_id | '')
    }, [authState]);
    const {
        handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm({
            defaultValues: {
                office_bandi_id: '',
                // other fields...
            },
        });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [modalValues, setModalValues] = useState({
        bandi_info: '',
        mudda_name: '',
        status: '',
    });

    const [allKaidi, setAllKaidi] = useState([]);
    const [filteredKaidi, setFilteredKaidi] = useState([]);
    const fetchKaidi = async () => {
        setLoading(true);
        try {
            // console.log('Bandi ID:', bandinameId)
            const response = await axios.get(`${BASE_URL}/bandi/get_bandi`);
            const { Status, Result, Error } = response.data;
            // console.log(Result)
            if (Status && Array.isArray(Result)) {
                setAllKaidi(Result);
                setFilteredKaidi(Result);
                //To fetch Muddas for each kaidi
                // console.log(allKaidi)
                const muddaResponses = await Promise.all(
                    Result.map((kaidi) => fetchMuddas(kaidi.id))
                );
            } else {
                console.warn(Error || 'No records found.');
                setAllKaidi([]); // Clear old data
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const [fetchedMuddas, setFetchedMuddas] = useState([]);
    const fetchMuddas = async () => {
        try {
            const url = `${BASE_URL}/bandi/get_bandi_mudda`;
            const response = await axios.get(url);
            const { Status, Result, Error } = response.data;

            if (Status) {
                // Group muddas by bandi_id
                const grouped = {};
                Result.forEach((mudda) => {
                    const bandiId = mudda.bandi_id;
                    if (!grouped[bandiId]) grouped[bandiId] = [];
                    grouped[bandiId].push(mudda);
                });
                setFetchedMuddas(grouped); // grouped is now an object like { 1: [mudda1, mudda2], 2: [mudda1] }
                // console.log(fetchedMuddas)
            } else {
                console.warn(Error || 'Failed to fetch mudda.');
                setFetchedMuddas({});
            }
        } catch (error) {
            console.error('Error fetching muddas:', error);
        }
    };
    useEffect(() => {
        fetchKaidi();
        fetchMuddas();
    }, []);

    //Watch Variables:
    const searchOffice = watch('searchOffice');
    const searchpayroleStatus = watch('searchPayroleStatus');
    //Watch Variables

    useEffect(() => {
        let filtered = allKaidi;
        // console.log(filtered)

        if (searchOffice) {
            filtered = filtered.filter(a => a.current_office_id === searchOffice);
        }

        if (searchpayroleStatus) {
            filtered = filtered.filter(a => a.status === searchpayroleStatus);
        }

        setFilteredKaidi(filtered);
    }, [searchOffice, searchpayroleStatus, allKaidi]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const handleEdit = (data) => {
        setSelectedData(data);
        setEditDialogOpen(true);
    };

    const handleSave = async (updatedData) => {
        try {
            await axios.put(
                `${BASE_URL}/bandi/update_payrole/${updatedData.payrole_id}`,
                updatedData,
                { withCredentials: true } // ✅ Fix: put this inside an object
            );
            fetchKaidi();
            Swal.fire('सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error');
        }
    };

    return (
        <>
            <PayroleStatusModal
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                data={selectedData}
                onSave={handleSave}
            />
            <Box>
                <p>Welcome {authState.user} from {authState.office_np}</p>
                <Grid2 container={2}>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <ReuseOffice
                            name='searchOffice'
                            label='Office'
                            control={control}

                            disabled={authState.office_id >= 3}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <ReusePayroleStatus
                            name='searchPayroleStatus'
                            label='Status'
                            control={control}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <Button onClick={() => exportToExcel(filteredKaidi, fetchedMuddas)} variant="outlined" color="primary" sx={{ m: 1 }}>
                            एक्सेल निर्यात
                        </Button>
                    </Grid2>
                </Grid2>
            </Box>
            <TableContainer>
                <Table size='small' stickyHeader border={1}>
                    <TableHead>
                        <TableRow >
                            <TableCell
                                className='table_head_bg'
                                sx={{
                                    position: 'sticky',
                                    left: 0,
                                    backgroundColor: 'blue',
                                    zIndex: 3, // header + sticky column priority
                                    minWidth: 60
                                }}

                            >
                                सि.नं.
                            </TableCell>
                            <TableCell
                                className='table_head_bg'
                                sx={{
                                    position: 'sticky',
                                    left: 50, // width of previous sticky column
                                    backgroundColor: 'blue',
                                    zIndex: 3,
                                    minWidth: 250
                                }}
                            >
                                कैदीको नामथर स्थायी ठेगाना
                            </TableCell>
                            <TableCell className='table_head_bg'>उमेर</TableCell>
                            <TableCell className='table_head_bg'>लिङ्ग</TableCell>
                            <TableCell className='table_head_bg'>राष्ट्रियता</TableCell>
                            <TableCell className='table_head_bg'>मुद्दा</TableCell>
                            <TableCell className='table_head_bg'>जाहेरवाला</TableCell>
                            <TableCell className='table_head_bg'>मुद्दा अन्तिम कारवाही गर्ने निकाय र अन्तिम फैसला मिति</TableCell>
                            <TableCell className='table_head_bg'>थुना/कैदमा परेको मिति</TableCell>
                            <TableCell className='table_head_bg'>तोकिएको कैद (वर्ष, महिना, दिन)</TableCell>
                            <TableCell className='table_head_bg'>कैदी पुर्जीमा उल्लेखित छुटि जाने मिती</TableCell>
                            <TableCell className='table_head_bg'>भुक्तान कैद (वर्ष, महिना, दिन र प्रतिशत)</TableCell>
                            <TableCell className='table_head_bg'>प्यारोलमा राख्नुपर्ने कैद (वर्ष, महिना, दिन र प्रतिशत)</TableCell>
                            <TableCell className='table_head_bg'>पुनरावेदनमा नपरेको प्रमाण</TableCell>
                            <TableCell className='table_head_bg'>वृद्ध रोगी वा अशक्त भए सो समेत उल्लेख गर्ने</TableCell>
                            <TableCell className='table_head_bg'>तोकिएको जरिवाना/विगो तिरेको प्रमाण</TableCell>
                            <TableCell className='table_head_bg'>प्यारोलमा राख्न सिफारिस गर्नुको आधार र कारण</TableCell>
                            <TableCell className='table_head_bg'>कैफियत</TableCell>
                            <TableCell className='table_head_bg'>कैफियत(विभागबाट)</TableCell>
                            <TableCell className='table_head_bg'>#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {filteredKaidi.map((data, index) => {
                            const kaidiMuddas = fetchedMuddas[data.id] || [];

                            return (
                                <React.Fragment key={data.id}>

                                    <TableRow sx={{ backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5' }}>
                                        <TableCell sx={{
                                            position: 'sticky', left: 0,
                                            // backgroundColor: 'white',
                                            backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5',
                                            zIndex: 3
                                        }} rowSpan={kaidiMuddas.length || 1}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{
                                            position: 'sticky', left: 50,
                                            // backgroundColor: 'white',
                                            backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5',
                                            zIndex: 3
                                        }} rowSpan={kaidiMuddas.length || 1}>
                                            {data.id} <br />{data.bandi_name}<br />
                                            {data.nationality === 'स्वदेशी'
                                                ? `${data.city_name_np}-${data.wardno},${data.district_name_np},${data.state_name_np},${data.country_name_np}`
                                                : `${data.bidesh_nagarik_address_details},${data.country_name_np}`}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1} >{data.current_age}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य'}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.nationality}</TableCell>
                                        <TableCell >{kaidiMuddas[0]?.mudda_name || ''}</TableCell>
                                        <TableCell>{kaidiMuddas[0]?.vadi || ''}</TableCell>
                                        <TableCell>{kaidiMuddas[0]?.office_name_with_letter_address || ''} <br />
                                            {kaidiMuddas[0]?.mudda_phesala_antim_office_date || ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {calculateBSDate(data.thuna_date_bs, data.release_date_bs).formattedDuration || ''} <br />
                                            {calculateBSDate(data.thuna_date_bs, data.release_date_bs).percentage || ''}
                                        </TableCell>

                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.release_date_bs || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {calculateBSDate(formattedDateNp, data.thuna_date_bs).formattedDuration || ''} <br />
                                            {calculateBSDate(formattedDateNp, data.thuna_date_bs).percentage || ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {calculateBSDate(data.release_date_bs, formattedDateNp).formattedDuration || ''} <br />
                                            {calculateBSDate(data.release_date_bs, formattedDateNp).percentage || ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {`${data.punarabedan_office}को च.नं. ${data.punarabedan_office_ch_no} मिति ${data.punarabedan_office_date} गतेको पत्रानुसार ।` || ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.other_details || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            {data.deposited_jariwana_office && data.deposited_jariwana_ch_no && data.deposited_jariwana_date
                                                ? `${data.deposited_jariwana_office}को च.नं. ${data.deposited_jariwana_ch_no} मिति ${data.deposited_jariwana_date} गतेको पत्रानुसार ।`
                                                : ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.payrole_reason || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.remark || ''}</TableCell>
                                        
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.dopmremark || ''} </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            <Button onClick={() => navigate(`/bandi/view_saved_record/${data.id}`)}>
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {kaidiMuddas.slice(1).map((mudda, i) => (
                                        <TableRow key={`mudda-${data.id}-${i}`} sx={{ backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5' }}>
                                            <TableCell>{mudda.mudda_name}</TableCell>
                                            <TableCell>{mudda.jaherwala}</TableCell>
                                            <TableCell>{mudda.antim_nikaya_faisala_miti}</TableCell>

                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>


                </Table>
            </TableContainer>
        </>
    )
}

export default AllBandiTable