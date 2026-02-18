import { Router } from 'express';
import ordersController from '../controllers/ordersController';
import { authenticate, optionalAuthenticate, requireAdmin } from '../../middleware/authMiddleware';
import { orderCreationRateLimitMiddleware } from '../../middleware/rateLimit.middleware';

const router = Router();

// Admin routes (defined first to take precedence)
router.get('/', authenticate, requireAdmin, ordersController.getAll);
router.get('/stats/summary', authenticate, requireAdmin, ordersController.getStatistics);
router.patch('/:id/status', authenticate, requireAdmin, ordersController.updateStatus);
router.post('/:id/cancel', authenticate, requireAdmin, ordersController.cancel);
router.post('/:id/mark-ready-final-payment', authenticate, requireAdmin, ordersController.markReadyForFinalPayment);
router.post('/:id/refund', authenticate, requireAdmin, ordersController.createRefund);

// Public routes (rate limited)
router.post('/', orderCreationRateLimitMiddleware, ordersController.create);

// Klarna webhook (no authentication - called by Klarna)
router.post('/klarna/push', ordersController.handleKlarnaPush);

// Specific named routes before generic :id routes
router.get('/number/:orderNumber', optionalAuthenticate, ordersController.getByNumber);

// Klarna checkout routes (need to be accessible for guest checkout flow)
router.get('/:id/payment-status', optionalAuthenticate, ordersController.getPaymentStatus);
router.post('/:id/klarna-checkout', optionalAuthenticate, ordersController.createKlarnaCheckout);
router.get('/:id/klarna-confirmation', optionalAuthenticate, ordersController.getKlarnaConfirmation);

// Generic :id route (must come last)
router.get('/:id', optionalAuthenticate, ordersController.getById);

export default router;
