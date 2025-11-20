// backend/utils/sendNotification.js
import Notification from "../models/Notification.js";
import { io } from "../server.js";

/**
 * Send a notification to a specific user.
 *
 * @param {Object} params
 * @param {String} params.userId - User receiving the notification
 * @param {String} params.type - e.g. "appointment_approved"
 * @param {String} params.message - Text shown to the user
 * @param {String} [params.targetUrl] - Where to navigate when clicked
 * @param {Object} [params.meta] - Extra info (appointmentId, etc.)
 */
export const sendNotification = async ({
  userId,
  type,
  message,
  targetUrl = "",
  meta = {},
}) => {
  if (!userId || !type || !message) return;

  // 1. Save notification in DB
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    targetUrl,
    meta,
  });

  // 2. Emit via Socket.IO to the user's personal room
  io.to(`user_${userId}`).emit("notification:new", notification);

  return notification;
};
