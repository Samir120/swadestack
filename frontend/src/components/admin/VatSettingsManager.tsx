import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { vatSettingsApi } from '../../models/api/vatSettingsApi';
import { useAppDispatch } from '../../store/hooks';
import { updateVatSettings } from '../../store/slices/vatSettingsSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaSave } from 'react-icons/fa';

const VatSettingsManager: React.FC = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state — vatRatePercent is what the user types (e.g. 25 for 25%)
  const [vatRatePercent, setVatRatePercent] = useState<string>('25');
  const [labelEn, setLabelEn] = useState('VAT');
  const [labelSv, setLabelSv] = useState('Moms');
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await vatSettingsApi.getAdmin();
        if (response.success && response.data) {
          const data = response.data as any;
          const rate = Number(data.vatRate);
          setVatRatePercent(String(Math.round(rate * 10000) / 100)); // 0.25 -> "25"
          setLabelEn(data.label_en || 'VAT');
          setLabelSv(data.label_sv || 'Moms');
          setUpdatedAt(data.updatedAt);
        }
      } catch {
        toast.error('Failed to load VAT settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const validate = (): string | null => {
    const pct = parseFloat(vatRatePercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return 'VAT rate must be between 0 and 100 percent';
    }
    if (!labelEn.trim()) return 'English label is required';
    if (!labelSv.trim()) return 'Swedish label is required';
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSaving(true);
    try {
      const vatRate = parseFloat(vatRatePercent) / 100; // 25 -> 0.25
      const response = await vatSettingsApi.update({
        vatRate,
        label_en: labelEn.trim(),
        label_sv: labelSv.trim(),
      });
      if (response.success && response.data) {
        const data = response.data as any;
        setUpdatedAt(data.updatedAt);
        toast.success('VAT settings saved successfully');
        // Update Redux store so all components pick up the new rate
        dispatch(updateVatSettings({
          vatRate,
          label_en: labelEn.trim(),
          label_sv: labelSv.trim(),
          updatedAt: data.updatedAt,
        }));
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save VAT settings');
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

  const previewRate = parseFloat(vatRatePercent) || 0;
  const previewDecimal = previewRate / 100;
  const exampleNet = 1000;
  const exampleGross = exampleNet * (1 + previewDecimal);
  const exampleVat = exampleNet * previewDecimal;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">VAT Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Configure the global VAT rate used across all pricing and invoices
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

      <div className="space-y-4">
        {/* VAT Rate */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Tax Rate</h3>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">
              VAT Rate (%) <span className="text-red-400">*</span>
            </label>
            <div className="relative w-48">
              <input
                type="number"
                value={vatRatePercent}
                onChange={(e) => setVatRatePercent(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2.5 pr-10 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm"
                placeholder="e.g. 25"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">
              Stored as {previewDecimal.toFixed(4)} (decimal). Common rates: Sweden 25%, EU average 21%.
            </p>
          </div>
        </div>

        {/* Labels */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Display Labels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                English Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={labelEn}
                onChange={(e) => setLabelEn(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm"
                placeholder="e.g. VAT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Swedish Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={labelSv}
                onChange={(e) => setLabelSv(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors text-sm"
                placeholder="e.g. Moms"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-surface-850 border border-surface-700 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Preview</h3>
          <div className="bg-surface-800 border border-surface-600 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-300">
              <span>Example item (net)</span>
              <span>{exampleNet.toLocaleString('sv-SE')} SEK</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>{labelEn} ({previewRate}%)</span>
              <span>{exampleVat.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK</span>
            </div>
            <div className="border-t border-surface-600 pt-2 flex justify-between text-white font-medium">
              <span>Total (incl. {labelEn})</span>
              <span>{exampleGross.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK</span>
            </div>
          </div>
          {updatedAt && (
            <p className="text-xs text-neutral-500 mt-3">
              Last updated: {new Date(updatedAt).toLocaleString('sv-SE')}
            </p>
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

export default VatSettingsManager;
