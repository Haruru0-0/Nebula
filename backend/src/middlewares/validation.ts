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
    model: Joi.string().valid(
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(100).max(4000).optional(),
  }),

  updateAgent: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    systemPrompt: Joi.string().min(10).max(5000).optional(),
    model: Joi.string().valid(
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ).optional(),
    temperature: Joi.number().min(0).max(2).optional(),
    maxTokens: Joi.number().min(100).max(4000).optional(),
    isActive: Joi.boolean().optional(),
  }),

  sendMessage: Joi.object({
    message: Joi.string().min(1).max(10000).required(),
    conversationId: Joi.string().uuid().optional(),
  }),
};