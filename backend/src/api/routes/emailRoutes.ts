import { Router } from 'express';
import { EmailController } from '../controllers/emailController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const emailController = new EmailController();

/**
 * @route   POST /api/email/test
 * @desc    Send test email (admin only)
 * @access  Private/Admin
 */
router.post('/test', authenticate, requireAdmin, emailController.sendTestEmail);

/**
 * @route   POST /api/email/queue
 * @desc    Queue email for sending (admin only)
 * @access  Private/Admin
 */
router.post('/queue', authenticate, requireAdmin, emailController.queueEmail);

/**
 * @route   POST /api/email/process-queue
 * @desc    Process email queue (admin only)
 * @access  Private/Admin
 */
router.post('/process-queue', authenticate, requireAdmin, emailController.processQueue);

/**
 * @route   POST /api/email/retry-failed
 * @desc    Retry failed emails (admin only)
 * @access  Private/Admin
 */
router.post('/retry-failed', authenticate, requireAdmin, emailController.retryFailedEmails);

/**
 * @route   GET /api/email/statistics
 * @desc    Get email statistics (admin only)
 * @access  Private/Admin
 */
router.get('/statistics', authenticate, requireAdmin, emailController.getStatistics);

/**
 * @route   DELETE /api/email/cleanup
 * @desc    Cleanup old emails (admin only)
 * @access  Private/Admin
 */
router.delete('/cleanup', authenticate, requireAdmin, emailController.cleanupOldEmails);

export default router;
