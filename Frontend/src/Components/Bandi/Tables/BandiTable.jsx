import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import axios from 'axios';
import { Button, Grid, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { calculateAge, inCalculateAge } from '../../../../Utils/ageCalculator';


const BandiTable = ({ bandi_id }) => {
    const BASE_URL = useBaseURL();
    // const { bandi_id } = useParams();

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
                                <TableCell rowSpan={5} colSpan={2} align='center'>
                                    <img
                                        src={fetchedBandi.photo_path ? `${BASE_URL}${fetchedBandi.photo_path}` : '/default-avatar.png'}
                                        alt="Bandi"
                                        style={{ height: 150, width: 150, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>नामथर</TableCell>
                                <TableCell>{fetchedBandi.bandi_name}</TableCell>
                                <TableCell>लिङ्ग</TableCell>
                                <TableCell>{fetchedBandi.gender == 'Male' ? 'पुरुष' : fetchedBandi.gender == 'Female' ? 'महिला' : 'अन्य'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>जन्म मिति/उमेरः</TableCell>
                                <TableCell>{fetchedBandi.dob} ({fetchedBandi.current_age} वर्ष)</TableCell>
                                <TableCell>वैवाहिक अवस्था</TableCell>
                                <TableCell>{fetchedBandi.marital_status}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>शेक्षिक योग्यता</TableCell>
                                <TableCell>{fetchedBandi.bandi_education}</TableCell>
                                <TableCell>उचाई</TableCell>
                                <TableCell>{fetchedBandi.height}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>तौल</TableCell>
                                <TableCell>{fetchedBandi.weight}</TableCell>
                                <TableCell>हुलिया</TableCell>
                                <TableCell>{fetchedBandi.bandi_huliya}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>हिरासत/पक्राउ परेको मिती</TableCell>
                                <TableCell>{fetchedBandi.hirasat_date_bs}</TableCell>
                                <TableCell>थुना/कारागार मिती</TableCell>
                                <TableCell>{fetchedBandi.thuna_date_bs}</TableCell>
                                <TableCell>छुट्ने मिती</TableCell>
                                <TableCell>{fetchedBandi.release_date_bs}</TableCell>
                            </TableRow>

                        </Table>
                    </TableContainer>
                </Grid>

            </Grid>

        </>
    )
}

export default BandiTable