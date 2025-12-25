import { db } from "../drizzle/db";
import { agents, conversations, metrics } from "../drizzle/schema";
import { eq, and, gte, asc, inArray, sql } from "drizzle-orm";
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

    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.userId, userId)
      ),
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const conversationsList = await db.query.conversations.findMany({
      where: and(
        eq(conversations.agentId, agentId),
        eq(conversations.userId, userId),
        gte(conversations.createdAt, startDate)
      ),
      columns: { id: true },
    });

    const conversationIds = conversationsList.map((c) => c.id);

    let metricsList: any[] = [];
    if (conversationIds.length > 0) {
      metricsList = await db.query.metrics.findMany({
        where: and(
          inArray(metrics.conversationId, conversationIds),
          gte(metrics.timestamp, startDate)
        ),
        orderBy: [asc(metrics.timestamp)],
      });
    }

    const totalTokens = metricsList.reduce((sum: number, m: any) => sum + m.tokensProcessed, 0);
    const totalMessages = metricsList.reduce((sum: number, m: any) => sum + m.messageCount, 0);
    const avgLatency =
      metricsList.length > 0
        ? metricsList.reduce((sum: number, m: any) => sum + m.responseLatency, 0) / metricsList.length
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTokensProcessed: totalTokens,
          totalMessages,
          averageLatency: Math.round(avgLatency),
          totalConversations: conversationsList.length,
          period,
        },
        metrics: metricsList,
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

    const conversationsList = await db.query.conversations.findMany({
      where: and(
        eq(conversations.userId, userId),
        gte(conversations.createdAt, startDate)
      ),
      columns: { id: true, agentId: true },
    });

    const conversationIds = conversationsList.map((c) => c.id);

    let metricsList: any[] = [];
    if (conversationIds.length > 0) {
      metricsList = await db.query.metrics.findMany({
        where: and(
          inArray(metrics.conversationId, conversationIds),
          gte(metrics.timestamp, startDate)
        ),
        orderBy: [asc(metrics.timestamp)],
      });
    }

    const totalTokens = metricsList.reduce((sum: number, m: any) => sum + m.tokensProcessed, 0);
    const totalMessages = metricsList.reduce((sum: number, m: any) => sum + m.messageCount, 0);
    const avgLatency =
      metricsList.length > 0
        ? metricsList.reduce((sum: number, m: any) => sum + m.responseLatency, 0) / metricsList.length
        : 0;

    const [agentCountResult] = await db.select({ count: sql<number>`count(*)` })
      .from(agents)
      .where(eq(agents.userId, userId));
    const agentCount = Number(agentCountResult?.count || 0);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTokensProcessed: totalTokens,
          totalMessages,
          averageLatency: Math.round(avgLatency),
          totalConversations: conversationsList.length,
          totalAgents: agentCount,
          period,
        },
        metrics: metricsList,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getMetrics, getOverallMetrics };
