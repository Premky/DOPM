import { Box, Button, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';

import NepaliDate from 'nepali-datetime';
import '../../../index.css';
import { useNavigate, Link } from 'react-router-dom';
const ReuseKaragarOffice = React.lazy( () => import( '../../ReuseableComponents/ReuseKaragarOffice' ) );
const ReuseSelect = React.lazy( () => import( '../../ReuseableComponents/ReuseSelect' ) );
const ReuseInput = React.lazy( () => import( '../../ReuseableComponents/ReuseInput' ) );
const ReuseCountry = React.lazy( () => import( '../../ReuseableComponents/ReuseCountry' ) );
const ReusableBandiTable = React.lazy( () => import( '../ReusableComponents/ReusableBandiTable' ) );
import fetchMuddaGroups from '../../ReuseableComponents/FetchApis/fetchMuddaGroups';
import { finalReleaseDateWithFine } from '../../../../Utils/dateCalculator';
import { Helmet } from 'react-helmet';


const AllBandiTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const { records: muddaGroups, optrecords: mudaGroupsOpt, loading: muddaGroupsLoading } = fetchMuddaGroups();
    useEffect( () => {
        setValue( 'searchOffice', authState.office_id | '' );
    }, [authState] );
    const {
        handleSubmit, watch, setValue, register, control, formState: { errors } } = useForm( {
            defaultValues: {
                office_bandi_id: '',
                // other fields...
            },
        } );

    const [editing, setEditing] = useState( false );
    const [loading, setLoading] = useState( false );

    //For Pagination
    const [pageSizeOptions, setPageSizeOptions] = useState( [25, 50, 100] );
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };

    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };

    const [open, setOpen] = useState( false );
    const [modalValues, setModalValues] = useState( {
        bandi_info: '',
        mudda_name: '',
        status: '',
    } );

    //Watch Variables:
    const searchOffice = watch( 'searchOffice' );
    const nationality = watch( 'nationality' );
    const country = watch( 'country' );
    const search_name = watch( 'search_name' );
    const gender = watch( 'gender' );
    const bandi_type = watch( 'bandi_type' );
    const is_active = watch( 'is_active' );
    const is_dependent = watch( 'is_dependent' );
    const mudda_group_id = watch( 'mudda_group_id' );
    //Watch Variables

    const [allKaidi, setAllKaidi] = useState( [] );
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [totalKaidi, setTotalKaidi] = useState( 0 );
    const fetchKaidi = async () => {
        setLoading( true );
        try {
            const response = await axios.get( `${ BASE_URL }/bandi/get_all_office_bandi`, {
                // page, limit: rowsPerPage,
                params: {
                    searchOffice, nationality, country,
                    gender, bandi_type, search_name,
                    is_active, is_dependent, mudda_group_id
                },
                withCredentials: true // ✅ This sends cookies (e.g., token)
            } );

            const { Status, Result, Error } = response.data;
            // console.log(response.data)
            if ( Status && Array.isArray( Result ) ) {
                setAllKaidi( Result );
                setFilteredKaidi( Result );
                // console.log( Result[0] );
                setTotalKaidi( response.data.TotalCount );  //Total Count 
            } else {
                console.warn( Error || 'No records found.' );
                setAllKaidi( [] );
            }
        } catch ( error ) {
            console.error( 'Error fetching records:', error );
        } finally {
            setLoading( false );
        }
    };

    const [fetchedMuddas, setFetchedMuddas] = useState( [] );
    const fetchMuddas = async () => {
        try {
            const url = `${ BASE_URL }/bandi/get_bandi_mudda`;
            const response = await axios.get( url, { withCredentials: true } );
            const { Status, Result, Error } = response.data;

            if ( Status ) {
                // Group muddas by bandi_id
                const grouped = {};
                Result.forEach( ( mudda ) => {
                    const bandiId = mudda.bandi_id;
                    if ( !grouped[bandiId] ) grouped[bandiId] = [];
                    grouped[bandiId].push( mudda );
                } );
                setFetchedMuddas( grouped ); // grouped is now an object like { 1: [mudda1, mudda2], 2: [mudda1] }
                // console.log(fetchedMuddas)
            } else {
                console.warn( Error || 'Failed to fetch mudda.' );
                setFetchedMuddas( {} );
            }
        } catch ( error ) {
            console.error( 'Error fetching muddas:', error );
        }
    };

    useEffect( () => {
        fetchKaidi();
        fetchMuddas();
    }, [page, rowsPerPage, searchOffice, nationality, country, is_dependent, bandi_type, gender, is_active, mudda_group_id] );

    const [editDialogOpen, setEditDialogOpen] = useState( false );
    const [selectedData, setSelectedData] = useState( null );
    const handleEdit = ( data ) => {
        setSelectedData( data );
        setEditDialogOpen( true );
    };

    const handleSave = async ( updatedData ) => {
        try {
            await axios.put(
                `${ BASE_URL }/bandi/update_payrole/${ updatedData.payrole_id }`,
                updatedData,
                { withCredentials: true } // ✅ Fix: put this inside an object
            );
            fetchKaidi();
            Swal.fire( 'सफल भयो!', 'डेटा सफलतापूर्वक अपडेट गरियो।', 'success' );
        } catch ( err ) {
            console.error( err );
            Swal.fire( 'त्रुटि!', 'डेटा अपडेट गर्न सकिएन।', 'error' );
        }
    };

    const handleDelete = async ( bandi ) => {
        const result = await Swal.fire( {
            title: `Delete ${ bandi.bandi_name }?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
        } );

        if ( result.isConfirmed ) {
            try {
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi/${ bandi.id }`, { withCredentials: true } );
                if ( res.data.Status ) {
                    Swal.fire( 'Deleted!', 'Record has been deleted.', 'success' );
                    fetchKaidi(); // Re-fetch updated data
                } else {
                    Swal.fire( 'Error!', 'Failed to delete record.', 'error' );
                }
            } catch ( err ) {
                console.error( err );
                Swal.fire( 'Error!', 'Something went wrong.', 'error' );
            }
        }
    };

    const columns = [
        { field: "current_office_letter_address", headerName: "कारागार कार्यालय", width: 100 },
        { field: "office_bandi_id", headerName: "बन्दी आईडी", width: 100 },
        { field: "lagat_no", headerName: "लगत नं.", width: 100 },
        { field: "bandi_type", headerName: "बन्दी प्रकार", width: 100 },
        { field: "bandi_name", headerName: "बन्दीको नामथर", width: 100 },
        // { field: "bandi_address", headerName: "ठेगाना", width: 100 },
        {
            field: "bandi_address",
            headerName: "ठेगाना",
            width: 200,
            renderCell: ( params ) => {
                const row = params.row;
                if ( row.nationality === 'स्वदेशी' ) {
                    // Build Nepali address string
                    return `${ row.state_name_np || '' }, ${ row.district_name_np || '' }, ${ row.city_name_np || '' }, - ${ row.wardno || '' }, ${ row.country_name_np || '' }`;
                } else {
                    // Foreign address + country
                    return `${ row.bidesh_nagarik_address_details || '' }, ${ row.country_name_np || '' }`;
                }
            }
        },

        {
            field: "photo_path",
            headerName: "फोटो",
            width: 100,
            renderCell: ( params ) =>
                params.value ? (
                    <img
                        src={`${ BASE_URL }${ params.value }`}
                        alt="बन्दी"
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            cursor: "pointer",
                            objectFit: "cover",
                        }}
                        onClick={() =>
                            Swal.fire( {
                                imageUrl: `${ BASE_URL }${ params.value }`,
                                imageAlt: "बन्दी फोटो",
                                showConfirmButton: false,
                            } )
                        }
                    />
                ) : (
                    "No Image"
                ),
        },
        { field: "current_age", headerName: "उमेर", width: 100 },
        { field: "gender", headerName: "लिङ्ग", width: 100 },
        { field: "total_jariwana_amount", headerName: "जरिवाना (तिर्न बाँकी)", width: 100 },
        { field: "thuna_date_bs", headerName: "थुना परेको मिति", width: 100 },
        {
            field: "release_date_bs", headerName: "कैदमुक्त मिति", width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                if ( row.is_active === 0 ) {
                    // Build Nepali address string
                    return `हुनेः ${ row.release_date_bs || '' } \n  भएकोः ${ row.last_karnayan_miti || '' }`;
                } else {
                    // Foreign address + country
                    return `${ row.release_date_bs || '' }`;
                }
            }
        },
        {
            field: "remaining_days_to_release",
            headerName: "कैदमुक्त हुन बाँकी दिन (जरिवाना समेत)",
            width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                return `${ finalReleaseDateWithFine( row.thuna_date_bs, row.release_date_bs, row.total_jariwana_amount ) || 0 }`;
            },
            sortValue: ( row ) => {
                // sorting based on the computed numeric value
                return finalReleaseDateWithFine( row.thuna_date_bs, row.release_date_bs, row.total_jariwana_amount ) || 0;
            }
        }

    ];

    return (
        <>
        <Helmet>
                <title>PMIS: बन्दीहरुको सूची</title>
                <meta name="description" content="बन्दीहरुको सूची हेर्नुहोस् र व्यवस्थापन गर्नुहोस्" />
        </Helmet>

            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <ReuseKaragarOffice
                            name="searchOffice"
                            label="Office"
                            control={control}
                            disabled={authState.office_id >= 3}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseInput
                            name="search_name"
                            label="नाम/संकेत नं."
                            control={control}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseCountry
                            name="country"                            
                            label='देश'
                            control={control}
                            currentOfficeId={authState.office_id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="gender"
                            label='लिङ्ग'
                            options={[
                                { label: 'सबै', value: '' },
                                { label: 'पुरुष', value: 'Male' },
                                { label: 'महिला', value: 'Female' },
                                { label: 'अन्य', value: 'Other' }
                            ]}
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="bandi_type"
                            label='बन्दी प्रकार'
                            options={[
                                { label: 'सबै', value: '' },
                                { label: 'कैदी', value: 'कैदी' },
                                { label: 'थुनुवा', value: 'थुनुवा' }
                            ]}
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="is_active"
                            label='छुटेर गएको/नगएको'
                            options={[
                                { label: 'छुटेर गएको', value: '0' },
                                { label: 'छुटेर नगएको', value: '1' }
                            ]}
                            defaultValue='1'
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="is_dependent"
                            label='आश्रित भएको/नभएको'
                            options={[
                                // { label: 'नभएको', value: '0' },
                                { label: 'भएको', value: '1' }
                            ]}
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="mudda_group_id"
                            label='मुद्दा समूह'
                            control={control}
                            options={mudaGroupsOpt}
                        />
                    </Grid>

                    <Grid size={{ xs: 6 }} mt={3}>
                        <Button
                            type="submit" variant="contained" color="primary" sx={{ mt: 2 }}
                            onClick={fetchKaidi}>
                            Search
                        </Button>
                    </Grid>
                </Grid>
                {/* </form> */}
            </Box>
            {/* <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}> */}

            <ReusableBandiTable
                columns={columns}
                rows={filteredKaidi}
                loading={loading}
                primaryMergeKey="bandi_id"
                title="बन्दीहरुको सूची"
                showView
                onView={( row ) => navigate( `/bandi/view_saved_record/${ row.bandi_id }` )}
                onDelete={handleDelete}
                showDelete={authState.role_name === 'supervisor' || authState.role_id === 99}
            />
            {/* <ReusableTable
                    columns={columns}
                    rows={rows}
                    loading={loading}
                    showView
                    // showEdit
                    onView={( row ) => navigate( `/bandi/view_saved_record/${ row.bandi_id }` )}
                    // onEdit={ handleEdit }
                    enableExport
                    includeSerial
                    serialLabel='सि.नं. '
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    pageSizeOptions={pageSizeOptions}
                    page={page}
                /> */}
        </>
    );
};

export default AllBandiTable;