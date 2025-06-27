import { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';

// Lazy-loaded components
const Login = lazy(() => import('./Components/Auth/Login'));
const CombinedNav = lazy(() => import('./Components/Nav/CombinedNav'));
const CreateUser = lazy(() => import('./Components/AdminPanel/User/CreateUser'));
const OfficeBranchPage = lazy(() => import('./Components/AdminPanel/Office/OfficeBranchPage'));
const Office = lazy(() => import('./Components/AdminPanel/Office/OfficeForm'));

const AdminCheck = lazy(() => import('./Components/Auth/middlewares/AdminCheck'));
const LoggedIn = lazy(() => import('./Components/Auth/middlewares/LoggedIn'));

const CountReport = lazy(() => import('./Components/Bandi/Tables/Counts/CountReport'));
const AllBandiTable = lazy(() => import('./Components/Bandi/Tables/AllBandiTable'));
const BandiPersonForm = lazy(() => import('./Components/Bandi/Forms/BandiPersonForm'));
const BandiFamilyForm = lazy(() => import('./Components/Bandi/Forms/BandiFamilyForm'));
const ViewBandi = lazy(() => import('./Components/Bandi/ViewBandi'));

const PayroleMakebari = lazy(() => import('./Components/Bandi/Tables/PayroleMakebari'));
const PayroleForm = lazy(() => import('./Components/Bandi/Forms/PayroleForm'));
const PayroleTable = lazy(() => import('./Components/Bandi/Tables/PayroleTable'));
const PayroleLogForm = lazy(() => import('./Components/Bandi/Forms/PayroleLogForm'));

import { Outlet } from 'react-router-dom';

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
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Navigation */}
            <Route element={<ProtectedLayout />}> 

              {/* Admin routes wrapped with AdminCheck */}
              <Route element={<AdminCheck />}>
                <Route path="admin">
                  <Route path="create_user" element={<CreateUser />} />
                  <Route path="branch" element={<OfficeBranchPage />} />
                  <Route path="office" element={<Office />} />
                </Route>
              </Route>

              {/* Routes wrapped with LoggedIn middleware */}
              <Route element={<LoggedIn />}>
                {/* Bandis Routes */}
                <Route path="bandi" element={<OutletLayout />}>
                  <Route index element={<CountReport />} />
                  <Route path="dashboard" element={<CountReport />} />
                  <Route path="bandi_details" element={<AllBandiTable />} />
                  <Route path="create_bandi" element={<BandiPersonForm />} />
                  <Route path="create_bandi_family" element={<BandiFamilyForm />} />
                  <Route path="view_saved_record/:bandi_id" element={<ViewBandi />} />
                </Route>

                {/* Payrole Routes */}
                <Route path="payrole" element={<OutletLayout />}>
                  <Route index element={<PayroleMakebari />} />
                  <Route path="create_payrole" element={<PayroleForm />} />
                  <Route path="payrole_table" element={<PayroleTable />} />
                  <Route path="maskebari_table" element={<PayroleMakebari />} />
                  <Route path="payrole_log" element={<PayroleLogForm />} />
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
