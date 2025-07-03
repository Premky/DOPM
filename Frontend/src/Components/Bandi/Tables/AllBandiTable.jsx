import { Box, Button, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import ReusePayroleStatus from '../../ReuseableComponents/ReusePayroleStatus';
import PayroleStatusModal from '../Dialogs/PayroleStatusModal';
import Swal from 'sweetalert2';
import { calculateBSDate } from '../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import exportToExcel from '../Exports/ExcelPayrole';
import '../../../index.css'
import { useNavigate } from 'react-router-dom';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';


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

    //For Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const [open, setOpen] = useState(false);
    const [modalValues, setModalValues] = useState({
        bandi_info: '',
        mudda_name: '',
        status: '',
    });

    //Watch Variables:
    const searchOffice = watch('searchOffice');
    const nationality = watch('nationality');
    //Watch Variables

    const [allKaidi, setAllKaidi] = useState([]);
    const [filteredKaidi, setFilteredKaidi] = useState([]);
    const [totalKaidi, setTotalKaidi] = useState(0);
    const fetchKaidi = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/bandi/get_all_office_bandi`, {
                params: { page, limit: rowsPerPage, searchOffice, nationality },
                withCredentials: true // ✅ This sends cookies (e.g., token)
            });

            const { Status, Result, Error } = response.data;
            // console.log(response.data)
            if (Status && Array.isArray(Result)) {
                setAllKaidi(Result);
                setFilteredKaidi(Result);
                setTotalKaidi(response.data.TotalCount);  //Total Count 
            } else {
                console.warn(Error || 'No records found.');
                setAllKaidi([]);
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
            const response = await axios.get(url, { withCredentials: true });
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
    }, [page, rowsPerPage, searchOffice, nationality]);




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
            <Box sx={{ p: 2 }}>
                {/* <Typography variant="h6" gutterBottom>
                    Welcome {authState.user} from {authState.office_np}
                </Typography> */}

                {/* <form onSubmit={handleSubmit(onSubmit)}> */}
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 3 }}>
                        <ReuseKaragarOffice
                            name="searchOffice"
                            label="Office"
                            control={control}
                            disabled={authState.office_id >= 3}
                        />
                    </Grid2>

                    <Grid2 size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="nationality"
                            label='राष्ट्रियता'
                            options={[
                                { label: 'सबै', value: '' },
                                { label: 'स्वदेशी', value: 'स्वदेशी' },
                                { label: 'विदेशी', value: 'विदेशी' }
                            ]}
                            control={control}
                        />
                    </Grid2>



                    <Grid2 xs={12}>
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                            रिपोर्ट लिई ल्याउनुहोस्
                        </Button>
                        <Button onClick={exportToExcel} variant="outlined" sx={{ mt: 2, ml: 2 }}>
                            एक्सेल निर्यात
                        </Button>
                    </Grid2>
                </Grid2>
                {/* </form> */}
            </Box>
            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>

                <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
                    <Table size="small" stickyHeader border={1}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    className="table_head_bg"
                                    sx={{
                                        position: 'sticky',
                                        left: 0,
                                        top: 0,
                                        backgroundColor: 'blue',
                                        zIndex: 4,
                                        minWidth: 60,
                                    }}
                                >
                                    सि.नं.
                                </TableCell>
                                <TableCell
                                    className="table_head_bg"
                                    sx={{
                                        position: 'sticky',
                                        top: 0,
                                        left: 60, // ← match width of first sticky column
                                        backgroundColor: 'blue',
                                        zIndex: 4,
                                        minWidth: 250,
                                    }}
                                >
                                    कैदीको नामथर स्थायी ठेगाना
                                </TableCell>
                                <TableCell
                                    className="table_head_bg"
                                    sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}
                                >
                                    उमेर
                                </TableCell>
                                <TableCell
                                    className="table_head_bg"
                                    sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}
                                >
                                    लिङ्ग
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    राष्ट्रियता
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    मुद्दा
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    जाहेरवाला
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    मुद्दा अन्तिम कारवाही गर्ने निकाय र अन्तिम फैसला मिति
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    थुना/कैदमा परेको मिति
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    तोकिएको कैद (वर्ष, महिना, दिन)
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    कैदी पुर्जीमा उल्लेखित छुटि जाने मिती
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    भुक्तान कैद (वर्ष, महिना, दिन र प्रतिशत)
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    वृद्ध रोगी वा अशक्त भए सो समेत उल्लेख गर्ने
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    कैफियत
                                </TableCell>
                                <TableCell className="table_head_bg" sx={{ position: 'sticky', top: 0, backgroundColor: 'blue', zIndex: 2 }}>
                                    #
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>



                            {filteredKaidi.map((data, index) => {
                                {/* {filteredKaidi
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((data, index) => { */}
                                const kaidiMuddas = fetchedMuddas[data.id] || [];
                                return (
                                    <>

                                        <TableRow sx={{ backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5' }} key={index * data.id}>
                                            <TableCell sx={{
                                                position: 'sticky', left: 0,
                                                // backgroundColor: 'white',
                                                backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5',
                                                zIndex: 3
                                            }} rowSpan={kaidiMuddas.length || 1}>
                                                {page * rowsPerPage + index + 1} <br />
                                                {data.id}

                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    position: 'sticky',
                                                    left: 60, // ✅ should match header exactly
                                                    backgroundColor: data.status === 1 ? '#bbeba4' : '#f9d1d5',
                                                    zIndex: 3,
                                                }}
                                                rowSpan={kaidiMuddas.length || 1}
                                            >
                                                {data.office_bandi_id} <br />
                                                <b>{data.bandi_type} {data.bandi_name}</b><br />

                                                {data.nationality === 'स्वदेशी'
                                                    ? `${data.city_name_np}-${data.wardno},${data.district_name_np},
                                                        ${data.state_name_np},${data.country_name_np}`
                                                    : `${data.bidesh_nagarik_address_details},${data.country_name_np}`}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1} >
                                                {data.current_age}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य'}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {data.nationality}
                                            </TableCell>
                                            <TableCell >
                                                {kaidiMuddas[0]?.mudda_name || ''}
                                            </TableCell>
                                            <TableCell>
                                                {kaidiMuddas[0]?.vadi || ''}
                                            </TableCell>
                                            <TableCell>
                                                {kaidiMuddas[0]?.office_name_with_letter_address || ''} <br />
                                                {kaidiMuddas[0]?.mudda_phesala_antim_office_date || ''}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs || ''}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {data.thuna_date_bs && data.release_date_bs ? (<>
                                                    {calculateBSDate(data.thuna_date_bs, data.release_date_bs).formattedDuration || ''} <br />
                                                    {calculateBSDate(data.thuna_date_bs, data.release_date_bs).percentage || ''}
                                                </>) : ''}
                                            </TableCell>

                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.release_date_bs || ''}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {formattedDateNp && data.thuna_date_bs ? (<>
                                                    {calculateBSDate(formattedDateNp, data.thuna_date_bs).formattedDuration || ''} <br />
                                                    {calculateBSDate(formattedDateNp, data.thuna_date_bs).percentage || ''}
                                                </>) : ''}

                                                {/* {calculateBSDate(formattedDateNp, data.thuna_date_bs).formattedDuration || ''} <br />
                                            {calculateBSDate(formattedDateNp, data.thuna_date_bs).percentage || ''} */}
                                            </TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                {data.release_date_bs && formattedDateNp? (<>
                                                    {calculateBSDate(data.release_date_bs, formattedDateNp).formattedDuration || ''} <br />
                                                    {calculateBSDate(data.release_date_bs, formattedDateNp).percentage || ''}
                                                </>) : ''}
                                                {/* {calculateBSDate(data.release_date_bs, formattedDateNp).formattedDuration || ''} <br />
                                            {calculateBSDate(data.release_date_bs, formattedDateNp).percentage || ''} */}
                                            </TableCell>

                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.other_details || ''}</TableCell>
                                            <TableCell rowSpan={kaidiMuddas.length || 1}>{data.remark || ''}</TableCell>

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
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 'auto' }}>
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100, 500]}
                        component="div"
                        count={totalKaidi}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            </Box>
        </>
    )
}

export default AllBandiTable