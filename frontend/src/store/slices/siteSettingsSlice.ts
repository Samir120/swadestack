import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../models/api/apiClient';

export interface SiteSettings {
  // Site Identity
  siteName_en: string;
  siteName_sv: string;
  tagline_en: string;
  tagline_sv: string;
  logoUrl: string;
  logoFile?: string | null;
  faviconUrl: string;
  faviconFile?: string | null;
  
  // SEO
  metaTitle_en: string;
  metaTitle_sv: string;
  metaDescription_en: string;
  metaDescription_sv: string;
  metaKeywords_en: string;
  metaKeywords_sv: string;
  
  // Contact
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // Social Media
  facebookUrl?: string;
  facebookIcon?: string;
  twitterUrl?: string;
  twitterIcon?: string;
  instagramUrl?: string;
  instagramIcon?: string;
  linkedinUrl?: string;
  linkedinIcon?: string;
  youtubeUrl?: string;
  youtubeIcon?: string;
  githubUrl?: string;
  
  // Footer
  copyrightText_en: string;
  copyrightText_sv: string;
  footerDescription_en: string;
  footerDescription_sv: string;
  
  // Landing Page Content
  heroStatus_en?: string;
  heroStatus_sv?: string;
  heroFallbackText_en?: string;
  heroFallbackText_sv?: string;
  heroButtonPrimary_en?: string;
  heroButtonPrimary_sv?: string;
  heroButtonSecondary_en?: string;
  heroButtonSecondary_sv?: string;
  portfolioTitle_en?: string;
  portfolioTitle_sv?: string;
  portfolioSubtitle_en?: string;
  portfolioSubtitle_sv?: string;
  portfolioEmptyMessage_en?: string;
  portfolioEmptyMessage_sv?: string;
  servicesTitle_en?: string;
  servicesTitle_sv?: string;
  servicesSubtitle_en?: string;
  servicesSubtitle_sv?: string;
  servicesEmptyMessage_en?: string;
  servicesEmptyMessage_sv?: string;
  contactTitle_en?: string;
  contactTitle_sv?: string;
  contactSubtitle_en?: string;
  contactSubtitle_sv?: string;
  contactEmailLabel_en?: string;
  contactEmailLabel_sv?: string;
  contactPhoneLabel_en?: string;
  contactPhoneLabel_sv?: string;
  
  // Feature Section
  featureSectionTitle_en?: string;
  featureSectionTitle_sv?: string;
  featureSectionSubtitle_en?: string;
  featureSectionSubtitle_sv?: string;
  featureSectionImageFile?: string | null;
  featureSectionMobileImageFile?: string | null;

  // Analytics
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleAdSenseId?: string;
  googleAdSenseScript?: string;
  
  // Payment Gateways
  stripePublicKey?: string;
  klarnaApiKey?: string;
  paypalClientId?: string;
  
  // Ad Banners
  enableAdBanners?: boolean;
  headerAdBannerCode?: string;
  sidebarAdBannerCode?: string;
  footerAdBannerCode?: string;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage_en?: string;
  maintenanceMessage_sv?: string;

  // Gaming PC Section
  gamingPcSectionVisible?: boolean;
  gamingPcBadge_en?: string;
  gamingPcBadge_sv?: string;
  gamingPcTitle_en?: string;
  gamingPcTitle_sv?: string;
  gamingPcTagline_en?: string;
  gamingPcTagline_sv?: string;
  gamingPcDescription_en?: string;
  gamingPcDescription_sv?: string;
  gamingPcButtonPrimary_en?: string;
  gamingPcButtonPrimary_sv?: string;
  gamingPcButtonSecondary_en?: string;
  gamingPcButtonSecondary_sv?: string;
  gamingPcShowWarranty?: boolean;
  gamingPcWarrantyYears?: number;
  gamingPcWarrantyLabel_en?: string;
  gamingPcWarrantyLabel_sv?: string;
  // Circle Badge 2
  gamingPcShowCircleBadge2?: boolean;
  gamingPcCircleBadge2Value?: number | null;
  gamingPcCircleBadge2Label_en?: string | null;
  gamingPcCircleBadge2Label_sv?: string | null;
  // Circle Badge 3
  gamingPcShowCircleBadge3?: boolean;
  gamingPcCircleBadge3Value?: number | null;
  gamingPcCircleBadge3Label_en?: string | null;
  gamingPcCircleBadge3Label_sv?: string | null;
  gamingPcSectionTitle_en?: string;
  gamingPcSectionTitle_sv?: string;
  gamingPcViewAllButton_en?: string;
  gamingPcViewAllButton_sv?: string;
  gamingPcEmptyMessage_en?: string;
  gamingPcEmptyMessage_sv?: string;

  // Cookie Consent
  cookieConsentEnabled?: boolean;
  cookieConsentTitle_en?: string;
  cookieConsentTitle_sv?: string;
  cookieConsentDescription_en?: string;
  cookieConsentDescription_sv?: string;
  cookieConsentAcceptButton_en?: string;
  cookieConsentAcceptButton_sv?: string;
  cookieConsentReadMoreType?: string;
  cookieConsentReadMoreInternal?: string | null;
  cookieConsentReadMoreExternal?: string | null;
  cookieConsentExpiryDays?: number;
}

interface SiteSettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SiteSettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

// Async thunk to fetch public site settings
export const fetchPublicSettings = createAsyncThunk(
  'siteSettings/fetchPublic',
  async () => {
    const response = await apiClient.get<any>('/settings/public');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch settings');
    }
    return response.data as SiteSettings;
  }
);

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState,
  reducers: {
    // Manual update (for admin panel)
    updateSettings: (state, action: PayloadAction<SiteSettings>) => {
      state.settings = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load settings';
      });
  },
});

export const { updateSettings, clearError } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
