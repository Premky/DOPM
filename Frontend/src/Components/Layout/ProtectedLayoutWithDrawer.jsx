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


const drawerWidth = 5;
const miniDrawerWidth = 5;

const MainContent = styled( "main" )( ( { open, theme } ) => ( {
  flexGrow: 1,
  padding: theme.spacing( 3 ),
  transition: "all 0.3s ease",
  marginLeft: open ? drawerWidth : miniDrawerWidth,
  marginTop: 64,
} ) );

export default function ProtectedLayoutWithDrawer() {
  const { dispatch, state: authState } = useAuth();
  const role = authState.role_name;

  const [menus, setMenus] = useState( [] );
  const [drawerOpen, setDrawerOpen] = useState( true );

  const [user, setUser] = useState( null );          // NEW
  const [anchorEl, setAnchorEl] = useState( null );  // For user menu
  const openMenu = Boolean( anchorEl );

  const BASE_URL = useBaseURL();
  const navigate = useNavigate();

  // Fetch menus
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

  // Fetch logged-in user's info
  // useEffect(() => {
  //   async function fetchUser() {
  //     try {
  //       const res = await axios.get(`${BASE_URL}/auth/me`, {
  //         withCredentials: true,
  //       });
  //       setUser(res.data);
  //     } catch (err) {
  //       console.error("Failed to load user info:", err);
  //     }
  //   }
  //   fetchUser();
  // }, []);

  const toggleDrawer = () => setDrawerOpen( ( prev ) => !prev );

  // Open user menu
  const handleUserMenu = ( event ) => {
    setAnchorEl( event.currentTarget );
  };

  // Close menu
  const handleClose = () => setAnchorEl( null );

  // Logout
  const handleLogout = async () => {

    try {
      await axios.post( `${ BASE_URL }/auth/logout`, {}, { withCredentials: true } );
      // Clear authentication state
      dispatch( { type: 'LOGOUT' } );
      localStorage.removeItem( 'token' );
      navigate( '/login' );
      Swal.fire( {
        title: 'Logged Out',
        text: 'You have been successfully logged out!',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
      } );
    } catch ( error ) {
      console.log( "Logout error:", error?.response?.data || error.message || error );
      Swal.fire( {
        title: 'Logout Failed',
        text: error?.response?.data?.message || error.message || 'There was an issue logging out!',
        icon: 'error',
      } );
    }

  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <MiniDrawer menus={menus} open={drawerOpen} />

      {/* RIGHT SIDE */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

        {/* TOPBAR */}
        <AppBar position="fixed" color="primary" style={{ zIndex: 1300 }}>
          <Toolbar>

            {/* Drawer toggle */}
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              PRISON MANAGEMENT INFORMATION SYSTEM (PMIS)
            </Typography>

            {/* USER AVATAR + NAME */}
            {authState && (
              <>
                <IconButton onClick={handleUserMenu} color="inherit">
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {authState.username?.charAt( 0 ).toUpperCase()}
                  </Avatar>
                </IconButton>

                {/* DROPDOWN MENU */}
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { width: 220, mt: 1 },
                  }}
                >
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
