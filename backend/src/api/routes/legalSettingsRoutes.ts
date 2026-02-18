import { Router } from 'express';
import CompanyLegalSettingsController from '../controllers/CompanyLegalSettingsController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const controller = new CompanyLegalSettingsController();

// Public route - no authentication required
router.get('/', controller.getPublicSettings);

// Admin routes - require authentication and admin role
router.get('/admin', authenticate, requireAdmin, controller.getSettings);
router.put('/admin', authenticate, requireAdmin, controller.updateSettings);

export default router;
