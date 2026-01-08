import { useState } from "react";
import { ThumbsUp, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Comment as CommentType } from "../services/api";
import { commentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

interface CommentProps {
  comment: CommentType;
  onCommentUpdate?: () => void;
  onCommentDelete?: (commentId: string) => void;
}

const Comment = ({
  comment,
  onCommentUpdate,
  onCommentDelete,
}: CommentProps) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [localComment, setLocalComment] = useState(comment);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatTimestamp = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const handleLike = async () => {
    if (isLiking || !profile) return;

    try {
      setIsLiking(true);
      const isLiked = localComment.likes.some(
        (like) => like.userId === profile.userId
      );

      if (isLiked) {
        await commentService.unlikeComment(localComment._id);
        setLocalComment({
          ...localComment,
          likes: localComment.likes.filter(
            (like) => like.userId !== profile.userId
          ),
          likesCount: localComment.likesCount - 1,
        });
      } else {
        await commentService.likeComment(localComment._id);
        setLocalComment({
          ...localComment,
          likes: [
            ...localComment.likes,
            { userId: profile.userId, timestamp: new Date().toISOString() },
          ],
          likesCount: localComment.likesCount + 1,
        });
      }

      // Don't call onCommentUpdate for likes - it causes unnecessary page refresh
      // The like count is already updated in local state above
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await commentService.deleteComment(localComment._id);
      if (onCommentDelete) {
        onCommentDelete(localComment._id);
      }
      if (onCommentUpdate) {
        onCommentUpdate();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const isLiked = profile
    ? localComment.likes.some((like) => like.userId === profile.userId)
    : false;
  const isOwner = profile && localComment.user === profile.userId;

  return (
    <div className="flex items-start space-x-3 py-3">
      <img
        src={
          localComment.userDetails.avatar ||
          `https://ui-avatars.com/api/?name=${localComment.userDetails.name}&background=0066cc&color=fff&size=40`
        }
        alt={localComment.userDetails.name}
        className="w-10 h-10 rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/user/${localComment.user}`)}
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <h4
              className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => navigate(`/user/${localComment.user}`)}
            >
              {localComment.userDetails.name}
            </h4>
            {localComment.userDetails.title && (
              <span className="text-xs text-gray-600">
                • {localComment.userDetails.title}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 mt-1 whitespace-pre-line wrap-break-word">
            {localComment.content}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-1 px-3">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`text-xs font-medium hover:underline ${
              isLiked ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {isLiked ? "Liked" : "Like"}
          </button>
          {localComment.likesCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <ThumbsUp
                className={`h-3 w-3 ${
                  isLiked ? "fill-blue-600 text-blue-600" : ""
                }`}
              />
              <span>{localComment.likesCount}</span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            {formatTimestamp(localComment.createdAt)}
          </span>
          {localComment.isEdited && (
            <span className="text-xs text-gray-500">(edited)</span>
          )}
          {isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="text-xs font-medium text-red-600 hover:underline flex items-center space-x-1"
            >
              <Trash2 className="h-3 w-3" />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Comment;
