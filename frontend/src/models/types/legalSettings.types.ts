export interface CompanyLegalSettings {
  id?: string;

  // Company Identity
  companyName: string;
  tradingName: string | null;
  orgNumber: string;
  vatNumber: string;
  managingDirector: string | null;

  // Contact Info
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phoneNumber: string;

  // Footer Legal Notice
  showFooterLegalEntity: boolean;

  // Checkout Consent
  showCheckoutConsent: boolean;
  checkoutConsentText_en: string | null;
  checkoutConsentText_sv: string | null;

  // Invoice Disclaimer
  showInvoiceDisclaimer: boolean;
  invoiceDisclaimer_en: string | null;
  invoiceDisclaimer_sv: string | null;

  createdAt?: string;
  updatedAt?: string;
}
