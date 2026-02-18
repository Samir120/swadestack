import { Router } from 'express';
import pcBuildServiceOptionController from '../controllers/PCBuildServiceOptionController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', pcBuildServiceOptionController.getActiveOptions); // GET /api/pc-build-services
router.get('/default', pcBuildServiceOptionController.getDefaultOption); // GET /api/pc-build-services/default
router.get('/calculate-examples', pcBuildServiceOptionController.getChargeExamples); // GET /api/pc-build-services/calculate-examples?componentTotal=25000
router.get('/all', authenticate, requireAdmin, pcBuildServiceOptionController.getAllOptions); // GET /api/pc-build-services/all (Admin)
router.get('/:id', pcBuildServiceOptionController.getById); // GET /api/pc-build-services/:id
router.post('/calculate', pcBuildServiceOptionController.calculateCharge); // POST /api/pc-build-services/calculate

// Admin routes
router.post('/', authenticate, requireAdmin, pcBuildServiceOptionController.create); // POST /api/pc-build-services
router.put('/:id', authenticate, requireAdmin, pcBuildServiceOptionController.update); // PUT /api/pc-build-services/:id
router.delete('/:id', authenticate, requireAdmin, pcBuildServiceOptionController.delete); // DELETE /api/pc-build-services/:id
router.patch('/:id/set-default', authenticate, requireAdmin, pcBuildServiceOptionController.setDefault); // PATCH /api/pc-build-services/:id/set-default
router.patch('/:id/toggle-active', authenticate, requireAdmin, pcBuildServiceOptionController.toggleActive); // PATCH /api/pc-build-services/:id/toggle-active

export default router;
