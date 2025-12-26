import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useFetchPayroles = ( filters, page, rowsPerPage ) => {
  const BASE_URL = useBaseURL();
  const [data, setData] = useState( [] );
  const [allData, setAllData] = useState( [] );
  const [totalKaidi, setTotalKaidi] = useState( 0 );
  const [loading, setLoading] = useState( false );
  const [error, setError] = useState( null );
  const [fetchedMuddas, setFetchedMuddas] = useState( {} );
  const [fetchedFines, setFetchedFines] = useState( {} );
  const [fetchedNoPunarabedan, setFetchedNoPunarabedan] = useState( {} );

  const fetchData = useCallback( async () => {
    setLoading( true );
    try {
      const {
        searchOffice,
        nationality,
        searchpayroleStatus,
        searchpyarole_rakhan_upayukat,
        searchcourt_decision,
        searchpayrole_no_id,
        searchmudda_id,
        searchbandi_name,
        searchchecked,
        searchis_checked,
      } = filters || {};

      const res = await axios.get( `${ BASE_URL }/payrole/get_payroles`, {
        params: {
          page,
          limit: rowsPerPage,
          searchOffice,
          nationality,
          searchpayroleStatus,
          searchpyarole_rakhan_upayukat,
          searchcourt_decision,
          searchpayrole_no_id,
          searchmudda_id,
          searchbandi_name,
          searchchecked,
          searchis_checked,
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
        withCredentials: true,
      } );
      // console.log('Fetch response:', res.data);
      setData( res.data.Result || [] );
      setTotalKaidi( res.data.TotalCount || 0 );
      setError( null );

      const allRes = await axios.get( `${ BASE_URL }/payrole/get_payroles`, {
        params: {
          searchOffice,
          nationality,
          searchpayroleStatus,
          searchpyarole_rakhan_upayukat,
          searchcourt_decision,
          searchpayrole_no_id,
          searchmudda_id,
          searchbandi_name,
          searchchecked,
          searchis_checked,
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
        withCredentials: true,
      } );
      setAllData( allRes.data.Result || [] );

    } catch ( err ) {
      console.error( 'Fetch error', err );
      setError( err );
    } finally {
      setLoading( false );
    }
  }, [BASE_URL, filters, page, rowsPerPage] );

  const fetchMuddas = useCallback( async () => {
    try {
      const url = `${ BASE_URL }/payrole/get_bandi_mudda`;
      const response = await axios.get( url, { withCredentials: true } );
      const { Status, Result, Error } = response.data;

      if ( Status ) {
        const grouped = {};
        Result.forEach( ( mudda ) => {
          const bandiId = mudda.bandi_id;
          if ( !grouped[bandiId] ) grouped[bandiId] = [];
          grouped[bandiId].push( mudda );
        } );
        setFetchedMuddas( grouped );
      } else {
        console.warn( Error || 'Failed to fetch mudda.' );
        setFetchedMuddas( {} );
      }
    } catch ( error ) {
      console.error( 'Error fetching muddas:', error );
    }
  }, [BASE_URL] );

  const fetchFines = useCallback( async () => {
    try {
      const url = `${ BASE_URL }/bandi/get_bandi_fines`;
      const response = await axios.get( url, { withCredentials: true } );
      const { Status, Result, Error } = response.data;

      if ( Status ) {
        const grouped = {};
        Result.forEach( ( nop ) => {
          const bandiId = nop.bandi_id;
          if ( !grouped[bandiId] ) grouped[bandiId] = [];
          grouped[bandiId].push( nop );
        } );
        setFetchedFines( grouped );
      } else {
        console.warn( Error || 'Failed to fetch mudda.' );
        setFetchedFines( {} );
      }
    } catch ( error ) {
      console.error( 'Error fetching muddas:', error );
    }
  }, [BASE_URL] );

  const fetchNoPunrabedan = useCallback( async () => {
    try {
      const url = `${ BASE_URL }/bandi/get_bandi_no_punrabedan`;
      const response = await axios.get( url, { withCredentials: true } );
      const { Status, Result, Error } = response.data;

      if ( Status ) {
        const grouped = {};
        Result.forEach( ( fine ) => {
          const bandiId = fine.bandi_id;
          if ( !grouped[bandiId] ) grouped[bandiId] = [];
          grouped[bandiId].push( fine );
        } );
        setFetchedNoPunarabedan( grouped );
      } else {
        console.warn( Error || 'Failed to fetch mudda.' );
        setFetchedNoPunarabedan( {} );
      }
    } catch ( error ) {
      console.error( 'Error fetching muddas:', error );
    }
  }, [BASE_URL] );

  useEffect( () => {
    fetchData();
  }, [fetchData] );

  useEffect( () => {
    fetchMuddas();
  }, [fetchMuddas] );
  useEffect( () => {
    fetchFines();
  }, [fetchFines] );

  useEffect( () => {
    fetchNoPunrabedan();
  }, [fetchNoPunrabedan] );

  return {
    allData, data, totalKaidi, loading, error, fetchedMuddas, fetchedFines, fetchedNoPunarabedan,
    refetchNoPunarabedan: fetchNoPunrabedan, refetchPayrole: fetchData, refetchMuddas: fetchMuddas, refetchFines: fetchFines
  };
};

export default useFetchPayroles;
