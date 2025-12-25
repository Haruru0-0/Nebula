# Nebula API Documentation

This document provides detailed information about the Nebula backend API endpoints, request/response formats, and authentication.

## Base URL
The API is accessible at: `http://localhost:5000/api` (default development)

## Authentication
Most endpoints require authentication via a JSON Web Token (JWT).
- Include the token in the `Authorization` header as follows: `Authorization: Bearer <your_token>`
- You can obtain a token by signing up or signing in via the Auth endpoints.

---

## 🏥 Health Check
- **URL:** `/health`
- **Method:** `GET`
- **Success Response (200):**
```json
{
  "success": true,
  "message": "AI Agent Management API is running",
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```

---

## 🔐 Auth APIs
Base Path: `/auth`

### 1. Sign Up
Create a new user account.

- **URL:** `/signup`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123",
  "name": "John Doe" (optional)
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-10-27T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 2. Sign In
Authenticate an existing user.

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 3. Forgot Password
Request a password reset link.

- **URL:** `/forgot-password`
- **Method:** `POST`
- **Body:**
```json
{ "email": "user@example.com" }
```
- **Success Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

### 4. Reset Password
Reset password using a token.

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

### 5. Get Profile
Fetch the current user's profile information.

- **URL:** `/profile`
- **Method:** `GET` (Requires Auth)
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "u123-e456-i789",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": false,
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-27T10:00:00.000Z"
    }
  }
}
```

---

## 🤖 Agent APIs
Base Path: `/agents` (Requires Auth)

### 1. Create Agent
- **URL:** `/`
- **Method:** `POST`
- **Body:**
```json
{
  "name": "Support Bot",
  "systemPrompt": "You are a helpful assistant...",
  "provider": "openai" (optional, default: 'openai', supports: 'openai', 'gemini'),
  "model": "gpt-5.2",
  "temperature": 0.7,
  "maxTokens": 1000
}
```
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
      "model": "gpt-5.2",
      "temperature": 0.7,
      "maxTokens": 1000,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2023-10-27T10:05:00.000Z",
      "updatedAt": "2023-10-27T10:05:00.000Z"
    }
  }
}
```

### 2. Get All Agents
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
        "systemPrompt": "...",
        "model": "gpt-5.2",
        "temperature": 0.7,
        "maxTokens": 1000,
        "userId": "u123-e456-i789",
        "isActive": true,
        "createdAt": "2023-10-27T10:05:00.000Z",
        "updatedAt": "2023-10-27T10:05:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 3. Get Agent By ID
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
      "model": "gpt-5.2",
      "temperature": 0.7,
      "maxTokens": 1000,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2023-10-27T10:05:00.000Z",
      "updatedAt": "2023-10-27T10:05:00.000Z",
      "_count": {
        "conversations": 5
      }
    }
  }
}
```

### 4. Update Agent
- **URL:** `/:id`
- **Method:** `PUT`
- **Body:** (Any fields from Create Agent + `isActive`)
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
      "model": "gemini-1.5-pro",
      "temperature": 0.8,
      "maxTokens": 1000,
      "userId": "u123-e456-i789",
      "isActive": true,
      "createdAt": "2023-10-27T10:05:00.000Z",
      "updatedAt": "2023-10-27T10:10:00.000Z"
    }
  }
}
```

### 5. Delete Agent
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
Base Path: `/agents` (Requires Auth)

### 1. Send Message / Start Chat
- **URL:** `/:agentId/chat`
- **Method:** `POST`
- **Body:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "c123-d456-e789" (optional)
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
      "createdAt": "2023-10-27T10:15:00.000Z"
    },
    "metrics": {
      "tokensProcessed": 15,
      "responseLatency": 850
    }
  }
}
```

### 2. Get Conversations for Agent
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
        "createdAt": "2023-10-27T10:15:00.000Z",
        "updatedAt": "2023-10-27T10:15:00.000Z",
        "messages": [
          {
            "id": "m123-x456-y789",
            "content": "Hello, how are you?",
            "createdAt": "2023-10-27T10:15:00.000Z"
          }
        ],
        "_count": {
          "messages": 2
        }
      }
    ],
    "count": 1
  }
}
```

### 3. Get Specific Conversation
- **URL:** `/conversations/:conversationId`
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
      "createdAt": "2023-10-27T10:15:00.000Z",
      "updatedAt": "2023-10-27T10:15:00.000Z",
      "messages": [
        {
          "id": "m123-x456-y789",
          "role": "user",
          "content": "Hello, how are you?",
          "createdAt": "2023-10-27T10:15:00.000Z"
        },
        {
          "id": "m123-n456-o789",
          "role": "assistant",
          "content": "I am doing well...",
          "createdAt": "2023-10-27T10:15:01.000Z"
        }
      ],
      "agent": {
        "id": "a123-b456-c789",
        "name": "Support Bot",
        "model": "gpt-5.2"
      }
    }
  }
}
```

### 4. Delete Conversation
- **URL:** `/conversations/:conversationId`
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
        "timestamp": "2023-10-27T10:15:00.000Z"
      }
    ]
  }
}
```

### 2. Get Per-Agent Metrics
- **URL:** `/:agentId`
- **Method:** `GET`
- **Query Params:** `period`
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
        "timestamp": "2023-10-27T10:20:00.000Z"
      }
    ]
  }
}

---

## 🔌 WebSockets (Socket.io)
Base Path: `/metrics` (Requires Auth via token in `auth` object)

### 1. Connection
Connect to the `/metrics` namespace.
```javascript
const socket = io('http://localhost:5000/metrics', {
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
      "timestamp": "..."
    }
    ```
- `error`: Received if something goes wrong (e.g., agent not found).

---

## 🛡️ Validation & Data Models
The API uses **Joi** for request validation. Below are the key schemas applied to requests.

### 1. User Schemas
- **Sign Up**:
    - `email`: Required, valid email format.
    - `password`: Required, minimum 8 characters.
    - `name`: Optional, 2-100 characters.
- **Sign In**:
    - `email`: Required, valid email format.
    - `password`: Required.
- **Reset Password**:
    - `token`: Required.
    - `password`: Required, minimum 8 characters.

### 2. Agent Schemas
- **Create Agent**:
    - `name`: Required, 2-100 characters.
    - `systemPrompt`: Required, 10-5000 characters.
    - `provider`: Optional, `openai` or `gemini`.
    - `model`: Optional, specific AI model ID. Valid models include:
        - **OpenAI**: `gpt-5.2`, `gpt-5-mini`, `gpt-5-nano`, `gpt-5.2-pro`, `gpt-5`, `gpt-4.1`
        - **Gemini**: `gemini-3.0-pro`, `gemini-3.0-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`
    - `temperature`: Optional, 0 to 2 (default 0.7).
    - `maxTokens`: Optional, 100 to 8000.
- **Update Agent**: Same as Create Agent but all fields are optional, plus:
    - `isActive`: Optional boolean.

### 3. Chat Schemas
- **Send Message**:
    - `message`: Required, 1-10000 characters.
    - `conversationId`: Optional, valid UUID.

---

## 💾 Database & ORM
The backend uses **Drizzle ORM** for database management.

### Management Commands
- `npm run db:generate`: Generate SQL migrations based on schema changes.
- `npm run db:push`: Push schema changes directly to the database (useful for development).
- `npm run db:studio`: Open Drizzle Studio to explore your data.
```
