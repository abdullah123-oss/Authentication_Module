// backend/models/Medicine.js
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Drops",
        "Ointment",
        "Inhaler",
        "Powder / Sachet",
        "Supplement / Vitamin",
      ],
    },

    type: {
      type: String,
      enum: ["OTC", "Prescription"],
      default: "OTC",
    },

    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },

    description: { type: String, default: "" },
    dosage: { type: String, default: "" },
    benefits: { type: String, default: "" },
    expiryDate: { type: Date },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
