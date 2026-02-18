import { BaseDAO } from '../dao/BaseDAO';
import VatSettings, { VatSettingsAttributes } from '../../models/sequelize/VatSettings';

export class VatSettingsRepository extends BaseDAO<VatSettings> {
  constructor() {
    super(VatSettings);
  }

  /**
   * Get the VAT settings (single-record pattern)
   */
  async getSettings(): Promise<VatSettings | null> {
    return await this.model.findOne();
  }

  /**
   * Create default settings if none exist
   */
  async createDefault(): Promise<VatSettings> {
    return await this.create({} as any);
  }

  /**
   * Get or create settings
   */
  async getOrCreateSettings(): Promise<VatSettings> {
    let settings = await this.getSettings();
    if (!settings) {
      settings = await this.createDefault();
    }
    return settings;
  }

  /**
   * Update settings
   */
  async updateSettings(data: Partial<VatSettingsAttributes>): Promise<VatSettings> {
    const settings = await this.getOrCreateSettings();
    await settings.update(data);
    return settings;
  }
}

export default VatSettingsRepository;
