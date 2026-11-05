export type Provider = "openai" | "gemini" | "deepseek"

export interface ModelChoice {
  id: string
  name: string
}

export interface ProviderInfo {
  id: Provider
  label: string
  /** Shown on the provider tile. */
  tagline: string
  placeholder: string
  where: string
  /** Used when the live model list is not available (no key, or the provider could not be reached). */
  models: ModelChoice[]
}

// Built-in model lists go stale. They are only the fallback; the dialog asks the backend for the live list.
export const PROVIDERS: ProviderInfo[] = [
  {
    id: "openai",
    label: "OpenAI",
    tagline: "GPT",
    placeholder: "sk-...",
    where: "platform.openai.com/api-keys",
    models: [
      { id: "gpt-6-astra", name: "GPT-6 Astra" },
      { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
      { id: "gpt-6.1-terra", name: "GPT-6.1 Terra" },
      { id: "gpt-6-luna", name: "GPT-6 Luna" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    tagline: "Gemini",
    placeholder: "AIza...",
    where: "aistudio.google.com/apikey",
    models: [
      { id: "gemini-4-argon", name: "Gemini 4 Argon" },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (preview)" },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    tagline: "DeepSeek",
    placeholder: "sk-...",
    where: "platform.deepseek.com/api_keys",
    models: [
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
    ],
  },
]

export const providerInfo = (p?: string): ProviderInfo => PROVIDERS.find((x) => x.id === p) ?? PROVIDERS[0]

export const asProvider = (p?: string): Provider => providerInfo(p).id

export const providerName = (p?: string): string => (p === "gemini" ? "Gemini" : providerInfo(p).label)

/** OpenAI's newer models ignore the temperature setting. */
export const ignoresTemperature = (provider: string, model: string): boolean =>
  provider === "openai" && /^(gpt-[5-9]|o\d)/.test(model)
