const Notification = require("../models/Notification");

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      notifications,
      total,
      hasMore: total > parseInt(skip) + notifications.length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    // Emit socket event to update header count
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("notification_read");
      io.to(userId).emit("notifications_updated");
      console.log(`Notification marked as read, emitted to user ${userId}`);
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    // Emit socket event to update header count
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("notification_read");
      io.to(userId).emit("notifications_updated");
      console.log(
        `All notifications marked as read, emitted to user ${userId}`
      );
    }

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();

    // Emit socket event to update header count
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("notifications_updated");
      console.log(`Notification deleted, emitted to user ${userId}`);
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create notification (used by other services)
// @route   POST /api/notifications
// @access  Public (but should be internal only)
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      content,
      relatedUserId,
      relatedUserName,
      relatedUserAvatar,
      relatedId,
      relatedData,
    } = req.body;

    if (!userId || !type || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = await Notification.create({
      userId,
      type,
      content,
      relatedUserId,
      relatedUserName,
      relatedUserAvatar,
      relatedId,
      relatedData,
    });

    // Emit socket event to the user
    const io = req.app.get("io");
    if (io) {
      io.to(userId).emit("new_notification", notification);
      io.to(userId).emit("notifications_updated");
      console.log(`Notification emitted to user ${userId}: ${type}`);
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete all notifications for a user (for account deletion)
// @route   DELETE /api/notifications/user/:userId
// @access  Public (internal service call)
const deleteUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete all notifications for the user
    await Notification.deleteMany({ userId });

    // Also delete notifications where this user is the relatedUserId
    await Notification.deleteMany({ relatedUserId: userId });

    res
      .status(200)
      .json({ message: "User notifications deleted successfully" });
  } catch (error) {
    console.error("Delete user notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  deleteUserNotifications,
};
