import { BaseDAO } from '../dao/BaseDAO';
import ExchangeRate from '../../models/sequelize/ExchangeRate';

export class ExchangeRateRepository extends BaseDAO<ExchangeRate> {
  constructor() {
    super(ExchangeRate);
  }

  async getRate(baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | null> {
    return await this.findOne({ baseCurrency, targetCurrency } as any);
  }

  async upsertRate(baseCurrency: string, targetCurrency: string, rate: number): Promise<ExchangeRate> {
    const existing = await this.getRate(baseCurrency, targetCurrency);
    if (existing) {
      await existing.update({ rate, fetchedAt: new Date() });
      return existing;
    }
    return await this.create({
      baseCurrency,
      targetCurrency,
      rate,
      fetchedAt: new Date(),
    });
  }

  async getLastFetchTime(): Promise<Date | null> {
    const latest = await this.model.findOne({
      order: [['fetchedAt', 'DESC']],
    });
    return latest ? latest.fetchedAt : null;
  }

  async getAllRates(): Promise<ExchangeRate[]> {
    return await this.findAll({
      order: [['baseCurrency', 'ASC'], ['targetCurrency', 'ASC']],
    });
  }
}

export default ExchangeRateRepository;
