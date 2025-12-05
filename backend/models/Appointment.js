// backend/models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true, // the actual date (e.g., "2025-11-15")
    },
    startTime: {
      type: String,
      required: true, // "09:00"
    },
    endTime: {
      type: String,
      required: true, // "09:30"
    },
    reason: {
      type: String,
      trim: true,
    },

    // booking / workflow status
    status: {
      type: String,
      enum: [
    "pending_approval",
    "approved",   // NEW: patient requested, doctor must approve
    "pending_payment",    // doctor approved, waiting for payment
    "booked",             // paid
    "cancelled",
    "completed",
    "rejected",           // NEW: doctor rejected
  ],
  default: "pending_approval",
},


    // payment info
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    amount: {
      type: Number, // amount in Rupees; Stripe uses the same numeric value (multiplied by 100 for smallest unit)
      default: 0,
    },
    transactionId: {
      type: String, // stripe paymentIntent id, etc
    },

    //Finance Info
    invoiceNumber: { type: String },  
    paidAt: { type: Date }, 
    doctorEarning: { type: Number }, // optional: doctor earnings logic
    adminFee: { type: Number }, // optional: admin fee logic

  },
  { timestamps: true }
);

//appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
