import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { DEEPSEEK_BASE_URL, Provider } from "./apiKeyService";

export interface ModelOption {
  id: string;
  name: string;
}

const MAX_MODELS = 12;
const TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; models: ModelOption[] }>();

/** OpenAI: chat models only, newest first, without dated snapshots and non-chat families. */
const looksLikeOpenAiChatModel = (id: string): boolean =>
  /^(gpt-|o\d|chatgpt-)/.test(id) &&
  !/(audio|realtime|tts|transcribe|image|embedding|moderation|search|instruct|codex|vision|whisper|dall)/.test(id) &&
  !/-\d{4}-\d{2}-\d{2}$/.test(id) &&
  !/-\d{4}$/.test(id);

const openAiName = (id: string): string => id.replace(/^gpt/i, "GPT");

export const selectOpenAiModels = (raw: { id: string; created: number }[]): ModelOption[] =>
  raw
    .filter((m) => looksLikeOpenAiChatModel(m.id))
    .sort((a, b) => b.created - a.created)
    .slice(0, MAX_MODELS)
    .map((m) => ({ id: m.id, name: openAiName(m.id) }));

const listOpenAi = async (apiKey: string): Promise<ModelOption[]> => {
  const page = await new OpenAI({ apiKey }).models.list();
  return selectOpenAiModels(page.data);
};

/** DeepSeek: its list is OpenAI-shaped; keep chat models, newest first. */
export const selectDeepSeekModels = (raw: { id: string; created?: number }[]): ModelOption[] =>
  raw
    .filter((m) => m.id.startsWith("deepseek-") && !/(embed|ocr|vl)/.test(m.id))
    .sort((a, b) => (b.created ?? 0) - (a.created ?? 0) || a.id.localeCompare(b.id))
    .slice(0, MAX_MODELS)
    .map((m) => ({ id: m.id, name: m.id }));

const listDeepSeek = async (apiKey: string): Promise<ModelOption[]> => {
  const page = await new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE_URL }).models.list();
  return selectDeepSeekModels(page.data);
};

const GEMINI_SKIP = /(embedding|tts|image|live|robotics|computer-use|aqa|native-audio|-exp)/;
const GEMINI_DATED = /(-\d{3}|-\d{2}-\d{2}|-\d{2}-\d{4})$/;
const TIER_RANK: Record<string, number> = { ultra: 0, pro: 1, flash: 2, "flash-lite": 3 };

/** Sort key for ids like gemini-3.0-pro or gemini-2.5-flash-lite: version first, then tier. */
const geminiRank = (id: string): [number, number] => {
  const m = id.match(/^gemini-(\d+(?:\.\d+)?)-?(ultra|pro|flash-lite|flash)?/);
  return [m ? parseFloat(m[1]) : 0, m?.[2] ? TIER_RANK[m[2]] : 9];
};

export const selectGeminiModels = (
  raw: { name?: string; displayName?: string; supportedActions?: string[] }[]
): ModelOption[] => {
  const found: ModelOption[] = [];
  for (const m of raw) {
    const id = (m.name ?? "").replace(/^models\//, "");
    if (!id.startsWith("gemini-")) continue;
    if (!(m.supportedActions ?? []).includes("generateContent")) continue;
    if (GEMINI_SKIP.test(id) || GEMINI_DATED.test(id)) continue;
    found.push({ id, name: m.displayName || id });
  }
  return found
    .sort((a, b) => {
      const [va, ta] = geminiRank(a.id);
      const [vb, tb] = geminiRank(b.id);
      return vb - va || ta - tb;
    })
    .slice(0, MAX_MODELS);
};

const listGemini = async (apiKey: string): Promise<ModelOption[]> => {
  const pager = await new GoogleGenAI({ apiKey }).models.list({ config: { pageSize: 100 } });
  const raw: { name?: string; displayName?: string; supportedActions?: string[] }[] = [];
  for await (const m of pager) raw.push(m);
  return selectGeminiModels(raw);
};

/** Forget a user's cached list (their key changed, so what they can use may have too). */
export const forgetModels = (userId: string, provider: Provider): void => {
  cache.delete(`${userId}:${provider}`);
};

/** The newest chat models this key can use, cached for ten minutes per key. Throws if the provider call fails. */
export const listModels = async (provider: Provider, apiKey: string, cacheKey: string): Promise<ModelOption[]> => {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.models;
  const models =
    provider === "gemini" ? await listGemini(apiKey) : provider === "deepseek" ? await listDeepSeek(apiKey) : await listOpenAi(apiKey);
  cache.set(cacheKey, { at: Date.now(), models });
  return models;
};
