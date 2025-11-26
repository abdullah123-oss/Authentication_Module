// routes/publicDoctorRoutes.js
import express from "express";
import User from "../models/User.js";
import DoctorAvailability from "../models/DoctorAvailability.js";

const router = express.Router();

// PUBLIC: List all doctors + their availability
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");

    const withAvailability = await Promise.all(
      doctors.map(async (d) => {
        const availability = await DoctorAvailability.findOne({ doctor: d._id });
        return {
          ...d.toObject(),
          slots: availability ? availability.slots : [],
        };
      })
    );

    res.json({ doctors: withAvailability });
  } catch (err) {
    console.error("GET /api/doctors error:", err);
    res.status(500).json({ message: "Server error fetching doctors" });
  }
});

// GET SINGLE DOCTOR (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const availability = await DoctorAvailability.findOne({ doctor: doctor._id });

    res.json({
      ...doctor.toObject(),
      slots: availability ? availability.slots : []
    });

  } catch (err) {
    console.error("GET /api/doctors/:id error:", err);
    res.status(500).json({ message: "Server error fetching doctor details" });
  }
});


export default router;
