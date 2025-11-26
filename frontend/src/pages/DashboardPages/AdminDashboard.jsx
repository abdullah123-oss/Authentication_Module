import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/layouts/AdminDashboardLayout";

import AdminHome from "./Admin/AdminHome";
import ManageUsers from "./Admin/ManageUsers";

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminDashboardLayout />}>
        <Route index element={<Navigate to="home" />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="users" element={<ManageUsers />} />
        
        {/* Add more pages later */}
        {/* <Route path="appointments" element={<ManageAppointments />} /> */}
        {/* <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
}
