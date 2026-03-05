import { Request, Response, NextFunction } from 'express';
import AuthService from '../../services/AuthService';
import { AuthEmailService } from '../../services/AuthEmailService';
import TwoFactorService from '../../services/TwoFactorService';

// Rate limit maps for 2FA endpoints
const validateAttempts = new Map<string, { count: number; resetAt: number }>();
const recoverySendAttempts = new Map<string, { count: number; resetAt: number }>();

// Cleanup every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of validateAttempts.entries()) {
    if (val.resetAt < now) validateAttempts.delete(key);
  }
  for (const [key, val] of recoverySendAttempts.entries()) {
    if (val.resetAt < now) recoverySendAttempts.delete(key);
  }
}, 15 * 60 * 1000);

function checkRateLimit(map: Map<string, { count: number; resetAt: number }>, key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || entry.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

export class AuthController {
  private authService: AuthService;
  private authEmailService: AuthEmailService;
  private twoFactorService: TwoFactorService;

  constructor() {
    this.authService = new AuthService();
    this.authEmailService = new AuthEmailService();
    this.twoFactorService = new TwoFactorService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      // Send verification email instead of welcome email
      await this.authEmailService.sendEmailVerification({
        userId: result.user.id,
        email: result.user.email,
        verificationToken: result.verificationToken,
        language: req.body.language || 'en',
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await this.authService.login(req.body, { ipAddress, userAgent });

      if ('requiresTwoFactor' in result) {
        res.status(200).json({
          success: true,
          data: { requiresTwoFactor: true, tempToken: result.tempToken },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      const message = error.message || '';
      const clientErrors: Record<string, number> = {
        'Email and password are required': 400,
        'Invalid email or password': 401,
        'Please verify your email address before logging in': 403,
        'Account is suspended': 403,
        'Account is deactivated': 403,
      };
      const status = clientErrors[message];
      if (status) {
        res.status(status).json({ success: false, message });
        return;
      }
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User ID should be attached by auth middleware (normalized to 'id')
      const userId = (req as any).user.id;
      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const user = await this.authService.verifyEmail(token);

      // Send welcome email after successful verification (don't fail if email fails)
      try {
        await this.authEmailService.sendWelcomeEmail(
          user.email,
          user.firstName,
          'en'
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue anyway - email failure shouldn't block verification success
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      const result = await this.authService.resendVerificationEmail(email);

      await this.authEmailService.sendEmailVerification({
        userId: result.user.id,
        email: result.user.email,
        verificationToken: result.verificationToken,
        language: req.body.language || 'en',
      });

      res.status(200).json({
        success: true,
        message: 'Verification email has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      const result = await this.authService.requestPasswordReset(email);

      // Send password reset email only if user was found
      if (result) {
        try {
          await this.authEmailService.sendPasswordReset({
            email: result.user.email,
            userName: result.user.firstName,
            resetToken: result.resetToken,
            language: req.body.language || 'en',
          });
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
        }
      }

      // Always return the same response to prevent user enumeration
      res.status(200).json({
        success: true,
        message: 'If this email is registered, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await this.authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  revokeToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      await this.authService.revokeRefreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({
          success: false,
          message: 'New password is required',
        });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  };
  validateTwoFactor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tempToken, token } = req.body;

      if (!tempToken || !token) {
        res.status(400).json({ success: false, message: 'Temp token and verification code are required' });
        return;
      }

      // Extract userId from tempToken for rate limiting
      let userId: string;
      try {
        const decoded = this.authService.validateTempToken(tempToken);
        userId = decoded.userId;
      } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired temp token' });
        return;
      }

      // Rate limit: 5 attempts per 10 minutes per userId
      if (!checkRateLimit(validateAttempts, userId, 5, 10 * 60 * 1000)) {
        res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
        return;
      }

      const result = await this.authService.completeTwoFactorLogin(tempToken, token);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid or expired code' || error.message === 'Invalid or expired temp token' || error.message === 'Invalid temp token') {
        res.status(401).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  sendTwoFactorRecovery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tempToken } = req.body;

      if (!tempToken) {
        res.status(400).json({ success: false, message: 'Temp token is required' });
        return;
      }

      let userId: string;
      try {
        const decoded = this.authService.validateTempToken(tempToken);
        userId = decoded.userId;
      } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired temp token' });
        return;
      }

      // Rate limit: 3 requests per 10 minutes per userId
      if (!checkRateLimit(recoverySendAttempts, userId, 3, 10 * 60 * 1000)) {
        res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
        return;
      }

      await this.twoFactorService.sendRecoveryCode(userId);

      res.status(200).json({ success: true, message: 'Recovery code sent' });
    } catch (error) {
      next(error);
    }
  };

  verifyTwoFactorRecovery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tempToken, code } = req.body;

      if (!tempToken || !code) {
        res.status(400).json({ success: false, message: 'Temp token and recovery code are required' });
        return;
      }

      let userId: string;
      try {
        const decoded = this.authService.validateTempToken(tempToken);
        userId = decoded.userId;
      } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired temp token' });
        return;
      }

      const result = await this.twoFactorService.verifyRecoveryCode(userId, code);
      if (!result.success) {
        res.status(401).json({ success: false, message: result.error });
        return;
      }

      // Recovery code valid — issue real JWT (same as completing 2FA login)
      const user = await this.authService.getUserById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // Use a dummy TOTP bypass — generate tokens directly
      // We need to access internal methods, so call completeTwoFactorLogin with a workaround
      // Actually, let's just generate tokens via a dedicated method
      const authResult = await this.authService.issueTokensForUser(userId);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResult,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
