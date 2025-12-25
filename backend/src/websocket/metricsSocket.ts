import { db } from "../drizzle/db";
import { users, agents, conversations, metrics } from "../drizzle/schema";
import { eq, and, gte, desc, inArray } from "drizzle-orm";
import { verifyAccessToken } from "../utils/jwt";
import logger from "../utils/logger";
import { Server, Socket } from 'socket.io';
import { SocketData } from '../types';

interface SocketWithData extends Socket {
  data: SocketData;
}

export const setupMetricsSocket = (io: Server): void => {
  const metricsNamespace = io.of('/metrics');

  metricsNamespace.use(async (socket: SocketWithData, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyAccessToken(token);
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  metricsNamespace.on('connection', (socket: SocketWithData) => {
    logger.info(`Metrics WebSocket connected: ${socket.id} for user ${socket.data.userId}`);

    socket.on('subscribe:agent', async (agentId: string) => {
      try {
        const agent = await db.query.agents.findFirst({
          where: and(
            eq(agents.id, agentId),
            eq(agents.userId, socket.data.userId)
          ),
        });

        if (!agent) {
          socket.emit('error', { message: 'Agent not found' });
          return;
        }

        socket.join(`agent:${agentId}`);
        logger.info(`User ${socket.data.userId} subscribed to agent ${agentId}`);

        const interval = setInterval(async () => {
          try {
            const conversationsList = await db.query.conversations.findMany({
              where: and(
                eq(conversations.agentId, agentId),
                eq(conversations.userId, socket.data.userId)
              ),
              columns: { id: true },
            });

            const conversationIds = conversationsList.map((c) => c.id);

            let recentMetrics: any[] = [];
            if (conversationIds.length > 0) {
              recentMetrics = await db.query.metrics.findMany({
                where: and(
                  inArray(metrics.conversationId, conversationIds),
                  gte(metrics.timestamp, new Date(Date.now() - 60000))
                ),
                orderBy: [desc(metrics.timestamp)],
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
          } catch (error) {
            logger.error('Error fetching metrics:', error);
          }
        }, 5000);

        socket.on('disconnect', () => {
          clearInterval(interval);
          logger.info(`User ${socket.data.userId} disconnected from metrics socket`);
        });
      } catch (error) {
        logger.error('Error subscribing to agent metrics:', error);
        socket.emit('error', { message: 'Failed to subscribe to metrics' });
      }
    });

    socket.on('unsubscribe:agent', (agentId: string) => {
      socket.leave(`agent:${agentId}`);
      logger.info(`User ${socket.data.userId} unsubscribed from agent ${agentId}`);
    });
  });
};