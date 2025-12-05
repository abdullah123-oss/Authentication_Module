// routes/cartRoutes.js
import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Patients only
router.use(verifyToken, authorizeRoles("patient"));

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCart);
router.delete("/remove/:medicineId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
