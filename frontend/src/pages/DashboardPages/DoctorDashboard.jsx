import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      <p className="mb-4">Welcome doctor! ✅</p>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default DoctorDashboard;
