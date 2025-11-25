import React, { useState, useEffect } from "react";
import { Container, Paper, Typography } from "@mui/material";
import MenuTree from "./MenuTree";
import MenuForm from "./MenuForm";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

export default function MenuPanel() {
  const BASE_URL = useBaseURL();
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, rolesRes] = await Promise.all([
          axios.get(`${BASE_URL}/menu/get_menus`, { withCredentials: true }),
          axios.get(`${BASE_URL}/menu/roles`, { withCredentials: true }),
        ]);
        // console.log(menuRes.data)
        setMenus(menuRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleFormSubmit = (menu) => {
    setMenus((prev) => {
      const index = prev.findIndex((m) => m.id === menu.id);
      if (index !== -1) {
        const newMenus = [...prev];
        newMenus[index] = menu;
        return newMenus;
      }
      return [...prev, menu];
    });
    setEditingMenu(null);
  };

  const handleDelete = async (menuId) => {
    try {
      await axios.delete(`${BASE_URL}/menu/menus/${menuId}`, { withCredentials: true });
      const removeFromTree = (items) =>
        items
          .filter((m) => m.id !== menuId)
          .map((m) => ({ ...m, children: m.children ? removeFromTree(m.children) : [] }));
      setMenus((prev) => removeFromTree(prev));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (menu) => {    
    setEditingMenu(menu);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Menu Management
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <MenuForm roles={roles} menus={menus} editingMenu={editingMenu} onSubmit={handleFormSubmit} />
      </Paper>
      <Paper sx={{ p: 2 }}>
        <MenuTree menus={menus} setMenus={setMenus} onEdit={handleEdit} onDelete={handleDelete} />
      </Paper>
    </Container>
  );
}
