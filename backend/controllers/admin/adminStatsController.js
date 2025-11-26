import User from "../../models/User.js";
import Appointment from "../../models/Appointment.js";

export const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAppointments = await Appointment.countDocuments();

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats" });
  }
};
