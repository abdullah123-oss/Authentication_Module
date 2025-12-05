import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [OrderItemSchema],
  totalAmount: Number,
  paymentStatus: { type: String, default: "unpaid" }, // paid/unpaid
  paymentInfo: Object,
  orderStatus: { type: String, default: "pending" }, // pending/processing/shipped/delivered

  //Finance Info
  invoiceNumber: { type: String },
  transactionId: { type: String },
  paidAt: { type: Date },

}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);
