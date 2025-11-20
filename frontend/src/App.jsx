import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useEffect } from "react";
import { useSocketStore } from "./stores/socketStore";   // ⬅️ NEW

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

function App() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  // ⬅️ Auto-connect socket after refresh
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

        <Route path="/auth/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ---------- Protected Dashboards ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* Patient */}
          <Route element={<RoleProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
          </Route>

          {/* Doctor */}
          <Route element={<RoleProtectedRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
