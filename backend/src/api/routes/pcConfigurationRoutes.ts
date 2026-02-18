import { Router } from 'express';
import pcConfigurationController from '../controllers/PCConfigurationController';
import { authenticate, optionalAuthenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// =====================================================
// PUBLIC PRE-CONFIGURED PC ROUTES (No Auth Required)
// These must come BEFORE /:id routes to avoid conflicts
// =====================================================

// GET /api/pc-configurations/pre-configured - List all pre-configured PCs
router.get('/pre-configured', pcConfigurationController.getPreConfiguredPCs);

// GET /api/pc-configurations/pre-configured/featured - Get featured PCs for home page
router.get('/pre-configured/featured', pcConfigurationController.getFeaturedPCs);

// GET /api/pc-configurations/pre-configured/:id - Get single pre-configured PC
router.get('/pre-configured/:id', pcConfigurationController.getPreConfiguredById);

// POST /api/pc-configurations/pre-configured/:id/order - Order a pre-configured PC (AUTH)
router.post('/pre-configured/:id/order', authenticate, pcConfigurationController.orderPreConfiguredPC);

// POST /api/pc-configurations/pre-configured/:id/direct-checkout - Direct checkout (guest or auth)
router.post('/pre-configured/:id/direct-checkout', optionalAuthenticate, pcConfigurationController.directCheckoutPreConfiguredPC);

// =====================================================
// ADMIN PRE-CONFIGURED PC ROUTES
// =====================================================

// GET /api/pc-configurations/admin/all - Get all configurations (admin)
router.get('/admin/all', authenticate, requireAdmin, pcConfigurationController.getAllConfigurationsAdmin);

// GET /api/pc-configurations/admin/pre-configured - Get all pre-configured PCs (admin)
router.get('/admin/pre-configured', authenticate, requireAdmin, pcConfigurationController.getAdminPreConfiguredPCs);

// GET /api/pc-configurations/admin/pre-configured/stats - Get pre-configured stats (admin)
router.get('/admin/pre-configured/stats', authenticate, requireAdmin, pcConfigurationController.getPreConfiguredStats);

// POST /api/pc-configurations/admin/pre-configured - Create pre-configured PC (admin)
router.post('/admin/pre-configured', authenticate, requireAdmin, pcConfigurationController.createPreConfiguredPC);

// POST /api/pc-configurations/admin/pre-configured/:id/promote - Promote to pre-configured (admin)
router.post('/admin/pre-configured/:id/promote', authenticate, requireAdmin, pcConfigurationController.promoteToPreConfigured);

// PUT /api/pc-configurations/admin/pre-configured/:id - Update pre-configured PC (admin)
router.put('/admin/pre-configured/:id', authenticate, requireAdmin, pcConfigurationController.updatePreConfiguredPC);

// PATCH /api/pc-configurations/admin/pre-configured/:id/featured - Toggle featured status (admin)
router.patch('/admin/pre-configured/:id/featured', authenticate, requireAdmin, pcConfigurationController.toggleFeatured);

// DELETE /api/pc-configurations/admin/pre-configured/:id - Delete pre-configured PC (admin)
router.delete('/admin/pre-configured/:id', authenticate, requireAdmin, pcConfigurationController.deletePreConfiguredPC);

// =====================================================
// ADMIN STATS ROUTES
// =====================================================

// GET /api/pc-configurations/stats/summary - Get overall stats (admin)
router.get('/stats/summary', authenticate, requireAdmin, pcConfigurationController.getStats);

// =====================================================
// AUTHENTICATED USER ROUTES
// =====================================================

// GET /api/pc-configurations - Get user's configurations
router.get('/', authenticate, pcConfigurationController.getUserConfigurations);

// POST /api/pc-configurations - Create new configuration
router.post('/', authenticate, pcConfigurationController.create);

// POST /api/pc-configurations/validate-selection - Pre-validation
router.post('/validate-selection', authenticate, pcConfigurationController.validateSelection);

// =====================================================
// CONFIGURATION SPECIFIC ROUTES (require :id)
// =====================================================

// GET /api/pc-configurations/:id - Get configuration by ID
router.get('/:id', authenticate, pcConfigurationController.getById);

// DELETE /api/pc-configurations/:id - Delete configuration
router.delete('/:id', authenticate, pcConfigurationController.delete);

// POST /api/pc-configurations/:id/components - Add component
router.post('/:id/components', authenticate, pcConfigurationController.addComponent);

// DELETE /api/pc-configurations/:id/components/:type - Remove component
router.delete('/:id/components/:type', authenticate, pcConfigurationController.removeComponent);

// POST /api/pc-configurations/:id/validate - Validate configuration
router.post('/:id/validate', authenticate, pcConfigurationController.validate);

// POST /api/pc-configurations/:id/build-service - Toggle build service
router.post('/:id/build-service', authenticate, pcConfigurationController.toggleBuildService);

// GET /api/pc-configurations/:id/price - Get price breakdown
router.get('/:id/price', authenticate, pcConfigurationController.calculatePrice);

// POST /api/pc-configurations/:id/duplicate - Duplicate configuration
router.post('/:id/duplicate', authenticate, pcConfigurationController.duplicate);

// POST /api/pc-configurations/:id/checkout - Checkout configuration
router.post('/:id/checkout', authenticate, pcConfigurationController.checkout);

// GET /api/pc-configurations/:id/pdf - Export configuration as PDF
router.get('/:id/pdf', authenticate, pcConfigurationController.exportPDF);

export default router;
