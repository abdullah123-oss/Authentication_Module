// src/pages/DashboardPages/Doctor/DoctorDashboard.jsx
import React from "react";
import DoctorDashboardLayout from "../../components/layouts/DoctorDashboardLayout";
import MySchedule from "./Doctor/MySchedule";
import Appointments from "./Doctor/Appointments";
import Profile from "./Doctor/Profile";
import { Routes, Route, Navigate } from "react-router-dom";

const DoctorDashboard = () => {
  return (
    <Routes>
      <Route element={<DoctorDashboardLayout />}>
        <Route index element={<Navigate to="myschedule" />} />
        <Route path="myschedule" element={<MySchedule />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default DoctorDashboard;
