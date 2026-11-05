import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { config } from "./config";

/** `sessionEndsAt` (ms) rides along so the page can learn when the whole sign-in ends, not just this short token. */
const signAccessToken = (userId: string, sessionEndsAt?: number): string => {
  const secret: Secret = config.jwt.accessSecret;
  const options: SignOptions = { expiresIn: config.jwt.accessTtl };
  return jwt.sign({ userId, ...(sessionEndsAt ? { sx: sessionEndsAt } : {}) }, secret, options);
};

const signRefreshToken = (userId: string): string => {
  const secret: Secret = config.jwt.refreshSecret;
  const options: SignOptions = { expiresIn: config.jwt.refreshTtl };
  return jwt.sign({ userId } as JWTPayload, secret, options);
};

/**
 * A one-minute ticket for the two things that connect straight to the backend without the cookie: the chat stream
 * and the live-metrics socket. It carries `purpose: "ticket"`, so it is refused anywhere else (see authenticate).
 */
const signSocketToken = (userId: string): string => {
  const secret: Secret = config.jwt.accessSecret;
  return jwt.sign({ userId, purpose: "ticket" }, secret, { expiresIn: "60s" });
};

const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

const isJwtPayload = (x: unknown): x is JWTPayload => {
  return !!x && typeof x === "object" && "sub" in (x as any);
};

export {
  signAccessToken,
  signRefreshToken,
  signSocketToken,
  verifyAccessToken,
  verifyRefreshToken,
  isJwtPayload,
};