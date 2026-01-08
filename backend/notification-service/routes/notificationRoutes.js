const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  deleteUserNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

// Protected routes
router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

// Public routes (for internal service calls)
router.post("/", createNotification);
router.delete("/user/:userId", deleteUserNotifications);

module.exports = router;
