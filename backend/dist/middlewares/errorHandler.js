"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (err, req, res) => {
    logger_1.default.error("Error:", {
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
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map