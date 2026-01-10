import { Request, Response } from "express";
interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response) => void;
export declare const notFound: (req: Request, res: Response) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map