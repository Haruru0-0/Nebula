export interface User {
  id: string
  email: string
  name?: string
  isVerified?: boolean
  createdAt: string
  updatedAt?: string
}

export interface AuthData {
  user: User
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface Agent {
  id: string
  name: string
  systemPrompt: string
  provider?: 'openai' | 'gemini'
  model: string
  temperature: number
  maxTokens: number
  userId: string
  isActive: boolean
  tools: string[]
  createdAt: string
  updatedAt: string

  _count?: {
    conversations: number
  }
  isFavorite?: boolean // Keep for frontend UI logic
}

export interface Conversation {
  id: string
  userId: string
  agentId: string
  title: string
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
  _count?: {
    messages: number
  }
  agent?: Partial<Agent>
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  tokenCount?: number
  createdAt: string
}

export interface MetricPoint {
  id: string
  conversationId: string
  tokensProcessed: number
  responseLatency: number
  messageCount: number
  timestamp: string
}

export interface MetricsSummary {
  totalTokensProcessed: number
  totalMessages: number
  averageLatency: number
  totalConversations: number
  totalAgents: number
  period: string
}

export interface Metrics {
  tokensProcessed: number
  avgLatency: number
  messageCount: number
  errorRate: number
  latencyHistory: Array<{ timestamp: Date | string, value: number }>
  tokensHistory: Array<{ timestamp: Date | string, value: number }>
  messagesHistory: Array<{ timestamp: Date | string, value: number }>
}


export interface MetricsResponse {
  summary: MetricsSummary
  metrics: MetricPoint[]
}

export type LoginPayload = {
  email: string
  password: string
}

export type SignupPayload = LoginPayload & {
  name?: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
}

export type VerifyEmailPayload = {
  token: string
  email: string
}

export type ResendVerificationPayload = {
  email: string
}
