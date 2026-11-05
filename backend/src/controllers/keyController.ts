import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import logger from "../utils/logger";
import { isEncryptionConfigured } from "../utils/secrets";
import { forgetModels, listModels } from "../services/modelCatalog";
import {
  ApiKeyMissingError,
  isProvider,
  keyLooksRejected,
  listKeys,
  providerLabel,
  removeKey,
  resolveApiKey,
  saveKey,
  serverKeyAvailable,
} from "../services/apiKeyService";

const PREFIX: Record<string, string> = { openai: "sk-", gemini: "AIza", deepseek: "sk-" };

/** The user's saved keys, never the keys themselves: provider, last four characters and when it changed. */
export const getKeys = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const keys = await listKeys(req.user!.id);
    res.json({
      success: true,
      data: {
        keys: keys.map((k) => ({ provider: k.provider, hint: k.keyHint, updatedAt: k.updatedAt })),
        sharedKey: serverKeyAvailable(),
        canSave: isEncryptionConfigured(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const putKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;
    if (!isProvider(provider)) {
      res.status(400).json({ success: false, message: "Unknown provider. Use openai, gemini or deepseek." });
      return;
    }
    if (!isEncryptionConfigured()) {
      res.status(503).json({ success: false, message: "Saving keys is not set up on this server." });
      return;
    }
    const apiKey = typeof req.body?.apiKey === "string" ? req.body.apiKey.trim() : "";
    if (apiKey.length < 20 || apiKey.length > 300 || /\s/.test(apiKey)) {
      res.status(400).json({ success: false, message: "That does not look like an API key. Paste it without spaces." });
      return;
    }
    if (!apiKey.startsWith(PREFIX[provider])) {
      res.status(400).json({
        success: false,
        message: `${providerLabel(provider)} keys start with "${PREFIX[provider]}". Check you copied the right one.`,
      });
      return;
    }
    if (await keyLooksRejected(provider, apiKey)) {
      res.status(400).json({ success: false, message: `${providerLabel(provider)} rejected that key. Check it and try again.` });
      return;
    }
    const { hint } = await saveKey(req.user!.id, provider, apiKey);
    forgetModels(req.user!.id, provider);
    // Log that a key was saved, never the key itself
    logger.info(`API key saved for user ${req.user!.id}, provider ${provider}`);
    res.json({ success: true, data: { provider, hint } });
  } catch (error) {
    next(error);
  }
};

/**
 * The newest chat models for a provider, listed with the user's own key (or the shared one). When that is not
 * possible the answer says why in `source` and the client falls back to its built-in list.
 */
export const getModels = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;
    if (!isProvider(provider)) {
      res.status(400).json({ success: false, message: "Unknown provider. Use openai, gemini or deepseek." });
      return;
    }
    try {
      const apiKey = await resolveApiKey(req.user!.id, provider);
      const models = await listModels(provider, apiKey, `${req.user!.id}:${provider}`);
      res.json({ success: true, data: { models, source: models.length > 0 ? "provider" : "unavailable" } });
    } catch (error) {
      const source = error instanceof ApiKeyMissingError ? "no-key" : "unavailable";
      if (source === "unavailable") logger.warn(`Could not list ${provider} models: ${(error as Error).message}`);
      res.json({ success: true, data: { models: [], source } });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteKey = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider } = req.params;
    if (!isProvider(provider)) {
      res.status(400).json({ success: false, message: "Unknown provider. Use openai, gemini or deepseek." });
      return;
    }
    const removed = await removeKey(req.user!.id, provider);
    forgetModels(req.user!.id, provider);
    res.json({ success: true, data: { provider, removed } });
  } catch (error) {
    next(error);
  }
};
