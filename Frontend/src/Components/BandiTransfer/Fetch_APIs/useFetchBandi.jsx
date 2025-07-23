// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";


const useFetchBandi = ( bandi_id ) => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );

    useEffect( () => {
        const fetchRecords = async () => {
            try {

                const response = await axios.get( `${ BASE_URL }/bandiTransfer/get_bandi_for_transfer`,
                    {
                        withCredentials: true
                    } );
                // console.log( response );
                const { Status, Result, Error } = response.data;
                if ( Status ) {
                    if ( Status && Result && typeof Result === 'object' ) {
                        const resultArray = Object.values( Result );

                        const formatted = resultArray.map( ( opt, index ) => ( {
                            label: `${ opt.office_bandi_id || '' }||${ opt.bandi_type || '' } ${ opt.bandi_name || '' } ${index}`,
                            value: opt.id || index  // fallback for value if id is missing
                        } ) );

                        setOptRecords( formatted );
                        setRecords( resultArray );
                    } else {
                        console.log( 'No records found' );
                    }
                } else {
                    // console.log(Error || 'Faile to fetch records')
                }
            } catch ( error ) {
                console.error( "Failed to fetch ranks:", error );
            } finally {
                setLoading( false );
            }
        };

        fetchRecords();
    }, [BASE_URL, bandi_id] );

    return { records, optrecords, loading };
};

export default useFetchBandi;
