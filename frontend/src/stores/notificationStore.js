// src/stores/notificationStore.js
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./socketStore";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from "../api/notificationApi";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socketListenersAttached: false,

  /* --------------------------------------------------
     INITIAL LOAD (list + count)
  -------------------------------------------------- */
  loadNotifications: async () => {
    try {
      set({ loading: true });

      const [listRes, countRes] = await Promise.all([
        getNotificationsApi(),
        getUnreadCountApi(),
      ]);

      set({
        notifications: listRes.notifications || [],
        unreadCount: countRes.count || 0,
      });
    } catch (err) {
      console.error("Failed to init notifications", err);
    } finally {
      set({ loading: false });
    }
  },

  /* --------------------------------------------------
     FETCH ALL NOTIFICATIONS
  -------------------------------------------------- */
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const data = await getNotificationsApi();
      set({
        notifications: data.notifications || [],
      });
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      set({ loading: false });
    }
  },

  /* --------------------------------------------------
     FETCH UNREAD COUNT
  -------------------------------------------------- */
  fetchUnreadCount: async () => {
    try {
      const data = await getUnreadCountApi();
      set({ unreadCount: data.count || 0 });
    } catch (err) {
      console.error("Failed to load unread count");
    }
  },

  /* --------------------------------------------------
     MARK ONE AS READ
  -------------------------------------------------- */
  markAsRead: async (id) => {
    try {
      await markNotificationReadApi(id);

      // Update store
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(state.unreadCount - 1, 0),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  /* --------------------------------------------------
     MARK ALL AS READ
  -------------------------------------------------- */
  markAllAsRead: async () => {
    try {
      await markAllNotificationsReadApi();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  /* --------------------------------------------------
     DELETE
  -------------------------------------------------- */
  deleteNotification: async (id) => {
    try {
      await deleteNotificationApi(id);

      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            (state.notifications.find((n) => n._id === id)?.read ? 0 : 1)
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  },

  /* --------------------------------------------------
     SOCKET BINDINGS — AUTOMATIC REAL-TIME UPDATES
  -------------------------------------------------- */
  initSocketListeners: () => {
    const socket = useSocketStore.getState().socket;
    if (!socket || get().socketListenersAttached) return;

    console.log("🔔 Notifications: socket listeners attached");

    const handleNew = (notif) => {
      set((state) => ({
        notifications: [notif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    };

    const handleRead = ({ id }) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(state.unreadCount - 1, 0),
      }));
    };

    const handleReadAll = () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read: true,
        })),
        unreadCount: 0,
      }));
    };

    const handleDeleted = ({ id }) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    };

    const cleanup = () => {
      socket.off("notification:new", handleNew);
      socket.off("notification:read", handleRead);
      socket.off("notification:read_all", handleReadAll);
      socket.off("notification:deleted", handleDeleted);
      socket.off("disconnect", cleanup);
      set({ socketListenersAttached: false });
    };

    socket.on("notification:new", handleNew);
    socket.on("notification:read", handleRead);
    socket.on("notification:read_all", handleReadAll);
    socket.on("notification:deleted", handleDeleted);
    socket.on("disconnect", cleanup);

    set({ socketListenersAttached: true });
  },
}));
