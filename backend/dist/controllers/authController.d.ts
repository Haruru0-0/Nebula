import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const signUp: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const signIn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resendVerification: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map