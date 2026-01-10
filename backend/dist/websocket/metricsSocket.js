"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMetricsSocket = void 0;
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const setupMetricsSocket = (io) => {
    const metricsNamespace = io.of('/metrics');
    metricsNamespace.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            const user = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId),
            });
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.data.userId = user.id;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    metricsNamespace.on('connection', (socket) => {
        logger_1.default.info(`Metrics WebSocket connected: ${socket.id} for user ${socket.data.userId}`);
        // Store intervals to clean up on disconnect
        const intervals = new Map();
        socket.on('subscribe:agent', async (agentId) => {
            try {
                const agent = await db_1.db.query.agents.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, agentId), (0, drizzle_orm_1.eq)(schema_1.agents.userId, socket.data.userId)),
                });
                if (!agent) {
                    socket.emit('error', { message: 'Agent not found' });
                    return;
                }
                socket.join(`agent:${agentId}`);
                logger_1.default.info(`User ${socket.data.userId} subscribed to agent ${agentId}`);
                const interval = setInterval(async () => {
                    try {
                        const conversationsList = await db_1.db.query.conversations.findMany({
                            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.agentId, agentId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, socket.data.userId)),
                            columns: { id: true },
                        });
                        const conversationIds = conversationsList.map((c) => c.id);
                        let recentMetrics = [];
                        if (conversationIds.length > 0) {
                            recentMetrics = await db_1.db.query.metrics.findMany({
                                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.metrics.conversationId, conversationIds), (0, drizzle_orm_1.gte)(schema_1.metrics.timestamp, new Date(Date.now() - 60000))),
                                orderBy: [(0, drizzle_orm_1.desc)(schema_1.metrics.timestamp)],
                                limit: 10,
                            });
                        }
                        if (recentMetrics.length > 0) {
                            socket.emit('metrics:update', {
                                agentId,
                                metrics: recentMetrics,
                                timestamp: new Date(),
                            });
                        }
                    }
                    catch (error) {
                        logger_1.default.error('Error fetching agent metrics:', error);
                    }
                }, 5000);
                intervals.set(`agent:${agentId}`, interval);
            }
            catch (error) {
                logger_1.default.error('Error subscribing to agent metrics:', error);
                socket.emit('error', { message: 'Failed to subscribe to metrics' });
            }
        });
        socket.on('unsubscribe:agent', (agentId) => {
            socket.leave(`agent:${agentId}`);
            const interval = intervals.get(`agent:${agentId}`);
            if (interval) {
                clearInterval(interval);
                intervals.delete(`agent:${agentId}`);
            }
            logger_1.default.info(`User ${socket.data.userId} unsubscribed from agent ${agentId}`);
        });
        socket.on('subscribe:overall', async () => {
            try {
                socket.join(`user:${socket.data.userId}:overall`);
                logger_1.default.info(`User ${socket.data.userId} subscribed to overall metrics`);
                const interval = setInterval(async () => {
                    try {
                        const conversationsList = await db_1.db.query.conversations.findMany({
                            where: (0, drizzle_orm_1.eq)(schema_1.conversations.userId, socket.data.userId),
                            columns: { id: true },
                        });
                        const conversationIds = conversationsList.map((c) => c.id);
                        let recentMetrics = [];
                        if (conversationIds.length > 0) {
                            recentMetrics = await db_1.db.query.metrics.findMany({
                                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.metrics.conversationId, conversationIds), (0, drizzle_orm_1.gte)(schema_1.metrics.timestamp, new Date(Date.now() - 60000))),
                                orderBy: [(0, drizzle_orm_1.desc)(schema_1.metrics.timestamp)],
                                limit: 10,
                            });
                        }
                        if (recentMetrics.length > 0) {
                            socket.emit('metrics:update', {
                                agentId: null,
                                metrics: recentMetrics,
                                timestamp: new Date(),
                            });
                        }
                    }
                    catch (error) {
                        logger_1.default.error('Error fetching overall metrics:', error);
                    }
                }, 5000);
                intervals.set('overall', interval);
            }
            catch (error) {
                logger_1.default.error('Error subscribing to overall metrics:', error);
                socket.emit('error', { message: 'Failed to subscribe to overall metrics' });
            }
        });
        socket.on('unsubscribe:overall', () => {
            socket.leave(`user:${socket.data.userId}:overall`);
            const interval = intervals.get('overall');
            if (interval) {
                clearInterval(interval);
                intervals.delete('overall');
            }
            logger_1.default.info(`User ${socket.data.userId} unsubscribed from overall metrics`);
        });
        socket.on('disconnect', () => {
            // Clear all intervals on disconnect
            intervals.forEach((interval) => clearInterval(interval));
            intervals.clear();
            logger_1.default.info(`User ${socket.data.userId} disconnected from metrics socket`);
        });
    });
};
exports.setupMetricsSocket = setupMetricsSocket;
//# sourceMappingURL=metricsSocket.js.map