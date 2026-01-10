"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOTP = exports.generateOTP = exports.hashResetToken = exports.generateResetToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = async (password) => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10");
    return await bcryptjs_1.default.hash(password, rounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
exports.generateResetToken = generateResetToken;
const hashResetToken = (token) => {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
exports.hashResetToken = hashResetToken;
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const hashOTP = (otp) => {
    return crypto_1.default.createHash("sha256").update(otp).digest("hex");
};
exports.hashOTP = hashOTP;
//# sourceMappingURL=crypto.js.map