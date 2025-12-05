import { create } from "zustand";
import { getCartApi } from "../api/cartApi";

export const useCartStore = create((set) => ({
  count: 0,

  loadCartCount: async () => {
    try {
      const cart = await getCartApi();
      const totalItems = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
      set({ count: totalItems });
    } catch (err) {
      console.error("Cart count load error", err);
    }
  },

  clearCount: () => set({ count: 0 })
}));
