import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
export declare const chat: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getConversations: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getConversationById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteConversation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateConversation: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=chatController.d.ts.map