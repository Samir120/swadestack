import { BaseDAO } from '../dao/BaseDAO';
import SiteSettings, { SiteSettingsAttributes } from '../../models/sequelize/SiteSettings';

export class SiteSettingsRepository extends BaseDAO<SiteSettings> {
  constructor() {
    super(SiteSettings);
  }

  /**
   * Get the site settings (there should only be one record)
   */
  async getSettings(): Promise<SiteSettings | null> {
    const settings = await this.model.findOne();
    return settings;
  }

  /**
   * Create default settings if none exist
   */
  async createDefault(): Promise<SiteSettings> {
    const settings = await this.create({} as any);
    return settings;
  }

  /**
   * Get or create settings
   */
  async getOrCreateSettings(): Promise<SiteSettings> {
    let settings = await this.getSettings();
    if (!settings) {
      settings = await this.createDefault();
    }
    return settings;
  }

  /**
   * Update settings
   */
  async updateSettings(data: Partial<SiteSettingsAttributes>): Promise<SiteSettings> {
    const settings = await this.getOrCreateSettings();
    await settings.update(data);
    return settings;
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode(): Promise<SiteSettings> {
    const settings = await this.getOrCreateSettings();
    settings.maintenanceMode = !settings.maintenanceMode;
    await settings.save();
    return settings;
  }
}

export default SiteSettingsRepository;
