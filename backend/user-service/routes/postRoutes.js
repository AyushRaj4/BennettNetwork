const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Create a post
router.post("/", postController.createPost);

// Get feed (all posts)
router.get("/feed", postController.getFeed);

// Get a single post
router.get("/:id", postController.getPost);

// Like/unlike a post
router.post("/:id/like", postController.likePost);

// Comment on a post
router.post("/:id/comment", postController.commentPost);

// Share/unshare a post
router.post("/:id/share", postController.sharePost);

// Update a post
router.put("/:id", postController.updatePost);

// Delete a post
router.delete("/:id", postController.deletePost);

// Get user's posts
router.get("/user/:userId", postController.getUserPosts);

module.exports = router;
