import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getDoctorAvailability,
  setDoctorAvailability,
} from "../controllers/doctorController.js";

import {
  getPublicMedicines,
  getPublicMedicineById,
} from "../controllers/publicMedicineController.js";

const router = express.Router();

// Only logged-in doctors can access this (private routes)
router.use(verifyToken, authorizeRoles("doctor"));

// Doctor Availability
router
  .route("/availability")
  .get(getDoctorAvailability)
  .post(setDoctorAvailability);

// Doctor Medicine View (Read-Only)
router.get("/medicines", getPublicMedicines);
router.get("/medicines/:id", getPublicMedicineById);

export default router;
