const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  deleteConversation,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.post("/send", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/conversation/:userId", protect, getConversation);
router.put("/conversation/:userId/read", protect, markAsRead);
router.delete("/:messageId", protect, deleteMessage);
router.delete("/conversation/:userId", protect, deleteConversation);

module.exports = router;
