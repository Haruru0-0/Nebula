import { JWTPayload } from '../types';
declare const signAccessToken: (userId: string) => string;
declare const signRefreshToken: (userId: string) => string;
declare const verifyAccessToken: (token: string) => JWTPayload;
declare const verifyRefreshToken: (token: string) => JWTPayload;
declare const isJwtPayload: (x: unknown) => x is JWTPayload;
export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, isJwtPayload, };
//# sourceMappingURL=jwt.d.ts.map