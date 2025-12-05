// backend/controllers/paymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import Appointment from "../models/Appointment.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Medicine from "../models/Medicine.js";
import { io } from "../server.js";
import { sendNotification } from "../helpers/sendNotification.js";
import { generateInvoiceNumber } from "../helpers/invoiceGenerator.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* --------------------------------------------------
   SOCKET HELPER FOR APPOINTMENTS
-------------------------------------------------- */
const emitAppointmentUpdate = async (appointmentId, { isPaid = false } = {}) => {
  const appt = await Appointment.findById(appointmentId)
    .populate("patient", "name email")
    .populate("doctor", "name email");

  if (!appt) return;

  const doctorRoom = `user_${appt.doctor._id}`;
  const patientRoom = `user_${appt.patient._id}`;

  io.to(doctorRoom).emit("appointment:updated", appt);
  io.to(patientRoom).emit("appointment:updated", appt);

  if (isPaid) {
    io.to(doctorRoom).emit("appointment:paid", appt);
    io.to(patientRoom).emit("appointment:paid", appt);
  }
};

/* --------------------------------------------------
   A. APPOINTMENT PAYMENT INTENT
-------------------------------------------------- */
export const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId)
      return res.status(400).json({ message: "appointmentId is required" });

    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor",
      "name email"
    );

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Appointment is already paid." });
    }

    if (
      appointment.status !== "approved" &&
      appointment.status !== "pending_payment"
    ) {
      return res.status(400).json({
        message: "Appointment not approved by doctor yet.",
      });
    }

    if (appointment.status === "approved") {
      appointment.status = "pending_payment";
      await appointment.save();
      await emitAppointmentUpdate(appointment._id);
    }

    const amountSmallestUnit = Math.round((appointment.amount || 0) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountSmallestUnit,
      currency: "usd",
      metadata: {
        type: "appointment",
        appointmentId: appointment._id.toString(),
        doctorId: appointment.doctor._id?.toString?.() || "",
        patientId: appointment.patient?.toString?.() || "",
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe create payment intent error:", err);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
};

/* --------------------------------------------------
   B. MEDICINE ORDER PAYMENT INTENT
-------------------------------------------------- */
export const createMedicinePaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      metadata: {
        type: "medicine_order",
        userId: userId.toString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Medicine create payment intent error:", err);
    res.status(500).json({
      message: "Failed to create payment intent for order",
    });
  }
};

/* --------------------------------------------------
   C. STRIPE WEBHOOK (Appointments + Orders)
-------------------------------------------------- */
export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { appointmentId, userId, type } = paymentIntent.metadata || {};

        /* --------------------------------------------------
            1) Appointment Payment
        -------------------------------------------------- */
        if (appointmentId) {
          const appt = await Appointment.findById(appointmentId)
            .populate("patient", "name email")
            .populate("doctor", "name email");

          if (appt && !["cancelled","rejected"].includes(appt.status)) {
            appt.paymentStatus = "paid";
            appt.status = "booked";
            appt.transactionId = paymentIntent.id;
            appt.invoiceNumber = generateInvoiceNumber("APT");   // 👈 new professional invoice code
            appt.paidAt = new Date();

            const adminFee = appt.amount * 0.10;
            const doctorEarning = appt.amount - adminFee;
            appt.adminFee = adminFee;
            appt.doctorEarning = doctorEarning;

            await appt.save();
            await emitAppointmentUpdate(appointmentId,{isPaid:true});
          }
        }

        /* --------------------------------------------------
            2) Medicine Order Payment
        -------------------------------------------------- */
        if (type === "medicine_order") {
          const cart = await Cart.findOne({ userId });
          if (!cart || cart.items.length === 0) break;

          const newOrder = await Order.create({
            userId,
            items: cart.items,
            totalAmount: paymentIntent.amount / 100,
            paymentStatus: "paid",
            orderStatus: "processing",
            transactionId: paymentIntent.id,
            invoiceNumber: generateInvoiceNumber("ORD"),  // 👈 Updated!
            paidAt: new Date(),
            paymentInfo: {
              id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              status: paymentIntent.status
            }
          });

          for (const item of newOrder.items) {
            await Medicine.findByIdAndUpdate(item.medicineId,{
              $inc:{ stockQuantity:-item.quantity }
            });
          }

          await Cart.findOneAndUpdate({userId},{items:[],totalAmount:0});
        }
        break;
      }

      /* ---- PAYMENT FAILED ---- */
      case "payment_intent.payment_failed": /* unchanged */
      default: console.log("Unhandled event:", event.type);
    }

    res.json({received:true});
  } catch (err) {
    console.error("Webhook Handler Error:", err);
    res.status(500).send("Webhook failed");
  }
};
