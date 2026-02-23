import { Request, Response } from 'express';
import CurrencyService from '../../services/CurrencyService';
import ExchangeRateService from '../../services/ExchangeRateService';
import ProfitMarginService from '../../services/ProfitMarginService';
import PCComponentRepository from '../../integration/repositories/PCComponentRepository';

export class StoreSettingsController {
  private currencyService: CurrencyService;
  private exchangeRateService: ExchangeRateService;
  private profitMarginService: ProfitMarginService;
  private componentRepository: PCComponentRepository;

  constructor() {
    this.currencyService = new CurrencyService();
    this.exchangeRateService = new ExchangeRateService();
    this.profitMarginService = new ProfitMarginService();
    this.componentRepository = new PCComponentRepository();
  }

  // ─── CURRENCIES ───────────────────────────────────────────────

  getCurrencies = async (_req: Request, res: Response) => {
    try {
      const currencies = await this.currencyService.getAllCurrencies();
      res.json({ success: true, data: currencies });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  createCurrency = async (req: Request, res: Response) => {
    try {
      const currency = await this.currencyService.createCurrency(req.body);
      res.status(201).json({ success: true, data: currency, message: 'Currency created' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateCurrency = async (req: Request, res: Response) => {
    try {
      const currency = await this.currencyService.updateCurrency(req.params.id, req.body);
      res.json({ success: true, data: currency, message: 'Currency updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteCurrency = async (req: Request, res: Response) => {
    try {
      await this.currencyService.deleteCurrency(req.params.id);
      res.json({ success: true, message: 'Currency deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  setBaseCurrency = async (req: Request, res: Response) => {
    try {
      const currency = await this.currencyService.setBaseCurrency(req.params.id);
      res.json({ success: true, data: currency, message: 'Base currency updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  setDisplayCurrency = async (req: Request, res: Response) => {
    try {
      const currency = await this.currencyService.setDisplayCurrency(req.params.id);
      res.json({ success: true, data: currency, message: 'Display currency updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ─── EXCHANGE RATES ───────────────────────────────────────────

  getExchangeRates = async (_req: Request, res: Response) => {
    try {
      const data = await this.exchangeRateService.getRatesWithStatus();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  refreshExchangeRates = async (_req: Request, res: Response) => {
    try {
      const result = await this.exchangeRateService.fetchAndCacheRates();
      res.json({
        success: true,
        data: result,
        message: `Exchange rates refreshed. ${result.updated} rates updated.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getExchangeRateStatus = async (_req: Request, res: Response) => {
    try {
      const data = await this.exchangeRateService.getRatesWithStatus();
      res.json({
        success: true,
        data: {
          lastFetchedAt: data.lastFetchedAt,
          isStale: data.isStale,
          rateCount: data.rates.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // ─── PROFIT MARGIN RULES ─────────────────────────────────────

  getProfitRules = async (_req: Request, res: Response) => {
    try {
      const rules = await this.profitMarginService.getAllRules();
      res.json({ success: true, data: rules });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  createProfitRule = async (req: Request, res: Response) => {
    try {
      const rule = await this.profitMarginService.createRule(req.body);
      res.status(201).json({ success: true, data: rule, message: 'Profit rule created' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateProfitRule = async (req: Request, res: Response) => {
    try {
      const rule = await this.profitMarginService.updateRule(req.params.id, req.body);
      res.json({ success: true, data: rule, message: 'Profit rule updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteProfitRule = async (req: Request, res: Response) => {
    try {
      await this.profitMarginService.deleteRule(req.params.id);
      res.json({ success: true, message: 'Profit rule deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  previewPrice = async (req: Request, res: Response) => {
    try {
      const { pcComponentId } = req.query;
      if (!pcComponentId || typeof pcComponentId !== 'string') {
        return res.status(400).json({ success: false, message: 'pcComponentId query parameter is required' });
      }

      const component = await this.componentRepository.findById(pcComponentId);
      if (!component) {
        return res.status(404).json({ success: false, message: 'Component not found' });
      }

      if (!component.distributorCost || Number(component.distributorCost) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Component has no distributor cost set',
        });
      }

      const breakdown = await this.profitMarginService.calculateCustomerPrice(component);
      res.json({ success: true, data: breakdown });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  recalculateAllPrices = async (_req: Request, res: Response) => {
    try {
      const result = await this.profitMarginService.recalculateAllPrices();
      res.json({
        success: true,
        data: result,
        message: `Recalculated ${result.updated} component prices. ${result.skipped} skipped.`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export default StoreSettingsController;
