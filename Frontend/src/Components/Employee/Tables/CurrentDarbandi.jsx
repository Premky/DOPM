import { useEffect, useState, useMemo } from 'react';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TableSortLabel,
    Button, CircularProgress, Box
} from "@mui/material";
import axios from "axios";
import { Grid } from '@mui/system';
import CurrentDarbandiForm from '../Forms/CurrentDarbandiForm';
import ReusableTable from '../../ReuseableComponents/ReuseTable';

const CurrentDarbandi = () => {
    const BASE_URL = useBaseURL();

    const [records, setRecords] = useState( [] );
    const [loading, setLoading] = useState( false );
    const [error, setError] = useState( null );

    const [editing, setEditing] = useState( false );
    const [currentData, setCurrentData] = useState( null );

    const [sortConfig, setSortConfig] = useState( { key: '', direction: 'asc' } );
    const [empType, setempType] = useState( '' );
    const [type, setType] = useState( '' );

    const formattedDateNp = new Date().toISOString().split( 'T' )[0];

    const fetchData = async ( url, params = {} ) => {
        try {
            setLoading( true );
            const response = await axios.get( url, {
                params,
                withCredentials: true,
            } );
            const { Status, Result, Error } = response.data;
            if ( Status ) {
                return response.data || [];
            } else {
                console.error( Error || 'Failed to fetch records' );
                return [];
            }
        } catch ( error ) {
            console.error( 'Error fetching data:', error );
            setError( 'An error occurred while fetching data.' );
            return [];
        } finally {
            setLoading( false );
        }
    };

    const fetchDarbandi = async () => {
        try {
            setLoading( true );
            const response = await axios.get( `${ BASE_URL }/emp/get_darbandi`, { withCredentials: true } );
            if ( response.data.Status ) {
                setRecords( response.data.Result || [] );
            } else {
                setRecords( [] );
            }
        } catch ( err ) {
            setError( "Failed to fetch data" );
        } finally {
            setLoading( false );
        }
    };


    useEffect( () => {
        fetchDarbandi();
    }, [] );

    const filteredRecords = useMemo( () => {
        return records.filter( record =>
            ( !empType || record.class_np === empType ) &&
            ( !type || record.post_np === type )
        );
    }, [records, empType, type] );

    // const filteredRecords = records;
    // console.log( filteredRecords );



    const sortedRecords = useMemo( () => {
        const sorted = [...filteredRecords].sort( ( a, b ) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if ( sortConfig.key === 'release_date' ) {
                aVal = new Date( a.release_date ) - new Date( formattedDateNp );
                bVal = new Date( b.release_date ) - new Date( formattedDateNp );
            }

            if ( typeof aVal === 'string' ) aVal = aVal.toLowerCase();
            if ( typeof bVal === 'string' ) bVal = bVal.toLowerCase();

            if ( aVal < bVal ) return sortConfig.direction === 'asc' ? -1 : 1;
            if ( aVal > bVal ) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        } );

        return sorted;
    }, [filteredRecords, sortConfig, formattedDateNp] );

    const handleSort = ( key ) => {
        let direction = 'asc';
        if ( sortConfig.key === key && sortConfig.direction === 'asc' ) {
            direction = 'desc';
        }
        setSortConfig( { key, direction } );
    };

    const onEdit = ( record ) => {
        setEditing( true );
        setCurrentData( record );
        setShowCurrentDarbandiForm( true );
    };

    const onDelete = ( id ) => {
        console.log( 'Delete record with ID:', id );
    };

    const [showCurrentDarbandiForm, setShowCurrentDarbandiForm] = useState( false );
    const toggleCurrentDarbandiForm = () => {
        setShowCurrentDarbandiForm( !showCurrentDarbandiForm );
    };

    const columns = [
        // { field: "current_office_np", headerName: "कार्यालय" },                
        { field: "post_name_Np", headerName: "पद" },
        { field: "emp_rank_np", headerName: "तह" },
        { field: "service_name_np", headerName: "सेवा" },
        { field: "group_name_np", headerName: "समुह" },
        { field: "darbandi", headerName: "दरबन्दी" },
        { field: "kaaj_count", headerName: "काज" },        
    ];
    return (
        <Box sx={{ mt: 4 }}>

            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : loading ? (
                <CircularProgress />
            ) : (
                <>

                    <Grid container spacing={0}>
                        <Grid size={{ xs: 12 }}>
                            <Button variant="contained" color="primary" onClick={toggleCurrentDarbandiForm}>
                                {showCurrentDarbandiForm ? 'Hide Form' : 'Show Form'}
                            </Button>
                        </Grid>

                        <Grid>
                            {showCurrentDarbandiForm && (
                                <CurrentDarbandiForm
                                    editing={editing}
                                    currentData={currentData}
                                    onClose={() => { setShowCurrentDarbandiForm( false ); setEditing( false ); setCurrentData( null ); }}
                                    onSuccess={fetchDarbandi}
                                /> )}
                        </Grid>
                    </Grid>

                    <ReusableTable
                        columns={ columns}
                        rows={sortedRecords}
                        enableExport   
                        showEdit={true}
                        onEdit={onEdit}
                    />
                </>
            )}
        </Box>
    );
};

export default CurrentDarbandi;
