import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

import { getStats } from "../controllers/admin/adminStatsController.js";
import { getAllUsers, deleteUser } from "../controllers/admin/adminUserController.js";

const router = express.Router();

// All admin routes require: logged-in + admin role
router.use(verifyToken, authorizeRoles("admin"));

// Dashboard statistics
router.get("/stats", getStats);

// Manage users (doctor/patient)
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// upcoming: manage doctors, patients, appointments, notifications etc.

export default router;
