const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "LIKE",
        "COMMENT",
        "SHARE",
        "CONNECTION_REQUEST",
        "CONNECTION_ACCEPTED",
        "MESSAGE",
        "MENTION",
      ],
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedUserId: {
      type: String,
    },
    relatedUserName: {
      type: String,
    },
    relatedUserAvatar: {
      type: String,
    },
    relatedId: {
      type: String,
    },
    relatedData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
