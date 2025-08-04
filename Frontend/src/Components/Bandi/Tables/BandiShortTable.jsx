import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { Button, Grid, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { calculateAge, inCalculateAge } from '../../../../Utils/ageCalculator';


const BandiShortTable = ({ bandi_id }) => {
    const BASE_URL = useBaseURL();
    // const { bandi_id } = useParams();

    console.log(bandi_id)

    const [fetchedBandi, setFetchedBandies] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBandies = async () => {
        try {
            const url = `${BASE_URL}/bandi/get_bandi/${bandi_id}`;
            const response = await axios.get(url);
            const { Status, Result, Error } = response.data;
            // console.log('URL:',url, Result)
            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    setFetchedBandies(Result[0]);
                } else {
                    console.log('No records found.');
                    setFetchedBandies([]);
                }
            } else {
                console.log(Error || 'Failed to fetch.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bandi_id) {
            fetchBandies();
        }
    }, [bandi_id]);
    
    return (
        <>
            <Grid item container spacing={2}>
                <Grid container item xs={12}>
                    <Grid>
                        <h3>बन्दी विवरणः</h3>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer>
                        <Table size='small' border={1}>
                            <TableRow>
                                <TableCell>बन्दी आई.डि.</TableCell>
                                <TableCell>{fetchedBandi.bandi_id}</TableCell>
                                <TableCell>बन्दी प्रकार</TableCell>
                                <TableCell>{fetchedBandi.bandi_type}</TableCell>
                                <TableCell>नामथर</TableCell>
                                <TableCell>{fetchedBandi.bandi_name}
                                    <br/>
                                    {fetchedBandi.nepali_address||fetchBandies.bidesh_nagarik_address_details}
                                </TableCell>
                                <TableCell rowSpan={5} colSpan={2} align='center'>
                                    <img
                                        src={fetchedBandi.photo_path ? `${BASE_URL}${fetchedBandi.photo_path}` : '/default-avatar.png'}
                                        alt="Bandi"
                                        style={{ height: 150, width: 150, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>

                            </TableRow>


                        </Table>
                    </TableContainer>
                </Grid>

            </Grid>

        </>
    )
}

export default BandiShortTable