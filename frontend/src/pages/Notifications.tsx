import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Mail,
  AtSign,
  Bell,
  Check,
  Trash2,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/api";

interface Notification {
  _id: string;
  userId: string;
  type: string;
  content: string;
  read: boolean;
  relatedUserId?: string;
  relatedUserName?: string;
  relatedUserAvatar?: string;
  relatedId?: string;
  createdAt: string;
}

const Notifications = () => {
  useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    loadNotifications();

    const token = localStorage.getItem("token");
    if (token) {
      const newSocket: Socket = io("http://localhost:3008", {
        auth: { token },
      });

      newSocket.on("connect", () => {
        console.log("✅ Notifications page connected to notification service");
      });

      newSocket.on("new_notification", (notification: Notification) => {
        console.log(
          "🔔 New notification received on Notifications page:",
          notification
        );
        setNotifications((prev) => [notification, ...prev]);
      });

      newSocket.on("disconnect", () => {
        console.log(
          "❌ Notifications page disconnected from notification service"
        );
      });

      newSocket.on("connect_error", (error) => {
        console.error("🚫 Notifications page socket connection error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({
        limit: 50,
        unreadOnly: filter === "unread",
      });
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      console.log(
        "✅ Notification marked as read, emitting notifications_updated"
      );
      // Emit event to update header count
      socket?.emit("notifications_updated");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      console.log(
        "✅ All notifications marked as read, emitting notifications_updated"
      );
      // Emit event to update header count
      socket?.emit("notifications_updated");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      console.log("✅ Notification deleted, emitting notifications_updated");
      // Emit event to update header count
      socket?.emit("notifications_updated");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "COMMENT":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "SHARE":
        return <Share2 className="h-5 w-5 text-green-500" />;
      case "CONNECTION_REQUEST":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case "CONNECTION_ACCEPTED":
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case "MESSAGE":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "MENTION":
        return <AtSign className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setFilter("all")}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                filter === "all"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              All {notifications.length > 0 && `(${notifications.length})`}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                filter === "unread"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
                  !notification.read ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {notification.relatedUserAvatar ? (
                      <img
                        src={notification.relatedUserAvatar}
                        alt={notification.relatedUserName || "User"}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-900">
                        {notification.content}
                      </p>
                      <div className="shrink-0 flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-1 hover:bg-blue-50 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="p-1 bg-gray-100 rounded">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-gray-500">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "When you get notifications, they'll show up here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
