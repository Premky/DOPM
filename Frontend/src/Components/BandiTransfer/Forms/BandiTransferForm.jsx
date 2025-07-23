import React, { useEffect, useState } from 'react';
import { Box, Grid, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import fetchBandiRelatives from '../../ReuseableComponents/fetchBandiRelatives';

import BandiMuddaTable from '../../Bandi/Tables/For View/BandiMuddaTable';
import BandiAddressTable from '../../Bandi/Tables/For View/BandiAddressTable';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import Swal from 'sweetalert2';
import axios from 'axios';

// import 
import fetchBandi from '../../Bandi/Apis_to_fetch/fetchBandi';
import BandiDiseasesTable from '../../Bandi/Tables/For View/BandiDiseasesTable';
import BandiDisabilityTable from '../../Bandi/Tables/For View/BandiDisabilityTable';
import BandiTransferHistoryTable from '../../Bandi/Tables/For View/BandiTransferHistoryTable';
import ReuseKaragarOffice from '../../ReuseableComponents/ReuseKaragarOffice';
import fetchBandiTransferReasons from '../../ReuseableComponents/fetchBandiTransferReasons';
import useFetchBandi from '../Fetch_APIs/useFetchBandi';

const BandiTransferForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { handleSubmit, control, watch, reset, formState: { errors } } = useForm();

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const bandi_id = watch( 'bandi_id' );

    // const { records: bandi, optrecords: bandiOpt, loading: bandiLoading } = fetchBandi( bandi_id );

    const { records: transferReasons, optrecords: transferReasonsOptions, loading: realeseReasonsLoading } = fetchBandiTransferReasons( bandi_id );
    const { records: relatives, optrecords: relativeOptions, loading: loadingRelatives } = fetchBandiRelatives( bandi_id );

    const onFormSubmit = async ( formData ) => {
        try {

            let response;
            if ( editing ) {
                response = await axios.put(
                    `${ BASE_URL }/bandiTransfer/update_bandi_transfer_history/${ editing.Id }`,
                    formData,
                    { withCredentials: true }
                );
            } else {
                console.log( bandi_id );
                response = await axios.post(
                    `${ BASE_URL }/bandiTransfer/create_bandi_transfer_history`, formData,
                    // {
                    //     bandi_id,
                    //     formData,
                    // },
                    { withCredentials: true }
                );
            }

            if ( response.data.Status ) {
                Swal.fire( 'सफल भयो !', editing ? 'डेटा अपडेट गरियो' : 'नयाँ डेटा थपियो ।', 'success' );
                reset(); // clear form after submit
            } else {
                throw new Error( response.data.message || 'कारबाही असफल भयो।' );
            }
        } catch ( error ) {
            console.error( "❌ Axios Error:", error );
            Swal.fire( 'त्रुटि!', error.message || 'सर्भर अनुरोध असफल भयो ।', 'error' );
        }
    };
    const { records:bandi, optrecords:bandiOptions, loading:bandiLoading } = useFetchBandi(bandi_id);
    return (
        <>
            <Box>
                
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid size={{ xs: 12 }}>
                            <ReuseSelect
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                options={bandiOptions}                                
                            />
                        </Grid>
                        {bandi_id && ( <>
                            <Grid container spacing={2} size={{ xs: 12 }}>
                                <BandiAddressTable bandi_id={bandi_id} />
                                <BandiMuddaTable bandi_id={bandi_id} />
                                <Grid size={{ sm: 4, xs: 12 }}>
                                    <BandiDiseasesTable bandi_id={bandi_id} />
                                </Grid>
                                <Grid size={{ sm: 4, xs: 12 }}>
                                    <BandiDisabilityTable bandi_id={bandi_id} />
                                </Grid>
                                <Grid size={{ sm: 4, xs: 12 }}>
                                    {/* <BandiDisabilityTable bandi_id={bandi_id} /> */}
                                    बिमा सम्बन्धि विवरण
                                </Grid>

                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <BandiTransferHistoryTable bandi_id={bandi_id} />
                            </Grid>
                        </> )}


                        <Grid container size={{ xs: 12 }} sx={{ marginTop: 2 }} spacing={2}>
                            <Grid size={{ xs: 5 }}>
                                <ReuseKaragarOffice
                                    name="recommended_to_office_id"
                                    label="चाहेको कार्यालय"
                                    control={control}
                                    required={true}
                                    error={!!errors.recommended_to_office_id}
                                />
                            </Grid>
                            <Grid size={{ xs: 5 }}>
                                <ReuseSelect
                                    name="transfer_reason_id"
                                    label="सरुवाको कारण"
                                    options={transferReasonsOptions}
                                    control={control}
                                    required={true}
                                    error={!!errors.transfer_reason_id}
                                />
                                {/* {bandi[0]?.bandi_type} */}
                            </Grid>
                            {bandi[0]?.bandi_type == 'थुनुवा' && (
                                <Grid size={{ xs: 2 }}>
                                    <ReuseSelect
                                        name="is_thunuwa_permission"
                                        label="थुनुवाको हकमा स्विकृति छ/छैन?"
                                        options={[
                                            {label:'छ', value:'छ'},
                                            {label:'छैन', value:'छैन'}
                                        ]}
                                        control={control}
                                        required={true}
                                        error={!!errors.is_thunuwa_permission}
                                    />
                                </Grid>
                            )}
                        </Grid>

                        <Grid>
                            <ReuseInput
                                name="bandi_character"
                                label="निजको आचरण"
                                control={control}
                                margin="dense"
                                required={true}
                                error={!!errors.bandi_character}
                                helperText={errors.bandi_character?.message}
                            />
                        </Grid>
                        <Grid>
                            <ReuseInput
                                name="transfer_reason"
                                label="सरुवा विवरण"
                                control={control}
                                margin="dense"
                                error={!!errors.transfer_reason}
                                helperText={errors.transfer_reason?.message}
                            />
                        </Grid>
                        <Grid>
                            <Button variant='contained' type='submit'>
                                Save
                            </Button>
                        </Grid>

                        <hr />
                        {/* <Grid container>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell rowSpan={3}>सि.नं.</TableCell>
                                            <TableCell rowSpan={3}>कैदीको नामथर र स्थायी ठेगाना</TableCell>
                                            <TableCell rowSpan={3}>मुद्दाको किसिम</TableCell>
                                            <TableCell rowSpan={3}>जन्म मिति र उमेर</TableCell>
                                            <TableCell rowSpan={3}>थुनामा परेको मिति</TableCell>
                                            <TableCell rowSpan={3}>बन्दीको किसिम (थुनुवा भएमा सम्बन्धित न्यायिक निकायको स्वीकृती)</TableCell>
                                            <TableCell colSpan={3}>जेलमा बसेको विवरण (शुरुदेखि हालसम्म)</TableCell>
                                            <TableCell rowSpan={3}>सरुवा गर्न चाहेको कारागारको नाम र कारण</TableCell>
                                            <TableCell rowSpan={3}>पुर्व कारागारबाट प्राप्त आचरण सम्बन्धि विवरण</TableCell>
                                            <TableCell rowSpan={3}>स्वास्थ्य अवस्था</TableCell>
                                            <TableCell rowSpan={3}>अन्य व्यहोरा</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell rowSpan={2}>कारागारको नाम</TableCell>
                                            <TableCell colSpan={2}>मिति</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>देखि</TableCell>
                                            <TableCell>सम्म</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableCell>1</TableCell>
                                        <TableCell>
                                            {bandi[0]?.bandi_name} <br />
                                            {bandi[0]?.country_name_np == 'नेपाल' ? <>{bandi[0]?.city_name_np}-{bandi[0]?.wardno}, {bandi[0]?.district_name_np}</> :
                                                <>{bandi[0]?.bidesh_nagarik_address_details},{bandi[0]?.country_name_np}</>}
                                        </TableCell>
                                        <TableCell>
                                            {Array.isArray( bandi?.[0]?.muddas ) ? (
                                                bandi[0].muddas.map( ( i, index ) => (
                                                    <span key={index}>
                                                        {index > 0 && ', '}
                                                        {i.mudda_name}
                                                    </span>
                                                ) )
                                            ) : (
                                                <em></em> // or empty string if you prefer ""
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {bandi[0]?.dob}<br />
                                            {bandi[0]?.age}
                                        </TableCell>
                                        <TableCell>{bandi[0]?.thuna_date_bs}</TableCell>
                                        <TableCell>{bandi[0]?.bandi_type}</TableCell>
                                        {Array.isArray( bandi?.[0]?.history ) ? (
                                            bandi?.[0]?.history( ( i, index ) => (
                                                <>000</>
                                            ) )
                                        ) : ( <></> )}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid> */}


                    </form>
                
            </Box>
        </>
    );
};

export default BandiTransferForm;