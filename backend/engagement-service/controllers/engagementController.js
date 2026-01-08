const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Share = require("../models/Share");
const axios = require("axios");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:5002";
const FEED_SERVICE_URL =
  process.env.FEED_SERVICE_URL || "http://localhost:3006";
const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3008";

// Helper function to fetch user profile info
const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/api/users/profile/${userId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }
};

// Helper function to fetch post content
const getPostContent = async (postId, token) => {
  try {
    const response = await axios.get(
      `${FEED_SERVICE_URL}/api/feed/posts/${postId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching post content:", error.message);
    return null;
  }
};

// Helper function to truncate text
const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

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

// LIKE CONTROLLERS
exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reactionType, postOwnerId } = req.body;

    console.log(
      `🎯 Like request - PostId: ${postId}, PostOwnerId: ${postOwnerId}, CurrentUser: ${req.user.id}`
    );

    const existingLike = await Like.findOne({
      user: req.user.id,
      post: postId,
    });

    if (existingLike) {
      existingLike.reactionType = reactionType || existingLike.reactionType;
      await existingLike.save();
      return res.status(200).json({
        success: true,
        message: "Reaction updated",
        data: existingLike,
      });
    }

    const like = await Like.create({
      user: req.user.id,
      post: postId,
      reactionType: reactionType || "like",
    });

    // Create notification for post owner (don't notify self)
    if (postOwnerId && postOwnerId !== req.user.id) {
      console.log(`📬 Creating notification for post owner: ${postOwnerId}`);
      const userProfile = await getUserProfile(req.user.id);
      const token = req.headers.authorization?.split(" ")[1];

      if (userProfile && token) {
        // Fetch post content
        const postContent = await getPostContent(postId, token);
        const postText = postContent?.content || "";
        const truncatedPost = truncateText(postText, 50);

        const content = truncatedPost
          ? `${userProfile.firstName} ${userProfile.lastName} liked your post: "${truncatedPost}"`
          : `${userProfile.firstName} ${userProfile.lastName} liked your post`;

        console.log(`📨 Sending notification: ${content}`);
        await createNotification(
          {
            userId: postOwnerId,
            type: "LIKE",
            content: content,
            relatedUserId: req.user.id,
            relatedUserName: `${userProfile.firstName} ${userProfile.lastName}`,
            relatedUserAvatar: userProfile.avatar,
            relatedId: postId,
          },
          token
        );
        console.log(`✅ Notification sent successfully`);
      } else {
        console.log(`⚠️ Missing userProfile or token`);
      }
    } else {
      console.log(
        `⚠️ Not sending notification - PostOwnerId: ${postOwnerId}, CurrentUser: ${req.user.id}`
      );
    }

    res.status(201).json({
      success: true,
      message: "Post liked successfully",
      data: like,
    });
  } catch (error) {
    console.error(`❌ Error in likePost:`, error);
    next(error);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const like = await Like.findOneAndDelete({
      user: req.user.id,
      post: postId,
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId });

    // Transform likes to match frontend format
    const transformedLikes = likes.map((like) => ({
      userId: like.user.toString(),
      timestamp: like.createdAt,
      reactionType: like.reactionType,
    }));

    res.status(200).json({
      success: true,
      count: likes.length,
      data: transformedLikes,
    });
  } catch (error) {
    next(error);
  }
};

// COMMENT CONTROLLERS
exports.createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentComment, postOwnerId } = req.body;

    console.log(
      `💬 Comment request - PostId: ${postId}, PostOwnerId: ${postOwnerId}, CurrentUser: ${req.user.id}`
    );

    const comment = await Comment.create({
      user: req.user.id,
      post: postId,
      content,
      parentComment: parentComment || null,
    });

    // Populate comment with user details
    const userProfile = await getUserProfile(req.user.id);
    const commentWithUser = {
      ...comment.toObject(),
      userDetails: userProfile
        ? {
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            avatar: userProfile.avatar,
            title: userProfile.title,
          }
        : {
            name: "Unknown User",
            avatar: null,
            title: "User",
          },
    };

    // Create notification for post owner (don't notify self)
    if (postOwnerId && postOwnerId !== req.user.id && userProfile) {
      console.log(
        `📬 Creating comment notification for post owner: ${postOwnerId}`
      );
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        // Fetch post content
        const postContent = await getPostContent(postId, token);
        const postText = postContent?.content || "";
        const truncatedPost = truncateText(postText, 50);

        const notificationContent = truncatedPost
          ? `${userProfile.firstName} ${userProfile.lastName} commented on your post: "${truncatedPost}"`
          : `${userProfile.firstName} ${userProfile.lastName} commented on your post`;

        console.log(`📨 Sending comment notification: ${notificationContent}`);
        await createNotification(
          {
            userId: postOwnerId,
            type: "COMMENT",
            content: notificationContent,
            relatedUserId: req.user.id,
            relatedUserName: `${userProfile.firstName} ${userProfile.lastName}`,
            relatedUserAvatar: userProfile.avatar,
            relatedId: postId,
          },
          token
        );
        console.log(`✅ Comment notification sent successfully`);
      } else {
        console.log(`⚠️ Missing token for comment notification`);
      }
    } else {
      console.log(
        `⚠️ Not sending comment notification - PostOwnerId: ${postOwnerId}, CurrentUser: ${
          req.user.id
        }, HasProfile: ${!!userProfile}`
      );
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: commentWithUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    let comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { limit, sortBy } = req.query;

    let query = Comment.find({
      post: postId,
      parentComment: null,
    });

    // Sort by likes or date
    if (sortBy === "likes") {
      // We'll sort by the length of likes array
      const comments = await Comment.find({
        post: postId,
        parentComment: null,
      }).lean();

      // Add likesCount to each comment and sort
      const commentsWithLikes = comments.map((comment) => ({
        ...comment,
        likesCount: comment.likes?.length || 0,
      }));

      commentsWithLikes.sort((a, b) => b.likesCount - a.likesCount);

      // Apply limit if provided
      const limitedComments = limit
        ? commentsWithLikes.slice(0, parseInt(limit))
        : commentsWithLikes;

      // Fetch user details for each comment
      const commentsWithUsers = await Promise.all(
        limitedComments.map(async (comment) => {
          const userProfile = await getUserProfile(comment.user);
          return {
            ...comment,
            userDetails: userProfile
              ? {
                  name: `${userProfile.firstName} ${userProfile.lastName}`,
                  avatar: userProfile.avatar,
                  title: userProfile.title,
                }
              : {
                  name: "Unknown User",
                  avatar: null,
                  title: "User",
                },
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: commentsWithUsers.length,
        data: commentsWithUsers,
      });
    } else {
      // Sort by date (newest first)
      query = query.sort({ createdAt: -1 });

      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const comments = await query.lean();

      // Add likesCount and fetch user details
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const userProfile = await getUserProfile(comment.user);
          return {
            ...comment,
            likesCount: comment.likes?.length || 0,
            userDetails: userProfile
              ? {
                  name: `${userProfile.firstName} ${userProfile.lastName}`,
                  avatar: userProfile.avatar,
                  title: userProfile.title,
                }
              : {
                  name: "Unknown User",
                  avatar: null,
                  title: "User",
                },
          };
        })
      );

      res.status(200).json({
        success: true,
        count: commentsWithUsers.length,
        data: commentsWithUsers,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const replies = await Comment.find({ parentComment: commentId })
      .sort({
        createdAt: 1,
      })
      .lean();

    // Add likesCount and fetch user details
    const repliesWithUsers = await Promise.all(
      replies.map(async (reply) => {
        const userProfile = await getUserProfile(reply.user);
        return {
          ...reply,
          likesCount: reply.likes?.length || 0,
          userDetails: userProfile
            ? {
                name: `${userProfile.firstName} ${userProfile.lastName}`,
                avatar: userProfile.avatar,
                title: userProfile.title,
              }
            : {
                name: "Unknown User",
                avatar: null,
                title: "User",
              },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: repliesWithUsers.length,
      data: repliesWithUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Like a comment
exports.likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user already liked this comment
    const alreadyLiked = comment.likes.some(
      (like) => like.userId.toString() === userId
    );

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "You already liked this comment",
      });
    }

    // Add like
    comment.likes.push({ userId, timestamp: new Date() });
    await comment.save();

    // Create notification for comment owner (don't notify self)
    if (comment.user.toString() !== userId) {
      console.log(
        `📬 Creating notification for comment owner: ${comment.user}`
      );
      const userProfile = await getUserProfile(userId);
      const token = req.headers.authorization?.split(" ")[1];

      if (userProfile && token) {
        // Fetch post content to provide context
        const postContent = await getPostContent(
          comment.post.toString(),
          token
        );
        const postText = postContent?.content || "";
        const truncatedPost = truncateText(postText, 30);

        // Truncate comment content
        const truncatedComment = truncateText(comment.content, 30);

        const content = truncatedPost
          ? `${userProfile.firstName} ${userProfile.lastName} liked your comment "${truncatedComment}" on post: "${truncatedPost}"`
          : `${userProfile.firstName} ${userProfile.lastName} liked your comment: "${truncatedComment}"`;

        console.log(`📨 Sending notification: ${content}`);
        await createNotification(
          {
            userId: comment.user.toString(),
            type: "LIKE",
            content: content,
            relatedUserId: userId,
            relatedUserName: `${userProfile.firstName} ${userProfile.lastName}`,
            relatedUserAvatar: userProfile.avatar,
            relatedId: commentId,
          },
          token
        );
        console.log(`✅ Comment like notification sent successfully`);
      } else {
        console.log(
          `⚠️ Missing userProfile or token for comment like notification`
        );
      }
    } else {
      console.log(`⚠️ Not sending notification - user liked their own comment`);
    }

    res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      data: {
        commentId: comment._id,
        likesCount: comment.likes.length,
      },
    });
  } catch (error) {
    console.error(`❌ Error in likeComment:`, error);
    next(error);
  }
};

// Unlike a comment
exports.unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Remove like
    const likeIndex = comment.likes.findIndex(
      (like) => like.userId.toString() === userId
    );

    if (likeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this comment",
      });
    }

    comment.likes.splice(likeIndex, 1);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
      data: {
        commentId: comment._id,
        likesCount: comment.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// SHARE CONTROLLERS
exports.sharePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    const share = await Share.create({
      user: req.user.id,
      post: postId,
      message: message || "",
    });

    res.status(201).json({
      success: true,
      message: "Post shared successfully",
      data: share,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostShares = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const shares = await Share.find({ post: postId });

    res.status(200).json({
      success: true,
      count: shares.length,
      data: shares,
    });
  } catch (error) {
    next(error);
  }
};

// Delete all user engagement data (likes, comments, shares)
exports.deleteUserEngagement = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete all likes by this user
    await Like.deleteMany({ user: userId });

    // Delete all comments by this user
    await Comment.deleteMany({ user: userId });

    // Delete all shares by this user
    await Share.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: "All user engagement data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
