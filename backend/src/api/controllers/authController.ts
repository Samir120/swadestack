import { Request, Response, NextFunction } from 'express';
import AuthService from '../../services/AuthService';
import { AuthEmailService } from '../../services/AuthEmailService';

export class AuthController {
  private authService: AuthService;
  private authEmailService: AuthEmailService;

  constructor() {
    this.authService = new AuthService();
    this.authEmailService = new AuthEmailService();
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
      const result = await this.authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
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
}

export default new AuthController();
