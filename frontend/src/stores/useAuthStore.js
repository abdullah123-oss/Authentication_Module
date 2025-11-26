import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocketStore } from "./socketStore";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // -------------------------
      // SET AUTH ON LOGIN
      // -------------------------
      setAuth: (data) => {
        set({
          user: data.user,
          token: data.token,
        });

        // Connect socket after login
        useSocketStore.getState().connectSocket();
      },

      // -------------------------
      // UPDATE USER (Profile update)
      // -------------------------
      setUser: (updatedUser) =>
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        })),

      // -------------------------
      // LOGOUT
      // -------------------------
      logout: () => {
        set({
          user: null,
          token: null,
        });

        // Disconnect socket on logout
        useSocketStore.getState().disconnectSocket();
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);
