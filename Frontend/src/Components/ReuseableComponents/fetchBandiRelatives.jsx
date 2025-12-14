// hooks/useInternalAdmins.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const fetchBandiRelatives = ( bandi_id ) => {
  const BASE_URL = useBaseURL();
  const [records, setRecords] = useState( [] );
  const [optrecords, setOptRecords] = useState( [] );
  const [loading, setLoading] = useState( true );

  useEffect( () => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get( `${ BASE_URL }/bandi/get_bandi_family/${bandi_id}`, { withCredentials: true } );
  
        const { Status, Result, Error } = response.data;
        // console.log(Result)
        if(Status){
          if(Array.isArray(Result) && Result.length>0){
            const formatted = Result.map((opt, index)=>{
              return{
                label: `${opt.relative_name}||${opt.relative_address}||${opt.relative_contact_no}`,
                value: opt.id
              }
            })
            setOptRecords(formatted);
            setRecords( Result || [] );
          }else{
            console.log('No records found');
          }
        }else{
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

export default fetchBandiRelatives;
