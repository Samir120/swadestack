import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import apiClient from '../../models/api/apiClient';
import { PCConfiguration, ConfigurationStatus, PCTier, PromoteToPreConfiguredRequest, PCBuildServiceOption, BuildServiceSnapshot } from '../../models/types/pcConfiguration.types';
import { FaEye, FaTrash, FaTimes, FaFilter, FaDesktop, FaCheckCircle, FaTimesCircle, FaWrench, FaBolt, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import { preConfiguredPCApi } from '../../models/api/preConfiguredPCApi';
import { pcBuildServiceApi } from '../../models/api/pcBuildServiceApi';
import MultiImageUpload from '../common/MultiImageUpload';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * PC Configurations Manager - Admin Component
 * View and manage user PC configurations
 */

const STATUS_LABELS: Record<ConfigurationStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-surface-700 text-neutral-300' },
  saved: { label: 'Saved', color: 'bg-blue-900/30 text-blue-400' },
  ordered: { label: 'Ordered', color: 'bg-green-900/30 text-green-400' },
};

const PCConfigurationsManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [configurations, setConfigurations] = useState<PCConfiguration[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ConfigurationStatus | ''>('');
  const [selectedConfig, setSelectedConfig] = useState<PCConfiguration | null>(null);
  const [promoteConfig, setPromoteConfig] = useState<PCConfiguration | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [buildServiceOptions, setBuildServiceOptions] = useState<PCBuildServiceOption[]>([]);
  const [promoteForm, setPromoteForm] = useState<PromoteToPreConfiguredRequest & {
    promoteImageUrls: string[];
    selectedBuildServiceId: string;
  }>({
    name_en: '',
    name_sv: '',
    tier: 'core' as PCTier,
    imageUrl: '',
    imageUrls: [],
    promoteImageUrls: [],
    shortDescription_en: '',
    shortDescription_sv: '',
    isFeatured: false,
    displayOrder: 0,
    discountedPrice: undefined,
    includesBuildService: false,
    buildServiceCharge: 0,
    selectedBuildServiceId: '',
  });

  useEffect(() => {
    loadConfigurations();
    loadStats();
    loadBuildServiceOptions();
  }, [filterStatus]);

  const loadBuildServiceOptions = async () => {
    try {
      const response = await pcBuildServiceApi.getAllOptions();
      if (response.success && response.data) {
        setBuildServiceOptions(response.data.options || []);
      }
    } catch (error) {
      console.error('Failed to load build service options:', error);
    }
  };

  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await apiClient.get<any>('/pc-configurations/admin/all', params);
      if (response.success && response.data) {
        setConfigurations(response.data.configurations || []);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get<any>('/pc-configurations/stats/summary');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const openPromoteModal = (config: PCConfiguration) => {
    setPromoteConfig(config);
    // Initialize promoteImageUrls from config - if imageUrls exists use it, otherwise fall back to imageUrl
    const initialImageUrls = config.imageUrls && config.imageUrls.length > 0
      ? config.imageUrls
      : config.imageUrl
        ? [config.imageUrl]
        : [];
    // Initialize build service from config if available
    const selectedBuildServiceId = config.buildServiceSnapshot?.id || '';
    setPromoteForm({
      name_en: config.name_en || '',
      name_sv: config.name_sv || '',
      tier: 'core' as PCTier,
      imageUrl: config.imageUrl || '',
      imageUrls: initialImageUrls,
      promoteImageUrls: initialImageUrls,
      shortDescription_en: '',
      shortDescription_sv: '',
      isFeatured: false,
      displayOrder: 0,
      discountedPrice: undefined,
      includesBuildService: config.includesBuildService || false,
      buildServiceCharge: config.buildServiceCharge || 0,
      selectedBuildServiceId,
    });
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteConfig) return;

    setIsPromoting(true);
    try {
      // Build imageUrls and imageUrl from promoteImageUrls
      const imageUrls = promoteForm.promoteImageUrls || [];
      const imageUrl = imageUrls.length > 0 ? imageUrls[0] : '';

      // Create build service snapshot if build service is selected
      let buildServiceSnapshot: BuildServiceSnapshot | undefined;
      if (promoteForm.includesBuildService && promoteForm.selectedBuildServiceId) {
        const selectedOption = buildServiceOptions.find(opt => opt.id === promoteForm.selectedBuildServiceId);
        if (selectedOption) {
          buildServiceSnapshot = {
            id: selectedOption.id,
            name_en: selectedOption.name_en,
            name_sv: selectedOption.name_sv,
            desc_en: selectedOption.desc_en,
            desc_sv: selectedOption.desc_sv,
            priceType: selectedOption.priceType,
            amount: selectedOption.amount,
            estimatedBuildTime_en: selectedOption.estimatedBuildTime_en,
            estimatedBuildTime_sv: selectedOption.estimatedBuildTime_sv,
            warrantyInfo_en: selectedOption.warrantyInfo_en,
            warrantyInfo_sv: selectedOption.warrantyInfo_sv,
          };
        }
      }

      const submitData: PromoteToPreConfiguredRequest = {
        name_en: promoteForm.name_en,
        name_sv: promoteForm.name_sv,
        tier: promoteForm.tier,
        imageUrl,
        imageUrls,
        shortDescription_en: promoteForm.shortDescription_en,
        shortDescription_sv: promoteForm.shortDescription_sv,
        isFeatured: promoteForm.isFeatured,
        displayOrder: promoteForm.displayOrder,
        discountedPrice: promoteForm.discountedPrice,
        includesBuildService: promoteForm.includesBuildService,
        buildServiceCharge: promoteForm.buildServiceCharge,
        buildServiceSnapshot,
      };

      const response = await preConfiguredPCApi.promote(promoteConfig.id, submitData);
      if (response.success) {
        toast.success('Configuration promoted to pre-configured PC!');
        setPromoteConfig(null);
        loadConfigurations();
      } else {
        toast.error(response.message || 'Failed to promote configuration');
      }
    } catch (error: any) {
      console.error('Failed to promote:', error);
      toast.error(error.message || 'Failed to promote configuration');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Configuration',
      message: 'Are you sure you want to delete this configuration? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await apiClient.delete(`/pc-configurations/${id}`);
      loadConfigurations();
      loadStats();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getComponentCount = (config: PCConfiguration) => {
    return Object.keys(config.components || {}).filter(
      (key) => config.components[key as keyof typeof config.components]
    ).length;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white flex items-center gap-2">
            <FaDesktop className="text-primary-400" size={24} />
            PC Configurations
          </h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">User Build Management</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaDesktop className="text-neutral-500" size={14} />
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Total</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalConfigurations || 0}</p>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaWrench className="text-neutral-500" size={14} />
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Drafts</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-400">{stats.draftCount || 0}</p>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaCheckCircle className="text-blue-400" size={14} />
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Saved</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.savedCount || 0}</p>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaCheckCircle className="text-green-400" size={14} />
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Ordered</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.orderedCount || 0}</p>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary-400">💰</span>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Average Price</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-primary-400">
              {formatPrice(stats.averagePrice || 0)}
            </p>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <FaWrench className="text-purple-400" size={14} />
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">Build Service Adoption</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {Math.round((stats.buildServiceAdoptionRate || 0) * 100)}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-neutral-500" size={14} />
          <span className="text-sm font-medium text-neutral-300">Filter</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ConfigurationStatus | '')}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="saved">Saved</option>
          <option value="ordered">Ordered</option>
        </select>
      </div>

      {/* Configurations List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {configurations.map((config) => (
              <div key={config.id} className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaDesktop className="text-neutral-500" size={16} />
                    <div>
                      <p className="font-bold text-white text-sm">
                        {config.name_en || `Config #${config.id.slice(0, 8)}`}
                      </p>
                      <p className="text-[10px] text-neutral-400">ID: {config.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      STATUS_LABELS[config.status]?.color || 'bg-surface-800 text-neutral-300'
                    }`}
                  >
                    {STATUS_LABELS[config.status]?.label || config.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium">Total Price</p>
                    <p className="text-sm font-bold text-primary-400">{formatPrice(config.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium">Components</p>
                    <p className="text-sm font-bold text-white">{getComponentCount(config)} / 8</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {config.isValid ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <FaCheckCircle size={12} />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <FaTimesCircle size={12} />
                        {config.validationErrors?.length || 0} Errors
                      </span>
                    )}
                    {config.includesBuildService && (
                      <span className="flex items-center gap-1 text-purple-600 text-xs font-medium">
                        <FaWrench size={10} />
                        Build
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500">{formatDate(config.createdAt)}</p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-surface-700">
                  <button
                    onClick={() => setSelectedConfig(config)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-500 active:scale-[0.98] transition"
                  >
                    <FaEye size={12} />
                    View
                  </button>
                  {config.isValid && !config.isPreConfigured && (
                    <button
                      onClick={() => openPromoteModal(config)}
                      className="px-3 py-2 bg-purple-900/20 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-900/30 active:scale-[0.98] transition"
                      title="Promote to Pre-Configured PC"
                    >
                      <FaStar size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="px-3 py-2 bg-red-900/20 text-red-600 rounded-lg text-xs font-bold hover:bg-red-900/30 active:scale-[0.98] transition"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}

            {configurations.length === 0 && (
              <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-8 text-center">
                <FaDesktop className="mx-auto text-neutral-600 mb-3" size={32} />
                <p className="text-neutral-400 text-sm">No configurations found.</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-800 border-b border-surface-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Configuration
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Components
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Valid
                    </th>
                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700">
                  {configurations.map((config) => (
                    <tr key={config.id} className="hover:bg-surface-700">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaDesktop className="text-neutral-500" size={16} />
                          <div>
                            <p className="font-bold text-white text-sm">
                              {config.name_en || `Config #${config.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-neutral-400">ID: {config.id.slice(0, 6)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-white text-sm font-medium">{getComponentCount(config)} / 8</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <p className="font-bold text-primary-400 text-sm">{formatPrice(config.totalPrice)}</p>
                          {config.includesBuildService && (
                            <p className="text-xs text-purple-600 flex items-center gap-1">
                              <FaWrench size={10} />
                              +{formatPrice(config.buildServiceCharge)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full ${
                            STATUS_LABELS[config.status]?.color || 'bg-surface-800 text-neutral-300'
                          }`}
                        >
                          {STATUS_LABELS[config.status]?.label || config.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        {config.isValid ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <FaCheckCircle size={14} />
                            Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <FaTimesCircle size={14} />
                            {config.validationErrors?.length || 0} Errors
                          </span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4 text-sm text-neutral-400">
                        {formatDate(config.createdAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedConfig(config)}
                            className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          {config.isValid && !config.isPreConfigured && (
                            <button
                              onClick={() => openPromoteModal(config)}
                              className="p-2 text-purple-600 hover:bg-purple-900/20 rounded-lg transition"
                              title="Promote to Pre-Configured PC"
                            >
                              <FaStar size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {configurations.length === 0 && (
              <div className="text-center py-12 text-neutral-400">
                <FaDesktop className="mx-auto text-neutral-600 mb-3" size={32} />
                <p>No configurations found.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-0 sm:p-4">
          <div className="bg-surface-900 w-full h-full sm:h-auto sm:rounded-2xl shadow-dark-lg sm:max-w-2xl sm:max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 p-4 sm:p-6 border-b border-surface-700 flex justify-between items-center z-10 sm:rounded-t-xl">
              <div className="flex items-center gap-2">
                <FaDesktop className="text-primary-400" size={20} />
                <h3 className="text-xl sm:text-2xl font-thin text-white">Configuration Details</h3>
              </div>
              <button
                onClick={() => setSelectedConfig(null)}
                className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-surface-800 p-3 rounded-lg">
                  <p className="text-xs text-neutral-400 font-medium">Status</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-bold rounded-full ${
                      STATUS_LABELS[selectedConfig.status]?.color
                    }`}
                  >
                    {STATUS_LABELS[selectedConfig.status]?.label}
                  </span>
                </div>
                <div className="bg-surface-800 p-3 rounded-lg">
                  <p className="text-xs text-neutral-400 font-medium">Validity</p>
                  <p className={`mt-1 font-bold flex items-center gap-1 ${selectedConfig.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedConfig.isValid ? (
                      <><FaCheckCircle size={14} /> Valid</>
                    ) : (
                      <><FaTimesCircle size={14} /> {selectedConfig.validationErrors?.length || 0} Errors</>
                    )}
                  </p>
                </div>
                <div className="bg-surface-800 p-3 rounded-lg">
                  <p className="text-xs text-neutral-400 font-medium">Total Price</p>
                  <p className="mt-1 font-bold text-primary-400">{formatPrice(selectedConfig.totalPrice)}</p>
                </div>
                <div className="bg-surface-800 p-3 rounded-lg">
                  <p className="text-xs text-neutral-400 font-medium">Build Service</p>
                  <p className={`mt-1 font-bold flex items-center gap-1 ${selectedConfig.includesBuildService ? 'text-purple-600' : 'text-neutral-400'}`}>
                    {selectedConfig.includesBuildService ? (
                      <><FaWrench size={12} /> +{formatPrice(selectedConfig.buildServiceCharge)}</>
                    ) : (
                      'DIY'
                    )}
                  </p>
                </div>
              </div>

              {/* Components */}
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <FaDesktop className="text-neutral-500" size={14} />
                  Selected Components
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedConfig.components || {}).map(([type, component]) => (
                    component && (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 bg-surface-800 rounded-lg"
                      >
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase font-bold">{type}</p>
                          <p className="font-bold text-white text-sm">
                            {(component as any).name_en || 'Unknown'}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {(component as any).manufacturer}
                          </p>
                        </div>
                        <p className="font-bold text-primary-400 text-sm">{formatPrice((component as any).price || 0)}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Validation Errors */}
              {selectedConfig.validationErrors && selectedConfig.validationErrors.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                    <FaTimesCircle size={14} />
                    Validation Errors
                  </h4>
                  <div className="space-y-2">
                    {selectedConfig.validationErrors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400 font-medium">{error.message_en}</p>
                        <p className="text-xs text-red-400 mt-1">{error.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {selectedConfig.validationWarnings && selectedConfig.validationWarnings.length > 0 && (
                <div>
                  <h4 className="font-bold text-yellow-600 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle size={14} />
                    Validation Warnings
                  </h4>
                  <div className="space-y-2">
                    {selectedConfig.validationWarnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400 font-medium">{warning.message_en}</p>
                        <p className="text-xs text-yellow-400 mt-1">{warning.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Power Summary */}
              {selectedConfig.powerSummary && (
                <div>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <FaBolt className="text-primary-400" size={14} />
                    Power Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-800 rounded-lg">
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Total Draw</p>
                      <p className="font-bold text-white">{selectedConfig.powerSummary.totalDraw}W</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">PSU Capacity</p>
                      <p className="font-bold text-white">{selectedConfig.powerSummary.psuWattage}W</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Headroom</p>
                      <p className={`font-bold ${selectedConfig.powerSummary.headroom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedConfig.powerSummary.headroom}W ({Math.round(selectedConfig.powerSummary.headroomPercentage ?? 0)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">Recommended</p>
                      <p className="font-bold text-white">{selectedConfig.powerSummary.recommendedWattage}W</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 p-4 sm:p-6 border-t border-surface-700 sm:rounded-b-xl">
              <button
                onClick={() => setSelectedConfig(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-surface-800 text-neutral-300 rounded-lg hover:bg-surface-700 font-bold text-sm active:scale-[0.98] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {promoteConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-0 sm:p-4">
          <div className="bg-surface-900 w-full h-full sm:h-auto sm:rounded-2xl shadow-dark-lg sm:max-w-2xl sm:max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-surface-900 p-4 sm:p-6 border-b border-surface-700 flex justify-between items-center z-10 sm:rounded-t-xl">
              <div className="flex items-center gap-2">
                <FaStar className="text-purple-500" size={20} />
                <h3 className="text-xl sm:text-2xl font-thin text-white">Promote to Pre-Configured PC</h3>
              </div>
              <button
                onClick={() => setPromoteConfig(null)}
                className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePromote} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Configuration Info */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-400">
                  <strong>Configuration:</strong> {promoteConfig.name_en || `Config #${promoteConfig.id.slice(0, 8)}`}
                </p>
                <p className="text-sm text-purple-600">
                  <strong>Price:</strong> {formatPrice(promoteConfig.totalPrice)}
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={promoteForm.name_en}
                    onChange={(e) => setPromoteForm({ ...promoteForm, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Gaming Pro PC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Name (Swedish) *</label>
                  <input
                    type="text"
                    required
                    value={promoteForm.name_sv}
                    onChange={(e) => setPromoteForm({ ...promoteForm, name_sv: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Gaming Pro Dator"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Short Description (English)</label>
                  <textarea
                    value={promoteForm.shortDescription_en}
                    onChange={(e) => setPromoteForm({ ...promoteForm, shortDescription_en: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Perfect for gaming and content creation"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Short Description (Swedish)</label>
                  <textarea
                    value={promoteForm.shortDescription_sv}
                    onChange={(e) => setPromoteForm({ ...promoteForm, shortDescription_sv: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Perfekt för gaming och innehållsskapande"
                    rows={2}
                  />
                </div>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Tier *</label>
                <select
                  required
                  value={promoteForm.tier}
                  onChange={(e) => setPromoteForm({ ...promoteForm, tier: e.target.value as PCTier })}
                  className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="core">Core (Entry Level)</option>
                  <option value="pro">Pro (Mid-Range)</option>
                  <option value="ultra">Ultra (High-End)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Multi-Image Upload */}
              <MultiImageUpload
                images={promoteForm.promoteImageUrls || []}
                onImagesChange={(images) => setPromoteForm({ ...promoteForm, promoteImageUrls: images })}
                maxImages={10}
                label="PC Images"
              />

              {/* Discounted Price */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Discounted Price (SEK)</label>
                <input
                  type="number"
                  value={promoteForm.discountedPrice || ''}
                  onChange={(e) => setPromoteForm({ ...promoteForm, discountedPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Leave empty for no discount"
                  min={0}
                />
                <p className="text-xs text-neutral-400 mt-1">Original price: {formatPrice(promoteConfig.totalPrice)}</p>
              </div>

              {/* Build Service Section */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeBuildService"
                    checked={promoteForm.includesBuildService}
                    onChange={(e) => setPromoteForm({ ...promoteForm, includesBuildService: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-surface-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="includeBuildService" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <FaWrench className="text-purple-500" size={14} />
                    Include Build Service
                  </label>
                </div>

                {promoteForm.includesBuildService && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Build Service Option</label>
                      <select
                        value={promoteForm.selectedBuildServiceId}
                        onChange={(e) => {
                          const selectedOption = buildServiceOptions.find(opt => opt.id === e.target.value);
                          setPromoteForm({
                            ...promoteForm,
                            selectedBuildServiceId: e.target.value,
                            buildServiceCharge: selectedOption
                              ? selectedOption.priceType === 'fixed'
                                ? selectedOption.amount
                                : Math.round(promoteConfig.totalPrice * (selectedOption.amount / 100))
                              : 0,
                          });
                        }}
                        className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select a build service...</option>
                        {buildServiceOptions.filter(opt => opt.isActive).map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name_en} ({option.priceType === 'fixed' ? formatPrice(option.amount) : `${option.amount}%`})
                          </option>
                        ))}
                      </select>
                    </div>

                    {promoteForm.selectedBuildServiceId && (
                      <div className="text-sm text-purple-400 bg-surface-800 p-3 rounded-lg">
                        {(() => {
                          const selectedOption = buildServiceOptions.find(opt => opt.id === promoteForm.selectedBuildServiceId);
                          if (!selectedOption) return null;
                          return (
                            <>
                              {selectedOption.desc_en && <p className="mb-2">{selectedOption.desc_en}</p>}
                              <p className="font-bold">
                                Build Service Charge: {formatPrice(promoteForm.buildServiceCharge || 0)}
                              </p>
                              {selectedOption.estimatedBuildTime_en && (
                                <p className="text-xs mt-1">Build Time: {selectedOption.estimatedBuildTime_en}</p>
                              )}
                              {selectedOption.warrantyInfo_en && (
                                <p className="text-xs">Warranty: {selectedOption.warrantyInfo_en}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={promoteForm.displayOrder || 0}
                  onChange={(e) => setPromoteForm({ ...promoteForm, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0"
                  min={0}
                />
                <p className="text-xs text-neutral-400 mt-1">Lower numbers appear first</p>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={promoteForm.isFeatured}
                  onChange={(e) => setPromoteForm({ ...promoteForm, isFeatured: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-surface-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-neutral-300">
                  Featured on Home Page
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface-800 p-4 sm:p-6 border-t border-surface-700 flex gap-3 sm:rounded-b-xl">
              <button
                type="button"
                onClick={() => setPromoteConfig(null)}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-surface-800 text-neutral-300 rounded-lg hover:bg-surface-700 font-bold text-sm active:scale-[0.98] transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePromote}
                disabled={isPromoting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-sm active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPromoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Promoting...
                  </>
                ) : (
                  <>
                    <FaStar size={14} />
                    Promote
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCConfigurationsManager;
