// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const fetchMuddaWiseCount = ( bandi_id ) => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState( [] );
    const [optrecords, setOptRecords] = useState( [] );
    const [loading, setLoading] = useState( true );

    const [muddawisetotal, setMuddawisetotal] = useState( {
        KaidiMale: 0,
        KaidiFemale: 0,
        ThunuwaMale: 0,
        ThunuwaFemale: 0,
        KaidiAgeAbove65: 0,
        ThunuwaAgeAbove65: 0,
        TotalAashrit: 0,
        Total: 0,
    } );

    const calculateTotals = ( data ) => {
        const totals = data.reduce(
            ( acc, record ) => ( {
                KaidiTotal: acc.KaidiTotal + ( parseInt( record.KaidiTotal ) || 0 ),
                ThunuwaTotal: acc.ThunuwaTotal + ( parseInt( record.ThunuwaTotal ) || 0 ),
                KaidiMale: acc.KaidiMale + ( parseInt( record.KaidiMale ) || 0 ),
                KaidiFemale: acc.KaidiFemale + ( parseInt( record.KaidiFemale ) || 0 ),
                ThunuwaMale: acc.ThunuwaMale + ( parseInt( record.ThunuwaMale ) || 0 ),
                ThunuwaFemale: acc.ThunuwaFemale + ( parseInt( record.ThunuwaFemale ) || 0 ),
                SumOfArrestedInDateRange: acc.SumOfArrestedInDateRange + ( parseInt( record.TotalArrestedInDateRange ) || 0 ),
                SumOfReleasedInDateRange: acc.SumOfReleasedInDateRange + ( parseInt( record.TotalReleasedInDateRange ) || 0 ),                
                KaidiAgeAbove65: acc.KaidiAgeAbove65 + ( parseInt( record.KaidiAgeAbove65 ) || 0 ),
                ThunuwaAgeAbove65: acc.ThunuwaAgeAbove65 + ( parseInt( record.ThunuwaAgeAbove65 ) || 0 ),
                Nabalak: acc.Nabalak + ( parseInt( record.Nabalak ) || 0 ),
                Nabalika: acc.Nabalika + ( parseInt( record.Nabalika ) || 0 ),
                Total: acc.Total + ( parseInt( record.Total ) || 0 ),
            } ),
            {
                KaidiTotal: 0, ThunuwaTotal: 0, KaidiMale: 0, KaidiFemale: 0, ThunuwaMale: 0, ThunuwaFemale: 0,
                SumOfArrestedInDateRange: 0, SumOfReleasedInDateRange: 0,KaidiAgeAbove65:0, ThunuwaAgeAbove65: 0, Nabalak: 0, Nabalika: 0, Total: 0
            }
        );
        setMuddawisetotal( totals );
        // console.log(totals)
    };


    useEffect( () => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get( `${ BASE_URL }/bandi/get_prisioners_count`, { withCredentials: true } );
                // console.log( response );
                const { Status, Result, Error } = response.data;
                if ( Status ) {
                    if ( Status && Result && typeof Result === 'object' ) {
                        const resultArray = Object.values( Result );

                        const formatted = resultArray.map( ( opt, index ) => ( {
                            label: `${ opt.relative_name || '' }||${ opt.relative_address || '' }||${ opt.relative_contact_no || '' }`,
                            value: opt.id || index  // fallback for value if id is missing
                        } ) );

                        setOptRecords( formatted );
                        setRecords( resultArray );
                        calculateTotals(resultArray);
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

    return { records, muddawisetotal, optrecords, loading };
};

export default fetchMuddaWiseCount;
