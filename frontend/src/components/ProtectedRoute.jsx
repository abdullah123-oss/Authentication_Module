import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const ProtectedRoute = () => {
  const { user, token, hydrated } = useAuthStore();

  // Wait until Zustand loads data
  if (!hydrated) return <div />; // or a loader UI

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
