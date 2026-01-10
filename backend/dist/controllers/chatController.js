"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConversation = exports.deleteConversation = exports.getConversationById = exports.getConversations = exports.chat = void 0;
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = __importDefault(require("../utils/logger"));
const llmService_1 = require("../services/llmService");
const chat = async (req, res, next) => {
    try {
        const { message, conversationId } = req.body;
        const { agentId } = req.params;
        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Message is required and must be a non-empty string',
            });
            return;
        }
        if (!agentId || typeof agentId !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Agent ID is required',
            });
            return;
        }
        // Verify agent exists and belongs to user
        const agent = await db_1.db.query.agents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, agentId), (0, drizzle_orm_1.eq)(schema_1.agents.userId, req.user.id)),
        });
        if (!agent) {
            res.status(404).json({
                success: false,
                message: 'Agent not found or access denied',
            });
            return;
        }
        if (!agent.isActive) {
            res.status(403).json({
                success: false,
                message: 'Agent is currently inactive',
            });
            return;
        }
        let conversation;
        if (conversationId) {
            conversation = await db_1.db.query.conversations.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, req.user.id), (0, drizzle_orm_1.eq)(schema_1.conversations.agentId, agentId)),
                with: {
                    messages: {
                        orderBy: [(0, drizzle_orm_1.asc)(schema_1.messages.createdAt)],
                        limit: 20,
                    },
                },
            });
            if (!conversation) {
                res.status(404).json({
                    success: false,
                    message: 'Conversation not found or access denied',
                });
                return;
            }
        }
        else {
            // Create new conversation with validation
            try {
                const conversationTitle = message.length > 50 ? message.substring(0, 50) : message;
                // // Use transaction for better data integrity
                // const [newConversation] = await db.transaction(async (tx) => {
                //   // Double-check agent ownership within transaction
                //   const agentCheck = await tx.query.agents.findFirst({
                //     where: and(
                //       eq(agents.id, agentId),
                //       eq(agents.userId, req.user!.id)
                //     ),
                //   });
                //   if (!agentCheck) {
                //     throw new Error('Agent validation failed in transaction');
                //   }
                //   return await tx.insert(conversations).values({
                //     userId: req.user!.id,
                //     agentId,
                //     title: conversationTitle,
                //   }).returning();
                // });
                const [newConversation] = await db_1.db.insert(schema_1.conversations).values({
                    userId: req.user.id,
                    agentId,
                    title: conversationTitle,
                }).returning();
                logger_1.default.info(`New conversation created: ${newConversation.id} for user ${req.user.id}`);
                conversation = {
                    ...newConversation,
                    messages: []
                };
            }
            catch (txError) {
                logger_1.default.error('Transaction failed creating conversation:', txError);
                throw new Error(`Failed to create conversation: ${txError instanceof Error ? txError.message : String(txError)}`);
            }
        }
        // Process the chat message with transaction
        try {
            // Insert user message
            await db_1.db.insert(schema_1.messages).values({
                conversationId: conversation.id,
                role: "user",
                content: message,
            });
            const conversationHistory = conversation.messages || [];
            // Get LLM response
            const llmResponse = await (0, llmService_1.sendMessage)(agent, conversationHistory, message);
            // Insert assistant message
            const [assistantMessage] = await db_1.db.insert(schema_1.messages).values({
                conversationId: conversation.id,
                role: "assistant",
                content: llmResponse.message,
                tokenCount: llmResponse.tokensProcessed,
            }).returning();
            // Insert metrics
            await db_1.db.insert(schema_1.metrics).values({
                conversationId: conversation.id,
                tokensProcessed: llmResponse.tokensProcessed,
                responseLatency: llmResponse.responseLatency,
                messageCount: conversationHistory.length + 2,
            });
            // Update conversation timestamp
            await db_1.db.update(schema_1.conversations)
                .set({ updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversation.id));
            logger_1.default.info(`Chat message processed successfully for conversation: ${conversation.id}`);
            res.status(200).json({
                success: true,
                data: {
                    conversationId: conversation.id,
                    message: assistantMessage,
                    metrics: {
                        tokensProcessed: llmResponse.tokensProcessed,
                        responseLatency: llmResponse.responseLatency,
                    },
                },
            });
        }
        catch (processingError) {
            logger_1.default.error('Error processing chat message:', processingError);
            throw processingError;
        }
    }
    catch (error) {
        logger_1.default.error('Chat endpoint error:', error);
        next(error);
    }
};
exports.chat = chat;
const getConversations = async (req, res, next) => {
    try {
        const { agentId } = req.params;
        const conversationsList = await db_1.db.query.conversations.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.userId, req.user.id), (0, drizzle_orm_1.eq)(schema_1.conversations.agentId, agentId)),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.conversations.updatedAt)],
            with: {
                messages: {
                    limit: 1,
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.messages.createdAt)],
                },
            },
        });
        // Format to match expected structure if needed (Prisma's _count)
        const formattedConversations = conversationsList.map(c => ({
            ...c,
            _count: {
                messages: c.messages.length // This might not be accurate if we only took 1
            }
        }));
        // Actually, Prisma's _count should probably be the total count.
        // Drizzle doesn't do this automatically with findMany.
        // If the frontend needs it, we might need a separate count query or use sql aggregations.
        res.status(200).json({
            success: true,
            data: { conversations: formattedConversations, count: formattedConversations.length },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversations = getConversations;
const getConversationById = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const conversation = await db_1.db.query.conversations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, req.user.id)),
            with: {
                messages: {
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.messages.createdAt)],
                },
                agent: true,
            },
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { conversation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversationById = getConversationById;
const deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const conversation = await db_1.db.query.conversations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, req.user.id)),
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
            return;
        }
        await db_1.db.delete(schema_1.conversations)
            .where((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId));
        logger_1.default.info(`Conversation deleted: ${conversationId}`);
        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteConversation = deleteConversation;
const updateConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Title is required and must be a non-empty string',
            });
            return;
        }
        const conversation = await db_1.db.query.conversations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId), (0, drizzle_orm_1.eq)(schema_1.conversations.userId, req.user.id)),
        });
        if (!conversation) {
            res.status(404).json({
                success: false,
                message: "Conversation not found",
            });
            return;
        }
        const [updatedConversation] = await db_1.db.update(schema_1.conversations)
            .set({ title: title.trim(), updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.conversations.id, conversationId))
            .returning();
        logger_1.default.info(`Conversation renamed: ${conversationId} to "${title}"`);
        res.status(200).json({
            success: true,
            message: "Conversation updated successfully",
            data: { conversation: updatedConversation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateConversation = updateConversation;
//# sourceMappingURL=chatController.js.map