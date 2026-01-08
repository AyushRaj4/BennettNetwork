require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/database");
const messageRoutes = require("./routes/messageRoutes");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

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
app.use("/api/messages", messageRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "message-service" });
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
  console.log(`User connected: ${socket.userId}`);

  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);

  // Broadcast online status
  io.emit("user_status", { userId: socket.userId, online: true });

  // Join user's personal room
  socket.join(socket.userId);

  // Send message
  socket.on("send_message", async (data) => {
    try {
      const { recipient, text } = data;
      const sender = socket.userId;

      // Find or create conversation
      let conversation = await Conversation.findByParticipants(
        sender,
        recipient
      );

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [sender, recipient],
          unreadCount: {
            [sender]: 0,
            [recipient]: 0,
          },
        });
      }

      // Create message
      const message = await Message.create({
        conversationId: conversation._id,
        sender,
        recipient,
        text,
      });

      // Update conversation
      conversation.lastMessage = {
        text,
        sender,
        timestamp: message.createdAt,
      };
      conversation.lastMessageTime = message.createdAt;

      // Increment unread count for recipient
      const unreadCount = conversation.unreadCount.get(recipient) || 0;
      conversation.unreadCount.set(recipient, unreadCount + 1);

      await conversation.save();

      // Emit to sender (confirmation)
      socket.emit("message_sent", {
        message,
        conversationId: conversation._id,
      });

      // Emit to recipient if online
      io.to(recipient).emit("receive_message", {
        message,
        conversationId: conversation._id,
      });
    } catch (error) {
      console.error("Socket send_message error:", error);
      socket.emit("message_error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { recipient } = data;
    io.to(recipient).emit("user_typing", { userId: socket.userId });
  });

  socket.on("stop_typing", (data) => {
    const { recipient } = data;
    io.to(recipient).emit("user_stop_typing", { userId: socket.userId });
  });

  // Mark messages as read
  socket.on("mark_read", async (data) => {
    try {
      const { userId } = data;
      const currentUserId = socket.userId;

      const conversation = await Conversation.findByParticipants(
        currentUserId,
        userId
      );

      if (conversation) {
        await Message.updateMany(
          {
            conversationId: conversation._id,
            recipient: currentUserId,
            read: false,
          },
          {
            read: true,
            readAt: new Date(),
          }
        );

        conversation.unreadCount.set(currentUserId, 0);
        await conversation.save();

        // Notify sender that messages were read
        io.to(userId).emit("messages_read", { userId: currentUserId });
      }
    } catch (error) {
      console.error("Socket mark_read error:", error);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);

    // Broadcast offline status
    io.emit("user_status", { userId: socket.userId, online: false });
  });
});

const PORT = process.env.PORT || 3007;

server.listen(PORT, () => {
  console.log(`Message service running on port ${PORT}`);
});

module.exports = { app, server, io };
