import { Response, NextFunction } from 'express';
import { db } from '../drizzle/db';
import { users } from '../drizzle/schema';
import { eq, gt, and } from 'drizzle-orm';
import { hashPassword, comparePassword, generateResetToken, hashResetToken, generateOTP, hashOTP } from '../utils/crypto';
import { signAccessToken, signSocketToken } from '../utils/jwt';
import { clearAuthCookie, clearRefreshCookie, refreshCookieToken, setAuthCookie, setRefreshCookie } from '../utils/authCookie';
import { RefreshError, endAllSessions, endOtherSessions, endSession, rotateSession, startSession, IssuedSession } from '../services/sessionService';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService';
import logger from '../utils/logger';
import { AuthRequest, SignUpBody, SignInBody, ForgotPasswordBody, ResetPasswordBody, ChangePasswordBody, VerifyEmailBody, ResendVerificationBody } from '../types';

/** Put both cookies in place for a sign-in or a refresh, and return when the whole sign-in ends. */
const issueCookies = (res: Response, session: IssuedSession): number => {
  setAuthCookie(res, signAccessToken(session.userId, session.sessionEndsAt));
  setRefreshCookie(res, session.refreshToken, session.remember, session.sessionEndsAt);
  return session.sessionEndsAt;
};

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

    // Generate OTP for email verification
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      verificationToken: hashedOTP,
      verificationTokenExpiry: otpExpiry,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    });

    // Send verification email
    await sendVerificationEmail(email, otp, name || undefined);

    logger.info(`New user registered and verification email sent: ${email}`);

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

    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email address before signing in.',
      });
      return;
    }

    // The login goes in HttpOnly cookies; the response only says when the whole sign-in ends
    const expiresAt = issueCookies(res, await startSession(user.id, Boolean(req.body.rememberMe)));

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
        expiresAt,
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

    await endAllSessions(user.id); // a reset signs the account out everywhere
    logger.info(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body as ChangePasswordBody;

    // Get current user with password
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.password);

    if (!isOldPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({
        password: hashedNewPassword,
      })
      .where(eq(users.id, user.id));

    await endOtherSessions(user.id, refreshCookieToken(req)); // other devices must sign in again
    logger.info(`Password changed successfully for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, email } = req.body as VerifyEmailBody;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
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

    const hashedToken = hashOTP(token);

    if (user.verificationToken !== hashedToken || !user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
      return;
    }

    // Verify the email
    await db.update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    const expiresAt = issueCookies(res, await startSession(user.id, false));

    logger.info(`Email verified successfully for user: ${email}`);

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
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as ResendVerificationBody;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
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
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update verification token
    await db.update(users)
      .set({
        verificationToken: hashedOTP,
        verificationTokenExpiry: otpExpiry,
      })
      .where(eq(users.id, user.id));

    // Send verification email
    await sendVerificationEmail(email, otp, user.name || undefined);

    logger.info(`Verification email resent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
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
      data: { user, sessionExpiresAt: req.sessionExpiresAt ?? null },
    });
  } catch (error) {
    next(error);
  }
};

/** Ends the session: the cookie is removed. Safe to call when not signed in. */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  await endSession(refreshCookieToken(req)).catch((error) => logger.warn(`Could not end session: ${error}`));
  clearAuthCookie(res);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: 'Signed out' });
};

/** Trade the refresh cookie for a new access token and a new refresh token. */
export const refresh = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Cookie auth: require the custom header, like every other request that changes data
    if (req.headers['x-requested-with'] !== 'nebula') {
      res.status(403).json({ success: false, message: 'Missing request header' });
      return;
    }
    const session = await rotateSession(refreshCookieToken(req));
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId), columns: { id: true } });
    if (!user) throw new RefreshError('unknown');
    const sessionEndsAt = issueCookies(res, session);
    res.status(200).json({ success: true, data: { sessionEndsAt } });
  } catch (error) {
    if (error instanceof RefreshError) {
      // A reused token ends the sign-in; clear the cookies either way unless it was only a tab race
      if (error.reason !== 'raced') {
        clearAuthCookie(res);
        clearRefreshCookie(res);
      }
      if (error.reason === 'reused') logger.warn('A refresh token was reused; its sign-in was ended');
      res.status(401).json({ success: false, message: 'Session ended', reason: error.reason });
      return;
    }
    next(error);
  }
};

/** A one-minute token the page uses to open the live-metrics socket, which does not receive the cookie. */
export const socketToken = (req: AuthRequest, res: Response): void => {
  res.status(200).json({ success: true, data: { token: signSocketToken(req.user!.id) } });
};
