import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PatientDashboardLayout from "../../components/layouts/PatientDashboardLayout";

import BrowseDoctors from "./Patient/BrowseDoctors";
import Appointments from "./Patient/MyAppointments";
import Profile from "./Patient/Profile";
import PayForAppointment from "./Patient/PayForAppointment";
import DoctorDetails from "./Patient/DoctorDetails";

const PatientDashboard = () => {
  return (
    <Routes>
      <Route element={<PatientDashboardLayout />}>
        <Route index element={<Navigate to="browse-doctors" />} />

        <Route path="browse-doctors" element={<BrowseDoctors />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="profile" element={<Profile />} />

        {/* ⭐ REQUIRED PAYMENT ROUTE ⭐ */}
        <Route path="pay/:appointmentId" element={<PayForAppointment />} />

        <Route path="doctor/:id" element={<DoctorDetails />} />

        

      </Route>
    </Routes>
  );
};

export default PatientDashboard;