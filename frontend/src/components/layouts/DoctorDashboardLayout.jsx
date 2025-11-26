// src/components/layouts/DoctorDashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCalendarAlt,
  FaClipboardList,
  FaUserMd,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";

import { useAuthStore } from "../../stores/useAuthStore";
import { useSocketStore } from "../../stores/socketStore";
import { useNotificationStore } from "../../stores/notificationStore";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUrl";
import UserAvatar from "../UserAvatar";

/** Helper — initials fallback (kept for safety) */
const getInitials = (name = "") => {
  if (!name) return "D";
  return name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function DoctorDashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { socket, connectSocket } = useSocketStore();

  // Notification store selectors
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const initNotificationSocket = useNotificationStore(
    (s) => s.initSocketListeners
  );

  /** Connect socket once after mount */
  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  /** Load notifications when token exists */
  useEffect(() => {
    if (!token) return;
    loadNotifications();
  }, [token, loadNotifications]);

  /** Socket toast listeners for appointment events */
  useEffect(() => {
    if (!socket) return;

    const handleNew = (appt) =>
      toast.success(`New appointment from ${appt.patient?.name || "a patient"}`);

    const handlePaid = () => toast.success("Payment received");
    const handleCancelled = () => toast.error("Appointment cancelled");

    socket.on("appointment:new", handleNew);
    socket.on("appointment:paid", handlePaid);
    socket.on("appointment:cancelled", handleCancelled);

    return () => {
      socket.off("appointment:new", handleNew);
      socket.off("appointment:paid", handlePaid);
      socket.off("appointment:cancelled", handleCancelled);
    };
  }, [socket]);

  /** Notification socket listeners */
  useEffect(() => {
    if (!socket) return;
    initNotificationSocket();
  }, [socket, initNotificationSocket]);

  const handleNotificationClick = async (notif) => {
    if (!notif) return;
    await markAsRead(notif._id);
    if (notif.targetUrl) navigate(notif.targetUrl);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setCollapsed((c) => !c);

  const linkBaseClasses =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm";

  const initials = getInitials(user?.name);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col bg-blue-800 text-white shadow-xl transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
            <span className="text-2xl">🩺</span>
            {!collapsed && <span className="text-lg font-bold">MedCare</span>}
          </div>

          <button
            aria-label="Toggle menu"
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700/40"
          >
            <FaBars />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          <NavLink
            to="/doctor-dashboard/myschedule"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaCalendarAlt />
            {!collapsed && <span>My Schedule</span>}
          </NavLink>

          <NavLink
            to="/doctor-dashboard/appointments"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaClipboardList />
            {!collapsed && <span>Appointments</span>}
          </NavLink>

          <NavLink
            to="/doctor-dashboard/profile"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaUserMd />
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </nav>

        {/* PROFILE FOOTER */}
        <div className="px-4 pb-6 pt-4 border-t border-blue-700">
          {!collapsed && <p className="text-xs mb-3 opacity-80">Profile</p>}

          <div
            onClick={() => navigate("/doctor-dashboard/profile")}
            className="flex items-center gap-3 cursor-pointer mb-4 hover:bg-blue-700/40 p-2 rounded-lg transition"
          >
            <UserAvatar user={user} />

            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">Dr. {user?.name}</div>
                <div className="text-xs opacity-80">{user?.email}</div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors text-sm"
            >
              <FaSignOutAlt />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-700">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500 hidden md:block">Manage your appointments & schedule</p>
          </div>

          <div className="flex items-center gap-6 relative">
            {/* Notifications */}
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
                      <p className="p-3 text-gray-500 text-sm text-center">No notifications</p>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-sm cursor-pointer ${n.read ? "bg-white" : "bg-blue-50"} hover:bg-gray-100`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="font-medium">{n.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile short */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-700">Dr. {user?.name}</div>
                <div className="text-xs text-gray-500">Logged in</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200 p-3 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MedCare Platform. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
