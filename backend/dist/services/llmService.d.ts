import OpenAI from "openai";
import { LLMResponse } from "../types";
import { Agent, Message } from "../drizzle/schema";
export declare const sendMessage: (agent: Agent, conversationHistory: Message[], userMessage: string) => Promise<LLMResponse>;
export declare const streamMessage: (agent: Agent, conversationHistory: Message[], userMessage: string) => Promise<{
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> | AsyncIterable<any>;
    startTime: number;
    provider: string;
}>;
//# sourceMappingURL=llmService.d.ts.map