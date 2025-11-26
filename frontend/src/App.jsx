import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { useSocketStore } from "./stores/socketStore";

// Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

// Auth Pages
import Signup from "./pages/AuthPages/Signup";
import Login from "./pages/AuthPages/Login";
import VerifyOtp from "./pages/AuthPages/VerifyOtp";
import ForgetPassword from "./pages/AuthPages/ForgetPassword";
import VerifyResetOtp from "./pages/AuthPages/Verify-Reset-Otp";
import ResetPassword from "./pages/AuthPages/ResetPassword";

// Dashboards
import PatientDashboard from "./pages/DashboardPages/PatientDashboard";
import DoctorDashboard from "./pages/DashboardPages/DoctorDashboard";
import AdminDashboard from "./pages/DashboardPages/AdminDashboard";   // ✅ NEW IMPORT

function App() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  // Auto-connect socket after refresh
  useEffect(() => {
    if (token) {
      useSocketStore.getState().connectSocket();
    }
  }, [token]);

  const redirectToDashboard = () => {
    if (user && user.role) return `/${user.role}-dashboard`;
    return "/login";
  };

  return (
    <>
      <Routes>
        {/* ---------- Auth Routes ---------- */}
        <Route
          path="/signup"
          element={token && user ? <Navigate to={redirectToDashboard()} /> : <Signup />}
        />

        <Route
          path="/login"
          element={token && user ? <Navigate to={redirectToDashboard()} /> : <Login />}
        />

        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ---------- Protected Dashboards ---------- */}
        <Route element={<ProtectedRoute />}>

          {/* Patient Dashboard */}
          <Route element={<RoleProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
          </Route>

          {/* Doctor Dashboard */}
          <Route element={<RoleProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard/*" element={<AdminDashboard />} /> 
            {/* 👆 IMPORTANT: use /admin-dashboard just like other dashboards */}
          </Route>

        </Route>

        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
