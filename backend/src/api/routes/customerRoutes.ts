import { Router } from 'express';
import customerController from '../controllers/customerController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const auth = [authenticate, requireAdmin];

// List, stats, export
router.get('/stats', ...auth, customerController.getStats);
router.get('/export', ...auth, customerController.exportCSV);
router.get('/audit-logs', ...auth, customerController.getAuditLogs);
router.get('/', ...auth, customerController.getAll);

// Single customer CRUD
router.get('/:id', ...auth, customerController.getById);
router.put('/:id', ...auth, customerController.update);
router.delete('/:id', ...auth, customerController.deleteCustomer);

// Account actions
router.patch('/:id/status', ...auth, customerController.changeStatus);
router.post('/:id/verify-email', ...auth, customerController.verifyEmail);
router.post('/:id/revoke-verification', ...auth, customerController.revokeVerification);
router.post('/:id/resend-verification', ...auth, customerController.resendVerification);
router.post('/:id/reset-password', ...auth, customerController.resetPassword);
router.post('/:id/force-logout', ...auth, customerController.forceLogout);

// Cart
router.get('/:id/cart', ...auth, customerController.getCart);
router.delete('/:id/cart/:itemId', ...auth, customerController.removeCartItem);
router.post('/:id/cart/send-reminder', ...auth, customerController.sendCartReminder);
router.delete('/:id/cart', ...auth, customerController.clearCart);

// Orders
router.get('/:id/orders', ...auth, customerController.getOrders);

// Notes
router.get('/:id/notes', ...auth, customerController.getNotes);
router.post('/:id/notes', ...auth, customerController.createNote);
router.put('/notes/:noteId', ...auth, customerController.updateNote);
router.delete('/notes/:noteId', ...auth, customerController.deleteNote);

// Activity
router.get('/:id/login-activity', ...auth, customerController.getLoginActivity);

// Emails
router.get('/:id/emails', ...auth, customerController.getEmailHistory);
router.post('/:id/emails/send', ...auth, customerController.sendCustomEmail);

// Addresses
router.get('/:id/addresses', ...auth, customerController.getAddresses);
router.post('/:id/addresses', ...auth, customerController.createAddress);
router.put('/:id/addresses/:addrId', ...auth, customerController.updateAddress);
router.delete('/:id/addresses/:addrId', ...auth, customerController.deleteAddress);
router.patch('/:id/addresses/:addrId/set-default', ...auth, customerController.setAddressDefault);

export default router;
