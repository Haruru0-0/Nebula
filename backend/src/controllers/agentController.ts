import { db } from "../drizzle/db";
import { agents } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import logger from "../utils/logger";
import { Response, NextFunction } from 'express';
import { AuthRequest, CreateAgentBody, UpdateAgentBody } from '../types';

export const createAgent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, systemPrompt, model, provider, temperature, maxTokens } = req.body as CreateAgentBody;

    // Set default model based on provider
    let defaultModel = 'gpt-4.1';
    const selectedProvider = provider || 'openai';

    if (selectedProvider === 'gemini' && !model) {
      defaultModel = 'gemini-2.5-flash';
    }

    const [agent] = await db.insert(agents).values({
      name,
      systemPrompt,
      provider: selectedProvider,
      model: model || defaultModel,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 1000,
      userId: req.user!.id,
    }).returning();

    logger.info(`Agent created: ${agent.id} by user ${req.user!.email} (Provider: ${selectedProvider})`);

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
    const agentsList = await db.query.agents.findMany({
      where: eq(agents.userId, req.user!.id),
      orderBy: [desc(agents.createdAt)],
    });

    res.status(200).json({
      success: true,
      data: { agents: agentsList, count: agentsList.length },
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

    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, id),
        eq(agents.userId, req.user!.id)
      ),
      with: {
        conversations: true
      }
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    // Format agent to match expected structure if needed (Prisma's _count)
    const formattedAgent = agent ? {
      ...agent,
      _count: {
        conversations: agent.conversations.length
      }
    } : null;

    res.status(200).json({
      success: true,
      data: { agent: formattedAgent },
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

    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, id),
        eq(agents.userId, req.user!.id)
      ),
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    // Only allow specific fields to be updated, excluding timestamps
    const filteredUpdates: Partial<UpdateAgentBody> = {};
    
    if (updates.name !== undefined) filteredUpdates.name = updates.name;
    if (updates.systemPrompt !== undefined) filteredUpdates.systemPrompt = updates.systemPrompt;
    if (updates.model !== undefined) filteredUpdates.model = updates.model;
    if (updates.provider !== undefined) filteredUpdates.provider = updates.provider;
    if (updates.temperature !== undefined) filteredUpdates.temperature = updates.temperature;
    if (updates.maxTokens !== undefined) filteredUpdates.maxTokens = updates.maxTokens;
    if (updates.isActive !== undefined) filteredUpdates.isActive = updates.isActive;

    // Only proceed if there are actual updates
    if (Object.keys(filteredUpdates).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
      return;
    }

    const [updatedAgent] = await db.update(agents)
      .set(filteredUpdates)
      .where(eq(agents.id, id))
      .returning();

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

    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, id),
        eq(agents.userId, req.user!.id)
      ),
    });

    if (!agent) {
      res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
      return;
    }

    await db.delete(agents)
      .where(eq(agents.id, id));

    logger.info(`Agent deleted: ${id} by user ${req.user!.email}`);

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};