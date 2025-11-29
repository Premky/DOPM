import React, { useEffect, useState } from "react";
import { TextField, Button, Select, MenuItem, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { usePermissionAPI } from "../../api/usePermissions";
import { useModuleAPI } from "../../api/useModule";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

const ManagePermissions = () => {
  const BASE_URL = useBaseURL();
  const {getModules} = useModuleAPI();
  const { getPermissions, createPermission, deletePermission } = usePermissionAPI();
  const [permissions, setPermissions] = useState( [] );
  const [modules, setModules] = useState( [] );
  const [moduleName, setModuleName] = useState( "" );
  const [actionName, setActionName] = useState( "" );

  // Fetch permissions from backend
  const fetchPermissions = async () => {
    const res = await getPermissions();
    console.log( res.data );
    setPermissions( res.data.map( p => ( { ...p, id: p.id } ) ) ); // DataGrid requires id
  };

  // Fetch modules from table_labels
  const fetchModules1 = async () => {
    try {
      // console.log("aklsdj")
      const res = await axios.get( `${ BASE_URL }/permission/modules`, { withCredentials: true } );
      console.log( "Modules response:", res.data.result.result ); // log actual data
      setModules( res.data.result.result ); // assuming backend returns array of modules
    } catch ( err ) {
      console.error( "Error fetching modules:", err );
    }
  };

  const fetchModules = async () => {
    // const res = await axios.get( `${ BASE_URL }/permission/modules`, { withCredentials: true } );
    const res = await getModules();
    // console.log( res );
    setModules( res );
  };

  const handleAdd = async () => {
    if ( !moduleName || !actionName ) return alert( "Module and Action are required" );
    await createPermission( { module_name: moduleName, action: actionName } );
    setModuleName( "" ); setActionName( "" );
    fetchPermissions();
  };

  const handleDelete = async ( id ) => {
    if ( !window.confirm( "Are you sure you want to delete this permission?" ) ) return;
    await deletePermission( id );
    fetchPermissions();
  };

  useEffect( () => { fetchModules(); fetchPermissions(); }, [] );

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "module_name", headerName: "Module", width: 180 },
    { field: "action_name", headerName: "Action", width: 180 },
    { field: "assigned_roles", headerName: "Assigned Roles", width: 200, valueGetter: ( params ) => params.row.assigned_roles?.join( ", " ) || "-" },
    { field: "assigned_users", headerName: "Assigned Users", width: 200, valueGetter: ( params ) => params.row.assigned_users?.join( ", " ) || "-" },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ( params ) => (
        <Button color="error" variant="contained" size="small" onClick={() => handleDelete( params.row.id )}>
          Delete
        </Button>
      )
    }
  ];

  return (
    <Box>
      <h3>Manage Permissions</h3>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Select value={moduleName} onChange={e => setModuleName( e.target.value )} displayEmpty sx={{ minWidth: 180 }}>
          <MenuItem value="" disabled>Select Module</MenuItem>
          {modules.map( m => <MenuItem key={m.table_name} value={m.table_name}>{m.display_name}</MenuItem> )}
        </Select>
        <Select value={actionName} onChange={e => setActionName( e.target.value )} displayEmpty sx={{ minWidth: 180 }}>
          <MenuItem value="" disabled>Select Action</MenuItem>
          <MenuItem value="create" >Create</MenuItem>
          <MenuItem value="read" >View</MenuItem>
          <MenuItem value="update" >Edit</MenuItem>
          <MenuItem value="delete" >Delete</MenuItem>
        </Select>
        
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Box>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={permissions}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>
    </Box>
  );
};

export default ManagePermissions;
