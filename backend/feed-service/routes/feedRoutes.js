const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  getMyPosts,
  deleteUserPosts,
} = require("../controllers/feedController");
const { protect } = require("../middleware/auth");

// Root route - alias for getting all posts
router.get("/", getAllPosts);

router.post("/posts", protect, createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.get("/posts/user/:userId", getPostsByUser);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.get("/my-posts", protect, getMyPosts);
router.delete("/user/:userId", protect, deleteUserPosts);

module.exports = router;
