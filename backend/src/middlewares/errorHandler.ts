import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

interface CustomError extends Error {
  statusCode?: number;
  status?: number; // set by body-parser and some middleware
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // Express only treats a function with four parameters as an error handler, so this one must stay
  _next: NextFunction
): void => {
  // Headers already sent (for example mid-stream): leave the response to Express
  if (res.headersSent) {
    _next(err);
    return;
  }
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Resource already exists",
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Resource not found",
      });
      return;
    }
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  const statusCode = err.statusCode || (err.status && err.status >= 400 && err.status < 600 ? err.status : 500);
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
