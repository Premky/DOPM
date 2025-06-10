import React, { useEffect, useState } from "react";
import { useBaseURL } from "../../Context/BaseURLProvider";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TableSortLabel,
    Button
} from "@mui/material";
import axios from "axios";
// import expotLongTable from "ExportLongTable";
import exportLongTable from "../VehicleAccident/ExportLongTable";
const AccidentLongTable = () => {
    const BASE_URL = useBaseURL();
    const [data, setData] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [typesAndReasons, setTypesAndReasons] = useState([]);

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

    const fetchVehicles = async () => {
        const url = `${BASE_URL}/accident/get_accident_records`;
        const result = await fetchData(url);
        // console.log(result.vehicles);
        setData(result.records);
        setVehicles(result.vehicles);
        setTypesAndReasons(result.typesAndReasons);
    };

    const groupedReasons = typesAndReasons.reduce((acc, item) => {
        if (!item?.accident_type || !item?.accident_reason) return acc;
        if (!acc[item.accident_type]) acc[item.accident_type] = [];
        if (!acc[item.accident_type].includes(item.accident_reason)) {
            acc[item.accident_type].push(item.accident_reason);
        }
        return acc;
    }, {});

    const handleExport = () => {
        const grouped = {};
        data.forEach(item => {
            const key = `${item.date}-${item.accident_time}-${item.location}`;
            if (!grouped[key]) {
                grouped[key] = {
                    ...item,
                    vehicles: {},
                    reasons: {},
                };
            }
            // grouped[key].vehicles[item.vehicle_name] =
            //     (grouped[key].vehicles[item.vehicle_name] || 0) + item.count;
            grouped[key].vehicles[item.vehicle_name] = item.count;
            grouped[key].reasons[item.accident_reason] = item.count;
        });

        const groupedArray = Object.values(grouped);
        exportLongTable(groupedArray, vehicles, typesAndReasons);  // pass grouped array
    };


    useEffect(() => {
        fetchVehicles();
    }, []);

    const [search, setSearch] = useState("");

    const filteredData = Object.values(data).filter(row =>
        row.location?.toLowerCase().includes(search.toLowerCase()) ||
        row.date?.includes(search)
    );



    const renderTableHeader = () => (
        <TableHead>
            <TableRow >
                <TableCell rowSpan="3">सि.नं.</TableCell>
                <TableCell rowSpan="3">मिति</TableCell>
                <TableCell rowSpan="3">समय</TableCell>
                <TableCell rowSpan="3">स्थान</TableCell>
                <TableCell rowSpan="3">सडक</TableCell>
                <TableCell rowSpan="3">ठाउको नाम</TableCell>

                <TableCell colSpan={vehicles.length + 1} >सवारी साधन</TableCell>
                <TableCell colSpan='15'> मानव </TableCell>
                <TableCell rowSpan='2' colSpan={2}> चौपाया </TableCell>

                <TableCell colSpan={6}> दुर्घटना भएको समय </TableCell>

                <TableCell colSpan={Object.keys(groupedReasons).reduce((acc, type) =>
                    acc + groupedReasons[type].length, 0)}>दुर्घटनाको कारण
                </TableCell>
                <TableCell rowSpan={3}>जम्मा सवारी दुर्घटना संख्या</TableCell>
                <TableCell rowSpan={3}>जम्मा सवारी साधन क्षेती</TableCell>
                <TableCell rowSpan={3}>अनुमानित रकम</TableCell>
                <TableCell rowSpan={3}>कसरी सवारी दुर्घटना भएको</TableCell>
                <TableCell rowSpan={3}>कैफियत</TableCell>
            </TableRow>

            <TableRow>
                {vehicles.map(v => <TableCell key={v} rowSpan={2}>{v}</TableCell>)}

                <TableCell rowSpan={2}>जम्मा</TableCell>
                <TableCell colSpan={5}>मृत्यु</TableCell>
                <TableCell colSpan={5}>गम्भिर घाईते</TableCell>
                <TableCell colSpan={5}>साधारण घाईते</TableCell>

                <TableCell rowSpan={2}>00:06/12:00</TableCell>
                <TableCell rowSpan={2}>00:12/18:00</TableCell>
                <TableCell rowSpan={2}>00:18/00:00</TableCell>
                <TableCell rowSpan={2}>00:/06:00</TableCell>
                <TableCell rowSpan={2}>समय नखुलेको</TableCell>
                <TableCell rowSpan={2}>जम्मा</TableCell>
                {Object.keys(groupedReasons).map((type, i) => (
                    <TableCell key={`${type}-${i}`} colSpan={groupedReasons[type].length}>{type}</TableCell>
                ))}
            </TableRow>

            <TableRow>
                <TableCell>पुरुष</TableCell>
                <TableCell>महिला</TableCell>
                <TableCell>बालक</TableCell>
                <TableCell>बालिका</TableCell>
                {/* <TableCell>अन्य</TableCell> */}
                <TableCell>जम्मा</TableCell>

                <TableCell>पुरुष</TableCell>
                <TableCell>महिला</TableCell>
                <TableCell>बालक</TableCell>
                <TableCell>बालिका</TableCell>
                {/* <TableCell>अन्य</TableCell> */}
                <TableCell>जम्मा</TableCell>

                <TableCell>पुरुष</TableCell>
                <TableCell>महिला</TableCell>
                <TableCell>बालक</TableCell>
                <TableCell>बालिका</TableCell>
                {/* <TableCell>अन्य</TableCell> */}
                <TableCell>जम्मा</TableCell>

                <TableCell>मृत्यु</TableCell>
                <TableCell>घाईते</TableCell>

                {Object.entries(groupedReasons).map(([type, reasons], i) => (
                    <React.Fragment key={`${type}-${i}`}>
                        {reasons.map((reason, j) => (
                            <TableCell key={`${type}-${reason}-${j}`}>{reason}</TableCell>
                        ))}
                    </React.Fragment>
                ))}



            </TableRow>
        </TableHead>
    );

    const renderTableRows = () => {
        const grouped = {};

        data.forEach(item => {
            const key = `${item.date}-${item.accident_time}-${item.location}`;
            if (!grouped[key]) {
                grouped[key] = {
                    date: item.date,
                    state: item.state,
                    district: item.district,
                    municipality: item.municipality,
                    ward: item.ward,
                    road_name: item.road_name,
                    accident_location: item.accident_location,
                    accident_time: item.accident_time,

                    death_male: item.death_male,
                    death_female: item.death_female,
                    death_boy: item.death_boy,
                    death_girl: item.death_girl,
                    death_total: item.death_total,

                    gambhir_male: item.gambhir_male,
                    gambhir_female: item.gambhir_female,
                    gambhir_boy: item.gambhir_boy,
                    gambhir_girl: item.gambhir_girl,
                    gambhir_total: item.gambhir_total,

                    general_male: item.general_male,
                    general_female: item.general_female,
                    general_boy: item.general_boy,
                    general_girl: item.general_girl,
                    general_total: item.general_total,

                    animal_death: item.animal_death,
                    animal_injured: item.animal_injured,
                    est_amount: item.est_amount,
                    damage_vehicle: item.damage_vehicle,
                    txt_accident_reason: item.txt_accident_reason,

                    remarks: item.remarks,
                    office_id: item.office_id,
                    created_by: item.created_by,
                    updated_by: item.updated_by,

                    location: item.location,
                    vehicles: {},

                    reasons: {}
                };
            }
            // {vehicles.map(v => <TableCell key={v} rowSpan={2}>{v}</TableCell>)}
            grouped[key].vehicles[item.vehicle_name] = item.count;
            grouped[key].reasons[item.accident_reason] = item.count;
        });
        // const total_vehicle = Object.values(row.vehicles || {}).reduce((sum, count) => sum + count, 0)      

        return Object.values(grouped).map((row, index) => (
            <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.accident_time}</TableCell>
                <TableCell>{row.accident_location}</TableCell>
                <TableCell>{row.road_name}</TableCell>
                <TableCell>{row.location}</TableCell>

                {vehicles.map(v => (
                    <TableCell key={v}>
                        {row.vehicles && row.vehicles[v] ? row.vehicles[v] : 0}
                    </TableCell>
                ))}

                <TableCell>
                    {Object.values(row.vehicles || {}).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                </TableCell>

                <TableCell>{row.death_male}</TableCell>
                <TableCell>{row.death_female}</TableCell>
                <TableCell>{row.death_boy}</TableCell>
                <TableCell>{row.death_girl}</TableCell>
                <TableCell>{row.death_total}</TableCell>

                <TableCell>{row.gambhir_male}</TableCell>
                <TableCell>{row.gambhir_female}</TableCell>
                <TableCell>{row.gambhir_boy}</TableCell>
                <TableCell>{row.gambhir_girl}</TableCell>
                <TableCell>{row.gambhir_total}</TableCell>

                <TableCell>{row.general_male}</TableCell>
                <TableCell>{row.general_female}</TableCell>
                <TableCell>{row.general_boy}</TableCell>
                <TableCell>{row.general_girl}</TableCell>
                <TableCell>{row.general_total}</TableCell>

                <TableCell>{row.animal_death}</TableCell>
                <TableCell>{row.animal_injured}</TableCell>

                <TableCell>{row.accident_time > "00:06" && row.accident_time < "12:00" ? 1 : 0}</TableCell>
                <TableCell>{row.accident_time > "12:00" && row.accident_time < "18:00" ? 1 : 0}</TableCell>
                <TableCell>{row.accident_time > "18:00" && row.accident_time < "00:00" ? 1 : 0}</TableCell>
                <TableCell>{row.accident_time > "00:00" && row.accident_time < "00:06" ? 1 : 0}</TableCell>
                <TableCell>{!row.accident_time ? 1 : 0}</TableCell>

                <TableCell>
                    जम्मा
                </TableCell>


                {Object.entries(groupedReasons).map(([type, reasons], i) => (
                    <React.Fragment key={`${type}-${i}`}>
                        {reasons.map((reason, j) => (
                            <TableCell key={`${type}-${reason}-${j}`}>{row.reasons[reason] || 0}</TableCell>
                        ))}
                    </React.Fragment>
                ))}
                {/* <TableCell>{Object.values(row.reasons || {}).reduce((sum, count) => sum + count, 0)}</TableCell> */}
                {/* <TableCell>x</TableCell> */}
                <TableCell>1</TableCell>
                <TableCell>{row.damage_vehicle}</TableCell>
                <TableCell>{row.est_amount}</TableCell>
                <TableCell>{row.txt_accident_reason}</TableCell>
                <TableCell>{row.remarks}</TableCell>
            </TableRow>
        ));
    };

    return (
        <>
            <h2>दुर्घटना विवरण तालिका</h2>
            <Button onClick={handleExport} variant="contained" color="primary" style={{ margin: "10px" }}>
                Download Excel
            </Button>

            <input
                type="text"
                placeholder="स्थान वा मिति खोज्नुहोस्..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ margin: "10px", padding: "5px", width: "300px" }}
            />


            <TableContainer component={Paper} >
                <Table border={1} size="small" stickyHeader>
                    {renderTableHeader()}
                    <TableBody>
                        {renderTableRows()}
                    </TableBody>
                </Table>
            </TableContainer>


        </>
    )
}

export default AccidentLongTable
