"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = require("../utils/config");
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.smtp.host,
    port: config_1.config.smtp.port,
    secure: false,
    auth: {
        user: config_1.config.smtp.user,
        pass: config_1.config.smtp.password,
    },
});
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request - AI Agent Platform',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; 
                  color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        <p style="color: #EF4444; font-weight: bold;">This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          AI Agent Management Platform<br>
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Password reset email sent to ${email}`);
    }
    catch (error) {
        logger_1.default.error('Error sending email:', error);
        throw new Error('Failed to send password reset email');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendVerificationEmail = async (email, otp, name) => {
    const displayName = name || 'there';
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Verify Your Email - AI Agent Platform',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to AI Agent Platform!</h2>
        <p>Hi ${displayName},</p>
        <p>Thank you for signing up! Please verify your email address by entering the OTP code below:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="font-size: 32px; font-weight: bold; color: #4F46E5; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This OTP code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          AI Agent Management Platform<br>
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`Verification email sent to ${email}`);
    }
    catch (error) {
        logger_1.default.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=emailService.js.map