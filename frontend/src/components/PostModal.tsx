import { useState, useEffect, useRef } from "react";
import { X, ThumbsUp, Share2, Send, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Comment as CommentType } from "../services/api";
import { commentService, postService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Comment from "./Comment";

interface Post {
  _id: string;
  userId: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
  content: string;
  mediaType: "none" | "image" | "video" | "document";
  mediaUrl?: string;
  likes: Array<{
    userId: string;
    timestamp: string;
  }>;
  comments: Array<any>;
  shares: Array<{
    userId: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdate?: () => void;
}

const PostModal = ({ post, isOpen, onClose, onPostUpdate }: PostModalProps) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setLocalPost(post);
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Re-enable background scroll when modal closes
      document.body.style.overflow = "unset";
    };
  }, [isOpen, post._id]);

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      const fetchedComments = await commentService.getPostComments(post._id);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setComments(comments.filter((c) => c._id !== commentId));
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Get post owner ID from the post
      const postOwnerId =
        (post as any)?.authorDetails?.userId ||
        (post as any)?.userId ||
        (post as any)?.author;
      console.log(
        `💬 Creating comment - PostId: ${post._id}, PostOwnerId: ${postOwnerId}`
      );

      const createdComment = await commentService.createComment(post._id, {
        content: newComment,
        postOwnerId: postOwnerId,
      });

      setComments([createdComment, ...comments]);
      setNewComment("");

      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error: any) {
      console.error("Error adding comment:", error);
      alert(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      // Check if current user has liked this post
      const isLiked =
        Array.isArray(localPost.likes) &&
        localPost.likes.some((like: any) => {
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

      // Call the appropriate API based on current like status
      if (isLiked) {
        await postService.unlikePost(localPost._id);
      } else {
        await postService.likePost(localPost._id);
      }

      setLocalPost({
        ...localPost,
        likes: isLiked
          ? localPost.likes.filter((like: any) => {
              const likeUserId =
                typeof like === "string" ? like : like.userId || like.user;
              return likeUserId !== profile?.userId;
            })
          : [
              ...localPost.likes,
              {
                userId: profile?.userId || "",
                timestamp: new Date().toISOString(),
              },
            ],
      });

      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleShare = async () => {
    try {
      await postService.sharePost(localPost._id);

      setLocalPost({
        ...localPost,
        shares: [
          ...localPost.shares,
          {
            userId: profile?.userId || "",
            timestamp: new Date().toISOString(),
          },
        ],
      });

      alert("Post shared successfully!");

      if (onPostUpdate) {
        onPostUpdate();
      }
    } catch (error: any) {
      console.error("Error sharing post:", error);
      alert(error.response?.data?.message || "Failed to share post");
    }
  };

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
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  if (!isOpen) return null;

  const isLiked = localPost.likes.some(
    (like) => like.userId === profile?.userId
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {localPost.author.name}'s Post
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-6 border-b">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <img
                  src={
                    localPost.author.avatar ||
                    `https://ui-avatars.com/api/?name=${localPost.author.name}&background=0066cc&color=fff`
                  }
                  alt={localPost.author.name}
                  className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/user/${localPost.userId}`)}
                />
                <div>
                  <h3
                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/user/${localPost.userId}`)}
                  >
                    {localPost.author.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {localPost.author.title || "Student"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(localPost.createdAt)} • 🌐
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Post Text */}
            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-line">
                {localPost.content}
              </p>
            </div>

            {/* Post Media */}
            {localPost.mediaUrl && localPost.mediaType === "image" && (
              <img
                src={localPost.mediaUrl}
                alt="Post content"
                className="w-full rounded-lg mb-4"
              />
            )}
            {localPost.mediaUrl && localPost.mediaType === "video" && (
              <video
                src={localPost.mediaUrl}
                controls
                className="w-full rounded-lg mb-4"
              />
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 py-2 border-t">
              <span>{localPost.likes.length} likes</span>
              <div className="flex items-center space-x-3">
                <span>{comments.length} comments</span>
                <span>{localPost.shares.length} reposts</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-around border-t pt-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center ${
                  isLiked ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <ThumbsUp
                  className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 flex-1 justify-center">
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium" onClick={handleShare}>
                  Repost
                </span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 flex-1 justify-center">
                <Send className="h-5 w-5" />
                <span className="text-sm font-medium">Send</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">
              Comments ({comments.length})
            </h4>

            {/* Add Comment */}
            <div className="flex items-start space-x-3 mb-6">
              <img
                src={
                  profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.fullName}&background=0066cc&color=fff&size=40`
                }
                alt="Your avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No comments yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Be the first to comment!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    onCommentUpdate={fetchComments}
                    onCommentDelete={handleCommentDelete}
                  />
                ))}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
