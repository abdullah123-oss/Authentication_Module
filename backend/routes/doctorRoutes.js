// routes/doctorRoutes.js
import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getDoctorAvailability,
  setDoctorAvailability,
} from "../controllers/doctorController.js";

const router = express.Router();

// Only logged-in doctors can access this (private routes)
router.use(verifyToken, authorizeRoles("doctor"));

router
  .route("/availability")
  .get(getDoctorAvailability)
  .post(setDoctorAvailability);

export default router;
