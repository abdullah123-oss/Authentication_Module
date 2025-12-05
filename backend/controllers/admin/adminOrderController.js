// backend/controllers/adminOrderController.js:
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import Medicine from "../../models/Medicine.js";


/* ----------------------------------------------------------
   GET ALL ORDERS  (Admin)
---------------------------------------------------------- */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, payment, sort } = req.query;

    let filter = {};

    if (status) filter.orderStatus = status;
    if (payment) filter.paymentStatus = payment;

    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 }; // default → newest first

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort(sortOption);

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Admin getAllOrders error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

/* ----------------------------------------------------------
   GET SINGLE ORDER (Admin)
---------------------------------------------------------- */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.medicineId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Admin getOrderById error:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
};

/* ----------------------------------------------------------
   UPDATE ORDER STATUS (Admin)
---------------------------------------------------------- */
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("Admin updateOrderStatus error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ----------------------------------------------------------
   DELETE ORDER (Admin)
---------------------------------------------------------- */
export const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Admin deleteOrder error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
