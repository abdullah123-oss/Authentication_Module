// backend/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { sendNotification } from "../helpers/sendNotification.js";


// -----------------------------------------------------------
// Helper: Broadcast updates to patient + doctor
// -----------------------------------------------------------
const emitAppointmentUpdate = async (appointmentId, { isNew = false } = {}) => {
  const appt = await Appointment.findById(appointmentId)
    .populate("patient", "name email")
    .populate("doctor", "name email");

  if (!appt) return;

  const doctorRoom = `user_${appt.doctor._id}`;
  const patientRoom = `user_${appt.patient._id}`;

  if (isNew) {
    io.to(doctorRoom).emit("appointment:new", appt);
  }

  io.to(doctorRoom).emit("appointment:updated", appt);
  io.to(patientRoom).emit("appointment:updated", appt);
};


// -----------------------------------------------------------
// BOOK APPOINTMENT  → status = pending_approval
// -----------------------------------------------------------
export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { doctorId, date, startTime, endTime, reason, amount } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1) Check availability
    const doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId });
    if (!doctorAvailability)
      return res.status(400).json({ message: "Doctor has not set availability." });

    const weekday = new Date(date).toLocaleString("en-US", { weekday: "long" });
    const daySlot = doctorAvailability.slots.find((s) => s.day === weekday);

    if (!daySlot)
      return res.status(400).json({ message: "Doctor is not available on this day." });

    const validSlot = daySlot.times.some(
      (s) => s.start <= startTime && s.end >= endTime
    );

    if (!validSlot)
      return res.status(400).json({ message: "Doctor not available in this time range." });

    // 2) Check if slot already booked
    const exists = await Appointment.findOne({
      doctor: doctorId,
      date,
      startTime,
      status: { $nin: ["cancelled", "rejected"] }
    });

    if (exists)
      return res.status(400).json({ message: "This slot is already booked." });

    // 3) Determine amount (use provided amount or doctor's consultationFee)
    let finalAmount = amount;
    if (!finalAmount) {
      const doc = await User.findById(doctorId).select("consultationFee");
      finalAmount = doc?.consultationFee || 0;
    }

    // 4) CREATE appointment with pending_approval
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date,
      startTime,
      endTime,
      reason,
      amount: finalAmount,
      status: "pending_approval",
      paymentStatus: "unpaid"
    });


    // 🔔 Notify doctor instantly
    emitAppointmentUpdate(appointment._id, { isNew: true });

    await sendNotification({
      userId: doctorId,
      type: "appointment_request",
      message: `New appointment request from ${req.user.name}`,
      targetUrl: "/doctor-dashboard/appointments",
      meta: { appointmentId: appointment._id },
    });

    res.json({
      message: "Appointment created, awaiting doctor approval",
      appointmentId: appointment._id,
      appointment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while booking appointment." });
  }
};

// -----------------------------------------------------------
// DOCTOR APPROVE  → status = approved
// -----------------------------------------------------------
export const approveAppointment = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);

    if (!appt)
      return res.status(404).json({ message: "Appointment not found." });

    if (appt.doctor.toString() !== doctorId.toString())
      return res.status(403).json({ message: "Forbidden." });

    if (appt.status !== "pending_approval")
      return res.status(400).json({ message: "Not in pending_approval state." });

    // ✅ just "approved" here
    appt.status = "approved";
    await appt.save();

    //Real Time Notifications
    await sendNotification({
      userId: appt.patient,
      type: "appointment_approved",
      message: `Your appointment with Dr. ${req.user.name} was approved`,
      targetUrl: `/patient-dashboard/pay/${appt._id}`,
      meta: { appointmentId: appt._id },
    });
    

    // 🔔 notify both patient and doctor with simple toast popups
    emitAppointmentUpdate(appt._id);

    res.json({ message: "Approved. Waiting for payment.", appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve appointment." });
  }
};


// -----------------------------------------------------------
// DOCTOR REJECT → status = rejected
// -----------------------------------------------------------
export const rejectAppointment = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);

    if (!appt)
      return res.status(404).json({ message: "Appointment not found." });

    if (appt.doctor.toString() !== doctorId.toString())
      return res.status(403).json({ message: "Forbidden." });

    if (appt.status !== "pending_approval")
      return res.status(400).json({ message: "Not in pending_approval state." });

    appt.status = "rejected";
    await appt.save();

    //Real Time Notifications
    await sendNotification({
      userId: appt.patient,
      type: "appointment_rejected",
      message: `Your appointment with Dr. ${req.user.name} was rejected`,
      targetUrl: "/patient-dashboard/appointments",
      meta: { appointmentId: appt._id },
    });
    

    // 🔔 notify both sides with simple toast popups
    emitAppointmentUpdate(appt._id);

    res.json({ message: "Appointment rejected.", appointment: appt });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject appointment." });
  }
};


// -----------------------------------------------------------
// GET DOCTOR APPOINTMENTS
// -----------------------------------------------------------
export const getDoctorAppointments = async (req, res) => {
  try {
    const requester = req.user;
    const { doctorId, date } = req.query;

    const q = {};

    if (doctorId) {
      q.doctor = doctorId;
    } else if (requester.role === "doctor") {
      q.doctor = requester._id;
    } else {
      return res.status(400).json({ message: "doctorId required for non-doctor" });
    }

    if (date) {
      const d1 = new Date(date);
      d1.setHours(0, 0, 0, 0);
      const d2 = new Date(d1);
      d2.setDate(d2.getDate() + 1);
      q.date = { $gte: d1, $lt: d2 };
    }

    const appointments = await Appointment.find(q)
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctor appointments." });
  }
};

// -----------------------------------------------------------
// GET PATIENT APPOINTMENTS
// -----------------------------------------------------------
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name email")
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch patient appointments." });
  }
};


// -----------------------------------------------------------
// CANCEL APPOINTMENT
// -----------------------------------------------------------
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { appointmentId } = req.params;

    const appt = await Appointment.findById(appointmentId);
    if (!appt)
      return res.status(404).json({ message: "Not found." });

    if (
      appt.doctor.toString() !== userId.toString() &&
      appt.patient.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Forbidden." });
    }

    appt.status = "cancelled";
    if (appt.paymentStatus !== "paid") appt.paymentStatus = "unpaid";
    await appt.save();

    emitAppointmentUpdate(appt._id);

    await sendNotification({
      userId: appt.doctor,
      type: "appointment_cancelled",
      message: `Appointment was cancelled by ${req.user.name}`,
      targetUrl: "/doctor-dashboard/appointments",
      meta: { appointmentId: appt._id },
    });

    await sendNotification({
      userId: appt.patient,
      type: "appointment_cancelled",
      message: "Your appointment was cancelled",
      targetUrl: "/patient-dashboard/appointments",
      meta: { appointmentId: appt._id },
    });

    res.json({ message: "Cancelled.", appointment: appt });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel appointment." });
  }
};
