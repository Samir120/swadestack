import { BaseDAO } from '../dao/BaseDAO';
import Currency from '../../models/sequelize/Currency';

export class CurrencyRepository extends BaseDAO<Currency> {
  constructor() {
    super(Currency);
  }

  async findAllActive(): Promise<Currency[]> {
    return await this.findAll({
      where: { isActive: true } as any,
      order: [['code', 'ASC']],
    });
  }

  async findByCode(code: string): Promise<Currency | null> {
    return await this.findOne({ code } as any);
  }

  async getBaseCurrency(): Promise<Currency | null> {
    return await this.findOne({ isBaseCurrency: true } as any);
  }

  async getDisplayCurrency(): Promise<Currency | null> {
    return await this.findOne({ isDisplayCurrency: true } as any);
  }

  async setBaseCurrency(id: string): Promise<void> {
    // Clear existing base currency
    await this.model.update(
      { isBaseCurrency: false } as any,
      { where: { isBaseCurrency: true } as any }
    );
    // Set new base currency
    await this.model.update(
      { isBaseCurrency: true } as any,
      { where: { id } as any }
    );
  }

  async setDisplayCurrency(id: string): Promise<void> {
    // Clear existing display currency
    await this.model.update(
      { isDisplayCurrency: false } as any,
      { where: { isDisplayCurrency: true } as any }
    );
    // Set new display currency
    await this.model.update(
      { isDisplayCurrency: true } as any,
      { where: { id } as any }
    );
  }
}

export default CurrencyRepository;
