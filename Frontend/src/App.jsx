import { useState, Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import ProtectedRoute from './Context/ProtectedRoute';
import './index.css'
// Lazy-loaded components
const Login = lazy(() => import('./Components/Auth/Login'));
// const Sidenav = lazy(() => import('./Components/Nav/Sidenav'));
const CombinedNavBar = lazy(() => import('./Components/Nav/CombinedNavBar'));
const Users = lazy(() => import('./Components/AdminPanel/User/CreateUser'));
const OfficeBranchPage = lazy(() => import('./Components/AdminPanel/Office/OfficeBranchPage'));
const Office = lazy(() => import('./Components/AdminPanel/Office/OfficeForm'));

// Middleware Components
import SuperAdmin from './Components/Auth/middlewares/SuperAdmin';
import AdminCheck from './Components/Auth/middlewares/AdminCheck';
import UserCheck from './Components/Auth/middlewares/UserCheck';
import CreateUser from './Components/AdminPanel/User/CreateUser';
import AssignApps from './Components/AdminPanel/User/AssignApps';
import Dashboard from './Components/Dashboard/Dashboard';
// import BandiForm from './Components/Bandi/BandiForm';
// import BandiFamilyForm from './Components/Bandi/BandiFamilyForm';
// import PrisionerReleaseForm from './Components/Bandi/PrisionerReleaseForm';
// import BandiReleaseForm from './Components/Bandi/BandiReleaseForm';
// import ParoleForm from './Components/Bandi/ParoleForm';

import BandiPersonForm from './Components/Bandi/Forms/BandiPersonForm';
import BandiFamilyForm from './Components/Bandi/Forms/BandiFamilyForm';
import ViewBandi from './Components/Bandi/ViewBandi';
import PayroleForm from './Components/Bandi/Forms/PayroleForm';
import PayroleTable from './Components/Bandi/Tables/PayroleTable';
import CombinedNav from './Components/Nav/CombinedNav';
import BandiTable from './Components/Bandi/Tables/BandiTable';
import AllBandiTable from './Components/Bandi/Tables/AllBandiTable';
function App() {
  return (
    <AuthProvider> {/* Move AuthProvider to wrap everything */}
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path='/' element={<CombinedNav />}>
              <Route path='/bandi'>
                <Route path='bandi_details' element={<AllBandiTable/>}/>
                <Route path='create_bandi' element={<BandiPersonForm />} />
                <Route path='create_bandi_family' element={<BandiFamilyForm />} />
                <Route path="view_saved_record/:bandi_id" element={<ViewBandi />} />
              </Route>
              <Route path='/payrole'>
                <Route path="create_payrole" element={<PayroleForm />} />
                <Route path='payrole_table' element={<PayroleTable />} />
              </Route>
            </Route>


            {/* <Route path='/' element={<ParoleForm />}/> */}
            {/* <Route path='/' element={<BandiReleaseForm />}/> */}
            {/* <Route path='/' element={<BandiForm />}/> */}

            {/* {/* <Route path='/' element={<ProtectedRoute />}> */}
            {/* <Route path='/' element={<CombinedNavBar />}> */}
            {/* <Route path='/sadmin' element={<SuperAdmin />}>
              <Route path='branch' element={<OfficeBranchPage />} />
              <Route path='users' element={<Users />} />
              <Route path='office' element={<Office />} />
            </Route> */}
          {/* </Route> */}
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </Suspense >
    </AuthProvider >
  );
}

export default App;