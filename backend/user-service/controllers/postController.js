const Post = require("../models/Post");
const UserProfile = require("../models/UserProfile");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, mediaType, mediaUrl } = req.body;
    const userId = req.userId;

    // Get user profile for author info
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const post = new Post({
      userId,
      author: {
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.title || "User",
        avatar: profile.avatar,
      },
      content,
      mediaType: mediaType || "none",
      mediaUrl: mediaUrl || "",
    });

    await post.save();

    // Update post count in profile stats
    await UserProfile.findOneAndUpdate(
      { userId },
      { $inc: { "stats.posts": 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all posts (feed)
exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch current profile info for each post author to ensure avatar is up-to-date
    const postsWithUpdatedAuthors = await Promise.all(
      posts.map(async (post) => {
        const profile = await UserProfile.findOne({
          userId: post.userId,
        }).lean();

        // Update author info with current profile data
        if (profile) {
          post.author = {
            name: `${profile.firstName} ${profile.lastName}`,
            title: profile.title || "User",
            avatar: profile.avatar,
          };
        }

        return post;
      })
    );

    // Add computed fields
    const postsWithStats = postsWithUpdatedAuthors.map((post) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      sharesCount: post.shares?.length || 0,
      isLiked:
        post.likes?.some(
          (like) => like.userId.toString() === req.userId.toString()
        ) || false,
    }));

    const total = await Post.countDocuments();

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Fetch current profile info to ensure avatar is up-to-date
    const profile = await UserProfile.findOne({ userId: post.userId }).lean();

    if (profile) {
      post.author = {
        name: `${profile.firstName} ${profile.lastName}`,
        title: profile.title || "User",
        avatar: profile.avatar,
      };
    }

    // Add computed fields
    const postWithStats = {
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      sharesCount: post.shares?.length || 0,
      isLiked:
        post.likes?.some(
          (like) => like.userId.toString() === req.userId.toString()
        ) || false,
    };

    res.json({ success: true, data: postWithStats });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Check if already liked
    const likeIndex = post.likes.findIndex(
      (like) => like.userId.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ userId });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likesCount: post.likes.length,
        isLiked: likeIndex === -1,
      },
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    }

    // Get user profile for author info
    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const comment = {
      userId,
      author: {
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.avatar,
      },
      text,
    };

    post.comments.push(comment);
    await post.save();

    res.json({
      success: true,
      data: {
        comment: post.comments[post.comments.length - 1],
        commentsCount: post.comments.length,
      },
    });
  } catch (error) {
    console.error("Comment post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Share/Repost a post
exports.sharePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Check if already shared
    const shareIndex = post.shares.findIndex(
      (share) => share.userId.toString() === userId.toString()
    );

    if (shareIndex > -1) {
      // Unshare
      post.shares.splice(shareIndex, 1);
    } else {
      // Share
      post.shares.push({ userId });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        sharesCount: post.shares.length,
        isShared: shareIndex === -1,
      },
    });
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Check if user is the owner
    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Post.findByIdAndDelete(postId);

    // Update post count in profile stats
    await UserProfile.findOneAndUpdate(
      { userId },
      { $inc: { "stats.posts": -1 } }
    );

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { content, mediaUrl, mediaType } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Check if user is the owner
    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    post.content = content;

    // Update media if provided
    if (mediaUrl !== undefined) {
      post.mediaUrl = mediaUrl;
      post.mediaType = mediaType || "none";
    }

    await post.save();

    res.json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch current profile info to ensure avatar is up-to-date
    const profile = await UserProfile.findOne({ userId }).lean();

    const postsWithUpdatedAuthor = posts.map((post) => {
      if (profile) {
        post.author = {
          name: `${profile.firstName} ${profile.lastName}`,
          title: profile.title || "User",
          avatar: profile.avatar,
        };
      }
      return post;
    });

    // Add computed fields
    const postsWithStats = postsWithUpdatedAuthor.map((post) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      sharesCount: post.shares?.length || 0,
      isLiked:
        post.likes?.some(
          (like) => like.userId.toString() === req.userId.toString()
        ) || false,
    }));

    const total = await Post.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        posts: postsWithStats,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
