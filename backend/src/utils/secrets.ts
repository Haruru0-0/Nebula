import crypto from "crypto";
import { config } from "./config";

/**
 * Encrypts small secrets (users' own AI provider keys) for storage. AES-256-GCM, key derived from
 * KEY_ENCRYPTION_SECRET. Format: v1:<iv>:<tag>:<ciphertext>, all base64. Never log the inputs or outputs.
 */
const keyFromSecret = (): Buffer => {
  if (!config.keyEncryptionSecret) {
    throw new Error("KEY_ENCRYPTION_SECRET is not set");
  }
  return crypto.createHash("sha256").update(config.keyEncryptionSecret).digest();
};

export const isEncryptionConfigured = (): boolean => config.keyEncryptionSecret.length > 0;

export const encryptSecret = (plain: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyFromSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(":");
};

export const decryptSecret = (stored: string): string => {
  const [version, iv, tag, data] = stored.split(":");
  if (version !== "v1" || !iv || !tag || !data) {
    throw new Error("Unsupported secret format");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyFromSecret(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
};
