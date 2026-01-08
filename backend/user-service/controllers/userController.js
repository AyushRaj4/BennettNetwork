const UserProfile = require("../models/UserProfile");

// @desc    Create user profile
// @route   POST /api/users/profile
// @access  Private
exports.createProfile = async (req, res, next) => {
  try {
    const profileExists = await UserProfile.findOne({ userId: req.user.id });

    if (profileExists) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists for this user",
      });
    }

    const profile = await UserProfile.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Public
exports.getProfileById = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOneAndDelete({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const { q, role, department } = req.query;

    let query = {};

    if (q && q.trim().length > 0) {
      // Use regex for flexible partial matching (case-insensitive)
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { title: searchRegex },
        { bio: searchRegex },
        { "studentInfo.enrollment": searchRegex },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (department) {
      const deptCondition = {
        $or: [
          { "studentInfo.department": department },
          { "professorInfo.department": department },
          { "alumniInfo.department": department },
        ],
      };

      // Combine with existing query
      if (query.$or) {
        query = { $and: [{ $or: query.$or }, deptCondition] };
      } else {
        query = deptCondition;
      }
    }

    const users = await UserProfile.find(query)
      .select("-__v")
      .limit(20)
      .sort({ firstName: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Search error:", error);
    next(error);
  }
};

// @desc    Get all users (with pagination)
// @route   GET /api/users?page=1&limit=10
// @access  Public
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await UserProfile.countDocuments();
    const users = await UserProfile.find()
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
