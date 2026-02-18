import { Router } from 'express';
import serviceCategoryController from '../controllers/ServiceCategoryController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', serviceCategoryController.getActive);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, serviceCategoryController.getAll);
router.get('/:id', authenticate, requireAdmin, serviceCategoryController.getById);
router.post('/', authenticate, requireAdmin, serviceCategoryController.create);
router.put('/:id', authenticate, requireAdmin, serviceCategoryController.update);
router.delete('/:id', authenticate, requireAdmin, serviceCategoryController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, serviceCategoryController.toggleActive);
router.patch('/:id/order', authenticate, requireAdmin, serviceCategoryController.updateOrder);

export default router;
