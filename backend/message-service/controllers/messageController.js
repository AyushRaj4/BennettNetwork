const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipient, text } = req.body;
    const sender = req.user.id;

    if (!recipient || !text) {
      return res
        .status(400)
        .json({ message: "Recipient and message text are required" });
    }

    // Find or create conversation
    let conversation = await Conversation.findByParticipants(sender, recipient);

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

    res.status(201).json({
      message,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get conversation messages between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Find conversation
    const conversation = await Conversation.findByParticipants(
      currentUserId,
      userId
    );

    if (!conversation) {
      return res.status(200).json({ messages: [], conversationId: null });
    }

    // Get messages
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      messages,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ lastMessageTime: -1 });

    // Format conversations with other participant info
    const formattedConversations = conversations.map((conv) => {
      const otherUserId = conv.participants.find((p) => p !== userId);
      const unreadCount = conv.unreadCount.get(userId) || 0;

      return {
        _id: conv._id,
        otherUserId,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount,
      };
    });

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/conversation/:userId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Find conversation
    const conversation = await Conversation.findByParticipants(
      currentUserId,
      userId
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all unread messages as read
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

    // Reset unread count for current user
    conversation.unreadCount.set(currentUserId, 0);
    await conversation.save();

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender
    if (message.sender !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    await message.deleteOne();

    // Update conversation's last message if this was the last message
    const conversation = await Conversation.findById(message.conversationId);
    if (
      conversation &&
      conversation.lastMessage?.timestamp?.getTime() ===
        message.createdAt.getTime()
    ) {
      const lastMessage = await Message.findOne({
        conversationId: conversation._id,
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        conversation.lastMessage = {
          text: lastMessage.text,
          sender: lastMessage.sender,
          timestamp: lastMessage.createdAt,
        };
        conversation.lastMessageTime = lastMessage.createdAt;
      } else {
        conversation.lastMessage = null;
        conversation.lastMessageTime = conversation.createdAt;
      }
      await conversation.save();
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete entire conversation
// @route   DELETE /api/messages/conversation/:userId
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findByParticipants(
      currentUserId,
      userId
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: conversation._id });

    // Delete conversation
    await conversation.deleteOne();

    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage,
  deleteConversation,
};
