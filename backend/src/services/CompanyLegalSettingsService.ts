import CompanyLegalSettingsRepository from '../integration/repositories/CompanyLegalSettingsRepository';
import { CompanyLegalSettingsAttributes } from '../models/sequelize/CompanyLegalSettings';

export class CompanyLegalSettingsService {
  private repository: CompanyLegalSettingsRepository;

  constructor() {
    this.repository = new CompanyLegalSettingsRepository();
  }

  /**
   * Get all settings (admin)
   */
  async getSettings() {
    return await this.repository.getOrCreateSettings();
  }

  /**
   * Update settings
   */
  async updateSettings(data: Partial<CompanyLegalSettingsAttributes>) {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }
    return await this.repository.updateSettings(data);
  }

  /**
   * Get public settings (safe to expose to frontend)
   */
  async getPublicSettings() {
    const settings = await this.repository.getOrCreateSettings();
    return {
      companyName: settings.companyName,
      tradingName: settings.tradingName,
      orgNumber: settings.orgNumber,
      vatNumber: settings.vatNumber,
      managingDirector: settings.managingDirector,
      streetAddress: settings.streetAddress,
      postalCode: settings.postalCode,
      city: settings.city,
      country: settings.country,
      email: settings.email,
      phoneNumber: settings.phoneNumber,
      showFooterLegalEntity: settings.showFooterLegalEntity,
      showCheckoutConsent: settings.showCheckoutConsent,
      checkoutConsentText_en: settings.checkoutConsentText_en,
      checkoutConsentText_sv: settings.checkoutConsentText_sv,
      showInvoiceDisclaimer: settings.showInvoiceDisclaimer,
      invoiceDisclaimer_en: settings.invoiceDisclaimer_en,
      invoiceDisclaimer_sv: settings.invoiceDisclaimer_sv,
      updatedAt: settings.updatedAt,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default CompanyLegalSettingsService;
