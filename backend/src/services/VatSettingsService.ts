import VatSettingsRepository from '../integration/repositories/VatSettingsRepository';
import { VatSettingsAttributes } from '../models/sequelize/VatSettings';

export class VatSettingsService {
  private repository: VatSettingsRepository;

  constructor() {
    this.repository = new VatSettingsRepository();
  }

  /**
   * Get all settings (admin)
   */
  async getSettings() {
    return await this.repository.getOrCreateSettings();
  }

  /**
   * Get public settings (safe to expose to frontend)
   */
  async getPublicSettings() {
    const settings = await this.repository.getOrCreateSettings();
    return {
      vatRate: Number(settings.vatRate),
      label_en: settings.label_en,
      label_sv: settings.label_sv,
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Update settings
   */
  async updateSettings(data: Partial<VatSettingsAttributes>) {
    if (data.vatRate !== undefined) {
      const rate = Number(data.vatRate);
      if (isNaN(rate) || rate <= 0 || rate > 1) {
        throw new Error('VAT rate must be greater than 0 and at most 1 (e.g. 0.25 for 25%)');
      }
    }
    return await this.repository.updateSettings(data);
  }

  /**
   * Get current VAT rate as a number (e.g. 0.25)
   */
  async getCurrentRate(): Promise<number> {
    const settings = await this.repository.getOrCreateSettings();
    return Number(settings.vatRate);
  }
}

export default VatSettingsService;
