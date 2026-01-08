require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");
const notificationRoutes = require("./routes/notificationRoutes");
const jwt = require("jsonwebtoken");

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "notification-service" });
});

// Store online users
const onlineUsers = new Map(); // userId -> socketId

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected to notifications: ${socket.userId}`);

  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);

  // Join user's personal notification room
  socket.join(socket.userId);

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected from notifications: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
  });
});

// Export io for use in controllers if needed
app.set("io", io);

const PORT = process.env.PORT || 3008;

server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = { app, server, io };
