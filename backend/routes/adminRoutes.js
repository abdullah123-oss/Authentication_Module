import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

import { getStats } from "../controllers/admin/adminStatsController.js";
import { getAllUsers, deleteUser } from "../controllers/admin/adminUserController.js";

import {
  createMedicine,
  updateMedicine,
  getAllMedicines,
  getMedicineById,
  deleteMedicine,
} from "../controllers/admin/medicineController.js";

import { uploadMedicineImage } from "../middlewares/uploadMedicine.js";

const router = express.Router();

// All admin routes require: logged-in + admin role
router.use(verifyToken, authorizeRoles("admin"));

// Dashboard statistics
router.get("/stats", getStats);

// Manage users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Medicine routes
router.get("/medicines", getAllMedicines);
router.post("/medicines", uploadMedicineImage.single("image"), createMedicine);
router.get("/medicines/:id", getMedicineById);
router.put("/medicines/:id", uploadMedicineImage.single("image"), updateMedicine);
router.delete("/medicines/:id", deleteMedicine);


export default router;
