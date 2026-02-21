import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletterController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import {
  newsletterRateLimitMiddleware,
  newsletterStatusCheckRateLimitMiddleware,
  newsletterUnsubscribeRateLimitMiddleware,
} from '../../middleware/rateLimit.middleware';

const router = Router();
const newsletterController = new NewsletterController();

/**
 * @route   POST /api/newsletter/subscribe
 * @desc    Subscribe to newsletter
 * @access  Public
 */
router.post('/subscribe', newsletterRateLimitMiddleware, newsletterController.subscribe);

/**
 * @route   POST /api/newsletter/check-status
 * @desc    Check subscription status by email
 * @access  Public
 */
router.post('/check-status', newsletterStatusCheckRateLimitMiddleware, newsletterController.checkStatus);

/**
 * @route   POST /api/newsletter/unsubscribe-by-email
 * @desc    Unsubscribe by email (public)
 * @access  Public
 */
router.post('/unsubscribe-by-email', newsletterUnsubscribeRateLimitMiddleware, newsletterController.unsubscribeByEmail);

/**
 * @route   GET /api/newsletter/verify/:token
 * @desc    Verify email subscription
 * @access  Public
 */
router.get('/verify/:token', newsletterController.verify);

/**
 * @route   GET /api/newsletter/unsubscribe/:token
 * @desc    Unsubscribe from newsletter
 * @access  Public
 */
router.get('/unsubscribe/:token', newsletterController.unsubscribe);

/**
 * @route   GET /api/newsletter/track/open/:sendLogId.png
 * @desc    Tracking pixel for email opens
 * @access  Public
 */
router.get('/track/open/:sendLogId.png', newsletterController.trackOpen);

/**
 * @route   GET /api/newsletter/track/click/:sendLogId
 * @desc    Tracking redirect for email clicks
 * @access  Public
 */
router.get('/track/click/:sendLogId', newsletterController.trackClick);

/**
 * @route   POST /api/newsletter/broadcast
 * @desc    Broadcast newsletter to all subscribers (admin only)
 * @access  Private/Admin
 */
router.post('/broadcast', authenticate, requireAdmin, newsletterController.broadcast);

/**
 * @route   POST /api/newsletter/targeted
 * @desc    Send targeted newsletter (admin only)
 * @access  Private/Admin
 */
router.post('/targeted', authenticate, requireAdmin, newsletterController.sendTargeted);

/**
 * @route   GET /api/newsletter/statistics
 * @desc    Get newsletter statistics (admin only)
 * @access  Private/Admin
 */
router.get('/statistics', authenticate, requireAdmin, newsletterController.getStatistics);

/**
 * @route   GET /api/newsletter/subscribers
 * @desc    Get active subscribers (admin only)
 * @access  Private/Admin
 */
router.get('/subscribers', authenticate, requireAdmin, newsletterController.getSubscribers);

/**
 * @route   PATCH /api/newsletter/:id/preferences
 * @desc    Update subscriber preferences (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/preferences', authenticate, requireAdmin, newsletterController.updatePreferences);

/**
 * @route   PATCH /api/newsletter/:id/language
 * @desc    Update subscriber language (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/language', authenticate, requireAdmin, newsletterController.updateLanguage);

/**
 * @route   DELETE /api/newsletter/:id
 * @desc    Delete subscriber (admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireAdmin, newsletterController.deleteSubscriber);

export default router;
