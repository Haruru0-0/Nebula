# Nebula API Documentation

This document provides comprehensive information about the Nebula backend API endpoints, request/response formats, and authentication.

## Base URL
The API is accessible at: `http://localhost:4000/api` (default development)

## Authentication
Most endpoints require authentication via a JSON Web Token (JWT).
- Include the token in the `Authorization` header as follows: `Authorization: Bearer <your_token>`
- You can obtain a token by signing up or signing in via the Auth endpoints.
- Email verification is required before signing in.

## Response Format
All API responses follow this standard format:
```json
{
  "success": boolean,
  "message": string,
  "data": object (optional),
  "errors": array (optional, for validation errors)
}
```

---

## 🏥 Health Check
- **URL:** `/health`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "message": "AI Agent Management API is running",
  "timestamp": "2024-12-26T16:06:40.148Z"
}
```

---

## 🔐 Auth APIs
Base Path: `/auth`

### 1. Sign Up
Create a new user account and receive a verification email.

- **URL:** `/signup`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123",
  "name": "John Doe" (optional, 2-100 characters)
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": false
    }
  }
}
```
- **Validation Errors (400):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" is required"
    }
  ]
}
```

### 2. Verify Email
Verify user email using the OTP sent via email.

- **URL:** `/verify-email`
- **Method:** `POST`
- **Body:**
```json
{
  "token": "123456",
  "email": "user@example.com"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Resend Verification
Resend verification email to user.

- **URL:** `/resend-verification`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

### 4. Sign In
Authenticate an existing verified user.

- **URL:** `/signin`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Response (403):**
```json
{
  "success": false,
  "message": "Please verify your email address before signing in."
}
```

### 5. Forgot Password
Request a password reset token via email.

- **URL:** `/forgot-password`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

### 6. Reset Password
Reset password using the reset token.

- **URL:** `/reset-password`
- **Method:** `POST`
- **Body:**
```json
{
  "token": "reset-token-123",
  "password": "new-strong-password"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 7. Change Password
Change password for authenticated user.

- **URL:** `/change-password` (Requires Auth)
- **Method:** `POST`
- **Body:**
```json
{
  "oldPassword": "current-password",
  "newPassword": "new-strong-password"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 8. Get Profile
Fetch the current user's profile information.

- **URL:** `/profile` (Requires Auth)
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": true,
      "createdAt": "2024-12-26T16:06:40.148Z",
      "updatedAt": "2024-12-26T16:06:40.148Z"
    }
  }
}
```

---

## 🤖 Agent APIs
Base Path: `/agents` (Requires Auth)

### 1. Create Agent
Create a new AI agent with custom configuration.

- **URL:** `/`
- **Method:** `POST`
- **Body:**
```json
{
  "name": "Support Bot",
  "systemPrompt": "You are a helpful assistant...",
  "provider": "openai", (optional, default: 'openai', supports: 'openai', 'gemini')
  "model": "gpt-4.1", (optional, auto-selected based on provider if not specified)
  "temperature": 0.7, (optional, 0-2, default: 0.7)
  "maxTokens": 1000 (optional, 100-8000, default: 1000)
}
```
- **Available Models:**
  - **OpenAI:** `gpt-5.2`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5.2-pro`, `gpt-5`, `gpt-4.1`
  - **Gemini:** `gemini-3.0-pro`, `gemini-3.0-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`
- **Success Response (201):**
```json
{
  "success": true,
  "message": "Agent created successfully",
  "data": {
    "agent": {
      "id": "a123-b456-c789",
      "name": "Support Bot",
      "systemPrompt": "You are a helpful assistant...",
      "provider": "openai",
      "model": "gpt-4.1",
      "temperature": 0.7,
      "maxTokens": 1000,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2024-12-26T16:06:40.148Z",
      "updatedAt": "2024-12-26T16:06:40.148Z"
    }
  }
}
```

### 2. Get All Agents
Retrieve all agents for the authenticated user.

- **URL:** `/`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "a123-b456-c789",
        "name": "Support Bot",
        "systemPrompt": "You are a helpful assistant...",
        "provider": "openai",
        "model": "gpt-4.1",
        "temperature": 0.7,
        "maxTokens": 1000,
        "userId": "u123-e456-i789",
        "isActive": true,
        "createdAt": "2024-12-26T16:06:40.148Z",
        "updatedAt": "2024-12-26T16:06:40.148Z"
      }
    ],
    "count": 1
  }
}
```

### 3. Get Agent By ID
Retrieve a specific agent by ID with conversation count.

- **URL:** `/:id`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "a123-b456-c789",
      "name": "Support Bot",
      "systemPrompt": "You are a helpful assistant...",
      "provider": "openai",
      "model": "gpt-4.1",
      "temperature": 0.7,
      "maxTokens": 1000,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2024-12-26T16:06:40.148Z",
      "updatedAt": "2024-12-26T16:06:40.148Z",
      "_count": {
        "conversations": 5
      }
    }
  }
}
```

### 4. Update Agent
Update an existing agent's configuration.

- **URL:** `/:id`
- **Method:** `PUT`
- **Body:** (Any fields from Create Agent + `isActive`)
```json
{
  "name": "Updated Bot Name",
  "systemPrompt": "New prompt...",
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "temperature": 0.8,
  "maxTokens": 1500,
  "isActive": true
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Agent updated successfully",
  "data": {
    "agent": {
      "id": "a123-b456-c789",
      "name": "Updated Bot Name",
      "systemPrompt": "New prompt...",
      "provider": "gemini",
      "model": "gemini-2.5-flash",
      "temperature": 0.8,
      "maxTokens": 1500,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2024-12-26T16:06:40.148Z",
      "updatedAt": "2024-12-26T16:12:51.016Z"
    }
  }
}
```

### 5. Delete Agent
Delete an agent and all its associated data.

- **URL:** `/:id`
- **Method:** `DELETE`
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

---

## 💬 Chat APIs
Base Path: `/chat` (Requires Auth)

### 1. Send Message / Start Chat
Send a message to an agent and receive a response, creating a new conversation if needed.

- **URL:** `/:agentId`
- **Method:** `POST`
- **Body:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "c123-d456-e789" (optional, for continuing existing conversations)
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "conversationId": "c123-d456-e789",
    "message": {
      "id": "m123-n456-o789",
      "conversationId": "c123-d456-e789",
      "role": "assistant",
      "content": "I am doing well, how can I help you today?",
      "tokenCount": 15,
      "createdAt": "2024-12-26T16:06:40.148Z"
    },
    "metrics": {
      "tokensProcessed": 15,
      "responseLatency": 850
    }
  }
}
```

### 2. Get Conversations for Agent
Retrieve all conversations for a specific agent.

- **URL:** `/:agentId/conversations`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "c123-d456-e789",
        "userId": "u123-e456-i789",
        "agentId": "a123-b456-c789",
        "title": "Hello, how are you?",
        "createdAt": "2024-12-26T16:06:40.148Z",
        "updatedAt": "2024-12-26T16:06:40.148Z",
        "messages": [
          {
            "id": "m123-x456-y789",
            "content": "Hello, how are you?",
            "createdAt": "2024-12-26T16:06:40.148Z"
          }
        ],
        "_count": {
          "messages": 1
        }
      }
    ],
    "count": 1
  }
}
```

### 3. Get Specific Conversation
Retrieve a specific conversation with all its messages.

- **URL:** `/conversations/:conversationId/get`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "c123-d456-e789",
      "userId": "u123-e456-i789",
      "agentId": "a123-b456-c789",
      "title": "Hello, how are you?",
      "createdAt": "2024-12-26T16:06:40.148Z",
      "updatedAt": "2024-12-26T16:06:40.148Z",
      "messages": [
        {
          "id": "m123-x456-y789",
          "role": "user",
          "content": "Hello, how are you?",
          "createdAt": "2024-12-26T16:06:40.148Z"
        },
        {
          "id": "m123-n456-o789",
          "role": "assistant",
          "content": "I am doing well, how can I help you today?",
          "createdAt": "2024-12-26T16:06:40.148Z"
        }
      ],
      "agent": {
        "id": "a123-b456-c789",
        "name": "Support Bot",
        "model": "gpt-4.1"
      }
    }
  }
}
```

### 4. Update Conversation
Update conversation title.

- **URL:** `/conversations/:conversationId`
- **Method:** `PATCH`
- **Body:**
```json
{
  "title": "New Conversation Title"
}
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Conversation updated successfully",
  "data": {
    "conversation": {
      "id": "c123-d456-e789",
      "title": "New Conversation Title",
      "updatedAt": "2024-12-26T16:12:51.016Z"
    }
  }
}
```

### 5. Delete Conversation
Delete a conversation and all its messages.

- **URL:** `/conversations/:conversationId/delete`
- **Method:** `DELETE`
- **Success Response (200):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## 📊 Metrics APIs
Base Path: `/metrics` (Requires Auth)

### 1. Get Overall Metrics
Retrieve aggregated metrics across all agents for the user.

- **URL:** `/overall`
- **Method:** `GET`
- **Query Params:** `period` (1h, 24h, 7d, 30d - default: 24h)
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTokensProcessed": 10500,
      "totalMessages": 450,
      "averageLatency": 920,
      "totalConversations": 24,
      "totalAgents": 2,
      "period": "24h"
    },
    "metrics": [
      {
        "id": "met-123",
        "conversationId": "c123-d456-e789",
        "tokensProcessed": 15,
        "responseLatency": 850,
        "messageCount": 2,
        "timestamp": "2024-12-26T16:06:40.148Z"
      }
    ]
  }
}
```

### 2. Get Per-Agent Metrics
Retrieve metrics for a specific agent.

- **URL:** `/:agentId`
- **Method:** `GET`
- **Query Params:** `period` (1h, 24h, 7d, 30d - default: 24h)
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTokensProcessed": 5200,
      "totalMessages": 120,
      "averageLatency": 880,
      "totalConversations": 8,
      "period": "24h"
    },
    "metrics": [
      {
        "id": "met-124",
        "conversationId": "c123-d456-e789",
        "tokensProcessed": 20,
        "responseLatency": 900,
        "messageCount": 4,
        "timestamp": "2024-12-26T16:06:40.148Z"
      }
    ]
  }
}
```

---

## 🔌 WebSockets (Socket.io)
Base Path: `/metrics` (Requires Auth via token in `auth` object)

### 1. Connection
Connect to the metrics namespace for real-time updates.
```javascript
const socket = io('http://localhost:4000/metrics', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

### 2. Events (Client to Server)
- `subscribe:agent`: Subscribe to real-time metrics for a specific agent.
  - Argument: `agentId` (string)
- `unsubscribe:agent`: Stop receiving metrics for a specific agent.
  - Argument: `agentId` (string)

### 3. Events (Server to Client)
- `metrics:update`: Received every 5 seconds for subscribed agents if new metrics are available.
  - Payload:
  ```json
  {
    "agentId": "a123...",
    "metrics": [...],
    "timestamp": "2024-12-26T16:06:40.148Z"
  }
  ```
- `error`: Received if something goes wrong (e.g., agent not found).

---

## 🛡️ Validation & Error Handling

### Request Validation
The API uses **Joi** for request validation. Invalid requests return a 400 status with detailed error information.

### Standard Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Agent is currently inactive"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Agent not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

### Validation Rules

#### User Validation
- **Email:** Required, valid email format
- **Password:** Required, minimum 8 characters
- **Name:** Optional, 2-100 characters
- **Verification Token:** Required for email verification, 6 digits

#### Agent Validation
- **Name:** Required, 2-100 characters
- **System Prompt:** Required, 10-5000 characters
- **Provider:** Optional, must be 'openai' or 'gemini'
- **Model:** Optional, must be a valid model name from the supported list
- **Temperature:** Optional, 0 to 2 (default 0.7)
- **Max Tokens:** Optional, 100 to 8000 (default 1000)

#### Chat Validation
- **Message:** Required, 1-10000 characters
- **Conversation ID:** Optional, must be a valid UUID

---

## 🔐 Security Features

### Rate Limiting
- **Window:** 15 minutes (900000 ms)
- **Max Requests:** 100 per window per IP
- Configurable via environment variables

### Password Security
- **Hashing:** Bcrypt with configurable rounds (default: 10)
- **Password Requirements:** Minimum 8 characters

### JWT Security
- **Access Token:** 7 days expiration
- **Refresh Token:** 30 days expiration
- **Algorithm:** HS256

### CORS Configuration
- **Origin:** Configurable via CLIENT_URL environment variable
- **Credentials:** Enabled
- **Methods:** GET, POST, PUT, DELETE, PATCH

---

## 📊 Database & ORM

The backend uses **Drizzle ORM** with PostgreSQL for database management.

### Key Tables
- **users:** User accounts and authentication
- **agents:** AI agent configurations
- **conversations:** Chat conversations
- **messages:** Individual chat messages
- **metrics:** Performance and usage metrics

### Management Commands
```bash
# Generate SQL migrations based on schema changes
npm run db:generate

# Push schema changes directly to the database (development)
npm run db:push

# Open Drizzle Studio to explore your data
npm run db:studio
```

---

## 🌍 Environment Variables

Refer to `.env.example` for all available configuration options:

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `OPENAI_API_KEY`: OpenAI API key
- `GEMINI_API_KEY`: Google Gemini API key
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Email configuration

### Optional Variables
- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port (default: 4000)
- `CLIENT_URL`: Frontend URL for CORS
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 10)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS`: Rate limit max requests (default: 100)

---

## 🚀 Getting Started

1. **Clone and Install:**
   ```bash
   git clone <repository>
   cd backend
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup:**
   ```bash
   npm run db:push
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:4000/health
   ```

The API will be available at `http://localhost:4000/api` with comprehensive endpoints for user management, AI agent creation, chat functionality, and analytics.
