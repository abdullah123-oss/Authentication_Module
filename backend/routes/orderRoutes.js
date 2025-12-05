// backend/routes/orderRoutes.js
import express from "express";
import {
  createMedicinePaymentIntent,
} from "../controllers/paymentController.js";
import {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// all order routes require login
router.use(verifyToken);

// 💳 start medicine payment flow (creates pending order + Stripe intent)
router.post("/create-payment-intent", createMedicinePaymentIntent);

// 🧑‍💻 patient: my orders
router.get("/my", getMyOrders);

// 👨‍✈️ admin: all orders
router.get("/", authorizeRoles("admin"), getAllOrders);

// 👨‍✈️ admin: update order status
router.patch("/:id/status", authorizeRoles("admin"), updateOrderStatus);

export default router;
