import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/patient-dashboard", verifyToken, authorizeRoles("patient"), (req, res) => {
  res.json({ message: "Welcome to Patient Dashboard", user: req.user });
});

router.get("/doctor-dashboard", verifyToken, authorizeRoles("doctor"), (req, res) => {
  res.json({ message: "Welcome to Doctor Dashboard", user: req.user });
});

export default router;
