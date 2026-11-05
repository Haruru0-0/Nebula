import crypto from "crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
import { db } from "../drizzle/db";
import { refreshTokens } from "../drizzle/schema";

/** How long one sign-in lasts in total. "Remember me" keeps it across browser restarts and for longer. */
const DAY_MS = 24 * 60 * 60 * 1000;
const REMEMBER_DAYS = parseInt(process.env.SESSION_REMEMBER_DAYS || "30");
const SHORT_DAYS = parseInt(process.env.SESSION_DAYS || "1");
/** A second refresh with an already-used token inside this window is two tabs racing, not theft. */
const REUSE_GRACE_MS = 10_000;

const hash = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");
const newToken = (): string => crypto.randomBytes(32).toString("base64url");

export class RefreshError extends Error {
  constructor(public reason: "missing" | "unknown" | "expired" | "reused" | "raced") {
    super(`Refresh refused: ${reason}`);
  }
}

export interface IssuedSession {
  userId: string;
  refreshToken: string;
  remember: boolean;
  /** When this sign-in ends for good (ms since the epoch). */
  sessionEndsAt: number;
}

/** Start a sign-in: returns the first refresh token. */
export const startSession = async (userId: string, remember: boolean): Promise<IssuedSession> => {
  const sessionEndsAt = Date.now() + (remember ? REMEMBER_DAYS : SHORT_DAYS) * DAY_MS;
  const refreshToken = newToken();
  await db.insert(refreshTokens).values({
    userId,
    familyId: crypto.randomUUID(),
    tokenHash: hash(refreshToken),
    remember,
    sessionEndsAt: new Date(sessionEndsAt),
  });
  // Housekeeping: forget sign-ins that ended more than a day ago
  await db.delete(refreshTokens).where(lt(refreshTokens.sessionEndsAt, new Date(Date.now() - DAY_MS)));
  return { userId, refreshToken, remember, sessionEndsAt };
};

/**
 * Swap a refresh token for a new one. Each token works once: using it again after the grace window means it was
 * copied, so the whole sign-in is ended.
 */
export const rotateSession = async (token: string | undefined): Promise<IssuedSession> => {
  if (!token) throw new RefreshError("missing");
  const row = await db.query.refreshTokens.findFirst({ where: eq(refreshTokens.tokenHash, hash(token)) });
  if (!row || row.revokedAt) throw new RefreshError("unknown");
  if (row.sessionEndsAt.getTime() <= Date.now()) throw new RefreshError("expired");

  // Claim the token. Only one request can flip usedAt from null, so a copy cannot also succeed.
  const claimed = await db
    .update(refreshTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(refreshTokens.id, row.id), isNull(refreshTokens.usedAt)))
    .returning({ id: refreshTokens.id });

  if (claimed.length === 0) {
    const usedAt = row.usedAt?.getTime() ?? 0;
    if (Date.now() - usedAt <= REUSE_GRACE_MS) throw new RefreshError("raced");
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.familyId, row.familyId));
    throw new RefreshError("reused");
  }

  const refreshToken = newToken();
  await db.insert(refreshTokens).values({
    userId: row.userId,
    familyId: row.familyId,
    tokenHash: hash(refreshToken),
    remember: row.remember,
    sessionEndsAt: row.sessionEndsAt,
  });
  return { userId: row.userId, refreshToken, remember: row.remember, sessionEndsAt: row.sessionEndsAt.getTime() };
};

/** End one sign-in (logout). Safe to call with a missing or unknown token. */
export const endSession = async (token: string | undefined): Promise<void> => {
  if (!token) return;
  const row = await db.query.refreshTokens.findFirst({ where: eq(refreshTokens.tokenHash, hash(token)) });
  if (row) await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.familyId, row.familyId));
};

/** End every sign-in of a user (password changed or reset). */
export const endAllSessions = async (userId: string): Promise<void> => {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
};

/** End the user's other sign-ins but keep the one holding `keepToken` (a password change on this device). */
export const endOtherSessions = async (userId: string, keepToken: string | undefined): Promise<void> => {
  const keep = keepToken
    ? await db.query.refreshTokens.findFirst({ where: eq(refreshTokens.tokenHash, hash(keepToken)) })
    : undefined;
  const others = await db.query.refreshTokens.findMany({
    where: and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    columns: { familyId: true },
  });
  for (const familyId of new Set(others.map((o) => o.familyId))) {
    if (familyId !== keep?.familyId) {
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.familyId, familyId));
    }
  }
};
