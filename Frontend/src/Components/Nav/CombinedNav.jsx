import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../Context/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useBaseURL } from '../../Context/BaseURLProvider';

const CombinedNav = ( { user } ) => {
  const BASE_URL = useBaseURL();
  const { dispatch } = useAuth();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarMenu, setSidebarMenu] = useState( '' );

  const topMenu = [
    {
      name: 'Home',
      defaultPath: '/',
      submenu: [
        // { name: 'Dashboard', path: '/dashboard' },
        // { name: 'Stats', path: '/stats' }
      ]
    },
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
      ]
    },
    {
      name: 'प्यारोल',
      defaultPath: '/payrole',
      submenu: [
        { name: 'प्यारोल थप', path: '/payrole/create_payrole' },
        { name: 'प्यारोल विवरण', path: '/payrole/payrole_table' },
        { name: 'प्यारोल अनुगमन मुल्याङकन फारम', path: '/payrole/payrole_log' },
        { name: 'प्यारोल मास्केवारी', path: '/payrole/maskebari_table' }
      ]
    },
    {
      name: 'कामदारी सुविधा',
      defaultPath: '/kaamdari_subidha',
      submenu: [
        // { name: 'कामदारी सुविधा ड्यासबोर्ड', path: '/kaamdari_subidha/create_aantarik_prashasan' },
        { name: 'आन्तिरक प्रशासन', path: '/kaamdari_subidha/aantarik_prashasan_table' },
        // { name: 'कामदारी सुविधा विवरण', path: '/kaamdari_subidha/kaamdari_subidha_form' }
      ]
    }
  ];

  const handleTopNavClick = ( menu ) => {
    setSidebarMenu( menu.name );
    navigate( menu.defaultPath );
  };

  const handleSubmenuClick = ( path ) => {
    navigate( path );
  };

  useEffect( () => {
    const activeMenu = topMenu.find( menu =>
      menu.submenu.some( sub => location.pathname.startsWith( sub.path ) )
    );
    if ( activeMenu ) {
      setSidebarMenu( activeMenu.name );
    }
  }, [location.pathname] );

  const selectedMenu = topMenu.find( menu => menu.name === sidebarMenu );

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
    <div>
      {/* Top Navigation */}
      <div className="topnav">
        {topMenu.map( menu => (
          <a
            key={menu.name}
            href="#"
            className={sidebarMenu === menu.name ? 'active' : ''}
            onClick={() => handleTopNavClick( menu )}
          >
            {menu.name}
          </a>
        ) )}
        <a className="icon"><i className="fa fa-bars"></i></a>
      </div>

      {/* Sidebar */}
      <div className="sidenav">
        <div>
          <div className='nepal_gov_logo'>
            <img src='nepal_gov_logo.png' alt='nepal_gov_logo' height='80' />
          </div>
          <div className="office-info">{authState.office_np}</div>
          <div className="user-info">({authState.user})</div>
          <hr />
        </div>

        {selectedMenu?.submenu.map( sub => (
          <a key={sub.path} onClick={() => handleSubmenuClick( sub.path )}>
            {sub.name}
          </a>
        ) )}

        <a onClick={handleLogout} style={{ color: 'red' }}>🔒 Logout</a>
      </div>
      {/* Main content rendered here */}
      <div style={{ marginLeft: '180px', padding: '1rem', paddingTop:'60px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default CombinedNav;
