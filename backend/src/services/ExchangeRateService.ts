import axios from 'axios';
import ExchangeRateRepository from '../integration/repositories/ExchangeRateRepository';
import CurrencyRepository from '../integration/repositories/CurrencyRepository';
import { config } from '../config/environment';

export class ExchangeRateService {
  private rateRepository: ExchangeRateRepository;
  private currencyRepository: CurrencyRepository;

  constructor() {
    this.rateRepository = new ExchangeRateRepository();
    this.currencyRepository = new CurrencyRepository();
  }

  /**
   * Fetch latest rates from exchangerate-api.com and cache them
   */
  async fetchAndCacheRates(): Promise<{ updated: number; errors: string[] }> {
    const baseCurrency = await this.currencyRepository.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('No base currency configured. Please set a base currency first.');
    }

    const apiKey = config.exchangeRate.apiKey;
    if (!apiKey) {
      throw new Error('Exchange rate API key is not configured');
    }

    const url = `${config.exchangeRate.baseUrl}/${apiKey}/latest/${baseCurrency.code}`;

    let responseData: any;
    try {
      const response = await axios.get(url, { timeout: 10000 });
      responseData = response.data;
    } catch (error: any) {
      console.warn('Exchange rate API request failed:', error.message);
      throw new Error('Failed to fetch exchange rates from API. Using cached rates.');
    }

    if (responseData.result !== 'success') {
      throw new Error(`Exchange rate API error: ${responseData['error-type'] || 'Unknown error'}`);
    }

    const conversionRates = responseData.conversion_rates;
    const activeCurrencies = await this.currencyRepository.findAllActive();
    const activeCodes = new Set(activeCurrencies.map((c) => c.code));

    let updated = 0;
    const errors: string[] = [];

    for (const [targetCode, rate] of Object.entries(conversionRates)) {
      if (!activeCodes.has(targetCode)) continue;
      if (targetCode === baseCurrency.code) continue;

      try {
        await this.rateRepository.upsertRate(baseCurrency.code, targetCode, rate as number);
        updated++;
      } catch (error: any) {
        errors.push(`Failed to save rate for ${targetCode}: ${error.message}`);
      }
    }

    return { updated, errors };
  }

  /**
   * Get cached rate between two currencies
   */
  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    // Try direct rate
    const directRate = await this.rateRepository.getRate(fromCurrency, toCurrency);
    if (directRate) return Number(directRate.rate);

    // Try inverse rate
    const inverseRate = await this.rateRepository.getRate(toCurrency, fromCurrency);
    if (inverseRate && Number(inverseRate.rate) !== 0) {
      return 1 / Number(inverseRate.rate);
    }

    throw new Error(`No exchange rate found for ${fromCurrency} → ${toCurrency}`);
  }

  /**
   * Convert amount between currencies
   */
  async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const rate = await this.getRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Check if rates should be refreshed (older than 24h)
   */
  async shouldRefresh(): Promise<boolean> {
    const lastFetch = await this.rateRepository.getLastFetchTime();
    if (!lastFetch) return true;

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastFetch < twentyFourHoursAgo;
  }

  /**
   * Get all cached rates with status info
   */
  async getRatesWithStatus() {
    const rates = await this.rateRepository.getAllRates();
    const lastFetchedAt = await this.rateRepository.getLastFetchTime();
    const isStale = await this.shouldRefresh();

    return {
      rates,
      lastFetchedAt: lastFetchedAt ? lastFetchedAt.toISOString() : null,
      isStale,
    };
  }
}

export default ExchangeRateService;
