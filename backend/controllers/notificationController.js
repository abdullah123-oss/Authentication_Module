import Notification from "../models/Notification.js";
import { io } from "../server.js";

/* ----------------------------------------------------------
   GET all notifications of logged-in user
---------------------------------------------------------- */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/* ----------------------------------------------------------
   GET unread count
---------------------------------------------------------- */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

/* ----------------------------------------------------------
   MARK one as read
---------------------------------------------------------- */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    // real-time sync: update notification badge
    io.to(`user_${userId}`).emit("notification:read", { id });

    res.json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/* ----------------------------------------------------------
   MARK all as read
---------------------------------------------------------- */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    // real-time sync
    io.to(`user_${userId}`).emit("notification:read_all");

    res.json({ message: "All notifications marked read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

/* ----------------------------------------------------------
   DELETE a notification
---------------------------------------------------------- */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await Notification.deleteOne({ _id: id, user: userId });

    // real-time sync
    io.to(`user_${userId}`).emit("notification:deleted", { id });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
