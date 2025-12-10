import React, { useEffect, useState } from "react";
import { TextField, Button, Select, MenuItem, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { usePermissionAPI } from "../../api/usePermissions";
import { useModuleAPI } from "../../api/useModule";

const ManagePermissions = () => {
  const { getModules } = useModuleAPI();
  const { getPermissions, createPermission, deletePermission } = usePermissionAPI();

  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleName, setModuleName] = useState("");
  const [actionName, setActionName] = useState("");

  // -------------------------------
  // Fetch Permissions
  // -------------------------------
  const fetchPermissions = async () => {
    const res = await getPermissions();

    // Backend Shape:
    // { Status:true, result:{result:[...]}, message:"" }
    const list = res?.result?.result || [];

    setPermissions(list.map((p) => ({ ...p, id: p.id })));
  };

  // -------------------------------
  // Fetch Modules (table_labels)
  // -------------------------------
  const fetchModules = async () => {
    const res = await getModules();

    // Backend shape: { Status:true, result:{result:[...]}, message:"" }
    const mods = res?.data?.result || [];

    setModules(mods);
  };

  // -------------------------------
  // Add New Permission
  // -------------------------------
  const handleAdd = async () => {
    if (!moduleName || !actionName) {
      alert("Module & Action required");
      return;
    }

    await createPermission({
      module_name: moduleName,
      action_name: actionName,
    });

    setModuleName("");
    setActionName("");

    fetchPermissions();
  };

  // -------------------------------
  // Delete Permission
  // -------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permission?")) return;
    await deletePermission(id);
    fetchPermissions();
  };

  // Load data on mount
  useEffect(() => {
    fetchModules();
    fetchPermissions();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "module_name", headerName: "Module", width: 150 },
    { field: "action_name", headerName: "Action", width: 150 },
    {
      field: "assigned_roles",
      headerName: "Assigned Roles",
      width: 200,
      valueGetter: (params) => params.row.assigned_roles?.join(", ") || "-",
    },
    {
      field: "assigned_users",
      headerName: "Assigned Users",
      width: 200,
      valueGetter: (params) => params.row.assigned_users?.join(", ") || "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Button
          color="error"
          variant="contained"
          size="small"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <h3>Manage Permissions</h3>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* MODULE SELECT */}
        <Select
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="" disabled>
            Select Module
          </MenuItem>

          {modules.map((m) => (
            <MenuItem key={m.table_name} value={m.table_name}>
              {m.display_name}
            </MenuItem>
          ))}
        </Select>

        {/* ACTION SELECT */}
        <Select
          value={actionName}
          onChange={(e) => setActionName(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="" disabled>
            Select Action
          </MenuItem>
          <MenuItem value="create">Create</MenuItem>
          <MenuItem value="read">View</MenuItem>
          <MenuItem value="update">Edit</MenuItem>
          <MenuItem value="delete">Delete</MenuItem>
        </Select>

        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
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
