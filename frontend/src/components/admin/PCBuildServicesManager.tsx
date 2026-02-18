import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { pcBuildServiceApi } from '../../models/api/pcBuildServiceApi';
import {
  PCBuildServiceOption,
  CreateBuildServiceOptionDTO,
} from '../../models/types/pcConfiguration.types';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaWrench, FaStar, FaPercent, FaMoneyBillWave, FaClock, FaShieldAlt, FaChartBar } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * PC Build Services Manager - Admin Component
 * Manage build service options and pricing
 */

const PCBuildServicesManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [options, setOptions] = useState<PCBuildServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOption, setEditingOption] = useState<PCBuildServiceOption | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBuildServiceOptionDTO>({
    name_en: '',
    name_sv: '',
    desc_en: '',
    desc_sv: '',
    priceType: 'fixed',
    amount: 0,
    estimatedBuildTime_en: '',
    estimatedBuildTime_sv: '',
    warrantyInfo_en: '',
    warrantyInfo_sv: '',
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setIsLoading(true);
    try {
      const response = await pcBuildServiceApi.getAllOptions();
      if (response.success && response.data) {
        setOptions(response.data.options);
      }
    } catch (error) {
      console.error('Failed to load build service options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOption(null);
    setFormData({
      name_en: '',
      name_sv: '',
      desc_en: '',
      desc_sv: '',
      priceType: 'fixed',
      amount: 0,
      estimatedBuildTime_en: '',
      estimatedBuildTime_sv: '',
      warrantyInfo_en: '',
      warrantyInfo_sv: '',
      isActive: true,
      isDefault: false,
    });
    setShowModal(true);
  };

  const handleEdit = (option: PCBuildServiceOption) => {
    setEditingOption(option);
    setFormData({
      name_en: option.name_en,
      name_sv: option.name_sv,
      desc_en: option.desc_en || '',
      desc_sv: option.desc_sv || '',
      priceType: option.priceType,
      amount: option.amount,
      estimatedBuildTime_en: option.estimatedBuildTime_en || '',
      estimatedBuildTime_sv: option.estimatedBuildTime_sv || '',
      warrantyInfo_en: option.warrantyInfo_en || '',
      warrantyInfo_sv: option.warrantyInfo_sv || '',
      isActive: option.isActive,
      isDefault: option.isDefault,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOption) {
        await pcBuildServiceApi.update(editingOption.id, { id: editingOption.id, ...formData });
      } else {
        await pcBuildServiceApi.create(formData);
      }
      setShowModal(false);
      loadOptions();
    } catch (error) {
      console.error('Failed to save option:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Build Service',
      message: 'Are you sure you want to delete this build service option? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await pcBuildServiceApi.delete(id);
      loadOptions();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await pcBuildServiceApi.toggleActive(id);
      loadOptions();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await pcBuildServiceApi.setDefault(id);
      loadOptions();
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateExampleCharge = (option: PCBuildServiceOption, componentTotal: number) => {
    if (option.priceType === 'fixed') {
      return option.amount;
    }
    return Math.round((componentTotal * option.amount) / 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white flex items-center gap-2">
            <FaWrench className="text-primary-400" size={24} />
            Build Service Options
          </h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage professional PC build service pricing</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} /> Add Option
        </button>
      </div>

      {/* Build Services List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <LoadingSpinner />
          <div className="text-neutral-400 text-sm">Loading build services...</div>
        </div>
      ) : (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
          {options.length === 0 ? (
            <div className="px-4 py-8 text-center text-neutral-400 text-sm">
              <FaWrench className="mx-auto text-neutral-600 mb-3" size={32} />
              <p>No build service options found. Add your first option to get started.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-surface-700">
                {options.map((option) => (
                  <div key={option.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaWrench className="text-neutral-500" size={16} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{option.name_en}</h3>
                            {option.isDefault && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary-600/20 text-primary-400 rounded-full">
                                <FaStar size={8} /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{option.desc_en}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(option.id)}
                        className="active:scale-95 transition"
                      >
                        {option.isActive ? (
                          <FaToggleOn size={22} className="text-green-500" />
                        ) : (
                          <FaToggleOff size={22} className="text-neutral-500" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-medium">Price Type</p>
                        <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 text-xs font-bold rounded ${
                          option.priceType === 'fixed'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-purple-900/30 text-purple-400'
                        }`}>
                          {option.priceType === 'fixed' ? (
                            <><FaMoneyBillWave size={10} /> Fixed</>
                          ) : (
                            <><FaPercent size={10} /> Percentage</>
                          )}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-medium">Amount</p>
                        <p className="text-sm font-bold text-primary-400">
                          {option.priceType === 'fixed' ? formatPrice(option.amount) : `${option.amount}%`}
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-800 rounded-lg p-2 mb-3">
                      <p className="text-[10px] text-neutral-400 font-medium mb-1">Example (25,000 SEK build)</p>
                      <p className="text-sm font-bold text-white">+{formatPrice(calculateExampleCharge(option, 25000))}</p>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-surface-700">
                      {!option.isDefault && (
                        <button
                          onClick={() => handleSetDefault(option.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600/10 text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-600/20 active:scale-[0.98] transition"
                        >
                          <FaStar size={10} /> Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(option)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-800 text-neutral-300 rounded-lg text-xs font-bold hover:bg-surface-700 active:scale-[0.98] transition"
                      >
                        <FaEdit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="px-3 py-2 bg-red-900/20 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 active:scale-[0.98] transition"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-800 border-b border-surface-700">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Example (25k)
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {options.map((option) => (
                      <tr key={option.id} className="hover:bg-surface-700">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaWrench className="text-neutral-500" size={16} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-sm">{option.name_en}</p>
                                {option.isDefault && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-primary-600/20 text-primary-400 rounded-full">
                                    <FaStar size={10} /> Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 max-w-[200px]">{option.desc_en}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${
                            option.priceType === 'fixed'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-purple-900/30 text-purple-400'
                          }`}>
                            {option.priceType === 'fixed' ? (
                              <><FaMoneyBillWave size={10} /> Fixed</>
                            ) : (
                              <><FaPercent size={10} /> %</>
                            )}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className="font-bold text-primary-400">
                            {option.priceType === 'fixed' ? formatPrice(option.amount) : `${option.amount}%`}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-4 lg:px-6 py-4 text-neutral-400 text-sm">
                          +{formatPrice(calculateExampleCharge(option, 25000))}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(option.id)}
                            className="flex items-center gap-1.5 active:scale-95 transition"
                          >
                            {option.isActive ? (
                              <>
                                <FaToggleOn size={20} className="text-green-500" />
                                <span className="text-xs font-medium text-green-400">Active</span>
                              </>
                            ) : (
                              <>
                                <FaToggleOff size={20} className="text-neutral-500" />
                                <span className="text-xs font-medium text-neutral-400">Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!option.isDefault && (
                              <button
                                onClick={() => handleSetDefault(option.id)}
                                className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                                title="Set as Default"
                              >
                                <FaStar size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(option)}
                              className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(option.id)}
                              className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg transition"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Price Comparison Card */}
      {options.length > 0 && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <FaChartBar className="text-primary-400" size={18} />
            <h3 className="font-bold text-white text-sm sm:text-base">Price Comparison</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mb-3 sm:mb-4">
            Service charge for different component totals:
          </p>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="text-left py-2 pr-4 font-medium text-neutral-300">Service</th>
                  <th className="text-right py-2 px-4 font-medium text-neutral-300">15,000 SEK</th>
                  <th className="text-right py-2 px-4 font-medium text-neutral-300">25,000 SEK</th>
                  <th className="text-right py-2 px-4 font-medium text-neutral-300">40,000 SEK</th>
                  <th className="text-right py-2 pl-4 font-medium text-neutral-300">60,000 SEK</th>
                </tr>
              </thead>
              <tbody>
                {options
                  .filter((opt) => opt.isActive)
                  .map((option) => (
                    <tr key={option.id} className="border-b border-surface-700">
                      <td className="py-2 pr-4 text-white font-medium">{option.name_en}</td>
                      <td className="py-2 px-4 text-right text-primary-400 font-bold">
                        +{formatPrice(calculateExampleCharge(option, 15000))}
                      </td>
                      <td className="py-2 px-4 text-right text-primary-400 font-bold">
                        +{formatPrice(calculateExampleCharge(option, 25000))}
                      </td>
                      <td className="py-2 px-4 text-right text-primary-400 font-bold">
                        +{formatPrice(calculateExampleCharge(option, 40000))}
                      </td>
                      <td className="py-2 pl-4 text-right text-primary-400 font-bold">
                        +{formatPrice(calculateExampleCharge(option, 60000))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <FaWrench className="text-primary-400" size={20} />
                <h3 className="text-xl sm:text-2xl font-thin text-white">
                  {editingOption ? 'Edit Build Service' : 'Add Build Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-400 hover:bg-surface-700 rounded-lg active:scale-95 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Name (English) *</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                    placeholder="e.g., Standard Build Service"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">Name (Swedish) *</label>
                  <input
                    type="text"
                    value={formData.name_sv}
                    onChange={(e) => setFormData({ ...formData, name_sv: e.target.value })}
                    required
                    placeholder="e.g., Standard Byggservice"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.desc_en || ''}
                    onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Description (Swedish)
                  </label>
                  <textarea
                    value={formData.desc_sv || ''}
                    onChange={(e) => setFormData({ ...formData, desc_sv: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaMoneyBillWave className="inline mr-1" size={12} /> Price Type *
                  </label>
                  <select
                    value={formData.priceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceType: e.target.value as 'fixed' | 'percentage',
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="fixed">Fixed Price (SEK)</option>
                    <option value="percentage">Percentage of Total</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    {formData.priceType === 'fixed' ? 'Amount (SEK) *' : 'Percentage (%) *'}
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) })
                    }
                    required
                    min="0"
                    step={formData.priceType === 'percentage' ? '0.1' : '1'}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Build Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaClock className="inline mr-1" size={12} /> Build Time (English)
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedBuildTime_en || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedBuildTime_en: e.target.value })
                    }
                    placeholder="e.g., 3-5 business days"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaClock className="inline mr-1" size={12} /> Build Time (Swedish)
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedBuildTime_sv || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedBuildTime_sv: e.target.value })
                    }
                    placeholder="e.g., 3-5 arbetsdagar"
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Warranty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaShieldAlt className="inline mr-1" size={12} /> Warranty (English)
                  </label>
                  <textarea
                    value={formData.warrantyInfo_en || ''}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo_en: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaShieldAlt className="inline mr-1" size={12} /> Warranty (Swedish)
                  </label>
                  <textarea
                    value={formData.warrantyInfo_sv || ''}
                    onChange={(e) => setFormData({ ...formData, warrantyInfo_sv: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-800 rounded-lg p-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs sm:text-sm font-medium text-neutral-300">Active (visible)</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className="active:scale-95 transition"
                    >
                      {formData.isActive ? (
                        <FaToggleOn size={28} className="text-green-500" />
                      ) : (
                        <FaToggleOff size={28} className="text-neutral-500" />
                      )}
                    </button>
                  </label>
                </div>
                <div className="bg-surface-800 rounded-lg p-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-primary-400" size={12} />
                      <span className="text-xs sm:text-sm font-medium text-neutral-300">Default Option</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                      className="active:scale-95 transition"
                    >
                      {formData.isDefault ? (
                        <FaToggleOn size={28} className="text-primary-400" />
                      ) : (
                        <FaToggleOff size={28} className="text-neutral-500" />
                      )}
                    </button>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {formData.amount > 0 && (
                <div className="bg-primary-600/10 border border-primary-500/30 rounded-lg p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-primary-300 mb-3 flex items-center gap-2">
                    <FaChartBar size={14} /> Price Preview
                  </h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-primary-400 text-[10px] sm:text-xs">15,000 SEK</p>
                      <p className="font-bold text-primary-300">
                        +{formatPrice(
                          formData.priceType === 'fixed'
                            ? formData.amount
                            : (15000 * formData.amount) / 100
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-400 text-[10px] sm:text-xs">25,000 SEK</p>
                      <p className="font-bold text-primary-300">
                        +{formatPrice(
                          formData.priceType === 'fixed'
                            ? formData.amount
                            : (25000 * formData.amount) / 100
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-primary-400 text-[10px] sm:text-xs">50,000 SEK</p>
                      <p className="font-bold text-primary-300">
                        +{formatPrice(
                          formData.priceType === 'fixed'
                            ? formData.amount
                            : (50000 * formData.amount) / 100
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg text-neutral-300 font-bold text-sm hover:bg-surface-700 active:scale-[0.98] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-500 active:scale-[0.98] transition"
              >
                {editingOption ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCBuildServicesManager;
