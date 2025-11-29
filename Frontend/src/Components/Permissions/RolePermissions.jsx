import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getRoles, assignRolePermissions } from "../../api/roles";
import { usePermissionAPI } from "../../api/usePermissions";

const RolePermissions = () => {
  const {getPermissions} = usePermissionAPI();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    getRoles().then(res => setRoles(res.data.map(r => ({ ...r, id: r.id }))));
    getPermissions().then(res => setPermissions(res.data.map(p => ({ ...p, id: p.id }))));
  }, []);

  const handleAssign = async () => {
    if (!selectedRole) return alert("Select a role");
    await assignRolePermissions(selectedRole.id, selectedPermissions);
    alert("Permissions assigned!");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "role_name", headerName: "Role", width: 200 },
    { field: "permissions", headerName: "Assigned Permissions", width: 400, valueGetter: (params) => params.row.permissions?.map(p => `${p.module_name}-${p.action_name}`).join(", ") || "-" }
  ];

  return (
    <Box>
      <h3>Assign Permissions to Roles</h3>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Role</InputLabel>
        <Select
          value={selectedRole ? selectedRole.id : ""}
          onChange={e => setSelectedRole(roles.find(r => r.id === e.target.value))}
        >
          {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.role_name}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Permissions</InputLabel>
        <Select
          multiple
          value={selectedPermissions}
          onChange={e => setSelectedPermissions(e.target.value)}
          renderValue={(selected) => selected.map(id => permissions.find(p => p.id === id)?.action_name).join(", ")}
        >
          {permissions.map(p => (
            <MenuItem key={p.id} value={p.id}>
              <Checkbox checked={selectedPermissions.includes(p.id)} />
              <ListItemText primary={`${p.module_name} - ${p.action_name}`} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleAssign}>Assign Permissions</Button>

      <Box sx={{ height: 400, mt: 3 }}>
        <DataGrid rows={roles} columns={columns} pageSize={10} rowsPerPageOptions={[5,10]} disableSelectionOnClick />
      </Box>
    </Box>
  );
};

export default RolePermissions;
