import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboardLayout from "../../components/layouts/AdminDashboardLayout";

import AdminHome from "./Admin/AdminHome";
import ManageUsers from "./Admin/ManageUsers";

import AdminMedicines from "./Admin/AdminMedicines";
import AddMedicine from "./Admin/AddMedicine";
import EditMedicine from "./Admin/EditMedicine";

import AdminOrders from "./Admin/AdminOrders";
import AdminOrderDetails from "./Admin/AdminOrderDetails";

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminDashboardLayout />}>
        
        {/* Default redirect */}
        <Route index element={<Navigate to="home" />} />

        {/* Dashboard Home */}
        <Route path="home" element={<AdminHome />} />

        {/* Manage Users */}
        <Route path="users" element={<ManageUsers />} />

        {/* --- Medicines Module --- */}
        <Route path="medicines" element={<AdminMedicines />} />
        <Route path="medicines/add" element={<AddMedicine />} />
        <Route path="medicines/edit/:id" element={<EditMedicine />} />

        {/* Admin Order */}
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />


      </Route>
    </Routes>
  );
}
