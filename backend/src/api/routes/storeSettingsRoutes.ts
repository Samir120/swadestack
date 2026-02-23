import { Router } from 'express';
import StoreSettingsController from '../controllers/StoreSettingsController';
import { authenticate, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();
const controller = new StoreSettingsController();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// Currencies
router.get('/currencies', controller.getCurrencies);
router.post('/currencies', controller.createCurrency);
router.put('/currencies/:id', controller.updateCurrency);
router.delete('/currencies/:id', controller.deleteCurrency);
router.put('/currencies/:id/set-base', controller.setBaseCurrency);
router.put('/currencies/:id/set-display', controller.setDisplayCurrency);

// Exchange Rates
router.get('/exchange-rates', controller.getExchangeRates);
router.post('/exchange-rates/refresh', controller.refreshExchangeRates);
router.get('/exchange-rates/status', controller.getExchangeRateStatus);

// Profit Margin Rules
router.get('/profit-rules', controller.getProfitRules);
router.post('/profit-rules', controller.createProfitRule);
router.put('/profit-rules/:id', controller.updateProfitRule);
router.delete('/profit-rules/:id', controller.deleteProfitRule);
router.get('/profit-rules/preview', controller.previewPrice);
router.post('/profit-rules/recalculate-all', controller.recalculateAllPrices);

export default router;
