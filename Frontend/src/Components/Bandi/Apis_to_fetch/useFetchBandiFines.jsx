// hooks/useInternalAdmins.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useFetchBandiFine = ( bandi_id ) => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );

    const fetchBandiFineRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get( `${ BASE_URL }/bandi/get_bandi_fine/${ bandi_id }`,
                { withCredentials: true } );
            console.log( BASE_URL, response );
            const { Status, Result, Error } = response.data;
            if ( Status ) {
                if ( Status && Result && typeof Result === 'object' ) {
                    const resultArray = Object.values( Result );

                    const formatted = resultArray.map( ( opt, index ) => ( {
                        label: opt.mudda_name,
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

    useEffect( () => {
        fetchBandiFineRecords();
    }, [BASE_URL, bandi_id] );

    return { bandiFine:records, optBandiFine:optrecords, bandiFineloading:loading, refetchBandiFine:fetchBandiFineRecords };
};

export default useFetchBandiFine;
