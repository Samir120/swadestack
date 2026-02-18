import { Router } from 'express';
import featuresController from '../controllers/featuresController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.get('/', featuresController.getActive);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, featuresController.getAll);
router.post('/', authenticate, requireAdmin, upload.single('previewImageFile'), featuresController.create);
router.put('/:id', authenticate, requireAdmin, upload.single('previewImageFile'), featuresController.update);
router.delete('/:id', authenticate, requireAdmin, featuresController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, featuresController.toggleActive);
router.patch('/:id/order', authenticate, requireAdmin, featuresController.updateOrder);

export default router;
