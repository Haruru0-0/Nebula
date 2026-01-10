"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors,
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
exports.schemas = {
    signUp: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        name: joi_1.default.string().min(2).max(100).optional(),
    }),
    signIn: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    }),
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().required(),
    }),
    resetPassword: joi_1.default.object({
        token: joi_1.default.string().required(),
        password: joi_1.default.string().min(8).required(),
    }),
    changePassword: joi_1.default.object({
        oldPassword: joi_1.default.string().required(),
        newPassword: joi_1.default.string().min(8).required(),
    }),
    verifyEmail: joi_1.default.object({
        token: joi_1.default.string().length(6).required(),
        email: joi_1.default.string().email().required(),
    }),
    resendVerification: joi_1.default.object({
        email: joi_1.default.string().email().required(),
    }),
    createAgent: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        systemPrompt: joi_1.default.string().min(10).max(5000).required(),
        provider: joi_1.default.string().valid('openai', 'gemini').optional(),
        model: joi_1.default.string().valid(
        // OpenAI models
        'gpt-5.2', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5.2-pro', 'gpt-5', 'gpt-4.1', 
        // Gemini models
        'gemini-3.0-pro', 'gemini-3.0-flash', 'gemini-2.5-pro', 'gemini-2.5-flash').optional(),
        temperature: joi_1.default.number().min(0).max(2).optional(),
        maxTokens: joi_1.default.number().min(100).max(8000).optional(),
    }),
    updateAgent: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        systemPrompt: joi_1.default.string().min(10).max(5000).optional(),
        provider: joi_1.default.string().valid('openai', 'gemini').optional(),
        model: joi_1.default.string().valid(
        // OpenAI models
        'gpt-5.2', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5.2-pro', 'gpt-5', 'gpt-4.1', 
        // Gemini models
        'gemini-3.0-pro', 'gemini-3.0-flash', 'gemini-2.5-pro', 'gemini-2.5-flash').optional(),
        temperature: joi_1.default.number().min(0).max(2).optional(),
        maxTokens: joi_1.default.number().min(100).max(8000).optional(),
        isActive: joi_1.default.boolean().optional(),
    }).unknown(false).messages({
        'object.unknown': 'Only name, systemPrompt, provider, model, temperature, maxTokens, and isActive fields are allowed for agent updates'
    }),
    sendMessage: joi_1.default.object({
        message: joi_1.default.string().min(1).max(10000).required(),
        conversationId: joi_1.default.string().uuid().optional(),
    }),
};
//# sourceMappingURL=validation.js.map