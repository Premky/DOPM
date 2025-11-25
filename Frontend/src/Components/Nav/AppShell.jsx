// src/layouts/AppShell.jsx
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Topbar from "./Topbar";
import MiniDrawer from "../Components/Nav/MiniDrawer";
import { Outlet } from "react-router-dom";

const drawerWidth = 180; // must match MiniDrawer

export default function AppShell({ menus = [], user }) {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      
      {/* TOPBAR */}
      <Topbar 
        open={open}
        setOpen={setOpen}
        drawerWidth={drawerWidth}
        user={user}
      />

      {/* MINI DRAWER SIDEBAR */}
      <MiniDrawer 
        menus={menus}
        open={open}
      />

      {/* MAIN CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: open ? `${drawerWidth}px` : "65px",
          mt: `64px`,
          p: 2,
          transition: "all 0.3s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
