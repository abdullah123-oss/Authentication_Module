import API from "./axios";

// Get all notifications (latest first)
export const getNotificationsApi = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

// Get unread count
export const getUnreadCountApi = async () => {
  const res = await API.get("/notifications/unread-count");
  return res.data;
};

// Mark one as read
export const markNotificationReadApi = async (id) => {
  const res = await API.put(`/notifications/${id}/read`);
  return res.data;
};

// Mark all as read
export const markAllNotificationsReadApi = async () => {
  const res = await API.put("/notifications/read-all");
  return res.data;
};

// Delete notification
export const deleteNotificationApi = async (id) => {
  const res = await API.delete(`/notifications/${id}`);
  return res.data;
};
