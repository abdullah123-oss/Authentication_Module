// backend/models/Medicine.js
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true, // Tablet, Syrup, Injection etc.
      trim: true,
    },
    type: {
      type: String,
      enum: ["OTC", "Prescription"],
      default: "OTC",
    },
    image: { type: String, default: "" }, // store path or URL
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    dosage: { type: String, default: "" },
    benefits: { type: String, default: "" }, // one-liner
    expiryDate: { type: Date },
    isDeleted: { type: Boolean, default: false }, // soft delete
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
