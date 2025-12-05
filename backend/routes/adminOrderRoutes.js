import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  deleteOrderAdmin,
} from "../controllers/admin/adminOrderController.js"

const router = express.Router();

// protect with admin role
router.use(verifyToken, authorizeRoles("admin"));

router.get("/", getAllOrdersAdmin);               // Get all orders
router.get("/:id", getOrderByIdAdmin);             // Get single order
router.put("/:id/status", updateOrderStatusAdmin); // Update status
router.delete("/:id", deleteOrderAdmin);           // Delete order

export default router;
