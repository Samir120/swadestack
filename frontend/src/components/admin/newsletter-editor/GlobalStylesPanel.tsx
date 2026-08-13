import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Upload, Loader2 } from '../../common/icons';
import {
  GlobalStylesConfig,
  SocialMediaConfig,
  FooterConfig,
} from '../../../models/types/newsletterAdmin.types';
import { newsletterAdminApi } from '../../../models/api/newsletterAdminApi';

interface GlobalStylesPanelProps {
  globalStyles: GlobalStylesConfig;
  socialMediaConfig: SocialMediaConfig;
  footerConfig: FooterConfig;
  onUpdateGlobalStyles: (styles: GlobalStylesConfig) => void;
  onUpdateSocialMedia: (config: SocialMediaConfig) => void;
  onUpdateFooter: (config: FooterConfig) => void;
}

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-neutral-400 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-surface-600 cursor-pointer bg-transparent"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-1.5 text-sm text-white"
        placeholder="#000000"
      />
    </div>
  </div>
);

const LogoUploadSection: React.FC<{
  logoUrl: string;
  onChangeUrl: (url: string) => void;
  t: (key: string, fallback: string) => string;
}> = ({ logoUrl, onChangeUrl, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await newsletterAdminApi.uploadImage(file);
      if (res.success && res.data?.url) {
        onChangeUrl(res.data.url);
      }
    } catch { /* ignore */ }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          {t('newsletterAdmin.editor.globalStyles.logoUrl', 'Logo URL')}
        </label>
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => onChangeUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
        />
      </div>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-neutral-300 bg-surface-800 border border-surface-600 rounded-lg hover:bg-surface-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> {t('newsletterAdmin.editor.globalStyles.uploadLogo', 'Upload Logo Image')}</>
          )}
        </button>
      </div>

      {/* Preview */}
      {logoUrl && (
        <div className="p-2 bg-surface-800 rounded-lg border border-surface-600">
          <img
            src={logoUrl}
            alt="Logo preview"
            className="max-h-16 mx-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
    </>
  );
};

const GlobalStylesPanel: React.FC<GlobalStylesPanelProps> = ({
  globalStyles,
  socialMediaConfig,
  footerConfig,
  onUpdateGlobalStyles,
  onUpdateSocialMedia,
  onUpdateFooter,
}) => {
  const { t } = useTranslation();

  const updateStyles = (key: string, value: any) => {
    onUpdateGlobalStyles({ ...globalStyles, [key]: value });
  };

  const updateHeader = (key: string, value: any) => {
    onUpdateGlobalStyles({
      ...globalStyles,
      header: { ...globalStyles.header, [key]: value },
    });
  };

  const FONT_OPTIONS = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Courier New, monospace',
  ];

  const SOCIAL_PLATFORMS = [
    'Facebook',
    'Twitter',
    'Instagram',
    'LinkedIn',
    'YouTube',
    'TikTok',
    'GitHub',
  ];

  return (
    <div className="space-y-6">
      {/* Email Dimensions */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {t('newsletterAdmin.editor.globalStyles.emailSettings', 'Email Settings')}
        </p>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            {t('newsletterAdmin.editor.globalStyles.emailWidth', 'Email Width')}: {globalStyles.emailWidth || 600}px
          </label>
          <input
            type="range"
            min={400}
            max={800}
            value={globalStyles.emailWidth || 600}
            onChange={(e) => updateStyles('emailWidth', parseInt(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>
        <div className="mt-3 space-y-3">
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.bgColor', 'Background Color (behind email)')}
            value={globalStyles.backgroundColor || '#F1F5F9'}
            onChange={(v) => updateStyles('backgroundColor', v)}
          />
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.contentBgColor', 'Content Background')}
            value={globalStyles.contentBackgroundColor || '#FFFFFF'}
            onChange={(v) => updateStyles('contentBackgroundColor', v)}
          />
        </div>
      </div>

      {/* Typography */}
      <div className="border-t border-surface-700 pt-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {t('newsletterAdmin.editor.globalStyles.typography', 'Typography')}
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.defaultFont', 'Default Font')}
            </label>
            <select
              value={globalStyles.defaultFont || 'Arial, sans-serif'}
              onChange={(e) => updateStyles('defaultFont', e.target.value)}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.defaultTextColor', 'Default Text Color')}
            value={globalStyles.defaultTextColor || '#1E293B'}
            onChange={(v) => updateStyles('defaultTextColor', v)}
          />
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.defaultLinkColor', 'Default Link Color')}
            value={globalStyles.defaultLinkColor || '#3B82F6'}
            onChange={(v) => updateStyles('defaultLinkColor', v)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="border-t border-surface-700 pt-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {t('newsletterAdmin.editor.globalStyles.header', 'HEADER')}
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={globalStyles.header?.showLogo ?? true}
              onChange={(e) => updateHeader('showLogo', e.target.checked)}
              className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
            />
            {t('newsletterAdmin.editor.globalStyles.showLogo', 'Show Logo')}
          </label>
          {globalStyles.header?.showLogo !== false && (
            <LogoUploadSection
              logoUrl={globalStyles.header?.logoUrl || ''}
              onChangeUrl={(url) => updateHeader('logoUrl', url)}
              t={t}
            />
          )}
          {globalStyles.header?.showLogo !== false && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {t('newsletterAdmin.editor.globalStyles.logoWidth', 'Logo Width')}: {globalStyles.header?.logoWidth || 150}px
                </label>
                <input
                  type="range"
                  min={50}
                  max={300}
                  value={globalStyles.header?.logoWidth || 150}
                  onChange={(e) => updateHeader('logoWidth', parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  {t('newsletterAdmin.editor.globalStyles.logoAlignment', 'Logo Alignment')}
                </label>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateHeader('alignment', align)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        (globalStyles.header?.alignment || 'center') === align
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.headerBgColor', 'Header Background')}
            value={globalStyles.header?.backgroundColor || '#FFFFFF'}
            onChange={(v) => updateHeader('backgroundColor', v)}
          />
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.headerPadding', 'Header Padding')}: {globalStyles.header?.padding || 24}px
            </label>
            <input
              type="range"
              min={0}
              max={60}
              value={globalStyles.header?.padding || 24}
              onChange={(e) => updateHeader('padding', parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="border-t border-surface-700 pt-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {t('newsletterAdmin.editor.globalStyles.socialMedia', 'SOCIAL MEDIA')}
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.socialStyle', 'Display Style')}
            </label>
            <select
              value={socialMediaConfig.style || 'icons'}
              onChange={(e) => onUpdateSocialMedia({ ...socialMediaConfig, style: e.target.value as any })}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="icons">Icons only</option>
              <option value="icons-text">Icons + Text</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.socialAlignment', 'Alignment')}
            </label>
            <div className="flex gap-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdateSocialMedia({ ...socialMediaConfig, alignment: align as any })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    (socialMediaConfig.alignment || 'center') === align
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-900 text-neutral-400 hover:text-white border border-surface-600'
                  }`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {(socialMediaConfig.platforms || []).map((platform, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 w-16 truncate">{platform.platform}</span>
                <input
                  type="text"
                  value={platform.url}
                  onChange={(e) => {
                    const updated = [...socialMediaConfig.platforms];
                    updated[index] = { ...updated[index], url: e.target.value };
                    onUpdateSocialMedia({ ...socialMediaConfig, platforms: updated });
                  }}
                  placeholder="URL"
                  className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={() => {
                    const updated = socialMediaConfig.platforms.filter((_, i) => i !== index);
                    onUpdateSocialMedia({ ...socialMediaConfig, platforms: updated });
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.addPlatform', 'Add Platform')}
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onUpdateSocialMedia({
                    ...socialMediaConfig,
                    platforms: [
                      ...socialMediaConfig.platforms,
                      { platform: e.target.value, url: '', enabled: true },
                    ],
                  });
                  e.target.value = '';
                }
              }}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Select platform...</option>
              {SOCIAL_PLATFORMS.filter(
                (p) => !socialMediaConfig.platforms.some((sp) => sp.platform === p)
              ).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-700 pt-4">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {t('newsletterAdmin.editor.globalStyles.footer', 'FOOTER')}
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.companyName', 'Company Name')}
            </label>
            <input
              type="text"
              value={footerConfig.companyName || ''}
              onChange={(e) => onUpdateFooter({ ...footerConfig, companyName: e.target.value })}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.addressLine', 'Address')}
            </label>
            <input
              type="text"
              value={footerConfig.addressLine || ''}
              onChange={(e) => onUpdateFooter({ ...footerConfig, addressLine: e.target.value })}
              className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={footerConfig.showUnsubscribe ?? true}
              onChange={(e) => onUpdateFooter({ ...footerConfig, showUnsubscribe: e.target.checked })}
              className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
            />
            {t('newsletterAdmin.editor.globalStyles.showUnsubscribe', 'Show Unsubscribe Link')}
          </label>
          {footerConfig.showUnsubscribe !== false && (
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                {t('newsletterAdmin.editor.globalStyles.unsubscribeText', 'Unsubscribe Text')}
              </label>
              <input
                type="text"
                value={footerConfig.unsubscribeText || ''}
                onChange={(e) => onUpdateFooter({ ...footerConfig, unsubscribeText: e.target.value })}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          )}
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.footerBgColor', 'Footer Background')}
            value={footerConfig.backgroundColor || '#F8FAFC'}
            onChange={(v) => onUpdateFooter({ ...footerConfig, backgroundColor: v })}
          />
          <ColorInput
            label={t('newsletterAdmin.editor.globalStyles.footerTextColor', 'Footer Text Color')}
            value={footerConfig.textColor || '#64748B'}
            onChange={(v) => onUpdateFooter({ ...footerConfig, textColor: v })}
          />
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              {t('newsletterAdmin.editor.globalStyles.footerPadding', 'Footer Padding')}: {footerConfig.padding || 24}px
            </label>
            <input
              type="range"
              min={0}
              max={60}
              value={footerConfig.padding || 24}
              onChange={(e) => onUpdateFooter({ ...footerConfig, padding: parseInt(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStylesPanel;
