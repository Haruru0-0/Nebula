"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.updateAgent = exports.getAgentById = exports.getAgents = exports.createAgent = void 0;
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = __importDefault(require("../utils/logger"));
const createAgent = async (req, res, next) => {
    try {
        const { name, systemPrompt, model, provider, temperature, maxTokens } = req.body;
        // Set default model based on provider
        let defaultModel = 'gpt-4.1';
        const selectedProvider = provider || 'openai';
        if (selectedProvider === 'gemini' && !model) {
            defaultModel = 'gemini-2.5-flash';
        }
        const [agent] = await db_1.db.insert(schema_1.agents).values({
            name,
            systemPrompt,
            provider: selectedProvider,
            model: model || defaultModel,
            temperature: temperature ?? 0.7,
            maxTokens: maxTokens ?? 1000,
            userId: req.user.id,
        }).returning();
        logger_1.default.info(`Agent created: ${agent.id} by user ${req.user.email} (Provider: ${selectedProvider})`);
        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: { agent },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAgent = createAgent;
const getAgents = async (req, res, next) => {
    try {
        const agentsList = await db_1.db.query.agents.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.agents.userId, req.user.id),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.agents.createdAt)],
        });
        res.status(200).json({
            success: true,
            data: { agents: agentsList, count: agentsList.length },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAgents = getAgents;
const getAgentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await db_1.db.query.agents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, req.user.id)),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAgentById = getAgentById;
const updateAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const agent = await db_1.db.query.agents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, req.user.id)),
        });
        if (!agent) {
            res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
            return;
        }
        // Only allow specific fields to be updated, excluding timestamps
        const filteredUpdates = {};
        if (updates.name !== undefined)
            filteredUpdates.name = updates.name;
        if (updates.systemPrompt !== undefined)
            filteredUpdates.systemPrompt = updates.systemPrompt;
        if (updates.model !== undefined)
            filteredUpdates.model = updates.model;
        if (updates.provider !== undefined)
            filteredUpdates.provider = updates.provider;
        if (updates.temperature !== undefined)
            filteredUpdates.temperature = updates.temperature;
        if (updates.maxTokens !== undefined)
            filteredUpdates.maxTokens = updates.maxTokens;
        if (updates.isActive !== undefined)
            filteredUpdates.isActive = updates.isActive;
        // Only proceed if there are actual updates
        if (Object.keys(filteredUpdates).length === 0) {
            res.status(400).json({
                success: false,
                message: 'No valid fields provided for update',
            });
            return;
        }
        const [updatedAgent] = await db_1.db.update(schema_1.agents)
            .set(filteredUpdates)
            .where((0, drizzle_orm_1.eq)(schema_1.agents.id, id))
            .returning();
        logger_1.default.info(`Agent updated: ${id} by user ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: 'Agent updated successfully',
            data: { agent: updatedAgent },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAgent = updateAgent;
const deleteAgent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agent = await db_1.db.query.agents.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.agents.id, id), (0, drizzle_orm_1.eq)(schema_1.agents.userId, req.user.id)),
        });
        if (!agent) {
            res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
            return;
        }
        await db_1.db.delete(schema_1.agents)
            .where((0, drizzle_orm_1.eq)(schema_1.agents.id, id));
        logger_1.default.info(`Agent deleted: ${id} by user ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: 'Agent deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAgent = deleteAgent;
//# sourceMappingURL=agentController.js.map