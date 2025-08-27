import * as React from 'react';
import {
  Box, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItemButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Avatar, Tooltip, AppBar as MuiAppBar,
  Drawer as MuiDrawer
} from '@mui/material';
import {
  Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon, Lock as LockIcon, Home as HomeIcon
} from '@mui/icons-material';

import { styled, useTheme } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useBaseURL } from '../../Context/BaseURLProvider';
import axios from 'axios';
import Swal from 'sweetalert2';
import ResetPasswordDialog from '../Auth/ResetPasswordDialog';
import { menuAccess } from './Menues/menuAccess';

const drawerWidth = 240;

// Drawer styling
const openedMixin = ( theme ) => ( { width: drawerWidth, transition: theme.transitions.create( 'width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen } ), overflowX: 'hidden' } );
const closedMixin = ( theme ) => ( { transition: theme.transitions.create( 'width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen } ), overflowX: 'hidden', width: `calc(${ theme.spacing( 7 ) } + 1px)`, [theme.breakpoints.up( 'sm' )]: { width: `calc(${ theme.spacing( 8 ) } + 1px)` } } );

const AppBar = styled( MuiAppBar, { shouldForwardProp: ( prop ) => prop !== 'open' } )( ( { theme, open } ) => ( {
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create( ['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  } ),
  ...( open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${ drawerWidth }px)`,
    transition: theme.transitions.create( ['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    } )
  } )
} ) );

const DrawerHeader = styled( 'div' )( ( { theme } ) => ( {
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  padding: theme.spacing( 0, 1 ), ...theme.mixins.toolbar
} ) );

const Drawer = styled( MuiDrawer, { shouldForwardProp: ( prop ) => prop !== 'open' } )( ( { theme, open } ) => ( {
  width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box',
  ...( open && { ...openedMixin( theme ), '& .MuiDrawer-paper': openedMixin( theme ) } ),
  ...( !open && { ...closedMixin( theme ), '& .MuiDrawer-paper': closedMixin( theme ) } )
} ) );

// Main Component
export default function CombinedNavBarMUI() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = useBaseURL();
  const { dispatch, state: authState } = useAuth();

  const [open, setOpen] = React.useState( true );
  const [anchorElUser, setAnchorElUser] = React.useState( null );
  const [resetPasswordOpen, setResetPasswordOpen] = React.useState( false );
  const [sidebarMenu, setSidebarMenu] = React.useState( '' );

  // Menu definitions
  const topMenu = [
    {
      name: 'बन्दी',
      defaultPath: '/bandi',
      submenu: [
        { name: 'बन्दी ड्यासबोर्ड', path: '/bandi/dashboard' },
        { name: 'नयाँ बन्दी विवरण', path: '/bandi/create_bandi' },
        { name: 'बन्दी विवरण', path: '/bandi/bandi_details' },
        { name: 'कार्यालयगत संख्या', path: '/bandi/count_ac_office' },
        { name: 'मास्केवारी', path: '/bandi/maskebari' },
        { name: 'कैदमुक्त/लगत कट्टा', path: '/bandi/bandi_release' },
      ],
    },
    {
      name: 'प्यारोल',
      defaultPath: '/payrole',
      submenu: [
        { name: 'प्यारोलका लागी सिफारिस(नयाँ)', path: '/payrole/create_payrole' },
        { name: 'प्यारोल विवरण', path: '/payrole/payrole_user_check' },
        { name: 'प्यारोल रुजु(कार्यालय)', path: '/payrole/payrole_client_check' },
        { name: 'प्यारोल रुजु', path: '/payrole/payrole_jr_check' },
        { name: 'प्यारोल पेश', path: '/payrole/payrole_client_pesh' },
        { name: 'प्यारोल विवरण', path: '/payrole/payrole_table' },
        { name: 'पुरानो प्यारोल', path: '/payrole/create_previous_parole' },
        { name: 'प्यारोल अनुगमन मुल्याङकन फारम', path: '/payrole/payrole_log' },
      ],
    },
    {
      name: 'कामदारी सुविधा',
      defaultPath: '/kaamdari_subidha',
      submenu: [
        { name: 'आन्तिरक प्रशासन', path: '/kaamdari_subidha/aantarik_prashasan_table' },
      ],
    },
    {
      name: 'स्थानान्तरण',
      defaultPath: '/bandi_transfer',
      submenu: [
        { name: 'नयाँ थप', path: '/bandi_transfer/new_bandi_transfer' },
        { name: 'स्थानान्तरण(स्विकृती)', path: '/bandi_transfer/approve_bandi_final_transfer' },
      ],
    },
    {
      name: 'कर्मचारी',
      defaultPath: '/emp',
      submenu: [
        { name: 'नयाँ थप', path: '/emp/create_employee' },
        { name: 'कर्मचारी विवरण', path: '/emp/view_employee' },
      ],
    },
  ];


  // Extract submenu from current menu
  const selectedMenu = topMenu.find( menu => menu.name === sidebarMenu );

  const filterSubmenuByRole = ( menuKey, submenu ) => {
    const role = authState.role_name;
    const access = menuAccess[menuKey]?.[role];
    if ( !access ) return [];
    if ( access === 'all' ) return submenu;
    return submenu.filter( sub => access.includes( sub.path ) );
  };

  const handleDrawerToggle = () => setOpen( !open );
  const handleOpenUserMenu = ( e ) => setAnchorElUser( e.currentTarget );
  const handleCloseUserMenu = () => setAnchorElUser( null );

  const handleLogout = async () => {
    try {
      await axios.post( `${ BASE_URL }/auth/logout`, {}, { withCredentials: true } );
      dispatch( { type: 'LOGOUT' } );
      localStorage.removeItem( 'token' );
      navigate( '/login' );
      Swal.fire( { title: 'Logged Out', icon: 'success', timer: 1000, showConfirmButton: false } );
    } catch ( error ) {
      Swal.fire( { title: 'Logout Failed', text: error?.response?.data?.message || 'Something went wrong', icon: 'error' } );
    }
  };

  const handlePasswordChange = async ( formData ) => {
    try {
      await axios.put( `${ BASE_URL }/auth/reset_password`, formData, { withCredentials: true } );
      Swal.fire( { title: 'Password Changed', icon: 'success' } );
      setResetPasswordOpen( false );
      handleLogout();
    } catch ( err ) {
      Swal.fire( { title: 'Password Change Failed', text: err.response?.data?.message || 'Something went wrong', icon: 'error' } );
    }
  };

  React.useEffect( () => {
    const activeMenu = topMenu.find( menu => menu.submenu.some( sub => location.pathname.startsWith( sub.path ) ) );
    if ( activeMenu ) {
      setSidebarMenu( activeMenu.name );
    }
  }, [location.pathname] );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <ResetPasswordDialog
        editingData={{ user_id: authState?.id || '' }}
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen( false )}
        onSave={handlePasswordChange}
      />
      {/* Top Bar */}
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={handleDrawerToggle} color="inherit" edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <IconButton sx={{ p: 0, spacing:2 }}>
                <Avatar alt="User Avatar" src="/nepal_gov_logo.png" />
              </IconButton>
            <Typography variant="h6" noWrap>
              कारागार व्यवस्थापन प्रणाली(PMIS)
            </Typography>
            <Typography variant="h6" noWrap>
              &nbsp; | &nbsp; {authState.office_np} - {sidebarMenu} 
            </Typography>
          </Box>
          <Box>
            <Tooltip title="User Menu">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/icons/profile_male.png" />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElUser} open={Boolean( anchorElUser )} onClose={handleCloseUserMenu}>
              <MenuItem disabled>{authState.user} ({authState.role_name})</MenuItem>
              <MenuItem onClick={() => setResetPasswordOpen( true )}><LockIcon fontSize="small" /> &nbsp; Change Password</MenuItem>
              <MenuItem onClick={handleLogout}><LogoutIcon fontSize="small" /> &nbsp; Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {topMenu.map( menu => (
            <ListItemButton
              key={menu.name}
              selected={sidebarMenu === menu.name}
              onClick={() => {
                setSidebarMenu( menu.name );
                navigate( menu.defaultPath );
              }}
            >
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary={menu.name} />
            </ListItemButton>
          ) )}
        </List>
        <Divider />
        {selectedMenu && filterSubmenuByRole( selectedMenu.defaultPath.replace( '/', '' ), selectedMenu.submenu ).map( sub => (
          <Box sx={{  maxHeight: 'calc(100vh - 200px)' }}>
  

          <ListItemButton sx={{ py: 0.5, my: 0.5 }} key={sub.path} onClick={() => navigate( sub.path )}>
            <ListItemText inset primary={sub.name}  />
          </ListItemButton>
          </Box>
        ) )}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}
