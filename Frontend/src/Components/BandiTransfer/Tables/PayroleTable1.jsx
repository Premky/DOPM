import { Box, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Checkbox, Menu, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useBaseURL } from '../../../../Context/BaseURLProvider';
import axios from 'axios';
import { useAuth } from '../../../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import ReuseKaragarOffice from '../../../ReuseableComponents/ReuseKaragarOffice';
// import ReusePayroleStatus from '../../ReuseableComponents/ReusePayroleStatus';
import PayroleStatusModal from '../../Dialogs/PayroleStatusModal';
import Swal from 'sweetalert2';
import { calculateBSDate } from '../../../../../Utils/dateCalculator';
import NepaliDate from 'nepali-datetime';
import exportToExcel from '../../Exports/ExcelPayrole';
import '../../../../index.css'
import { useNavigate } from 'react-router-dom';
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect';
import PyarolKaragarStatusModal from '../../Dialogs/PyarolKaragarStatus';
import ReusePayroleNos from '../../../ReuseableComponents/ReusePayroleNos';
import ReuseMudda from '../../../ReuseableComponents/ReuseMudda';
import ReuseInput from '../../../ReuseableComponents/ReuseInput';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ForwardDialog from '../Dialogs/ForwardDialog';
import PayroleReturnStatusModal from '../Dialogs/PayroleReturnStatusModal';
import PayroleResultModal from '../Dialogs/PayroleResultModal';

const PayroleTable = ( status ) => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();
    const npToday = new NepaliDate();
    const formattedDateNp = npToday.format( 'YYYY-MM-DD' );
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
    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );
    const handleChangePage = ( event, newPage ) => {
        setPage( newPage );
    };

    const handleChangeRowsPerPage = ( event ) => {
        setRowsPerPage( parseInt( event.target.value, 10 ) );
        setPage( 0 );
    };

    const [karagarSatusDialogOpen, setKaragarSatusDialogOpen] = useState( false );
    const handleUpdatePayrole = ( data ) => {
        setSelectedData( data );
        setKaragarSatusDialogOpen( true );
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
    let searchpayroleStatus = watch( 'searchPayroleStatus' );
    const searchpyarole_rakhan_upayukat = watch( 'pyarole_rakhan_upayukat' );
    const searchpayrole_no_id = watch( 'payrole_no_id' );
    const searchmudda_id = watch( 'mudda_id' );
    const searchbandi_name = watch( 'bandi_name' );
    const searchchecked = watch( 'checked' );
    const searchis_checked = watch( 'is_checked' );
    //Watch Variables
    if ( status == 'user_not_submitted' ) {
        searchpayroleStatus = 1; // Default to 'user_not_submitted' status
    } else if ( status == 'user_submitted' ) {
        searchpayroleStatus = 2; // Default to 'user_submitted' status
    } else if ( status == 'jr_not_submitted' ) {
        searchpayroleStatus = 3;
    }

    const [allKaidi, setAllKaidi] = useState( [] );
    const [filteredKaidi, setFilteredKaidi] = useState( [] );
    const [totalKaidi, setTotalKaidi] = useState( 0 );
    const fetchKaidi = async () => {
        setLoading( true );
        try {
            const response = await axios.get( `${ BASE_URL }/payrole/get_payroles`, {
                params: {
                    page, limit: rowsPerPage, searchOffice, nationality, searchpayroleStatus, searchpyarole_rakhan_upayukat,
                    searchpayrole_no_id, searchmudda_id, searchbandi_name, searchchecked, searchis_checked
                },
                withCredentials: true // ✅ This sends cookies (e.g., token)
            } );

            const { Status, Result, Error } = response.data;
            // console.log(response.data)
            if ( Status && Array.isArray( Result ) ) {
                setAllKaidi( Result );
                setFilteredKaidi( Result );
                setTotalKaidi( response.data.TotalCount );  //Total Count 
                // console.log( filteredKaidi );
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
    }, [page, rowsPerPage, searchOffice, nationality, searchpayroleStatus, searchpyarole_rakhan_upayukat,
        searchpayrole_no_id, searchmudda_id, searchbandi_name, searchchecked, searchis_checked] );

    const [editDialogOpen, setEditDialogOpen] = useState( false );
    const [selectedData, setSelectedData] = useState( null );
    const handleEdit = ( data ) => {
        setSelectedData( data );
        setEditDialogOpen( true );
    };

    const [returnDialogOpen, setReturnDialogOpen] = useState( false );
    const handleReturn = ( data ) => {
        setSelectedData( data );
        setReturnDialogOpen( true );
    };

    const [resultDialogOpen, setResultDialogOpen] = useState( false );
    const handleResult = ( data ) => {
        setSelectedData( data );
        setResultDialogOpen( true );
    };

    const handleSave = async ( updatedData ) => {
        // console.log(updatedData)
        try {
            await axios.put(
                `${ BASE_URL }/payrole/update_payrole/${ updatedData.payrole_id }`,
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

    const handleCheckboxChange = async ( id, newValue ) => {
        // console.log( newValue );
        try {
            await axios.put( `${ BASE_URL }/payrole/update_is_payrole_checked/${ id }`, {
                is_checked: newValue
            }, { withCredentials: true } );
            fetchKaidi();
            // Optionally update local state or re-fetch
        } catch ( err ) {
            console.error( 'Update failed:', err );
        }
    };
    const [forwardData, setForwardData] = useState( null );
    const [forwardModalOpen, setForwardModalOpen] = useState( false );
    const handleForwardDialog = ( data, bandi_id ) => {
        setForwardData( data, bandi_id );
        setForwardModalOpen( true );
    };

    const handleChangePayroleStatus = ( data, value ) => {
        const pesh = async () => {
            try {
                await axios.put( `${ BASE_URL }/payrole/update_payrole_status/${ data.payrole_id }`, { value }, { withCredentials: true } );
                fetchKaidi();
                // Optionally update local state or re-fetch
            } catch ( err ) {
                console.error( 'Update failed:', err );
            }
        };
        setSelectedData( data );
        let title = '';

        if ( value === 2 ) {
            title = 'के तपाई यो विवरण कार्यालय प्रमुखमा पेश गर्न चाहनुहुन्छ?';
        } else if ( value === 3 ) {
            title = 'के तपाई यो विवरण विभागमा पेश गर्न चाहनुहुन्छ ?';
        } else if ( value === 4 ) {
            title = `तपाई यो विवरण ${ data.current_payrole_office } पठाउन चाहनुहुन्छ?`;
        }



        Swal.fire( {
            title: title,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'हो',
            denyButtonText: 'होइन',
            customClass: {
                // actions: pesh(),
                cancelButton: 'order-1 right-gap',
                confirmButton: 'order-2',
                denyButton: 'order-3',
            },
        } ).then( ( result ) => {
            if ( result.isConfirmed ) {
                pesh();
                Swal.fire( 'Saved!', '', 'success' );
            } else if ( result.isDenied ) {
                Swal.fire( 'Changes are not saved', '', 'info' );
            }
        } );
    };

    const roleBasedStatus = {
        user: [
            { label: 'पेश नगरेको', value: '1' },
            { label: 'पेश गरेको', value: '2' },
        ]
        , office_approver: [
            { label: 'पेश नगरेको', value: '1' },
            { label: 'पेश गरेको', value: '2' },
        ],
        jr_officer: [
            { label: 'पेश गरेको', value: '3' },
            { label: 'स्विकृत गरेको', value: '4' },
            { label: 'प्यारोल सिफारिस भएको', value: '5' },
        ],
    };
    // console.log(searchpayroleStatus)

    const [anchorEl, setAnchorEl] = useState( null );
    const openEl = Boolean( anchorEl );
    const handleElClick = ( event ) => {
        setAnchorEl( event.currentTarget );
    };
    const handleElClose = () => {
        setAnchorEl( null );
    };

    return (
        <>
            <ForwardDialog
                open={forwardModalOpen}
                onClose={() => setForwardModalOpen( false )}
                onSave={handleSave}
                editingData={forwardData}
            />
            <PayroleStatusModal
                open={editDialogOpen}
                onClose={() => setEditDialogOpen( false )}
                data={selectedData}
                onSave={handleSave}
            />
            <PyarolKaragarStatusModal
                open={karagarSatusDialogOpen}
                onClose={() => setKaragarSatusDialogOpen( false )}
                data={selectedData}
            // onSave={handleKaragarStatusChange}
            />
            <PayroleReturnStatusModal
                open={returnDialogOpen}
                onClose={() => setReturnDialogOpen( false )}
                data={selectedData}
            />
            <PayroleResultModal
                open={resultDialogOpen}
                onClose={() => setResultDialogOpen( false )}
                data={selectedData}
                onSave={handleSave}
            />
            <Box>
                <p>Welcome {authState.user} from {authState.office_np}</p>
                <Grid container={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <ReuseKaragarOffice
                            name='searchOffice'
                            label='कारागार कार्यालयको नाम'
                            control={control}

                            disabled={authState.office_id >= 3}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        {/* <ReusePayroleStatus
                            name='searchPayroleStatus'
                            label='अवस्था'
                            control={control}
                            defaultvalue={1}
                        /> */}
                        <ReuseSelect
                            name='searchPayroleStatus'
                            label='अवस्था'
                            options={roleBasedStatus[authState.role] || roleBasedStatus[authState.role_name]}
                            control={control}
                        // defaultvalue={1}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }}>
                        <ReuseSelect
                            name='pyarole_rakhan_upayukat'
                            label='नतिजा'
                            options={[
                                { label: 'सबै', value: '' },
                                { label: 'योग्य', value: 'योग्य' },
                                { label: 'अयोग्य', value: 'अयोग्य' },
                                { label: 'पास', value: 'पास' },
                                { label: 'फेल', value: 'फेल' },
                                { label: 'छलफल', value: 'छलफल' },
                                { label: 'कागजात अपुग', value: 'कागजात अपुग' }
                            ]}
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }}>
                        <ReuseSelect
                            name='is_checked'
                            label='चेक भए/नभएको'
                            options={[{ label: 'सबै', value: '' }, { label: 'छ', value: '1' }, { label: 'छैन', value: '0' }]}
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 1 }}>
                        <ReusePayroleNos
                            name='payrole_no_id'
                            label='प्यारोल संख्या'
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseMudda
                            name='mudda_id'
                            label='मुद्दा'
                            control={control}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <ReuseInput
                            name='bandi_name'
                            label='कैदी/बन्दीको नाम'
                            control={control}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Button onClick={() => exportToExcel( filteredKaidi, fetchedMuddas )} variant="outlined" color="primary" sx={{ m: 1 }}>
                            एक्सेल निर्यात
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>

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
                                    चेक भए/नभएको?
                                </TableCell>
                                <TableCell
                                    className='table_head_bg'
                                    sx={{
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: 'blue',
                                        zIndex: 3, // header + sticky column priority
                                        minWidth: 10
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
                                        minWidth: 100
                                    }}
                                >
                                    कैदीको नामथर स्थायी ठेगाना
                                </TableCell>
                                <TableCell className='table_head_bg'>उमेर (वर्ष)</TableCell>
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
                                <TableCell className='table_head_bg'>तोकिएको जरिवाना/विगो तिरेको प्रमाण</TableCell>
                                {/* <TableCell className='table_head_bg'>वृद्ध रोगी वा अशक्त भए सो समेत उल्लेख गर्ने</TableCell> */}
                                {/* <TableCell className='table_head_bg'>प्यारोलमा राख्न सिफारिस गर्नुको आधार र कारण</TableCell> */}
                                {/* <TableCell className='table_head_bg'>कैफियत</TableCell> */}
                                <TableCell className='table_head_bg'>कैफियत(विभागबाट)</TableCell>
                                <TableCell className='table_head_bg'>#</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredKaidi.map( ( data, index ) => {
                                const kaidiMuddas = fetchedMuddas[data.bandi_id] || [];
                                const rowStyle = {
                                    backgroundColor:
                                        authState.office_id <= 2 || data.payrole_status >= 3
                                            ? ( data.pyarole_rakhan_upayukat === 'छ' ? '#bbeba4' : '#f9d1d5' )
                                            : 'white'
                                };

                                return (
                                    <>
                                        {/* {authState.office_id}, {data.payrole_status} */}

                                        <React.Fragment key={data.id}>
                                            <TableRow sx={rowStyle}>
                                                <TableCell sx={{
                                                    position: 'sticky', left: 0,
                                                    backgroundColor: rowStyle,
                                                    zIndex: 3
                                                }} rowSpan={kaidiMuddas.length || 1}>
                                                    <Checkbox
                                                        key={data.payrole_id}
                                                        checked={data.is_checked}
                                                        onChange={() => handleCheckboxChange( data.payrole_id, !data.is_checked )}
                                                    />

                                                </TableCell>
                                                <TableCell sx={{
                                                    position: 'sticky', left: 0,
                                                    // backgroundColor: 'white',
                                                    backgroundColor: rowStyle,
                                                    zIndex: 3
                                                }} rowSpan={kaidiMuddas.length || 1}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell sx={{
                                                    position: 'sticky', left: 50,
                                                    // backgroundColor: 'white',
                                                    backgroundColor: rowStyle,
                                                    zIndex: 3
                                                }} rowSpan={kaidiMuddas.length || 1}>
                                                    {data.bandi_id} <br />{data.bandi_name}<br />
                                                    {data.nationality === 'स्वदेशी'
                                                        ? `${ data.city_name_np }-${ data.wardno },${ data.district_name_np },${ data.state_name_np },${ data.country_name_np }`
                                                        : `${ data.bidesh_nagarik_address_details },${ data.country_name_np }`}
                                                </TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1} >{data.current_age}</TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>{data.gender === 'Male' ? 'पुरुष' : data.gender === 'Female' ? 'महिला' : 'अन्य'}</TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>{data.country_name_np}</TableCell>

                                                <TableCell >{kaidiMuddas[0]?.mudda_name || ''}<br />{kaidiMuddas[0]?.mudda_no || ''}</TableCell>
                                                <TableCell>{kaidiMuddas[0]?.vadi || ''}</TableCell>
                                                <TableCell>{kaidiMuddas[0]?.office_name_with_letter_address || ''} <br />
                                                    {kaidiMuddas[0]?.mudda_phesala_antim_office_date || ''}
                                                </TableCell>

                                                <TableCell rowSpan={kaidiMuddas.length || 1}>{data.thuna_date_bs || ''}</TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {calculateBSDate( data.thuna_date_bs, data.release_date_bs ).formattedDuration || ''} <br />
                                                    {calculateBSDate( data.thuna_date_bs, data.release_date_bs ).percentage || ''}
                                                </TableCell>

                                                <TableCell rowSpan={kaidiMuddas.length || 1}>{data.release_date_bs || ''}</TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {calculateBSDate( formattedDateNp, data.thuna_date_bs ).formattedDuration || ''} <br />
                                                    {calculateBSDate( formattedDateNp, data.thuna_date_bs ).percentage || ''}
                                                </TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {calculateBSDate( data.release_date_bs, formattedDateNp ).formattedDuration || ''} <br />
                                                    {calculateBSDate( data.release_date_bs, formattedDateNp ).percentage || ''}
                                                </TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {`${ data.office_name_with_letter_address }को च.नं. ${ data.punarabedan_office_ch_no } मिति ${ data.punarabedan_office_date } गतेको पत्रानुसार ।` || ''}
                                                </TableCell>
                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {data.fine_summary}
                                                </TableCell>
                                                {/* <TableCell rowSpan={kaidiMuddas.length || 1}>{data.other_details || ''}</TableCell> */}
                                                {/* <TableCell rowSpan={kaidiMuddas.length || 1}>{data.payrole_reason || ''}</TableCell> */}
                                                {/* <TableCell rowSpan={kaidiMuddas.length || 1}>{data.remark || ''}</TableCell> */}

                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {data.dopm_remarks}
                                                    {/* {( authState.office_id <= 2 || data.payrole_status === 2 ) ? (
                                                        data.dopmremark || ''
                                                    ) : null} */}
                                                </TableCell>

                                                <TableCell rowSpan={kaidiMuddas.length || 1}>
                                                    {data.payrole_status === 1 ? (

                                                        authState.office_id >= 2 && (
                                                            <>
                                                                <Button variant="contained" color="primary" onClick={() => handleChangePayroleStatus( data, 2 )}>
                                                                    पेश गर्नुहोस्
                                                                </Button>
                                                                <Button variant="contained" color="warning"
                                                                    onClick={() => navigate( `/bandi/view_saved_record/${ data.id }` )}>
                                                                    Edit
                                                                </Button>
                                                            </>
                                                        )
                                                    ) : data.payrole_status === 3 ? (
                                                        <>
                                                            <Button variant='contained' color='primary'
                                                                id="basic-button"
                                                                aria-controls={openEl ? 'basic-menu' : undefined}
                                                                aria-haspopup="true"
                                                                aria-expanded={openEl ? 'true' : undefined}
                                                                onClick={handleElClick}
                                                            > <MoreVertIcon /></Button>
                                                            <Menu
                                                                id="basic-menu"
                                                                anchorEl={anchorEl}
                                                                open={openEl}
                                                                onClose={handleElClose}
                                                                slotProps={{ list: { 'arial-labelledby': 'basic-button', }, }}
                                                            >
                                                                <MenuItem onClick={() => navigate( `/bandi/view_saved_record/${ data.id }` )} sx={{ color: 'black' }}>View</MenuItem>
                                                                <MenuItem onClick={() => handleForwardDialog( data, 4 )} sx={{ color: 'blue' }}>पेश</MenuItem>
                                                                <MenuItem onClick={() => handleReturn( data, 4 )} sx={{ color: 'green' }}>फिर्ता</MenuItem>
                                                                <MenuItem onClick={() => handleResult( data, 6 )} sx={{ color: 'red' }}>स्विकृत</MenuItem>
                                                            </Menu>
                                                        </>
                                                    ) :
                                                        authState.office_id >= 3 ? (
                                                            data.payrole_status === 2 ? (
                                                                <>
                                                                    <Button variant="contained" color="warning"
                                                                        onClick={() => navigate( `/bandi/view_saved_record/${ data.id }` )}>
                                                                        Edit
                                                                    </Button>
                                                                    {authState.role_name === 'office_approver' && ( <>
                                                                        <Button variant='contained' color='primary'
                                                                            id="basic-button"
                                                                            aria-controls={openEl ? 'basic-menu' : undefined}
                                                                            aria-haspopup="true"
                                                                            aria-expanded={openEl ? 'true' : undefined}
                                                                            onClick={handleElClick}
                                                                        > <MoreVertIcon /></Button>
                                                                        <Menu
                                                                            id="basic-menu"
                                                                            anchorEl={anchorEl}
                                                                            open={openEl}
                                                                            onClose={handleElClose}
                                                                            slotProps={{ list: { 'arial-labelledby': 'basic-button', }, }}
                                                                        >
                                                                            <MenuItem onClick={() => handleReturn( data, 1 )} sx={{ color: 'red' }}>फिर्ता पठाउनुहोस्</MenuItem>
                                                                            <MenuItem onClick={() => handleChangePayroleStatus( data, 3 )} sx={{ color: 'green' }}>विभागमा पठाउनुहोस्</MenuItem>
                                                                        </Menu>
                                                                    </> )}
                                                                    {/* <Button variant="contained" color="success" onClick={() => handleEdit( data )}>
                                                                        कैफियत
                                                                    </Button>
                                                                    <Button variant="contained" color="primary" onClick={() => handleChangePayroleStatus( data, 3 )}>
                                                                        स्विकार गर्नुहोस्
                                                                    </Button> */}
                                                                </>
                                                            ) : data.payrole_status === 3 ? (
                                                                <>
                                                                    <Button variant="contained" color="success" onClick={() => handleEdit( data )}>
                                                                        कैफियत
                                                                    </Button>
                                                                    <Button variant="contained" color="primary" onClick={() => handleChangePayroleStatus( data, 4 )}>
                                                                        प्यारोल बोर्डको निर्णय अनुसार पेश
                                                                    </Button>
                                                                </>
                                                            ) : data.payrole_status === 4 ? (
                                                                <>

                                                                </> ) : <></>
                                                        ) : <>
                                                            {data.payrole_status === 2 ? (
                                                                <>
                                                                    {/* onClick={() => handleUpdatePayrole(data)} */}
                                                                    {/* <Button variant="contained" color="warning" >
                                                                        Edit
                                                                    </Button> */}

                                                                </>
                                                            ) : <>
                                                                {data.payrole_status === 4 ? (
                                                                    <>
                                                                        <Button variant="contained" color="success" onClick={() => handleUpdatePayrole( data )}>
                                                                            प्यारोल पाए/नपाएको
                                                                        </Button>
                                                                        {/* <Button variant="contained" color="warning" onClick={() => handleUpdatePayrole( data )}>
                                                                            प्यारोल नपाएको
                                                                        </Button> */}
                                                                    </>
                                                                ) : <>
                                                                </>}
                                                            </>}
                                                        </>}

                                                </TableCell>
                                            </TableRow>

                                            {kaidiMuddas.slice( 1 ).map( ( mudda, i ) => (
                                                <TableRow key={`mudda-${ data.id }-${ i }`} sx={rowStyle}>
                                                    <TableCell>{mudda.mudda_name}</TableCell>
                                                    <TableCell>{mudda.jaherwala}</TableCell>
                                                    <TableCell>{mudda.antim_nikaya_faisala_miti}</TableCell>

                                                </TableRow>
                                            ) )}
                                        </React.Fragment>

                                    </>

                                );
                            } )}
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
    );
};

export default PayroleTable;