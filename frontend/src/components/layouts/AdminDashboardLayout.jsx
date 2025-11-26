import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaBars, FaTachometerAlt, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "../../stores/useAuthStore";

export default function AdminDashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* =============== SIDEBAR =============== */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-indigo-700 text-white shadow-lg transition-all 
        ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-indigo-600">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
          )}

          <button onClick={toggleSidebar} className="p-2 hover:bg-indigo-600 rounded">
            <FaBars />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-2">
          <NavLink
            to="/admin-dashboard/home"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                isActive ? "bg-indigo-500" : "hover:bg-indigo-600"
              }`
            }
          >
            <FaTachometerAlt />
            {!collapsed && "Dashboard"}
          </NavLink>

          <NavLink
            to="/admin-dashboard/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                isActive ? "bg-indigo-500" : "hover:bg-indigo-600"
              }`
            }
          >
            <FaUsers />
            {!collapsed && "Users"}
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 w-full px-4">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500 px-3 py-2 rounded-md hover:bg-red-600"
          >
            <FaSignOutAlt /> {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* =============== MAIN CONTENT =============== */}
      <div className={`${collapsed ? "ml-20" : "ml-64"} flex-1`}>
        <header className="bg-white shadow px-6 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">Admin Dashboard</h2>
          
          <span className="text-sm text-gray-500">Logged in as: {user?.email}</span>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
