// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Which user this notification belongs to
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Short type key so frontend can branch on it
    // e.g. "appointment_approved", "appointment_rejected", "payment_succeeded"
    type: {
      type: String,
      required: true,
    },

    // Text shown to the user
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Where to navigate when user clicks this notification
    // e.g. "/patient-dashboard/pay/123", "/patient-dashboard/appointments"
    targetUrl: {
      type: String,
      required: false,
    },

    // Extra data for frontend if needed (appointmentId, etc.)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Read / unread
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
