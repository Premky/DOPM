import React, { useEffect, useState } from "react";
import axios from "axios";
import ReusableTable from "../../ReuseableComponents/ReuseTable";
import { useForm, Controller } from 'react-hook-form';
import { useBaseURL } from '../../../Context/BaseURLProvider';
const DriverTable = () => {
    // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    // const BASE_URL = localStorage.getItem('BASE_URL') 
    const BASE_URL = useBaseURL();
    const token = localStorage.getItem('token');
    const [formattedOptions, setFormattedOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors }, control } = useForm();
    const columns = [
        { field: "sn", headerName: "सि.नं." },
        { field: "vehicledistrict", headerName: "जिल्ला" },
        { field: "vehicle_name", headerName: "सवारी साधन", hide: true },
        { field: "vehicle_no", headerName: "गाडी नं." },
        { field: "start_route", headerName: "देखी" },
        { field: "end_route", headerName: "सम्म" },
        { field: "drivername", headerName: "चालक" },
        { field: "driverdob", headerName: "जन्म मिति" },
        { field: "country", headerName: "देश" },
        { field: "state", headerName: "प्रदेश" },
        { field: "district", headerName: "जिल्ला" },
        { field: "municipality", headerName: "स्थानिय तह" },
        { field: "driverward", headerName: "वडा नं." },
        { field: "driverfather", headerName: "चालकको बाबुको नाम" },
        { field: "lisence_no", headerName: "स.चा. अनुमती पत्र नं." },
        { field: "lisencecategory", headerName: "वर्ग" },
        { field: "driverctz_no", headerName: "नागरिकता नं." },
        { field: "ctz_iss", headerName: "जारी जिल्ला" },
        { field: "mentalhealth", headerName: "मानसिक स्वास्थ्य" },
        { field: "drivereye", headerName: "आँखा" },
        { field: "driverear", headerName: "कान" },
        { field: "drivermedicine", headerName: "औषधी सेवन कर्ता" },
        { field: "driverphoto", headerName: "फोटो" },
        { field: "remarks", headerName: "कैफियत" },
    ];

    const fetchDrivers = async () => {
        try {
            const url = `${BASE_URL}/driver/get_drivers`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Result, Error } = response.data;

            if (Status) {
                if (Array.isArray(Result) && Result.length > 0) {
                    setFormattedOptions(Result);
                } else {
                    console.log('No records found.');
                }
            } else {
                console.log(Error || 'Failed to fetch.');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleEdit1 = (row) => {
        console.log("Editing row:", row);

        // Reset the form with the row data
        reset({
            country: row.country_id,
            ctz_iss: row.ctziss_id,
            district: row.district_id,
            driverctz_no: row.driverctz_no,
            driverdob: row.driverdob,
            drivereye: row.drivereye,
            drivermedicine: row.drivermedicine,
            driverfather: row.driverfather,
            drivername: row.drivername,
            driverphoto: row.driverphoto,
            driverward: row.driverward,
            end_route: row.end_route,
            id: row.id,
            lisence_no: row.lisence_no,
            lisencecategory: row.category_id,
            mentalhealth: row.mentalhealth,
            municipality: row.municipality_id,
            remarks: row.remarks,
            start_route: row.start_route,
            state: row.state_id,
            vehicle_name: row.vehicle_name,
            vehicle_no: row.vehicle_no,
            vehicledistrict: row.vehicledistrict_id,
            vehiclename: row.vehiclename_id,
        });
    };

    const [editableData, setEditableData] = useState(null);
    const handleEdit = (row) => {
        console.log("Editing row:", row);
        console.log(row.driverctz_no)
        const values = {
            country: row.country_id,
            ctz_iss: row.ctziss_id,
            district: row.district_id,
            driverctz_no: row.driverctz_no,
            driverdob: row.driverdob,
            driverear: row.driverear,
            drivereye: row.drivereye,
            driverfather: row.driverfather,
            drivermedicine: row.drivermedicine,
            drivername: row.drivername,
            driverphoto: row.driverphoto,
            driverward: row.driverward,
            end_route: row.end_route,
            id: row.id,
            lisence_no: row.lisence_no,
            lisencecategory: row.category_id,
            mentalhealth: row.mentalhealth,
            municipality: row.municipality_id,
            remarks: row.remarks,
            start_route: row.start_route,
            state: row.state_id,
            vehicle_name: row.vehicle_name,
            vehicle_no: row.vehicle_no,
            vehicledistrict: row.vehicledistrict_id,
            vehiclename: row.vehiclename_id
        };
        setEditableData(values);
        
    };

    const handleDelete = async (id) => {
        console.log("Deleting row with id:", id);

        try {
            const url = `${BASE_URL}/driver/delete_driver/${id}`;
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Error } = response.data;
            if (Status) {
                alert("Driver record deleted successfully.");
                fetchDrivers(); // Re-fetch the drivers after deletion
            } else {
                console.log(Error || 'Failed to delete.');
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    const handleUpdate = async (data) => {
        console.log("Updating driver data:", data);

        try {
            const url = `${BASE_URL}/driver/update_driver/${data.id}`;
            const response = await axios.put(url, data, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const { Status, Error } = response.data;
            if (Status) {
                alert("Driver record updated successfully.");
                fetchDrivers(); // Re-fetch the drivers after update
            } else {
                console.log(Error || 'Failed to update.');
            }
        } catch (error) {
            console.error('Error updating record:', error);
        }
    };

    return (
        <div>
            <div><h1>Driver Details</h1></div>
            <form onSubmit={handleSubmit(handleUpdate)}>
                {/* Form fields here for driver update */}
                <ReusableTable
                    columns={columns}
                    rows={formattedOptions}
                    height="800"
                    showEdit={true}
                    showDelete={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    enableExport={true}
                />
            </form>
        </div>
    );
};

export default DriverTable;
