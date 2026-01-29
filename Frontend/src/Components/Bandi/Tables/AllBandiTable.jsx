import { Box, Button, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../../Context/AuthContext';
import { useForm } from 'react-hook-form';

import NepaliDate from 'nepali-datetime';
import '../../../index.css';
import { useNavigate, Link } from 'react-router-dom';
import fetchMuddaGroups from '../../ReuseableComponents/FetchApis/fetchMuddaGroups';
import { calculateBSDate, finalReleaseDateWithFine } from '../../../../Utils/dateCalculator';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { event } from 'jquery';
import fetchBandiStatus from '../../ReuseableComponents/FetchApis/fetchBandiStatus';
import { age_array } from '../ReusableComponents/age_array';
const ReuseKaragarOffice = React.lazy( () => import( '../../ReuseableComponents/ReuseKaragarOffice' ) );
const ReuseSelect = React.lazy( () => import( '../../ReuseableComponents/ReuseSelect' ) );
const ReuseInput = React.lazy( () => import( '../../ReuseableComponents/ReuseInput' ) );
const ReuseCountry = React.lazy( () => import( '../../ReuseableComponents/ReuseCountry' ) );
const ReusableBandiTable = React.lazy( () => import( '../ReusableComponents/ReusableBandiTable' ) );

const AllBandiTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
    const { records: muddaGroups, optrecords: mudaGroupsOpt, loading: muddaGroupsLoading } = fetchMuddaGroups();
    const { records: bandiStatus, optrecords: bandiStatusOpt, loading: bandiStatusLoading } = fetchBandiStatus();

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

    const [language, setLanguage] = useState( 'np' );
    const handleLanguageChange = ( event, newLanguage ) => {
        setLanguage( newLanguage );
    };

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
    const bandi_status = watch( 'bandi_status' );
    const nationality = watch( 'nationality' );
    const country = watch( 'country' );
    const search_name = watch( 'search_name' );
    const gender = watch( 'gender' );
    const bandi_type = watch( 'bandi_type' );
    let is_active = watch( 'is_active' );
    const is_dependent = watch( 'is_dependent' );
    const mudda_group_id = watch( 'mudda_group_id' );
    const age_above = watch( 'age_above' );
    const age_below = watch( 'age_below' );
    const percentage_below = watch( 'percentage_below' );
    const percentage_above = watch( 'percentage_above' );
    const is_escape = watch( 'is_escape' );
    //Watch Variables

    //Params for API
    const filters = {
        searchOffice, bandi_status, nationality, country, search_name,
        gender, bandi_type, is_active, is_dependent, mudda_group_id, is_escape,
        age_above, age_below, percentage_above, percentage_below

    };


    const [allKaidi, setAllKaidi] = useState( [] );
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [totalKaidi, setTotalKaidi] = useState( 0 );

    const fetchKaidi = async () => {
        setLoading( true );
        // is_active ? is_active : is_active = 1;
        try {
            const response = await axios.get( `${ BASE_URL }/bandi/get_all_office_bandi`, {
                // page, limit: rowsPerPage,
                params: {
                    searchOffice, bandi_status, nationality, country,
                    gender, bandi_type, search_name,
                    is_active, is_dependent, mudda_group_id, is_escape,
                    age_above, age_below, percentage_above, percentage_below,
                },
                withCredentials: true // ✅ This sends cookies (e.g., token)
            } );

            const { Status, Result, Error } = response.data;
            // console.log(response.data)
            if ( Status && Array.isArray( Result ) ) {
                setAllKaidi( Result );
                setFilteredKaidi( Result );
                // console.log( Result[1] );
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
        // fetchMuddas();
    }, [page, rowsPerPage, searchOffice, bandi_status, nationality, country, is_dependent, bandi_type, gender,
        is_active, mudda_group_id, is_escape, age_above, age_below,
        percentage_above, percentage_below
    ] );

    const [editDialogOpen, setEditDialogOpen] = useState( false );
    const [selectedData, setSelectedData] = useState( null );
    const handleEdit = ( data ) => {
        setSelectedData( data );
        setEditDialogOpen( true );
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
                const res = await axios.delete( `${ BASE_URL }/bandi/delete_bandi/${ bandi.bandi_id }`, { withCredentials: true } );
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

    let columns;
    const columns_np = [
        {
            field: "bandi_office", headerName: "कारागार कार्यालय", width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                const totalKaidDuration = calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 );
                const totalBakiDuration = calculateBSDate( formattedDateNp, row.release_date_bs, calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 ) );

                if ( row.bandi_office == row.arrested_office ) {
                    return row.bandi_office;
                } else {
                    return (
                        <>
                            {row.bandi_office}
                            {row.arrested_office && (
                                <>
                                    <br />
                                    हालः {row.arrested_office}
                                </>
                            )}
                        </>
                    );
                }
            }
        },
        { field: "office_bandi_id", headerName: "बन्दी आईडी", width: 100 },
        { field: "enrollment_date_bs", headerName: "दाखिला मिति", width: 100 },
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
        { field: "govt_id_name_np", headerName: "परिचयपत्र प्रकार", width: 100 },
        { field: "card_no", headerName: "परिचयपत्र नं.", width: 100 },
        { field: "current_age", headerName: "उमेर", width: 100 },
        {
            field: "gender", headerName: "लिङ्ग", width: 100,
            renderCell: ( params ) => {
                const type = params.value;
                if ( type === 'Male' ) return 'पुरुष';
                if ( type === 'Female' ) return 'महिला';
                if ( type === 'Other' ) return 'अन्य';
                return type || ''; //fallback for unexpected values 
            }
        },
        { field: "total_fine", headerName: "जरिवाना (तिर्न बाँकी)", width: 100 },
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
            headerName: "बाँकी कैद (%)",
            width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                // return `${ finalReleaseDateWithFine( row.thuna_date_bs, row.release_date_bs, row.total_fine ) || 0 }`;
                return `${ ( calculateBSDate( formattedDateNp, row.release_date_bs, calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 ) ) ).percentage || 0 }`;
            },
            sortValue: ( row ) => {
                return `${ ( calculateBSDate( formattedDateNp, row.release_date_bs, calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 ) ) ).percentage || 0 }`;
                // sorting based on the computed numeric value
                // return finalReleaseDateWithFine( row.thuna_date_bs, row.release_date_bs, row.total_fine ) || 0;
            }
        }

    ];
    const columns_en = [
        {
            field: "current_office_letter_address_en", headerName: "Prison Office", width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                if ( row.current_office_letter_address == row.arrested_office ) {
                    return row.bandi_office_en;
                } else {
                    return (
                        <>
                            {row.bandi_office_en}
                        </>
                    );
                }
            }
        },
        { field: "office_bandi_id", headerName: "Bandi Id", width: 100 },
        { field: "enrollment_date_bs", headerName: "Enrollment Date", width: 100 },
        { field: "lagat_no", headerName: "Log No.", width: 100 },
        {
            field: "bandi_type", headerName: "Prisoner Type", width: 100,
            renderCell: ( params ) => {
                const type = params.value;
                if ( type === 'थुनुवा' ) return 'Detainee';
                if ( type === 'कैदी' ) return 'Prisoner';
                return type || ''; //fallback for unexpected values 
            }
        },
        { field: "bandi_name_en", headerName: "Prisoner's Name", width: 100 },
        // { field: "bandi_address", headerName: "ठेगाना", width: 100 },
        {
            field: "bandi_address",
            headerName: "Address",
            width: 200,
            renderCell: ( params ) => {
                const row = params.row;
                if ( row.nationality === 'स्वदेशी' ) {
                    // Build Nepali address string
                    return `${ row.state_name_en || '' }, ${ row.district_name_en || '' }, ${ row.city_name_en || '' }, - ${ row.wardno || '' }, ${ row.country_name_en || '' }`;
                } else {
                    // Foreign address + country
                    return `${ row.bidesh_nagarik_address_details || '' }, ${ row.country_name_en || '' }`;
                }
            }
        },

        {
            field: "photo_path",
            headerName: "Photo",
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
        { field: "govt_id_name_en", headerName: "Identity Card Type", width: 100 },
        { field: "card_no", headerName: "Identity Card No.", width: 100 },
        { field: "current_age", headerName: "Age", width: 100 },
        { field: "gender", headerName: "Gender", width: 100 },
        { field: "total_fine", headerName: "Fine (if due)", width: 100 },
        { field: "thuna_date_bs", headerName: "Date of arrest", width: 100 },
        {
            field: "release_date_bs", headerName: "Release date", width: 100,
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
            headerName: "Remaining % (Including Fine)",
            width: 100,
            renderCell: ( params ) => {
                const row = params.row;
                return `${ ( calculateBSDate( formattedDateNp, row.release_date_bs,
                    calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 ) ) ).percentage || 0 }`;
            },
            sortValue: ( row ) => {
                // sorting based on the computed numeric value
                return `${ ( calculateBSDate( formattedDateNp, row.release_date_bs,
                    calculateBSDate( row.thuna_date_bs, row.release_date_bs, 0, 0, 0, 0 ) ) ).percentage || 0 }`;
            }
        }
    ];

    if ( language == 'en' ) {
        columns = columns_en;
    } else {
        columns = columns_np;
    }

    return (
        <>
            <HelmetProvider>
                <Helmet>
                    <title>PMIS: बन्दीहरुको सूची</title>
                    <meta name="description" content="बन्दीहरुको सूची हेर्नुहोस् र व्यवस्थापन गर्नुहोस्" />
                </Helmet>
            </HelmetProvider>

            <Box sx={{ p: 0 }}>
                <ToggleButtonGroup
                    color='primary'
                    value={language}
                    exclusive
                    onChange={handleLanguageChange}
                    aria-label='Platform'
                >
                    <ToggleButton value='np'>नेपा</ToggleButton>
                    <ToggleButton value='en'>En</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseKaragarOffice
                            name="searchOffice"
                            label="Office"
                            control={control}
                        // disabled={authState.office_id >= 3}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="bandi_status"
                            label='बन्दीको अवस्था'
                            control={control}
                            options={[
                                ...bandiStatusOpt,
                                { label: "कारागारमा", value: 1 }
                            ]}

                            defaultValue={1}
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
                            defaultValue={''}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseCountry
                            name="country"
                            label='देश'
                            control={control}
                            currentOfficeId={authState.office_id}
                            defaultvalue={''}
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
                            defaultValue={''}
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
                            defaultValue={''}
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 2 }}>
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
                    </Grid> */}
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
                            name="is_escape"
                            label='फरार/पुनःपक्राउ'
                            options={[
                                { label: 'फरार', value: 'escaped' },
                                { label: 'पुनःपक्राउ', value: 'recaptured' },
                                { label: 'स्वयं हाजिर', value: 'self_present' }
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
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="age_above"
                            label='उमेर (माथि)'
                            control={control}
                            options={age_array}
                            defaultValue={''}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="age_below"
                            label='उमेर (तल)'
                            control={control}
                            options={age_array}
                            defaultValue={''}
                        />
                    </Grid>
                    {/* <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="percentage_above"
                            label='भुक्तान प्रतिसत (माथि)'
                            control={control}
                            options={age_array}
                            defaultValue={''}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseSelect
                            name="percentage_below"
                            label='भुक्तान प्रतिसत (तल)'
                            control={control}
                            options={age_array}
                            defaultValue={''}
                        />
                    </Grid> */}

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
                language={language}
                filters={filters}
                columns={columns}
                rows={filteredKaidi}
                loading={loading}
                primaryMergeKey="bandi_id"
                title="बन्दीहरुको सूची"
                showView
                onView={( row ) => navigate( `/bandi/view_saved_record/${ row.bandi_id }/${ row.office_bandi_id }` )}
                onDelete={handleDelete}
                showDelete={authState.role_name === 'supervisor' || authState.role_id === 99}

            />

        </>
    );
};

export default AllBandiTable;


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