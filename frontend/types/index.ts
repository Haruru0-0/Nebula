export interface Agent {
  id: string
  name: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  tools: string[]
  lastUpdated: Date
  isFavorite?: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentId?: string
}

export interface MetricPoint {
  timestamp: Date
  value: number
}

export interface Metrics {
  tokensProcessed: number
  avgLatency: number
  messageCount: number
  errorRate: number
  latencyHistory: MetricPoint[]
  tokensHistory: MetricPoint[]
  messagesHistory: MetricPoint[]
}
