import React, { useState, useEffect } from "react";
import { TextField, Button, Stack } from "@mui/material";
import RoleSelect from "./RoleSelect";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

export default function MenuForm({ roles, editingMenu, onSubmit }) {
  const BASE_URL = useBaseURL();
  const [parent_id, setParent_id] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [path, setPath] = useState("");
  const [order_no, setOrder_no] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (editingMenu) {
      setParent_id(editingMenu.Parent_id);
      setTitle(editingMenu.title);
      setIcon(editingMenu.icon);
      setPath(editingMenu.link);
      setOrder_no(editingMenu.order_no);
      setSelectedRoles(editingMenu.roles || []);
    }
  }, [editingMenu]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const menu = { title, icon, path, roles: selectedRoles, parentId: editingMenu?.parentId };

    try {
      if (editingMenu) {
        const res = await axios.put(`${BASE_URL}/menu/menus/${editingMenu.id}`, menu, { withCredentials: true });
        onSubmit({ ...editingMenu, ...menu });
      } else {
        const res = await axios.post(`${BASE_URL}/menu/menus`, menu, { withCredentials: true });
        onSubmit({ ...menu, id: res.data.id });
      }

      setTitle("");
      setIcon("");
      setPath("");
      setSelectedRoles([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} direction="row" alignItems="center">
        <TextField label="Parent(Menu)" value={parent_id} onChange={(e) => setTitle(e.target.value)} required />
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextField label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} required />
        <TextField label="Path" value={path} onChange={(e) => setPath(e.target.value)} required />
        <TextField label="Order No." value={order_no} onChange={(e) => setPath(e.target.value)} required />
        <RoleSelect roles={roles} selectedRoles={selectedRoles} setSelectedRoles={setSelectedRoles} />
        <Button variant="contained" type="submit"> {editingMenu ? "Update" : "Add"} </Button>
      </Stack>
    </form>
  );
}
