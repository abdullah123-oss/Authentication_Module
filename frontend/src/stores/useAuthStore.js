import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocketStore } from "./socketStore"; // ⬅️ NEW

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // LOGIN / SET AUTH
      setAuth: (data) => {
        set({
          user: data.user,
          token: data.token,
        });

        // ⬅️ CONNECT SOCKET AFTER LOGIN
        useSocketStore.getState().connectSocket();
      },

      // LOGOUT
      logout: () => {
        set({
          user: null,
          token: null,
        });

        // ⬅️ DISCONNECT SOCKET ON LOGOUT
        useSocketStore.getState().disconnectSocket();
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);
