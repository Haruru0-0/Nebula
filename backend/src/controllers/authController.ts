import { Response, NextFunction } from 'express';
import { db } from '../drizzle/db';
import { users } from '../drizzle/schema';
import { eq, gt, and } from 'drizzle-orm';
import { hashPassword, comparePassword, generateResetToken, hashResetToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../services/emailService';
import logger from '../utils/logger';
import { AuthRequest, SignUpBody, SignInBody, ForgotPasswordBody, ResetPasswordBody } from '../types';

export const signUp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body as SignUpBody;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as SignInBody;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    logger.info(`User signed in: ${email}`);

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
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as ForgotPasswordBody;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
      return;
    }

    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await db.update(users)
      .set({
        resetToken: hashedToken,
        resetTokenExpiry: resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body as ResetPasswordBody;

    const hashedToken = hashResetToken(token);

    const user = await db.query.users.findFirst({
      where: and(
        eq(users.resetToken, hashedToken),
        gt(users.resetTokenExpiry, new Date())
      ),
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await db.update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    logger.info(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
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
  } catch (error) {
    next(error);
  }
};