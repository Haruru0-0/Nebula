"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
function must(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
exports.config = {
    port: Number(process.env.PORT ?? 4000),
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    cryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? "10"),
    smtp: {
        host: must("SMTP_HOST"),
        port: parseInt(must("SMTP_PORT")),
        user: must("SMTP_USER"),
        password: must("SMTP_PASSWORD"),
    },
    openAiApiKey: must("OPENAI_API_KEY"),
    geminiApiKey: must("GEMINI_API_KEY"),
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000"),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "100"),
    },
    jwt: {
        accessSecret: must("JWT_SECRET"),
        refreshSecret: must("JWT_REFRESH_SECRET"),
        accessTtl: (process.env.JWT_EXPIRES_IN ?? "15m"),
        refreshTtl: (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d"),
    },
};
//# sourceMappingURL=config.js.map