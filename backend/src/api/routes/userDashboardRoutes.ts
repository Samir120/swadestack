import { Router } from 'express';
import UserDashboardController from '../controllers/UserDashboardController';
import { authenticate } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();
const controller = new UserDashboardController();

// All routes require authentication
router.use(authenticate);

// ==================== Profile Routes ====================
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);
router.put('/email', controller.updateEmail);
router.put('/password', controller.changePassword);
router.post('/avatar', upload.single('imageFile'), controller.updateAvatar);

// ==================== Orders Routes ====================
router.get('/orders', controller.getOrders);
router.get('/orders/:id', controller.getOrder);
router.get('/orders/number/:orderNumber', controller.getOrderByNumber);
router.post('/orders/:id/cancel', controller.cancelOrder);

// ==================== Statistics Routes ====================
router.get('/statistics', controller.getStatistics);

// ==================== Invoice Routes ====================
router.get('/invoices', controller.getInvoices);
router.get('/invoices/:orderId', controller.getInvoice);
router.get('/invoices/:orderId/download', controller.downloadInvoice);

export default router;
