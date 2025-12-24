import { prisma } from "../config/database";
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

    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: "Agent not found",
      });
      return;
    }

    if (!agent.isActive) {
      res.status(403).json({
        success: false,
        message: "Agent is currently inactive",
      });
      return;
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: req.user!.id,
          agentId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
          },
        },
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
        return;
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: req.user!.id,
          agentId,
          title: message.substring(0, 50),
        },
        include: {
          messages: true,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const conversationHistory = conversation.messages || [];

    const llmResponse = await sendMessage(agent, conversationHistory, message);

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: llmResponse.message,
        tokenCount: llmResponse.tokensProcessed,
      },
    });

    await prisma.metric.create({
      data: {
        conversationId: conversation.id,
        tokensProcessed: llmResponse.tokensProcessed,
        responseLatency: llmResponse.responseLatency,
        messageCount: conversationHistory.length + 2,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    logger.info(`Chat message processed for conversation: ${conversation.id}`);

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
  } catch (error) {
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

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: req.user!.id,
        agentId,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { conversations, count: conversations.length },
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

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user!.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
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

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: req.user!.id,
      },
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
      return;
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    logger.info(`Conversation deleted: ${conversationId}`);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
