import { Router } from 'express';
import twoFactorController from '../controllers/TwoFactorController';
import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.post('/setup', authenticate, twoFactorController.setup);
router.post('/verify', authenticate, twoFactorController.verify);
router.post('/disable', authenticate, twoFactorController.disable);
router.get('/status', authenticate, twoFactorController.status);

export default router;
