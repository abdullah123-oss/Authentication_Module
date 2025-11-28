// controllers/public/publicMedicineController.js
import Medicine from "../models/Medicine.js";

// GET All Medicines (public)
export const getPublicMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ message: "Failed to load medicines" });
  }
};

// GET Single Medicine (public)
export const getPublicMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine || medicine.isDeleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ message: "Failed to load medicine" });
  }
};
