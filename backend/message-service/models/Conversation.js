const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    lastMessage: {
      text: String,
      sender: String,
      timestamp: Date,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants are unique and sorted for easier lookup
conversationSchema.pre("save", function (next) {
  this.participants = [...new Set(this.participants)].sort();
  next();
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Static method to find conversation between two users
conversationSchema.statics.findByParticipants = function (userId1, userId2) {
  const participants = [userId1, userId2].sort();
  return this.findOne({
    participants: { $all: participants, $size: 2 },
  });
};

module.exports = mongoose.model("Conversation", conversationSchema);
