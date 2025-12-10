import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRoleAPI } from "../../api/useRoles";
import { usePermissionAPI } from "../../api/usePermissions";

const RolePermissions = () => {
  const { getRoles, assignRolePermissions } = useRoleAPI();
  const { getPermissions } = usePermissionAPI();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Load Roles & Permissions
  // -------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesRes = await getRoles();
        const rolesList = rolesRes?.result || [];
        setRoles(rolesList.map((r) => ({ ...r, id: r.id })));

        const permRes = await getPermissions();
        const permList = permRes?.result || [];
        setPermissions(permList.map((p) => ({ ...p, id: p.id })));
      } catch (err) {
        console.error("Error loading roles/permissions:", err);
      }
    };

    loadData();
  }, []);

  // -------------------------
  // Assign Permissions
  // -------------------------
  const handleAssign = async () => {
    if (!selectedRole) {
      alert("Please select a role!");
      return;
    }

    setLoading(true);
    try {
      await assignRolePermissions(selectedRole.id, selectedPermissions);
      alert("Permissions assigned successfully!");
      // Optionally reload roles to reflect updated permissions
      const rolesRes = await getRoles();
      const rolesList = rolesRes?.result?.result || [];
      setRoles(rolesList.map((r) => ({ ...r, id: r.id })));
    } catch (err) {
      console.error(err);
      alert("Error assigning permissions.");
    }
    setLoading(false);
  };

  // -------------------------
  // DataGrid Columns
  // -------------------------
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "role_name", headerName: "Role", width: 200 },
    {
      field: "permissions",
      headerName: "Assigned Permissions",
      width: 400,
      valueGetter: (params) =>
        params?.row?.permissions
          ?.map((p) => `${p.module_name}-${p.action_name}`)
          .join(", ") || "-",
    },
  ];

  return (
    <Box>
      <h3>Assign Permissions to Roles</h3>

      {/* Select Role */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Role</InputLabel>
        <Select
          value={selectedRole?.id || ""}
          onChange={(e) => {
            const role = roles.find((r) => r.id === e.target.value);
            setSelectedRole(role);
            setSelectedPermissions(role?.permissions?.map((p) => p.id) || []);
          }}
        >
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.role_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Select Permissions */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Permissions</InputLabel>
        <Select
          multiple
          value={selectedPermissions}
          onChange={(e) => setSelectedPermissions(e.target.value)}
          renderValue={(selected) =>
            selected
              .map((id) => permissions.find((p) => p.id === id)?.action_name)
              .join(", ")
          }
        >
          {permissions.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              <Checkbox checked={selectedPermissions.includes(p.id)} />
              <ListItemText
                primary={`${p.module_name} - ${p.action_name}`}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleAssign} disabled={loading}>
        {loading ? "Assigning..." : "Assign Permissions"}
      </Button>

      {/* Roles Table */}
      <Box sx={{ height: 400, mt: 3 }}>
        <DataGrid
          rows={roles}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default RolePermissions;
