import DoctorAvailability from "../models/DoctorAvailability.js";

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ✅ GET doctor's availability
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.user._id;

    let availability = await DoctorAvailability.findOne({ doctor: doctorId });

    // If doctor has no record, return empty days
    if (!availability) {
      const emptySlots = allDays.map((day) => ({ day, times: [] }));
      return res.json({ availability: { doctor: doctorId, slots: emptySlots } });
    }

    // Ensure all days exist in response
    const existingDays = availability.slots.map((d) => d.day);
    allDays.forEach((day) => {
      if (!existingDays.includes(day)) {
        availability.slots.push({ day, times: [] });
      }
    });

    res.json({ availability });
  } catch (err) {
    console.error("❌ Get availability error:", err);
    res.status(500).json({ message: "Server error while fetching availability" });
  }
};

// ✅ POST (Create or Update) doctor's availability
export const setDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: "Slots must be a valid array" });
    }

    let availability = await DoctorAvailability.findOne({ doctor: doctorId });

    if (availability) {
      availability.slots = slots;
      await availability.save();
    } else {
      availability = await DoctorAvailability.create({ doctor: doctorId, slots });
    }

    res.json({ message: "✅ Availability saved successfully", availability });
  } catch (err) {
    console.error("❌ Set availability error:", err);
    res.status(500).json({ message: "Server error while saving availability" });
  }
};
