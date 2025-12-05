import API from "./axios";

// ------------------------- GET CART -------------------------
export const getCartApi = async () => {
  try {
    const { data } = await API.get("/cart");
    return data;
  } catch (err) {
    console.error("Get Cart Error:", err);
    throw err;
  }
};

// ------------------------- ADD TO CART -------------------------
export const addToCartApi = async (medicineId, quantity = 1) => {
  try {
    const { data } = await API.post("/cart/add", { medicineId, quantity });
    return data;
  } catch (err) {
    console.error("Add to Cart Error:", err);
    throw err;
  }
};

// ------------------------- UPDATE CART ITEM -------------------------
export const updateCartApi = async (medicineId, quantity) => {
  try {
    const { data } = await API.put("/cart/update", { medicineId, quantity });
    return data;
  } catch (err) {
    console.error("Update Cart Error:", err);
    throw err;
  }
};

// ------------------------- REMOVE CART ITEM -------------------------
export const removeFromCartApi = async (medicineId) => {
  try {
    const { data } = await API.delete(`/cart/remove/${medicineId}`);
    return data;
  } catch (err) {
    console.error("Remove Cart Item Error:", err);
    throw err;
  }
};

// ------------------------- CLEAR CART -------------------------
export const clearCartApi = async () => {
  try {
    const { data } = await API.delete("/cart/clear");
    return data;
  } catch (err) {
    console.error("Clear Cart Error:", err);
    throw err;
  }
};
