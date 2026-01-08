import axios from "axios";

const AI_API_URL = "http://localhost:3010";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  timestamp: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: string;
  timestamp: string;
}

export interface ContentIdeasResponse {
  success: boolean;
  ideas: string;
  timestamp: string;
}

export const aiService = {
  // Send a chat message to AI with streaming
  async chatStream(
    message: string,
    context: "general" | "profile" | "content" | "career" = "general",
    conversationHistory: ChatMessage[] = [],
    profileData: any = null,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const url = `${AI_API_URL}/api/ai/chat`;
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        context,
        conversationHistory,
        profileData,
      }),
    });

    if (!response.ok) throw new Error("AI request failed");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.chunk) {
                fullText += data.chunk;
                onChunk(data.chunk);
              }
              if (data.done) {
                return fullText || data.fullText;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    return fullText;
  },

  // Send a chat message to AI (non-streaming fallback)
  async chat(
    message: string,
    context: "general" | "profile" | "content" | "career" = "general",
    conversationHistory: ChatMessage[] = [],
    profileData: any = null
  ): Promise<ChatResponse> {
    const url = `${AI_API_URL}/api/ai/chat`;
    const response = await axios.post(url, {
      message,
      context,
      conversationHistory,
      profileData,
    });
    return response.data;
  },

  // Analyze user profile
  async analyzeProfile(profileData: any): Promise<AnalysisResponse> {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${AI_API_URL}/api/ai/analyze-profile`,
      {
        profileData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get content ideas
  async getContentIdeas(
    industry?: string,
    interests?: string[],
    recentTopics?: string[]
  ): Promise<ContentIdeasResponse> {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${AI_API_URL}/api/ai/content-ideas`,
      {
        industry,
        interests,
        recentTopics,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get chat history
  async getChatHistory(): Promise<{
    messages: ChatMessage[];
    lastActivity: string;
  }> {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${AI_API_URL}/api/ai/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Delete chat history
  async deleteChatHistory(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${AI_API_URL}/api/ai/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await axios.get(`${AI_API_URL}/health`);
    return response.data;
  },
};
