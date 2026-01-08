const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    message: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

shareSchema.index({ user: 1, post: 1 });

module.exports = mongoose.model("Share", shareSchema);
