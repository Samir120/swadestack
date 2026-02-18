import { Router } from 'express';
import teamMembersController from '../controllers/TeamMembersController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();

// Admin routes (must be before /:id to avoid param capture)
router.get('/all', authenticate, requireAdmin, teamMembersController.getAll);
router.post('/', authenticate, requireAdmin, upload.single('imageFile'), teamMembersController.create);
router.put('/:id', authenticate, requireAdmin, upload.single('imageFile'), teamMembersController.update);
router.delete('/:id', authenticate, requireAdmin, teamMembersController.delete);
router.patch('/:id/toggle-active', authenticate, requireAdmin, teamMembersController.toggleActive);

// Public routes
router.get('/', teamMembersController.getActive);
router.get('/:id', teamMembersController.getById);

export default router;
