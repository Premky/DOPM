// hooks/useInternalAdmins.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useFetchBandiReleaseReasons = ( bandi_id ) => {
    // console.log("Fetching disabilities for bandi_id:", bandi_id);
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );

    const fetchReleaseReasons = async () => {
        try {
            setLoading( true );
            const joinURL = ( base, path ) => base.replace( /\/$/, '' ) + '/' + path.replace( /^\//, '' );
            const url = joinURL( BASE_URL, `/public/get_bandi_release_reasons`);

            // const response = await axios.get( `${ BASE_URL }/bandi/get_bandi_disability/${ bandi_id }`,
            //     { withCredentials: true } );
            const response = await axios.get( url, { withCredentials: true } );

            // console.log( response );
            const { Status, Result, Error } = response.data;
            if ( Status ) {
                if ( Status && Result && typeof Result === 'object' ) {
                    const resultArray = Object.values( Result );

                    const formatted = resultArray.map( ( opt, index ) => ( {
                        label: opt.reasons_np,
                        value: opt.id || index  // fallback for value if id is missing
                    } ) );
                    // console.log(formatted)
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
        if ( bandi_id ) {
            fetchReleaseReasons();
        }
    }, [BASE_URL, bandi_id] );

    return { records, optrecords, loading, refetchReleaseReasons: fetchReleaseReasons };
};

export default useFetchBandiReleaseReasons;
