import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // ✅ Save user + token after login
      setAuth: (data) => {
        set({
          user: data.user,
          token: data.token,
        });
      },

      // ✅ Logout — remove user + token
      logout: () => {
        set({
          user: null,
          token: null,
        });
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);
