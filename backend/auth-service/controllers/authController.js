const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const sendEmail = require("../utils/sendEmail");
const {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getLoginNotificationTemplate,
} = require("../utils/emailTemplates");
const {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
} = require("../config/redis");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3002";
const NETWORK_SERVICE_URL =
  process.env.NETWORK_SERVICE_URL || "http://localhost:3004";
const ENGAGEMENT_SERVICE_URL =
  process.env.ENGAGEMENT_SERVICE_URL || "http://localhost:3005";
const FEED_SERVICE_URL =
  process.env.FEED_SERVICE_URL || "http://localhost:3006";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3010";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    // Validate required fields
    if (!fullName || !username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide full name, username, email, password, and role",
      });
    }

    // Validate role
    if (!["student", "professor", "alumni"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student, professor, or alumni",
      });
    }

    // Check if user exists with email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({
      username: username.toLowerCase(),
    });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
      role,
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email/${verificationToken}`;

    // Get email template
    const html = getVerificationEmailTemplate(fullName, verificationUrl);

    try {
      // Send verification email
      console.log("Attempting to send email to:", user.email);
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Bennett University Network",
        html,
      });
      console.log("Email sent successfully to:", user.email);

      const token = generateToken(user._id);

      // Cache user data in Redis (1 hour TTL)
      const userData = {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      };
      await setCache(`user:${user._id}`, userData, 3600);
      await setCache(`user:email:${user.email}`, userData, 3600);

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        data: {
          ...userData,
          token,
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      console.error("Error details:", emailError.message);
      console.error("Email was supposed to be sent to:", user.email);

      // If email fails, still return success but notify user
      const token = generateToken(user._id);

      // Cache user data even if email fails
      const userData = {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      };
      await setCache(`user:${user._id}`, userData, 3600);
      await setCache(`user:email:${user.email}`, userData, 3600);

      res.status(201).json({
        success: true,
        message:
          "User registered successfully, but verification email could not be sent. You can request a new verification email.",
        data: {
          ...userData,
          token,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
        errorType: "MISSING_CREDENTIALS",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
        errorType: "INVALID_EMAIL",
      });
    }

    // Try to get user from cache first
    let user = null;
    const cachedUser = await getCache(`user:email:${email}`);

    if (cachedUser) {
      console.log("✅ User found in Redis cache");
      // Get full user from DB for password comparison
      user = await User.findById(cachedUser.id).select("+password");
    } else {
      console.log("⚠️  Cache miss - fetching from MongoDB");
      // Check for user in database
      user = await User.findOne({ email }).select("+password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please register first.",
        errorType: "ACCOUNT_NOT_FOUND",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Incorrect password. Please try again or use 'Forgot Password'.",
        errorType: "INCORRECT_PASSWORD",
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Cache user data in Redis (1 hour TTL)
    const userData = {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
    };
    await setCache(`user:${user._id}`, userData, 3600);
    await setCache(`user:email:${user.email}`, userData, 3600);

    // Cache active session (24 hour TTL)
    await setCache(
      `session:${user._id}`,
      {
        userId: user._id.toString(),
        email: user.email,
        loginTime: user.lastLogin,
      },
      86400
    );

    // Get login details for email
    const loginTime = new Date(user.lastLogin).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const userAgent = req.headers["user-agent"] || "";

    // Send login notification email (asynchronously, don't wait)
    const html = getLoginNotificationTemplate(
      user.fullName,
      loginTime,
      ipAddress,
      userAgent
    );

    sendEmail({
      email: user.email,
      subject: "🔐 New Login Detected - Bennett University Network",
      html,
    }).catch((err) => {
      console.error("Login notification email failed:", err);
    });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        ...userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific errors
    if (
      error.name === "MongoNetworkError" ||
      error.message.includes("ECONNREFUSED")
    ) {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later.",
        errorType: "NETWORK_ERROR",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
      errorType: "SERVER_ERROR",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Try to get from cache first
    let userData = await getCache(`user:${req.user.id || req.user._id}`);

    if (!userData) {
      console.log("⚠️  Cache miss - fetching user from MongoDB");
      const user = await User.findById(req.user.id || req.user._id);

      userData = {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      };

      // Cache for future requests
      await setCache(`user:${user._id}`, userData, 3600);
    } else {
      console.log("✅ User data retrieved from Redis cache");
    }

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Clear user cache on logout
    const userId = req.user.id || req.user._id;
    await deleteCache(`session:${userId}`);
    console.log("✅ User session cleared from Redis cache");

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Hash the token from URL
    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with this token and token not expired
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Send welcome email
    const html = getWelcomeEmailTemplate(user.fullName, user.role);

    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to Bennett University Network! 🎉",
        html,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Bennett Network!",
      data: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "+verificationToken +verificationTokenExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email/${verificationToken}`;

    // Get email template
    const html = getVerificationEmailTemplate(user.fullName, verificationUrl);

    try {
      // Send verification email
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Bennett University Network",
        html,
      });

      res.status(200).json({
        success: true,
        message:
          "Verification email sent successfully. Please check your email.",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(" ")[1];

    // Delete from all microservices
    const deletePromises = [];

    // 1. Delete user profile from user-service
    deletePromises.push(
      axios
        .delete(`${USER_SERVICE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => console.error("Error deleting profile:", err.message))
    );

    // 2. Delete all connections from network-service
    deletePromises.push(
      axios
        .delete(`${NETWORK_SERVICE_URL}/api/network/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) =>
          console.error("Error deleting connections:", err.message)
        )
    );

    // 3. Delete all engagement data (likes, comments) from engagement-service
    deletePromises.push(
      axios
        .delete(`${ENGAGEMENT_SERVICE_URL}/api/engagement/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) =>
          console.error("Error deleting engagement data:", err.message)
        )
    );

    // 4. Delete all posts from feed-service
    deletePromises.push(
      axios
        .delete(`${FEED_SERVICE_URL}/api/feed/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => console.error("Error deleting posts:", err.message))
    );

    // 5. Delete all AI chat history from ai-service
    deletePromises.push(
      axios
        .delete(`${AI_SERVICE_URL}/api/ai/user/${userId}`, {
          headers: {
            "X-API-Key":
              process.env.INTERNAL_API_KEY ||
              "internal-service-api-key-change-this",
          },
        })
        .catch((err) => console.error("Error deleting AI chats:", err.message))
    );

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    // 6. Finally, delete the user account from auth-service
    await User.findByIdAndDelete(userId);

    // 7. Clear all cached data for this user from Redis
    await deleteCache(`user:${userId}`);
    await deleteCache(`session:${userId}`);
    // Also try to delete by email (need to get email first)
    const user = req.user;
    if (user && user.email) {
      await deleteCache(`user:email:${user.email}`);
    }
    console.log("✅ User cache cleared from Redis");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully. All your data has been removed.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    next(error);
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Find user by email and select OTP fields to clear previous OTP
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Clear any existing OTP (invalidate previous OTP)
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    // Generate new OTP
    const otp = user.generatePasswordResetOTP();
    await user.save();

    // Send OTP via email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.fullName}</strong>,</p>
            <p>We received a request to reset your password for your Bennett Network account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div class="otp-box">${otp}</div>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This OTP is valid for <strong>10 minutes only</strong></li>
                <li>Do not share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            <p>Enter this OTP in the password reset form to continue.</p>
            <p>Best regards,<br><strong>Bennett Network Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2025 Bennett University Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "🔐 Password Reset OTP - Bennett Network",
        html,
      });

      res.status(200).json({
        success: true,
        message: "Password reset OTP sent to your email. Valid for 10 minutes.",
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);

      // Clear OTP if email fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    next(error);
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    // Trim and validate OTP format
    const otpString = otp.toString().trim();

    if (!/^\d{6}$/.test(otpString)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // Find user by email and select OTP fields
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if OTP exists
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new OTP.",
      });
    }

    // Check if OTP has expired
    if (Date.now() > user.resetPasswordOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash the OTP to compare with stored hash
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otpString)
      .digest("hex");

    // Compare hashed OTP
    if (user.resetPasswordOTP !== hashedOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    next(error);
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Trim and validate OTP format
    const otpString = otp.toString().trim();

    if (!/^\d{6}$/.test(otpString)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // Find user by email and select OTP fields
    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire +password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if OTP exists
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "No password reset request found. Please request a new OTP.",
      });
    }

    // Check if OTP has expired
    if (Date.now() > user.resetPasswordOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash the OTP to compare with stored hash
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otpString)
      .digest("hex");

    // Compare hashed OTP
    if (user.resetPasswordOTP !== hashedOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    // Clear cache for this user
    await deleteCache(`user:${user._id}`);
    await deleteCache(`user:email:${user.email}`);
    await deleteCache(`session:${user._id}`);

    // Send confirmation email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; color: #155724; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.fullName}</strong>,</p>
            <div class="success-box">
              <h2 style="margin: 0;">Your password has been successfully reset!</h2>
            </div>
            <p>You can now log in to your Bennett Network account with your new password.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
            <p>Best regards,<br><strong>Bennett Network Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; 2025 Bennett University Network. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    sendEmail({
      email: user.email,
      subject: "✅ Password Reset Successful - Bennett Network",
      html,
    }).catch((err) => console.error("Failed to send confirmation email:", err));

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    next(error);
  }
};
