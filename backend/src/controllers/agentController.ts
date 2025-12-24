import { prisma } from "../config/database";
import logger from "../utils/logger";
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateAgentBody, UpdateAgentBody } from '../types';

export const createAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, systemPrompt, model, temperature, maxTokens } = req.body as CreateAgentBody;

    const agent = await prisma.agent.create({
      data: {
        name,
        systemPrompt,
        model: model || 'gpt-4-turbo-preview',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 1000,
        userId: req.user!.id,
      },
    });

    logger.info(`Agent created: ${agent.id} by user ${req.user!.email}`);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: { agent },
    });
  } catch (error) {
    next(error);
  }
};

export const getAgents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const agents = await prisma.agent.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { agents, count: agents.length },
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        _count: {
          select: { conversations: true },
        },
      },
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { agent },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body as UpdateAgentBody;

    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: updates,
    });

    logger.info(`Agent updated: ${id} by user ${req.user!.email}`);

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      data: { agent: updatedAgent },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    await prisma.agent.delete({
      where: { id },
    });

    logger.info(`Agent deleted: ${id} by user ${req.user!.email}`);

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};