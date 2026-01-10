import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const createAgent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAgents: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAgentById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAgent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAgent: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=agentController.d.ts.map