// src/components/layouts/PatientDashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaPills,
  FaShoppingCart,
  FaBoxOpen,
} from "react-icons/fa";

import { useAuthStore } from "../../stores/useAuthStore";
import { useSocketStore } from "../../stores/socketStore";
import { useNotificationStore } from "../../stores/notificationStore";

import { useCartStore } from "../../stores/cartStore";

import UserAvatar from "../UserAvatar";

export default function PatientDashboardLayout() {
  const navigate = useNavigate();

  /* ---------------- AUTH ---------------- */
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  /* ---------------- UI ---------------- */
  const [collapsed, setCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleSidebar = () => setCollapsed((c) => !c);

  /* ---------------- SOCKET ---------------- */
  const connectSocket = useSocketStore((s) => s.connectSocket);
  const socket = useSocketStore((s) => s.socket);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const initNotificationSocket = useNotificationStore((s) => s.initSocketListeners);

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (token) loadNotifications();
  }, [token]);

  useEffect(() => {
    if (socket) initNotificationSocket();
  }, [socket]);

  const handleNotificationClick = async (notif) => {
    await markAsRead(notif._id);
    if (notif.targetUrl) navigate(notif.targetUrl);
    setShowDropdown(false);
  };

  /* ---------------- CART COUNT (ZUSTAND) ---------------- */
  const cartCount = useCartStore((s) => s.count);
  const loadCartCount = useCartStore((s) => s.loadCartCount);
  const clearCartCount = useCartStore((s) => s.clearCount);

  useEffect(() => {
    loadCartCount(); // load on dashboard load
  }, []);

  /* ---------------- STYLES ---------------- */
  const linkClasses = "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all";

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      
      {/* ---------------- SIDEBAR ---------------- */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col bg-blue-800 text-white shadow-xl transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🩺</span>
              <span className="text-lg font-bold tracking-wide">MedCare</span>
            </div>
          ) : (
            <span className="mx-auto text-2xl">🩺</span>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700/40 transition"
          >
            <FaBars size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          <NavLink
            to="/patient-dashboard/browse-doctors"
            className={({ isActive }) =>
              `${linkClasses} ${
                isActive ? "bg-blue-600 shadow font-semibold" : "hover:bg-blue-700/60"
              }`
            }
          >
            <FaSearch />
            {!collapsed && <span>Browse Doctors</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/appointments"
            className={({ isActive }) =>
              `${linkClasses} ${
                isActive ? "bg-blue-600 shadow font-semibold" : "hover:bg-blue-700/60"
              }`
            }
          >
            <FaCalendarAlt />
            {!collapsed && <span>My Appointments</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/profile"
            className={({ isActive }) =>
              `${linkClasses} ${
                isActive ? "bg-blue-600 shadow font-semibold" : "hover:bg-blue-700/60"
              }`
            }
          >
            <FaUser />
            {!collapsed && <span>Profile</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/medicines"
            className={({ isActive }) =>
              `${linkClasses} ${
                isActive ? "bg-blue-600 shadow font-semibold" : "hover:bg-blue-700/60"
              }`
            }
          >
            <FaPills />
            {!collapsed && <span>Medicines</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/orders"
            className={({ isActive }) =>
              `${linkClasses} ${
                isActive ? "bg-blue-600 shadow font-semibold" : "hover:bg-blue-700/60"
              }`
            }
          >
            <FaBoxOpen />
            {!collapsed && <span>My Orders</span>}
          </NavLink>
        </nav>

        {/* Logout + footer */}
        <div className="px-4 pb-6 pt-4 border-t border-blue-700">
          <div
            onClick={() => navigate("/patient-dashboard/profile")}
            className="flex items-center gap-3 cursor-pointer hover:bg-blue-700/40 p-2 rounded-md transition"
          >
            <UserAvatar user={user} />

            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-xs opacity-80">{user?.email}</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              <FaSignOutAlt />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Patient Dashboard</h1>
            <p className="text-sm text-gray-500">
              Browse doctors, medicines & manage appointments
            </p>
          </div>

          <div className="flex items-center gap-6">

            {/* ---------------- CART ICON ---------------- */}
            <div
              onClick={() => {
                clearCartCount(); // reset badge
                navigate("/patient-dashboard/cart");
              }}
              className="relative cursor-pointer text-gray-700 hover:text-gray-900"
            >
              <FaShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>

            {/* ---------------- Notifications ---------------- */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((s) => !s)}
                className="relative text-gray-700 hover:text-gray-900"
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl border rounded-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b flex justify-between">
                    <span className="font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y">
                    {notifications.length === 0 && (
                      <p className="p-3 text-gray-500 text-sm text-center">
                        No notifications
                      </p>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-sm cursor-pointer ${
                          n.read ? "bg-white" : "bg-blue-50"
                        } hover:bg-gray-100`}
                      >
                        <div className="font-medium">{n.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gray-500">Logged in</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 p-3 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MedCare Platform
        </footer>
      </div>
    </div>
  );
}
