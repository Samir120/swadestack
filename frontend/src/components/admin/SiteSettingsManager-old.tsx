import React, { useEffect, useState } from 'react';
import apiClient from '../../models/api/apiClient';

interface SiteSettingsData {
  // Site Identity
  siteName_en: string;
  siteName_sv: string;
  tagline_en: string;
  tagline_sv: string;
  logoUrl: string;
  faviconUrl: string;
  
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
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  githubUrl: string;
  
  // Footer
  copyrightText_en: string;
  copyrightText_sv: string;
  footerDescription_en: string;
  footerDescription_sv: string;
  
  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage_en: string;
  maintenanceMessage_sv: string;
}

const SiteSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'contact' | 'social' | 'advanced'>('general');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/settings');
      if (response.success && response.data) {
        setSettings(response.data);
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
      alert('Failed to save settings. Please try again.');
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

  const updateField = (field: keyof SiteSettingsData, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'contact', name: 'Contact', icon: '📞' },
    { id: 'social', name: 'Social Media', icon: '🌐' },
    { id: 'advanced', name: 'Advanced', icon: '⚡' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Site Settings</h2>
        <div className="flex gap-3">
          {successMessage && (
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              {successMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Identity</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name (English)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName_en}
                    onChange={(e) => updateField('siteName_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.siteName_sv}
                    onChange={(e) => updateField('siteName_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline_en}
                    onChange={(e) => updateField('tagline_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline_sv}
                    onChange={(e) => updateField('tagline_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl}
                    onChange={(e) => updateField('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {settings.logoUrl && (
                    <img
                      src={settings.logoUrl}
                      alt="Logo preview"
                      className="mt-2 h-12 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={settings.faviconUrl}
                    onChange={(e) => updateField('faviconUrl', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Optimization</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (English)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle_en}
                    onChange={(e) => updateField('metaTitle_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.metaTitle_en.length}/60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle_sv}
                    onChange={(e) => updateField('metaTitle_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.metaTitle_sv.length}/60 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription_en}
                    onChange={(e) => updateField('metaDescription_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.metaDescription_en.length}/160 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description (Swedish)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.metaDescription_sv}
                    onChange={(e) => updateField('metaDescription_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.metaDescription_sv.length}/160 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords (English)
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords_en}
                    onChange={(e) => updateField('metaKeywords_en', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords_sv}
                    onChange={(e) => updateField('metaKeywords_sv', e.target.value)}
                    placeholder="nyckelord1, nyckelord2, nyckelord3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={settings.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={settings.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription_en}
                    onChange={(e) => updateField('footerDescription_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Description (Swedish)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription_sv}
                    onChange={(e) => updateField('footerDescription_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copyright Text (English)
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText_en}
                    onChange={(e) => updateField('copyrightText_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Copyright Text (Swedish)
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText_sv}
                    onChange={(e) => updateField('copyrightText_sv', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
              
              <div className="space-y-4">
                {[
                  { field: 'facebookUrl', label: 'Facebook', icon: '📘' },
                  { field: 'twitterUrl', label: 'Twitter', icon: '🐦' },
                  { field: 'instagramUrl', label: 'Instagram', icon: '📸' },
                  { field: 'linkedinUrl', label: 'LinkedIn', icon: '💼' },
                  { field: 'youtubeUrl', label: 'YouTube', icon: '🎥' },
                  { field: 'githubUrl', label: 'GitHub', icon: '💻' },
                ].map((social) => (
                  <div key={social.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="mr-2">{social.icon}</span>
                      {social.label}
                    </label>
                    <input
                      type="url"
                      value={(settings as any)[social.field] || ''}
                      onChange={(e) => updateField(social.field as any, e.target.value)}
                      placeholder={`https://${social.label.toLowerCase()}.com/yourpage`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
              
              {/* Analytics */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h4 className="font-medium text-gray-900">Analytics & Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId || ''}
                      onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={settings.facebookPixelId || ''}
                      onChange={(e) => updateField('facebookPixelId', e.target.value)}
                      placeholder="XXXXXXXXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="bg-red-50 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">
                      When enabled, only admins can access the site
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMaintenance}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      settings.maintenanceMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {settings.maintenanceMode ? 'Disable' : 'Enable'}
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance Message (English)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.maintenanceMessage_en || ''}
                        onChange={(e) => updateField('maintenanceMessage_en', e.target.value)}
                        placeholder="We're currently performing maintenance..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maintenance Message (Swedish)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.maintenanceMessage_sv || ''}
                        onChange={(e) => updateField('maintenanceMessage_sv', e.target.value)}
                        placeholder="Vi utför för närvarande underhåll..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
