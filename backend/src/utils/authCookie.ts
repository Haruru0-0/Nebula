import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";

/** The short-lived access token lives in this HttpOnly cookie, so page scripts can never read it. */
export const AUTH_COOKIE = "nebula_session";
/** The refresh token: HttpOnly, and only sent to /api/auth/* (the refresh and logout calls). */
export const REFRESH_COOKIE = "nebula_refresh";
const REFRESH_PATH = "/api/auth";

/**
 * Cookie flags. The default (Lax) fits a frontend and API on the same site, including localhost on different
 * ports. If they are on different sites, set COOKIE_SAMESITE=none (which also needs HTTPS, so the cookie is Secure);
 * some browsers block such third-party cookies, so a shared parent domain or a proxy is more reliable.
 */
const sameSite = ((process.env.COOKIE_SAMESITE ?? "lax").toLowerCase() as "lax" | "strict" | "none");
const secure = sameSite === "none" || process.env.COOKIE_SECURE === "1" || process.env.NODE_ENV === "production";

const baseOptions = (): CookieOptions => ({ httpOnly: true, secure, sameSite, path: "/" });

/** When this token stops being valid (ms since the epoch), or null if it cannot be read. */
export const tokenExpiryMs = (token: string): number | null => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return decoded?.exp ? decoded.exp * 1000 : null;
};

/** Put the login token in the cookie. Returns when it expires, so the client can show "session ended" on time. */
export const setAuthCookie = (res: Response, token: string): number | null => {
  const expiresAt = tokenExpiryMs(token);
  res.cookie(AUTH_COOKIE, token, {
    ...baseOptions(),
    ...(expiresAt ? { maxAge: Math.max(expiresAt - Date.now(), 0) } : {}),
  });
  return expiresAt;
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE, baseOptions());
};

export const cookieToken = (req: Request): string | undefined => {
  const value = (req as Request & { cookies?: Record<string, unknown> }).cookies?.[AUTH_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

/**
 * Set the refresh cookie. With "remember me" it lasts until the sign-in ends; without it, it is a session cookie
 * that the browser drops when it closes (the server also ends such a sign-in after a day).
 */
export const setRefreshCookie = (res: Response, token: string, remember: boolean, sessionEndsAt: number): void => {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions(),
    path: REFRESH_PATH,
    ...(remember ? { maxAge: Math.max(sessionEndsAt - Date.now(), 0) } : {}),
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(), path: REFRESH_PATH });
};

export const refreshCookieToken = (req: Request): string | undefined => {
  const value = (req as Request & { cookies?: Record<string, unknown> }).cookies?.[REFRESH_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};
