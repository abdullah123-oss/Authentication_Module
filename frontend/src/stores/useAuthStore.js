import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSocketStore } from "./socketStore";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // NEW → Tracks if Zustand finished loading data from storage
      hydrated: false,

      // Called by persist middleware when store is ready
      setHydrated: () => set({ hydrated: true }),

      // -------------------------
      // LOGIN + SET AUTH
      // -------------------------
      setAuth: (data) => {
        set({
          user: data.user,
          token: data.token,
        });

        // Connect socket
        useSocketStore.getState().connectSocket();
      },

      // -------------------------
      // UPDATE USER
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

        useSocketStore.getState().disconnectSocket();
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,

      // 🔥 Called when rehydration happens
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
