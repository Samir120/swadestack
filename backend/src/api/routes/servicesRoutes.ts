import { Router } from 'express';
import servicesController from '../controllers/servicesController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.get('/', servicesController.getActive);

// Admin routes - get all services (including inactive) - must be before /:id
router.get('/admin/all', authenticate, requireAdmin, servicesController.getAll);

// Public route - get by ID
router.get('/:id', servicesController.getById);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('imageFile'), servicesController.create);
router.put('/:id', authenticate, requireAdmin, upload.single('imageFile'), servicesController.update);
router.delete('/:id', authenticate, requireAdmin, servicesController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, servicesController.toggleActive);

export default router;
