import { BaseDAO } from '../dao/BaseDAO';
import CompanyLegalSettings, { CompanyLegalSettingsAttributes } from '../../models/sequelize/CompanyLegalSettings';

export class CompanyLegalSettingsRepository extends BaseDAO<CompanyLegalSettings> {
  constructor() {
    super(CompanyLegalSettings);
  }

  /**
   * Get the company legal settings (single-record pattern)
   */
  async getSettings(): Promise<CompanyLegalSettings | null> {
    return await this.model.findOne();
  }

  /**
   * Create default settings if none exist
   */
  async createDefault(): Promise<CompanyLegalSettings> {
    return await this.create({} as any);
  }

  /**
   * Get or create settings
   */
  async getOrCreateSettings(): Promise<CompanyLegalSettings> {
    let settings = await this.getSettings();
    if (!settings) {
      settings = await this.createDefault();
    }
    return settings;
  }

  /**
   * Update settings
   */
  async updateSettings(data: Partial<CompanyLegalSettingsAttributes>): Promise<CompanyLegalSettings> {
    const settings = await this.getOrCreateSettings();
    await settings.update(data);
    return settings;
  }
}

export default CompanyLegalSettingsRepository;
