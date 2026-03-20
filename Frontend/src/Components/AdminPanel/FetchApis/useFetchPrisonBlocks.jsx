// hooks/useInternalAdmins.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";


const useFetchBandiPosts = () => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );

    const fetchPrisonBlocks = async () => {
        try {
            setLoading( true );
            const response = await axios.get( `${ BASE_URL }/public/prison_blocks`, {
                withCredentials: true,
            } );
            const { Status, Result, Error } = response.data;
            // console.log( Result );
            if ( Status ) {
                if ( Status && Result && typeof Result === 'object' ) {
                    const resultArray = Object.values( Result );

                    const formatted = resultArray.map( ( opt, index ) => ( {
                        label: opt.block_name,
                        value: opt.id || index  // fallback for value if id is missing
                    } ) );

                    setOptRecords( formatted );
                    setRecords( resultArray );
                    // console.log(records)
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

    useEffect( () => {
        fetchPrisonBlocks();
    }, [BASE_URL] );

    return { records, optrecords, loading, refetch: fetchPrisonBlocks };
};

export default useFetchBandiPosts;
