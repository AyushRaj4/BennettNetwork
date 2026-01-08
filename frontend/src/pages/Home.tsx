import { useState, useEffect } from "react";
import {
  Image,
  Video,
  FileText,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  X,
  Smile,
  Edit2,
  Trash2,
  Check,
  GraduationCap,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Comment as CommentType, NewsItem } from "../services/api";
import { postService, commentService, newsService } from "../services/api";
import PostModal from "../components/PostModal";
import Comment from "../components/Comment";
import ConfirmModal from "../components/ConfirmModal";

interface Post {
  _id: string;
  userId: string;
  author: {
    userId?: string;
    name: string;
    title: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
  content: string;
  mediaType: "none" | "image" | "video" | "document";
  mediaUrl?: string;
  likes: Array<{
    userId: string;
    timestamp: string;
  }>;
  comments: Array<{
    userId: string;
    author: {
      name: string;
      avatar?: string;
    };
    text: string;
    timestamp: string;
  }>;
  shares: Array<{
    userId: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<
    "image" | "video" | "document" | null
  >(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showFullPostModal, setShowFullPostModal] = useState(false);
  const [topComments, setTopComments] = useState<{
    [postId: string]: CommentType[];
  }>({});
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [removeMedia, setRemoveMedia] = useState(false);
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editMediaPreview, setEditMediaPreview] = useState<string | null>(null);
  const [editMediaType, setEditMediaType] = useState<"image" | "video" | null>(
    null
  );
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    fetchNews();
  }, []);

  // Handle background scroll for Create Post Modal
  useEffect(() => {
    if (showPostModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPostModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openMenuPostId && !target.closest(".post-menu")) {
        setOpenMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuPostId]);

  // Helper function to format timestamp
  const formatTimestamp = (dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)}w`;
    return postDate.toLocaleDateString();
  };

  // Helper function to get role icon
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-4 w-4 text-blue-600 inline-block" />;
      case "professor":
        return <BookOpen className="h-4 w-4 text-green-600 inline-block" />;
      case "alumni":
        return <Briefcase className="h-4 w-4 text-purple-600 inline-block" />;
      default:
        return <GraduationCap className="h-4 w-4 text-gray-600 inline-block" />;
    }
  };

  // Helper function to truncate bio to 2 lines (approximately 100 characters)
  const truncateBio = (bio?: string) => {
    if (!bio || bio.trim() === "") return null;
    const maxLength = 100;
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength).trim() + "...";
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await postService.getFeed();

      // Normalize posts from feed-service to match expected format
      const normalizedPosts = fetchedPosts.map((post: any) => ({
        ...post,
        userId: post.authorDetails?.userId || post.userId || post.author,
        author: post.authorDetails || {
          name: post.author?.name || "Unknown User",
          title: post.author?.title || "User",
          avatar: post.author?.avatar,
          role: post.author?.role,
          bio: post.author?.bio,
        },
        mediaUrl: post.media?.[0]?.url || post.mediaUrl,
        mediaType: post.media?.[0]?.type || post.mediaType || "none",
        likes: post.likes || [],
        comments: post.comments || [],
        shares: post.shares || [],
      }));

      setPosts(normalizedPosts);

      // Fetch top 2 comments for each post
      const commentsMap: { [postId: string]: CommentType[] } = {};
      await Promise.all(
        normalizedPosts.map(async (post: Post) => {
          try {
            const comments = await commentService.getPostComments(
              post._id,
              2,
              "likes"
            );
            commentsMap[post._id] = comments;
          } catch (err) {
            console.error(`Error fetching comments for post ${post._id}:`, err);
            commentsMap[post._id] = [];
          }
        })
      );
      setTopComments(commentsMap);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await newsService.getLatestNews();
      setNews(response.data || []);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;

      // Check if current user has liked this post
      const isLiked =
        Array.isArray(post.likes) &&
        post.likes.some((like: any) => {
          const likeUserId =
            typeof like === "string" ? like : like.userId || like.user;
          const currentUserId = profile?.userId;
          return (
            likeUserId &&
            currentUserId &&
            likeUserId.toString() === currentUserId.toString()
          );
        });

      // Call the appropriate API based on current like status
      if (isLiked) {
        await postService.unlikePost(postId);
      } else {
        // Find the post to get the author ID
        const post = posts.find((p) => p._id === postId);
        const postOwnerId =
          (post as any)?.authorDetails?.userId ||
          (post as any)?.userId ||
          (post as any)?.author;
        console.log(
          `🎯 Liking post - PostId: ${postId}, PostOwnerId: ${postOwnerId}, Post structure:`,
          post
        );
        await postService.likePost(postId, postOwnerId);
      }

      // Update local state
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: isLiked
                  ? p.likes.filter((like: any) => {
                      const likeUserId =
                        typeof like === "string"
                          ? like
                          : like.userId || like.user;
                      return likeUserId !== profile?.userId;
                    })
                  : [
                      ...p.likes,
                      {
                        userId: profile?.userId || "",
                        timestamp: new Date().toISOString(),
                      },
                    ],
              }
            : p
        )
      );
    } catch (err: any) {
      console.error("Error liking post:", err);
      // Don't show alert for like errors, just log them
    }
  };

  const handleComment = (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (post) {
      setSelectedPost(post);
      setShowFullPostModal(true);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await postService.deletePost(postToDelete);
      setPosts(posts.filter((p) => p._id !== postToDelete));
      setOpenMenuPostId(null);
      setPostToDelete(null);
    } catch (err: any) {
      console.error("Error deleting post:", err);
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post._id);
    setEditContent(post.content);
    setRemoveMedia(false);
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setEditMediaType(null);
    setOpenMenuPostId(null);
  };

  const handleSaveEdit = async (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (!post) return;

    // Check if there's content or media
    if (
      !editContent.trim() &&
      !post.mediaUrl &&
      !editMediaFile &&
      removeMedia
    ) {
      alert("Post must have either content or media");
      return;
    }

    try {
      const updateData: {
        content: string;
        mediaUrl?: string;
        mediaType?: string;
      } = {
        content: editContent,
      };

      // Handle new media upload
      if (editMediaFile && editMediaType) {
        if (editMediaType === "image") {
          const compressedImage = await compressImage(editMediaFile);
          updateData.mediaUrl = compressedImage;
          updateData.mediaType = "image";
        }
      } else if (removeMedia) {
        // If user wants to remove media, set it to empty
        updateData.mediaUrl = "";
        updateData.mediaType = "none";
      }

      await postService.updatePost(postId, updateData);

      // Refresh posts to get updated data
      await fetchPosts();

      setEditingPostId(null);
      setEditContent("");
      setRemoveMedia(false);
      setEditMediaFile(null);
      setEditMediaPreview(null);
      setEditMediaType(null);
    } catch (err: any) {
      console.error("Error updating post:", err);
      alert(err.response?.data?.message || "Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent("");
    setRemoveMedia(false);
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setEditMediaType(null);
  };

  const handleEditFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        setEditMediaFile(file);
        setEditMediaType("image");
        setRemoveMedia(false);

        const reader = new FileReader();
        reader.onloadend = () => {
          setEditMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const handleRemoveEditMedia = () => {
    setEditMediaFile(null);
    setEditMediaPreview(null);
    setEditMediaType(null);
  };

  const handleShare = async (postId: string) => {
    try {
      await postService.sharePost(postId);

      // Update local state
      setPosts(
        posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                shares: [
                  ...p.shares,
                  {
                    userId: profile?.userId || "",
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );

      alert("Post shared successfully!");
    } catch (err: any) {
      console.error("Error sharing post:", err);
      alert(err.response?.data?.message || "Failed to share post");
    }
  };

  const handleFileSelect = (type: "image" | "video" | "document") => {
    const input = document.createElement("input");
    input.type = "file";

    if (type === "image") {
      input.accept = "image/*";
    } else if (type === "video") {
      input.accept = "video/*,.mkv";
    } else {
      input.accept = ".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx";
    }

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        // Check video file size before proceeding
        if (type === "video") {
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            alert(
              "Video file is too large. Please select a video smaller than 10MB."
            );
            return;
          }
        }

        // Check document file size before proceeding
        if (type === "document") {
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            alert(
              "Document file is too large. Please select a document smaller than 5MB."
            );
            return;
          }
        }

        setMediaFile(file);
        setMediaType(type);

        // Create preview for images and videos
        if (type === "image" || type === "video") {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else if (type === "document") {
          setMediaPreview(file.name);
          setDocumentName(file.name);
        }
      }
    };

    input.click();
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setDocumentName("");
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          // Resize if too large
          const maxSize = 1200;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const convertVideoToBase64 = async (file: File): Promise<string> => {
    // Check file size (limit to 10MB for videos)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(
        "Video file is too large. Please upload a video smaller than 10MB."
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  };

  const convertDocumentToBase64 = async (file: File): Promise<string> => {
    // Check file size (limit to 5MB for documents)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(
        "Document file is too large. Please upload a document smaller than 5MB."
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  };

  const handleCreatePost = async () => {
    // Require either content or media
    if (!postContent.trim() && !mediaFile) {
      alert("Please add some content or media to your post");
      return;
    }

    if (!profile) {
      alert(
        "Please complete your profile before posting. Go to Profile page to set up your account."
      );
      setShowPostModal(false);
      return;
    }

    try {
      setUploading(true);
      let mediaUrl = "";
      let finalMediaType = "none";

      // Handle media upload
      if (mediaFile && mediaType) {
        if (mediaType === "image") {
          // Compress and convert image to base64
          mediaUrl = await compressImage(mediaFile);
          finalMediaType = "image";
        } else if (mediaType === "video") {
          try {
            // Convert video to base64
            mediaUrl = await convertVideoToBase64(mediaFile);
            finalMediaType = "video";
          } catch (error: any) {
            alert(error.message || "Failed to process video file");
            setUploading(false);
            return;
          }
        } else if (mediaType === "document") {
          try {
            // Convert document to base64
            mediaUrl = await convertDocumentToBase64(mediaFile);
            finalMediaType = "document";
          } catch (error: any) {
            alert(error.message || "Failed to process document file");
            setUploading(false);
            return;
          }
        }
      }

      await postService.createPost({
        content: postContent.trim(),
        mediaType: finalMediaType,
        mediaUrl: mediaUrl,
      });

      // Refresh the feed to show the new post and maintain proper order
      await fetchPosts();
      setPostContent("");
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      setDocumentName("");
      setShowPostModal(false);
    } catch (err: any) {
      console.error("Error creating post:", err);
      alert(err.response?.data?.message || "Failed to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
              <div
                className="h-16 bg-cover bg-center"
                style={{
                  backgroundImage: profile?.banner
                    ? `url(${profile.banner})`
                    : "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))",
                }}
              ></div>
              <div className="px-4 pb-4 -mt-8">
                <img
                  src={
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=0066cc&color=fff&size=80`
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-4 border-white mb-2"
                />
                <h3 className="font-semibold text-gray-900">
                  {user?.fullName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {profile?.title || "Student"}
                </p>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile viewers</span>
                    <span className="text-blue-600 font-semibold">91</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Post impressions</span>
                    <span className="text-blue-600 font-semibold">342</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6">
            {/* Create Post Card */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=0066cc&color=fff&size=48`
                  }
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full"
                />
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 text-left px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-gray-600"
                >
                  Start a post
                </button>
              </div>
              <div className="flex items-center justify-around mt-3 pt-3 border-t">
                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600">
                  <Image className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600">
                  <Video className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Article</span>
                </button>
              </div>
            </div>

            {/* Sort by */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="px-4 text-sm text-gray-500">
                Sort by:{" "}
                <span className="font-semibold text-gray-700">Top</span>
              </span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Posts Feed */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                {/* Spinner Animation */}
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                {/* Loading Text */}
                <p className="text-gray-600 font-medium">Loading posts...</p>
                <p className="text-gray-400 text-sm mt-1">Please wait</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-600 text-lg mb-2">No posts yet</p>
                <p className="text-gray-500 text-sm">
                  Be the first to share something!
                </p>
              </div>
            )}

            {posts.map((post) => {
              const authorName = post.author.name;

              // Check if current user has liked this post
              const isLiked =
                Array.isArray(post.likes) &&
                post.likes.some((like: any) => {
                  // Handle different like formats
                  const likeUserId =
                    typeof like === "string" ? like : like.userId || like.user;
                  const currentUserId = profile?.userId;

                  // Ensure both are strings and compare
                  return (
                    likeUserId &&
                    currentUserId &&
                    likeUserId.toString() === currentUserId.toString()
                  );
                });

              const isOwner = post.userId === profile?.userId;
              const isEditing = editingPostId === post._id;

              return (
                <div
                  key={post._id}
                  className="bg-white rounded-xl shadow-md mb-4 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <img
                            src={
                              post.author.avatar ||
                              `https://ui-avatars.com/api/?name=${authorName}&background=0066cc&color=fff`
                            }
                            alt={authorName}
                            className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/user/${post.userId}`)}
                          />
                          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                            {getRoleIcon(post.author.role)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3
                              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => navigate(`/user/${post.userId}`)}
                            >
                              {authorName}
                            </h3>
                          </div>
                          {truncateBio(post.author.bio) && (
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                              {truncateBio(post.author.bio)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(post.createdAt)} • 🌐
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="relative post-menu">
                          <button
                            onClick={() =>
                              setOpenMenuPostId(
                                openMenuPostId === post._id ? null : post._id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreHorizontal className="h-5 w-5 text-gray-600" />
                          </button>
                          {openMenuPostId === post._id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Edit post</span>
                              </button>
                              <button
                                onClick={() => {
                                  setPostToDelete(post._id);
                                  setShowDeleteConfirm(true);
                                  setOpenMenuPostId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete post</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    {isEditing ? (
                      <div className="mt-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={4}
                          placeholder="What's on your mind? (optional if adding image)"
                        />

                        {/* New Media Preview in Edit Mode */}
                        {editMediaPreview && (
                          <div className="relative mt-3">
                            <img
                              src={editMediaPreview}
                              alt="New content"
                              className="w-full rounded-lg"
                            />
                            <button
                              onClick={handleRemoveEditMedia}
                              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                              title="Remove new image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Existing Media Preview in Edit Mode */}
                        {!editMediaPreview &&
                          post.mediaUrl &&
                          post.mediaType === "image" &&
                          !removeMedia && (
                            <div className="relative mt-3">
                              <img
                                src={post.mediaUrl}
                                alt="Post content"
                                className="w-full rounded-lg"
                              />
                              <button
                                onClick={() => setRemoveMedia(true)}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                                title="Remove image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                        {removeMedia && post.mediaUrl && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-yellow-800">
                              Image will be removed
                            </span>
                            <button
                              onClick={() => setRemoveMedia(false)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Undo
                            </button>
                          </div>
                        )}

                        {/* Add Image Button */}
                        {!editMediaPreview && !post.mediaUrl && (
                          <button
                            onClick={handleEditFileSelect}
                            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2"
                          >
                            <Image className="h-4 w-4" />
                            <span>Add Image</span>
                          </button>
                        )}

                        {!editMediaPreview && post.mediaUrl && !removeMedia && (
                          <button
                            onClick={handleEditFileSelect}
                            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2"
                          >
                            <Image className="h-4 w-4" />
                            <span>Change Image</span>
                          </button>
                        )}

                        {removeMedia && (
                          <button
                            onClick={handleEditFileSelect}
                            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2"
                          >
                            <Image className="h-4 w-4" />
                            <span>Add Image</span>
                          </button>
                        )}

                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            onClick={() => handleSaveEdit(post._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Check className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="text-gray-800 whitespace-pre-line">
                          {post.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Post Image/Video - Only show when NOT editing */}
                  {!isEditing &&
                    post.mediaUrl &&
                    post.mediaType === "image" && (
                      <img
                        src={post.mediaUrl}
                        alt="Post content"
                        className="w-full"
                      />
                    )}
                  {!isEditing &&
                    post.mediaUrl &&
                    post.mediaType === "video" && (
                      <div className="relative bg-black">
                        <video
                          controls
                          className="w-full max-h-[600px] object-contain"
                          preload="auto"
                          playsInline
                          controlsList="nodownload"
                        >
                          <source src={post.mediaUrl} type="video/mp4" />
                          <source src={post.mediaUrl} type="video/webm" />
                          <source src={post.mediaUrl} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  {!isEditing &&
                    post.mediaUrl &&
                    post.mediaType === "document" && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Document Attachment
                            </p>
                            <p className="text-sm text-gray-500">
                              {post.mediaUrl.startsWith("data:application/pdf")
                                ? "PDF Document"
                                : post.mediaUrl.startsWith(
                                    "data:application/msword"
                                  ) ||
                                  post.mediaUrl.startsWith(
                                    "data:application/vnd.openxmlformats-officedocument.wordprocessingml"
                                  )
                                ? "Word Document"
                                : post.mediaUrl.startsWith("data:text/plain")
                                ? "Text Document"
                                : "Document"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={post.mediaUrl}
                          download={`document-${post._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                      </div>
                    )}

                  {/* Post Actions */}
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{post.likes.length} likes</span>
                      <div className="flex items-center space-x-3">
                        <span>{post.comments.length} comments</span>
                        <span>{post.shares.length} reposts</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t px-2 py-1">
                    <div className="flex items-center justify-around">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center ${
                          isLiked ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        <ThumbsUp
                          className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                        />
                        <span className="text-sm font-medium">Like</span>
                      </button>
                      <button
                        onClick={() => handleComment(post._id)}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 flex-1 justify-center"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Comment</span>
                      </button>
                      <button
                        onClick={() => handleShare(post._id)}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 flex-1 justify-center"
                      >
                        <Share2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Repost</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 flex-1 justify-center">
                        <Send className="h-5 w-5" />
                        <span className="text-sm font-medium">Send</span>
                      </button>
                    </div>
                  </div>

                  {/* Top Comments Section */}
                  {topComments[post._id] &&
                    topComments[post._id].length > 0 && (
                      <div className="px-4 pb-3 border-t pt-3">
                        <div className="space-y-1">
                          {topComments[post._id].slice(0, 2).map((comment) => (
                            <Comment
                              key={comment._id}
                              comment={comment}
                              onCommentUpdate={fetchPosts}
                            />
                          ))}
                        </div>
                        {post.comments.length > 2 && (
                          <button
                            onClick={() => handleComment(post._id)}
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium mt-2 hover:underline"
                          >
                            View all {post.comments.length} comments
                          </button>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Right Sidebar - Bennett University News */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>Bennett University News</span>
                {newsLoading && (
                  <span className="text-xs text-gray-500">(Loading...)</span>
                )}
              </h3>
              <div className="space-y-4">
                {news.length > 0
                  ? news.map((item) => (
                      <div key={item._id}>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <h4 className="font-medium text-sm text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                item.publishedDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </a>
                      </div>
                    ))
                  : !newsLoading && (
                      <p className="text-sm text-gray-500">No news available</p>
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPostModal(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Create a post
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-start space-x-3 mb-4">
                <img
                  src={
                    profile?.avatar ||
                    `https://ui-avatars.com/api/?name=${user?.fullName}&background=0066cc&color=fff&size=48`
                  }
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {user?.fullName}
                  </h4>
                  <button className="text-sm text-gray-600 flex items-center space-x-1 mt-1 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">
                    <span>🌐 Anyone</span>
                  </button>
                </div>
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full min-h-[200px] p-3 text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
                autoFocus
              />

              {/* Media Preview */}
              {mediaPreview && (
                <div className="relative mt-4 border rounded-lg overflow-hidden">
                  {mediaType === "image" && (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain"
                    />
                  )}
                  {mediaType === "video" && (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full max-h-96 object-contain"
                        preload="auto"
                        playsInline
                        controlsList="nodownload"
                      >
                        <source src={mediaPreview} type="video/mp4" />
                        <source src={mediaPreview} type="video/webm" />
                        <source src={mediaPreview} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {mediaType === "document" && (
                    <div className="p-4 bg-gray-50 flex items-center space-x-3 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {mediaPreview}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Document ready to upload
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFileSelect("image")}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Add a photo"
                  >
                    <Image className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleFileSelect("video")}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Add a video"
                  >
                    <Video className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleFileSelect("document")}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Add a document"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Smile className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={(!postContent.trim() && !mediaFile) || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {uploading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Post Modal with Comments */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={showFullPostModal}
          onClose={() => {
            setShowFullPostModal(false);
            setSelectedPost(null);
          }}
          onPostUpdate={fetchPosts}
        />
      )}

      {/* Delete Post Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Home;
