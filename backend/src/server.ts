import http from "http";
import { Server } from "socket.io";
import { setupMetricsSocket } from "./websocket/metricsSocket";
import logger from "./utils/logger";
import app from "./app";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Live metrics need a connection that stays open, which Lambda cannot hold. DISABLE_SOCKET=1 (set on Lambda) skips
// Socket.io; the Analytics page then relies on its 15-second refresh.
if (process.env.DISABLE_SOCKET !== "1") {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setupMetricsSocket(io);
}

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

export default server;
