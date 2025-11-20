// backend/controllers/paymentController.js
import Stripe from "stripe";
import dotenv from "dotenv";
import Appointment from "../models/Appointment.js";
import { io } from "../server.js";
import { sendNotification } from "../helpers/sendNotification.js";


dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// helper: emit socket updates when payment status changes
const emitAppointmentUpdate = async (appointmentId, { isPaid = false } = {}) => {
  const appt = await Appointment.findById(appointmentId)
    .populate("patient", "name email")
    .populate("doctor", "name email");

  if (!appt) return;

  const doctorRoom = `user_${appt.doctor._id}`;
  const patientRoom = `user_${appt.patient._id}`;

  // generic update
  io.to(doctorRoom).emit("appointment:updated", appt);
  io.to(patientRoom).emit("appointment:updated", appt);

  // special event when payment is done
  if (isPaid) {
    io.to(doctorRoom).emit("appointment:paid", appt);
    io.to(patientRoom).emit("appointment:paid", appt);
  }
};

// POST /api/payments/create-payment-intent
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

    /**
     * ✅ New rule:
     * - Doctor must approve first
     * - We allow status "approved" or "pending_payment"
     *   (so if user refreshes payment page, it still works)
     */
    if (
      appointment.status !== "approved" &&
      appointment.status !== "pending_payment"
    ) {
      return res.status(400).json({
        message: "Appointment not approved by doctor yet.",
      });
    }

    // If currently "approved", move it into "pending_payment"
    if (appointment.status === "approved") {
      appointment.status = "pending_payment";
      await appointment.save();
      await emitAppointmentUpdate(appointment._id);
    }

    const amountCents = Math.round((appointment.amount || 0) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
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

// Stripe Webhook
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
        const appointmentId = paymentIntent.metadata.appointmentId;

        console.log("payment_intent.succeeded for", appointmentId);

        if (appointmentId) {
          const appt = await Appointment.findById(appointmentId)
            .populate("patient", "name")
            .populate("doctor", "name");
          if (!appt) break;

          // Only update if not cancelled/rejected
          if (!["cancelled", "rejected"].includes(appt.status)) {
            appt.paymentStatus = "paid";
            appt.status = "booked"; // ✅ final state
            appt.transactionId = paymentIntent.id;
            await appt.save();
            await emitAppointmentUpdate(appointmentId, { isPaid: true });

            // 🔔 Notifications
            await sendNotification({
              userId: appt.patient._id || appt.patient,
              type: "payment_success",
              message: "Payment successful! Your appointment is booked.",
              targetUrl: "/patient-dashboard/appointments",
              meta: { appointmentId },
            });

            await sendNotification({
              userId: appt.doctor._id || appt.doctor,
              type: "payment_success",
              message: `Payment received for appointment with ${
                appt.patient?.name || "the patient"
              }`,
              targetUrl: "/doctor-dashboard/appointments",
              meta: { appointmentId },
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const appointmentId = paymentIntent.metadata.appointmentId;

        console.log("payment_intent.payment_failed for", appointmentId);

        if (appointmentId) {
          const appt = await Appointment.findById(appointmentId)
            .populate("patient", "name")
            .populate("doctor", "name");
          if (appt && appt.paymentStatus !== "paid") {
            appt.paymentStatus = "unpaid";

            // if we were in payment flow, revert to "approved"
            if (appt.status === "pending_payment") {
              appt.status = "approved";
            }

            await appt.save();
            await emitAppointmentUpdate(appointmentId);

            await sendNotification({
              userId: appt.patient._id || appt.patient,
              type: "payment_failed",
              message: "Your payment failed. Please try again.",
              targetUrl: `/patient-dashboard/pay/${appointmentId}`,
              meta: { appointmentId },
            });
          }
        }
        break;
      }

      default:
        console.log("Unhandled event:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed:", err);
    res.status(500).send("Webhook handler failed");
  }
};
