const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyToken,
  verifyEmail,
  resendVerification,
  deleteAccount,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.get("/verify", protect, verifyToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);
router.delete("/delete-account", protect, deleteAccount);

// Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
