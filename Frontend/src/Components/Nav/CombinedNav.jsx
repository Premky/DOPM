import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../Context/AuthContext';

const CombinedNav = ({ user }) => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarMenu, setSidebarMenu] = useState('');

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
        { name: 'बन्दी विवरण', path: '/bandi/bandi_details' },
        { name: 'नयाँ बन्दी विवरण', path: '/bandi/create_bandi' }
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
        { name: 'कामदारी सुविधा ड्यासबोर्ड', path: '/kaamdari_subidha/create_aantarik_prashasan' },
        { name: 'आन्तिरक प्रशासन', path: '/kaamdari_subidha/aantarik_prashasan_table' },
        { name: 'कामदारी सुविधा विवरण', path: '/kaamdari_subidha/kaamdari_subidha_form' }
      ]
    }
  ];

  const handleTopNavClick = (menu) => {
    setSidebarMenu(menu.name);
    navigate(menu.defaultPath);
  };

  const handleSubmenuClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const activeMenu = topMenu.find(menu =>
      menu.submenu.some(sub => location.pathname.startsWith(sub.path))
    );
    if (activeMenu) {
      setSidebarMenu(activeMenu.name);
    }
  }, [location.pathname]);

  const selectedMenu = topMenu.find(menu => menu.name === sidebarMenu);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      {/* Top Navigation */}
      <div className="topnav">
        {topMenu.map(menu => (
          <a
            key={menu.name}
            href="#"
            className={sidebarMenu === menu.name ? 'active' : ''}
            onClick={() => handleTopNavClick(menu)}
          >
            {menu.name}
          </a>
        ))}
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

        {selectedMenu?.submenu.map(sub => (
          <a key={sub.path} onClick={() => handleSubmenuClick(sub.path)}>
            {sub.name}
          </a>
        ))}

        <a onClick={handleLogout} style={{ color: 'red' }}>🔒 Logout</a>
      </div>
      {/* Main content rendered here */}
      <div style={{ marginLeft: '180px', padding: '1rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default CombinedNav;
