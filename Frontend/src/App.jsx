import { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import axios from 'axios';

// Lazy-loaded components
const Login = lazy( () => import( './Components/Auth/Login' ) );
const CombinedNav = lazy( () => import( './Components/Nav/CombinedNav' ) );
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
// const BandiFamilyForm = lazy(() => import('./Components/Bandi/Forms/BandiFamilyForm'));
const ViewBandi = lazy( () => import( './Components/Bandi/ViewBandi' ) );

const PayroleMakebari = lazy( () => import( './Components/Bandi/Payrole/Tables/PayroleMakebari' ) );
const PayroleForm = lazy( () => import( './Components/Bandi/Payrole/Forms/PayroleForm' ) );
const PreviousPayroleForm = lazy( () => import( './Components/Bandi/Payrole/Forms/PreviousPayroleForm' ) );
const PayroleTable = lazy( () => import( './Components/Bandi/Payrole/Tables/PayroleTable' ) );
const PayroleLogForm = lazy( () => import( './Components/Bandi/Forms/PayroleLogForm' ) );

const AantarikPrashasanForm = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Forms/AantarikPrashasanForm' ) );
const AantarikPrashasanTable = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Tables/AantarikPrashasanTable' ) );
const KaamdariSubidhaForm = lazy( () => import( './Components/Bandi/Kaamdari_subidha/Forms/KaamdariSubidhaForm' ) );
const KaamdariBhuktanDecision = lazy( () => import( './Components/Bandi/Kaamdari_subidha/DetailedTables/KaamdariBhuktanDecision' ) );

// const BandiFinalTransferForm = lazy( () => import( './Components/BandiTransfer/Forms/BandiFinalTransferForm' ) );
import KaragarMaskebari from './Components/Bandi/Reports/KaragarMaskebari';
import BandiTransferForm from './Components/BandiTransfer/Forms/BandiTransferForm';
import EmployeeForm from './Components/Employee/Forms/EmployeeForm';
import AllEmpTable from './Components/Employee/Tables/AllEmpTable';
import BandiTransferTable from './Components/BandiTransfer/Tables/BandiTransferTable';

axios.interceptors.response.use(
  res => res,
  error => {
    if ( error.response?.status === 401 ) {
      // localStorage.clear();
      sessionStorage.clear();
      if ( window.location.pathname !== '/login' ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject( error );
  }
);

import { Outlet } from 'react-router-dom';
import NepaliIME from './Components/Bandi/Payrole/Dialogs/NepaliIME';


// Layout component to wrap protected routes with navigation
const ProtectedLayout = () => <CombinedNav />;

// Layout component that just renders child routes
const OutletLayout = () => <Outlet />;

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes>

            {/* Public Route */}
            {/* <Route path="/" element={<Login />} /> */}



            {/* Protected Routes with Navigation */}

            {/* Admin routes wrapped with AdminCheck */}

            {/* Routes wrapped with LoggedIn middleware */}
            <Route path="/" element={<Login />} />
            <Route path="/test" element={<NepaliIME />} />
            <Route path="/login" element={<Login />} />
            <Route element={<LoggedIn />}>

              <Route element={<ProtectedLayout />}>
                <Route element={<AdminCheck />}>
                  <Route path="admin">
                    <Route path="create_user" element={<CreateUser />} />
                    <Route path="branch" element={<OfficeBranchPage />} />
                    <Route path="office" element={<Office />} />
                  </Route>
                </Route>
                {/* Bandis Routes */}
                <Route path="bandi" element={<OutletLayout />}>
                  <Route index element={<CountReport />} />
                  <Route path="dashboard" element={<CountReport />} />
                  <Route path="count_ac_office" element={<BandiMaskebari />} />
                  <Route path="maskebari" element={<KaragarMaskebari />} />
                  <Route path="bandi_details" element={<AllBandiTable />} />
                  <Route path="create_bandi" element={<BandiPersonForm />} />
                  <Route path="bandi_release" element={<BandiReleaseForm />} />
                  {/* <Route path="create_bandi_family" element={<BandiFamilyForm />} /> */}
                  <Route path="view_saved_record/:bandi_id" element={<ViewBandi />} />
                </Route>

                <Route path="kaamdari_subidha" element={<OutletLayout />}>
                  <Route path="create_aantarik_prashasan" element={<AantarikPrashasanForm />} />
                  <Route path="kaamdari_subidha_form" element={<KaamdariSubidhaForm />} />
                  <Route path="aantarik_prashasan_table" element={<AantarikPrashasanTable />} />
                  <Route path="view_details/:id" element={<KaamdariBhuktanDecision />} />
                </Route>

                <Route path="bandi_transfer" element={<OutletLayout />}>
                  <Route path="approve_bandi_final_transfer" element={<BandiTransferTable status='sent_by_clerk'/>} />
                  {/* <Route path="bandi_final_transfer" element={<BandiFinalTransferForm />} /> */}
                  <Route path="new_bandi_transfer" element={<BandiTransferForm />} />
                  <Route path="view_details/:id" element={<KaamdariBhuktanDecision />} />
                </Route>

                {/* Payrole Routes */}
                <Route path="payrole" element={<OutletLayout />}>
                  <Route index element={<PayroleMakebari />} />
                  <Route path="create_previous_payrole1" element={<PreviousPayroleForm />} />
                  <Route path="create_previous_parole" element={<PayroleForm status='under_parole'/>} />
                  <Route path="accept_previous_parole" element={<PayroleTable status='under_parole'/>} />
                  <Route path="create_payrole" element={<PayroleForm />} />
                  <Route path="payrole_user_check" element={<PayroleTable status='user_not_submitted'/>} />
                  <Route path="payrole_client_check" element={<PayroleTable status='user_submitted'/>} />
                  <Route path="payrole_jr_check" element={<PayroleTable/>} />
                  <Route path="payrole_client_pesh" element={<PayroleTable />} />
                  <Route path="payrole_table" element={<PayroleTable />} />
                  <Route path="maskebari_table" element={<PayroleMakebari />} />
                  <Route path="payrole_log" element={<PayroleLogForm />} />
                </Route>

                {/* Payrole Routes */}
                <Route path="emp" element={<OutletLayout />}>
                  <Route index element={<PayroleMakebari />} />
                  <Route path="create_employee" element={<EmployeeForm />} />
                  <Route path="view_employee" element={<AllEmpTable />} />
                </Route>

              </Route>

              {/* Catch all for unknown routes */}
              <Route path="*" element={<h2>Page not found</h2>} />
            </Route>

          </Routes>
        </BrowserRouter>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
