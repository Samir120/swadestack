import CurrencyRepository from '../integration/repositories/CurrencyRepository';
import { CurrencyAttributes } from '../models/sequelize/Currency';

export class CurrencyService {
  private repository: CurrencyRepository;

  constructor() {
    this.repository = new CurrencyRepository();
  }

  async getAllCurrencies() {
    return await this.repository.findAll({
      order: [['code', 'ASC']],
    });
  }

  async getActiveCurrencies() {
    return await this.repository.findAllActive();
  }

  async getCurrencyById(id: string) {
    const currency = await this.repository.findById(id);
    if (!currency) throw new Error('Currency not found');
    return currency;
  }

  async getBaseCurrency() {
    return await this.repository.getBaseCurrency();
  }

  async getDisplayCurrency() {
    return await this.repository.getDisplayCurrency();
  }

  async createCurrency(data: Partial<CurrencyAttributes>) {
    if (!data.code || !data.name || !data.symbol) {
      throw new Error('Code, name, and symbol are required');
    }

    // Validate code is exactly 3 uppercase letters
    const code = data.code.toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error('Currency code must be exactly 3 uppercase letters');
    }

    // Check uniqueness
    const existing = await this.repository.findByCode(code);
    if (existing) {
      throw new Error(`Currency with code ${code} already exists`);
    }

    return await this.repository.create({
      ...data,
      code,
    });
  }

  async updateCurrency(id: string, data: Partial<CurrencyAttributes>) {
    const currency = await this.repository.findById(id);
    if (!currency) throw new Error('Currency not found');

    // If code is changing, validate uniqueness
    if (data.code && data.code !== currency.code) {
      const code = data.code.toUpperCase();
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new Error(`Currency with code ${code} already exists`);
      }
      data.code = code;
    }

    const [affectedCount, updated] = await this.repository.update(id, data);
    if (affectedCount === 0) throw new Error('Failed to update currency');
    return updated[0];
  }

  async deleteCurrency(id: string) {
    const currency = await this.repository.findById(id);
    if (!currency) throw new Error('Currency not found');

    if (currency.isBaseCurrency) {
      throw new Error('Cannot delete the base currency');
    }
    if (currency.isDisplayCurrency) {
      throw new Error('Cannot delete the display currency');
    }

    await this.repository.delete(id);
  }

  async setBaseCurrency(id: string) {
    const currency = await this.repository.findById(id);
    if (!currency) throw new Error('Currency not found');
    if (!currency.isActive) throw new Error('Cannot set inactive currency as base');

    await this.repository.setBaseCurrency(id);
    return await this.repository.findById(id);
  }

  async setDisplayCurrency(id: string) {
    const currency = await this.repository.findById(id);
    if (!currency) throw new Error('Currency not found');
    if (!currency.isActive) throw new Error('Cannot set inactive currency as display');

    await this.repository.setDisplayCurrency(id);
    return await this.repository.findById(id);
  }
}

export default CurrencyService;
