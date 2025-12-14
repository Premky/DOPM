import { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import axios from 'axios';
import ProtectedLayoutWithDrawer from './Components/Layout/ProtectedLayoutWithDrawer'; // new layout with MiniDrawer

// Lazy-loaded components
const PrisionBlocksForm = lazy( () => import( './Components/AdminPanel/AdminSettings/PrisionBlocksForm' ) );

const Login = lazy( () => import( './Components/Auth/Login' ) );

const AuditTable = lazy( () => import( './Pages/Audit/AuditTable' ) );

const CreateUser = lazy( () => import( './Components/AdminPanel/User/CreateUser' ) );
const OfficeBranchPage = lazy( () => import( './Components/AdminPanel/Office/OfficeBranchPage' ) );
const Office = lazy( () => import( './Components/AdminPanel/Office/OfficeForm' ) );

const AdminCheck = lazy( () => import( './Components/Auth/middlewares/AdminCheck' ) );
const LoggedIn = lazy( () => import( './Components/Auth/middlewares/LoggedIn' ) );

const CountReport = lazy( () => import( './Components/Bandi/Tables/Counts/CountReport' ) );
const BandiMaskebari = lazy( () => import( './Components/Bandi/Reports/BandiMaskebari' ) );
const AllBandiTable = lazy( () => import( './Components/Bandi/Tables/AllBandiTable' ) );
const BandiPersonForm = lazy( () => import( './Components/Bandi/Forms/BandiPersonForm' ) );
const BandiReleaseForm = lazy( () => import( './Components/Bandi/Forms/BandiReleaseForm' ) );
const BandiEscapeForm = lazy( () => import( './Components/Bandi/Forms/BandiEcapeForm' ) );
const BandiRecaptureForm = lazy( () => import( './Components/Bandi/Forms/BandiRecaptureForm' ) );
const ViewBandi = lazy( () => import( './Components/Bandi/ViewBandi' ) );

const PayroleMakebari = lazy( () => import( './Components/Parole/Tables/PayroleMakebari' ) );
const PayroleForm = lazy( () => import( './Components/Parole/Forms/PayroleForm' ) );
const PreviousParoleForm = lazy( () => import( './Components/Parole/Forms/PreviousParoleForm' ) );
const PayroleTable = lazy( () => import( './Components/Parole/Tables/PayroleTable' ) );
const ParoleLogForm = lazy( () => import( './Components/Parole/Forms/PayroleLogForm' ) );
const ParoleSetting = lazy( () => import( './Components/Parole/Settings/ParoleSetting' ) );
const PayroleNosForm = lazy( () => import( './Components/Parole/Settings/ParoleNosForm' ) );

const AantarikPrashasanForm = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Forms/AantarikPrashasanForm' ) );
const AantarikPrashasanTable = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Tables/AantarikPrashasanTable' ) );
const KaamdariSubidhaForm = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Forms/KaamdariSubidhaForm' ) );
const KaamdariBhuktanDecision = lazy( () => import( './Components/Bandi/Kaamdari_subidha/DetailedTables/KaamdariBhuktanDecision' ) );

import KaragarMaskebari from './Components/Bandi/Reports/KaragarMaskebari';
import BandiTransferForm from './Components/BandiTransfer/Forms/BandiTransferForm';
import EmployeeForm from './Components/Employee/Forms/EmployeeForm';
import AllEmpTable from './Components/Employee/Tables/AllEmpTable';
import BandiTransferTable from './Components/BandiTransfer/Tables/BandiTransferTable';

// Transliteration
import TransliterateExcel from './Components/Transliteration/TransliterateExcel';

import MenuPanel from './Components/AdminPanel/MenuPanel/MenuPanel';
import PermissionsPage from './Pages/Audit/Admin/PermissionsPage';
import Forbidden from './Pages/Errors/Forbidden';
import ProtectedRoute from './Components/Auth/middlewares/ProtectedRoute';
import NotFound from './Pages/Errors/NotFound';

// Axios interceptor for 401
axios.interceptors.response.use(
  res => res,
  error => {
    if ( error.response?.status === 401 ) {
      sessionStorage.clear();
      if ( window.location.pathname !== '/login' ) window.location.href = '/login';
    }
    return Promise.reject( error );
  }
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<LoggedIn />}>

              {/* Wrap with MiniDrawer Layout */}
              <Route element={<ProtectedRoute />}>   {/* This is for URL */}
                <Route element={<ProtectedLayoutWithDrawer />}>

                  {/* Admin Routes */}
                  {/* <Route element={<AdminCheck />}> */}
                  <Route path="admin">
                    <Route path="menus" element={<MenuPanel />} />
                    <Route path="create_user" element={<CreateUser />} />
                    <Route path="branch" element={<OfficeBranchPage />} />
                    <Route path="office" element={<Office />} />

                    <Route path='manage_permissions' element={<PermissionsPage />} />
                  </Route>
                  {/* </Route> */}

                  {/* Admin Settings */}
                  <Route path="adminsettings" element={<Outlet />}>
                    <Route path="block" element={<PrisionBlocksForm />} />
                  </Route>

                  {/* Audit */}
                  <Route path="audit" element={<Outlet />}>
                    <Route index element={<AuditTable />} />
                  </Route>

                  {/* Bandis */}
                  <Route path="bandi" element={<Outlet />}>
                    <Route index element={<CountReport />} />
                    <Route path="dashboard" element={<CountReport />} />
                    <Route path="count_ac_office" element={<BandiMaskebari />} />
                    <Route path="count_ac_country" element={<BandiMaskebari />} />
                    <Route path="maskebari" element={<KaragarMaskebari />} />
                    <Route path="bandi_details" element={<AllBandiTable />} />
                    <Route path="create_bandi" element={<BandiPersonForm />} />
                    <Route path="bandi_release" element={<BandiReleaseForm />} />
                    <Route path="bandi_escape" element={<BandiEscapeForm />} />
                    <Route path="bandi_recapture" element={<BandiRecaptureForm />} />
                    <Route path="view_saved_record/:bandi_id" element={<ViewBandi />} />
                    <Route path='details/:caseName' element={<AllBandiTable />} />
                    <Route path='details/:caseName/:type' element={<AllBandiTable />} />
                  </Route>

                  {/* Payrole */}
                  <Route path="parole" element={<Outlet />}>
                    <Route index element={<PayroleMakebari />} />
                    <Route path="maskebari" element={<PayroleMakebari />} />
                    <Route path="view_saved_record/:bandi_id" element={<ViewBandi />} />
                    <Route path="create_previous_parole" element={<PreviousParoleForm status='under_parole' />} />
                    <Route path="create_payrole" element={<PayroleForm />} />
                    <Route path="payrole_user_check" element={<PayroleTable status='user_not_submitted' />} />
                    <Route path="payrole_client_check" element={<PayroleTable status='user_submitted' />} />
                    <Route path="payrole_jr_check" element={<PayroleTable />} />
                    <Route path="payrole_client_pesh" element={<PayroleTable />} />
                    <Route path="payrole_table" element={<PayroleTable />} />
                    <Route path="maskebari_table" element={<PayroleMakebari />} />
                    <Route path="payrole_log" element={<ParoleLogForm />} />
                    <Route path="parole_settings" element={<ParoleSetting />} />
                    <Route path="parole_nos" element={<PayroleNosForm />} />
                  </Route>

                  {/* Kaamdari Subidha */}
                  <Route path="kaamdari_subidha" element={<Outlet />}>
                    <Route path="create_aantarik_prashasan" element={<AantarikPrashasanForm />} />
                    <Route path="kaamdari_subidha_form" element={<KaamdariSubidhaForm />} />
                    <Route path="aantarik_prashasan_table" element={<AantarikPrashasanTable />} />
                    <Route path="view_details/:id" element={<KaamdariBhuktanDecision />} />
                  </Route>

                  {/* Bandi Transfer */}
                  <Route path="bandi_transfer" element={<Outlet />}>
                    <Route path="approve_bandi_final_transfer" element={<BandiTransferTable status='sent_by_clerk' />} />
                    <Route path="new_bandi_transfer" element={<BandiTransferForm />} />
                    <Route path="view_details/:id" element={<KaamdariBhuktanDecision />} />
                  </Route>

                  {/* Employee */}
                  <Route path="emp" element={<Outlet />}>
                    <Route index element={<AllEmpTable />} />
                    <Route path="create_employee" element={<EmployeeForm />} />
                    <Route path="view_employee" element={<AllEmpTable />} />
                  </Route>

                  {/* Transliteration */}
                  <Route path="transliterate" element={<Outlet />}>
                    <Route index element={<TransliterateExcel />} />
                  </Route>
                </Route> {/* End of ProtectedLayoutWithDrawer */}
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
              {/* <Route path="*" element={<h2>Page Not Found</h2>} /> */}

            </Route> {/* End LoggedIn */}
          </Routes>
        </BrowserRouter>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
