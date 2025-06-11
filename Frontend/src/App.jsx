import { useState, Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import ProtectedRoute from './Context/ProtectedRoute';

// Lazy-loaded components
const Login = lazy(() => import('./Components/Auth/Login'));
// const Sidenav = lazy(() => import('./Components/Nav/Sidenav'));
const CombinedNavBar=lazy(() => import ('./Components/Nav/CombinedNavBar'));
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
import BandiForm from './Components/Bandi/BandiForm';
import BandiFamilyForm from './Components/Bandi/BandiFamilyForm';

function App() {
  return (
    <AuthProvider> {/* Move AuthProvider to wrap everything */}
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            {/* <Route path='/' element={<BandiFamilyForm />}/> */}
            <Route path='/' element={<BandiForm />}/>

            <Route path='/' element={<ProtectedRoute />}>
              <Route path='/' element={<CombinedNavBar />}>
                <Route path='/sadmin' element={<SuperAdmin />}>
                  <Route path='branch' element={<OfficeBranchPage />} />
                  <Route path='users' element={<Users />} />
                  <Route path='office' element={<Office />} />
                </Route>

                <Route path ='/su' element={<SuperAdmin />}>
                  <Route index element={<CreateUser/>} />
                  <Route path='apps' element={<AssignApps/>}/>
                  <Route path='branch' element={<OfficeBranchPage />} />
                  <Route path='office' element={<Office />} />
                  <Route path='users' element={<Users />} />
                </Route>

                <Route path='/dashboard' element={<Dashboard />}>
                  
                </Route>

              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </AuthProvider>
  );
}

export default App;