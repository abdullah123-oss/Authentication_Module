// backend/routes/appointmentRoutes.js
import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  bookAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  cancelAppointment,
  approveAppointment,
  rejectAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

// Patient books
router.post("/book", verifyToken, authorizeRoles("patient"), bookAppointment);

// Patient appointments
router.get("/patient", verifyToken, authorizeRoles("patient"), getPatientAppointments);

// Doctor appointments
router.get("/doctor", verifyToken, getDoctorAppointments);

// Cancel appointment
router.put("/cancel/:appointmentId", verifyToken, cancelAppointment);

// Doctor approves
router.put("/approve/:appointmentId", verifyToken, approveAppointment);

// Doctor rejects
router.put("/reject/:appointmentId", verifyToken, rejectAppointment);

export default router;
