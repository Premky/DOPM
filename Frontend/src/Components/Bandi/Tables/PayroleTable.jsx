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

const PayroleTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
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
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <ReuseOffice
                            name='searchOffice'
                            label='Office'
                            control={control}

                            disabled={authState.office_id >= 3}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <ReusePayroleStatus
                            name='searchPayroleStatus'
                            label='Status'
                            control={control}
                        />
                    </Grid2>
                </Grid2>
            </Box>
            <TableContainer>
                <Table size='small' stickyHeader border={1}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    position: 'sticky',
                                    left: 0,
                                    backgroundColor: 'white',
                                    zIndex: 3, // header + sticky column priority
                                    minWidth: 60
                                }}
                            >
                                सि.नं.
                            </TableCell>
                            <TableCell
                                sx={{
                                    position: 'sticky',
                                    left: 50, // width of previous sticky column
                                    backgroundColor: 'white',
                                    zIndex: 3,
                                    minWidth: 250
                                }}
                            >
                                कैदीको नामथर स्थायी ठेगाना
                            </TableCell>
                            <TableCell>उमेर</TableCell>
                            <TableCell>लिङ्ग</TableCell>
                            <TableCell>राष्ट्रियता</TableCell>
                            <TableCell>मुद्दा</TableCell>
                            <TableCell>जाहेरवाला</TableCell>
                            <TableCell>मुद्दा अन्तिम कारवाही गर्ने निकाय र अन्तिम फैसला मिति</TableCell>
                            <TableCell>थुना/कैदमा परेको मिति</TableCell>
                            <TableCell>तोकिएको कैद (वर्ष, महिना, दिन)</TableCell>
                            <TableCell>कैदी पुर्जीमा उल्लेखित छुटि जाने मिती</TableCell>
                            <TableCell>भुक्तान कैद (वर्ष, महिना, दिन र प्रतिशत)</TableCell>
                            <TableCell>प्यारोलमा राख्नुपर्ने कैद (वर्ष, महिना, दिन र प्रतिशत)</TableCell>
                            <TableCell>पुनरावेदनमा नपरेको प्रमाण</TableCell>
                            <TableCell>वृद्ध रोगी वा अशक्त भए सो समेत उल्लेख गर्ने</TableCell>
                            <TableCell>तोकिएको जरिवाना/विगो तिरेको प्रमाण</TableCell>
                            <TableCell>प्यारोलमा राख्न सिफारिस गर्नुको आधार र कारण</TableCell>
                            <TableCell>कैफियत</TableCell>
                            <TableCell>कैफियत(विभागबाट)</TableCell>
                            <TableCell>#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {filteredKaidi.map((data, index) => {
                            const kaidiMuddas = fetchedMuddas[data.id] || [];

                            return (
                                <React.Fragment key={data.id}>

                                    <TableRow>
                                        <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 3 }} rowSpan={kaidiMuddas.length || 1}>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ position: 'sticky', left: 50, backgroundColor: 'white', zIndex: 3 }} rowSpan={kaidiMuddas.length || 1}>
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
                                        <TableCell>{kaidiMuddas[0]?.office_name_nep || ''} <br />
                                            {kaidiMuddas[0]?.mudda_phesala_antim_office_date || ''}
                                        </TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{kaidiMuddas[0]?.punarawedan_praman || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{kaidiMuddas[0]?.thuna_miti || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{kaidiMuddas[0]?.tokiyeko_kaid || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{kaidiMuddas[0]?.chhutti_miti || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.mudda_name || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.payarol_kaid || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.rogi_status || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{kaidiMuddas[0]?.jarivana_praman || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.sifarish_karan || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.kaifiyat || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>{data.dopmremarks || ''}</TableCell>
                                        <TableCell rowSpan={kaidiMuddas.length || 1}>
                                            <Button
                                                variant="contained"
                                                color='success'
                                                onClick={() => handleEdit(data)}
                                            >
                                                कैफियत
                                            </Button>
                                        </TableCell>
                                    </TableRow>

                                    {kaidiMuddas.slice(1).map((mudda, i) => (
                                        <TableRow key={`mudda-${data.id}-${i}`}>

                                            <TableCell>{mudda.mudda_name}</TableCell>
                                            <TableCell>{mudda.jaherwala}</TableCell>
                                            <TableCell>{mudda.antim_nikaya_faisala_miti}</TableCell>
                                            <TableCell>{mudda.punarawedan_praman}</TableCell>

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

export default PayroleTable