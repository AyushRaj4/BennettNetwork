const Connection = require("../models/Connection");
const axios = require("axios");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3002";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3008";

// Helper function to create notification
const createNotification = async (notificationData, token) => {
  try {
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      notificationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

// Helper function to get user profile
const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/api/users/profile/${userId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error.message);
    return null;
  }
};

// @desc    Send connection request
// @route   POST /api/network/connect/:userId
// @access  Private
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    // Check if trying to connect with self
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot send connection request to yourself",
      });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: "Connection request already exists",
      });
    }

    const connection = await Connection.create({
      requester: req.user.id,
      recipient: userId,
      message,
      status: "pending",
    });

    // Create notification for recipient
    const userProfile = await getUserProfile(req.user.id);
    const token = req.headers.authorization?.split(" ")[1];

    if (userProfile && token) {
      await createNotification(
        {
          userId: userId,
          type: "CONNECTION_REQUEST",
          content: `${userProfile.firstName} ${userProfile.lastName} sent you a connection request`,
          relatedUserId: req.user.id,
          relatedUserName: `${userProfile.firstName} ${userProfile.lastName}`,
          relatedUserAvatar: userProfile.avatar,
          relatedId: connection._id.toString(),
        },
        token
      );
    }

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept connection request
// @route   PUT /api/network/accept/:connectionId
// @access  Private
exports.acceptConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this request",
      });
    }

    connection.status = "accepted";
    await connection.save();

    // Create notification for requester
    const userProfile = await getUserProfile(req.user.id);
    const token = req.headers.authorization?.split(" ")[1];

    if (userProfile && token) {
      await createNotification(
        {
          userId: connection.requester.toString(),
          type: "CONNECTION_ACCEPTED",
          content: `${userProfile.firstName} ${userProfile.lastName} accepted your connection request`,
          relatedUserId: req.user.id,
          relatedUserName: `${userProfile.firstName} ${userProfile.lastName}`,
          relatedUserAvatar: userProfile.avatar,
          relatedId: connection._id.toString(),
        },
        token
      );
    }

    res.status(200).json({
      success: true,
      message: "Connection request accepted",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject connection request
// @route   PUT /api/network/reject/:connectionId
// @access  Private
exports.rejectConnectionRequest = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // Check if user is the recipient
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reject this request",
      });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection request rejected",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove connection
// @route   DELETE /api/network/remove/:connectionId
// @access  Private
exports.removeConnection = async (req, res, next) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }

    // Check if user is part of the connection
    if (
      connection.requester.toString() !== req.user.id &&
      connection.recipient.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this connection",
      });
    }

    await connection.deleteOne();

    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all connections for user
// @route   GET /api/network/connections
// @access  Private
exports.getMyConnections = async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { recipient: req.user.id, status: "accepted" },
      ],
    });

    // Fetch user profiles for each connection
    const connectionsWithProfiles = await Promise.all(
      connections.map(async (conn) => {
        // Get the other user's ID (not the current user)
        const otherUserId =
          conn.requester.toString() === req.user.id
            ? conn.recipient.toString()
            : conn.requester.toString();

        try {
          const profileResponse = await axios.get(
            `${USER_SERVICE_URL}/api/users/profile/${otherUserId}`
          );
          return {
            ...profileResponse.data.data,
            connectionId: conn._id.toString(), // Include connection ID for removal
          };
        } catch (error) {
          console.error(
            `Error fetching profile for user ${otherUserId}:`,
            error.message
          );
          return null;
        }
      })
    );

    // Filter out any null values (failed fetches)
    const validProfiles = connectionsWithProfiles.filter(
      (profile) => profile !== null
    );

    res.status(200).json({
      success: true,
      count: validProfiles.length,
      data: validProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending connection requests
// @route   GET /api/network/requests/pending
// @access  Private
exports.getPendingRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      recipient: req.user.id,
      status: "pending",
    });

    // Fetch user profiles for each pending request
    const requestsWithProfiles = await Promise.all(
      requests.map(async (conn) => {
        try {
          const profileResponse = await axios.get(
            `${USER_SERVICE_URL}/api/users/profile/${conn.requester.toString()}`
          );
          return {
            ...profileResponse.data.data,
            connectionId: conn._id, // Include connection ID for accept/reject
          };
        } catch (error) {
          console.error(
            `Error fetching profile for user ${conn.requester}:`,
            error.message
          );
          return null;
        }
      })
    );

    // Filter out any null values
    const validRequests = requestsWithProfiles.filter(
      (profile) => profile !== null
    );

    res.status(200).json({
      success: true,
      count: validRequests.length,
      data: validRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent connection requests
// @route   GET /api/network/requests/sent
// @access  Private
exports.getSentRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      requester: req.user.id,
      status: "pending",
    });

    // Fetch user profiles for each sent request
    const requestsWithProfiles = await Promise.all(
      requests.map(async (conn) => {
        try {
          const profileResponse = await axios.get(
            `${USER_SERVICE_URL}/api/users/profile/${conn.recipient.toString()}`
          );
          return {
            ...profileResponse.data.data,
            connectionId: conn._id, // Include connection ID for canceling
          };
        } catch (error) {
          console.error(
            `Error fetching profile for user ${conn.recipient}:`,
            error.message
          );
          return null;
        }
      })
    );

    // Filter out any null values
    const validRequests = requestsWithProfiles.filter(
      (profile) => profile !== null
    );

    res.status(200).json({
      success: true,
      count: validRequests.length,
      data: validRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get connection suggestions
// @route   GET /api/network/suggestions
// @access  Private
exports.getConnectionSuggestions = async (req, res, next) => {
  try {
    console.log("Getting suggestions for user:", req.user.id);

    // Get user's existing connections
    const existingConnections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    });
    console.log("Existing connections:", existingConnections.length);

    // Extract connected user IDs
    const connectedUserIds = existingConnections.map((conn) =>
      conn.requester.toString() === req.user.id
        ? conn.recipient.toString()
        : conn.requester.toString()
    );

    // Add current user to exclude list
    connectedUserIds.push(req.user.id);
    console.log("User IDs to exclude:", connectedUserIds);

    // Get current user's profile
    const userProfileResponse = await axios.get(
      `${USER_SERVICE_URL}/api/users/profile/${req.user.id}`
    );
    const currentUserProfile = userProfileResponse.data.data;
    console.log("Current user profile loaded:", currentUserProfile.firstName);

    // Get all users from user service
    const allUsersResponse = await axios.get(
      `${USER_SERVICE_URL}/api/users/all`
    );
    const allUsers = allUsersResponse.data.data || [];
    console.log("Total users from user service:", allUsers.length);

    // Filter out connected users and current user
    const availableUsers = allUsers.filter(
      (user) => !connectedUserIds.includes(user.userId.toString())
    );
    console.log("Available users after filtering:", availableUsers.length);

    // Calculate similarity scores
    const scoredUsers = availableUsers.map((user) => {
      let score = 0;

      // Match department (highest weight)
      if (
        user.studentInfo?.department &&
        currentUserProfile.studentInfo?.department
      ) {
        if (
          user.studentInfo.department ===
          currentUserProfile.studentInfo.department
        ) {
          score += 50;
        }
      } else if (
        user.professorInfo?.department &&
        currentUserProfile.professorInfo?.department
      ) {
        if (
          user.professorInfo.department ===
          currentUserProfile.professorInfo.department
        ) {
          score += 50;
        }
      } else if (
        user.alumniInfo?.department &&
        currentUserProfile.alumniInfo?.department
      ) {
        if (
          user.alumniInfo.department ===
          currentUserProfile.alumniInfo.department
        ) {
          score += 50;
        }
      }

      // Match batch (for students)
      if (user.studentInfo?.batch && currentUserProfile.studentInfo?.batch) {
        if (user.studentInfo.batch === currentUserProfile.studentInfo.batch) {
          score += 30;
        }
      }

      // Match graduation year (for alumni)
      if (
        user.alumniInfo?.graduationYear &&
        currentUserProfile.alumniInfo?.graduationYear
      ) {
        if (
          user.alumniInfo.graduationYear ===
          currentUserProfile.alumniInfo.graduationYear
        ) {
          score += 30;
        }
      }

      // Match role
      if (user.role === currentUserProfile.role) {
        score += 20;
      }

      // Match skills
      if (user.skills && currentUserProfile.skills) {
        const commonSkills = user.skills.filter((skill) =>
          currentUserProfile.skills.includes(skill)
        );
        score += commonSkills.length * 5;
      }

      // Match interests
      if (user.interests && currentUserProfile.interests) {
        const commonInterests = user.interests.filter((interest) =>
          currentUserProfile.interests.includes(interest)
        );
        score += commonInterests.length * 3;
      }

      return {
        ...user,
        matchScore: score,
      };
    });

    // Sort by match score (even if score is 0)
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);

    // Always return available users (minimum 6 if available, otherwise all)
    // If we have users to recommend, return them regardless of score
    if (scoredUsers.length > 0) {
      return res.status(200).json({
        success: true,
        count: scoredUsers.length,
        data: scoredUsers, // Return all available users
        message:
          scoredUsers.length > 0
            ? "Connection suggestions"
            : "No suggestions available",
      });
    }

    // If truly no available users, return empty
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: "No users available to connect with",
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error.message);
    next(error);
  }
};

// @desc    Delete all connections for a user (when account is deleted)
// @route   DELETE /api/network/user/:userId
// @access  Private
exports.deleteUserConnections = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete all connections where user is either requester or recipient
    await Connection.deleteMany({
      $or: [{ requester: userId }, { recipient: userId }],
    });

    res.status(200).json({
      success: true,
      message: "All connections deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user connections:", error);
    next(error);
  }
};
