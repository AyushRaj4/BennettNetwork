const Post = require("../models/Post");
const axios = require("axios");

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3002";
const ENGAGEMENT_SERVICE_URL =
  process.env.ENGAGEMENT_SERVICE_URL || "http://localhost:3005";

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

// Helper function to get engagement data (likes, comments, shares)
const getEngagementData = async (postId) => {
  try {
    const [likesRes, commentsRes, sharesRes] = await Promise.all([
      axios
        .get(`${ENGAGEMENT_SERVICE_URL}/api/engagement/likes/${postId}`)
        .catch(() => ({ data: { data: [] } })),
      axios
        .get(`${ENGAGEMENT_SERVICE_URL}/api/engagement/comments/${postId}`)
        .catch(() => ({ data: { data: [] } })),
      axios
        .get(`${ENGAGEMENT_SERVICE_URL}/api/engagement/shares/${postId}`)
        .catch(() => ({ data: { data: [] } })),
    ]);

    return {
      likes: likesRes.data.data || [],
      comments: commentsRes.data.data || [],
      shares: sharesRes.data.data || [],
    };
  } catch (error) {
    console.error(
      `Error fetching engagement data for post ${postId}:`,
      error.message
    );
    return { likes: [], comments: [], shares: [] };
  }
};

// Helper function to populate author details and engagement data
const populateAuthorDetails = async (posts) => {
  return await Promise.all(
    posts.map(async (post) => {
      const [profile, engagement] = await Promise.all([
        getUserProfile(post.author),
        getEngagementData(post._id),
      ]);

      if (profile) {
        return {
          ...(post.toObject ? post.toObject() : post),
          authorDetails: {
            userId: profile.userId,
            name: `${profile.firstName} ${profile.lastName}`,
            title: profile.title || "User",
            avatar: profile.avatar,
            role: profile.role,
            bio: profile.bio || "",
          },
          likes: engagement.likes,
          comments: engagement.comments,
          shares: engagement.shares,
        };
      }
      return {
        ...(post.toObject ? post.toObject() : post),
        likes: engagement.likes,
        comments: engagement.comments,
        shares: engagement.shares,
      };
    })
  );
};

// @desc    Create a new post
// @route   POST /api/feed/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;

    // Require either content or media
    if ((!content || !content.trim()) && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Post must have either content or media",
      });
    }

    const post = await Post.create({
      author: req.user.id,
      content: content || "", // Allow empty content if media is present
      type: "text",
      media: mediaUrl
        ? [
            {
              type:
                mediaType === "image"
                  ? "image"
                  : mediaType === "video"
                  ? "video"
                  : "document",
              url: mediaUrl,
            },
          ]
        : [],
    });

    // Populate author details for response
    const postsWithAuthor = await populateAuthorDetails([post]);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: postsWithAuthor[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (feed)
// @route   GET /api/feed/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const posts = await Post.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .lean();

    // Populate author details
    const postsWithAuthors = await populateAuthorDetails(posts);

    const total = await Post.countDocuments({ isArchived: false });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: postsWithAuthors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by ID
// @route   GET /api/feed/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { "stats.views": 1 } });

    // Populate author details
    const postsWithAuthor = await populateAuthorDetails([post]);

    res.status(200).json({
      success: true,
      data: postsWithAuthor[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by user
// @route   GET /api/feed/posts/user/:userId
// @access  Public
exports.getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({
      author: req.params.userId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Populate author details
    const postsWithAuthor = await populateAuthorDetails(posts);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: postsWithAuthor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/feed/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;

    // Require either content or media
    if ((!content || !content.trim()) && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Post must have either content or media",
      });
    }

    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    post.content = content || "";

    // Update media if provided
    if (mediaUrl !== undefined) {
      if (mediaUrl) {
        post.media = [
          {
            type: mediaType === "image" ? "image" : "video",
            url: mediaUrl,
          },
        ];
      } else {
        post.media = [];
      }
    }

    await post.save();

    // Populate author details
    const postsWithAuthor = await populateAuthorDetails([post]);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: postsWithAuthor[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/feed/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own posts
// @route   GET /api/feed/my-posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .lean();

    // Populate author details
    const postsWithAuthor = await populateAuthorDetails(posts);

    const total = await Post.countDocuments({ author: req.user.id });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: postsWithAuthor,
    });
  } catch (error) {
    next(error);
  }
};

// Delete all posts by a user
exports.deleteUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete all posts by this author
    await Post.deleteMany({ author: userId });

    res.status(200).json({
      success: true,
      message: "All user posts deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
