import "dotenv/config";
import type { StringValue } from "ms";
export declare const config: {
    port: number;
    corsOrigin: string;
    cryptRounds: number;
    smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
    };
    openAiApiKey: string;
    geminiApiKey: string;
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessTtl: StringValue;
        refreshTtl: StringValue;
    };
};
//# sourceMappingURL=config.d.ts.map