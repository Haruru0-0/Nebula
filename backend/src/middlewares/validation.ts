import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

export const schemas = {
  signUp: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).optional(),
  }),

  signIn: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),

  createAgent: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    systemPrompt: Joi.string().min(10).max(5000).required(),
    provider: Joi.string().valid('openai', 'gemini').optional(),
    model: Joi.string().valid(
      // OpenAI models
      'gpt-5.2',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5.2-pro',
      'gpt-5',
      'gpt-4.1',
      // Gemini models
      'gemini-3.0-pro',
      'gemini-3.0-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash'
    ).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(100).max(8000).optional(),
  }),

  updateAgent: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    systemPrompt: Joi.string().min(10).max(5000).optional(),
    provider: Joi.string().valid('openai', 'gemini').optional(),
    model: Joi.string().valid(
      // OpenAI models
      'gpt-5.2',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5.2-pro',
      'gpt-5',
      'gpt-4.1',
      // Gemini models
      'gemini-3.0-pro',
      'gemini-3.0-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash'
    ).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(100).max(8000).optional(),
    isActive: Joi.boolean().optional(),
  }).unknown(false).messages({
    'object.unknown': 'Only name, systemPrompt, provider, model, temperature, maxTokens, and isActive fields are allowed for agent updates'
  }),

  sendMessage: Joi.object({
    message: Joi.string().min(1).max(10000).required(),
    conversationId: Joi.string().uuid().optional(),
  }),
};