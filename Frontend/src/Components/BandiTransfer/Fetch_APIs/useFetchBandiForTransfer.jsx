import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useBaseURL } from '../../../Context/BaseURLProvider';


const useFetchBandiForTransfer = (filters, page, rowsPerPage) => {
  const BASE_URL = useBaseURL();
  const [data, setData] = useState([]);
  const [totalKaidi, setTotalKaidi] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedMuddas, setFetchedMuddas] = useState({});
  const [fetchedTransferHistory, setFetchedTransferHistory] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        searchOffice,
        searchToOffice,
        nationality,
        searchStatus,  
        transferReason,
        search_is_completed,      
        searchmudda_id,
        searchbandi_name,
        searchchecked,
        searchis_checked,
      } = filters || {};

      const res = await axios.get(`${BASE_URL}/bandiTransfer/get_transfer_bandi_ac_status`, {
        params: {
          // page,
          // limit: rowsPerPage,
          searchOffice,
          searchToOffice,
          // nationality,
          searchStatus,  
          transferReason,
          search_is_completed,        
          // searchmudda_id,
          searchbandi_name,
          // searchchecked,
          // searchis_checked,
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
        withCredentials: true,
      });
      // console.log('Fetch response:', res.data);
      setData(res.data.Result || []);
      setTotalKaidi(res.data.TotalCount || 0);
      setError(null);
    } catch (err) {
      console.error('Fetch error', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, filters, page, rowsPerPage]);

  const fetchMuddas = useCallback(async () => {
    try {
      const url = `${BASE_URL}/bandi/get_bandi_mudda`;
      const response = await axios.get(url, { withCredentials: true });
      const { Status, Result, Error } = response.data;

      if (Status) {
        const grouped = {};
        Result.forEach((mudda) => {
          const bandiId = mudda.bandi_id;
          if (!grouped[bandiId]) grouped[bandiId] = [];
          grouped[bandiId].push(mudda);
        });
        setFetchedMuddas(grouped);
      } else {
        console.warn(Error || 'Failed to fetch mudda.');
        setFetchedMuddas({});
      }
    } catch (error) {
      console.error('Error fetching muddas:', error);
    }
  }, [BASE_URL]);

  const fetchTransferHistory = useCallback(async () => {
    try {
      const url = `${BASE_URL}/bandiTransfer/get_bandi_transfer_history`;
      const response = await axios.get(url, { withCredentials: true });
      const { Status, Result, Error } = response.data;    
        
      if (Status) {
        const grouped = {};
        Result.forEach((row) => {
          const bandiId = row.bandi_id;
          if (!grouped[bandiId]) grouped[bandiId] = [];
          grouped[bandiId].push(row);
        });
        setFetchedTransferHistory(grouped);
      } else {
        console.warn(Error || 'Failed to fetch mudda.');
        setFetchedTransferHistory({});
      }
    } catch (error) {
      console.error('Error fetching muddas:', error);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchMuddas();
    fetchTransferHistory();
  }, []);

  return { data, totalKaidi, loading, error, fetchedMuddas, fetchedTransferHistory, 
    refetchTransferHisotry:fetchTransferHistory, 
    refetchData: fetchData, 
    refetchMuddas: fetchMuddas };
};

export default useFetchBandiForTransfer;
