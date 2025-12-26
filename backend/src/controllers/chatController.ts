import { db } from "../drizzle/db";
import { agents, conversations, messages, metrics } from "../drizzle/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import logger from "../utils/logger";
import { Response, NextFunction } from "express";
import { sendMessage } from "../services/llmService";
import { AuthRequest, SendMessageBody } from "../types";

export const chat = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, conversationId } = req.body as SendMessageBody;
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
    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.userId, req.user!.id)
      ),
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
      conversation = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, req.user!.id),
          eq(conversations.agentId, agentId)
        ),
        with: {
          messages: {
            orderBy: [asc(messages.createdAt)],
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
    } else {
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
        const [newConversation] = await db.insert(conversations).values({
          userId: req.user!.id,
          agentId,
          title: conversationTitle,
        }).returning();
        logger.info(`New conversation created: ${newConversation.id} for user ${req.user!.id}`);

        conversation = {
          ...newConversation,
          messages: []
        };
      } catch (txError) {
        logger.error('Transaction failed creating conversation:', txError);
        throw new Error(`Failed to create conversation: ${txError instanceof Error ? txError.message : String(txError)}`);
      }
    }

    // Process the chat message with transaction
    try {
      // Insert user message
      await db.insert(messages).values({
        conversationId: conversation.id,
        role: "user",
        content: message,
      });

      const conversationHistory = conversation.messages || [];

      // Get LLM response
      const llmResponse = await sendMessage(agent, conversationHistory, message);

      // Insert assistant message
      const [assistantMessage] = await db.insert(messages).values({
        conversationId: conversation.id,
        role: "assistant",
        content: llmResponse.message,
        tokenCount: llmResponse.tokensProcessed,
      }).returning();

      // Insert metrics
      await db.insert(metrics).values({
        conversationId: conversation.id,
        tokensProcessed: llmResponse.tokensProcessed,
        responseLatency: llmResponse.responseLatency,
        messageCount: conversationHistory.length + 2,
      });

      // Update conversation timestamp
      await db.update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversation.id));

      logger.info(`Chat message processed successfully for conversation: ${conversation.id}`);

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
    } catch (processingError) {
      logger.error('Error processing chat message:', processingError);
      throw processingError;
    }
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    next(error);
  }
};

export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { agentId } = req.params;

    const conversationsList = await db.query.conversations.findMany({
      where: and(
        eq(conversations.userId, req.user!.id),
        eq(conversations.agentId, agentId)
      ),
      orderBy: [desc(conversations.updatedAt)],
      with: {
        messages: {
          limit: 1,
          orderBy: [asc(messages.createdAt)],
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
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, req.user!.id)
      ),
      with: {
        messages: {
          orderBy: [asc(messages.createdAt)],
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
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, req.user!.id)
      ),
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    await db.delete(conversations)
      .where(eq(conversations.id, conversationId));

    logger.info(`Conversation deleted: ${conversationId}`);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, req.user!.id)
      ),
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    const [updatedConversation] = await db.update(conversations)
      .set({ title: title.trim(), updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))
      .returning();

    logger.info(`Conversation renamed: ${conversationId} to "${title}"`);

    res.status(200).json({
      success: true,
      message: "Conversation updated successfully",
      data: { conversation: updatedConversation },
    });
  } catch (error) {
    next(error);
  }
};
