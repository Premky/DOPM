import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { styled } from "@mui/material/styles";
import MiniDrawer from "../Nav/MiniDrawer";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";

import { useBaseURL } from "../../Context/BaseURLProvider";
import { useAuth } from "../../Context/AuthContext";
import Swal from "sweetalert2";
import ResetPasswordDialog from "../Auth/ResetPasswordDialog";

const drawerWidth = 5;
const miniDrawerWidth = 5;

// 🔥 FIX: Add paddingTop = AppBar height (64px)
const MainContent = styled( "main" )( ( { open, theme } ) => ( {
  flexGrow: 1,
  padding: theme.spacing( 3 ),
  transition: "all 0.3s ease",
  marginLeft: open ? drawerWidth : miniDrawerWidth,
  paddingTop: "68px",       // FIXED (AppBar = 64px, + spacing)
} ) );

export default function ProtectedLayoutWithDrawer() {
  const { dispatch, state: authState } = useAuth();

  const [menus, setMenus] = useState( [] );
  const [drawerOpen, setDrawerOpen] = useState( true );

  const [anchorEl, setAnchorEl] = useState( null );
  const openMenu = Boolean( anchorEl );

  const BASE_URL = useBaseURL();
  const navigate = useNavigate();

  useEffect( () => {
    async function fetchMenus() {
      try {
        const res = await axios.get( `${ BASE_URL }/auth/get_menus`, {
          withCredentials: true,
        } );
        setMenus( res.data );
      } catch ( err ) {
        console.error( "Failed to fetch menus:", err );
      }
    }
    fetchMenus();
  }, [] );

  const toggleDrawer = () => setDrawerOpen( ( prev ) => !prev );

  const handleUserMenu = ( event ) => setAnchorEl( event.currentTarget );
  const handleClose = () => setAnchorEl( null );

  const handleLogout = async () => {
    try {
      await axios.post( `${ BASE_URL }/auth/logout`, {}, { withCredentials: true } );
      dispatch( { type: "LOGOUT" } );
      localStorage.removeItem( "token" );
      navigate( "/login" );

      Swal.fire( {
        title: "Logged Out",
        text: "You have been successfully logged out!",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      } );

    } catch ( error ) {
      Swal.fire( {
        title: "Logout Failed",
        text: error?.response?.data?.message || error.message,
        icon: "error",
      } );
    }
  };

  const [resetPasswordOpen, setResetPasswordOpen] = useState( false );
  const changePassword = () => {
    setResetPasswordOpen( true );
  };

  const handlePasswordChange = async ( formData ) => {
    try {
      const res = await axios.put( `${ BASE_URL }/auth/reset_password`, formData, { withCredentials: true } );
      Swal.fire( { title: "Password Changed", icon: "success" } );
      setResetPasswordOpen( false );
      // navigate( '/bandi' );
      handleLogout();
    } catch ( err ) {
      Swal.fire( {
        title: "Password Change Failed",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
      } );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ResetPasswordDialog
        editingData={{
          user_id: authState?.id || '',
        }}
        open={resetPasswordOpen}
        onClose={() => {
          setResetPasswordOpen( false );
          navigate( '/bandi' );
        }}
        onSave={handlePasswordChange}
      />
      {/* 🔥 FIX: drawer pushed under AppBar */}
      <div style={{ marginTop: "64px" }}>
        <MiniDrawer menus={menus} open={drawerOpen} />
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        {/* TOPBAR */}
        <AppBar position="fixed" color="primary" sx={{ zIndex: 2000 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              PRISON MANAGEMENT INFORMATION SYSTEM (PMIS)
            </Typography>

            {/* USER AVATAR */}
            {authState && (
              <>
                <IconButton onClick={handleUserMenu} color="inherit">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {authState.username?.charAt( 0 ).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose} PaperProps={{ elevation: 3, sx: { width: 220, mt: 1 } }}>
                  <MenuItem disabled>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    {authState.username}
                  </MenuItem>

                  <MenuItem disabled sx={{ pl: 6, opacity: 0.7 }}>
                    {authState.role_name}
                  </MenuItem>

                  <Divider />
                  <MenuItem sx={{ pl: 6 }} onClick={changePassword} >
                    Change Password
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* MAIN PAGE CONTENT */}
        <MainContent open={drawerOpen}>          
            <Outlet />          
        </MainContent>

      </div>
    </div>
  );
}
