const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'UserProfile',
    },
    author: {
      name: String,
      title: String,
      avatar: String,
    },
    content: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video', 'document'],
      default: 'none',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserProfile',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserProfile',
        },
        author: {
          name: String,
          avatar: String,
        },
        text: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserProfile',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
