// controllers/admin/medicineController.js
import Medicine from "../../models/Medicine.js";

// --------------------------- CREATE MEDICINE ---------------------------
export const createMedicine = async (req, res) => {
  try {
    console.log("📥 Incoming Body:", req.body);
    console.log("📸 Incoming File:", req.file);

    const {
      name,
      category,
      type,
      price,
      stock, // coming from form
      description,
      dosage,
      benefits,
      expiryDate,
    } = req.body;

    // Validate required fields
    if (!name || !category || !type || !price || !stock) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Map frontend -> backend model field
    const stockQuantity = Number(stock);

    const image = req.file
      ? `/uploads/medicines/${req.file.filename}`
      : "";

    const medicine = await Medicine.create({
      name,
      category,
      type,
      image,
      price,
      stockQuantity, // ⬅ FIXED FIELD NAME
      description,
      dosage,
      benefits,
      expiryDate,
    });

    return res.status(201).json({
      message: "Medicine created successfully",
      medicine,
    });

  } catch (err) {
    console.error("❌ Create Medicine Error:", err);
    return res.status(500).json({ message: err.message || "Server error creating medicine" });
  }
};

// --------------------------- UPDATE MEDICINE ---------------------------
export const updateMedicine = async (req, res) => {
  try {
    console.log("📥 Update Body:", req.body);
    console.log("📸 Update File:", req.file);

    const updates = { ...req.body };

    // Fix field name for model
    if (updates.stock) {
      updates.stockQuantity = updates.stock;
      delete updates.stock;
    }

    if (req.file) {
      updates.image = `/uploads/medicines/${req.file.filename}`;
    }

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json({
      message: "Medicine updated successfully",
      medicine: updated,
    });

  } catch (err) {
    console.error("❌ Update Medicine Error:", err);
    return res.status(500).json({ message: err.message || "Server error updating medicine" });
  }
};

// --------------------------- GET ALL MEDICINES ---------------------------
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    return res.json({ medicines });
  } catch (err) {
    console.error("❌ Get Medicines Error:", err);
    return res.status(500).json({ message: "Failed to fetch medicines" });
  }
};

// --------------------------- GET ONE MEDICINE ---------------------------
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json({ medicine });
  } catch (err) {
    console.error("❌ Get Medicine Error:", err);
    return res.status(500).json({ message: "Failed to fetch medicine" });
  }
};

// --------------------------- DELETE MEDICINE ---------------------------
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.json({ message: "Medicine deleted successfully" });

  } catch (err) {
    console.error("❌ Delete Medicine Error:", err);
    return res.status(500).json({ message: "Failed to delete medicine" });
  }
};
