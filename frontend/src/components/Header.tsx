import {
  Search,
  Home,
  Users,
  MessageSquare,
  Bell,
  Menu,
  GraduationCap,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { networkService, notificationService } from "../services/api";

interface SearchResult {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  avatar?: string;
  role: string;
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [lastVisitedHome, setLastVisitedHome] = useState(() => {
    // Get last visit from localStorage or use a time from 1 hour ago
    const stored = localStorage.getItem("lastVisitedHome");
    return stored ? parseInt(stored) : Date.now() - 3600000;
  });

  // Search functionality
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2 || !isAuthenticated) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3002/api/users/search?q=${encodeURIComponent(
            searchQuery
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isAuthenticated]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchResultClick = (userId: string) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    setSearchResults([]);
    navigate(`/user/${userId}`);
  };

  // Fetch pending connection requests count
  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      if (isAuthenticated) {
        try {
          const requests = await networkService.getPendingRequests();
          setPendingRequestsCount(requests.length);
        } catch (error) {
          console.error("Error fetching pending requests:", error);
        }
      }
    };

    fetchPendingRequestsCount();

    // Listen for custom event when requests are updated
    const handleRequestsUpdate = () => {
      fetchPendingRequestsCount();
    };
    window.addEventListener("networkRequestsUpdated", handleRequestsUpdate);

    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingRequestsCount, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "networkRequestsUpdated",
        handleRequestsUpdate
      );
    };
  }, [isAuthenticated]);

  // Fetch unread notification count and setup Socket.io
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const { count } = await notificationService.getUnreadCount();
        setUnreadNotifications(count);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadCount();

    // Setup Socket.io for real-time notifications
    const token = localStorage.getItem("token");
    if (token) {
      const socket: Socket = io("http://localhost:3008", {
        auth: { token },
      });

      socket.on("connect", () => {
        console.log("✅ Connected to notification service");
      });

      socket.on("new_notification", (notification) => {
        console.log("🔔 New notification received:", notification);
        setUnreadNotifications((prev) => prev + 1);
        fetchUnreadCount(); // Refresh count
      });

      socket.on("notification_read", () => {
        console.log("📖 Notification read event");
        fetchUnreadCount(); // Refresh count
      });

      socket.on("notifications_updated", () => {
        console.log("🔄 Notifications updated event");
        fetchUnreadCount(); // Refresh count when notifications are updated
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from notification service");
      });

      socket.on("connect_error", (error) => {
        console.error("🚫 Socket connection error:", error);
      });

      return () => {
        socket.disconnect();
      };
    }

    // Also refresh count every 5 seconds to catch any changes
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Fetch unread messages count and setup Socket.io for messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3007/api/messages/conversations",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch messages:", response.status);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Expected JSON response but got:", contentType);
          return;
        }

        const data = await response.json();
        const totalUnread = data.reduce(
          (sum: number, conv: any) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadMessages(totalUnread);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadMessages();

    // Setup Socket.io for real-time message notifications
    const token = localStorage.getItem("token");
    if (token) {
      const socket: Socket = io("http://localhost:3007", {
        auth: { token },
      });

      socket.on("receive_message", () => {
        // Increment unread count if not on messages page
        if (location.pathname !== "/messages") {
          fetchUnreadMessages();
        }
      });

      return () => {
        socket.disconnect();
      };
    }

    // Refresh count every 10 seconds
    const interval = setInterval(fetchUnreadMessages, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, location.pathname]);

  // Track when user visits home page and check for new posts
  useEffect(() => {
    if (location.pathname === "/") {
      setHasNewPosts(false);
      const now = Date.now();
      setLastVisitedHome(now);
      localStorage.setItem("lastVisitedHome", now.toString());
    }
  }, [location.pathname]);

  // Check for new posts periodically when not on home page
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkNewPosts = async () => {
      try {
        const response = await fetch("http://localhost:3006/api/feed", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch feed:", response.status);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Expected JSON response but got:", contentType);
          return;
        }

        const data = await response.json();
        const posts = data.data || [];

        // Check if there are posts newer than last visit
        const hasNew = posts.some((post: any) => {
          const postTime = new Date(post.createdAt).getTime();
          const isNewer = postTime > lastVisitedHome;
          return isNewer;
        });

        if (location.pathname !== "/") {
          setHasNewPosts(hasNew);
        }
      } catch (error) {
        console.error("Error checking for new posts:", error);
      }
    };

    // Check immediately on mount and when changing pages
    checkNewPosts();
    const interval = setInterval(checkNewPosts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname, lastVisitedHome]);

  // Helper function to check if the link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `flex flex-col items-center px-4 py-2 transition-colors group relative ${
      active ? "text-[#0066cc]" : "text-gray-700 hover:text-[#0066cc]"
    }`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-[#0066cc] p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">Bennett</div>
                <div className="text-xs text-gray-500">University Network</div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students, professors, alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() =>
                  searchQuery.length >= 2 && setShowSearchDropdown(true)
                }
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-md focus:outline-none focus:bg-white focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
              />

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.userId}
                          onClick={() => handleSearchResultClick(result.userId)}
                          className="w-full px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        >
                          <img
                            src={
                              result.avatar ||
                              `https://ui-avatars.com/api/?name=${result.firstName}+${result.lastName}&background=0066cc&color=fff`
                            }
                            alt={`${result.firstName} ${result.lastName}`}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900">
                              {result.firstName} {result.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {result.title}
                              {result.role && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                  {result.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <Link to="/" className={getLinkClasses("/")}>
              <div className="relative">
                <Home className="h-6 w-6 mb-1" />
                {hasNewPosts && !isActive("/") && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3.5 h-3.5 border-2 border-white"></span>
                )}
              </div>
              <span className="text-xs font-medium">Home</span>
              {isActive("/") && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066cc] rounded-t-md"></div>
              )}
            </Link>
            <Link to="/network" className={getLinkClasses("/network")}>
              <Users className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Network</span>
              {pendingRequestsCount > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
              {isActive("/network") && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066cc] rounded-t-md"></div>
              )}
            </Link>
            <Link to="/advisor" className={getLinkClasses("/advisor")}>
              <Sparkles className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">AI Advisor</span>
              {isActive("/advisor") && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066cc] rounded-t-md"></div>
              )}
            </Link>
            <Link to="/messages" className={getLinkClasses("/messages")}>
              <div className="relative">
                <MessageSquare className="h-6 w-6 mb-1" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3.5 h-3.5 border-2 border-white"></span>
                )}
              </div>
              <span className="text-xs font-medium">Messages</span>
              {isActive("/messages") && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066cc] rounded-t-md"></div>
              )}
            </Link>
            <Link
              to="/notifications"
              className={getLinkClasses("/notifications")}
            >
              <Bell className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
              {isActive("/notifications") && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0066cc] rounded-t-md"></div>
              )}
            </Link>
          </nav>

          {/* User Profile or Login */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <img
                    src={
                      profile?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.fullName
                      )}&background=0066cc&color=fff`
                    }
                    alt={user.fullName}
                    className={`w-8 h-8 rounded-full border-2 ${
                      isActive("/profile")
                        ? "border-[#0066cc] ring-2 ring-[#0066cc]/30"
                        : "border-[#0066cc]"
                    }`}
                  />
                  <div className="text-left">
                    <div
                      className={`text-xs font-medium ${
                        isActive("/profile")
                          ? "text-[#0066cc]"
                          : "text-gray-900"
                      }`}
                    >
                      Me
                    </div>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
