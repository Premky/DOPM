import React, { useEffect, useState, useTransition } from 'react'
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { Grid } from '@mui/material';
import ReuseBandi from '../../ReuseableComponents/ReuseBandi';
import ReuseRelativeRelations from '../../ReuseableComponents/ReuseRelativeRelations'
import ReuseInput from '../../ReuseableComponents/ReuseInput';
import FamilyTable from '../Tables/FamilyTable';

const BandiFamilyForm = () => {
    const BASE_URL = useBaseURL();

    const {
        handleSubmit, watch, setValue, register, control, formState: { errors },
    } = useForm({
        defaultValues: {
            office_bandi_id: '',
            // other fields...
        },
    });
    const [formattedOptions, setFormattedOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const bandinameId = watch('bandi_name');
    const bandiRelation = watch('bandi_relative_relation')

    const [selectedKaidi, setSelectedKaidi] = useState([]);
    const fetchKaidi = async () => {
        if (!bandinameId) return; // Prevent unnecessary call
        setLoading(true);
        try {
            // console.log('Bandi ID:', bandinameId)
            const response = await axios.get(`${BASE_URL}/bandi/get_bandi/${bandinameId}`);
            const { Status, Result, Error } = response.data;
            // console.log(Result)
            if (Status && Array.isArray(Result)) {
                setSelectedKaidi(Result[0]);
                // console.log(selectedKaidi)
            } else {
                console.warn(Error || 'No records found.');
                setSelectedKaidi([]); // Clear old data
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKaidi();
    }, [bandinameId]);


    const onSubmit = async (data) => {
        console.log(data);
        try {
            const url = editing ? `${BASE_URL}/bandi/update_bandi_family/${currentData.id}` :
                `${BASE_URL}/bandi/create_bandi_family`;
            const method = editing ? 'PUT' : 'POST';
            const response = await axios({
                method,
                url,
                data,
                // headers: {Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data",},
                withCredentials: true
            });
            const { Status, Result, Error } = response.data;
            if (Status) {
                alert('Data submitted successfully!');
                reset(); // Reset the form after successful submission
                setEditing(false); // Reset editing state
                fetchAccidentRecords(); // Fetch updated records
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting the form.');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        कैदीबन्दीको पारिवारीको विवरणः
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <ReuseBandi
                            name='bandi_name'
                            label='बन्दीको नाम'
                            required={true}
                            control={control}
                            error={errors.bandi_name}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>बन्दी आईडी</TableCell>
                                <TableCell>प्रकार</TableCell>
                                <TableCell>कैदीबन्दीको नाम</TableCell>
                                <TableCell>राष्ट्रियता</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedKaidi && (
                                <TableRow>
                                    <TableCell>{selectedKaidi.office_bandi_id}</TableCell>
                                    <TableCell>{selectedKaidi.bandi_type}</TableCell>
                                    <TableCell>{selectedKaidi.bandi_name}</TableCell>
                                    <TableCell>{selectedKaidi.nationality || ''}</TableCell>
                                    <TableCell>{selectedKaidi.bandi_name || ''}</TableCell>
                                </TableRow>
                            )}

                        </TableBody>
                    </Table>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <ReuseRelativeRelations
                            name='bandi_relative_relation'
                            label='बन्दीसंगको नाता'
                            required={true}
                            control={control}
                            error={errors.bandi_relative_relation}
                        />
                    </Grid>
                    {bandiRelation === 6 ?
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <ReuseInput
                                    name='bandi_number_of_children'
                                    label='छोरा/छोरी (संख्या)'
                                    type='number'
                                    required={true}
                                    control={control}
                                    error={errors.bandi_number_of_children}
                                />
                            </Grid>
                        </> :
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <ReuseInput
                                    name='bandi_relative_name'
                                    label='नामथर'
                                    required={true}
                                    control={control}
                                    error={errors.bandi_relative_name}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ReuseInput
                                    name='bandi_relative_address'
                                    label='ठेगाना'
                                    required={true}
                                    control={control}
                                    error={errors.bandi_relative_address}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ReuseInput
                                    name='bandi_relative_contact_no'
                                    label='सम्पर्क नं.'
                                    type='number'
                                    required={true}
                                    control={control}
                                    error={errors.bandi_relative_contact_no}
                                />
                            </Grid>
                        </>}
                    <Grid item xs={12} sm={6} md={3}>
                        <br /><br />
                        <Button type="submit" variant="contained" color="primary">
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FamilyTable bandi_id={bandinameId} />
                </Grid>
            </Grid>
        </>
    )
}

export default BandiFamilyForm