"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverallMetrics = exports.getMetrics = void 0;
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const periodMap = {
    "1h": 1,
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
};
function getPeriod(query) {
    const value = Array.isArray(query) ? query[0] : query;
    if (value === "1h" || value === "24h" || value === "7d" || value === "30d")
        return value;
    return "24h";
}
const getMetrics = async (req, res, next) => {
    try {
        const { agentId } = req.params;
        const userId = req.user.id;
        const period = getPeriod(req.query.period);
        const hoursAgo = periodMap[period];
        const startDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        const agent = await db_1.db.query.agents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, agentId), (0, drizzle_orm_1.eq)(schema_1.agents.userId, userId)),
        });
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent not found" });
        }
        const conversationsList = await db_1.db.query.conversations.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.agentId, agentId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, userId), (0, drizzle_orm_1.gte)(schema_1.conversations.createdAt, startDate)),
            columns: { id: true },
        });
        const conversationIds = conversationsList.map((c) => c.id);
        let metricsList = [];
        if (conversationIds.length > 0) {
            metricsList = await db_1.db.query.metrics.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.metrics.conversationId, conversationIds), (0, drizzle_orm_1.gte)(schema_1.metrics.timestamp, startDate)),
                orderBy: [(0, drizzle_orm_1.asc)(schema_1.metrics.timestamp)],
            });
        }
        const totalTokens = metricsList.reduce((sum, m) => sum + m.tokensProcessed, 0);
        const totalMessages = metricsList.reduce((sum, m) => sum + m.messageCount, 0);
        const avgLatency = metricsList.length > 0
            ? metricsList.reduce((sum, m) => sum + m.responseLatency, 0) / metricsList.length
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
    }
    catch (error) {
        next(error);
    }
};
exports.getMetrics = getMetrics;
const getOverallMetrics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const period = getPeriod(req.query.period);
        const hoursAgo = periodMap[period];
        const startDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        const conversationsList = await db_1.db.query.conversations.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.userId, userId), (0, drizzle_orm_1.gte)(schema_1.conversations.createdAt, startDate)),
            columns: { id: true, agentId: true },
        });
        const conversationIds = conversationsList.map((c) => c.id);
        let metricsList = [];
        if (conversationIds.length > 0) {
            metricsList = await db_1.db.query.metrics.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.metrics.conversationId, conversationIds), (0, drizzle_orm_1.gte)(schema_1.metrics.timestamp, startDate)),
                orderBy: [(0, drizzle_orm_1.asc)(schema_1.metrics.timestamp)],
            });
        }
        const totalTokens = metricsList.reduce((sum, m) => sum + m.tokensProcessed, 0);
        const totalMessages = metricsList.reduce((sum, m) => sum + m.messageCount, 0);
        const avgLatency = metricsList.length > 0
            ? metricsList.reduce((sum, m) => sum + m.responseLatency, 0) / metricsList.length
            : 0;
        const [agentCountResult] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.agents)
            .where((0, drizzle_orm_1.eq)(schema_1.agents.userId, userId));
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOverallMetrics = getOverallMetrics;
//# sourceMappingURL=metricsController.js.map