import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Lightbulb,
  TrendingUp,
  FileText,
  User,
  MessageSquare,
  Briefcase,
  Target,
  Zap,
} from "lucide-react";
import { aiService } from "../services/ai";
import type { ChatMessage } from "../services/ai";
import { userService } from "../services/api";

const Advisor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your AI Career Advisor. I can help you improve your profile, increase engagement, create better content, and provide career guidance. What would you like to work on today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeContext, setActiveContext] = useState<
    "general" | "profile" | "content" | "career"
  >("general");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await aiService.getChatHistory();
        console.log("Loaded chat history:", history);

        if (history && history.messages && history.messages.length > 0) {
          // Filter out any undefined or null messages
          const validMessages = history.messages.filter(
            (msg) => msg && msg.role && msg.content
          );

          if (validMessages.length > 0) {
            setMessages([
              {
                role: "assistant",
                content:
                  "👋 Welcome back! Here's our previous conversation. Feel free to continue or start a new topic.",
                timestamp: new Date().toISOString(),
              },
              ...validMessages,
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        // Keep the default welcome message on error
      }
    };

    loadHistory();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Add a placeholder message for streaming
    const placeholderMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, placeholderMessage]);

    try {
      let streamedContent = "";

      await aiService.chatStream(
        userMessage.content,
        activeContext,
        messages,
        null,
        (chunk) => {
          streamedContent += chunk;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: streamedContent,
            };
            return newMessages;
          });
        }
      );
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again. " +
            (error.message || ""),
          timestamp: new Date().toISOString(),
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleAnalyzeProfile = async () => {
    if (loading) return;
    setLoading(true);
    setActiveContext("profile");

    try {
      // Fetch full profile data
      const profileData = await userService.getMyProfile();

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content:
            "Please analyze my profile and give me detailed recommendations.",
          timestamp: new Date().toISOString(),
        },
      ]);

      const response = await aiService.analyzeProfile(profileData);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.analysis,
          timestamp: response.timestamp,
        },
      ]);

      // Extract key recommendations for the sidebar
      const lines = response.analysis.split("\n");
      const recs = lines
        .filter((line) => line.match(/^\d+\./) || line.match(/^[-•]/))
        .slice(0, 5);
      setRecommendations(recs);
    } catch (error: any) {
      console.error("Profile Analysis Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't analyze your profile. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (
    action: string,
    context: typeof activeContext
  ) => {
    if (loading) return;
    setActiveContext(context);
    setInput(action);

    // Simulate sending the message
    const userMessage: ChatMessage = {
      role: "user",
      content: action,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Add a placeholder message for streaming
    const placeholderMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, placeholderMessage]);

    try {
      let streamedContent = "";

      await aiService.chatStream(action, context, messages, null, (chunk) => {
        streamedContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: streamedContent,
          };
          return newMessages;
        });
      });
    } catch (error: any) {
      console.error("Quick Action Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const formatMessage = (content: string) => {
    // Split by newlines and format
    return content.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;

      // Bold headers (lines ending with :)
      if (line.match(/^[A-Z][^:]*:$/)) {
        return (
          <p key={i} className="font-semibold mt-3 mb-1">
            {line}
          </p>
        );
      }

      // Numbered or bulleted lists
      if (line.match(/^\d+\./) || line.match(/^[-•]/)) {
        return (
          <li key={i} className="ml-4 my-1">
            {line.replace(/^\d+\.\s*/, "").replace(/^[-•]\s*/, "")}
          </li>
        );
      }

      return (
        <p key={i} className="my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Career Advisor
            </h1>
          </div>
          <p className="text-gray-600">
            Get personalized advice to improve your profile, content strategy,
            and career growth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleAnalyzeProfile}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Analyze My Profile
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleQuickAction(
                      "How can I increase my reach and engagement on Bennett Connect?",
                      "content"
                    )
                  }
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Improve Reach
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleQuickAction(
                      "Give me 5 post ideas for a professional in my field to increase engagement.",
                      "content"
                    )
                  }
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Content Ideas
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleQuickAction(
                      "Help me write compelling bullet points for my recent work experience.",
                      "profile"
                    )
                  }
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Experience Templates
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleQuickAction(
                      "What are the best practices for professional networking on Bennett Connect?",
                      "career"
                    )
                  }
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Briefcase className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Networking Tips
                  </span>
                </button>
              </div>
            </div>

            {/* Context Selector */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                Focus Area
              </h3>
              <div className="space-y-2">
                {[
                  { value: "general", label: "General", icon: MessageSquare },
                  { value: "profile", label: "Profile", icon: User },
                  { value: "content", label: "Content", icon: FileText },
                  { value: "career", label: "Career", icon: Briefcase },
                ].map((ctx) => (
                  <button
                    key={ctx.value}
                    onClick={() => setActiveContext(ctx.value as any)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      activeContext === ctx.value
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ctx.icon className="h-4 w-4" />
                    <span className="text-sm">{ctx.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-6">
            <div
              className="bg-white rounded-lg shadow flex flex-col"
              style={{ height: "calc(100vh - 200px)" }}
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      AI Advisor Chat
                    </h2>
                    <p className="text-xs text-gray-500">
                      {activeContext.charAt(0).toUpperCase() +
                        activeContext.slice(1)}{" "}
                      advice
                    </p>
                  </div>
                  {loading && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {msg.content
                          ? formatMessage(msg.content)
                          : // Show typing indicator if content is empty and loading
                            loading &&
                            index === messages.length - 1 && (
                              <div className="flex items-center space-x-1">
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                ></div>
                              </div>
                            )}
                      </div>
                      {msg.timestamp && msg.content && (
                        <div
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me anything about your profile, career, or the platform..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recommendations */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Key Recommendations
              </h3>
              {recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 p-2 bg-purple-50 rounded border-l-2 border-purple-500"
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Analyze your profile to see personalized recommendations here.
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                💡 Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Post 2-3 times per week for optimal engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Use clear, measurable achievements in experience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Respond to comments within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Keep your headline under 120 characters</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Add relevant skills (aim for 10-15)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-4 text-white">
              <h3 className="font-semibold mb-2">🚀 Pro Tip</h3>
              <p className="text-sm opacity-90">
                Profiles with complete information get 40% more profile views
                and 2x more connection requests!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advisor;
