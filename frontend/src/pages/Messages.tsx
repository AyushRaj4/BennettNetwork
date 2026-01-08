import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  UserPlus,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { networkService, messageService } from "../services/api";

const Messages = () => {
  const { user } = useAuth(); // Ensure user is authenticated
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectionSearch, setShowConnectionSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:3007", {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to message service");
    });

    socket.on("receive_message", (data) => {
      const { message } = data;
      // Add message to chat if it's for the current conversation
      if (
        message.sender === selectedChat ||
        message.recipient === selectedChat
      ) {
        setChatMessages((prev) => [...prev, message]);

        // If the chat is currently open, mark messages as read immediately
        if (selectedChat === message.sender) {
          messageService.markAsRead(message.sender).catch(console.error);
        }
      }

      // Update conversation list
      loadConversations();
    });

    socket.on("user_status", (data) => {
      const { userId, online } = data;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (online) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socket.on("messages_read", (data) => {
      // Handle read receipts if needed
      console.log("Messages read by:", data.userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedChat]);

  // Load conversations and connections
  useEffect(() => {
    loadConnections();
    loadConversations();
  }, []);

  // Handle opening chat from navigation (e.g., from Network page)
  useEffect(() => {
    if (location.state?.userId && conversations.length > 0) {
      const userId = location.state.userId;
      // Check if conversation exists
      const existingConv = conversations.find((c) => c.userId === userId);

      if (existingConv) {
        // Open existing conversation
        setSelectedChat(userId);
        loadChatMessages(userId);
      } else {
        // Need to create new conversation - find user in connections
        const connection = connections.find((c: any) => c.userId === userId);
        if (connection) {
          // Create new conversation entry
          const newConv = {
            userId: connection.userId,
            name: `${connection.firstName} ${connection.lastName}`,
            avatar: connection.avatar,
            lastMessage: "",
            timestamp: new Date().toISOString(),
            unread: 0,
            online: false,
          };
          setConversations([newConv, ...conversations]);
          setSelectedChat(userId);
          setChatMessages([]);
        }
      }

      // Clear the navigation state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations, connections]);

  const loadConversations = async () => {
    try {
      const conversationsData = await messageService.getConversations();

      // Fetch connections once to avoid multiple API calls
      const connections = await networkService.getConnections();

      // Fetch user details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv: any) => {
          try {
            // Find the connection for this conversation
            const connection = connections.find(
              (c: any) => c.userId === conv.otherUserId
            );

            if (connection) {
              return {
                id: conv._id,
                userId: conv.otherUserId,
                name:
                  `${connection.firstName || ""} ${
                    connection.lastName || ""
                  }`.trim() ||
                  connection.username ||
                  "Unknown User",
                avatar:
                  connection.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${connection.firstName || ""} ${
                      connection.lastName || ""
                    }`.trim() || "User"
                  )}&background=0066cc&color=fff&size=128`,
                lastMessage: conv.lastMessage?.text || "",
                time: formatTime(conv.lastMessageTime),
                unread: conv.unreadCount || 0,
                online: onlineUsers.has(conv.otherUserId),
              };
            } else {
              // If no connection found, return with Unknown User
              return {
                id: conv._id,
                userId: conv.otherUserId,
                name: "Unknown User",
                avatar: `https://ui-avatars.com/api/?name=Unknown+User&background=0066cc&color=fff&size=128`,
                lastMessage: conv.lastMessage?.text || "",
                time: formatTime(conv.lastMessageTime),
                unread: conv.unreadCount || 0,
                online: onlineUsers.has(conv.otherUserId),
              };
            }
          } catch (error) {
            console.error("Error processing conversation:", error);
            return null;
          }
        })
      );

      setConversations(conversationsWithDetails.filter((c) => c !== null));
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConnections = async () => {
    try {
      setLoading(true);
      const connectionsData = await networkService.getConnections();
      setConnections(connectionsData);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
      // Mark messages as read
      messageService
        .markAsRead(selectedChat)
        .then(() => {
          // Update the conversation's unread count to 0
          setConversations((prev) =>
            prev.map((conv) =>
              conv.userId === selectedChat ? { ...conv, unread: 0 } : conv
            )
          );
        })
        .catch(console.error);
    }
  }, [selectedChat]);

  const loadChatMessages = async (userId: string) => {
    try {
      const { messages } = await messageService.getConversation(userId);
      setChatMessages(messages);
    } catch (error) {
      console.error("Error loading chat messages:", error);
      setChatMessages([]);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = connections.filter((conn: any) => {
        const fullName = `${conn.firstName || ""} ${
          conn.lastName || ""
        }`.trim();
        const username = conn.username || "";
        return (
          fullName.toLowerCase().includes(query.toLowerCase()) ||
          username.toLowerCase().includes(query.toLowerCase())
        );
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectConnection = (connection: any) => {
    // Check if conversation exists
    const existingConv = conversations.find(
      (c) => c.userId === connection.userId
    );

    if (!existingConv) {
      const fullName = `${connection.firstName || ""} ${
        connection.lastName || ""
      }`.trim();
      const displayName = fullName || connection.username || "Unknown User";

      // Create new conversation
      const newConv = {
        id: connection.userId,
        userId: connection.userId,
        name: displayName,
        avatar:
          connection.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
          )}&background=0066cc&color=fff&size=128`,
        lastMessage: "Start a conversation...",
        time: "now",
        unread: 0,
        online: false,
      };
      setConversations([newConv, ...conversations]);
    }

    setSelectedChat(connection.userId);
    setShowConnectionSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const selectedConversation = conversations.find(
    (c) => c.userId === selectedChat
  );

  const handleSend = async () => {
    if (messageText.trim() && selectedChat && user) {
      const textToSend = messageText;
      setMessageText(""); // Clear input immediately for better UX

      try {
        // Send via REST API - server will handle Socket.io broadcast
        const response = await messageService.sendMessage({
          recipient: selectedChat,
          text: textToSend,
        });

        // Extract message from response (API returns { message, conversationId })
        const sentMessage = response.message || response;

        // Add message to local state immediately
        setChatMessages((prev) => [...prev, sentMessage]);

        // Update conversation list
        loadConversations();
      } catch (error) {
        console.error("Error sending message:", error);
        // Restore text on error
        setMessageText(textToSend);
      }
    }
  };

  const filteredConversations =
    searchQuery && !showConnectionSearch
      ? conversations.filter((conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : conversations;

  return (
    <div className="bg-gray-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-80px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Messages
              </h2>
              <div className="space-y-3">
                {/* Search messages input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowConnectionSearch(false);
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
                  />
                </div>

                {/* New chat button */}
                <button
                  onClick={() => setShowConnectionSearch(!showConnectionSearch)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            {/* Conversations or Connection Search */}
            <div className="flex-1 overflow-y-auto">
              {showConnectionSearch ? (
                <>
                  {/* Search connections */}
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Start a conversation with your connections
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search connections..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
                      />
                    </div>
                  </div>

                  {/* Connection list for new chat */}
                  {(searchQuery ? searchResults : connections).map(
                    (connection: any) => (
                      <div
                        key={connection.userId}
                        onClick={() => handleSelectConnection(connection)}
                        className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              connection.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                `${connection.firstName || ""} ${
                                  connection.lastName || ""
                                }`.trim() || "User"
                              )}&background=0066cc&color=fff&size=128`
                            }
                            alt={`${connection.firstName || ""} ${
                              connection.lastName || ""
                            }`.trim()}
                            className="w-12 h-12 rounded-full border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {`${connection.firstName || ""} ${
                                connection.lastName || ""
                              }`.trim() ||
                                connection.username ||
                                "Unknown User"}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {connection.title ||
                                connection.role ||
                                "Connection"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {searchQuery && searchResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <p>No connections found</p>
                    </div>
                  )}

                  {!searchQuery && connections.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No connections yet</p>
                      <p className="text-sm">
                        Connect with people to start messaging
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Conversations list */}
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.userId}
                      onClick={() => setSelectedChat(conv.userId)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedChat === conv.userId
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img
                            src={conv.avatar}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full border-2 border-gray-200"
                          />
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conv.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conv.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conv.lastMessage}
                            </p>
                            {conv.unread > 0 && (
                              <span className="ml-2 bg-[#0066cc] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredConversations.length === 0 && searchQuery && (
                    <div className="p-8 text-center text-gray-500">
                      <p>No conversations found</p>
                    </div>
                  )}

                  {conversations.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">
                      <Send className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium mb-1">No conversations yet</p>
                      <p className="text-sm">
                        Click "New Chat" to start messaging your connections
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">
                        Loading conversations...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        className="w-12 h-12 rounded-full border-2 border-[#0066cc]"
                      />
                      {selectedConversation.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedConversation.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.online ? "Active now" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Video className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 min-h-0">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg: any) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.sender === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            msg.sender === user?.id
                              ? "bg-[#0066cc] text-white"
                              : "bg-white text-gray-900 shadow-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === user?.id
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500">
                        <Send className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Paperclip className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ImageIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
                    />
                    <button
                      onClick={handleSend}
                      className="p-3 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-full transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">
                    No conversation selected
                  </p>
                  <p className="text-sm">
                    Choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
