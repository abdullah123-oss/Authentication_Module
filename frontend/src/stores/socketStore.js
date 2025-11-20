// frontend/src/stores/socketStore.js
import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

export const useSocketStore = create((set, get) => ({
  socket: null,

  connectSocket: () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user) return;

    // prevent multiple connections
    if (get().socket) return;

    const socket = io("http://localhost:5000", {
      auth: { token },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);

      // ✅ register this user in their personal room
      socket.emit("register", {
        userId: user._id || user.id,
        role: user.role,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
