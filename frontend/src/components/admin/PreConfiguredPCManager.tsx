import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { preConfiguredPCApi } from '../../models/api/preConfiguredPCApi';
import { pcBuildServiceApi } from '../../models/api/pcBuildServiceApi';
import { PCConfiguration, PCTier, PreConfiguredStats, UpdatePreConfiguredPCRequest, PCBuildServiceOption, BuildServiceSnapshot } from '../../models/types/pcConfiguration.types';
import AdminPriceDisplay, { formatAdminCurrency } from './common/AdminPriceDisplay';
import AdminPriceInput from './common/AdminPriceInput';
import { FaDesktop, FaPlus, FaEdit, FaTrash, FaStar, FaRegStar, FaTimes, FaExternalLinkAlt, FaImage, FaWrench } from 'react-icons/fa';
import MultiImageUpload from '../common/MultiImageUpload';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Pre-Configured PC Manager - Admin Component
 * Create, edit, and manage pre-configured PCs for sale
 */

// Tier configuration
const TIER_OPTIONS: { value: PCTier; label: string; color: string }[] = [
  { value: 'core', label: 'Core', color: 'bg-green-900/30 text-green-400' },
  { value: 'pro', label: 'Pro', color: 'bg-blue-900/30 text-blue-400' },
  { value: 'ultra', label: 'Ultra', color: 'bg-purple-900/30 text-purple-400' },
  { value: 'custom', label: 'Custom', color: 'bg-primary-600/20 text-primary-400' },
];

const PreConfiguredPCManager: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [configurations, setConfigurations] = useState<PCConfiguration[]>([]);
  const [stats, setStats] = useState<PreConfiguredStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<PCConfiguration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [buildServiceOptions, setBuildServiceOptions] = useState<PCBuildServiceOption[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdatePreConfiguredPCRequest & {
    imageFile?: string;
    editImageUrls: string[];
    selectedBuildServiceId: string;
  }>({
    editImageUrls: [],
    selectedBuildServiceId: '',
  });

  // Load data
  useEffect(() => {
    loadConfigurations();
    loadStats();
    loadBuildServiceOptions();
  }, []);

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
      const response = await preConfiguredPCApi.adminGetAll();
      if (response.success && response.data) {
        setConfigurations(response.data.configurations);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
      toast.error('Failed to load pre-configured PCs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await preConfiguredPCApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await preConfiguredPCApi.toggleFeatured(id);
      if (response.success) {
        toast.success('Featured status updated');
        loadConfigurations();
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Pre-Configured PC',
      message: 'Are you sure you want to delete this pre-configured PC? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await preConfiguredPCApi.delete(id);
      if (response.success) {
        toast.success('Pre-configured PC deleted');
        loadConfigurations();
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to delete pre-configured PC');
    }
  };

  // Generate key specs string from components (same logic as PreConfiguredPCCard)
  const generateSpecsSummary = (config: PCConfiguration, lang: 'en' | 'sv'): string => {
    const specs: string[] = [];
    const comps = config.components;
    if (!comps) return '';

    if (comps.cpu) {
      const cpuName = lang === 'en' ? comps.cpu.name_en : comps.cpu.name_sv;
      const short = cpuName?.split(' ').slice(0, 4).join(' ') || '';
      if (short) specs.push(short);
    }
    if (comps.gpus && comps.gpus.length > 0) {
      const gpuName = lang === 'en' ? comps.gpus[0].name_en : comps.gpus[0].name_sv;
      const short = gpuName?.split(' ').slice(0, 3).join(' ') || '';
      if (short) specs.push(short);
    }
    if (comps.rams && comps.rams.length > 0) {
      const totalRam = comps.rams.reduce((sum: number, ram: any) => {
        const cap = (ram.specifications as any)?.capacity || 0;
        return sum + cap;
      }, 0);
      if (totalRam > 0) specs.push(`${totalRam}GB RAM`);
    }
    let totalStorage = 0;
    let storageType = 'SSD';
    if (comps.ssds && comps.ssds.length > 0) {
      comps.ssds.forEach((ssd: any) => { totalStorage += (ssd.specifications as any)?.capacity || 0; });
    }
    if (comps.hdds && comps.hdds.length > 0) {
      comps.hdds.forEach((hdd: any) => { totalStorage += (hdd.specifications as any)?.capacity || 0; });
      if (!comps.ssds?.length) storageType = 'HDD';
    }
    if (totalStorage > 0) {
      const str = totalStorage >= 1000 ? `${totalStorage / 1000}TB` : `${totalStorage}GB`;
      specs.push(`${str} ${storageType}`);
    }
    return specs.join(' \u00B7 ');
  };

  // Open edit modal
  const handleOpenEdit = (config: PCConfiguration) => {
    setSelectedConfig(config);
    // Initialize imageUrls from config - if imageUrls exists use it, otherwise fall back to imageUrl
    const initialImageUrls = config.imageUrls && config.imageUrls.length > 0
      ? config.imageUrls
      : config.imageUrl
        ? [config.imageUrl]
        : [];
    // Get selected build service ID from snapshot
    const selectedBuildServiceId = config.buildServiceSnapshot?.id || '';

    // Auto-generate specs if descriptions are empty
    const specsEn = generateSpecsSummary(config, 'en');
    const specsSv = generateSpecsSummary(config, 'sv');

    setEditForm({
      name_en: config.name_en,
      name_sv: config.name_sv,
      totalPrice: config.totalPrice,
      discountedPrice: config.discountedPrice,
      tier: config.tier,
      imageUrl: config.imageUrl,
      imageFile: '',
      editImageUrls: initialImageUrls,
      shortDescription_en: config.shortDescription_en || specsEn,
      shortDescription_sv: config.shortDescription_sv || specsSv,
      isFeatured: config.isFeatured,
      displayOrder: config.displayOrder,
      includesBuildService: config.includesBuildService,
      buildServiceCharge: config.buildServiceCharge,
      selectedBuildServiceId,
      stock: config.stock || 0,
    });
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedConfig) return;

    try {
      // Build imageUrls and imageUrl from editImageUrls
      const imageUrls = editForm.editImageUrls || [];
      const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

      // Create build service snapshot if build service is selected
      let buildServiceSnapshot: BuildServiceSnapshot | null = null;
      if (editForm.includesBuildService && editForm.selectedBuildServiceId) {
        const selectedOption = buildServiceOptions.find(opt => opt.id === editForm.selectedBuildServiceId);
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

      const submitData: UpdatePreConfiguredPCRequest = {
        name_en: editForm.name_en,
        name_sv: editForm.name_sv,
        totalPrice: editForm.totalPrice,
        discountedPrice: editForm.discountedPrice,
        tier: editForm.tier,
        imageUrl,
        imageUrls,
        shortDescription_en: editForm.shortDescription_en,
        shortDescription_sv: editForm.shortDescription_sv,
        isFeatured: editForm.isFeatured,
        displayOrder: editForm.displayOrder,
        includesBuildService: editForm.includesBuildService,
        buildServiceCharge: editForm.buildServiceCharge,
        buildServiceSnapshot,
        stock: editForm.stock,
      };

      const response = await preConfiguredPCApi.update(selectedConfig.id, submitData);
      if (response.success) {
        toast.success('Pre-configured PC updated');
        setIsEditModalOpen(false);
        loadConfigurations();
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to update pre-configured PC');
    }
  };

  const formatPrice = formatAdminCurrency;

  // Get tier color
  const getTierColor = (tier?: PCTier) => {
    if (!tier) return 'bg-neutral-800 text-neutral-400';
    return TIER_OPTIONS.find(t => t.value === tier)?.color || 'bg-neutral-800 text-neutral-400';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-4xl font-thin text-white flex items-center gap-2">
            <FaDesktop className="text-primary-400 shrink-0" />
            Pre-Configured PCs
          </h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage Pre-Built PCs</p>
        </div>
        <button
          onClick={() => navigate('/pc-builder')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-colors"
        >
          <FaPlus size={14} />
          <span className="hidden sm:inline">Create in PC Builder</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-surface-850 rounded-xl border border-surface-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-surface-850 rounded-xl border border-surface-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">Featured</p>
            <p className="text-xl sm:text-2xl font-bold text-primary-400">{stats.featured}</p>
          </div>
          <div className="bg-surface-850 rounded-xl border border-surface-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">Avg. Price</p>
            <AdminPriceDisplay price={stats.averagePrice} primaryClassName="text-xl sm:text-2xl font-bold text-green-400" />
          </div>
          <div className="bg-surface-850 rounded-xl border border-surface-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">By Tier</p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {Object.entries(stats.byTier).map(([tier, count]) => (
                count > 0 && (
                  <span key={tier} className={`px-2 py-0.5 text-xs font-bold rounded ${getTierColor(tier as PCTier)}`}>
                    {tier}: {count}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 sm:p-4 mb-6">
        <p className="text-blue-300 text-xs sm:text-sm">
          <strong>How to create a pre-configured PC:</strong> First, create a PC configuration using the PC Builder.
          Then, from the PC Configurations manager, you can "Promote" it to a pre-configured PC for sale.
        </p>
      </div>

      {/* Configurations List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="sm" />
        </div>
      ) : configurations.length === 0 ? (
        <div className="bg-surface-850 rounded-xl border border-surface-700 p-6 sm:p-8 text-center">
          <FaDesktop className="mx-auto text-neutral-600 mb-3" size={48} />
          <p className="text-neutral-400 mb-4">No pre-configured PCs yet</p>
          <button
            onClick={() => navigate('/pc-builder')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-colors"
          >
            Create Your First
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {configurations.map((config) => (
            <div
              key={config.id}
              className="bg-surface-850 rounded-xl border border-surface-700 overflow-hidden hover:border-primary-400 transition-colors flex sm:flex-col"
            >
              {/* Image */}
              <div className="w-28 shrink-0 sm:w-auto aspect-square sm:aspect-video bg-surface-800 relative">
                {(config.imageUrls && config.imageUrls.length > 0) || config.imageUrl ? (
                  <>
                    <img
                      src={(config.imageUrls && config.imageUrls.length > 0) ? config.imageUrls[0] : config.imageUrl}
                      alt={config.name_en || 'PC'}
                      className="w-full h-full object-contain p-2 sm:p-4"
                    />
                    {/* Image count badge */}
                    {config.imageUrls && config.imageUrls.length > 1 && (
                      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black bg-opacity-60 text-white text-[10px] sm:text-xs rounded-full flex items-center gap-1">
                        <FaImage size={8} className="sm:hidden" />
                        <FaImage size={10} className="hidden sm:block" />
                        {config.imageUrls.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaDesktop className="text-neutral-600 text-2xl sm:text-5xl" />
                  </div>
                )}

                {/* Featured Badge */}
                {config.isFeatured && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary-600 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                      <FaStar size={8} className="sm:hidden" />
                      <FaStar size={10} className="hidden sm:block" />
                      <span className="hidden sm:inline">Featured</span>
                    </span>
                  </div>
                )}

                {/* Tier Badge */}
                {config.tier && (
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full ${getTierColor(config.tier)}`}>
                      {config.tier.charAt(0).toUpperCase() + config.tier.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col">
                <h3 className="font-bold text-white mb-0.5 sm:mb-1 truncate text-sm sm:text-base">
                  {config.name_en || `Config #${config.id.slice(0, 8)}`}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                  {config.shortDescription_en || 'No description'}
                </p>

                {/* Price - includes build service if applicable */}
                {(() => {
                  const hasDiscount = config.discountedPrice && config.discountedPrice < config.totalPrice;
                  const componentPrice = hasDiscount ? config.discountedPrice : config.totalPrice;
                  const buildServiceCharge = config.includesBuildService ? (config.buildServiceCharge || 0) : 0;
                  const grandTotal = (componentPrice || 0) + buildServiceCharge;
                  const originalTotal = config.totalPrice + buildServiceCharge;

                  return (
                    <div className="mb-2 sm:mb-4">
                      <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                        {hasDiscount ? (
                          <>
                            <span className="text-neutral-500 line-through text-xs sm:text-sm">{formatPrice(originalTotal)}</span>
                            <AdminPriceDisplay price={grandTotal} primaryClassName="text-red-400 font-bold text-sm sm:text-lg" />
                          </>
                        ) : (
                          <AdminPriceDisplay price={grandTotal} primaryClassName="text-white font-bold text-sm sm:text-lg" />
                        )}
                      </div>
                      {config.includesBuildService && (
                        <p className="text-purple-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1">
                          <FaWrench size={8} className="shrink-0" />
                          <span className="sm:hidden">+{formatPrice(buildServiceCharge)}</span>
                          <span className="hidden sm:inline">Build service: +{formatPrice(buildServiceCharge)}</span>
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2 mt-auto">
                  <button
                    onClick={() => handleToggleFeatured(config.id)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      config.isFeatured
                        ? 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/30'
                        : 'bg-surface-800 text-neutral-400 hover:bg-surface-700'
                    }`}
                    title={config.isFeatured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {config.isFeatured ? <FaStar size={12} className="sm:hidden" /> : <FaRegStar size={12} className="sm:hidden" />}
                    {config.isFeatured ? <FaStar size={14} className="hidden sm:block" /> : <FaRegStar size={14} className="hidden sm:block" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(config)}
                    className="p-1.5 sm:p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/40 transition-colors"
                    title="Edit"
                  >
                    <FaEdit size={12} className="sm:hidden" />
                    <FaEdit size={14} className="hidden sm:block" />
                  </button>
                  <a
                    href={`/pre-configured-pcs/${config.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 bg-surface-800 text-neutral-400 rounded-lg hover:bg-surface-700 transition-colors"
                    title="View"
                  >
                    <FaExternalLinkAlt size={12} className="sm:hidden" />
                    <FaExternalLinkAlt size={14} className="hidden sm:block" />
                  </a>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="p-1.5 sm:p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/40 transition-colors ml-auto"
                    title="Delete"
                  >
                    <FaTrash size={12} className="sm:hidden" />
                    <FaTrash size={14} className="hidden sm:block" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-900 rounded-xl shadow-dark-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface-900 p-4 border-b border-surface-700 flex justify-between items-center">
              <h3 className="text-base sm:text-xl font-bold text-white">Edit Pre-Configured PC</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-surface-700 rounded-lg"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name EN */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Name (English)</label>
                <input
                  type="text"
                  value={editForm.name_en || ''}
                  onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              {/* Name SV */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Name (Swedish)</label>
                <input
                  type="text"
                  value={editForm.name_sv || ''}
                  onChange={(e) => setEditForm({ ...editForm, name_sv: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              {/* Short Description EN */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Short Description (English)</label>
                <textarea
                  value={editForm.shortDescription_en || ''}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription_en: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              {/* Short Description SV */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Short Description (Swedish)</label>
                <textarea
                  value={editForm.shortDescription_sv || ''}
                  onChange={(e) => setEditForm({ ...editForm, shortDescription_sv: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              {/* Multi-Image Upload */}
              <MultiImageUpload
                images={editForm.editImageUrls || []}
                onImagesChange={(images) => setEditForm({ ...editForm, editImageUrls: images })}
                maxImages={10}
              />

              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Tier</label>
                <select
                  value={editForm.tier || ''}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as PCTier || undefined })}
                  className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                >
                  <option value="">No Tier</option>
                  {TIER_OPTIONS.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <AdminPriceInput
                  label="Price"
                  value={editForm.totalPrice || ''}
                  onChange={(v) => setEditForm({ ...editForm, totalPrice: parseFloat(v) || undefined })}
                  labelClassName="block text-sm font-medium text-neutral-300 mb-1"
                  inputClassName="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
                <AdminPriceInput
                  label="Discounted Price"
                  value={editForm.discountedPrice || ''}
                  onChange={(v) => setEditForm({ ...editForm, discountedPrice: parseFloat(v) || undefined })}
                  placeholder="Optional"
                  labelClassName="block text-sm font-medium text-neutral-300 mb-1"
                  inputClassName="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>

              {/* Stock & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editForm.stock ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    min={0}
                  />
                  <p className="text-xs text-neutral-400 mt-1">Units available for sale</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editForm.displayOrder || 0}
                    onChange={(e) => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    min={0}
                  />
                  <p className="text-xs text-neutral-400 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={editForm.isFeatured || false}
                  onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-primary-400 border-surface-600 rounded focus:ring-primary-500/50"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium text-neutral-300">
                  Featured on Home Page
                </label>
              </div>

              {/* Build Service Section */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeBuildServiceEdit"
                    checked={editForm.includesBuildService || false}
                    onChange={(e) => setEditForm({ ...editForm, includesBuildService: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-surface-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="includeBuildServiceEdit" className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <FaWrench className="text-purple-500" size={14} />
                    Include Build Service
                  </label>
                </div>

                {editForm.includesBuildService && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">Build Service Option</label>
                      <select
                        value={editForm.selectedBuildServiceId || ''}
                        onChange={(e) => {
                          const selectedOption = buildServiceOptions.find(opt => opt.id === e.target.value);
                          const totalPrice = editForm.totalPrice || selectedConfig?.totalPrice || 0;
                          setEditForm({
                            ...editForm,
                            selectedBuildServiceId: e.target.value,
                            buildServiceCharge: selectedOption
                              ? selectedOption.priceType === 'fixed'
                                ? selectedOption.amount
                                : Math.round(totalPrice * (selectedOption.amount / 100))
                              : 0,
                          });
                        }}
                        className="w-full px-3 py-2 bg-surface-800 text-white border border-surface-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select a build service...</option>
                        {buildServiceOptions.filter(opt => opt.isActive).map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name_en} ({option.priceType === 'fixed' ? formatPrice(option.amount) : `${option.amount}%`})
                          </option>
                        ))}
                      </select>
                    </div>

                    {editForm.selectedBuildServiceId && (
                      <div className="text-sm text-purple-400 bg-surface-800 p-3 rounded-lg">
                        {(() => {
                          const selectedOption = buildServiceOptions.find(opt => opt.id === editForm.selectedBuildServiceId);
                          if (!selectedOption) return null;
                          return (
                            <>
                              {selectedOption.desc_en && <p className="mb-2">{selectedOption.desc_en}</p>}
                              <p className="font-bold">
                                Build Service Charge: {formatPrice(editForm.buildServiceCharge || 0)}
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
            </div>

            <div className="sticky bottom-0 bg-surface-800 p-4 border-t border-surface-700 flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-surface-600 text-neutral-300 rounded-lg font-bold hover:bg-surface-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreConfiguredPCManager;
