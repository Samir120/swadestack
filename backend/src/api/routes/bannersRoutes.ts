import { Router } from 'express';
import bannersController from '../controllers/bannersController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Public routes
router.get('/', bannersController.getActive);

// Admin routes - get all banners (including inactive) - must be before /:id
router.get('/admin/all', authenticate, requireAdmin, bannersController.getAll);

// Public route - get by ID
router.get('/:id', bannersController.getById);

// Admin routes
const bannerUploadFields = upload.fields([
  { name: 'imageFile', maxCount: 1 },
  { name: 'mobileImageFile', maxCount: 1 },
]);
router.post('/', authenticate, requireAdmin, bannerUploadFields, bannersController.create);
router.put('/:id', authenticate, requireAdmin, bannerUploadFields, bannersController.update);
router.delete('/:id', authenticate, requireAdmin, bannersController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, bannersController.toggleActive);

export default router;
