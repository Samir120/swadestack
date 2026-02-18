import { Router } from 'express';
import SiteSettingsController from '../controllers/SiteSettingsController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';
import { upload } from '../../middleware/upload';

const router = Router();
const controller = new SiteSettingsController();

// Public route - no authentication required
router.get('/public', controller.getPublicSettings);

// Admin routes - require authentication and admin role
router.get('/', authenticate, requireAdmin, controller.getSettings);
router.put('/', authenticate, requireAdmin, controller.updateSettings);
router.post('/logo', authenticate, requireAdmin, upload.single('logoFile'), controller.uploadLogo);
router.post('/favicon', authenticate, requireAdmin, upload.single('faviconFile'), controller.uploadFavicon);
router.post('/feature-image', authenticate, requireAdmin, upload.single('featureImageFile'), controller.uploadFeatureImage);
router.post('/maintenance/toggle', authenticate, requireAdmin, controller.toggleMaintenanceMode);

export default router;
