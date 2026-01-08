# AI Advisor Service

This service provides AI-powered career advice, profile optimization, and content strategy recommendations using Google's Gemini API.

## Features

- **General Career Advice**: Get guidance on career transitions, professional development, and networking
- **Profile Analysis**: Receive detailed recommendations to improve your profile
- **Content Strategy**: Get ideas for posts and learn how to increase engagement
- **Chat Interface**: Interactive conversation with context-aware AI advisor

## Setup

1. Install dependencies:

```bash
cd backend/ai-service
npm install
```

2. Create `.env` file with your Gemini API key:

```env
PORT=3010
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start the service:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### POST /api/ai/chat

Chat with the AI advisor.

**Request Body:**

```json
{
  "message": "How can I improve my profile?",
  "context": "profile",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "profileData": {
    "firstName": "John",
    "lastName": "Doe",
    "headline": "Software Engineer",
    ...
  }
}
```

**Context Options:**

- `general` - General platform and career advice
- `profile` - Profile optimization advice
- `content` - Content strategy and engagement tips
- `career` - Career guidance and development

**Response:**

```json
{
  "success": true,
  "reply": "Here are some tips to improve your profile...",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

### POST /api/ai/analyze-profile

Get detailed profile analysis with specific recommendations.

**Request Body:**

```json
{
  "profileData": {
    "firstName": "John",
    "lastName": "Doe",
    "headline": "Software Engineer",
    "about": "Passionate developer...",
    "experience": [...],
    "skills": [...]
  }
}
```

**Response:**

```json
{
  "success": true,
  "analysis": "Profile Score: 7/10\n\nStrengths:\n1. ...\n\nImprovements:\n1. ...",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

### POST /api/ai/content-ideas

Get content ideas tailored to your industry and interests.

**Request Body:**

```json
{
  "industry": "Software Development",
  "interests": ["AI", "Web Development", "Cloud Computing"],
  "recentTopics": ["React 19", "TypeScript 5.0"]
}
```

**Response:**

```json
{
  "success": true,
  "ideas": "1. Post Idea: The Future of AI in Web Development\n...",
  "timestamp": "2025-11-16T10:30:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "service": "AI Advisor Service"
}
```

## Environment Variables

| Variable       | Description           | Default    |
| -------------- | --------------------- | ---------- |
| PORT           | Server port           | 3010       |
| GEMINI_API_KEY | Google Gemini API key | (required) |

## System Prompts

The service uses specialized system prompts for different contexts:

- **General**: Platform features and best practices
- **Profile**: Profile optimization and completeness
- **Content**: Content strategy and engagement
- **Career**: Career guidance and professional development

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing required fields)
- `500`: Server error (AI API failure)

Error response format:

```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

## Integration with Frontend

The frontend uses the `aiService` in `frontend/src/services/ai.ts`:

```typescript
import { aiService } from "../services/ai";

// Chat with AI
const response = await aiService.chat(
  "How do I improve my headline?",
  "profile"
);

// Analyze profile
const analysis = await aiService.analyzeProfile(profileData);

// Get content ideas
const ideas = await aiService.getContentIdeas(
  "Technology",
  ["AI", "Web Dev"],
  ["React 19"]
);
```

## Notes

- The Gemini API key is kept server-side for security
- Conversation history is passed from the frontend for context
- The service handles formatting and context management
- Responses are formatted with markdown for better readability

## Troubleshooting

1. **"AI proxy failed" error**: Check that your GEMINI_API_KEY is correct
2. **Connection refused**: Make sure the service is running on port 3010
3. **CORS errors**: The service allows all origins for development

## Future Enhancements

- Streaming responses for real-time chat experience
- User-specific conversation history stored in database
- Rate limiting and caching
- Multi-language support
- Advanced analytics on AI usage
