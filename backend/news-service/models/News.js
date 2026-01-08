const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: [
        "news",
        "events",
        "academics",
        "placements",
        "achievements",
        "general",
      ],
      default: "general",
    },
    source: {
      type: String,
      default: "Bennett University",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
newsSchema.index({ publishedDate: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ isActive: 1 });

// Prevent duplicate news based on sourceUrl
newsSchema.index({ sourceUrl: 1 }, { unique: true });

module.exports = mongoose.model("News", newsSchema);
