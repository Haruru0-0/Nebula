"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const metricsRoutes_1 = __importDefault(require("./routes/metricsRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", limiter);
app.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "AI Agent Management API is running",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/agents", agentRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/metrics", metricsRoutes_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map