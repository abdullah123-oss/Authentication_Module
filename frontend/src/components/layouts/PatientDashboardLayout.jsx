import React, { useState, useEffect} from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import { useAuthStore } from "../../stores/useAuthStore";
import { useSocketStore } from "../../stores/socketStore";
import { useNotificationStore } from "../../stores/notificationStore";

export default function PatientDashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleSidebar = () => setCollapsed((c) => !c);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const connectSocket = useSocketStore((s) => s.connectSocket);
  const socket = useSocketStore((s) => s.socket);

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications
  );
  const initNotificationSocket = useNotificationStore(
    (state) => state.initSocketListeners
  );

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (!token) return;
    loadNotifications();
  }, [token, loadNotifications]);

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


  const linkBaseClasses =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm";
 
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-blue-800 text-white shadow-xl transition-width duration-200
          ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
            <span className="text-2xl">🩺</span>
            {!collapsed && <span className="text-lg font-bold">MedCare</span>}
          </div>

          {/* hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={toggleSidebar}
            className="p-2 rounded hover:bg-blue-700/40"
          >
            <FaBars />
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-2">
          <NavLink
            to="/patient-dashboard/browse-doctors"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaSearch className="flex-shrink-0" />
            {!collapsed && <span>Browse Doctors</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/appointments"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaCalendarAlt className="flex-shrink-0" />
            {!collapsed && <span>My Appointments</span>}
          </NavLink>

          <NavLink
            to="/patient-dashboard/profile"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? "bg-blue-600 font-semibold" : "hover:bg-blue-700/60"}`
            }
          >
            <FaUser className="flex-shrink-0" />
            {!collapsed && <span>Profile</span>}
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors text-sm"
          >
            <FaSignOutAlt />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-700">Patient Dashboard</h1>
            <div className="hidden md:block text-sm text-gray-500">
              Browse doctors & manage appointments
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6 relative">
            {/* NOTIFICATION */}
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
                        className={`p-3 text-sm cursor-pointer ${
                          n.read ? "bg-white" : "bg-blue-50"
                        } hover:bg-gray-100`}
                        onClick={() => handleNotificationClick(n)}
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

            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{user?.name || "Patient"}</div>
              <div className="text-xs text-gray-500">Logged in</div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              aria-label="Logout"
            >
              <FaSignOutAlt />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </header>

        {/* page content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-3 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MedCare Platform. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
