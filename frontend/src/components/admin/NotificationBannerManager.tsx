import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import { notificationBannersApi } from '../../models/api/notificationBannersApi';
import apiClient from '../../models/api/apiClient';
import {
  NotificationBanner,
  BackgroundType,
  FontWeight,
  FontSize,
} from '../../models/types/notificationBanner.types';
import DynamicLucideIcon from '../common/DynamicLucideIcon';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
  FaCheck,
  FaCopy,
  FaExternalLinkAlt,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';

// --- Constants ---

const ICON_OPTIONS = [
  'Megaphone', 'Bell', 'Tag', 'Zap', 'Star', 'Gift',
  'Percent', 'Clock', 'Info', 'AlertTriangle', 'Heart', 'Sparkles',
];

const COLOR_PRESETS = [
  '#1e40af', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#000000',
];

const FONT_WEIGHT_OPTIONS: { value: FontWeight; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Base' },
  { value: 'lg', label: 'Large' },
];

const FONT_WEIGHT_MAP: Record<FontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const FONT_SIZE_MAP: Record<FontSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

// --- Helper: WCAG Contrast Ratio ---

function hexToLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Default form state ---

interface FormState {
  title: string;
  message_en: string;
  message_sv: string;
  linkUrl: string;
  linkText_en: string;
  linkText_sv: string;
  couponCode: string;
  showPhone: boolean;
  showEmail: boolean;
  backgroundColor: string;
  textColor: string;
  backgroundType: BackgroundType;
  gradientEndColor: string;
  gradientDirection: string;
  fontWeight: FontWeight;
  fontSize: FontSize;
  icon: string;
  isActive: boolean;
  showOnAuthPages: boolean;
  showOnAdminPanel: boolean;
  isDismissible: boolean;
  startDate: string;
  endDate: string;
  showOnPages: string[];
  priority: number;
}

const defaultForm: FormState = {
  title: '',
  message_en: '',
  message_sv: '',
  linkUrl: '',
  linkText_en: '',
  linkText_sv: '',
  couponCode: '',
  showPhone: false,
  showEmail: false,
  backgroundColor: '#1e40af',
  textColor: '#ffffff',
  backgroundType: 'solid',
  gradientEndColor: '#7c3aed',
  gradientDirection: 'to right',
  fontWeight: 'medium',
  fontSize: 'sm',
  icon: '',
  isActive: false,
  showOnAuthPages: false,
  showOnAdminPanel: false,
  isDismissible: true,
  startDate: '',
  endDate: '',
  showOnPages: ['all'],
  priority: 0,
};

// ==================== COMPONENT ====================

const NotificationBannerManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);

  const [banners, setBanners] = useState<NotificationBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [couponVerifying, setCouponVerifying] = useState(false);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const response = await notificationBannersApi.getAll();
      if (response.success && response.data) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error('Failed to load notification banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Form Handlers ---

  const handleCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm });
    setCouponValid(null);
    setView('form');
  };

  const handleEdit = (banner: NotificationBanner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      message_en: banner.message_en,
      message_sv: banner.message_sv,
      linkUrl: banner.linkUrl || '',
      linkText_en: banner.linkText_en || '',
      linkText_sv: banner.linkText_sv || '',
      couponCode: banner.couponCode || '',
      showPhone: banner.showPhone,
      showEmail: banner.showEmail,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      backgroundType: banner.backgroundType,
      gradientEndColor: banner.gradientEndColor || '#7c3aed',
      gradientDirection: banner.gradientDirection || 'to right',
      fontWeight: banner.fontWeight,
      fontSize: banner.fontSize,
      icon: banner.icon || '',
      isActive: banner.isActive,
      showOnAuthPages: banner.showOnAuthPages,
      showOnAdminPanel: banner.showOnAdminPanel,
      isDismissible: banner.isDismissible,
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : '',
      showOnPages: banner.showOnPages,
      priority: banner.priority,
    });
    setCouponValid(null);
    setView('form');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message_en.trim() || !form.message_sv.trim()) {
      toast.error('Title and both message fields are required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ...form,
        linkUrl: form.linkUrl || null,
        linkText_en: form.linkText_en || null,
        linkText_sv: form.linkText_sv || null,
        couponCode: form.couponCode || null,
        icon: form.icon || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        gradientEndColor: form.backgroundType === 'gradient' ? form.gradientEndColor : null,
        gradientDirection: form.backgroundType === 'gradient' ? form.gradientDirection : null,
      };

      let response;
      if (editingId) {
        response = await notificationBannersApi.update(editingId, payload);
      } else {
        response = await notificationBannersApi.create(payload);
      }

      if (response.success) {
        toast.success(editingId ? 'Banner updated' : 'Banner created');
        setView('list');
        loadBanners();
      } else {
        toast.error(response.message || 'Failed to save');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Notification Banner',
      message: 'Are you sure you want to delete this notification banner? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;

    try {
      const response = await notificationBannersApi.delete(id);
      if (response.success) {
        toast.success('Banner deleted');
        loadBanners();
      } else {
        toast.error(response.message || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const response = await notificationBannersApi.toggle(id);
      if (response.success) {
        toast.success('Status updated');
        loadBanners();
      }
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleVerifyCoupon = async () => {
    if (!form.couponCode.trim()) return;
    setCouponVerifying(true);
    setCouponValid(null);
    try {
      const response = await apiClient.post<any>('/coupons/validate', { code: form.couponCode });
      setCouponValid(response.success === true);
    } catch {
      setCouponValid(false);
    } finally {
      setCouponVerifying(false);
    }
  };

  const updateForm = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- WCAG check ---
  const wcagRatio = useMemo(() => {
    try {
      return contrastRatio(form.backgroundColor, form.textColor);
    } catch {
      return 0;
    }
  }, [form.backgroundColor, form.textColor]);

  const wcagPass = wcagRatio >= 4.5;

  // --- Preview background style ---
  const previewBgStyle = useMemo(() => {
    if (form.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${form.gradientDirection}, ${form.backgroundColor}, ${form.gradientEndColor})`,
      };
    }
    return { backgroundColor: form.backgroundColor };
  }, [form.backgroundType, form.backgroundColor, form.gradientEndColor, form.gradientDirection]);

  // ==================== LIST VIEW ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Notification Banners</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium shrink-0"
          >
            <FaPlus size={12} /> New Banner
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="bg-surface-800 rounded-xl border border-surface-700 p-12 text-center">
            <p className="text-neutral-400 text-sm">No notification banners yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner) => {
              const ctr = banner.impressions > 0
                ? ((banner.clicks / banner.impressions) * 100).toFixed(1)
                : '0.0';
              const bgStyle = banner.backgroundType === 'gradient'
                ? { background: `linear-gradient(${banner.gradientDirection || 'to right'}, ${banner.backgroundColor}, ${banner.gradientEndColor || banner.backgroundColor})` }
                : { backgroundColor: banner.backgroundColor };
              const isScheduled = banner.startDate || banner.endDate;

              return (
                <div
                  key={banner.id}
                  className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden"
                >
                  {/* Color preview bar */}
                  <div className="h-2" style={bgStyle} />
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              banner.isActive ? 'bg-green-400' : 'bg-neutral-500'
                            }`}
                          />
                          <h3 className="text-white font-semibold text-sm truncate">
                            {banner.title}
                          </h3>
                          {banner.priority > 0 && (
                            <span className="text-xs text-neutral-400 bg-surface-700 px-1.5 py-0.5 rounded">
                              P{banner.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-400 text-xs truncate mb-2">
                          {language === 'en' ? banner.message_en : banner.message_sv}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                          <span>{banner.impressions.toLocaleString()} views</span>
                          <span>{banner.clicks.toLocaleString()} clicks</span>
                          <span>{ctr}% CTR</span>
                          <span>{banner.dismissals.toLocaleString()} dismissed</span>
                        </div>
                        {isScheduled && (
                          <div className="mt-1 text-xs text-neutral-500">
                            {banner.startDate && (
                              <span>From: {new Date(banner.startDate).toLocaleDateString()}</span>
                            )}
                            {banner.startDate && banner.endDate && <span> &mdash; </span>}
                            {banner.endDate && (
                              <span>Until: {new Date(banner.endDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        {banner.showOnPages && !banner.showOnPages.includes('all') && (
                          <div className="mt-1 text-xs text-neutral-500">
                            Pages: {banner.showOnPages.join(', ')}
                          </div>
                        )}
                      </div>
                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggle(banner.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            banner.isActive
                              ? 'text-green-400 hover:bg-green-400/10'
                              : 'text-neutral-500 hover:bg-surface-700'
                          }`}
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==================== FORM VIEW ====================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setView('list')}
          className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors shrink-0"
        >
          <FaArrowLeft size={16} />
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-white">
          {editingId ? 'Edit Banner' : 'Create Banner'}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column — Settings */}
        <div className="xl:col-span-2 space-y-6">
          {/* --- Content Section --- */}
          <section className="bg-surface-800 rounded-xl border border-surface-700 p-4 sm:p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Content</h3>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Title (internal)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                placeholder="e.g. Summer Sale 2026"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Message (EN) <span className="text-neutral-500">{form.message_en.length}/300</span>
                </label>
                <textarea
                  value={form.message_en}
                  onChange={(e) => updateForm('message_en', e.target.value.slice(0, 300))}
                  rows={3}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="English message..."
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">
                  Message (SV) <span className="text-neutral-500">{form.message_sv.length}/300</span>
                </label>
                <textarea
                  value={form.message_sv}
                  onChange={(e) => updateForm('message_sv', e.target.value.slice(0, 300))}
                  rows={3}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none resize-none"
                  placeholder="Swedish message..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateForm('icon', '')}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs transition-colors ${
                    !form.icon
                      ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                      : 'border-surface-600 text-neutral-400 hover:border-surface-500'
                  }`}
                >
                  <FaTimes size={10} />
                </button>
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    onClick={() => updateForm('icon', iconName)}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                      form.icon === iconName
                        ? 'border-primary-500 bg-primary-600/10 text-primary-400'
                        : 'border-surface-600 text-neutral-400 hover:border-surface-500'
                    }`}
                    title={iconName}
                  >
                    <DynamicLucideIcon name={iconName} size={16} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* --- CTA Section --- */}
          <section className="bg-surface-800 rounded-xl border border-surface-700 p-4 sm:p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Call to Action</h3>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Link URL</label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => updateForm('linkUrl', e.target.value)}
                className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Link Text (EN)</label>
                <input
                  type="text"
                  value={form.linkText_en}
                  onChange={(e) => updateForm('linkText_en', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Link Text (SV)</label>
                <input
                  type="text"
                  value={form.linkText_sv}
                  onChange={(e) => updateForm('linkText_sv', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Handla Nu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => {
                    updateForm('couponCode', e.target.value.toUpperCase());
                    setCouponValid(null);
                  }}
                  className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none font-mono"
                  placeholder="SUMMER20"
                />
                <button
                  onClick={handleVerifyCoupon}
                  disabled={!form.couponCode.trim() || couponVerifying}
                  className="px-3 py-2 text-xs font-medium bg-surface-700 text-neutral-300 rounded-lg hover:bg-surface-600 disabled:opacity-50 transition-colors"
                >
                  {couponVerifying ? '...' : 'Verify'}
                </button>
                {couponValid !== null && (
                  <span className={`flex items-center text-xs ${couponValid ? 'text-green-400' : 'text-red-400'}`}>
                    {couponValid ? <FaCheck size={12} /> : <FaTimes size={12} />}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* --- Contact Section --- */}
          <section className="bg-surface-800 rounded-xl border border-surface-700 p-4 sm:p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Contact Info</h3>
            <p className="text-xs text-neutral-500">Display company phone/email from Legal & Company settings</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showPhone}
                  onChange={(e) => updateForm('showPhone', e.target.checked)}
                  className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
                />
                Show Phone
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showEmail}
                  onChange={(e) => updateForm('showEmail', e.target.checked)}
                  className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
                />
                Show Email
              </label>
            </div>
          </section>

          {/* --- Styling Section --- */}
          <section className="bg-surface-800 rounded-xl border border-surface-700 p-4 sm:p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Styling</h3>

            {/* Background Type */}
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Background Type</label>
              <div className="flex gap-3">
                {(['solid', 'gradient'] as BackgroundType[]).map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="backgroundType"
                      checked={form.backgroundType === type}
                      onChange={() => updateForm('backgroundType', type)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Background Color</label>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateForm('backgroundColor', color)}
                      className={`w-7 h-7 rounded-md border-2 transition-all ${
                        form.backgroundColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.backgroundColor}
                    onChange={(e) => updateForm('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.backgroundColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateForm('backgroundColor', v);
                    }}
                    className="w-20 bg-surface-900 border border-surface-600 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Gradient Controls */}
            {form.backgroundType === 'gradient' && (
              <>
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Gradient End Color</label>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex gap-1.5">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateForm('gradientEndColor', color)}
                          className={`w-7 h-7 rounded-md border-2 transition-all ${
                            form.gradientEndColor === color ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.gradientEndColor}
                        onChange={(e) => updateForm('gradientEndColor', e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={form.gradientEndColor}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateForm('gradientEndColor', v);
                        }}
                        className="w-20 bg-surface-900 border border-surface-600 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Gradient Direction</label>
                  <select
                    value={form.gradientDirection}
                    onChange={(e) => updateForm('gradientDirection', e.target.value)}
                    className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="to right">Left to Right</option>
                    <option value="to left">Right to Left</option>
                    <option value="to bottom">Top to Bottom</option>
                    <option value="to top">Bottom to Top</option>
                    <option value="to bottom right">Diagonal ↘</option>
                    <option value="to bottom left">Diagonal ↙</option>
                  </select>
                </div>
              </>
            )}

            {/* Text Color */}
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Text Color</label>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateForm('textColor', '#ffffff')}
                    className={`w-7 h-7 rounded-md border-2 transition-all bg-white ${
                      form.textColor === '#ffffff' ? 'border-primary-500 scale-110' : 'border-surface-600'
                    }`}
                  />
                  <button
                    onClick={() => updateForm('textColor', '#000000')}
                    className={`w-7 h-7 rounded-md border-2 transition-all bg-black ${
                      form.textColor === '#000000' ? 'border-primary-500 scale-110' : 'border-surface-600'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.textColor}
                    onChange={(e) => updateForm('textColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.textColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateForm('textColor', v);
                    }}
                    className="w-20 bg-surface-900 border border-surface-600 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* WCAG Contrast Check */}
              <div className={`mt-2 flex items-center gap-2 text-xs ${wcagPass ? 'text-green-400' : 'text-amber-400'}`}>
                {wcagPass ? <FaCheck size={10} /> : <FaTimes size={10} />}
                <span>
                  Contrast ratio: {wcagRatio.toFixed(1)}:1 {wcagPass ? '(WCAG AA Pass)' : '(Below WCAG AA 4.5:1)'}
                </span>
              </div>
            </div>

            {/* Font Weight & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Font Weight</label>
                <select
                  value={form.fontWeight}
                  onChange={(e) => updateForm('fontWeight', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  {FONT_WEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Font Size</label>
                <select
                  value={form.fontSize}
                  onChange={(e) => updateForm('fontSize', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* --- Visibility Section --- */}
          <section className="bg-surface-800 rounded-xl border border-surface-700 p-4 sm:p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">Visibility & Targeting</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                { key: 'isActive', label: 'Active' },
                { key: 'isDismissible', label: 'Dismissible' },
                { key: 'showOnAuthPages', label: 'Auth Pages' },
                { key: 'showOnAdminPanel', label: 'Admin Panel' },
              ] as { key: keyof FormState; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={(e) => updateForm(key, e.target.checked)}
                    className="rounded border-surface-600 bg-surface-900 text-primary-600 focus:ring-primary-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Page targeting */}
            <div>
              <label className="block text-xs text-neutral-400 mb-2">Show On Pages</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={form.showOnPages.includes('all')}
                    onChange={() => updateForm('showOnPages', ['all'])}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  All Pages
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={!form.showOnPages.includes('all')}
                    onChange={() => updateForm('showOnPages', ['/'])}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  Specific Pages
                </label>
              </div>
              {!form.showOnPages.includes('all') && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={form.showOnPages.join(', ')}
                    onChange={(e) =>
                      updateForm(
                        'showOnPages',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                    placeholder="/, /checkout, /pc-builder"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Comma-separated paths</p>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Start Date (optional)</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">End Date (optional)</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                  className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Priority</label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => updateForm('priority', parseInt(e.target.value, 10) || 0)}
                className="w-24 bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                min={0}
              />
              <p className="text-xs text-neutral-500 mt-1">Higher priority banners display first</p>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
            </button>
            <button
              onClick={() => setView('list')}
              className="px-6 py-2.5 bg-surface-700 text-neutral-300 rounded-lg hover:bg-surface-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Column — Live Preview (sticky on xl) */}
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-20 space-y-4">
            {/* Desktop Preview — hidden on small screens */}
            <div className="hidden sm:block">
              <h3 className="text-white font-semibold text-sm mb-2">Desktop Preview</h3>
              <div className="rounded-xl overflow-hidden border border-surface-700">
                <div
                  className="px-4 py-2 flex items-center justify-between gap-3 overflow-hidden"
                  style={{ ...previewBgStyle, color: form.textColor }}
                >
                  {/* Zone 1: Message + CTA */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {form.icon && (
                      <DynamicLucideIcon name={form.icon} size={16} style={{ color: form.textColor }} />
                    )}
                    <span className={`${FONT_SIZE_MAP[form.fontSize]} ${FONT_WEIGHT_MAP[form.fontWeight]}`}>
                      {(language === 'en' ? form.message_en : form.message_sv) || 'Your message here...'}
                    </span>
                    {form.couponCode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-white/20 flex-shrink-0">
                        <FaCopy size={8} />
                        {form.couponCode}
                      </span>
                    )}
                    {form.linkUrl && (form.linkText_en || form.linkText_sv) && (
                      <span className="inline-flex items-center gap-1 text-xs underline underline-offset-2 flex-shrink-0">
                        {language === 'en' ? form.linkText_en : form.linkText_sv}
                        <FaExternalLinkAlt size={8} />
                      </span>
                    )}
                  </div>
                  {/* Zone 2: Contact */}
                  {(form.showPhone || form.showEmail) && (
                    <div className="flex items-center gap-2 text-xs opacity-80 flex-shrink-0">
                      {form.showPhone && (
                        <span className="inline-flex items-center gap-1">
                          <FaPhone size={10} /> +46 XXX XXX
                        </span>
                      )}
                      {form.showEmail && (
                        <span className="inline-flex items-center gap-1">
                          <FaEnvelope size={10} /> info@...
                        </span>
                      )}
                    </div>
                  )}
                  {/* Zone 3: Dismiss */}
                  {form.isDismissible && (
                    <span className="flex-shrink-0 opacity-60">
                      <FaTimes size={12} />
                    </span>
                  )}
                </div>
                <div className="bg-surface-700 px-4 py-2.5 text-xs text-neutral-400 text-center">
                  Header
                </div>
              </div>
            </div>

            {/* Mobile Preview */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Mobile Preview</h3>
              <div className="rounded-xl overflow-hidden border border-surface-700 max-w-[260px]">
                <div
                  className="px-3 py-1.5 flex items-center justify-between gap-1.5"
                  style={{
                    ...previewBgStyle,
                    color: form.textColor,
                    fontSize: '0.75rem',
                  }}
                >
                  {/* Zone 1: Truncated message only */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`${FONT_WEIGHT_MAP[form.fontWeight]} block truncate`}
                    >
                      {(language === 'en' ? form.message_en : form.message_sv) || 'Message...'}
                    </span>
                  </div>
                  {/* Zone 2: Icon-only contact */}
                  {(form.showPhone || form.showEmail) && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 opacity-80">
                      {form.showPhone && <FaPhone size={10} />}
                      {form.showEmail && <FaEnvelope size={10} />}
                    </div>
                  )}
                  {/* Zone 3: Dismiss */}
                  {form.isDismissible && (
                    <span className="flex-shrink-0 opacity-60">
                      <FaTimes size={10} />
                    </span>
                  )}
                </div>
                <div className="bg-surface-700 px-3 py-2 text-[10px] text-neutral-400 text-center">
                  Header
                </div>
              </div>
              {/* Mobile notes */}
              <div className="mt-2 text-xs text-neutral-500 space-y-0.5">
                <p>&#8226; Icon, coupon &amp; link text hidden</p>
                <p>&#8226; Message truncates with ellipsis</p>
                {form.linkUrl && <p>&#8226; Entire banner becomes tappable link</p>}
                <p>&#8226; Contact shows tappable icons only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBannerManager;
