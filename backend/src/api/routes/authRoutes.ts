import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../../middleware/authMiddleware';
import {
  loginRateLimitMiddleware,
  registerRateLimitMiddleware,
  passwordResetRateLimitMiddleware,
  verificationRateLimitMiddleware,
} from '../../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', registerRateLimitMiddleware, authController.register);
router.post('/login', loginRateLimitMiddleware, authController.login);
router.post('/refresh', authController.refresh);
router.post('/revoke', authController.revokeToken);
router.get('/verify-email/:token', verificationRateLimitMiddleware, authController.verifyEmail);
router.post('/resend-verification', passwordResetRateLimitMiddleware, authController.resendVerification);
router.post('/forgot-password', passwordResetRateLimitMiddleware, authController.requestPasswordReset);
router.post('/reset-password/:token', passwordResetRateLimitMiddleware, authController.resetPassword);
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.changePassword);

// 2FA login validation and recovery (no auth middleware — uses tempToken)
router.post('/2fa/validate', authController.validateTwoFactor);
router.post('/2fa/recovery/send', authController.sendTwoFactorRecovery);
router.post('/2fa/recovery/verify', authController.verifyTwoFactorRecovery);

export default router;
