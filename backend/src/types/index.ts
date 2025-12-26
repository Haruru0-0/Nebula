import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    isVerified: boolean;
  };
}

export interface JWTPayload {
  userId: string;
}

export interface SignUpBody {
  email: string;
  password: string;
  name?: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  password: string;
}

export interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

export interface VerifyEmailBody {
  token: string;
  email: string;
}

export interface ResendVerificationBody {
  email: string;
}

export interface CreateAgentBody {
  name: string;
  systemPrompt: string;
  model?: string;
  provider?: 'openai' | 'gemini';
  temperature?: number;
  maxTokens?: number;
}

export interface UpdateAgentBody {
  name?: string;
  systemPrompt?: string;
  model?: string;
  provider?: 'openai' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
}

export interface SendMessageBody {
  message: string;
  conversationId?: string;
}

export interface LLMResponse {
  message: string;
  tokensProcessed: number;
  responseLatency: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MetricsQuery {
  period?: '1h' | '24h' | '7d' | '30d';
}

export interface SocketData {
  userId: string;
}