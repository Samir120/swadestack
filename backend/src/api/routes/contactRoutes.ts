import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { rateLimitMiddleware } from '../../middleware/rateLimit.middleware';

const router = Router();
const contactController = new ContactController();

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public (with rate limiting)
 */
router.post('/', rateLimitMiddleware, contactController.submitContactForm);

/**
 * @route   POST /api/contact/custom-response
 * @desc    Send custom response to contact form (admin only)
 * @access  Private/Admin
 */
router.post('/custom-response', authenticate, requireAdmin, contactController.sendCustomResponse);

/**
 * @route   GET /api/contact/messages
 * @desc    Get all contact messages with filtering
 * @access  Private/Admin
 */
router.get('/messages', authenticate, requireAdmin, contactController.getAllMessages);

/**
 * @route   GET /api/contact/messages/statistics
 * @desc    Get contact message statistics
 * @access  Private/Admin
 */
router.get('/messages/statistics', authenticate, requireAdmin, contactController.getStatistics);

/**
 * @route   GET /api/contact/messages/search
 * @desc    Search contact messages
 * @access  Private/Admin
 */
router.get('/messages/search', authenticate, requireAdmin, contactController.searchMessages);

/**
 * @route   GET /api/contact/messages/:id
 * @desc    Get contact message by ID
 * @access  Private/Admin
 */
router.get('/messages/:id', authenticate, requireAdmin, contactController.getMessageById);

/**
 * @route   PATCH /api/contact/messages/:id/read
 * @desc    Mark message as read
 * @access  Private/Admin
 */
router.patch('/messages/:id/read', authenticate, requireAdmin, contactController.markAsRead);

/**
 * @route   PATCH /api/contact/messages/:id/status
 * @desc    Update message status
 * @access  Private/Admin
 */
router.patch('/messages/:id/status', authenticate, requireAdmin, contactController.updateStatus);

/**
 * @route   PATCH /api/contact/messages/:id/notes
 * @desc    Add admin notes to message
 * @access  Private/Admin
 */
router.patch('/messages/:id/notes', authenticate, requireAdmin, contactController.addNotes);

/**
 * @route   POST /api/contact/messages/:id/reply
 * @desc    Reply to contact message
 * @access  Private/Admin
 */
router.post('/messages/:id/reply', authenticate, requireAdmin, contactController.replyToMessage);

/**
 * @route   DELETE /api/contact/messages/:id
 * @desc    Delete contact message
 * @access  Private/Admin
 */
router.delete('/messages/:id', authenticate, requireAdmin, contactController.deleteMessage);

export default router;
