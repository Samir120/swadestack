import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { EmailTemplateType } from '../config/emailConfig';
import SiteSettingsRepository from '../integration/repositories/SiteSettingsRepository';
import SiteSettings from '../models/sequelize/SiteSettings';
import CompanyLegalSettings from '../models/sequelize/CompanyLegalSettings';

interface TemplateCache {
  [key: string]: HandlebarsTemplateDelegate;
}

interface SiteSettingsCache {
  settings: SiteSettings | null;
  fetchedAt: number;
}

const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class EmailTemplateRenderer {
  private templateCache: TemplateCache = {};
  private templatesPath: string;
  private settingsCache: SiteSettingsCache | null = null;

  constructor(templatesPath: string) {
    this.templatesPath = templatesPath;
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Format currency helper
    // FIX: Check if the second argument is a string. If it's an object, it's the Handlebars options object.
    Handlebars.registerHelper('formatCurrency', function (amount: number, currencyOrOptions: any) {
      const currency = typeof currencyOrOptions === 'string' ? currencyOrOptions : 'SEK';
      const numericAmount = Number(amount) || 0; // Safety check

      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: currency,
      }).format(numericAmount);
    });

    // Format date helper
    // FIX: Check if the second argument is a string (locale).
    Handlebars.registerHelper('formatDate', function (date: Date | string, localeOrOptions: any) {
      const locale = typeof localeOrOptions === 'string' ? localeOrOptions : 'en';
      
      if (!date) return ''; // Handle missing dates gracefully

      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      return new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function (this: any, arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    // Translation helper (basic)
    Handlebars.registerHelper('t', function (key: string, lang: string, options: any) {
      // This would be replaced with actual translation logic
      return key;
    });
  }

  /**
   * Load and compile template
   */
  private async loadTemplate(templateType: EmailTemplateType, language: string): Promise<HandlebarsTemplateDelegate> {
    const cacheKey = `${templateType}_${language}`;

    // Return cached template if available
    if (this.templateCache[cacheKey]) {
      return this.templateCache[cacheKey];
    }

    try {
      // Load HTML template
      const htmlPath = path.join(this.templatesPath, templateType, `${language}.html`);
      const htmlContent = await fs.readFile(htmlPath, 'utf-8');

      // Compile template
      const compiled = Handlebars.compile(htmlContent);

      // Cache the compiled template
      this.templateCache[cacheKey] = compiled;

      return compiled;
    } catch (error) {
      throw new Error(`Failed to load template ${templateType} for language ${language}: ${error}`);
    }
  }

  /**
   * Load text version of template
   */
  private async loadTextTemplate(templateType: EmailTemplateType, language: string): Promise<string | null> {
    try {
      const textPath = path.join(this.templatesPath, templateType, `${language}.txt`);
      return await fs.readFile(textPath, 'utf-8');
    } catch (error) {
      // Text templates are optional
      return null;
    }
  }

  /**
   * Fetch SiteSettings with 5-minute TTL cache
   */
  private async getSiteSettings(): Promise<SiteSettings | null> {
    const now = Date.now();
    if (this.settingsCache && (now - this.settingsCache.fetchedAt) < SETTINGS_CACHE_TTL) {
      return this.settingsCache.settings;
    }

    try {
      const repo = new SiteSettingsRepository();
      const settings = await repo.getSettings();
      this.settingsCache = { settings, fetchedAt: now };
      return settings;
    } catch (error) {
      // DB unavailable — return cached if available, otherwise null
      return this.settingsCache?.settings ?? null;
    }
  }

  /**
   * Build flat Handlebars variables from SiteSettings, resolving language-specific fields
   */
  private buildSiteData(settings: SiteSettings | null, language: string): Record<string, string> {
    const lang = language === 'sv' ? 'sv' : 'en';
    const frontendUrl = process.env.FRONTEND_URL || '';

    const defaultCopyright = `© ${new Date().getFullYear()} All rights reserved.`;

    if (!settings) {
      return {
        siteName: '',
        logoImage: '',
        tagline: '',
        siteEmail: '',
        sitePhone: '',
        siteAddress: '',
        siteCity: '',
        siteCountry: '',
        sitePostalCode: '',
        copyrightText: defaultCopyright,
        footerDescription: '',
      };
    }

    // Resolve logo: prefer logoFile, fall back to logoUrl
    // Handle absolute URLs, data URIs (base64), and relative paths
    // Skip default placeholder paths that aren't real uploaded logos
    let logoImage = '';
    const isPlaceholder = (val: string) => val === '/logo.png' || val === 'logo.png';
    const resolveUrl = (val: string) => {
      if (val.startsWith('http') || val.startsWith('data:')) return val;
      return `${frontendUrl}${val}`;
    };
    if (settings.logoFile && !isPlaceholder(settings.logoFile)) {
      logoImage = resolveUrl(settings.logoFile);
    } else if (settings.logoUrl && !isPlaceholder(settings.logoUrl)) {
      logoImage = resolveUrl(settings.logoUrl);
    }

    // Resolve siteName, ignoring default placeholder values
    const isDefaultName = (val: string | null | undefined) =>
      !val || val === 'My Company' || val === 'Mitt Företag';
    const rawName = lang === 'sv' ? settings.siteName_sv : settings.siteName_en;
    const fallbackName = settings.siteName_en;
    const siteName = !isDefaultName(rawName) ? rawName! : !isDefaultName(fallbackName) ? fallbackName! : '';

    // Resolve copyright, ignoring default placeholder values
    const isDefaultCopyright = (val: string | null | undefined) =>
      !val || /^© \d{4} My Company/.test(val) || /^© \d{4} Mitt Företag/.test(val);
    const rawCopyright = lang === 'sv' ? settings.copyrightText_sv : settings.copyrightText_en;
    const fallbackCopyright = settings.copyrightText_en;
    const copyrightText = !isDefaultCopyright(rawCopyright) ? rawCopyright! : !isDefaultCopyright(fallbackCopyright) ? fallbackCopyright! : defaultCopyright;

    return {
      siteName,
      logoImage,
      tagline: (lang === 'sv' ? settings.tagline_sv : settings.tagline_en) || settings.tagline_en || '',
      siteEmail: settings.email || '',
      sitePhone: settings.phone || '',
      siteAddress: settings.address || '',
      siteCity: settings.city || '',
      siteCountry: settings.country || '',
      sitePostalCode: settings.postalCode || '',
      copyrightText,
      footerDescription: (lang === 'sv' ? settings.footerDescription_sv : settings.footerDescription_en) || settings.footerDescription_en || '',
    };
  }

  /**
   * Fetch CompanyLegalSettings fresh from DB (no cache — emails are infrequent)
   */
  private async getLegalSettings(): Promise<CompanyLegalSettings | null> {
    try {
      return await CompanyLegalSettings.findOne();
    } catch (error) {
      return null;
    }
  }

  /**
   * Build rendered invoice disclaimer text for email templates
   */
  private buildDisclaimerData(legalSettings: CompanyLegalSettings | null, language: string): Record<string, any> {
    if (!legalSettings || !legalSettings.showInvoiceDisclaimer) {
      return { showInvoiceDisclaimer: false, invoiceDisclaimerText: '' };
    }

    const lang = language === 'sv' ? 'sv' : 'en';
    const defaultEn = 'All payments and invoices are issued by {CompanyName} (Org.nr: {OrganizationNumber}, VAT: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} is a trading name of {CompanyName}.';
    const defaultSv = 'Alla betalningar och fakturor utfärdas av {CompanyName} (Org.nr: {OrganizationNumber}, Moms.nr: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} är ett handelsnamn för {CompanyName}.';

    const raw = lang === 'sv'
      ? (legalSettings.invoiceDisclaimer_sv || defaultSv)
      : (legalSettings.invoiceDisclaimer_en || defaultEn);

    const rendered = raw
      .replace(/\{CompanyName\}/g, legalSettings.companyName || '')
      .replace(/\{TradingName\}/g, legalSettings.tradingName || '')
      .replace(/\{OrganizationNumber\}/g, legalSettings.orgNumber || '')
      .replace(/\{VatNumber\}/g, legalSettings.vatNumber || '')
      .replace(/\{StreetAddress\}/g, legalSettings.streetAddress || '')
      .replace(/\{PostalCode\}/g, legalSettings.postalCode || '')
      .replace(/\{City\}/g, legalSettings.city || '');

    return { showInvoiceDisclaimer: true, invoiceDisclaimerText: rendered };
  }

  /**
   * Render email template
   */
  async render(
    templateType: EmailTemplateType,
    data: any,
    language: string = 'en'
  ): Promise<{ html: string; text?: string }> {
    try {
      // Fetch site settings and merge branding variables
      const settings = await this.getSiteSettings();
      const siteData = this.buildSiteData(settings, language);
      const legalSettings = await this.getLegalSettings();
      const disclaimerData = this.buildDisclaimerData(legalSettings, language);
      const mergedData = { ...siteData, ...disclaimerData, ...data };

      // Load and compile HTML template
      const htmlTemplate = await this.loadTemplate(templateType, language);
      const html = htmlTemplate(mergedData);

      // Load text template (optional)
      const textTemplate = await this.loadTextTemplate(templateType, language);
      let text: string | undefined;

      if (textTemplate) {
        const textCompiled = Handlebars.compile(textTemplate);
        text = textCompiled(mergedData);
      }

      return { html, text };
    } catch (error) {
      throw new Error(`Failed to render template ${templateType}: ${error}`);
    }
  }

  /**
   * Clear template cache and settings cache (useful for development)
   */
  clearCache(): void {
    this.templateCache = {};
    this.settingsCache = null;
  }

  /**
   * Preload commonly used templates
   */
  async preloadTemplates(templates: Array<{ type: EmailTemplateType; language: string }>): Promise<void> {
    const promises = templates.map(({ type, language }) => this.loadTemplate(type, language));
    await Promise.all(promises);
  }
}

// Export singleton instance
let rendererInstance: EmailTemplateRenderer | null = null;

export function getTemplateRenderer(templatesPath?: string): EmailTemplateRenderer {
  if (!rendererInstance) {
    if (!templatesPath) {
      throw new Error('Templates path must be provided for first initialization');
    }
    rendererInstance = new EmailTemplateRenderer(templatesPath);
  }
  return rendererInstance;
}