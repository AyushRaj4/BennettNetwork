import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";
const USER_SERVICE_URL = "http://localhost:3002/api";
const NETWORK_SERVICE_URL = "http://localhost:3004/api";
const ENGAGEMENT_SERVICE_URL = "http://localhost:3005/api";
const FEED_SERVICE_URL = "http://localhost:3006/api";
const MESSAGE_SERVICE_URL = "http://localhost:3007/api";
const NOTIFICATION_SERVICE_URL = "http://localhost:3008/api";
const NEWS_SERVICE_URL = "http://localhost:3011/api";

// Create axios instance for auth service
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for user service
export const userApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for network service
export const networkApi = axios.create({
  baseURL: NETWORK_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for engagement service
export const engagementApi = axios.create({
  baseURL: ENGAGEMENT_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for feed service
export const feedApi = axios.create({
  baseURL: FEED_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for message service
export const messageApi = axios.create({
  baseURL: MESSAGE_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for notification service
export const notificationApi = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for news service
export const newsApi = axios.create({
  baseURL: NEWS_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

networkApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

engagementApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

feedApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

messageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from auth service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from user service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

networkApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from network service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

engagementApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from engagement service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

feedApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from feed service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

messageApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from message service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

notificationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error responses
    if (
      error.response &&
      typeof error.response.data === "string" &&
      error.response.data.includes("<!DOCTYPE")
    ) {
      console.error(
        "Received HTML error page instead of JSON from notification service"
      );
      error.message = "Service temporarily unavailable";
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
