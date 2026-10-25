import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Departments from "./pages/Departments";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Medicines from "./pages/Medicines";
import Users from "./pages/Users";
import Prescriptions from "./pages/Prescriptions";
import Bills from "./pages/Bills";
import Payments from "./pages/Payments";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Protect pages that require login
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Reusable layout for authenticated pages
function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Login */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />

          {/* Patients */}
          <Route
            path="/patients"
            element={
              <ProtectedLayout>
                <Patients />
              </ProtectedLayout>
            }
          />

          {/* Doctors */}
          <Route
            path="/doctors"
            element={
              <ProtectedLayout>
                <Doctors />
              </ProtectedLayout>
            }
          />

          {/* Departments */}
          <Route
            path="/departments"
            element={
              <ProtectedLayout>
                <Departments />
              </ProtectedLayout>
            }
          />

          {/* Appointments */}
          <Route
            path="/appointments"
            element={
              <ProtectedLayout>
                <Appointments />
              </ProtectedLayout>
            }
          />

          {/* Medical Records */}
          <Route
            path="/medical-records"
            element={
              <ProtectedLayout>
                <MedicalRecords />
              </ProtectedLayout>
            }
          />

          {/* Medicines */}
          <Route
            path="/medicines"
            element={
              <ProtectedLayout>
                <Medicines />
              </ProtectedLayout>
            }
          />

          {/* Users */}
          <Route
            path="/users"
            element={
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            }
          />

          {/* Prescriptions */}
          <Route
            path="/prescriptions"
            element={
              <ProtectedLayout>
                <Prescriptions />
              </ProtectedLayout>
            }
          />

          {/* Bills */}
          <Route
            path="/bills"
            element={
              <ProtectedLayout>
                <Bills />
              </ProtectedLayout>
            }
          />

          {/* Unknown paths — keep this route last */}
          <Route
            path="*"
            element={
              <Navigate to="/dashboard" replace />
            }
          />
<Route
  path="/payments"
  element={
    <ProtectedLayout>
      <Payments />
    </ProtectedLayout>
  }
/>
<Route
  path="/notifications"
  element={<Notifications />}
/>
<Route path="/audit-logs" element={<AuditLogs />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;