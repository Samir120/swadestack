import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import apiClient from '../../models/api/apiClient';
import FileUpload from '../common/FileUpload';
import { PasswordInput } from '../common/PasswordInput';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaCog,
  FaFileAlt,
  FaSearch,
  FaPhone,
  FaShareAlt,
  FaBolt,
  FaSave,
  FaCheck,
  FaHome,
  FaBriefcase,
  FaLightbulb,
  FaEnvelope,
  FaChartBar,
  FaMoneyBillWave,
  FaCreditCard,
  FaBullhorn,
  FaTools,
  FaToggleOn,
  FaToggleOff,
  FaDesktop,
  FaStar,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaInfoCircle,
} from 'react-icons/fa';

interface SiteSettingsData {
  // Site Identity
  siteName_en: string;
  siteName_sv: string;
  tagline_en: string;
  tagline_sv: string;
  logoUrl: string;
  logoFile: string | null;
  faviconUrl: string;
  faviconFile: string | null;

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
  facebookUrl: string;
  facebookIcon: string;
  twitterUrl: string;
  twitterIcon: string;
  instagramUrl: string;
  instagramIcon: string;
  linkedinUrl: string;
  linkedinIcon: string;
  youtubeUrl: string;
  youtubeIcon: string;
  githubUrl: string;

  // Footer
  copyrightText_en: string;
  copyrightText_sv: string;
  footerDescription_en: string;
  footerDescription_sv: string;

  // Landing Page Content
  heroStatus_en: string;
  heroStatus_sv: string;
  heroFallbackText_en: string;
  heroFallbackText_sv: string;
  heroButtonPrimary_en: string;
  heroButtonPrimary_sv: string;
  heroButtonSecondary_en: string;
  heroButtonSecondary_sv: string;
  portfolioTitle_en: string;
  portfolioTitle_sv: string;
  portfolioSubtitle_en: string;
  portfolioSubtitle_sv: string;
  portfolioEmptyMessage_en: string;
  portfolioEmptyMessage_sv: string;
  servicesTitle_en: string;
  servicesTitle_sv: string;
  servicesSubtitle_en: string;
  servicesSubtitle_sv: string;
  servicesEmptyMessage_en: string;
  servicesEmptyMessage_sv: string;
  contactTitle_en: string;
  contactTitle_sv: string;
  contactSubtitle_en: string;
  contactSubtitle_sv: string;
  contactEmailLabel_en: string;
  contactEmailLabel_sv: string;
  contactPhoneLabel_en: string;
  contactPhoneLabel_sv: string;

  // Feature Section
  featureSectionTitle_en: string;
  featureSectionTitle_sv: string;
  featureSectionSubtitle_en: string;
  featureSectionSubtitle_sv: string;
  featureSectionImageFile: string | null;

  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleAdSenseId: string;
  googleAdSenseScript: string;

  // Payment Gateways
  stripePublicKey: string;
  stripeSecretKey: string;
  klarnaApiKey: string;
  klarnaApiSecret: string;
  paypalClientId: string;
  paypalClientSecret: string;

  // Ad Banners
  enableAdBanners: boolean;
  headerAdBannerCode: string;
  sidebarAdBannerCode: string;
  footerAdBannerCode: string;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage_en: string;
  maintenanceMessage_sv: string;

  // Gaming PC Section
  gamingPcSectionVisible: boolean;
  gamingPcBadge_en: string;
  gamingPcBadge_sv: string;
  gamingPcTitle_en: string;
  gamingPcTitle_sv: string;
  gamingPcTagline_en: string;
  gamingPcTagline_sv: string;
  gamingPcDescription_en: string;
  gamingPcDescription_sv: string;
  gamingPcButtonPrimary_en: string;
  gamingPcButtonPrimary_sv: string;
  gamingPcButtonSecondary_en: string;
  gamingPcButtonSecondary_sv: string;
  gamingPcShowWarranty: boolean;
  gamingPcWarrantyYears: number;
  gamingPcWarrantyLabel_en: string;
  gamingPcWarrantyLabel_sv: string;
  // Circle Badge 2
  gamingPcShowCircleBadge2: boolean;
  gamingPcCircleBadge2Value: number | null;
  gamingPcCircleBadge2Label_en: string | null;
  gamingPcCircleBadge2Label_sv: string | null;
  // Circle Badge 3
  gamingPcShowCircleBadge3: boolean;
  gamingPcCircleBadge3Value: number | null;
  gamingPcCircleBadge3Label_en: string | null;
  gamingPcCircleBadge3Label_sv: string | null;
  gamingPcSectionTitle_en: string;
  gamingPcSectionTitle_sv: string;
  gamingPcViewAllButton_en: string;
  gamingPcViewAllButton_sv: string;
  gamingPcEmptyMessage_en: string;
  gamingPcEmptyMessage_sv: string;

  // Cookie Consent
  cookieConsentEnabled: boolean;
  cookieConsentTitle_en: string;
  cookieConsentTitle_sv: string;
  cookieConsentDescription_en: string;
  cookieConsentDescription_sv: string;
  cookieConsentAcceptButton_en: string;
  cookieConsentAcceptButton_sv: string;
  cookieConsentReadMoreType: string;
  cookieConsentReadMoreInternal: string;
  cookieConsentReadMoreExternal: string;
  cookieConsentExpiryDays: number;
}

const SiteSettingsManager: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'contact' | 'social' | 'advanced' | 'content' | 'gamingpc' | 'cookies'>('general');
  const [footerPages, setFooterPages] = useState<{ url: string; title_en: string; title_sv: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [featureImagePreview, setFeatureImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadFooterPages();
  }, []);

  const loadFooterPages = async () => {
    try {
      const response = await apiClient.get<any>('/footer/pages');
      if (response.success && response.data) {
        setFooterPages(response.data);
      }
    } catch (error) {
      // Non-critical - footer page selector will just be empty
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/settings');
      if (response.success && response.data) {
        setSettings(response.data);
        setLogoPreview(response.data.logoUrl || response.data.logoFile);
        setFaviconPreview(response.data.faviconUrl || response.data.faviconFile);
        setFeatureImagePreview(response.data.featureSectionImageFile || null);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setSuccessMessage('');
    try {
      const response = await apiClient.put('/settings', settings);
      if (response.success) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const response = await apiClient.post('/settings/maintenance/toggle', {});
      if (response.success && response.data) {
        setSettings(response.data as SiteSettingsData);
      }
    } catch (error) {
      console.error('Failed to toggle maintenance:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file is too large. Maximum size is 2MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    // Upload file to backend via FormData
    const formData = new FormData();
    formData.append('logoFile', file);

    try {
      const response = await apiClient.post<any>('/settings/logo', formData);
      if (response.success && response.data) {
        const uploadedPath = response.data.logoFile || response.data.logoUrl;
        setLogoPreview(uploadedPath);
        if (settings) {
          setSettings({
            ...settings,
            logoFile: uploadedPath,
            logoUrl: uploadedPath,
          });
        }
        toast.success('Logo uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error('Failed to upload logo. Please try again.');
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB for favicon)
    if (file.size > 500 * 1024) {
      toast.error('Favicon file is too large. Maximum size is 500KB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    // Upload file to backend via FormData
    const formData = new FormData();
    formData.append('faviconFile', file);

    try {
      const response = await apiClient.post<any>('/settings/favicon', formData);
      if (response.success && response.data) {
        const uploadedPath = response.data.faviconFile || response.data.faviconUrl;
        setFaviconPreview(uploadedPath);
        if (settings) {
          setSettings({
            ...settings,
            faviconFile: uploadedPath,
            faviconUrl: uploadedPath,
          });
        }
        toast.success('Favicon uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      toast.error('Failed to upload favicon. Please try again.');
    }
  };

  const handleFeatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file is too large. Maximum size is 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('featureImageFile', file);

    try {
      const response = await apiClient.post<any>('/settings/feature-image', formData);
      if (response.success && response.data) {
        const uploadedPath = response.data.featureSectionImageFile;
        setFeatureImagePreview(uploadedPath);
        if (settings) {
          setSettings({
            ...settings,
            featureSectionImageFile: uploadedPath,
          });
        }
        toast.success('Feature section image uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload feature image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleRemoveFeatureImage = () => {
    setFeatureImagePreview(null);
    if (settings) {
      setSettings({ ...settings, featureSectionImageFile: null });
    }
  };

  const updateField = (field: keyof SiteSettingsData, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', shortName: 'General', icon: FaCog },
    { id: 'content', name: 'Landing Page', shortName: 'Content', icon: FaFileAlt },
    { id: 'gamingpc', name: 'Gaming PCs', shortName: 'PCs', icon: FaDesktop },
    { id: 'seo', name: 'SEO', shortName: 'SEO', icon: FaSearch },
    { id: 'contact', name: 'Contact', shortName: 'Contact', icon: FaPhone },
    { id: 'social', name: 'Social Media', shortName: 'Social', icon: FaShareAlt },
    { id: 'cookies', name: 'Cookie Consent', shortName: 'Cookies', icon: FaShieldAlt },
    { id: 'advanced', name: 'Advanced', shortName: 'Advanced', icon: FaBolt },
  ];

  return (
    <div className="pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Site Settings</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Configuration</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {successMessage && (
            <div className="px-3 py-1.5 bg-green-900/30 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <FaCheck size={12} />
              {successMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition"
          >
            <FaSave size={14} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Mobile Success Message */}
      {successMessage && (
        <div className="sm:hidden mb-4 px-3 py-2 bg-green-900/30 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2">
          <FaCheck size={12} />
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-surface-850 rounded-xl shadow-sm border border-surface-700 mb-4 sm:mb-6">
        <div className="border-b border-surface-700 overflow-x-auto scrollbar-hide">
          <nav className="flex sm:space-x-4 px-2 sm:px-6 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition active:scale-[0.98] ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-surface-600'
                  }`}
                >
                  <Icon className="text-sm sm:text-base" />
                  <span className="sm:hidden">{tab.shortName}</span>
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-3 sm:p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Site Identity</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Site Name (English)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName_en}
                    onChange={(e) => updateField('siteName_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Site Name (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName_sv}
                    onChange={(e) => updateField('siteName_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline_en}
                    onChange={(e) => updateField('tagline_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Tagline (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline_sv}
                    onChange={(e) => updateField('tagline_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Logo
                  </label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Upload Logo File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full px-3 py-2 border border-surface-600 rounded-lg text-xs sm:text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary-600/10 file:text-primary-400"
                      />
                    </div>
                    {/* URL Input */}
                    <div>
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Or Enter Logo URL</label>
                      <input
                        type="text"
                        value={settings.logoUrl}
                        onChange={(e) => {
                          updateField('logoUrl', e.target.value);
                          setLogoPreview(e.target.value);
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 border border-surface-600 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    {/* Preview */}
                    {logoPreview && (
                      <div className="mt-2">
                        <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Preview</label>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-12 sm:h-16 object-contain border border-surface-700 rounded p-2 bg-surface-850"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Favicon
                  </label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Upload Favicon File</label>
                      <input
                        type="file"
                        accept="image/*,.ico"
                        onChange={handleFaviconUpload}
                        className="w-full px-3 py-2 border border-surface-600 rounded-lg text-xs sm:text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary-600/10 file:text-primary-400"
                      />
                    </div>
                    {/* URL Input */}
                    <div>
                      <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Or Enter Favicon URL</label>
                      <input
                        type="text"
                        value={settings.faviconUrl}
                        onChange={(e) => {
                          updateField('faviconUrl', e.target.value);
                          setFaviconPreview(e.target.value);
                        }}
                        placeholder="https://example.com/favicon.ico"
                        className="w-full px-3 py-2 border border-surface-600 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    {/* Preview */}
                    {faviconPreview && (
                      <div className="mt-2">
                        <label className="block text-[10px] sm:text-xs text-neutral-400 mb-1">Preview</label>
                        <img
                          src={faviconPreview}
                          alt="Favicon preview"
                          className="h-8 w-8 object-contain border border-surface-700 rounded p-1 bg-surface-850"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Landing Page Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Landing Page Content</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-4 sm:mb-6">
                  Customize all text content on your landing page. All fields support both English and Swedish.
                </p>
              </div>

              {/* Hero Section */}
              <div className="bg-gradient-to-r from-primary-600/10 to-primary-500/5 p-4 sm:p-6 rounded-xl border border-primary-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center mr-2">
                    <FaHome className="text-primary-400 text-sm" />
                  </div>
                  Hero Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Status Badge (English)
                      </label>
                      <input
                        type="text"
                        value={settings.heroStatus_en || ''}
                        onChange={(e) => updateField('heroStatus_en', e.target.value)}
                        placeholder="Available for new projects"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Status Badge (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.heroStatus_sv || ''}
                        onChange={(e) => updateField('heroStatus_sv', e.target.value)}
                        placeholder="Tillgängliga för nya projekt"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Title Fallback (EN)
                      </label>
                      <input
                        type="text"
                        value={settings.heroFallbackText_en || ''}
                        onChange={(e) => updateField('heroFallbackText_en', e.target.value)}
                        placeholder="Agency"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Used when site name is one word</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Title Fallback (SV)
                      </label>
                      <input
                        type="text"
                        value={settings.heroFallbackText_sv || ''}
                        onChange={(e) => updateField('heroFallbackText_sv', e.target.value)}
                        placeholder="Byrå"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Används när webbplatsnamnet är ett ord</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Primary Button (English)
                      </label>
                      <input
                        type="text"
                        value={settings.heroButtonPrimary_en || ''}
                        onChange={(e) => updateField('heroButtonPrimary_en', e.target.value)}
                        placeholder="View Our Work"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Primary Button (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.heroButtonPrimary_sv || ''}
                        onChange={(e) => updateField('heroButtonPrimary_sv', e.target.value)}
                        placeholder="Se Vårt Arbete"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Secondary Button (English)
                      </label>
                      <input
                        type="text"
                        value={settings.heroButtonSecondary_en || ''}
                        onChange={(e) => updateField('heroButtonSecondary_en', e.target.value)}
                        placeholder="Contact Us"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Secondary Button (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.heroButtonSecondary_sv || ''}
                        onChange={(e) => updateField('heroButtonSecondary_sv', e.target.value)}
                        placeholder="Kontakta Oss"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="bg-blue-900/20 p-4 sm:p-6 rounded-xl border border-blue-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaBriefcase className="text-blue-400 text-sm" />
                  </div>
                  Portfolio Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (English)
                      </label>
                      <input
                        type="text"
                        value={settings.portfolioTitle_en || ''}
                        onChange={(e) => updateField('portfolioTitle_en', e.target.value)}
                        placeholder="Selected Work"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.portfolioTitle_sv || ''}
                        onChange={(e) => updateField('portfolioTitle_sv', e.target.value)}
                        placeholder="Utvalda Projekt"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (English)
                      </label>
                      <textarea
                        value={settings.portfolioSubtitle_en || ''}
                        onChange={(e) => updateField('portfolioSubtitle_en', e.target.value)}
                        placeholder="We build digital products that help brands grow."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (Swedish)
                      </label>
                      <textarea
                        value={settings.portfolioSubtitle_sv || ''}
                        onChange={(e) => updateField('portfolioSubtitle_sv', e.target.value)}
                        placeholder="Vi bygger digitala produkter som hjälper varumärken att växa."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (English)
                      </label>
                      <input
                        type="text"
                        value={settings.portfolioEmptyMessage_en || ''}
                        onChange={(e) => updateField('portfolioEmptyMessage_en', e.target.value)}
                        placeholder="Projects coming soon"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.portfolioEmptyMessage_sv || ''}
                        onChange={(e) => updateField('portfolioEmptyMessage_sv', e.target.value)}
                        placeholder="Projekt kommer snart"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-green-900/20 p-4 sm:p-6 rounded-xl border border-green-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaBolt className="text-green-400 text-sm" />
                  </div>
                  Services Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (English)
                      </label>
                      <input
                        type="text"
                        value={settings.servicesTitle_en || ''}
                        onChange={(e) => updateField('servicesTitle_en', e.target.value)}
                        placeholder="Expertise"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.servicesTitle_sv || ''}
                        onChange={(e) => updateField('servicesTitle_sv', e.target.value)}
                        placeholder="Expertis"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (English)
                      </label>
                      <textarea
                        value={settings.servicesSubtitle_en || ''}
                        onChange={(e) => updateField('servicesSubtitle_en', e.target.value)}
                        placeholder="High-end solutions for ambitious companies."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (Swedish)
                      </label>
                      <textarea
                        value={settings.servicesSubtitle_sv || ''}
                        onChange={(e) => updateField('servicesSubtitle_sv', e.target.value)}
                        placeholder="Högklassiga lösningar för ambitiösa företag."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (English)
                      </label>
                      <input
                        type="text"
                        value={settings.servicesEmptyMessage_en || ''}
                        onChange={(e) => updateField('servicesEmptyMessage_en', e.target.value)}
                        placeholder="No services available"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.servicesEmptyMessage_sv || ''}
                        onChange={(e) => updateField('servicesEmptyMessage_sv', e.target.value)}
                        placeholder="Inga tjänster tillgängliga"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-purple-900/20 p-4 sm:p-6 rounded-xl border border-purple-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaEnvelope className="text-purple-400 text-sm" />
                  </div>
                  Contact Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (English)
                      </label>
                      <textarea
                        value={settings.contactTitle_en || ''}
                        onChange={(e) => updateField('contactTitle_en', e.target.value)}
                        placeholder="Let's work together."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (Swedish)
                      </label>
                      <textarea
                        value={settings.contactTitle_sv || ''}
                        onChange={(e) => updateField('contactTitle_sv', e.target.value)}
                        placeholder="Låt oss samarbeta."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (English)
                      </label>
                      <textarea
                        value={settings.contactSubtitle_en || ''}
                        onChange={(e) => updateField('contactSubtitle_en', e.target.value)}
                        placeholder="Ready to start your next project? Drop us a line."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (Swedish)
                      </label>
                      <textarea
                        value={settings.contactSubtitle_sv || ''}
                        onChange={(e) => updateField('contactSubtitle_sv', e.target.value)}
                        placeholder="Redo att starta ditt nästa projekt? Hör av dig till oss."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Email Label (English)
                      </label>
                      <input
                        type="text"
                        value={settings.contactEmailLabel_en || ''}
                        onChange={(e) => updateField('contactEmailLabel_en', e.target.value)}
                        placeholder="Email"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Email Label (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.contactEmailLabel_sv || ''}
                        onChange={(e) => updateField('contactEmailLabel_sv', e.target.value)}
                        placeholder="E-post"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Phone Label (English)
                      </label>
                      <input
                        type="text"
                        value={settings.contactPhoneLabel_en || ''}
                        onChange={(e) => updateField('contactPhoneLabel_en', e.target.value)}
                        placeholder="Phone"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Phone Label (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.contactPhoneLabel_sv || ''}
                        onChange={(e) => updateField('contactPhoneLabel_sv', e.target.value)}
                        placeholder="Telefon"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Section */}
              <div className="bg-violet-900/20 p-4 sm:p-6 rounded-xl border border-violet-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-violet-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaStar className="text-violet-400 text-sm" />
                  </div>
                  Feature Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (English)
                      </label>
                      <input
                        type="text"
                        value={settings.featureSectionTitle_en || ''}
                        onChange={(e) => updateField('featureSectionTitle_en', e.target.value)}
                        placeholder="What We Offer"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.featureSectionTitle_sv || ''}
                        onChange={(e) => updateField('featureSectionTitle_sv', e.target.value)}
                        placeholder="Vad Vi Erbjuder"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (English)
                      </label>
                      <input
                        type="text"
                        value={settings.featureSectionSubtitle_en || ''}
                        onChange={(e) => updateField('featureSectionSubtitle_en', e.target.value)}
                        placeholder="Our Core Capabilities"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Subtitle (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.featureSectionSubtitle_sv || ''}
                        onChange={(e) => updateField('featureSectionSubtitle_sv', e.target.value)}
                        placeholder="Våra Kärnkompetenser"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Monitor Display Image */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">
                      Monitor Display Image
                    </label>
                    <p className="text-[10px] sm:text-xs text-neutral-400 mb-3">
                      This image appears inside the monitor mockup in the feature section. Recommended: 16:10 aspect ratio, min 800px wide. If no image is set, an abstract dashboard is shown.
                    </p>
                    <div className="flex items-start gap-4">
                      {featureImagePreview ? (
                        <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-surface-600 bg-surface-800 flex-shrink-0">
                          <img
                            src={featureImagePreview}
                            alt="Feature section preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={handleRemoveFeatureImage}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-500 transition"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-40 h-24 rounded-lg border-2 border-dashed border-surface-600 bg-surface-800/50 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-neutral-500">No image</span>
                        </div>
                      )}
                      <div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface-700 text-neutral-200 rounded-lg hover:bg-surface-600 cursor-pointer transition text-sm font-bold">
                          <FaFileAlt size={12} />
                          {featureImagePreview ? 'Replace Image' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFeatureImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaLightbulb className="text-blue-400 text-sm" />
                  </div>
                  <div className="text-xs sm:text-sm text-blue-900">
                    <p className="font-bold mb-1">Content Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Keep button text short (2-4 words)</li>
                      <li>Section titles should be concise</li>
                      <li>Both languages display based on user selection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gaming PC Tab */}
          {activeTab === 'gamingpc' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Gaming PC Section</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-4">
                  Customize the Gaming PC banner and carousel section on your home page.
                </p>
              </div>

              {/* Section Visibility Toggle */}
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${settings.gamingPcSectionVisible ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.gamingPcSectionVisible ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      {settings.gamingPcSectionVisible ? (
                        <FaCheck className="text-green-400 text-lg" />
                      ) : (
                        <FaToggleOff className="text-red-600 text-lg" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        Section Visibility
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        {settings.gamingPcSectionVisible
                          ? 'Gaming PC section is visible on the home page'
                          : 'Gaming PC section is hidden from the home page'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('gamingPcSectionVisible', !settings.gamingPcSectionVisible)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                      settings.gamingPcSectionVisible
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {settings.gamingPcSectionVisible ? (
                      <>
                        <FaToggleOn size={20} />
                        Visible
                      </>
                    ) : (
                      <>
                        <FaToggleOff size={20} />
                        Hidden
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Hero Banner Settings */}
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 p-4 sm:p-6 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center mr-2">
                    <FaDesktop className="text-primary-400 text-sm" />
                  </div>
                  Banner Content
                </h4>

                <div className="space-y-4">
                  {/* Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Badge Text (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcBadge_en || ''}
                        onChange={(e) => updateField('gamingPcBadge_en', e.target.value)}
                        placeholder="Gaming PCs"
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Badge Text (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcBadge_sv || ''}
                        onChange={(e) => updateField('gamingPcBadge_sv', e.target.value)}
                        placeholder="Speldatorer"
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Main Title (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcTitle_en || ''}
                        onChange={(e) => updateField('gamingPcTitle_en', e.target.value)}
                        placeholder="Pre-Built Gaming PCs"
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Main Title (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcTitle_sv || ''}
                        onChange={(e) => updateField('gamingPcTitle_sv', e.target.value)}
                        placeholder="Förkonfigurerade Speldatorer"
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Tagline (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcTagline_en || ''}
                        onChange={(e) => updateField('gamingPcTagline_en', e.target.value)}
                        placeholder="No compromise. Pure Power."
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Tagline (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcTagline_sv || ''}
                        onChange={(e) => updateField('gamingPcTagline_sv', e.target.value)}
                        placeholder="Inga kompromisser. Ren kraft."
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Description (English)
                      </label>
                      <textarea
                        value={settings.gamingPcDescription_en || ''}
                        onChange={(e) => updateField('gamingPcDescription_en', e.target.value)}
                        placeholder="Premium components, expertly assembled..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Description (Swedish)
                      </label>
                      <textarea
                        value={settings.gamingPcDescription_sv || ''}
                        onChange={(e) => updateField('gamingPcDescription_sv', e.target.value)}
                        placeholder="Premiumkomponenter, fackmässigt monterade..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-neutral-600 rounded-lg bg-neutral-700 text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="bg-primary-600/10 p-4 sm:p-6 rounded-xl border border-primary-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center mr-2">
                    <FaBolt className="text-primary-400 text-sm" />
                  </div>
                  Call-to-Action Buttons
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Primary Button (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcButtonPrimary_en || ''}
                        onChange={(e) => updateField('gamingPcButtonPrimary_en', e.target.value)}
                        placeholder="Pre-Built PCs"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Links to /pre-configured-pcs</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Primary Button (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcButtonPrimary_sv || ''}
                        onChange={(e) => updateField('gamingPcButtonPrimary_sv', e.target.value)}
                        placeholder="Färdigbyggda datorer"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Secondary Button (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcButtonSecondary_en || ''}
                        onChange={(e) => updateField('gamingPcButtonSecondary_en', e.target.value)}
                        placeholder="Build Your Own"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Links to /pc-builder</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Secondary Button (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcButtonSecondary_sv || ''}
                        onChange={(e) => updateField('gamingPcButtonSecondary_sv', e.target.value)}
                        placeholder="Välj komponenter själv"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Circle Badges */}
              <div className="bg-green-900/20 p-4 sm:p-6 rounded-xl border border-green-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaCheck className="text-green-400 text-sm" />
                  </div>
                  Circle Badges (displayed in banner)
                </h4>

                <div className="space-y-6">
                  {/* Badge 1 - Warranty */}
                  <div className="border border-green-500/30 rounded-lg p-4 bg-surface-850">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-neutral-300 text-sm">Badge 1 (Warranty)</span>
                      <button
                        type="button"
                        onClick={() => updateField('gamingPcShowWarranty', !settings.gamingPcShowWarranty)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          settings.gamingPcShowWarranty
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40'
                            : 'bg-surface-800 text-neutral-400 hover:bg-surface-700'
                        }`}
                      >
                        {settings.gamingPcShowWarranty ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        {settings.gamingPcShowWarranty ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Value (Number)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={settings.gamingPcWarrantyYears || 3}
                          onChange={(e) => updateField('gamingPcWarrantyYears', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (English)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcWarrantyLabel_en || ''}
                          onChange={(e) => updateField('gamingPcWarrantyLabel_en', e.target.value)}
                          placeholder="Year Warranty"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (Swedish)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcWarrantyLabel_sv || ''}
                          onChange={(e) => updateField('gamingPcWarrantyLabel_sv', e.target.value)}
                          placeholder="Års Garanti"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className="border border-green-500/30 rounded-lg p-4 bg-surface-850">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-neutral-300 text-sm">Badge 2</span>
                      <button
                        type="button"
                        onClick={() => updateField('gamingPcShowCircleBadge2', !settings.gamingPcShowCircleBadge2)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          settings.gamingPcShowCircleBadge2
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40'
                            : 'bg-surface-800 text-neutral-400 hover:bg-surface-700'
                        }`}
                      >
                        {settings.gamingPcShowCircleBadge2 ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        {settings.gamingPcShowCircleBadge2 ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Value (Number)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={settings.gamingPcCircleBadge2Value || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge2Value', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="e.g. 24"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (English)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcCircleBadge2Label_en || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge2Label_en', e.target.value)}
                          placeholder="Hour Support"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (Swedish)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcCircleBadge2Label_sv || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge2Label_sv', e.target.value)}
                          placeholder="Timmars Support"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge 3 */}
                  <div className="border border-green-500/30 rounded-lg p-4 bg-surface-850">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-neutral-300 text-sm">Badge 3</span>
                      <button
                        type="button"
                        onClick={() => updateField('gamingPcShowCircleBadge3', !settings.gamingPcShowCircleBadge3)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          settings.gamingPcShowCircleBadge3
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40'
                            : 'bg-surface-800 text-neutral-400 hover:bg-surface-700'
                        }`}
                      >
                        {settings.gamingPcShowCircleBadge3 ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                        {settings.gamingPcShowCircleBadge3 ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Value (Number)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={settings.gamingPcCircleBadge3Value || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge3Value', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="e.g. 100"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (English)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcCircleBadge3Label_en || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge3Label_en', e.target.value)}
                          placeholder="% Satisfaction"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Label (Swedish)
                        </label>
                        <input
                          type="text"
                          value={settings.gamingPcCircleBadge3Label_sv || ''}
                          onChange={(e) => updateField('gamingPcCircleBadge3Label_sv', e.target.value)}
                          placeholder="% Nöjdhet"
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Section */}
              <div className="bg-blue-900/20 p-4 sm:p-6 rounded-xl border border-blue-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaBriefcase className="text-blue-400 text-sm" />
                  </div>
                  Carousel Section
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcSectionTitle_en || ''}
                        onChange={(e) => updateField('gamingPcSectionTitle_en', e.target.value)}
                        placeholder="Popular Pre-Built Models"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Section Title (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcSectionTitle_sv || ''}
                        onChange={(e) => updateField('gamingPcSectionTitle_sv', e.target.value)}
                        placeholder="Populära förkonfigurerade modeller"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        View All Button (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcViewAllButton_en || ''}
                        onChange={(e) => updateField('gamingPcViewAllButton_en', e.target.value)}
                        placeholder="See all pre-built models"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        View All Button (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcViewAllButton_sv || ''}
                        onChange={(e) => updateField('gamingPcViewAllButton_sv', e.target.value)}
                        placeholder="Se alla färdigbyggda modeller"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (English)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcEmptyMessage_en || ''}
                        onChange={(e) => updateField('gamingPcEmptyMessage_en', e.target.value)}
                        placeholder="No pre-built PCs available"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Empty Message (Swedish)
                      </label>
                      <input
                        type="text"
                        value={settings.gamingPcEmptyMessage_sv || ''}
                        onChange={(e) => updateField('gamingPcEmptyMessage_sv', e.target.value)}
                        placeholder="Inga färdigbyggda datorer tillgängliga"
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaLightbulb className="text-purple-400 text-sm" />
                  </div>
                  <div className="text-xs sm:text-sm text-purple-900">
                    <p className="font-bold mb-1">Gaming PC Section Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-purple-800">
                      <li>The banner appears on the home page after the Services section</li>
                      <li>Featured PCs are managed in the "Pre-Configured PCs" admin section</li>
                      <li>Keep the tagline short and impactful</li>
                      <li>Warranty badge displays on desktop only</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Search Engine Optimization</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Title (English)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle_en}
                    onChange={(e) => updateField('metaTitle_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    maxLength={60}
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    {settings.metaTitle_en.length}/60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Title (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle_sv}
                    onChange={(e) => updateField('metaTitle_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    maxLength={60}
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    {settings.metaTitle_sv.length}/60 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription_en}
                    onChange={(e) => updateField('metaDescription_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    {settings.metaDescription_en.length}/160 characters
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Description (Swedish)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription_sv}
                    onChange={(e) => updateField('metaDescription_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    {settings.metaDescription_sv.length}/160 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Keywords (English)
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords_en}
                    onChange={(e) => updateField('metaKeywords_en', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Meta Keywords (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords_sv}
                    onChange={(e) => updateField('metaKeywords_sv', e.target.value)}
                    placeholder="nyckelord1, nyckelord2, nyckelord3"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Contact Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={settings.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={settings.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Footer Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription_en}
                    onChange={(e) => updateField('footerDescription_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Footer Description (Swedish)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription_sv}
                    onChange={(e) => updateField('footerDescription_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Copyright Text (English)
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText_en}
                    onChange={(e) => updateField('copyrightText_en', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Copyright Text (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText_sv}
                    onChange={(e) => updateField('copyrightText_sv', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Social Media Links & Icons</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-4 sm:mb-6">
                  For each platform, provide a URL and optionally upload a custom icon.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {[
                  { urlField: 'facebookUrl', iconField: 'facebookIcon', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                  { urlField: 'twitterUrl', iconField: 'twitterIcon', label: 'Twitter / X', placeholder: 'https://twitter.com/yourpage' },
                  { urlField: 'instagramUrl', iconField: 'instagramIcon', label: 'Instagram', placeholder: 'https://instagram.com/yourpage' },
                  { urlField: 'linkedinUrl', iconField: 'linkedinIcon', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
                  { urlField: 'youtubeUrl', iconField: 'youtubeIcon', label: 'YouTube', placeholder: 'https://youtube.com/c/yourchannel' },
                  { urlField: 'githubUrl', iconField: 'githubIcon', label: 'GitHub', placeholder: 'https://github.com/yourorg' },
                ].map((social) => (
                  <div key={social.urlField} className="border border-surface-700 rounded-xl p-4 bg-surface-800">
                    <h4 className="font-bold text-white mb-3 text-sm sm:text-base">
                      {social.label}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* URL Field */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Profile URL
                        </label>
                        <input
                          type="url"
                          value={(settings as any)[social.urlField] || ''}
                          onChange={(e) => updateField(social.urlField as any, e.target.value)}
                          placeholder={social.placeholder}
                          className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                        />
                        <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                          Required to show this social link
                        </p>
                      </div>

                      {/* Icon Upload */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                          Custom Icon (Optional)
                        </label>
                        <FileUpload
                          label=""
                          accept="image/*"
                          maxSize={0.5}
                          onFileSelect={(base64) => updateField(social.iconField as any, base64)}
                          currentUrl={(settings as any)[social.iconField]}
                          preview={true}
                          previewClassName="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                        />
                        <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                          48x48px recommended, max 500KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaLightbulb className="text-blue-400 text-sm" />
                  </div>
                  <div className="text-xs sm:text-sm text-blue-900">
                    <p className="font-bold mb-1">Icon Display Priority:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Custom icons take priority if uploaded</li>
                      <li>Default icons shown when no custom icon</li>
                      <li>URL determines which links appear</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {/* Cookie Consent Tab */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Cookie Consent</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-4">
                  Configure the GDPR cookie consent banner shown to visitors.
                </p>
              </div>

              {/* Enable/Disable Toggle */}
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${settings.cookieConsentEnabled ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.cookieConsentEnabled ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                      {settings.cookieConsentEnabled ? (
                        <FaCheck className="text-green-400 text-lg" />
                      ) : (
                        <FaToggleOff className="text-red-600 text-lg" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">
                        Cookie Consent Banner
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-400">
                        {settings.cookieConsentEnabled
                          ? 'Banner is shown to visitors until they accept'
                          : 'Cookie consent banner is disabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('cookieConsentEnabled', !settings.cookieConsentEnabled)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
                      settings.cookieConsentEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {settings.cookieConsentEnabled ? (
                      <>
                        <FaToggleOn size={20} />
                        Enabled
                      </>
                    ) : (
                      <>
                        <FaToggleOff size={20} />
                        Disabled
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Banner Content */}
              <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 p-4 sm:p-6 rounded-xl border border-neutral-700">
                <h4 className="font-bold text-white mb-4 flex items-center text-sm sm:text-lg">
                  <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center mr-2">
                    <FaShieldAlt className="text-primary-400 text-sm" />
                  </div>
                  Banner Content
                </h4>

                {/* Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={settings.cookieConsentTitle_en || ''}
                      onChange={(e) => updateField('cookieConsentTitle_en', e.target.value)}
                      placeholder="We use cookies"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Title (Swedish)
                    </label>
                    <input
                      type="text"
                      value={settings.cookieConsentTitle_sv || ''}
                      onChange={(e) => updateField('cookieConsentTitle_sv', e.target.value)}
                      placeholder="Vi använder cookies"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.cookieConsentDescription_en || ''}
                      onChange={(e) => updateField('cookieConsentDescription_en', e.target.value)}
                      placeholder="This website uses cookies..."
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Description (Swedish)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.cookieConsentDescription_sv || ''}
                      onChange={(e) => updateField('cookieConsentDescription_sv', e.target.value)}
                      placeholder="Denna webbplats använder cookies..."
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Accept Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Accept Button (English)
                    </label>
                    <input
                      type="text"
                      value={settings.cookieConsentAcceptButton_en || ''}
                      onChange={(e) => updateField('cookieConsentAcceptButton_en', e.target.value)}
                      placeholder="I accept"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Accept Button (Swedish)
                    </label>
                    <input
                      type="text"
                      value={settings.cookieConsentAcceptButton_sv || ''}
                      onChange={(e) => updateField('cookieConsentAcceptButton_sv', e.target.value)}
                      placeholder="Jag accepterar"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Read More Link */}
              <div className="bg-blue-900/20 p-4 sm:p-6 rounded-xl border border-blue-500/30 space-y-4">
                <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaExternalLinkAlt className="text-blue-400 text-sm" />
                  </div>
                  Read More Link
                </h4>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Add a "Read more" link to your cookie or privacy policy page.
                </p>

                {/* Link Type Toggle */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cookieReadMoreType"
                      checked={settings.cookieConsentReadMoreType === 'internal'}
                      onChange={() => updateField('cookieConsentReadMoreType', 'internal')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-300">Footer Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cookieReadMoreType"
                      checked={settings.cookieConsentReadMoreType === 'external'}
                      onChange={() => updateField('cookieConsentReadMoreType', 'external')}
                      className="text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-300">External URL</span>
                  </label>
                </div>

                {settings.cookieConsentReadMoreType === 'internal' ? (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Footer Page
                    </label>
                    <select
                      value={settings.cookieConsentReadMoreInternal || ''}
                      onChange={(e) => updateField('cookieConsentReadMoreInternal', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    >
                      <option value="">-- Select a page --</option>
                      {footerPages.map((page) => (
                        <option key={page.url} value={page.url}>
                          {page.title_en} ({page.url})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                      Select a footer page to link to as your cookie/privacy policy
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      External URL
                    </label>
                    <input
                      type="url"
                      value={settings.cookieConsentReadMoreExternal || ''}
                      onChange={(e) => updateField('cookieConsentReadMoreExternal', e.target.value)}
                      placeholder="https://example.com/cookie-policy"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                    <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                      Full URL to your external cookie/privacy policy
                    </p>
                  </div>
                )}
              </div>

              {/* Consent Settings */}
              <div className="bg-purple-900/20 p-4 sm:p-6 rounded-xl border border-purple-500/30 space-y-4">
                <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                  <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaCog className="text-purple-400 text-sm" />
                  </div>
                  Consent Settings
                </h4>
                <div className="max-w-xs">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Consent Expiry (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={730}
                    value={settings.cookieConsentExpiryDays || 365}
                    onChange={(e) => updateField('cookieConsentExpiryDays', Math.min(730, Math.max(1, parseInt(e.target.value) || 365)))}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    How long the consent is valid before asking again (1-730 days)
                  </p>
                </div>
              </div>

              {/* GDPR Info */}
              <div className="bg-amber-900/20 p-4 sm:p-6 rounded-xl border border-amber-500/30">
                <div className="flex gap-3">
                  <FaInfoCircle className="text-amber-400 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm mb-1">GDPR Compliance Note</h4>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Under GDPR, you must obtain explicit consent before setting non-essential cookies.
                      When enabled, this banner blocks site interaction until the user explicitly accepts.
                      No non-essential cookies are set before consent is given.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Advanced Settings</h3>

              {/* Analytics & Tracking */}
              <div className="bg-blue-900/20 p-4 sm:p-6 rounded-xl border border-blue-500/30 space-y-4">
                <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaChartBar className="text-blue-400 text-sm" />
                  </div>
                  Analytics & Tracking
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId || ''}
                      onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                    <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                      GA4 or Universal Analytics ID
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={settings.facebookPixelId || ''}
                      onChange={(e) => updateField('facebookPixelId', e.target.value)}
                      placeholder="XXXXXXXXXXXXXXX"
                      className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Google AdSense */}
              <div className="bg-green-900/20 p-4 sm:p-6 rounded-xl border border-green-500/30 space-y-4">
                <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                  <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaMoneyBillWave className="text-green-400 text-sm" />
                  </div>
                  Google AdSense
                </h4>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    AdSense Publisher ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleAdSenseId || ''}
                    onChange={(e) => updateField('googleAdSenseId', e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    AdSense Script Code
                  </label>
                  <textarea
                    rows={3}
                    value={settings.googleAdSenseScript || ''}
                    onChange={(e) => updateField('googleAdSenseScript', e.target.value)}
                    placeholder='<script async src="https://pagead2.googlesyndication.com/..."></script>'
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg font-mono bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Payment Gateways */}
              <div className="bg-purple-900/20 p-4 sm:p-6 rounded-xl border border-purple-500/30 space-y-4 sm:space-y-6">
                <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                  <div className="w-8 h-8 bg-purple-900/30 rounded-lg flex items-center justify-center mr-2">
                    <FaCreditCard className="text-purple-400 text-sm" />
                  </div>
                  Payment Gateways
                </h4>

                {/* Stripe */}
                <div className="bg-surface-850 p-3 sm:p-4 rounded-lg border border-purple-500/30">
                  <h5 className="font-bold text-neutral-200 mb-3 text-xs sm:text-sm">Stripe</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Publishable Key
                      </label>
                      <input
                        type="text"
                        value={settings.stripePublicKey || ''}
                        onChange={(e) => updateField('stripePublicKey', e.target.value)}
                        placeholder="pk_live_xxxxx"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Secret Key 🔒
                      </label>
                      <PasswordInput
                        value={settings.stripeSecretKey || ''}
                        onChange={(e) => updateField('stripeSecretKey', e.target.value)}
                        placeholder="sk_live_xxxxx"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Klarna */}
                <div className="bg-surface-850 p-3 sm:p-4 rounded-lg border border-purple-500/30">
                  <h5 className="font-bold text-neutral-200 mb-3 text-xs sm:text-sm">Klarna</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        API Key
                      </label>
                      <input
                        type="text"
                        value={settings.klarnaApiKey || ''}
                        onChange={(e) => updateField('klarnaApiKey', e.target.value)}
                        placeholder="Klarna API Key"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        API Secret 🔒
                      </label>
                      <PasswordInput
                        value={settings.klarnaApiSecret || ''}
                        onChange={(e) => updateField('klarnaApiSecret', e.target.value)}
                        placeholder="Klarna API Secret"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* PayPal */}
                <div className="bg-surface-850 p-3 sm:p-4 rounded-lg border border-purple-500/30">
                  <h5 className="font-bold text-neutral-200 mb-3 text-xs sm:text-sm">PayPal</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={settings.paypalClientId || ''}
                        onChange={(e) => updateField('paypalClientId', e.target.value)}
                        placeholder="PayPal Client ID"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Client Secret 🔒
                      </label>
                      <PasswordInput
                        value={settings.paypalClientSecret || ''}
                        onChange={(e) => updateField('paypalClientSecret', e.target.value)}
                        placeholder="PayPal Client Secret"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ad Banners */}
              <div className="bg-orange-900/20 p-4 sm:p-6 rounded-xl border border-orange-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                    <div className="w-8 h-8 bg-orange-900/30 rounded-lg flex items-center justify-center mr-2">
                      <FaBullhorn className="text-orange-400 text-sm" />
                    </div>
                    Ad Banner Management
                  </h4>
                  <label className="flex items-center">
                    <button
                      type="button"
                      onClick={() => updateField('enableAdBanners', !settings.enableAdBanners)}
                      className={`p-1 rounded-lg transition ${settings.enableAdBanners ? 'text-green-400' : 'text-neutral-500'}`}
                    >
                      {settings.enableAdBanners ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-neutral-300 ml-2">Enable Ad Banners</span>
                  </label>
                </div>

                {settings.enableAdBanners && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Header Ad Banner Code
                      </label>
                      <textarea
                        rows={3}
                        value={settings.headerAdBannerCode || ''}
                        onChange={(e) => updateField('headerAdBannerCode', e.target.value)}
                        placeholder='<ins class="adsbygoogle" ...></ins>'
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg font-mono bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Sidebar Ad Banner Code
                      </label>
                      <textarea
                        rows={3}
                        value={settings.sidebarAdBannerCode || ''}
                        onChange={(e) => updateField('sidebarAdBannerCode', e.target.value)}
                        placeholder='<ins class="adsbygoogle" ...></ins>'
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg font-mono bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Footer Ad Banner Code
                      </label>
                      <textarea
                        rows={3}
                        value={settings.footerAdBannerCode || ''}
                        onChange={(e) => updateField('footerAdBannerCode', e.target.value)}
                        placeholder='<ins class="adsbygoogle" ...></ins>'
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-surface-600 rounded-lg font-mono bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance Mode */}
              <div className="bg-red-900/20 p-4 sm:p-6 rounded-xl border border-red-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white flex items-center text-sm sm:text-base">
                      <div className="w-8 h-8 bg-red-900/30 rounded-lg flex items-center justify-center mr-2">
                        <FaTools className="text-red-600 text-sm" />
                      </div>
                      Maintenance Mode
                    </h4>
                    <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 ml-10">
                      Only admins can access the site when enabled
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm active:scale-[0.98] transition ${
                      settings.maintenanceMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {settings.maintenanceMode ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Maintenance Message (English)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.maintenanceMessage_en || ''}
                        onChange={(e) => updateField('maintenanceMessage_en', e.target.value)}
                        placeholder="We're currently performing maintenance..."
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Maintenance Message (Swedish)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.maintenanceMessage_sv || ''}
                        onChange={(e) => updateField('maintenanceMessage_sv', e.target.value)}
                        placeholder="Vi utför för närvarande underhåll..."
                        className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg bg-surface-800 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Save Button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface-850 border-t border-surface-700 p-3 z-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition"
        >
          <FaSave size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
