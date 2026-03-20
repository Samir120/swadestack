import SiteSettingsRepository from '../integration/repositories/SiteSettingsRepository';
import { SiteSettingsAttributes } from '../models/sequelize/SiteSettings';

export class SiteSettingsService {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  async getSettings() {
    const settings = await this.repository.getOrCreateSettings();
    return settings;
  }

  async updateSettings(data: Partial<SiteSettingsAttributes>) {
    // Validate URLs if provided (but allow base64 data URIs)
    if (data.logoUrl && !this.isValidUrlOrDataUri(data.logoUrl)) {
      throw new Error('Invalid logo URL');
    }
    if (data.faviconUrl && !this.isValidUrlOrDataUri(data.faviconUrl)) {
      throw new Error('Invalid favicon URL');
    }

    // Validate email
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Parse business hours if provided
    if (data.businessHours && typeof data.businessHours === 'string') {
      try {
        JSON.parse(data.businessHours);
      } catch (error) {
        throw new Error('Invalid business hours format');
      }
    }

    const settings = await this.repository.updateSettings(data);
    return settings;
  }

  /**
   * Toggle maintenance mode
   */
  async toggleMaintenanceMode() {
    const settings = await this.repository.toggleMaintenanceMode();
    return settings;
  }

  /**
   * Check if site is in maintenance mode
   */
  async isMaintenanceMode(): Promise<boolean> {
    const settings = await this.repository.getSettings();
    return settings?.maintenanceMode || false;
  }

  /**
   * Get public settings (safe to expose to frontend)
   */
  async getPublicSettings() {
    const settings = await this.getSettings();
    
    // Return only public-safe data
    return {
      siteName_en: settings.siteName_en,
      siteName_sv: settings.siteName_sv,
      tagline_en: settings.tagline_en,
      tagline_sv: settings.tagline_sv,
      logoUrl: settings.logoUrl,
      logoFile: settings.logoFile,
      faviconUrl: settings.faviconUrl,
      faviconFile: settings.faviconFile,
      metaTitle_en: settings.metaTitle_en,
      metaTitle_sv: settings.metaTitle_sv,
      metaDescription_en: settings.metaDescription_en,
      metaDescription_sv: settings.metaDescription_sv,
      metaKeywords_en: settings.metaKeywords_en,
      metaKeywords_sv: settings.metaKeywords_sv,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      country: settings.country,
      postalCode: settings.postalCode,
      facebookUrl: settings.facebookUrl,
      twitterUrl: settings.twitterUrl,
      instagramUrl: settings.instagramUrl,
      linkedinUrl: settings.linkedinUrl,
      youtubeUrl: settings.youtubeUrl,
      githubUrl: settings.githubUrl,
      facebookIcon: settings.facebookIcon,
      twitterIcon: settings.twitterIcon,
      instagramIcon: settings.instagramIcon,
      linkedinIcon: settings.linkedinIcon,
      youtubeIcon: settings.youtubeIcon,
      githubIcon: (settings as any).githubIcon,
      copyrightText_en: settings.copyrightText_en,
      copyrightText_sv: settings.copyrightText_sv,
      footerDescription_en: settings.footerDescription_en,
      footerDescription_sv: settings.footerDescription_sv,
      // Landing Page Content
      heroStatus_en: settings.heroStatus_en,
      heroStatus_sv: settings.heroStatus_sv,
      heroFallbackText_en: settings.heroFallbackText_en,
      heroFallbackText_sv: settings.heroFallbackText_sv,
      heroButtonPrimary_en: settings.heroButtonPrimary_en,
      heroButtonPrimary_sv: settings.heroButtonPrimary_sv,
      heroButtonSecondary_en: settings.heroButtonSecondary_en,
      heroButtonSecondary_sv: settings.heroButtonSecondary_sv,
      portfolioTitle_en: settings.portfolioTitle_en,
      portfolioTitle_sv: settings.portfolioTitle_sv,
      portfolioSubtitle_en: settings.portfolioSubtitle_en,
      portfolioSubtitle_sv: settings.portfolioSubtitle_sv,
      portfolioEmptyMessage_en: settings.portfolioEmptyMessage_en,
      portfolioEmptyMessage_sv: settings.portfolioEmptyMessage_sv,
      servicesTitle_en: settings.servicesTitle_en,
      servicesTitle_sv: settings.servicesTitle_sv,
      servicesSubtitle_en: settings.servicesSubtitle_en,
      servicesSubtitle_sv: settings.servicesSubtitle_sv,
      servicesEmptyMessage_en: settings.servicesEmptyMessage_en,
      servicesEmptyMessage_sv: settings.servicesEmptyMessage_sv,
      contactTitle_en: settings.contactTitle_en,
      contactTitle_sv: settings.contactTitle_sv,
      contactSubtitle_en: settings.contactSubtitle_en,
      contactSubtitle_sv: settings.contactSubtitle_sv,
      contactEmailLabel_en: settings.contactEmailLabel_en,
      contactEmailLabel_sv: settings.contactEmailLabel_sv,
      contactPhoneLabel_en: settings.contactPhoneLabel_en,
      contactPhoneLabel_sv: settings.contactPhoneLabel_sv,
      businessHours: settings.businessHours,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage_en: settings.maintenanceMessage_en,
      maintenanceMessage_sv: settings.maintenanceMessage_sv,
      // Feature Section
      featureSectionTitle_en: settings.featureSectionTitle_en,
      featureSectionTitle_sv: settings.featureSectionTitle_sv,
      featureSectionSubtitle_en: settings.featureSectionSubtitle_en,
      featureSectionSubtitle_sv: settings.featureSectionSubtitle_sv,
      featureSectionImageFile: settings.featureSectionImageFile,
      featureSectionMobileImageFile: settings.featureSectionMobileImageFile,
      // Gaming PC Section
      gamingPcSectionVisible: settings.gamingPcSectionVisible,
      gamingPcBadge_en: settings.gamingPcBadge_en,
      gamingPcBadge_sv: settings.gamingPcBadge_sv,
      gamingPcTitle_en: settings.gamingPcTitle_en,
      gamingPcTitle_sv: settings.gamingPcTitle_sv,
      gamingPcTagline_en: settings.gamingPcTagline_en,
      gamingPcTagline_sv: settings.gamingPcTagline_sv,
      gamingPcDescription_en: settings.gamingPcDescription_en,
      gamingPcDescription_sv: settings.gamingPcDescription_sv,
      gamingPcButtonPrimary_en: settings.gamingPcButtonPrimary_en,
      gamingPcButtonPrimary_sv: settings.gamingPcButtonPrimary_sv,
      gamingPcButtonSecondary_en: settings.gamingPcButtonSecondary_en,
      gamingPcButtonSecondary_sv: settings.gamingPcButtonSecondary_sv,
      gamingPcShowWarranty: settings.gamingPcShowWarranty,
      gamingPcWarrantyYears: settings.gamingPcWarrantyYears,
      gamingPcWarrantyLabel_en: settings.gamingPcWarrantyLabel_en,
      gamingPcWarrantyLabel_sv: settings.gamingPcWarrantyLabel_sv,
      gamingPcShowCircleBadge2: settings.gamingPcShowCircleBadge2,
      gamingPcCircleBadge2Value: settings.gamingPcCircleBadge2Value,
      gamingPcCircleBadge2Label_en: settings.gamingPcCircleBadge2Label_en,
      gamingPcCircleBadge2Label_sv: settings.gamingPcCircleBadge2Label_sv,
      gamingPcShowCircleBadge3: settings.gamingPcShowCircleBadge3,
      gamingPcCircleBadge3Value: settings.gamingPcCircleBadge3Value,
      gamingPcCircleBadge3Label_en: settings.gamingPcCircleBadge3Label_en,
      gamingPcCircleBadge3Label_sv: settings.gamingPcCircleBadge3Label_sv,
      gamingPcSectionTitle_en: settings.gamingPcSectionTitle_en,
      gamingPcSectionTitle_sv: settings.gamingPcSectionTitle_sv,
      gamingPcViewAllButton_en: settings.gamingPcViewAllButton_en,
      gamingPcViewAllButton_sv: settings.gamingPcViewAllButton_sv,
      gamingPcEmptyMessage_en: settings.gamingPcEmptyMessage_en,
      gamingPcEmptyMessage_sv: settings.gamingPcEmptyMessage_sv,
      // Cookie Consent
      cookieConsentEnabled: settings.cookieConsentEnabled,
      cookieConsentTitle_en: settings.cookieConsentTitle_en,
      cookieConsentTitle_sv: settings.cookieConsentTitle_sv,
      cookieConsentDescription_en: settings.cookieConsentDescription_en,
      cookieConsentDescription_sv: settings.cookieConsentDescription_sv,
      cookieConsentAcceptButton_en: settings.cookieConsentAcceptButton_en,
      cookieConsentAcceptButton_sv: settings.cookieConsentAcceptButton_sv,
      cookieConsentReadMoreType: settings.cookieConsentReadMoreType,
      cookieConsentReadMoreInternal: settings.cookieConsentReadMoreInternal,
      cookieConsentReadMoreExternal: settings.cookieConsentReadMoreExternal,
      cookieConsentExpiryDays: settings.cookieConsentExpiryDays,
    };
  }

  // Helper methods
  private isValidUrlOrDataUri(url: string): boolean {
    // Allow relative URLs
    if (url.startsWith('/')) return true;
    
    // Allow data URIs (base64 images)
    if (url.startsWith('data:')) return true;
    
    // Validate HTTP/HTTPS URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default SiteSettingsService;
