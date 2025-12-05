import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PatientDashboardLayout from "../../components/layouts/PatientDashboardLayout";

import BrowseDoctors from "./Patient/BrowseDoctors";
import Appointments from "./Patient/MyAppointments";
import Profile from "./Patient/Profile";
import PayForAppointment from "./Patient/PayForAppointment";
import DoctorDetails from "./Patient/DoctorDetails";
import PatientMedicines from "./Patient/PatientMedicines";
import PatientMedicineDetails from "./Patient/PatientMedicineDetails";
import CartPage from "./Patient/CartPage";
import CheckoutMedicines from "./Patient/CheckoutMedicines";
import MyOrders from "./Patient/MyOrders";

const PatientDashboard = () => {
  return (
    <Routes>
      <Route element={<PatientDashboardLayout />}>
        <Route index element={<Navigate to="browse-doctors" />} />

        <Route path="browse-doctors" element={<BrowseDoctors />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="profile" element={<Profile />} />
        <Route path="medicines" element={<PatientMedicines />} />
        <Route path="medicines/:id" element={<PatientMedicineDetails />} />

        <Route path="cart" element={<CartPage />} /> 
        <Route path="checkout" element={<CheckoutMedicines />} />

        {/* ✅ NEW: My Orders page */}
        <Route path="orders" element={<MyOrders />} />


        {/* ⭐ REQUIRED PAYMENT ROUTE ⭐ */}
        <Route path="pay/:appointmentId" element={<PayForAppointment />} />

        <Route path="doctor/:id" element={<DoctorDetails />} /> 
      </Route>
    </Routes>
  );
};

export default PatientDashboard;