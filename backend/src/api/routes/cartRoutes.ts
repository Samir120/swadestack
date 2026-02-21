import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authMiddleware';
import CartSyncService from '../../services/CartSyncService';

const router = Router();
const cartSyncService = new CartSyncService();

/**
 * PUT /api/cart/sync — sync frontend cart to server
 */
router.put('/sync', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { items = [], pcItems = [], componentItems = [] } = req.body;

    await cartSyncService.syncCart(userId, items, pcItems, componentItems);
    res.status(200).json({ success: true, message: 'Cart synced' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cart — get server-side cart for merge on login
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const cart = await cartSyncService.getCart(userId);
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

export default router;
