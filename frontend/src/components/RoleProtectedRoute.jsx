import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return <div />;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
