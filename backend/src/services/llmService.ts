import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import logger from "../utils/logger";
import { LLMResponse } from "../types";
import { Agent, Message } from "../drizzle/schema";
import { resolveApiKey, Provider } from "./apiKeyService";

// Clients are created per request with the key of the user making it (their own key, else the shared server key).

// OpenAI Implementation
const sendMessageOpenAI = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string,
  apiKey: string
): Promise<LLMResponse> => {
  const startTime = Date.now();
  const openai = new OpenAI({ apiKey });

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: agent.systemPrompt,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
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
    const assistantMessage = response.choices[0]?.message?.content || "";
    const usage = response.usage!;

    const tokensProcessed = usage.prompt_tokens + usage.completion_tokens;

    logger.info(
      `OpenAI Response - Model: ${agent.model}, Tokens: ${tokensProcessed}, Latency: ${responseLatency}ms`
    );

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
    logger.error("OpenAI Error:", error);

    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (error.status === 401) {
      throw new Error("OpenAI rejected your API key. Check it in Profile.");
    }
    if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API");
    }

    throw new Error("Failed to get response from OpenAI");
  }
};

// Gemini Implementation using latest @google/genai
const sendMessageGemini = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string,
  apiKey: string
): Promise<LLMResponse> => {
  const startTime = Date.now();
  const genAI = new GoogleGenAI({ apiKey });

  try {
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    const chat = genAI.chats.create({
      model: agent.model,
      config: {
        temperature: agent.temperature,
        maxOutputTokens: agent.maxTokens,
        systemInstruction: agent.systemPrompt,
      },
      history,
    });

    const result = await chat.sendMessage({ message: userMessage });
    const assistantMessage = result.text || "";
    const responseLatency = Date.now() - startTime;

    const usageMetadata = result.usageMetadata;
    const promptTokens = usageMetadata?.promptTokenCount || 0;
    const completionTokens = usageMetadata?.candidatesTokenCount || 0;
    const tokensProcessed = promptTokens + completionTokens;

    logger.info(
      `Gemini Response - Model: ${agent.model}, Tokens: ${tokensProcessed}, Latency: ${responseLatency}ms`
    );

    return {
      message: assistantMessage,
      tokensProcessed,
      responseLatency,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: tokensProcessed,
      },
    };
  } catch (error: any) {
    logger.error("Gemini Error:", error);

    if (error.message?.includes("API key")) {
      throw new Error("Gemini rejected your API key. Check it in Profile.");
    }
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      throw new Error("Gemini quota exceeded. Please try again later.");
    }
    if (error.message?.includes("SAFETY")) {
      throw new Error("Content filtered by Gemini safety settings");
    }

    throw new Error("Failed to get response from Gemini");
  }
};

// Main function that routes to the correct provider
export const sendMessage = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string,
  userId: string
): Promise<LLMResponse> => {
  const provider: Provider = agent.provider === "gemini" ? "gemini" : "openai";
  const apiKey = await resolveApiKey(userId, provider);

  if (provider === "gemini") {
    return sendMessageGemini(agent, conversationHistory, userMessage, apiKey);
  } else {
    return sendMessageOpenAI(agent, conversationHistory, userMessage, apiKey);
  }
};

// Streaming support
export const streamMessage = async (
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string,
  userId: string
): Promise<{
  stream:
  | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  | AsyncIterable<any>;
  startTime: number;
  provider: string;
}> => {
  const startTime = Date.now();
  const provider: Provider = agent.provider === "gemini" ? "gemini" : "openai";
  const apiKey = await resolveApiKey(userId, provider);

  if (provider === "gemini") {
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const history = conversationHistory.map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.content }],
      }));

      const chat = genAI.chats.create({
        model: agent.model,
        config: {
          temperature: agent.temperature,
          maxOutputTokens: agent.maxTokens,
          systemInstruction: agent.systemPrompt,
        },
        history,
      });

      // Returns the stream object directly
      const result = await chat.sendMessageStream({ message: userMessage });

      return {
        stream: result,
        startTime,
        provider: "gemini",
      };
    } catch (error) {
      logger.error("Gemini Streaming Error:", error);
      if (String((error as Error)?.message ?? "").includes("API key")) {
        throw new Error("Gemini rejected your API key. Check it in Profile.");
      }
      throw new Error("Failed to initiate Gemini streaming response");
    }
  } else {
    try {
      const openai = new OpenAI({ apiKey });
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: agent.systemPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        {
          role: "user" as const,
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
        provider: "openai",
      };
    } catch (error) {
      logger.error("OpenAI Streaming Error:", error);
      if ((error as { status?: number })?.status === 401) {
        throw new Error("OpenAI rejected your API key. Check it in Profile.");
      }
      throw new Error("Failed to initiate OpenAI streaming response");
    }
  }
};
