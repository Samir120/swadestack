import { Router } from 'express';
import notificationBannersController from '../controllers/notificationBannersController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/active', notificationBannersController.getActive);
router.post('/:id/track', notificationBannersController.track);

// Admin routes
router.get('/', authenticate, requireAdmin, notificationBannersController.getAll);
router.get('/:id', authenticate, requireAdmin, notificationBannersController.getById);
router.post('/', authenticate, requireAdmin, notificationBannersController.create);
router.put('/:id', authenticate, requireAdmin, notificationBannersController.update);
router.delete('/:id', authenticate, requireAdmin, notificationBannersController.delete);
router.patch('/:id/toggle', authenticate, requireAdmin, notificationBannersController.toggleActive);

export default router;
