import { Router } from 'express';
import pcComponentController from '../controllers/PCComponentController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', pcComponentController.getComponentsByType); // GET /api/pc-components?type=cpu
router.get('/search', pcComponentController.searchComponents); // GET /api/pc-components/search?q=Ryzen
router.get('/manufacturers', pcComponentController.getManufacturers); // GET /api/pc-components/manufacturers?type=cpu

// Public stats - aggregate counts only (no sensitive data)
router.get('/counts', pcComponentController.getComponentTypeCounts); // GET /api/pc-components/counts

// Admin routes - get all components (including inactive) - must be before /:id
router.get('/admin/all', authenticate, requireAdmin, pcComponentController.getAll); // GET /api/pc-components/admin/all?type=cpu

router.get('/:id', pcComponentController.getComponentById); // GET /api/pc-components/:id

// Admin routes
router.post('/', authenticate, requireAdmin, pcComponentController.create); // POST /api/pc-components
router.put('/:id', authenticate, requireAdmin, pcComponentController.update); // PUT /api/pc-components/:id
router.delete('/:id', authenticate, requireAdmin, pcComponentController.delete); // DELETE /api/pc-components/:id
router.patch('/:id/stock', authenticate, requireAdmin, pcComponentController.updateStock); // PATCH /api/pc-components/:id/stock
router.patch('/:id/toggle-active', authenticate, requireAdmin, pcComponentController.toggleActive); // PATCH /api/pc-components/:id/toggle-active

// Admin stats routes
router.get('/stats/low-stock', authenticate, requireAdmin, pcComponentController.getLowStockComponents); // GET /api/pc-components/stats/low-stock
router.get('/stats/counts', authenticate, requireAdmin, pcComponentController.getComponentTypeCounts); // GET /api/pc-components/stats/counts

export default router;
