import {
  authApi,
  userApi,
  engagementApi,
  feedApi,
  networkApi,
  messageApi,
  notificationApi,
  newsApi,
} from "../utils/axios";

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: "student" | "professor" | "alumni";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface UserProfile {
  userId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  title?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    alternateEmail?: string;
  };
  studentInfo?: {
    rollNumber?: string;
    batch?: string;
    department?: string;
    semester?: number;
    cgpa?: number;
  };
  professorInfo?: {
    employeeId?: string;
    designation?: string;
    department?: string;
    specialization?: string[];
    qualifications?: string[];
  };
  alumniInfo?: {
    graduationYear?: number;
    degree?: string;
    department?: string;
    currentCompany?: string;
    currentPosition?: string;
    yearsOfExperience?: number;
  };
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
    researchGate?: string;
  };
  experience?: Array<{
    id?: string;
    title: string;
    company: string;
    employmentType?: string; // Full-time, Part-time, Contract, Internship, etc.
    location?: string;
    startDate: string; // ISO date string
    endDate?: string; // ISO date string, empty if current
    isCurrent?: boolean;
    description?: string;
  }>;
  activities?: Array<{
    id?: string;
    type: "post" | "article" | "achievement" | "event";
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    date: string; // ISO date string
    likes?: number;
    comments?: number;
    shares?: number;
  }>;
  featured?: Array<{
    id?: string;
    type: "post" | "article" | "project" | "certification";
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    date?: string;
  }>;
  stats?: {
    connections: number;
    posts: number;
    followers: number;
  };
}

// Auth API
export const authService = {
  register: async (data: RegisterData) => {
    const response = await authApi.post("/auth/register", data);
    return response.data.data; // Backend wraps response in {success, message, data}
  },

  login: async (data: LoginData) => {
    const response = await authApi.post("/auth/login", data);
    return response.data.data; // Backend wraps response in {success, message, data}
  },

  getMe: async () => {
    const response = await authApi.get("/auth/me");
    return response.data.data; // Backend wraps response in {success, message, data}
  },

  deleteAccount: async () => {
    const response = await authApi.delete("/auth/delete-account");
    return response.data; // Returns {success, message}
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  },

  forgotPassword: async (email: string) => {
    const response = await authApi.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyResetOTP: async (email: string, otp: string) => {
    const response = await authApi.post("/auth/verify-reset-otp", {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    const response = await authApi.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

// User Profile API
export const userService = {
  createProfile: async (data: Partial<UserProfile>) => {
    const response = await userApi.post("/users/profile", data);
    return response.data.data; // Backend wraps response in {success, message, data}
  },

  getMyProfile: async () => {
    const response = await userApi.get("/users/profile/me");
    return response.data.data; // Backend wraps response in {success, data}
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await userApi.put("/users/profile", data);
    return response.data.data; // Backend wraps response in {success, message, data}
  },

  getProfileById: async (userId: string) => {
    const response = await userApi.get(`/users/profile/${userId}`);
    return response.data.data; // Backend wraps response in {success, data}
  },
};

// Post interfaces
export interface Post {
  _id: string;
  userId: string;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  content: string;
  mediaType?: "none" | "image" | "video" | "document";
  mediaUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  mediaType?: string;
  mediaUrl?: string;
}

// Post API
export const postService = {
  createPost: async (data: CreatePostData) => {
    const response = await feedApi.post("/feed/posts", data);
    return response.data.data;
  },

  getFeed: async (page = 1, limit = 20) => {
    const response = await feedApi.get(
      `/feed/posts?page=${page}&limit=${limit}`
    );
    return response.data.data; // Feed service returns posts in data field
  },

  getPost: async (postId: string) => {
    const response = await feedApi.get(`/feed/posts/${postId}`);
    return response.data.data;
  },

  likePost: async (postId: string, postOwnerId?: string) => {
    const response = await engagementApi.post(`/engagement/like/${postId}`, {
      postOwnerId,
    });
    return response.data.data;
  },

  unlikePost: async (postId: string) => {
    const response = await engagementApi.delete(`/engagement/unlike/${postId}`);
    return response.data.data;
  },

  commentPost: async (postId: string, text: string) => {
    const response = await userApi.post(`/posts/${postId}/comment`, { text });
    return response.data.data;
  },

  sharePost: async (postId: string) => {
    const response = await userApi.post(`/posts/${postId}/share`);
    return response.data.data;
  },

  deletePost: async (postId: string) => {
    const response = await feedApi.delete(`/feed/posts/${postId}`);
    return response.data;
  },

  updatePost: async (
    postId: string,
    data: { content: string; mediaUrl?: string; mediaType?: string }
  ) => {
    const response = await feedApi.put(`/feed/posts/${postId}`, data);
    return response.data.data;
  },

  getUserPosts: async (userId: string, page = 1, limit = 10) => {
    const response = await feedApi.get(
      `/feed/posts/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },
};

// Comment interfaces
export interface Comment {
  _id: string;
  user: string;
  post: string;
  content: string;
  parentComment?: string | null;
  likes: Array<{
    userId: string;
    timestamp: string;
  }>;
  likesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  userDetails: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

export interface CreateCommentData {
  content: string;
  parentComment?: string;
  postOwnerId?: string;
}

// Comment/Engagement API
export const commentService = {
  createComment: async (postId: string, data: CreateCommentData) => {
    const response = await engagementApi.post(
      `/engagement/comment/${postId}`,
      data
    );
    return response.data.data;
  },

  getPostComments: async (
    postId: string,
    limit?: number,
    sortBy?: "date" | "likes"
  ) => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (sortBy) params.append("sortBy", sortBy);

    const response = await engagementApi.get(
      `/engagement/comments/${postId}${
        params.toString() ? "?" + params.toString() : ""
      }`
    );
    return response.data.data;
  },

  updateComment: async (commentId: string, content: string) => {
    const response = await engagementApi.put(
      `/engagement/comment/${commentId}`,
      { content }
    );
    return response.data.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await engagementApi.delete(
      `/engagement/comment/${commentId}`
    );
    return response.data;
  },

  likeComment: async (commentId: string) => {
    const response = await engagementApi.post(
      `/engagement/comment/${commentId}/like`
    );
    return response.data.data;
  },

  unlikeComment: async (commentId: string) => {
    const response = await engagementApi.delete(
      `/engagement/comment/${commentId}/unlike`
    );
    return response.data.data;
  },

  getCommentReplies: async (commentId: string) => {
    const response = await engagementApi.get(
      `/engagement/replies/${commentId}`
    );
    return response.data.data;
  },
};

// Network interfaces
export interface Connection {
  _id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSuggestion {
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  title?: string;
  role: string;
  studentInfo?: {
    department?: string;
    batch?: string;
  };
  professorInfo?: {
    department?: string;
    designation?: string;
  };
  alumniInfo?: {
    department?: string;
    currentCompany?: string;
  };
  matchScore?: number;
}

// Network API
export const networkService = {
  sendConnectionRequest: async (userId: string, message?: string) => {
    const response = await networkApi.post(`/network/connect/${userId}`, {
      message,
    });
    return response.data.data;
  },

  acceptConnectionRequest: async (connectionId: string) => {
    const response = await networkApi.put(`/network/accept/${connectionId}`);
    return response.data.data;
  },

  rejectConnectionRequest: async (connectionId: string) => {
    const response = await networkApi.put(`/network/reject/${connectionId}`);
    return response.data.data;
  },

  getConnections: async () => {
    const response = await networkApi.get("/network/connections");
    return response.data.data;
  },

  getPendingRequests: async () => {
    const response = await networkApi.get("/network/requests/pending");
    return response.data.data;
  },

  getSentRequests: async () => {
    const response = await networkApi.get("/network/requests/sent");
    return response.data.data;
  },

  getSuggestions: async () => {
    const response = await networkApi.get("/network/suggestions");
    return response.data.data;
  },

  removeConnection: async (connectionId: string) => {
    const response = await networkApi.delete(`/network/remove/${connectionId}`);
    return response.data;
  },
};

// Message interfaces
export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  text: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  otherUserId: string;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: string;
  };
  lastMessageTime: string;
  unreadCount: number;
}

export interface SendMessageData {
  recipient: string;
  text: string;
}

// Message API
export const messageService = {
  sendMessage: async (data: SendMessageData) => {
    const response = await messageApi.post("/messages/send", data);
    return response.data;
  },

  getConversations: async () => {
    const response = await messageApi.get("/messages/conversations");
    return response.data;
  },

  getConversation: async (userId: string) => {
    const response = await messageApi.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  markAsRead: async (userId: string) => {
    const response = await messageApi.put(
      `/messages/conversation/${userId}/read`
    );
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await messageApi.delete(`/messages/${messageId}`);
    return response.data;
  },

  deleteConversation: async (userId: string) => {
    const response = await messageApi.delete(
      `/messages/conversation/${userId}`
    );
    return response.data;
  },
};

// Notification interfaces
export interface Notification {
  _id: string;
  userId: string;
  type:
    | "LIKE"
    | "COMMENT"
    | "SHARE"
    | "CONNECTION_REQUEST"
    | "CONNECTION_ACCEPTED"
    | "MESSAGE"
    | "MENTION";
  content: string;
  read: boolean;
  relatedUserId?: string;
  relatedUserName?: string;
  relatedUserAvatar?: string;
  relatedId?: string;
  relatedData?: any;
  createdAt: string;
  updatedAt: string;
}

// Notification API
export const notificationService = {
  getNotifications: async (params?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.unreadOnly) queryParams.append("unreadOnly", "true");

    const response = await notificationApi.get(
      `/notifications${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
    );
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await notificationApi.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await notificationApi.put(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await notificationApi.put("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await notificationApi.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  },
};

// News Interface
export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  sourceUrl: string;
  publishedDate: string;
  category: string;
  source: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// News API
export const newsService = {
  getNews: async (params?: {
    category?: string;
    limit?: number;
    page?: number;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await newsApi.get(
      `/news${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    );
    return response.data;
  },

  getLatestNews: async () => {
    const response = await newsApi.get("/news/latest");
    return response.data;
  },

  getNewsById: async (id: string) => {
    const response = await newsApi.get(`/news/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await newsApi.get("/news/categories");
    return response.data;
  },

  getStats: async () => {
    const response = await newsApi.get("/news/stats");
    return response.data;
  },
};
