"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.resendVerification = exports.verifyEmail = exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.signIn = exports.signUp = void 0;
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("../utils/crypto");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("../services/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
const signUp = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User already exists with this email',
            });
            return;
        }
        const hashedPassword = await (0, crypto_1.hashPassword)(password);
        // Generate OTP for email verification
        const otp = (0, crypto_1.generateOTP)();
        const hashedOTP = (0, crypto_1.hashOTP)(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const [user] = await db_1.db.insert(schema_1.users).values({
            email,
            password: hashedPassword,
            name: name || null,
            verificationToken: hashedOTP,
            verificationTokenExpiry: otpExpiry,
        }).returning({
            id: schema_1.users.id,
            email: schema_1.users.email,
            name: schema_1.users.name,
            isVerified: schema_1.users.isVerified,
            createdAt: schema_1.users.createdAt,
        });
        // Send verification email
        await (0, emailService_1.sendVerificationEmail)(email, otp, name || undefined);
        logger_1.default.info(`New user registered and verification email sent: ${email}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signUp = signUp;
const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        const isPasswordValid = await (0, crypto_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }
        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email address before signing in.',
            });
            return;
        }
        const accessToken = (0, jwt_1.signAccessToken)(user.id);
        const refreshToken = (0, jwt_1.signRefreshToken)(user.id);
        logger_1.default.info(`User signed in: ${email}`);
        res.status(200).json({
            success: true,
            message: 'Signed in successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signIn = signIn;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
            });
            return;
        }
        const resetToken = (0, crypto_1.generateResetToken)();
        const hashedToken = (0, crypto_1.hashResetToken)(resetToken);
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await db_1.db.update(schema_1.users)
            .set({
            resetToken: hashedToken,
            resetTokenExpiry: resetTokenExpiry,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        await (0, emailService_1.sendPasswordResetEmail)(email, resetToken);
        logger_1.default.info(`Password reset requested for: ${email}`);
        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const hashedToken = (0, crypto_1.hashResetToken)(token);
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.resetToken, hashedToken), (0, drizzle_orm_1.gt)(schema_1.users.resetTokenExpiry, new Date())),
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
            return;
        }
        const hashedPassword = await (0, crypto_1.hashPassword)(password);
        await db_1.db.update(schema_1.users)
            .set({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        logger_1.default.info(`Password reset successful for user: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // Get current user with password
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id),
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Verify old password
        const isOldPasswordValid = await (0, crypto_1.comparePassword)(oldPassword, user.password);
        if (!isOldPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }
        // Hash new password
        const hashedNewPassword = await (0, crypto_1.hashPassword)(newPassword);
        // Update password
        await db_1.db.update(schema_1.users)
            .set({
            password: hashedNewPassword,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        logger_1.default.info(`Password changed successfully for user: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
const verifyEmail = async (req, res, next) => {
    try {
        const { token, email } = req.body;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
            return;
        }
        const hashedToken = (0, crypto_1.hashOTP)(token);
        if (user.verificationToken !== hashedToken || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code',
            });
            return;
        }
        // Verify the email
        await db_1.db.update(schema_1.users)
            .set({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        const accessToken = (0, jwt_1.signAccessToken)(user.id);
        const refreshToken = (0, jwt_1.signRefreshToken)(user.id);
        logger_1.default.info(`Email verified successfully for user: ${email}`);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isVerified: true,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
            return;
        }
        // Generate new OTP
        const otp = (0, crypto_1.generateOTP)();
        const hashedOTP = (0, crypto_1.hashOTP)(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Update verification token
        await db_1.db.update(schema_1.users)
            .set({
            verificationToken: hashedOTP,
            verificationTokenExpiry: otpExpiry,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Send verification email
        await (0, emailService_1.sendVerificationEmail)(email, otp, user.name || undefined);
        logger_1.default.info(`Verification email resent to: ${email}`);
        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerification = resendVerification;
const getProfile = async (req, res, next) => {
    try {
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id),
            columns: {
                id: true,
                email: true,
                name: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map