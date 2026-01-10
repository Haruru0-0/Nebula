"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJwtPayload = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const signAccessToken = (userId) => {
    const secret = config_1.config.jwt.accessSecret;
    const options = { expiresIn: config_1.config.jwt.accessTtl };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId) => {
    const secret = config_1.config.jwt.refreshSecret;
    const options = { expiresIn: config_1.config.jwt.refreshTtl };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const isJwtPayload = (x) => {
    return !!x && typeof x === "object" && "sub" in x;
};
exports.isJwtPayload = isJwtPayload;
//# sourceMappingURL=jwt.js.map