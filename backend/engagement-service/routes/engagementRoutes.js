const express = require("express");
const router = express.Router();
const {
  likePost,
  unlikePost,
  getPostLikes,
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentReplies,
  likeComment,
  unlikeComment,
  sharePost,
  getPostShares,
  deleteUserEngagement,
} = require("../controllers/engagementController");
const { protect } = require("../middleware/auth");

// Like routes
router.post("/like/:postId", protect, likePost);
router.delete("/unlike/:postId", protect, unlikePost);
router.get("/likes/:postId", getPostLikes);

// Comment routes
router.post("/comment/:postId", protect, createComment);
router.put("/comment/:commentId", protect, updateComment);
router.delete("/comment/:commentId", protect, deleteComment);
router.get("/comments/:postId", getPostComments);
router.get("/replies/:commentId", getCommentReplies);

// Comment like routes
router.post("/comment/:commentId/like", protect, likeComment);
router.delete("/comment/:commentId/unlike", protect, unlikeComment);

// Share routes
router.post("/share/:postId", protect, sharePost);
router.get("/shares/:postId", getPostShares);

// Delete all user engagement data
router.delete("/user/:userId", protect, deleteUserEngagement);

module.exports = router;
