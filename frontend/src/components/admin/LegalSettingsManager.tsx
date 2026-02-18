import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { legalSettingsApi } from '../../models/api/legalSettingsApi';
import { CompanyLegalSettings } from '../../models/types/legalSettings.types';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaSave,
  FaBuilding,
  FaAddressCard,
  FaGlobe,
  FaCheckSquare,
  FaChevronDown,
  FaChevronRight,
  FaInfoCircle,
  FaFileInvoice,
} from 'react-icons/fa';

/* ── Extracted sub-components (stable identity across renders) ── */

const SectionHeader: React.FC<{
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}> = ({ id, title, icon, description, isExpanded, onToggle }) => (
  <button
    onClick={() => onToggle(id)}
    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-surface-800/50 transition-colors rounded-xl"
  >
    <div className="flex items-center gap-3">
      <span className="text-primary-400">{icon}</span>
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
    </div>
    <span className="text-neutral-400">
      {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
    </span>
  </button>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, required, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-neutral-300 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm"
    />
  </div>
);

/* ── Main component ── */

const defaultSettings: CompanyLegalSettings = {
  companyName: '',
  tradingName: null,
  orgNumber: '',
  vatNumber: '',
  managingDirector: null,
  streetAddress: '',
  postalCode: '',
  city: '',
  country: 'Sweden',
  email: '',
  phoneNumber: '',
  showFooterLegalEntity: true,
  showCheckoutConsent: false,
  checkoutConsentText_en: null,
  checkoutConsentText_sv: null,
  showInvoiceDisclaimer: true,
  invoiceDisclaimer_en: null,
  invoiceDisclaimer_sv: null,
};

const LegalSettingsManager: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<CompanyLegalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    contact: false,
    footerNotice: false,
    consent: false,
    disclaimer: false,
  });
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await legalSettingsApi.getAdmin();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        toast.error('Failed to load legal settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (field: keyof CompanyLegalSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!settings.companyName.trim()) errors.push('Company name is required');
    if (!settings.orgNumber.trim()) errors.push('Organization number is required');
    if (!settings.vatNumber.trim()) errors.push('VAT number is required');
    if (!settings.streetAddress.trim()) errors.push('Street address is required');
    if (!settings.postalCode.trim()) errors.push('Postal code is required');
    if (!settings.city.trim()) errors.push('City is required');
    if (!settings.email.trim()) errors.push('Email is required');
    if (!settings.phoneNumber.trim()) errors.push('Phone number is required');
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      errors.push('Invalid email format');
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setIsSaving(true);
    try {
      const response = await legalSettingsApi.update(settings);
      if (response.success && response.data) {
        setSettings(response.data);
        toast.success('Legal settings saved successfully');
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save legal settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Legal & Company Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your legal entity information, terms, and privacy policy
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <FaSave size={14} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Section 1: Company Identity */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden">
          <SectionHeader
            id="identity"
            title="Company Identity"
            icon={<FaBuilding size={18} />}
            description="Legal entity name, organization and VAT numbers"
            isExpanded={expandedSections.identity}
            onToggle={toggleSection}
          />
          {expandedSections.identity && (
            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Company Name (Legal)"
                  value={settings.companyName}
                  onChange={(v) => handleChange('companyName', v)}
                  required
                  placeholder="e.g. Minne24 AB"
                />
                <InputField
                  label="Trading Name"
                  value={settings.tradingName || ''}
                  onChange={(v) => handleChange('tradingName', v || null)}
                  placeholder="e.g. Swade Stack"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Organization Number"
                  value={settings.orgNumber}
                  onChange={(v) => handleChange('orgNumber', v)}
                  required
                  placeholder="e.g. 559XXX-XXXX"
                />
                <InputField
                  label="VAT Number"
                  value={settings.vatNumber}
                  onChange={(v) => handleChange('vatNumber', v)}
                  required
                  placeholder="e.g. SE559XXXXXXXX01"
                />
              </div>
              <InputField
                label="Managing Director"
                value={settings.managingDirector || ''}
                onChange={(v) => handleChange('managingDirector', v || null)}
                placeholder="Full name of managing director"
              />
            </div>
          )}
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden">
          <SectionHeader
            id="contact"
            title="Contact Information"
            icon={<FaAddressCard size={18} />}
            description="Registered business address, email, and phone"
            isExpanded={expandedSections.contact}
            onToggle={toggleSection}
          />
          {expandedSections.contact && (
            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <InputField
                label="Street Address"
                value={settings.streetAddress}
                onChange={(v) => handleChange('streetAddress', v)}
                required
                placeholder="e.g. Storgatan 1"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Postal Code"
                  value={settings.postalCode}
                  onChange={(v) => handleChange('postalCode', v)}
                  required
                  placeholder="e.g. 111 22"
                />
                <InputField
                  label="City"
                  value={settings.city}
                  onChange={(v) => handleChange('city', v)}
                  required
                  placeholder="e.g. Stockholm"
                />
                <InputField
                  label="Country"
                  value={settings.country}
                  onChange={(v) => handleChange('country', v)}
                  required
                  placeholder="e.g. Sweden"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  value={settings.email}
                  onChange={(v) => handleChange('email', v)}
                  required
                  type="email"
                  placeholder="e.g. info@company.se"
                />
                <InputField
                  label="Phone Number"
                  value={settings.phoneNumber}
                  onChange={(v) => handleChange('phoneNumber', v)}
                  required
                  placeholder="e.g. +46 8 123 45 67"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Footer Legal Notice */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden">
          <SectionHeader
            id="footerNotice"
            title="Footer Legal Notice"
            icon={<FaGlobe size={18} />}
            description="Show or hide the legal entity line in the website footer"
            isExpanded={expandedSections.footerNotice}
            onToggle={toggleSection}
          />
          {expandedSections.footerNotice && (
            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between bg-surface-800 border border-surface-600 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-white">Show legal entity in footer</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Displays &ldquo;Operated by {settings.companyName || '{CompanyName}'}&rdquo; with organization and VAT numbers in the website footer. Useful when the trading name differs from the legal entity.
                  </p>
                </div>
                <button
                  onClick={() => handleChange('showFooterLegalEntity', !settings.showFooterLegalEntity)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
                    settings.showFooterLegalEntity ? 'bg-primary-600' : 'bg-surface-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showFooterLegalEntity ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Live preview */}
              <div className="bg-slate-900 rounded-lg p-4 mt-3 text-center">
                {settings.showFooterLegalEntity ? (
                  <>
                    <div className="inline-flex flex-col gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 justify-center">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        <span className="text-xs text-slate-400">
                          Operated by{' '}
                          <span className="text-slate-300 font-medium">{settings.companyName || 'Company Name'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 justify-center">
                        <span>Org.nr: {settings.orgNumber || 'XXXXXX-XXXX'}</span>
                        {(settings.vatNumber || !settings.orgNumber) && (
                          <>
                            <span className="w-px h-3 bg-slate-700" />
                            <span>VAT: {settings.vatNumber || 'SEXXXXXXXXXX01'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-red-400/60 italic">(Hidden)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Checkout Consent */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden">
          <SectionHeader
            id="consent"
            title="Checkout Consent"
            icon={<FaCheckSquare size={18} />}
            description="Require customer consent checkbox at checkout"
            isExpanded={expandedSections.consent}
            onToggle={toggleSection}
          />
          {expandedSections.consent && (
            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between bg-surface-800 border border-surface-600 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-white">Show consent checkbox at checkout</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Requires customers to agree before placing an order
                  </p>
                </div>
                <button
                  onClick={() => handleChange('showCheckoutConsent', !settings.showCheckoutConsent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showCheckoutConsent ? 'bg-primary-600' : 'bg-surface-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showCheckoutConsent ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.showCheckoutConsent && (
                <>
                  <div className="bg-surface-800 border border-surface-600 rounded-lg p-3 flex items-start gap-2">
                    <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-neutral-400">
                      Use <code className="text-primary-400">{'{CompanyName}'}</code> and <code className="text-primary-400">{'{OrganizationNumber}'}</code> as template variables. Links to /terms and /privacy are added automatically.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Consent Text (English)</label>
                    <textarea
                      value={settings.checkoutConsentText_en || ''}
                      onChange={(e) => handleChange('checkoutConsentText_en', e.target.value || null)}
                      rows={3}
                      placeholder="e.g. I agree to the terms and conditions of {CompanyName} ({OrganizationNumber})."
                      className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Consent Text (Svenska)</label>
                    <textarea
                      value={settings.checkoutConsentText_sv || ''}
                      onChange={(e) => handleChange('checkoutConsentText_sv', e.target.value || null)}
                      rows={3}
                      placeholder="t.ex. Jag godkänner villkoren för {CompanyName} ({OrganizationNumber})."
                      className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm resize-y"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Invoice Disclaimer */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl overflow-hidden">
          <SectionHeader
            id="disclaimer"
            title="Invoice Disclaimer"
            icon={<FaFileInvoice size={18} />}
            description="Legal entity disclaimer shown on invoices and receipts"
            isExpanded={expandedSections.disclaimer}
            onToggle={toggleSection}
          />
          {expandedSections.disclaimer && (
            <div className="px-4 sm:px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between bg-surface-800 border border-surface-600 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-white">Show disclaimer on invoices</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Display legal entity information on all customer invoices and receipts
                  </p>
                </div>
                <button
                  onClick={() => handleChange('showInvoiceDisclaimer', !settings.showInvoiceDisclaimer)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showInvoiceDisclaimer ? 'bg-primary-600' : 'bg-surface-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showInvoiceDisclaimer ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.showInvoiceDisclaimer && (
                <>
                  <div className="bg-surface-800 border border-surface-600 rounded-lg p-3 flex items-start gap-2">
                    <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-xs text-neutral-400">
                      Available variables: <code className="text-primary-400">{'{CompanyName}'}</code>, <code className="text-primary-400">{'{TradingName}'}</code>, <code className="text-primary-400">{'{OrganizationNumber}'}</code>, <code className="text-primary-400">{'{VatNumber}'}</code>, <code className="text-primary-400">{'{StreetAddress}'}</code>, <code className="text-primary-400">{'{PostalCode}'}</code>, <code className="text-primary-400">{'{City}'}</code> — these get replaced at render time with actual values from the Company Identity section.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-neutral-300">Invoice Disclaimer (English)</label>
                      <span className="text-xs text-neutral-500">{(settings.invoiceDisclaimer_en || '').length}/500</span>
                    </div>
                    <textarea
                      value={settings.invoiceDisclaimer_en || ''}
                      onChange={(e) => handleChange('invoiceDisclaimer_en', e.target.value.slice(0, 500) || null)}
                      rows={3}
                      maxLength={500}
                      placeholder="All payments and invoices are issued by {CompanyName} (Org.nr: {OrganizationNumber}, VAT: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} is a trading name of {CompanyName}."
                      className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm resize-y"
                    />
                    {(settings.invoiceDisclaimer_en || settings.companyName) && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mt-2 border border-slate-200 dark:border-slate-800">
                        <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium block mb-1">Preview</span>
                        {(settings.invoiceDisclaimer_en || 'All payments and invoices are issued by {CompanyName} (Org.nr: {OrganizationNumber}, VAT: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} is a trading name of {CompanyName}.')
                          .replace(/\{CompanyName\}/g, settings.companyName || '')
                          .replace(/\{TradingName\}/g, settings.tradingName || '')
                          .replace(/\{OrganizationNumber\}/g, settings.orgNumber || '')
                          .replace(/\{VatNumber\}/g, settings.vatNumber || '')
                          .replace(/\{StreetAddress\}/g, settings.streetAddress || '')
                          .replace(/\{PostalCode\}/g, settings.postalCode || '')
                          .replace(/\{City\}/g, settings.city || '')}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-neutral-300">Fakturadisklamering (Svenska)</label>
                      <span className="text-xs text-neutral-500">{(settings.invoiceDisclaimer_sv || '').length}/500</span>
                    </div>
                    <textarea
                      value={settings.invoiceDisclaimer_sv || ''}
                      onChange={(e) => handleChange('invoiceDisclaimer_sv', e.target.value.slice(0, 500) || null)}
                      rows={3}
                      maxLength={500}
                      placeholder="Alla betalningar och fakturor utfärdas av {CompanyName} (Org.nr: {OrganizationNumber}, Moms.nr: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} är ett handelsnamn för {CompanyName}."
                      className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm resize-y"
                    />
                    {(settings.invoiceDisclaimer_sv || settings.companyName) && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mt-2 border border-slate-200 dark:border-slate-800">
                        <span className="text-neutral-500 text-[10px] uppercase tracking-wider font-medium block mb-1">Förhandsgranskning</span>
                        {(settings.invoiceDisclaimer_sv || 'Alla betalningar och fakturor utfärdas av {CompanyName} (Org.nr: {OrganizationNumber}, Moms.nr: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} är ett handelsnamn för {CompanyName}.')
                          .replace(/\{CompanyName\}/g, settings.companyName || '')
                          .replace(/\{TradingName\}/g, settings.tradingName || '')
                          .replace(/\{OrganizationNumber\}/g, settings.orgNumber || '')
                          .replace(/\{VatNumber\}/g, settings.vatNumber || '')
                          .replace(/\{StreetAddress\}/g, settings.streetAddress || '')
                          .replace(/\{PostalCode\}/g, settings.postalCode || '')
                          .replace(/\{City\}/g, settings.city || '')}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          <FaSave size={14} />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default LegalSettingsManager;
