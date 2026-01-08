# Bennett Network - Complete Documentation

> A comprehensive professional networking platform built with modern microservices architecture, real-time communication, and AI-powered career guidance.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Detailed Documentation](#detailed-documentation)
- [Features Overview](#features-overview)
- [Project Structure](#project-structure)

---

## Overview

**Bennett Network** is a LinkedIn-style professional networking platform designed specifically for Bennett University students, faculty, and alumni. The platform enables users to connect professionally, share content, engage with posts, communicate in real-time, and receive AI-powered career guidance.

### Key Highlights

- **Microservices Architecture**: 8 independent backend services
- **Real-time Communication**: Socket.io for instant messaging and notifications
- **AI Integration**: Google Gemini 2.5 Pro for career advice and profile optimization
- **Modern Frontend**: React with TypeScript and Tailwind CSS
- **Scalable Database**: MongoDB with optimized schemas and TTL indexes
- **Secure Authentication**: JWT-based auth with email verification
- **Professional UI/UX**: LinkedIn-inspired design with smooth animations

---

## Technology Stack

### Frontend

| Technology           | Version | Purpose                                                |
| -------------------- | ------- | ------------------------------------------------------ |
| **React**            | 19.1.1  | UI library for building component-based interfaces     |
| **TypeScript**       | Latest  | Type-safe JavaScript for better development experience |
| **Vite**             | 5.0.4   | Fast build tool and dev server                         |
| **Tailwind CSS**     | 4.1.16  | Utility-first CSS framework for styling                |
| **React Router**     | 7.9.4   | Client-side routing and navigation                     |
| **Axios**            | 1.13.2  | HTTP client for API requests                           |
| **Socket.io Client** | 4.8.1   | Real-time bidirectional communication                  |
| **Lucide React**     | 0.548.0 | Beautiful icon library                                 |

### Backend

| Technology               | Version | Purpose                                          |
| ------------------------ | ------- | ------------------------------------------------ |
| **Node.js**              | Latest  | JavaScript runtime environment                   |
| **Express**              | 4.18.2  | Web framework for building REST APIs             |
| **MongoDB**              | Latest  | NoSQL database for data persistence              |
| **Mongoose**             | 8.0.0   | ODM for MongoDB with schema validation           |
| **JWT**                  | 9.0.2   | JSON Web Tokens for authentication               |
| **bcryptjs**             | 2.4.3   | Password hashing and encryption                  |
| **Socket.io**            | Latest  | Real-time server for websocket communication     |
| **Nodemailer**           | 6.9.7   | Email sending for verification and notifications |
| **Google Generative AI** | 0.1.3   | Gemini API integration for AI features           |

### Development Tools

| Tool        | Purpose                                         |
| ----------- | ----------------------------------------------- |
| **ESLint**  | Code linting and quality checks                 |
| **Nodemon** | Auto-restart on file changes during development |
| **Morgan**  | HTTP request logging                            |
| **Helmet**  | Security headers and protection                 |
| **CORS**    | Cross-Origin Resource Sharing configuration     |
| **dotenv**  | Environment variable management                 |

---

## Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Port 5173)                      │
│                    React + TypeScript + Vite                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTP/WebSocket
             │
┌────────────┴─────────────────────────────────────────────────────┐
│                      Backend Services                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Auth Service   │  │  User Service   │  │  Feed Service   │ │
│  │   (Port 3001)   │  │   (Port 3002)   │  │   (Port 3006)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │Network Service  │  │Engagement Svc   │  │ Message Service │ │
│  │   (Port 3004)   │  │   (Port 3005)   │  │   (Port 3007)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │Notification Svc │  │   AI Service    │                       │
│  │   (Port 3008)   │  │   (Port 3010)   │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                │ Mongoose
                                │
                    ┌───────────┴───────────┐
                    │   MongoDB Databases   │
                    │  - bennett-auth       │
                    │  - bennett-users      │
                    │  - bennett-feed       │
                    │  - bennett-engagement │
                    │  - bennett-network    │
                    │  - bennett-messages   │
                    │  - bennett-notifications │
                    │  - bennett-ai         │
                    └───────────────────────┘
```

### Service Responsibilities

1. **Auth Service (3001)**: User registration, login, JWT token management, email verification
2. **User Service (3002)**: Profile management, user data, profile updates
3. **Network Service (3004)**: Connection requests, managing connections, suggestions
4. **Engagement Service (3005)**: Likes, comments, shares on posts
5. **Feed Service (3006)**: Post creation, feed generation, post management
6. **Message Service (3007)**: Real-time chat, conversations, message history
7. **Notification Service (3008)**: Real-time notifications, notification management
8. **AI Service (3010)**: Career advice, profile analysis using Google Gemini API

---

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd "5th sem project"
```

2. **Install Frontend Dependencies**

```bash
cd frontend
npm install
```

3. **Install Backend Dependencies** (for each service)

```bash
cd backend/auth-service && npm install
cd backend/user-service && npm install
cd backend/feed-service && npm install
cd backend/engagement-service && npm install
cd backend/network-service && npm install
cd backend/message-service && npm install
cd backend/notification-service && npm install
cd backend/ai-service && npm install
```

4. **Configure Environment Variables**

Create `.env` files in each backend service directory. See [Environment Configuration](docs/Environment_Configuration.md) for details.

5. **Start MongoDB**

```bash
mongod --dbpath /path/to/data/directory
```

6. **Start All Services**

Open separate terminal windows for each:

```bash
# Terminal 1 - Auth Service
cd backend/auth-service && npm start

# Terminal 2 - User Service
cd backend/user-service && npm start

# Terminal 3 - Feed Service
cd backend/feed-service && npm start

# Terminal 4 - Engagement Service
cd backend/engagement-service && npm start

# Terminal 5 - Network Service
cd backend/network-service && npm start

# Terminal 6 - Message Service
cd backend/message-service && npm start

# Terminal 7 - Notification Service
cd backend/notification-service && npm start

# Terminal 8 - AI Service
cd backend/ai-service && npm start

# Terminal 9 - Frontend
cd frontend && npm run dev
```

7. **Access the Application**

- Frontend: http://localhost:5173
- Backend APIs: http://localhost:300X (where X is the service port)

---

## Detailed Documentation

### Core System Documentation

- **[Backend Services](docs/Backend_Services.md)** - Comprehensive guide to all 8 backend services
- **[Frontend Architecture](docs/Frontend_Architecture.md)** - React components, pages, routing, state management
- **[Database Schema](docs/Database_Schema.md)** - All MongoDB models, relationships, and indexes
- **[Authentication Flow](docs/Authentication_Flow.md)** - JWT implementation, middleware, security

### Feature Documentation

- **[Real-Time Features](docs/Real_Time_Features.md)** - Socket.io implementation for messages and notifications
- **[AI Integration](docs/AI_Integration.md)** - Google Gemini API integration and chat persistence
- **[API Endpoints](docs/API_Endpoints.md)** - Complete API reference for all services
- **[UI Components](docs/UI_Components.md)** - Reusable React components and their usage

### Development & Deployment

- **[Environment Configuration](docs/Environment_Configuration.md)** - All environment variables explained
- **[Deployment Guide](docs/Deployment_Guide.md)** - Production deployment instructions
- **[Testing Guide](docs/Testing_Guide.md)** - How to test APIs using Postman

### Interview Preparation

- **[Interview Questions & Answers](docs/Interview_Questions.md)** - 200+ questions with detailed answers

---

## Features Overview

### 1. User Authentication & Authorization

- ✅ Email/Password registration with validation
- ✅ Email verification with OTP
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ Token refresh mechanism
- ✅ Account deletion with cascade cleanup

### 2. User Profile Management

- ✅ Complete profile creation and editing
- ✅ Profile picture upload (base64)
- ✅ Education history management
- ✅ Work experience tracking
- ✅ Skills and endorsements
- ✅ Featured content sections
- ✅ Profile visibility settings

### 3. Professional Networking

- ✅ Send/receive connection requests
- ✅ Accept/reject requests with real-time updates
- ✅ Connection suggestions based on interests
- ✅ Mutual connections display
- ✅ Remove connections
- ✅ Search users by name, department, batch
- ✅ Real-time notification badges

### 4. Content Creation & Feed

- ✅ Create posts with text, images, videos, documents
- ✅ Edit and delete own posts
- ✅ Personalized feed algorithm
- ✅ Post visibility controls
- ✅ Media preview and upload
- ✅ Base64 image encoding
- ✅ Loading animations

### 5. Engagement Features

- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Nested comment threads
- ✅ Edit/delete comments
- ✅ Share posts
- ✅ Real-time engagement counts
- ✅ Top comments display
- ✅ Confirmation modals for destructive actions

### 6. Real-Time Messaging

- ✅ One-on-one chat
- ✅ Real-time message delivery via Socket.io
- ✅ Message history persistence
- ✅ Online/offline status indicators
- ✅ Unread message counts
- ✅ Read receipts
- ✅ Auto-scroll to latest messages
- ✅ Navigate to chat from connections

### 7. Notification System

- ✅ Real-time notifications via Socket.io
- ✅ Notification types: likes, comments, connections, messages
- ✅ Unread notification badges
- ✅ Mark as read functionality
- ✅ Notification persistence
- ✅ Click to navigate to relevant content

### 8. AI Career Advisor (Gemini Integration)

- ✅ AI-powered career advice
- ✅ Profile optimization suggestions
- ✅ Content ideas generation
- ✅ ChatGPT-style streaming responses
- ✅ Conversation history (24-hour TTL)
- ✅ Context-aware responses
- ✅ Quick action buttons
- ✅ Recommendation sidebar
- ✅ Auto-deletion of chats on account removal

### 9. UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ LinkedIn-inspired professional theme
- ✅ Smooth animations and transitions
- ✅ Loading spinners and skeletons
- ✅ Error handling with user-friendly messages
- ✅ Modal dialogs for confirmations
- ✅ Toast notifications
- ✅ Accessible navigation
- ✅ Real-time indicator badges

---

## Project Structure

```
5th sem project/
├── frontend/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Categories.tsx
│   │   │   ├── Comment.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Feed.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx       # Main navigation with badges
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Opportunities.tsx
│   │   │   ├── PostModal.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Testimonials.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Authentication state management
│   │   ├── pages/
│   │   │   ├── Advisor.tsx      # AI Career Advisor page
│   │   │   ├── AuthPage.tsx     # Login/Register page
│   │   │   ├── Home.tsx         # Feed page
│   │   │   ├── Messages.tsx     # Real-time chat page
│   │   │   ├── Network.tsx      # Connections management
│   │   │   ├── Notifications.tsx
│   │   │   ├── Profile.tsx      # User profile page
│   │   │   └── OpportunitiesPage.tsx
│   │   ├── services/
│   │   │   ├── ai.ts            # AI service API calls
│   │   │   └── api.ts           # Backend API service layer
│   │   ├── utils/
│   │   │   └── axios.ts         # Axios configuration with interceptors
│   │   ├── App.tsx              # Main app component with routing
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                     # Microservices Backend
│   ├── auth-service/            # Port 3001
│   │   ├── config/
│   │   │   └── database.js      # MongoDB connection
│   │   ├── controllers/
│   │   │   └── authController.js  # Login, register, verification
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── User.js          # User schema
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   ├── utils/
│   │   │   ├── emailTemplates.js
│   │   │   └── sendEmail.js     # Nodemailer configuration
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── user-service/            # Port 3002
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── userController.js  # Profile CRUD operations
│   │   │   └── postController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── UserProfile.js   # Profile schema with nested documents
│   │   │   └── Post.js
│   │   ├── routes/
│   │   │   ├── userRoutes.js
│   │   │   └── postRoutes.js
│   │   ├── server.js
│   │   └── package.json
│   │
│   ├── network-service/         # Port 3004
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── networkController.js  # Connections, requests, suggestions
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   └── Connection.js    # Connection schema with status tracking
│   │   ├── routes/
│   │   │   └── networkRoutes.js
│   │   ├── server.js
│   │   └── package.json
│   │
│   ├── engagement-service/      # Port 3005
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── engagementController.js  # Likes, comments, shares
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   ├── Like.js
│   │   │   ├── Comment.js       # Comment schema with nested replies
│   │   │   └── Share.js
│   │   ├── routes/
│   │   │   └── engagementRoutes.js
│   │   ├── server.js
│   │   └── package.json
│   │
│   ├── feed-service/            # Port 3006
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── feedController.js  # Post CRUD and feed generation
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   └── Post.js          # Post schema with media support
│   │   ├── routes/
│   │   │   └── feedRoutes.js
│   │   ├── server.js
│   │   └── package.json
│   │
│   ├── message-service/         # Port 3007
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── messageController.js  # Chat and message handling
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   └── Message.js       # Message schema
│   │   ├── routes/
│   │   │   └── messageRoutes.js
│   │   ├── socket/
│   │   │   └── messageSocket.js  # Socket.io real-time logic
│   │   ├── server.js            # Express + Socket.io server
│   │   └── package.json
│   │
│   ├── notification-service/    # Port 3008
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   └── Notification.js  # Notification schema with types
│   │   ├── routes/
│   │   │   └── notificationRoutes.js
│   │   ├── socket/
│   │   │   └── notificationSocket.js  # Socket.io notifications
│   │   ├── server.js
│   │   └── package.json
│   │
│   └── ai-service/              # Port 3010
│       ├── config/
│       │   └── database.js      # MongoDB for chat history
│       ├── middleware/
│       │   └── auth.js          # JWT verification
│       ├── models/
│       │   └── ChatSession.js   # Chat history with TTL
│       ├── server.js            # Gemini API integration + SSE streaming
│       ├── package.json
│       └── .env                 # GEMINI_API_KEY, JWT_SECRET
│
├── docs/                        # Detailed Documentation
│   ├── Backend_Services.md
│   ├── Frontend_Architecture.md
│   ├── Database_Schema.md
│   ├── Authentication_Flow.md
│   ├── Real_Time_Features.md
│   ├── AI_Integration.md
│   ├── API_Endpoints.md
│   ├── UI_Components.md
│   ├── Environment_Configuration.md
│   ├── Deployment_Guide.md
│   ├── Testing_Guide.md
│   └── Interview_Questions.md
│
├── Bennett_Network_Documentation.md  # This file
└── README.md
```

---

## Key Design Decisions

### 1. Microservices Architecture

**Why?** Scalability, independent deployment, fault isolation, technology flexibility

### 2. MongoDB for Each Service

**Why?** NoSQL flexibility, JSON-like documents, easy scaling, perfect for social network data

### 3. JWT Authentication

**Why?** Stateless, scalable, works well with microservices, no server-side session storage

### 4. Socket.io for Real-time Features

**Why?** Bidirectional communication, automatic reconnection, room-based broadcasting

### 5. React with TypeScript

**Why?** Type safety, better IDE support, catch errors at compile-time, scalable codebase

### 6. Google Gemini API

**Why?** State-of-the-art AI, streaming support, cost-effective, easy integration

### 7. TTL Indexes for Chat History

**Why?** Automatic cleanup, no cron jobs needed, privacy compliance, efficient storage

---

## Performance Optimizations

1. **Frontend**

   - Component lazy loading
   - Image optimization with base64 encoding
   - Debounced search inputs
   - Pagination for feeds and comments
   - React.memo for expensive components

2. **Backend**

   - Database indexing on frequently queried fields
   - Connection pooling
   - Response caching where appropriate
   - Payload size limits (50MB)
   - Lean queries (select only needed fields)

3. **Real-time**
   - Socket.io rooms for targeted broadcasting
   - Event-driven updates instead of polling
   - Automatic reconnection handling

---

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days)
- ✅ CORS configuration
- ✅ Helmet for security headers
- ✅ Input validation with express-validator
- ✅ Protected API routes with middleware
- ✅ Email verification
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ Rate limiting ready

---

## Future Enhancements

- [ ] Advanced search with Elasticsearch
- [ ] Video/audio calling
- [ ] Group messaging
- [ ] Post analytics dashboard
- [ ] Advanced recommendation algorithm
- [ ] Mobile app (React Native)
- [ ] Email notifications for important events
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, LinkedIn)
- [ ] Job board and applications
- [ ] Events and calendar
- [ ] Premium membership tiers

---

## Contributing

This project is part of a 5th-semester university project. For questions or contributions, please refer to the detailed documentation in the `docs/` folder.

---

## License

This project is created for educational purposes as part of Bennett University coursework.

---

## Support & Contact

For detailed technical questions, refer to:

- [Backend Services Documentation](docs/Backend_Services.md)
- [Frontend Architecture](docs/Frontend_Architecture.md)
- [Interview Q&A](docs/Interview_Questions.md)

---

**Built with ❤️ for Bennett University Network**

_Last Updated: November 18, 2025_
