import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  image: String,
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  items: [ItemSchema],
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Cart", CartSchema);
