import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  downloadOrderInvoice,
  downloadAppointmentInvoice
} from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/order/:orderId", verifyToken, downloadOrderInvoice);
router.get("/appointment/:appointmentId", verifyToken, downloadAppointmentInvoice);

export default router;
