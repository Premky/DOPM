// hooks/useInternalAdmins.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useFetchBandiForTransfer = ( {status, bandi_id} ) => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );
    console.log(status)
    const fetchBandiForTransfer = async () => {
        try {
            setLoading(true);
            const response = await axios.get( `${ BASE_URL }/bandiTransfer/get_transfer_bandi_ac_status`,
                {params:{status, bandi_id}, withCredentials: true } );
                const { Status, Result, Error } = response.data;
                console.log( Result );
            if ( Status ) {
                if ( Status && Result && typeof Result === 'object' ) {
                    const resultArray = Object.values( Result );

                    const formatted = resultArray.map( ( opt, index ) => ( {
                        label: `${opt.office_bandi_id} | ${opt.bandi_type} ${opt.bandi_name}`,
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
        fetchBandiForTransfer();
    }, [BASE_URL, status] );

    return { records, optrecords, loading, refetch:fetchBandiForTransfer };
};

export default useFetchBandiForTransfer;
