import { Router } from 'express';
import couponsController from '../controllers/couponsController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes (validate must be before /:id to avoid route conflict)
router.post('/validate', couponsController.validate);

// Admin routes
router.get('/', authenticate, requireAdmin, couponsController.getAll);
router.get('/:id', authenticate, requireAdmin, couponsController.getById);
router.post('/', authenticate, requireAdmin, couponsController.create);
router.put('/:id', authenticate, requireAdmin, couponsController.update);
router.delete('/:id', authenticate, requireAdmin, couponsController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, couponsController.toggleActive);

export default router;
