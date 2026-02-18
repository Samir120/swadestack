import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchUserConfigurations,
  deleteConfiguration,
  duplicateConfiguration,
} from '../../store/slices/savedConfigurationsSlice';
import { pcConfigurationApi } from '../../models/api/pcConfigurationApi';
import { PCConfiguration, ConfigurationStatus } from '../../models/types/pcConfiguration.types';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * PC Configurations Tab Component
 * Displays user's saved PC configurations in the dashboard
 */

const PCConfigurationsTab: React.FC = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const { configurations = [], isLoading, error, total = 0 } = useAppSelector(
    (state) => state.savedConfigurations
  );

  const [filterStatus, setFilterStatus] = useState<ConfigurationStatus | 'all'>('all');
  const [selectedConfig, setSelectedConfig] = useState<PCConfiguration | null>(null);

  // Load configurations on mount
  useEffect(() => {
    const status = filterStatus === 'all' ? undefined : filterStatus;
    dispatch(fetchUserConfigurations(status));
  }, [dispatch, filterStatus]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle edit configuration
  const handleEdit = (configId: string) => {
    navigate(`/pc-builder?config=${configId}`);
  };

  // Handle duplicate configuration
  const handleDuplicate = async (configId: string) => {
    try {
      await dispatch(duplicateConfiguration(configId)).unwrap();
      toast.success(
        language === 'en'
          ? 'Configuration duplicated successfully!'
          : 'Konfiguration duplicerad!'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate configuration');
    }
  };

  // Handle delete configuration
  const handleDelete = async (configId: string) => {
    const confirmed = await confirm({
      title: language === 'en' ? 'Delete Configuration' : 'Ta bort konfiguration',
      message: language === 'en'
        ? 'Are you sure you want to delete this configuration? This action cannot be undone.'
        : 'Är du säker på att du vill ta bort denna konfiguration? Denna åtgärd kan inte ångras.',
      confirmText: language === 'en' ? 'Delete' : 'Ta bort',
      cancelText: language === 'en' ? 'Cancel' : 'Avbryt',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await dispatch(deleteConfiguration(configId)).unwrap();
      toast.success(
        language === 'en'
          ? 'Configuration deleted successfully!'
          : 'Konfiguration borttagen!'
      );
      setSelectedConfig(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete configuration');
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async (configId: string) => {
    try {
      toast.info(
        language === 'en'
          ? 'Generating PDF...'
          : 'Genererar PDF...',
        undefined,
        2000
      );
      await pcConfigurationApi.exportPDF(configId, language as 'en' | 'sv');
      toast.success(
        language === 'en'
          ? 'PDF downloaded successfully!'
          : 'PDF nedladdad!'
      );
    } catch (err: any) {
      toast.error(
        language === 'en'
          ? 'Failed to download PDF'
          : 'Kunde inte ladda ner PDF'
      );
    }
  };

  // Check if configuration has all required components
  // Required: CPU, Motherboard, RAM, PSU, Case
  const hasRequiredComponents = (config: PCConfiguration): boolean => {
    const components = config.components || {} as any;
    const hasCpu = !!components.cpu;
    const hasMotherboard = !!components.motherboard;
    const hasRam = (components.rams && Array.isArray(components.rams) && components.rams.length > 0) ||
                   (components.ram && !Array.isArray(components.ram));
    const hasPsu = !!components.psu;
    const hasCase = !!components.case;
    return !!(hasCpu && hasMotherboard && hasRam && hasPsu && hasCase);
  };

  // Handle order configuration (navigate to checkout)
  const handleOrder = (config: PCConfiguration) => {
    // Check if configuration is valid
    if (!config.isValid || (config.validationErrors?.length || 0) > 0) {
      toast.error(
        language === 'en'
          ? 'Please fix compatibility issues before ordering'
          : 'Vänligen åtgärda kompatibilitetsproblem innan du beställer'
      );
      return;
    }

    // Check if all required components are selected
    if (!hasRequiredComponents(config)) {
      toast.error(
        language === 'en'
          ? 'Please select all required components (CPU, Motherboard, RAM, PSU, Case) before ordering'
          : 'Välj alla obligatoriska komponenter (CPU, Moderkort, RAM, Nätaggregat, Chassi) innan du beställer'
      );
      return;
    }

    // Navigate to checkout with configuration
    navigate('/checkout', { state: { configurationId: config.id } });
  };

  // Get status color
  const getStatusColor = (status: ConfigurationStatus) => {
    switch (status) {
      case 'ordered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'saved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'draft':
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    }
  };

  // Get status label
  const getStatusLabel = (status: ConfigurationStatus) => {
    switch (status) {
      case 'ordered':
        return language === 'en' ? 'Ordered' : 'Beställd';
      case 'saved':
        return language === 'en' ? 'Saved' : 'Sparad';
      case 'draft':
      default:
        return language === 'en' ? 'Draft' : 'Utkast';
    }
  };

  // Get configuration name
  const getConfigName = (config: PCConfiguration) => {
    const name = language === 'en' ? config.name_en : config.name_sv;
    return name || `${language === 'en' ? 'Configuration' : 'Konfiguration'} ${config.id.substring(0, 8)}`;
  };

  // Count components in configuration
  const getComponentCount = (config: PCConfiguration) => {
    const components = config.components || {} as any;
    let count = 0;

    // Single-select components
    if (components.cpu) count++;
    if (components.motherboard) count++;
    if (components.psu) count++;
    if (components.case) count++;
    if (components.cooling) count++;
    if (components.optical) count++;
    if (components.os) count++;

    // Multi-select array components (rams, gpus, ssds, hdds, fans)
    const arrayKeys = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
    arrayKeys.forEach((key) => {
      const arr = (components as Record<string, any>)[key];
      if (Array.isArray(arr) && arr.length > 0) count++;
    });

    // Legacy single ram/gpu support
    if (components.ram && !Array.isArray(components.ram)) count++;
    if (components.gpu && !Array.isArray(components.gpu)) count++;

    // Legacy storage array support
    if (components.storage && Array.isArray(components.storage) && components.storage.length > 0) count++;

    return count;
  };

  // Calculate total price from components (fallback when totalPrice is 0)
  const calculateTotalFromComponents = (config: PCConfiguration): number => {
    const components = config.components || {} as any;
    let total = 0;

    // Single-select components
    if (components.cpu) total += (components.cpu as any).price || 0;
    if (components.motherboard) total += (components.motherboard as any).price || 0;
    if (components.psu) total += (components.psu as any).price || 0;
    if (components.case) total += (components.case as any).price || 0;
    if (components.cooling) total += (components.cooling as any).price || 0;
    if (components.optical) total += (components.optical as any).price || 0;
    if (components.os) total += (components.os as any).price || 0;

    // Multi-select array components (rams, gpus, ssds, hdds, fans)
    const arrayKeys = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
    arrayKeys.forEach((key) => {
      const arr = (components as Record<string, any>)[key];
      if (Array.isArray(arr)) {
        arr.forEach((item: any) => {
          if (item && typeof item.price === 'number') {
            total += item.price * (item.quantity || 1);
          }
        });
      }
    });

    // Legacy storage array support
    if (components.storage && Array.isArray(components.storage)) {
      components.storage.forEach((item: any) => {
        if (item && typeof item.price === 'number') {
          total += item.price * (item.quantity || 1);
        }
      });
    }

    // Legacy single ram/gpu support
    if (components.ram && !Array.isArray(components.ram)) {
      const ram = components.ram as any;
      total += (ram.price || 0) * (ram.quantity || 1);
    }
    if (components.gpu && !Array.isArray(components.gpu)) {
      total += (components.gpu as any).price || 0;
    }

    return total;
  };

  // Get effective total price (use stored or calculate from components)
  const getEffectivePrice = (config: PCConfiguration): number => {
    if (config.totalPrice && config.totalPrice > 0) {
      return config.totalPrice;
    }
    return calculateTotalFromComponents(config);
  };

  // Format price
  const formatPrice = (price: number, currency: string = 'SEK') => {
    return new Intl.NumberFormat(language === 'en' ? 'en-SE' : 'sv-SE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading && configurations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">
          {language === 'en' ? 'Loading configurations...' : 'Laddar konfigurationer...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-thin text-gray-900 dark:text-white">
            {language === 'en' ? 'My PC Configurations' : 'Mina datorkonfigurationer'}
          </h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500 mt-1">
            {language === 'en'
              ? `${total} configuration${total !== 1 ? 's' : ''} saved`
              : `${total} konfiguration${total !== 1 ? 'er' : ''} sparad${total !== 1 ? 'e' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/pc-builder')}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-[0.98] shadow-light-md dark:shadow-dark-md"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'en' ? 'New Configuration' : 'Ny konfiguration'}
        </button>
      </div>

      {/* Filter - Horizontal scrollable on mobile */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
        {(['all', 'saved', 'ordered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold transition-all text-[11px] sm:text-sm whitespace-nowrap active:scale-[0.98] ${
              filterStatus === status
                ? 'bg-primary-600 text-white shadow-light-md dark:shadow-dark-md'
                : 'bg-gray-100 dark:bg-surface-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-surface-700 border border-gray-200 dark:border-surface-700'
            }`}
          >
            {status === 'all'
              ? language === 'en' ? 'All' : 'Alla'
              : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Configurations List */}
      {configurations.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-gray-100 dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-500 dark:text-neutral-400 mb-3 sm:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <p className="text-gray-700 dark:text-neutral-300 text-sm sm:text-lg font-bold mb-1.5 sm:mb-2">
            {language === 'en' ? 'No configurations found' : 'Inga konfigurationer hittades'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mb-3 sm:mb-4 px-4">
            {language === 'en'
              ? 'Start building your custom PC to see it here.'
              : 'Börja bygga din anpassade dator för att se den här.'}
          </p>
          <button
            onClick={() => navigate('/pc-builder')}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all font-bold text-xs sm:text-sm active:scale-[0.98]"
          >
            {language === 'en' ? 'Build a PC' : 'Bygg en dator'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {configurations.map((config) => (
            <div
              key={config.id}
              className="bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 md:p-5 rounded-2xl border border-gray-200 dark:border-surface-700 hover:shadow-light-md dark:hover:shadow-dark-md transition-all cursor-pointer active:scale-[0.99]"
              onClick={() => setSelectedConfig(config)}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {getConfigName(config)}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                    {new Date(config.createdAt).toLocaleDateString(
                      language === 'en' ? 'en-US' : 'sv-SE',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </p>
                </div>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full flex-shrink-0 ${getStatusColor(
                    config.status
                  )}`}
                >
                  {getStatusLabel(config.status)}
                </span>
              </div>

              {/* Price */}
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                {formatPrice(getEffectivePrice(config) + (config.includesBuildService ? (config.buildServiceCharge || 0) : 0), config.currency)}
                {config.includesBuildService && (
                  <span className="text-[10px] sm:text-xs font-normal text-gray-500 dark:text-neutral-400 ml-1.5 sm:ml-2">
                    ({language === 'en' ? 'incl. build service' : 'inkl. byggservice'})
                  </span>
                )}
              </div>

              {/* Component Summary */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 font-medium">
                  {getComponentCount(config)}/12 {language === 'en' ? 'components' : 'komponenter'}
                </span>
                {config.isValid ? (
                  <span className="inline-flex items-center text-[10px] sm:text-xs text-green-400 font-bold">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {language === 'en' ? 'Compatible' : 'Kompatibel'}
                  </span>
                ) : (config.validationErrors?.length || 0) > 0 ? (
                  <span className="inline-flex items-center text-[10px] sm:text-xs text-red-400 font-bold">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {config.validationErrors?.length || 0} {language === 'en' ? 'issue(s)' : 'problem'}
                  </span>
                ) : null}
              </div>

              {/* Actions - Responsive grid on mobile */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {/* Order Button - Show when valid, has required components, and not already ordered */}
                {config.isValid &&
                 (config.validationErrors?.length || 0) === 0 &&
                 hasRequiredComponents(config) &&
                 config.status !== 'ordered' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrder(config);
                    }}
                    className="flex-1 min-w-[80px] px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-[10px] sm:text-sm font-bold flex items-center justify-center gap-1 active:scale-[0.98]"
                    title={language === 'en' ? 'Order' : 'Beställ'}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden xs:inline">{language === 'en' ? 'Order' : 'Beställ'}</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(config.id);
                  }}
                  className={`${config.isValid && (config.validationErrors?.length || 0) === 0 && hasRequiredComponents(config) && config.status !== 'ordered' ? '' : 'flex-1 min-w-[80px]'} px-2 sm:px-3 py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all text-[10px] sm:text-sm font-bold active:scale-[0.98]`}
                >
                  {language === 'en' ? 'Edit' : 'Redigera'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(config.id);
                  }}
                  className="p-1.5 sm:p-2 bg-gray-200 dark:bg-surface-700 text-gray-500 dark:text-neutral-400 rounded-lg hover:bg-gray-300 dark:hover:bg-surface-600 transition-all active:scale-[0.98] border border-gray-300 dark:border-surface-600"
                  title={language === 'en' ? 'Duplicate' : 'Duplicera'}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(config.id);
                  }}
                  className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-[0.98]"
                  title={language === 'en' ? 'Delete' : 'Ta bort'}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(config.id);
                  }}
                  className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-[0.98]"
                  title={language === 'en' ? 'Download PDF' : 'Ladda ner PDF'}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configuration Details Modal - Bottom sheet on mobile */}
      {selectedConfig && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]"
          onClick={() => setSelectedConfig(null)}
        >
          <div
            className="bg-white dark:bg-surface-850 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white dark:bg-surface-850 border-b border-gray-200 dark:border-surface-700 p-3 sm:p-4 md:p-6 z-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-900 dark:text-white truncate">
                  {getConfigName(selectedConfig)}
                </h2>
                <button
                  onClick={() => setSelectedConfig(null)}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-surface-700 rounded-full transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {/* Status and Date */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span
                  className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-sm font-bold rounded-full ${getStatusColor(
                    selectedConfig.status
                  )}`}
                >
                  {getStatusLabel(selectedConfig.status)}
                </span>
                <span className="text-[10px] sm:text-sm text-gray-500 dark:text-neutral-400">
                  {language === 'en' ? 'Created' : 'Skapad'}:{' '}
                  {new Date(selectedConfig.createdAt).toLocaleDateString(
                    language === 'en' ? 'en-US' : 'sv-SE',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>

              {/* Components List */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-2 sm:mb-3">
                  {language === 'en' ? 'Selected Components' : 'Valda komponenter'}
                </h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {Object.entries(selectedConfig.components || {}).map(([type, component]) => {
                    if (!component) return null;

                    // Check if this is a multi-select array type (rams, gpus, ssds, hdds, fans)
                    const isArrayType = Array.isArray(component);
                    const items = isArrayType ? (component as any[]) : [component];

                    // Skip empty arrays
                    if (items.length === 0) return null;

                    return items.map((item: any, idx: number) => {
                      // Skip items without price or name (invalid data)
                      if (!item || typeof item.price !== 'number') return null;

                      return (
                        <div
                          key={`${type}-${idx}`}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-100 dark:bg-surface-800 rounded-lg border border-gray-200 dark:border-surface-700 gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase font-bold">{type}</p>
                            <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                              {language === 'en' ? item.name_en : item.name_sv}
                            </p>
                            {item.quantity && item.quantity > 1 && (
                              <p className="text-[9px] sm:text-xs text-gray-500 dark:text-neutral-400">
                                {language === 'en' ? 'Quantity' : 'Antal'}: {item.quantity}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-gray-800 dark:text-neutral-300 text-xs sm:text-sm flex-shrink-0">
                            {formatPrice(item.price * (item.quantity || 1))}
                          </p>
                        </div>
                      );
                    });
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-100 dark:bg-surface-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-surface-700">
                <div className="flex justify-between mb-1.5 sm:mb-2">
                  <span className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                    {language === 'en' ? 'Components' : 'Komponenter'}
                  </span>
                  <span className="font-bold text-xs sm:text-sm">
                    {formatPrice(getEffectivePrice(selectedConfig))}
                  </span>
                </div>
                {selectedConfig.includesBuildService && (
                  <div className="flex justify-between mb-1.5 sm:mb-2">
                    <span className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
                      {language === 'en' ? 'Build Service' : 'Byggservice'}
                    </span>
                    <span className="font-bold text-xs sm:text-sm">
                      {formatPrice(selectedConfig.buildServiceCharge || 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 sm:pt-3 border-t border-gray-300 dark:border-surface-600">
                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    {language === 'en' ? 'Total' : 'Totalt'}
                  </span>
                  <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {formatPrice(
                      getEffectivePrice(selectedConfig) +
                        (selectedConfig.includesBuildService
                          ? (selectedConfig.buildServiceCharge || 0)
                          : 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Validation Status */}
              {(selectedConfig.validationErrors?.length || 0) > 0 && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-bold text-red-600 dark:text-red-400 text-xs sm:text-sm mb-1.5 sm:mb-2">
                    {language === 'en' ? 'Compatibility Issues' : 'Kompatibilitetsproblem'}
                  </h4>
                  <ul className="text-[10px] sm:text-sm text-red-600 dark:text-red-400 space-y-1">
                    {selectedConfig.validationErrors.map((error, idx) => (
                      <li key={idx}>
                        {language === 'en' ? error.message_en : error.message_sv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 sm:space-y-3">
                {/* Order Button - Only show when valid and has required components */}
                {selectedConfig.isValid &&
                 (selectedConfig.validationErrors?.length || 0) === 0 &&
                 hasRequiredComponents(selectedConfig) &&
                 selectedConfig.status !== 'ordered' && (
                  <button
                    onClick={() => handleOrder(selectedConfig)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {language === 'en' ? 'Order This Configuration' : 'Beställ denna konfiguration'}
                  </button>
                )}

                {/* Already Ordered Notice */}
                {selectedConfig.status === 'ordered' && (
                  <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-bold text-xs sm:text-sm text-center">
                    {language === 'en' ? 'This configuration has been ordered' : 'Denna konfiguration har beställts'}
                  </div>
                )}

                {/* Other Actions - Stack on mobile */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleDelete(selectedConfig.id)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all font-bold text-xs sm:text-sm active:scale-[0.98]"
                  >
                    {language === 'en' ? 'Delete' : 'Ta bort'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(selectedConfig.id)}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-neutral-300 rounded-xl hover:bg-gray-300 dark:hover:bg-surface-600 transition-all font-bold text-xs sm:text-sm active:scale-[0.98] border border-gray-300 dark:border-surface-600"
                  >
                    {language === 'en' ? 'Duplicate' : 'Duplicera'}
                  </button>
                  <button
                    onClick={() => handleEdit(selectedConfig.id)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all font-bold text-xs sm:text-sm active:scale-[0.98]"
                  >
                    {language === 'en' ? 'Edit Configuration' : 'Redigera konfiguration'}
                  </button>
                </div>

                {/* PDF Download */}
                <button
                  onClick={() => handleDownloadPDF(selectedConfig.id)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === 'en' ? 'Download PDF' : 'Ladda ner PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCConfigurationsTab;
