import OpenAI from 'openai';
import logger from '../utils/logger';
import { LLMResponse } from '../types';
import { Agent, Message } from '../generated/prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const sendMessage = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string
): Promise<LLMResponse> => {
  const startTime = Date.now();

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: agent.systemPrompt,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const response = await openai.chat.completions.create({
      model: agent.model,
      messages,
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
    });

    const responseLatency = Date.now() - startTime;
    const assistantMessage = response.choices[0]?.message?.content || '';
    const usage = response.usage!;

    const tokensProcessed = usage.prompt_tokens + usage.completion_tokens;

    logger.info(`LLM Response - Model: ${agent.model}, Tokens: ${tokensProcessed}, Latency: ${responseLatency}ms`);

    return {
      message: assistantMessage,
      tokensProcessed,
      responseLatency,
      usage: {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
      },
    };
  } catch (error: any) {
    logger.error('OpenAI Error:', error);

    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (error.status === 401) {
      throw new Error('Invalid API key');
    }

    if (error.status === 400) {
      throw new Error('Invalid request to OpenAI API');
    }

    throw new Error('Failed to get response from AI model');
  }
};

export const streamMessage = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string
): Promise<{ stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>; startTime: number }> => {
  const startTime = Date.now();

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: agent.systemPrompt,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    const stream = await openai.chat.completions.create({
      model: agent.model,
      messages,
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
      stream: true,
    });

    return {
      stream,
      startTime,
    };
  } catch (error) {
    logger.error('OpenAI Streaming Error:', error);
    throw new Error('Failed to initiate streaming response');
  }
};