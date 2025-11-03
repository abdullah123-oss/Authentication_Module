import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <p className="mb-4">Welcome patient! ✅</p>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default PatientDashboard;
