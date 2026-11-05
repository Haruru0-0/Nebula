import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { and, eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { apiKeys } from "../drizzle/schema";
import { config } from "../utils/config";
import { decryptSecret, encryptSecret } from "../utils/secrets";

export const PROVIDERS = ["openai", "gemini", "deepseek"] as const;

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
export type Provider = (typeof PROVIDERS)[number];

const LABELS: Record<Provider, string> = { openai: "OpenAI", gemini: "Gemini", deepseek: "DeepSeek" };
export const providerLabel = (p: Provider): string => LABELS[p];
export const isProvider = (v: unknown): v is Provider => PROVIDERS.includes(v as Provider);

/** Thrown when neither the user nor the server has a key for the agent's provider. */
export class ApiKeyMissingError extends Error {
  statusCode = 400;
  code = "API_KEY_MISSING";
  constructor(public provider: Provider) {
    super(`Add your ${providerLabel(provider)} API key in Profile to use this agent.`);
  }
}

const serverKey = (provider: Provider): string =>
  provider === "gemini" ? config.geminiApiKey : provider === "deepseek" ? config.deepseekApiKey : config.openAiApiKey;

/** Which providers have a shared server key (so the app works without the user adding one). */
export const serverKeyAvailable = (): Record<Provider, boolean> => ({
  openai: serverKey("openai").length > 0,
  gemini: serverKey("gemini").length > 0,
  deepseek: serverKey("deepseek").length > 0,
});

/** The key to use for this user and provider: their own if saved, else the server's, else an error. */
export const resolveApiKey = async (userId: string, provider: Provider): Promise<string> => {
  const row = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)),
    columns: { encryptedKey: true },
  });
  if (row) return decryptSecret(row.encryptedKey);
  const shared = serverKey(provider);
  if (shared) return shared;
  throw new ApiKeyMissingError(provider);
};

export const listKeys = async (userId: string) => {
  return db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, userId),
    columns: { provider: true, keyHint: true, updatedAt: true },
  });
};

export const saveKey = async (userId: string, provider: Provider, apiKey: string): Promise<{ hint: string }> => {
  const hint = apiKey.slice(-4);
  const encryptedKey = encryptSecret(apiKey);
  await db
    .insert(apiKeys)
    .values({ userId, provider, encryptedKey, keyHint: hint })
    .onConflictDoUpdate({
      target: [apiKeys.userId, apiKeys.provider],
      set: { encryptedKey, keyHint: hint, updatedAt: new Date() },
    });
  return { hint };
};

export const removeKey = async (userId: string, provider: Provider): Promise<boolean> => {
  const deleted = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)))
    .returning({ id: apiKeys.id });
  return deleted.length > 0;
};

/**
 * Checks a key with the provider before saving it. Only a clear "this key is wrong" answer rejects it;
 * a network problem or anything unexpected accepts the key, so a provider outage never blocks saving.
 * Set SKIP_KEY_VERIFY=1 to skip the call (used by tests).
 */
export const keyLooksRejected = async (provider: Provider, apiKey: string): Promise<boolean> => {
  if (process.env.SKIP_KEY_VERIFY === "1") return false;
  try {
    if (provider === "openai") {
      await new OpenAI({ apiKey }).models.list();
    } else if (provider === "deepseek") {
      await new OpenAI({ apiKey, baseURL: DEEPSEEK_BASE_URL }).models.list();
    } else {
      await new GoogleGenAI({ apiKey }).models.list({ config: { pageSize: 1 } });
    }
    return false;
  } catch (error: any) {
    if (provider !== "gemini") return error?.status === 401;
    return /api key (not valid|is invalid)|API_KEY_INVALID|invalid api key/i.test(String(error?.message ?? ""));
  }
};
