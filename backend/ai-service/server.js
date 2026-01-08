const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./config/database");
const ChatSession = require("./models/ChatSession");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  general: `You are an AI advisor for Bennett Connect, a professional networking platform similar to LinkedIn. 
Your role is to help users:
- Improve their profiles (headline, summary, experience descriptions)
- Increase their reach and engagement on the platform
- Follow best practices for professional networking
- Get career guidance and professional development advice
- Learn platform features and etiquette

Always be helpful, concise, and actionable. Format your responses clearly with bullet points when appropriate.`,

  profile: `You are a profile optimization expert for Bennett Connect. Analyze user profiles and provide specific, actionable recommendations to:
- Improve profile completeness and attractiveness
- Enhance professional headline and summary
- Better showcase experience and skills
- Increase profile views and connection requests
- Stand out to recruiters and potential connections

Be specific and prioritize the most impactful changes first.`,

  content: `You are a content strategy advisor for Bennett Connect. Help users:
- Create engaging posts that increase visibility
- Build thought leadership in their field
- Improve engagement (likes, comments, shares)
- Develop a consistent posting strategy
- Write compelling headlines and hooks

Provide specific examples and templates when possible.`,

  career: `You are a career advisor helping professionals on Bennett Connect. Provide guidance on:
- Career transitions and progression
- Skill development and learning paths
- Industry trends and opportunities
- Professional branding and positioning
- Networking strategies for career growth

Be empathetic, realistic, and provide concrete next steps.`,
};

// Chat endpoint
app.post("/api/ai/chat", auth, async (req, res) => {
  try {
    const {
      message,
      context = "general",
      conversationHistory = [],
      profileData = null,
    } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or create chat session for this user
    let chatSession = await ChatSession.findOne({ userId });
    if (!chatSession) {
      chatSession = new ChatSession({ userId, messages: [] });
    }

    // Save user message
    chatSession.messages.push({
      role: "user",
      content: message,
      context,
      timestamp: new Date(),
    });
    chatSession.lastActivity = new Date();

    // Get the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Build the conversation context
    let prompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;
    prompt += "\n\n";

    // Add profile data if analyzing profile
    if (profileData) {
      prompt += `User's Profile Data:\n`;
      prompt += `Name: ${profileData.firstName} ${profileData.lastName}\n`;
      if (profileData.headline) prompt += `Headline: ${profileData.headline}\n`;
      if (profileData.about) prompt += `About: ${profileData.about}\n`;
      if (profileData.location) prompt += `Location: ${profileData.location}\n`;
      if (profileData.experience && profileData.experience.length > 0) {
        prompt += `\nExperience:\n`;
        profileData.experience.forEach((exp, i) => {
          prompt += `${i + 1}. ${exp.title} at ${exp.company}`;
          if (exp.description) prompt += `\n   ${exp.description}`;
          prompt += "\n";
        });
      }
      if (profileData.skills && profileData.skills.length > 0) {
        prompt += `\nSkills: ${profileData.skills.join(", ")}\n`;
      }
      prompt += "\n";
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      prompt += "Conversation History:\n";
      conversationHistory.forEach((msg) => {
        prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${
          msg.content
        }\n`;
      });
      prompt += "\n";
    }

    // Add current message
    prompt += `User: ${message}\nAssistant:`;

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Generate streaming response
    const result = await model.generateContentStream(prompt);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      // Send each chunk as Server-Sent Event
      res.write(
        `data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`
      );
    }

    // Save assistant response to database
    chatSession.messages.push({
      role: "assistant",
      content: fullText,
      context,
      timestamp: new Date(),
    });
    await chatSession.save();

    // Send final message
    res.write(
      `data: ${JSON.stringify({ chunk: "", done: true, fullText })}\n\n`
    );
    res.end();
  } catch (error) {
    console.error("AI Chat Error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to get AI response",
        details: error.message,
      });
    } else {
      res.write(
        `data: ${JSON.stringify({ error: error.message, done: true })}\n\n`
      );
      res.end();
    }
  }
});

// Get chat history for a user
app.get("/api/ai/history", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const chatSession = await ChatSession.findOne({ userId });

    if (!chatSession) {
      return res.json({ messages: [] });
    }

    res.json({
      messages: chatSession.messages,
      lastActivity: chatSession.lastActivity,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Delete chat history for a user
app.delete("/api/ai/history", auth, async (req, res) => {
  try {
    const userId = req.userId;
    await ChatSession.deleteOne({ userId });

    res.json({ success: true, message: "Chat history deleted" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ error: "Failed to delete chat history" });
  }
});

// Delete all chats for a user (called when account is deleted)
app.delete("/api/ai/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // This endpoint should be called internally from auth service
    // Add API key validation for security
    const apiKey = req.header("X-API-Key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await ChatSession.deleteMany({ userId });

    res.json({
      success: true,
      message: `All chat history deleted for user ${userId}`,
    });
  } catch (error) {
    console.error("Error deleting user chats:", error);
    res.status(500).json({ error: "Failed to delete user chats" });
  }
});

// Analyze profile endpoint
app.post("/api/ai/analyze-profile", auth, async (req, res) => {
  try {
    const { profileData } = req.body;

    if (!profileData) {
      return res.status(400).json({ error: "Profile data is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    let prompt = SYSTEM_PROMPTS.profile + "\n\n";
    prompt += `Analyze this profile and provide a detailed assessment with specific recommendations:\n\n`;
    prompt += `Name: ${profileData.firstName} ${profileData.lastName}\n`;
    if (profileData.headline) prompt += `Headline: ${profileData.headline}\n`;
    if (profileData.about) prompt += `About: ${profileData.about}\n`;
    if (profileData.location) prompt += `Location: ${profileData.location}\n`;

    if (profileData.experience && profileData.experience.length > 0) {
      prompt += `\nExperience:\n`;
      profileData.experience.forEach((exp, i) => {
        prompt += `${i + 1}. ${exp.title} at ${exp.company}\n`;
        if (exp.description) prompt += `   Description: ${exp.description}\n`;
      });
    }

    if (profileData.skills && profileData.skills.length > 0) {
      prompt += `\nSkills: ${profileData.skills.join(", ")}\n`;
    }

    prompt += `\nProvide:\n1. Overall profile score (1-10)\n2. Top 3 strengths\n3. Top 5 improvements (prioritized)\n4. Specific suggestions for each section\n5. Quick wins (changes that take <5 minutes)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      analysis: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Profile Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze profile",
      details: error.message,
    });
  }
});

// Get content suggestions
app.post("/api/ai/content-ideas", auth, async (req, res) => {
  try {
    const { industry, interests, recentTopics } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    let prompt = SYSTEM_PROMPTS.content + "\n\n";
    prompt += `Generate 5 engaging post ideas for a professional in:\n`;
    if (industry) prompt += `Industry: ${industry}\n`;
    if (interests) prompt += `Interests: ${interests.join(", ")}\n`;
    if (recentTopics) prompt += `Recent topics: ${recentTopics.join(", ")}\n`;
    prompt += `\nFor each idea, provide:\n- A compelling headline\n- Key points to cover\n- Why it will engage the audience\n- Best time to post`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      ideas: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content Ideas Error:", error);
    res.status(500).json({
      error: "Failed to generate content ideas",
      details: error.message,
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "AI Advisor Service" });
});

app.listen(PORT, () => {
  console.log(`🤖 AI Advisor Service running on port ${PORT}`);
});
