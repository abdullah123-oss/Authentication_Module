import API from "./axios";

export const getCartApi = async () => {
  const { data } = await API.get("/cart");
  return data;
};
export const addToCartApi = async (medicineId, quantity=1) => {
  const { data } = await API.post("/cart/add", { medicineId, quantity });
  return data;
};
export const updateCartApi = async (medicineId, quantity) => {
  const { data } = await API.put("/cart/update", { medicineId, quantity });
  return data;
};
export const removeFromCartApi = async (medicineId) => {
  const { data } = await API.delete(`/cart/remove/${medicineId}`);
  return data;
};
export const clearCartApi = async () => {
  const { data } = await API.delete("/cart/clear");
  return data;
};
