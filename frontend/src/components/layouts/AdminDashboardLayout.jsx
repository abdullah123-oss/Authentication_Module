// AdminDashboardLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUsers,
  FaPills,
  FaSignOutAlt,
  FaBox,
} from "react-icons/fa";
import { useAuthStore } from "../../stores/useAuthStore";

export default function AdminDashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-indigo-700 text-white shadow-xl transition-all duration-300 
        ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-indigo-600">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide">Admin Panel</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-indigo-600 rounded"
          >
            <FaBars size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-2 text-sm">
          <SidebarLink
            to="/admin-dashboard/home"
            icon={<FaTachometerAlt />}
            collapsed={collapsed}
            label="Dashboard"
          />
          <SidebarLink
            to="/admin-dashboard/users"
            icon={<FaUsers />}
            collapsed={collapsed}
            label="Users"
          />
          <SidebarLink
            to="/admin-dashboard/medicines"
            icon={<FaPills />}
            collapsed={collapsed}
            label="Medicines"
          />
          <SidebarLink
            to="/admin-dashboard/orders"
            icon={<FaBox />}
            collapsed={collapsed}
            label="Orders"
          />

        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 w-full px-4">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-500 px-3 py-2 rounded-md hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className={`${collapsed ? "ml-20" : "ml-64"} flex-1 transition-all`}>
        {/* HEADER */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
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

function SidebarLink({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-md transition text-sm
        ${isActive ? "bg-indigo-500" : "hover:bg-indigo-600"}`
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}
