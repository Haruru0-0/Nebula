import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { config } from "./config";

const signAccessToken = (userId: string): string => {
  const secret: Secret = config.jwt.accessSecret;
  const options: SignOptions = { expiresIn: config.jwt.accessTtl };
  return jwt.sign({ userId } as JWTPayload, secret, options);
};

const signRefreshToken = (userId: string): string => {
  const secret: Secret = config.jwt.refreshSecret;
  const options: SignOptions = { expiresIn: config.jwt.refreshTtl };
  return jwt.sign({ userId } as JWTPayload, secret, options);
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
  verifyAccessToken,
  verifyRefreshToken,
  isJwtPayload,
};