import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Card,
    Modal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import ReusableTable from "../../Components/ReuseableComponents/ReusableTable";
import { useBaseURL } from "../../Context/BaseURLProvider";
import { useAuth } from "../../Context/AuthContext";

const allowedFields = [
    "bandi_name",
    "dob",
    "gender",
    "nationality",
    "mudda_details",
    "remarks",
];

const AuditTable = () => {
    const baseURL = useBaseURL();
    const { token } = useAuth();

    const [logs, setLogs] = useState( [] );
    const [tableName, setTableName] = useState( "" );
    const [recordId, setRecordId] = useState( "" );
    const [action, setAction] = useState( "" );

    const [openModal, setOpenModal] = useState( false );
    const [modalData, setModalData] = useState( null );

    const fetchLogs = async () => {
        try {
            const res = await axios.get( `${ baseURL }/audit/logs`, {
                headers: { Authorization: `Bearer ${ token }` },
                withCredentials: true,
                params: { table: tableName, recordId, action },
            } );
            setLogs( res.data || [] );
        } catch ( err ) {
            console.error( err );
        }
    };

    useEffect( () => {
        fetchLogs();
    }, [] );

    const handleView = async ( auditId ) => {
        try {
            const res = await axios.get( `${ baseURL }/audit/log/${ auditId }`, {
                headers: { Authorization: `Bearer ${ token }` },
                withCredentials: true,
            } );
            console.log( res.data );
            setModalData( res.data );
            setOpenModal( true );
        } catch ( err ) {
            console.error( err );
        }
    };

    const handleRestore = async ( auditId ) => {
        if ( !window.confirm( "Do you really want to restore this record?" ) ) return;
        try {
            await axios.post(
                `${ baseURL }/audit/restore/${ auditId }`,
                {},
                { headers: { Authorization: `Bearer ${ token }` }, withCredentials:true }
            );
            alert( "Record Restored Successfully" );
            fetchLogs();
        } catch ( err ) {
            console.error( err );
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "display_table_name", headerName: "Table", width: 150 },
        { field: "record_id", headerName: "Record ID", width: 100 },
        { field: "action", headerName: "Action Taken", width: 120 },
        { field: "changed_by", headerName: "User", width: 120 },
        { field: "changed_at", headerName: "Date", width: 150 },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            viewHandler: handleView,
            restoreHandler: handleRestore,
        },
    ];

    const AuditModalContent = ( { modalData } ) => {
        if ( !modalData ) return null;

        const fields = modalData.fields || {};
        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>Old Value</TableCell>
                            <TableCell>New Value</TableCell>
                        </TableRow>
                    </TableHead>
                    {/* <TableBody>
                        {
                        allFields.map( ( field ) => {
                            const oldVal = oldData[field] ?? "-";
                            const newVal = newData[field] ?? "-";
                            const isUpdated = oldVal !== newVal;
                            return (
                                <TableRow key={field}>
                                    <TableCell>{label}</TableCell>
                                    <TableCell>{oldVal}</TableCell>
                                    <TableCell
                                        sx={{
                                            backgroundColor: isUpdated
                                                ? "rgba(255, 235, 59, 0.3)"
                                                : "transparent",
                                        }}
                                    >
                                        {newVal}
                                    </TableCell>
                                </TableRow>
                            );
                        } )}
                    </TableBody> */}
                    <TableBody>
                        {Object.entries( fields ).map( ( [key, item] ) => {
                            const isUpdated = item.old !== item.new;

                            return (
                                <TableRow key={key}>
                                    <TableCell>{item.label}</TableCell>  {/* ✅ display_name */}
                                    <TableCell>{item.old ?? "-"}</TableCell>
                                    <TableCell
                                        sx={{
                                            backgroundColor: isUpdated
                                                ? "rgba(255, 235, 59, 0.3)"
                                                : "transparent",
                                        }}
                                    >
                                        {item.new ?? "-"}
                                    </TableCell>
                                </TableRow>
                            );
                        } )}
                    </TableBody>

                </Table>
            </TableContainer>
        );
    };

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h5">Audit Logs</Typography>

            {/* Filters */}
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <TextField
                    size="small"
                    label="Table Name"
                    value={tableName}
                    onChange={( e ) => setTableName( e.target.value )}
                />
                <TextField
                    size="small"
                    label="Record ID"
                    value={recordId}
                    onChange={( e ) => setRecordId( e.target.value )}
                />
                <Select
                    size="small"
                    displayEmpty
                    value={action}
                    onChange={( e ) => setAction( e.target.value )}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="insert">Insert</MenuItem>
                    <MenuItem value="update">Update</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                    <MenuItem value="restore">Restore</MenuItem>
                </Select>
                <Button variant="contained" onClick={fetchLogs}>
                    Search
                </Button>
            </Box>

            {/* Table */}
            <Box sx={{ mt: 3 }}>
                <ReusableTable rows={logs} columns={columns} pageSize={20} />
            </Box>

            {/* Modal */}
            <Modal open={openModal} onClose={() => setOpenModal( false )}>
                <Box
                    sx={{
                        p: 3,
                        bgcolor: "white",
                        mx: "auto",
                        width: "80%",
                        borderRadius: 2,
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h6">Change Details</Typography>
                    <AuditModalContent modalData={modalData} />
                </Box>
            </Modal>
        </Card>
    );
};

export default AuditTable;
