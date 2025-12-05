// backend/controllers/orderController.js
import Order from "../models/Order.js";

// 🧑‍💻 Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Get My Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

// 👨‍✈️ Admin: get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// 👨‍✈️ Admin: update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
