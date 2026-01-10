import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
declare const getMetrics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const getOverallMetrics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export { getMetrics, getOverallMetrics };
//# sourceMappingURL=metricsController.d.ts.map