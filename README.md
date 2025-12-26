# Nebula - AI Agent Control Center

![Nebula Logo](./frontend/public/icon.png)

Nebula is a comprehensive AI Agent Management Platform that enables users to create, configure, and monitor AI agents powered by large language models (LLMs). The platform provides real-time analytics, secure authentication, and seamless integration with multiple LLM providers.

## 🚀 Features

- **Agent Management**: Create, edit, and delete AI agents with customizable system prompts
- **Multi-LLM Support**: Support for OpenAI (GPT models) and Google Gemini
- **Real-time Chat**: Interactive chat interface with persistent conversation history
- **Analytics Dashboard**: Comprehensive metrics including token usage, response latency, and conversation analytics
- **Real-time Monitoring**: WebSocket-based live metrics updates
- **Secure Authentication**: JWT-based authentication with email verification and password reset
- **Modern UI**: Responsive design with dark theme and glass morphism effects
- **Form Validation**: Client and server-side validation with meaningful error messages

## 🏗️ Architecture Overview

### Tech Stack

#### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with custom glass morphism components
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Redux Toolkit with Redux Persist
- **Form Handling**: React Hook Form with Zod validation
- **Real-time**: Socket.io client for live metrics
- **Charts**: Recharts for analytics visualization

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware stack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io for live metrics streaming
- **Email**: Nodemailer with SMTP configuration
- **Validation**: Joi for request validation
- **LLM Integration**: OpenAI GPT and Google Gemini APIs

#### Database Schema
- **Users**: Authentication and profile management
- **Agents**: AI agent configurations and settings
- **Conversations**: Chat history and message storage
- **Messages**: Individual chat messages with role-based content
- **Metrics**: Performance tracking and analytics data
- **Verification Tokens**: Email verification and password reset

### LLM Orchestration

The platform implements a flexible LLM orchestration system:

1. **Provider Abstraction**: Unified interface for multiple LLM providers
2. **Model Management**: Dynamic model selection based on provider capabilities
3. **Prompt Engineering**: Configurable system prompts for different agent behaviors
4. **Parameter Tuning**: Adjustable temperature, max tokens, and other LLM parameters
5. **Token Tracking**: Real-time token usage monitoring and cost analysis

### Real-time Data Flow

```
┌─────────────┐    WebSocket     ┌──────────────┐
│   Client    │ ←──────────────→ │   Backend    │
│  (React)    │                  │  (Node.js)   │
└─────────────┘                  └──────────────┘
       ↑                                 ↓
   Redux Store                    Socket.io Server
       ↑                                 ↓
  Components                 Metrics Collection
       ↑                           & Processing
   User Interface              ┌─────────────┐
                               │   Database  │
                               │ (PostgreSQL)│
                               └─────────────┘
```

## 📋 Prerequisites

- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 13 or higher
- **npm/yarn**: Package manager
- **Git**: For cloning the repository

### API Keys Required

- **OpenAI API Key**: For GPT model access
- **Google Gemini API Key**: For Gemini model access
- **SMTP Credentials**: For email verification and password reset

## 🛠️ Setup Instructions

### 1. Create Neon DB Project (REQUIRED FIRST STEP)

**Before cloning or running anything else:**

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string

### 2. Clone the Repository

```bash
git clone <repository-url>
cd Nebula
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Neon DB connection string to .env:
# DATABASE_URL=postgresql://username:password@your-neon-host.com:5432/nebula

# Set up the database (ONLY after adding DATABASE_URL to .env)
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

The backend will be available at `http://localhost:4000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`



### 5. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration. See the `.env.example` file for all required environment variables and their descriptions.

## 🚀 Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio for database management
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
Nebula/
├── README.md
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── drizzle/         # Database schema & migrations
│   │   ├── middlewares/     # Express middleware
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── websocket/       # Socket.io handlers
│   │   ├── app.ts           # Express app configuration
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   ├── drizzle.config.ts
│   └── API_DOCUMENTATION.md
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and configurations
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.mjs
└── docker-compose.yml       # Docker configuration
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

### Environment Considerations

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure production database
- Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [API Documentation](./backend/API_DOCUMENTATION.md)
- Review the code comments and type definitions
- Create an issue on GitHub

## 🙏 Acknowledgments

- OpenAI for GPT API access
- Google for Gemini API access
- The Next.js and React communities
- Drizzle ORM for excellent database tooling
- Radix UI for accessible component primitives