# Bennett University Network - Microservices Backend

## Architecture Overview

This backend uses a **microservices architecture** with the following services:

### Services

1. **Auth Service** (Port 3001) - Authentication & Authorization
2. **User Service** (Port 3002) - User Profile Management
3. **Network Service** (Port 3003) - Connections & Social Graph
4. **Feed Service** (Port 3004) - Posts & Articles
5. **Engagement Service** (Port 3005) - Likes, Comments, Shares

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- Postman (for API testing)

---

## Installation & Setup

### 1. Install Dependencies for All Services

Run the following commands from the `backend` directory:

```bash
# Auth Service
cd auth-service && npm install && cd ..

# User Service
cd user-service && npm install && cd ..

# Network Service
cd network-service && npm install && cd ..

# Feed Service
cd feed-service && npm install && cd ..

# Engagement Service
cd engagement-service && npm install && cd ..
```

### 2. Start MongoDB

Make sure MongoDB is running on your local machine:

```bash
sudo systemctl start mongod
# OR
mongod
```

### 3. Start All Services

You need to start each service in a separate terminal:

**Terminal 1 - Auth Service:**

```bash
cd backend/auth-service
npm start
# OR for development with auto-reload:
npm run dev
```

**Terminal 2 - User Service:**

```bash
cd backend/user-service
npm start
```

**Terminal 3 - Network Service:**

```bash
cd backend/network-service
npm start
```

**Terminal 4 - Feed Service:**

```bash
cd backend/feed-service
npm start
```

**Terminal 5 - Engagement Service:**

```bash
cd backend/engagement-service
npm start
```

---

## API Endpoints for Postman Testing

### 🔐 Auth Service (http://localhost:3001)

#### Register User

- **POST** `http://localhost:3001/api/auth/register`
- **Body (JSON):**

```json
{
  "fullName": "Ayush Raj",
  "username": "ayush_raj",
  "email": "student@bennett.edu.in",
  "password": "password123",
  "role": "student"
}
```

**Required Fields:**

- `fullName` - Full name (2-100 characters)
- `username` - Unique username (3-30 characters, alphanumeric + underscores only)
- `email` - Valid email address
- `password` - Password (minimum 6 characters)
- `role` - Must be one of: `student`, `professor`, or `alumni`

**Note:** Username must be unique and can only contain letters, numbers, and underscores.

#### Login

- **POST** `http://localhost:3001/api/auth/login`
- **Body (JSON):**

```json
{
  "email": "student@bennett.edu.in",
  "password": "password123"
}
```

- **Response includes:** `id`, `fullName`, `username`, `email`, `role`, `lastLogin`, `token`
- **Note:** A login notification email will be sent automatically with login details (time, device, IP address)

#### Get Current User

- **GET** `http://localhost:3001/api/auth/me`
- **Headers:** `Authorization: Bearer <your_token>`

#### Verify Token

- **GET** `http://localhost:3001/api/auth/verify`
- **Headers:** `Authorization: Bearer <your_token>`

---

### 👤 User Service (http://localhost:3002)

#### Create Profile

- **POST** `http://localhost:3002/api/users/profile`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "firstName": "Ayush",
  "lastName": "Raj",
  "email": "student@bennett.edu.in",
  "role": "student",
  "bio": "Computer Science student passionate about technology",
  "title": "Full Stack Developer",
  "studentInfo": {
    "rollNumber": "E21CSE001",
    "batch": "2023-2027",
    "department": "Computer Science",
    "semester": 4,
    "cgpa": 8.7
  },
  "skills": ["React", "Node.js", "Python", "MongoDB"],
  "location": {
    "city": "Greater Noida",
    "state": "Uttar Pradesh",
    "country": "India"
  }
}
```

#### Get My Profile

- **GET** `http://localhost:3002/api/users/profile/me`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get Profile by User ID

- **GET** `http://localhost:3002/api/users/profile/:userId`

#### Update Profile

- **PUT** `http://localhost:3002/api/users/profile`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):** (any fields you want to update)

#### Search Users

- **GET** `http://localhost:3002/api/users/search?q=ayush&role=student`

#### Get All Users (Paginated)

- **GET** `http://localhost:3002/api/users?page=1&limit=10`

---

### 🤝 Network Service (http://localhost:3003)

#### Send Connection Request

- **POST** `http://localhost:3003/api/network/connect/:userId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "message": "Hi! I'd like to connect with you"
}
```

#### Accept Connection Request

- **PUT** `http://localhost:3003/api/network/accept/:connectionId`
- **Headers:** `Authorization: Bearer <your_token>`

#### Reject Connection Request

- **PUT** `http://localhost:3003/api/network/reject/:connectionId`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get My Connections

- **GET** `http://localhost:3003/api/network/connections`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get Pending Requests

- **GET** `http://localhost:3003/api/network/requests/pending`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get Sent Requests

- **GET** `http://localhost:3003/api/network/requests/sent`
- **Headers:** `Authorization: Bearer <your_token>`

#### Remove Connection

- **DELETE** `http://localhost:3003/api/network/remove/:connectionId`
- **Headers:** `Authorization: Bearer <your_token>`

---

### 📝 Feed Service (http://localhost:3004)

#### Create Post

- **POST** `http://localhost:3004/api/feed/posts`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "content": "Just got placed at Google! 🎉 So excited to start this journey!",
  "type": "achievement",
  "tags": ["placement", "google", "achievement"],
  "visibility": "public"
}
```

#### Get All Posts (Feed)

- **GET** `http://localhost:3004/api/feed/posts?page=1&limit=20`

#### Get Post by ID

- **GET** `http://localhost:3004/api/feed/posts/:postId`

#### Get Posts by User

- **GET** `http://localhost:3004/api/feed/posts/user/:userId`

#### Get My Posts

- **GET** `http://localhost:3004/api/feed/my-posts`
- **Headers:** `Authorization: Bearer <your_token>`

#### Update Post

- **PUT** `http://localhost:3004/api/feed/posts/:postId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):** (fields to update)

#### Delete Post

- **DELETE** `http://localhost:3004/api/feed/posts/:postId`
- **Headers:** `Authorization: Bearer <your_token>`

---

### ❤️ Engagement Service (http://localhost:3005)

#### Like a Post

- **POST** `http://localhost:3005/api/engagement/like/:postId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "reactionType": "like"
}
```

_Reaction types: like, love, celebrate, support, insightful_

#### Unlike a Post

- **DELETE** `http://localhost:3005/api/engagement/unlike/:postId`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get Post Likes

- **GET** `http://localhost:3005/api/engagement/likes/:postId`

#### Add Comment

- **POST** `http://localhost:3005/api/engagement/comment/:postId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "content": "Congratulations! Well deserved! 🎉"
}
```

#### Reply to Comment

- **POST** `http://localhost:3005/api/engagement/comment/:postId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "content": "Thank you so much!",
  "parentComment": "comment_id_here"
}
```

#### Update Comment

- **PUT** `http://localhost:3005/api/engagement/comment/:commentId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "content": "Updated comment text"
}
```

#### Delete Comment

- **DELETE** `http://localhost:3005/api/engagement/comment/:commentId`
- **Headers:** `Authorization: Bearer <your_token>`

#### Get Post Comments

- **GET** `http://localhost:3005/api/engagement/comments/:postId`

#### Get Comment Replies

- **GET** `http://localhost:3005/api/engagement/replies/:commentId`

#### Share a Post

- **POST** `http://localhost:3005/api/engagement/share/:postId`
- **Headers:** `Authorization: Bearer <your_token>`
- **Body (JSON):**

```json
{
  "message": "Check out this amazing achievement!"
}
```

#### Get Post Shares

- **GET** `http://localhost:3005/api/engagement/shares/:postId`

---

## Testing Flow in Postman

### Step-by-Step Testing:

1. **Register a User** (Auth Service)

   - Use the register endpoint with fullName, username, email, password, and role
   - Save the returned token
   - Check email for verification link

2. **Login** (Auth Service)

   - Login with email and password
   - Copy the JWT token from response
   - Response includes fullName and username
   - Check email for login notification with device/IP details

3. **Create User Profile** (User Service)

   - Use the token in Authorization header
   - Create a detailed profile

4. **Register Another User** (Repeat steps 1-3)

   - Create a second user to test connections

5. **Send Connection Request** (Network Service)

   - Use first user's token
   - Send request to second user's ID

6. **Accept Connection** (Network Service)

   - Use second user's token
   - Accept the connection request

7. **Create a Post** (Feed Service)

   - Use any user's token
   - Create a post

8. **Like the Post** (Engagement Service)

   - Use another user's token
   - Like the post

9. **Comment on Post** (Engagement Service)

   - Add a comment
   - Add a reply to the comment

10. **Share the Post** (Engagement Service)
    - Share the post

---

## MongoDB Database Structure

Each service has its own database:

- `bennett-auth` - Auth data (with fullName, username, email, password, role)
- `bennett-users` - User profiles
- `bennett-network` - Connections
- `bennett-feed` - Posts
- `bennett-engagement` - Likes, comments, shares

**Auth Service Fields:**

- `fullName` - User's full name
- `username` - Unique username (indexed)
- `email` - Unique email (indexed)
- `password` - Hashed password
- `role` - student/professor/alumni
- `isVerified` - Email verification status
- `verificationToken` - Email verification token
- `lastLogin` - Last login timestamp

---

## Service Status Check

To verify all services are running:

- Auth Service: http://localhost:3001/
- User Service: http://localhost:3002/
- Network Service: http://localhost:3003/
- Feed Service: http://localhost:3004/
- Engagement Service: http://localhost:3005/

Each should return a JSON response with service name and status.

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:** Make sure MongoDB is running

```bash
sudo systemctl start mongod
```

### Issue: "Port already in use"

**Solution:** Kill the process or change port in .env file

### Issue: "JWT token invalid"

**Solution:** Make sure all services use the same JWT_SECRET

---

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security
- **Morgan** - Logging
- **CORS** - Cross-origin requests

---

## Next Steps

Once tested in Postman, you can:

1. Create an API Gateway to route requests
2. Add service-to-service communication
3. Implement message queues (RabbitMQ/Kafka)
4. Add Redis for caching
5. Connect to frontend React application

---

## Contact

For issues or questions, refer to the project documentation or contact the development team.
