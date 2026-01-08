const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getCache, setCache } = require("../config/redis");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to get user from Redis cache first
    let user = await getCache(`user:${decoded.id}`);

    if (user) {
      console.log("✅ User auth verified from Redis cache");
      req.user = user;
    } else {
      console.log("⚠️  Cache miss - fetching user from MongoDB");
      user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Cache user data for future requests (1 hour TTL)
      const userData = {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      };
      await setCache(`user:${user._id}`, userData, 3600);
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
