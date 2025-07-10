import React, { useEffect, useState } from 'react';
import { Box, Grid, Grid2, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import { useForm } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import { useAuth } from '../../../Context/AuthContext';

import fetchReleaseReasons from '../../ReuseableComponents/fetchReleaseReasons';
import fetchBandiRelatives from '../../ReuseableComponents/fetchBandiRelatives';

import BandiMuddaTable from '../Tables/For View/BandiMuddaTable';
import BandiAddressTable from '../Tables/For View/BandiAddressTable';
import ReuseSelect from '../../ReuseableComponents/ReuseSelect';
import ReuseDatePickerBS from '../../ReuseableComponents/ReuseDatePickerBS';
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import Swal from 'sweetalert2';
import axios from 'axios';
import FamilyTable from '../Tables/For View/FamilyTable';
import fetchBandiFamily from '../Apis_to_fetch/fetchBandiFamily';
import fetchBandi from '../Apis_to_fetch/fetchBandi';
import BandiDiseasesTable from '../Tables/For View/BandiDiseasesTable';
import BandiDisabilityTable from '../Tables/For View/BandiDisabilityTable';

const BandiTransferForm = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const { handleSubmit, control, watch, reset, formState: { errors } } = useForm();

    const [loading, setLoading] = useState( false );
    const [editing, setEditing] = useState( false );

    const bandi_id = watch( 'bandi_id' );

    const { records: bandi, optrecords: bandiOpt, loading: bandiLoading } = fetchBandi( bandi_id );
    const { records: bandiFamily, optrecords: bandiFamilyOpt, loading: bandiFamilyLoading } = fetchBandiFamily( bandi_id );
    const { records: releaseReasons, optrecords: releaseRecordsOptions, loading: realeseReasonsLoading } = fetchReleaseReasons( bandi_id );
    const { records: relatives, optrecords: relativeOptions, loading: loadingRelatives } = fetchBandiRelatives( bandi_id );

    const onFormSubmit = async ( data ) => {
        setLoading( true );
        try {
            // console.log(data)
            const url = editing ? `${ BASE_URL }/bandi/update_release_bandi/${ editableData.id }` : `${ BASE_URL }/bandi/create_release_bandi`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios( {
                method, url, data: data,
                withCredentials: true
            } );
            const { Status, Result, Error } = response.data;
            console.log( response );
            if ( Status ) {
                Swal.fire( {
                    title: `Office ${ editing ? 'updated' : 'created' } successfully!`,
                    icon: "success",
                    draggable: true
                } );
                reset();
                setEditing( false );
                // fetchOffices();
            } else {
                Swal.fire( {
                    title: response.data.nerr,
                    icon: 'error',
                    draggable: true
                } );
            }

        } catch ( err ) {
            console.error( err );
            Swal.fire( {
                title: err?.response?.data?.nerr || err.message || "सर्भरमा समस्या आयो।",
                icon: 'error',
                draggable: true
            } );
        } finally {
            setLoading( false );
        }
    };

    return (
        <>
            <Box>
                <Grid2 container spacing={2}>
                    <form onSubmit={handleSubmit( onFormSubmit )}>
                        <Grid2 size={{ xs: 12 }}>
                            <ReuseBandi
                                name='bandi_id'
                                label='बन्दी'
                                required={true}
                                control={control}
                                error={errors.bandi_id}
                                current_office={authState.office_np}
                                type='allbandi'
                            />
                        </Grid2>
                        
                        <Grid2 container spacing={2} size={{ xs: 12 }}>
                            <BandiAddressTable bandi_id={bandi_id} />
                            <BandiMuddaTable bandi_id={bandi_id} />
                            <Grid2 size={{sm:6, xs:12}}>
                                <BandiDiseasesTable bandi_id={bandi_id}/>
                            </Grid2>
                            <Grid2 size={{sm:6, xs:12}}>
                                <BandiDisabilityTable bandi_id={bandi_id}/>
                            </Grid2>
                        </Grid2> 

                        <Grid2 size={{xs:12}}>
                            
                        </Grid2>

                        <hr />
                        <Grid2 container>
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
                                        {Array.isArray(bandi?.[0]?.history)?(
                                            bandi?.[0]?.history((i, index)=>(
                                              <>000</>  
                                            ))
                                        ):(<></>)}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid2>

                        <Grid2 container>
                            <Grid2 size={{ xs: 12, sm: 4 }}>
                                <Button variant='contained' type='submit'>
                                    Save
                                </Button>
                            </Grid2>
                        </Grid2>
                    </form>
                </Grid2>
            </Box>
        </>
    );
};

export default BandiTransferForm;