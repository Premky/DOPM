import axios from 'axios';
import React, { useEffect, useState } from 'react'

import { useForm, Controller } from 'react-hook-form';
import ReusableTable from '../ReuseableComponents/ReuseTable';
import { useBaseURL } from '../../Context/BaseURLProvider'; // Import the custom hook for base URL

const AccidentShortTable = () => {
    const BASE_URL = useBaseURL();
    // const BASE_URL = localStorage.getItem('BASE_URL');
    // API fetch function
    const fetchData = async (url, params = {}) => {
        try {
            const response = await axios.get(url, {
                params,
                withCredentials: true,
            });
            const { Status, Result, Error } = response.data;
            // console.log('Response:', response.data);
            if (Status) {
                return response.data || [];
            } else {
                console.error(Error || 'Failed to fetch records');
                return [];
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while fetching data.');
            return [];
        }
    };

    const [accidentRecords, setAccidentRecords] = useState([]); // State to manage accident records
    const [formattedOptions, setFormattedOptions] = useState([]);

    const fetchAccidentRecords = async () => {
        const url = `${BASE_URL}/accident/get_accident_records`;
        const result = await fetchData(url);        
        const formatted = result.records.map((item, index) => ({
            ...item,
            id: item.id || index,
            sn: index + 1,            
        }))
        // console.log("Vehicles:", formatted);
        setFormattedOptions(formatted);
        setAccidentRecords(result);
    };

    useEffect(() => {        
        fetchAccidentRecords();
    }, []); // Fetch accident records on component mount

    //Table Columns
    const columns = [
        { field: "sn", headerName: "सि.नं." },
        { field: "date", headerName: "दुर्घटना मिति" },
        { field: "accident_time", headerName: "दुर्घटना समय" },
        { field: "district", headerName: "जिल्ला" },
        { field: "accident_location", headerName: "दुर्घटना स्थान" },
        { field: "road_name", headerName: "सडकको नाम" },
        { field: "total_general", headerName: "सामान्य घाइतेको संख्या" },
        { field: "total_gambhir", headerName: "गम्भिर घाइतेको संख्या" },
        { field: "total_death", headerName: "मृतकको संख्या" },
        { field: "vehicle_name", headerName: "सवारी साधन संलग्न" },
        { field: "remarks", headerName: "कैफियत" },
    ]
    return (
        <>
            <ReusableTable
                columns={columns}
                rows={formattedOptions}
                height="800"
                // showEdit={true}
                // showDelete={true}
                // onEdit={handleEdit}
                // onDelete={handleDelete}
                enableExport={true}
            />
        </>
    )
}

export default AccidentShortTable
