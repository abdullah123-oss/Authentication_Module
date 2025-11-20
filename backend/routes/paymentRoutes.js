// backend/routes/paymentRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createPaymentIntent } from "../controllers/paymentController.js";

const router = express.Router();

// create payment intent for an appointment (patient must be logged in)
router.post("/create-payment-intent", verifyToken, createPaymentIntent);

export default router;
