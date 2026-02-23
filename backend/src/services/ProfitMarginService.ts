import ProfitMarginRuleRepository from '../integration/repositories/ProfitMarginRuleRepository';
import ExchangeRateService from './ExchangeRateService';
import CurrencyRepository from '../integration/repositories/CurrencyRepository';
import PCComponent from '../models/sequelize/PCComponent';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import { ProfitMarginRuleAttributes } from '../models/sequelize/ProfitMarginRule';

export interface PriceBreakdown {
  distributorCost: number;
  costCurrency: string;
  exchangeRate: number;
  costInBaseCurrency: number;
  marginRule: {
    id: string;
    name: string;
    type: string;
    marginType: string;
    marginValue: number;
  } | null;
  marginAmount: number;
  finalPrice: number;
}

export class ProfitMarginService {
  private ruleRepository: ProfitMarginRuleRepository;
  private exchangeRateService: ExchangeRateService;
  private currencyRepository: CurrencyRepository;
  private componentRepository: PCComponentRepository;

  constructor() {
    this.ruleRepository = new ProfitMarginRuleRepository();
    this.exchangeRateService = new ExchangeRateService();
    this.currencyRepository = new CurrencyRepository();
    this.componentRepository = new PCComponentRepository();
  }

  async getAllRules() {
    return await this.ruleRepository.findAllWithComponent();
  }

  async getRuleById(id: string) {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) throw new Error('Profit margin rule not found');
    return rule;
  }

  async createRule(data: Partial<ProfitMarginRuleAttributes>) {
    this.validateRule(data);
    return await this.ruleRepository.create(data);
  }

  async updateRule(id: string, data: Partial<ProfitMarginRuleAttributes>) {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) throw new Error('Profit margin rule not found');

    this.validateRule({ ...rule.toJSON(), ...data });

    const [affectedCount, updated] = await this.ruleRepository.update(id, data);
    if (affectedCount === 0) throw new Error('Failed to update rule');
    return updated[0];
  }

  async deleteRule(id: string) {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) throw new Error('Profit margin rule not found');
    await this.ruleRepository.delete(id);
  }

  /**
   * Calculate customer price for a PC component
   */
  async calculateCustomerPrice(component: PCComponent): Promise<PriceBreakdown> {
    const distributorCost = Number(component.distributorCost);
    const costCurrency = component.costCurrency || 'SEK';

    if (!distributorCost || distributorCost <= 0) {
      throw new Error('Component has no distributor cost set');
    }

    // Get base currency
    const baseCurrency = await this.currencyRepository.getBaseCurrency();
    const baseCurrencyCode = baseCurrency ? baseCurrency.code : 'SEK';

    // Convert distributor cost to base currency
    let exchangeRate = 1;
    let costInBaseCurrency = distributorCost;

    if (costCurrency !== baseCurrencyCode) {
      exchangeRate = await this.exchangeRateService.getRate(costCurrency, baseCurrencyCode);
      costInBaseCurrency = distributorCost * exchangeRate;
    }

    // Find effective margin rule
    const marginRule = await this.ruleRepository.getEffectiveRule(
      component.id,
      component.componentType
    );

    let marginAmount = 0;
    let finalPrice = costInBaseCurrency;

    if (marginRule) {
      const marginValue = Number(marginRule.marginValue);
      if (marginRule.marginType === 'percentage') {
        marginAmount = costInBaseCurrency * (marginValue / 100);
      } else {
        marginAmount = marginValue;
      }
      finalPrice = costInBaseCurrency + marginAmount;
    }

    // Round to 2 decimal places
    finalPrice = Math.round(finalPrice * 100) / 100;
    marginAmount = Math.round(marginAmount * 100) / 100;
    costInBaseCurrency = Math.round(costInBaseCurrency * 100) / 100;

    return {
      distributorCost,
      costCurrency,
      exchangeRate,
      costInBaseCurrency,
      marginRule: marginRule
        ? {
            id: marginRule.id,
            name: marginRule.name,
            type: marginRule.type,
            marginType: marginRule.marginType,
            marginValue: Number(marginRule.marginValue),
          }
        : null,
      marginAmount,
      finalPrice,
    };
  }

  /**
   * Recalculate and update the price for a single component
   */
  async recalculatePrice(pcComponentId: string): Promise<PriceBreakdown | null> {
    const component = await this.componentRepository.findById(pcComponentId);
    if (!component) throw new Error('Component not found');

    if (!component.distributorCost || Number(component.distributorCost) <= 0) {
      return null; // No distributor cost, skip
    }

    const breakdown = await this.calculateCustomerPrice(component);

    await this.componentRepository.update(pcComponentId, {
      price: breakdown.finalPrice,
    });

    return breakdown;
  }

  /**
   * Recalculate prices for all components that have distributor cost
   */
  async recalculateAllPrices(): Promise<{ updated: number; skipped: number; errors: string[] }> {
    const allComponents = await this.componentRepository.findAll();
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const component of allComponents) {
      if (!component.distributorCost || Number(component.distributorCost) <= 0) {
        skipped++;
        continue;
      }

      try {
        await this.recalculatePrice(component.id);
        updated++;
      } catch (error: any) {
        errors.push(`${component.name_en}: ${error.message}`);
      }
    }

    return { updated, skipped, errors };
  }

  private validateRule(data: Partial<ProfitMarginRuleAttributes>) {
    if (!data.name) throw new Error('Rule name is required');
    if (!data.type) throw new Error('Rule type is required');
    if (!data.marginType) throw new Error('Margin type is required');
    if (data.marginValue === undefined || data.marginValue === null) {
      throw new Error('Margin value is required');
    }

    const marginValue = Number(data.marginValue);
    if (isNaN(marginValue) || marginValue < 0) {
      throw new Error('Margin value must be a non-negative number');
    }

    if (data.marginType === 'percentage' && marginValue > 1000) {
      throw new Error('Percentage margin cannot exceed 1000%');
    }

    if (data.type === 'product' && !data.pcComponentId) {
      throw new Error('Product-level rule requires a PC component ID');
    }

    if (data.type === 'category' && !data.componentType) {
      throw new Error('Category-level rule requires a component type');
    }

    if (data.type === 'global') {
      // Clear product/category specific fields for global rules
      data.pcComponentId = null;
      data.componentType = null;
    }
  }
}

export default ProfitMarginService;
