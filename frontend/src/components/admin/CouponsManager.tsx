import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import apiClient from '../../models/api/apiClient';
import { Coupon, ApplicableTo } from '../../models/types/coupon.types';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';

interface ServiceCategory {
  id: string;
  name_en: string;
  name_sv: string;
  isActive: boolean;
}

const defaultFormData = {
  code: '',
  description: '',
  discountType: 'percentage' as 'percentage' | 'fixed_amount',
  discountValue: '',
  minimumOrderAmount: '',
  maxDiscountAmount: '',
  maxUses: '',
  maxUsesPerUser: '',
  applicableTo: 'all' as ApplicableTo,
  applicableCategoryIds: [] as string[],
  firstOrderOnly: false,
  combinable: true,
  validFrom: '',
  validUntil: '',
  isActive: true,
};

const CouponsManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    if (categoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryDropdownOpen]);

  useEffect(() => {
    loadCoupons();
    loadCategories();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/coupons');
      if (response.success && response.data) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.get<any>('/service-categories');
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setFormData(defaultFormData);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minimumOrderAmount: coupon.minimumOrderAmount != null ? String(coupon.minimumOrderAmount) : '',
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : '',
      maxUsesPerUser: coupon.maxUsesPerUser != null ? String(coupon.maxUsesPerUser) : '',
      applicableTo: coupon.applicableTo || 'all',
      applicableCategoryIds: coupon.applicableCategoryIds
        ? coupon.applicableCategoryIds.split(',').map(id => id.trim()).filter(Boolean)
        : [],
      firstOrderOnly: coupon.firstOrderOnly || false,
      combinable: coupon.combinable !== false,
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : null,
        maxDiscountAmount: formData.discountType === 'percentage' && formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : null,
        applicableTo: formData.applicableTo,
        applicableCategoryIds: formData.applicableTo === 'specific_categories' && formData.applicableCategoryIds.length > 0
          ? formData.applicableCategoryIds.join(',') : null,
        firstOrderOnly: formData.firstOrderOnly,
        combinable: formData.combinable,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await apiClient.put(`/coupons/${editingCoupon.id}`, payload);
        toast.success('Coupon updated successfully');
      } else {
        await apiClient.post('/coupons', payload);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      loadCoupons();
    } catch (error: any) {
      console.error('Failed to save coupon:', error);
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      loadCoupons();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/coupons/${id}/toggle-active`, {});
      loadCoupons();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const ids = prev.applicableCategoryIds.includes(categoryId)
        ? prev.applicableCategoryIds.filter(id => id !== categoryId)
        : [...prev.applicableCategoryIds, categoryId];
      return { ...prev, applicableCategoryIds: ids };
    });
  };

  const formatDiscountDisplay = (coupon: Coupon): string => {
    if (coupon.discountType === 'percentage') {
      let display = `${coupon.discountValue}%`;
      if (coupon.maxDiscountAmount != null) {
        display += ` (max ${coupon.maxDiscountAmount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK)`;
      }
      return display;
    }
    return `${coupon.discountValue.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('sv-SE');
  };

  const isExpired = (coupon: Coupon): boolean => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const formatApplicableTo = (coupon: Coupon): string => {
    switch (coupon.applicableTo) {
      case 'services': return 'Services';
      case 'gaming_pcs': return 'Gaming PCs';
      case 'specific_categories': return 'Categories';
      default: return 'All';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Coupons</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Discount Codes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} />
          Add Coupon
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          {coupons.length === 0 ? (
            <div className="p-6 text-center text-sm text-neutral-400">
              No coupons yet. Click &quot;Add Coupon&quot; to get started.
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white font-mono">{coupon.code}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {formatDiscountDisplay(coupon)}
                            {coupon.description && ` — ${coupon.description}`}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            !coupon.isActive
                              ? 'bg-red-900/30 text-red-400'
                              : isExpired(coupon)
                              ? 'bg-amber-900/30 text-amber-400'
                              : 'bg-green-900/30 text-green-400'
                          }`}
                        >
                          {!coupon.isActive ? 'Inactive' : isExpired(coupon) ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] text-neutral-500">
                          Used: {coupon.currentUses}{coupon.maxUses != null ? `/${coupon.maxUses}` : ''}
                        </span>
                        {coupon.totalDiscountGiven > 0 && (
                          <span className="text-[10px] text-neutral-500">
                            Discount: {coupon.totalDiscountGiven.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
                          </span>
                        )}
                        {coupon.applicableTo !== 'all' && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary-600/20 text-primary-400 rounded">
                            {formatApplicableTo(coupon)}
                          </span>
                        )}
                        {coupon.firstOrderOnly && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-900/20 text-amber-400 rounded">1st order</span>
                        )}
                        {coupon.validUntil && (
                          <span className="text-[10px] text-neutral-500">
                            Expires: {formatDate(coupon.validUntil)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(coupon)} className="p-1.5 text-primary-400 hover:bg-primary-600/10 rounded-lg active:scale-[0.98]">
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`p-1.5 rounded-lg active:scale-[0.98] ${
                            coupon.isActive ? 'text-yellow-600 hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-900/20'
                          }`}
                        >
                          {coupon.isActive ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-red-600 hover:bg-red-900/20 rounded-lg active:scale-[0.98]">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-700">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Code</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Discount</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Usage</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Scope</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Validity</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-neutral-400">
                    No coupons yet. Click &quot;Add Coupon&quot; to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-surface-800 transition">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <span className="font-bold text-white font-mono text-sm">{coupon.code}</span>
                        {coupon.description && (
                          <p className="text-xs text-neutral-400 mt-0.5 max-w-[200px] truncate">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-white font-medium">{formatDiscountDisplay(coupon)}</span>
                      {coupon.minimumOrderAmount != null && (
                        <p className="text-xs text-neutral-500 mt-0.5">Min: {coupon.minimumOrderAmount} SEK</p>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-white">
                        {coupon.currentUses}{coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}
                      </span>
                      {coupon.maxUsesPerUser != null && (
                        <p className="text-xs text-neutral-500 mt-0.5">{coupon.maxUsesPerUser}/user</p>
                      )}
                      {coupon.totalDiscountGiven > 0 && (
                        <p className="text-xs text-green-400 mt-0.5">
                          {coupon.totalDiscountGiven.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK given
                        </p>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          coupon.applicableTo === 'all'
                            ? 'bg-surface-700 text-neutral-300'
                            : 'bg-primary-600/20 text-primary-400'
                        }`}>
                          {formatApplicableTo(coupon)}
                        </span>
                        {coupon.firstOrderOnly && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-900/20 text-amber-400">
                            1st order
                          </span>
                        )}
                        {!coupon.combinable && (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-900/20 text-red-400">
                            Exclusive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-neutral-300">
                      {coupon.validFrom || coupon.validUntil ? (
                        <div>
                          {coupon.validFrom && <div className="text-xs">{formatDate(coupon.validFrom)} -</div>}
                          {coupon.validUntil && <div className="text-xs">{formatDate(coupon.validUntil)}</div>}
                        </div>
                      ) : (
                        <span className="text-neutral-500">No limit</span>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          !coupon.isActive
                            ? 'bg-red-900/30 text-red-400'
                            : isExpired(coupon)
                            ? 'bg-amber-900/30 text-amber-400'
                            : 'bg-green-900/30 text-green-400'
                        }`}
                      >
                        {!coupon.isActive ? 'Inactive' : isExpired(coupon) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(coupon)} className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg" title="Edit">
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`p-2 rounded-lg ${
                            coupon.isActive ? 'text-yellow-600 hover:bg-yellow-900/20' : 'text-green-600 hover:bg-green-900/20'
                          }`}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? <FaToggleOff size={14} /> : <FaToggleOn size={14} />}
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg" title="Delete">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-850 rounded-2xl shadow-dark-xl border border-surface-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-surface-700">
              <h3 className="text-xl font-bold text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Internal description"
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (SEK)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(SEK)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Max Discount Amount - only for percentage type */}
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Max Discount Amount (SEK)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="No cap"
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Maximum discount cap for percentage coupons. Leave empty for no cap.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Minimum Order Amount (SEK)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                  placeholder="No minimum"
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Max Total Uses</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Max Uses Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Applies To</label>
                <select
                  value={formData.applicableTo}
                  onChange={(e) => { setCategoryDropdownOpen(false); setFormData({ ...formData, applicableTo: e.target.value as ApplicableTo, applicableCategoryIds: [] }); }}
                  className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Products &amp; Services</option>
                  <option value="services">Services Only</option>
                  <option value="gaming_pcs">Gaming PCs Only</option>
                  <option value="specific_categories">Specific Categories</option>
                </select>
              </div>

              {/* Category dropdown multi-select */}
              {formData.applicableTo === 'specific_categories' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Select Categories</label>

                  {/* Selected category chips */}
                  {formData.applicableCategoryIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.applicableCategoryIds.map((catId) => {
                        const cat = categories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                          <span key={catId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-600/20 text-primary-400 text-xs font-medium rounded-lg">
                            {cat.name_en}
                            <button
                              type="button"
                              onClick={() => handleCategoryToggle(catId)}
                              className="hover:text-red-400 transition-colors ml-0.5"
                            >
                              <FaTimes size={8} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Dropdown trigger */}
                  <div className="relative" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <span className={formData.applicableCategoryIds.length > 0 ? 'text-neutral-300' : 'text-neutral-500'}>
                        {formData.applicableCategoryIds.length > 0
                          ? `${formData.applicableCategoryIds.length} categor${formData.applicableCategoryIds.length === 1 ? 'y' : 'ies'} selected`
                          : 'Choose categories...'}
                      </span>
                      <svg className={`w-4 h-4 text-neutral-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown list */}
                    {categoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-surface-800 border border-surface-600 rounded-lg shadow-dark-xl max-h-48 overflow-y-auto">
                        {categories.filter(c => c.isActive).length === 0 ? (
                          <p className="px-4 py-3 text-xs text-neutral-500">No categories available</p>
                        ) : (
                          categories.filter(c => c.isActive).map((cat) => {
                            const isSelected = formData.applicableCategoryIds.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryToggle(cat.id)}
                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                                  isSelected
                                    ? 'bg-primary-600/15 text-primary-400'
                                    : 'text-neutral-300 hover:bg-surface-700'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'border-surface-500 bg-surface-700'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                {cat.name_en}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Discount applies only to items in selected categories. Other items won't be discounted.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Toggle switches */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  </label>
                  <span className="text-sm font-medium text-neutral-300">Active</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.firstOrderOnly}
                      onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                  <div>
                    <span className="text-sm font-medium text-neutral-300">First Order Only</span>
                    <p className="text-xs text-neutral-500">Only available for customers placing their first order</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.combinable}
                      onChange={(e) => setFormData({ ...formData, combinable: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  </label>
                  <div>
                    <span className="text-sm font-medium text-neutral-300">Combinable</span>
                    <p className="text-xs text-neutral-500">Can be combined with other coupons</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsManager;
