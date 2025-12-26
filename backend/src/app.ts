import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import agentRoutes from "./routes/agentRoutes";
import chatRoutes from "./routes/chatRoutes";
import metricsRoutes from "./routes/metricsRoutes";
import { errorHandler, notFound } from "./middlewares/errorHandler";

dotenv.config();

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
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

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
