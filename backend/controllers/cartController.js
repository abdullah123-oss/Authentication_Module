// controllers/cartController.js
import Cart from "../models/Cart.js";
import Medicine from "../models/Medicine.js";

// Helper — recalc total
const calculateTotal = (items) => {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

// ----------------------------- GET CART -----------------------------
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.json({
        items: [],
        totalAmount: 0,
      });
    }

    return res.json(cart);
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// ----------------------------- ADD TO CART -----------------------------
export const addToCart = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    // Create new cart if none
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (i) => i.medicineId.toString() === medicineId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        medicineId,
        name: medicine.name,
        price: medicine.price,
        quantity,
        image: medicine.image,
      });
    }

    cart.totalAmount = calculateTotal(cart.items);
    await cart.save();

    return res.json({ message: "Added to cart", cart });
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// ----------------------------- UPDATE QUANTITY -----------------------------
export const updateCart = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.medicineId.toString() === medicineId
    );

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;

    cart.totalAmount = calculateTotal(cart.items);
    await cart.save();

    res.json({ message: "Cart updated", cart });
  } catch (err) {
    console.error("Update Cart Error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// ----------------------------- REMOVE ITEM -----------------------------
export const removeFromCart = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.medicineId.toString() !== medicineId
    );

    cart.totalAmount = calculateTotal(cart.items);
    await cart.save();

    res.json({ message: "Item removed", cart });
  } catch (err) {
    console.error("Remove Cart Item Error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// ----------------------------- CLEAR CART -----------------------------
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], totalAmount: 0 }
    );

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear Cart Error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
