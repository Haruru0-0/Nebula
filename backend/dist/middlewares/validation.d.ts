import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    signUp: Joi.ObjectSchema<any>;
    signIn: Joi.ObjectSchema<any>;
    forgotPassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
    changePassword: Joi.ObjectSchema<any>;
    verifyEmail: Joi.ObjectSchema<any>;
    resendVerification: Joi.ObjectSchema<any>;
    createAgent: Joi.ObjectSchema<any>;
    updateAgent: Joi.ObjectSchema<any>;
    sendMessage: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map