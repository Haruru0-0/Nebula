import { prisma } from "../config/database";
import { Request, Response, NextFunction } from "express";

const periodMap = {
  "1h": 1,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
} as const;

type Period = keyof typeof periodMap;

function getPeriod(query: unknown): Period {
  const value = Array.isArray(query) ? query[0] : query;
  if (value === "1h" || value === "24h" || value === "7d" || value === "30d") return value;
  return "24h";
}

const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, userId } = req.params;

    const period = getPeriod(req.query.period);
    const hoursAgo = periodMap[period];
    const startDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const conversations = await prisma.conversation.findMany({
      where: { agentId, userId, createdAt: { gte: startDate } },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    const metrics = await prisma.metric.findMany({
      where: {
        conversationId: { in: conversationIds },
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: "asc" },
    });

    const totalTokens = metrics.reduce((sum, m) => sum + m.tokensProcessed, 0);
    const totalMessages = metrics.reduce((sum, m) => sum + m.messageCount, 0);
    const avgLatency =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.responseLatency, 0) / metrics.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTokensProcessed: totalTokens,
          totalMessages,
          averageLatency: Math.round(avgLatency),
          totalConversations: conversations.length,
          period,
        },
        metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOverallMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const period = getPeriod(req.query.period);
    const hoursAgo = periodMap[period];
    const startDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const conversations = await prisma.conversation.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { id: true, agentId: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    const metrics = await prisma.metric.findMany({
      where: { conversationId: { in: conversationIds }, timestamp: { gte: startDate } },
      orderBy: { timestamp: "asc" },
    });

    const totalTokens = metrics.reduce((sum, m) => sum + m.tokensProcessed, 0);
    const totalMessages = metrics.reduce((sum, m) => sum + m.messageCount, 0);
    const avgLatency =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.responseLatency, 0) / metrics.length
        : 0;

    const agentCount = await prisma.agent.count({ where: { userId } });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTokensProcessed: totalTokens,
          totalMessages,
          averageLatency: Math.round(avgLatency),
          totalConversations: conversations.length,
          totalAgents: agentCount,
          period,
        },
        metrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getMetrics, getOverallMetrics };
