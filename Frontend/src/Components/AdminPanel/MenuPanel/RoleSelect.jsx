import React from "react";
import { Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput } from "@mui/material";

export default function RoleSelect({ roles, selectedRoles, setSelectedRoles }) {
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel>Roles</InputLabel>
      <Select
        multiple
        value={selectedRoles}
        onChange={(e) => setSelectedRoles(e.target.value)}
        input={<OutlinedInput label="Roles" />}
        renderValue={(selected) => selected.join(", ")}
      >
        {(roles || []).map((role) => (
          <MenuItem key={role.id} value={role.name}>
            <Checkbox checked={selectedRoles.includes(role.name)} />
            <ListItemText primary={role.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
