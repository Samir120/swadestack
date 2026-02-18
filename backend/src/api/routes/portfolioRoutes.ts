import { Router } from 'express';
import portfolioController from '../controllers/portfolioController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.get('/', portfolioController.getPublished);
router.get('/featured', portfolioController.getFeatured);
router.get('/categories', portfolioController.getCategories);
router.get('/:id', portfolioController.getById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, portfolioController.getAllItems);
router.post('/', authenticate, requireAdmin, upload.single('imageFile'), portfolioController.create);
router.put('/:id', authenticate, requireAdmin, upload.single('imageFile'), portfolioController.update);
router.delete('/:id', authenticate, requireAdmin, portfolioController.delete);
router.patch('/:id/toggle-featured', authenticate, requireAdmin, portfolioController.toggleFeatured);

export default router;
