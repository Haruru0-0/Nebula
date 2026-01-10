"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const metricsSocket_1 = require("./websocket/metricsSocket");
const logger_1 = __importDefault(require("./utils/logger"));
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
(0, metricsSocket_1.setupMetricsSocket)(io);
server.listen(PORT, () => {
    logger_1.default.info(`🚀 Server running on port ${PORT}`);
    logger_1.default.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
});
process.on("unhandledRejection", (err) => {
    logger_1.default.error("Unhandled Rejection:", err);
    server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
    logger_1.default.error("Uncaught Exception:", err);
    server.close(() => process.exit(1));
});
exports.default = server;
//# sourceMappingURL=server.js.map