const express = require("express");
const router = express.Router();
const {
  createProfile,
  getMyProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
  searchUsers,
  getAllUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.post("/profile", protect, createProfile);
router.get("/profile/me", protect, getMyProfile);
router.get("/profile/:id", getProfileById);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);
router.get("/search", searchUsers);
router.get("/all", getAllUsers); // For network service to fetch all users
router.get("/", getAllUsers);

module.exports = router;
