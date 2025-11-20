// src/pages/DashboardPages/Doctor/Profile.jsx
import React from "react";
import { useAuthStore } from "../../../stores/useAuthStore";

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Doctor Profile</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm font-medium">Name:</label>
          <p className="text-gray-800">{user?.name || "N/A"}</p>
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Email:</label>
          <p className="text-gray-800">{user?.email || "N/A"}</p>
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Role:</label>
          <p className="text-gray-800 capitalize">{user?.role || "doctor"}</p>
        </div>

        <div>
          <label className="block text-gray-600 text-sm font-medium">Specialization:</label>
          <p className="text-gray-800">{user?.specialization || "Not specified"}</p>
        </div>
      </div>

      <div className="mt-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          onClick={() => alert("Edit profile coming soon...")}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
