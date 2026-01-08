const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  context: {
    type: String,
    enum: ["general", "profile", "content", "career"],
    default: "general",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [chatMessageSchema],
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours (1 day in seconds)
  },
});

// Index for automatic cleanup
chatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
chatSessionSchema.index({ userId: 1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
