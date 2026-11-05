import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../types";
import { cookieToken, tokenExpiryMs } from "../utils/authCookie";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fromCookie = cookieToken(req);
    const authHeader = req.headers.authorization;
    const token = fromCookie ?? (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
      });
      return;
    }

    // A cookie is sent by the browser on any request to this API, including ones another site makes. Require a
    // custom header on anything that changes data: other sites cannot add it without a CORS preflight we refuse.
    if (fromCookie && !["GET", "HEAD", "OPTIONS"].includes(req.method) && req.headers["x-requested-with"] !== "nebula") {
      res.status(403).json({ success: false, message: "Missing request header" });
      return;
    }

    const decoded = verifyAccessToken(token);

    // A ticket (what the page holds in memory for the stream and socket) works only for starting a chat stream.
    // Stolen, it cannot read data, change a password or do anything else.
    if ((decoded as { purpose?: string }).purpose === "ticket") {
      const isStream = req.method === "POST" && /^\/api\/chat\/[^/]+\/stream$/.test(req.originalUrl.split("?")[0]);
      if (fromCookie || !isStream) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
        return;
      }
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
      columns: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    req.sessionExpiresAt = (decoded as { sx?: number }).sx ?? tokenExpiryMs(token);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
