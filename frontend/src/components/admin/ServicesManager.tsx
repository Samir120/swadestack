import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { Service } from '../../models/types/service.types';
import { ServiceCategory } from '../../models/types/serviceCategory.types';
import { serviceCategoryApi } from '../../models/api/serviceCategoryApi';
import FileUpload from '../common/FileUpload';
import AdminPriceDisplay, { formatAdminCurrency } from './common/AdminPriceDisplay';
import AdminPriceInput from './common/AdminPriceInput';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaCheck, FaBan, FaBox, FaStar } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const ServicesManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_sv: '',
    desc_en: '',
    desc_sv: '',
    price: '',
    discountPrice: '',
    currency: 'SEK',
    features_en: [] as string[],
    features_sv: [] as string[],
    excludedFeatures_en: [] as string[],
    excludedFeatures_sv: [] as string[],
    serviceCategoryId: '',
    imageUrl: '',
    imageFile: '',
    isActive: true,
    isPopular: false,
  });
  const [featureInput_en, setFeatureInput_en] = useState('');
  const [featureInput_sv, setFeatureInput_sv] = useState('');
  const [excludedFeatureInput_en, setExcludedFeatureInput_en] = useState('');
  const [excludedFeatureInput_sv, setExcludedFeatureInput_sv] = useState('');

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      // Use admin endpoint to get all services including inactive ones
      const response = await apiClient.get<any>('/services/admin/all', { page: 1, limit: 100 });
      if (response.success && response.data) {
        setServices(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await serviceCategoryApi.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name_en: '',
      name_sv: '',
      desc_en: '',
      desc_sv: '',
      price: '',
      discountPrice: '',
      currency: 'SEK',
      features_en: [],
      features_sv: [],
      excludedFeatures_en: [],
      excludedFeatures_sv: [],
      serviceCategoryId: '',
      imageUrl: '',
      imageFile: '',
      isActive: true,
      isPopular: false,
    });
    setFeatureInput_en('');
    setFeatureInput_sv('');
    setExcludedFeatureInput_en('');
    setExcludedFeatureInput_sv('');
    setRawFile(null);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name_en: service.name_en,
      name_sv: service.name_sv,
      desc_en: service.desc_en,
      desc_sv: service.desc_sv,
      price: service.price.toString(),
      discountPrice: service.discountPrice != null ? service.discountPrice.toString() : '',
      currency: service.currency,
      features_en: service.features_en || [],
      features_sv: service.features_sv || [],
      excludedFeatures_en: (service as any).excludedFeatures_en || [],
      excludedFeatures_sv: (service as any).excludedFeatures_sv || [],
      serviceCategoryId: service.serviceCategoryId || '',
      imageUrl: service.imageUrl || '',
      imageFile: (service as any).imageFile || '',
      isActive: service.isActive,
      isPopular: service.isPopular ?? false,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name_en', formData.name_en);
      data.append('name_sv', formData.name_sv);
      data.append('desc_en', formData.desc_en);
      data.append('desc_sv', formData.desc_sv);
      data.append('price', formData.price);
      data.append('discountPrice', formData.discountPrice);
      data.append('currency', formData.currency);
      data.append('features_en', JSON.stringify(formData.features_en));
      data.append('features_sv', JSON.stringify(formData.features_sv));
      data.append('excludedFeatures_en', JSON.stringify(formData.excludedFeatures_en));
      data.append('excludedFeatures_sv', JSON.stringify(formData.excludedFeatures_sv));
      data.append('serviceCategoryId', formData.serviceCategoryId || '');
      data.append('isActive', String(formData.isActive));
      data.append('isPopular', String(formData.isPopular));
      if (rawFile) {
        data.append('imageFile', rawFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
        data.append('imageFile', formData.imageFile);
      }

      if (editingService) {
        await apiClient.put(`/services/${editingService.id}`, data);
      } else {
        await apiClient.post('/services', data);
      }
      setShowModal(false);
      loadServices();
    } catch (error) {
      console.error('Failed to save service:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await apiClient.delete(`/services/${id}`);
      loadServices();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/services/${id}/toggle-active`, {});
      loadServices();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const addFeature = (lang: 'en' | 'sv') => {
    const input = lang === 'en' ? featureInput_en : featureInput_sv;
    const features = lang === 'en' ? formData.features_en : formData.features_sv;

    if (input.trim() && !features.includes(input.trim())) {
      setFormData({
        ...formData,
        [lang === 'en' ? 'features_en' : 'features_sv']: [...features, input.trim()],
      });
      if (lang === 'en') {
        setFeatureInput_en('');
      } else {
        setFeatureInput_sv('');
      }
    }
  };

  const removeFeature = (lang: 'en' | 'sv', feature: string) => {
    const features = lang === 'en' ? formData.features_en : formData.features_sv;
    setFormData({
      ...formData,
      [lang === 'en' ? 'features_en' : 'features_sv']: features.filter((f) => f !== feature),
    });
  };

  const addExcludedFeature = (lang: 'en' | 'sv') => {
    const input = lang === 'en' ? excludedFeatureInput_en : excludedFeatureInput_sv;
    const features = lang === 'en' ? formData.excludedFeatures_en : formData.excludedFeatures_sv;

    if (input.trim() && !features.includes(input.trim())) {
      setFormData({
        ...formData,
        [lang === 'en' ? 'excludedFeatures_en' : 'excludedFeatures_sv']: [...features, input.trim()],
      });
      if (lang === 'en') {
        setExcludedFeatureInput_en('');
      } else {
        setExcludedFeatureInput_sv('');
      }
    }
  };

  const removeExcludedFeature = (lang: 'en' | 'sv', feature: string) => {
    const features = lang === 'en' ? formData.excludedFeatures_en : formData.excludedFeatures_sv;
    setFormData({
      ...formData,
      [lang === 'en' ? 'excludedFeatures_en' : 'excludedFeatures_sv']: features.filter((f) => f !== feature),
    });
  };

  const formatPrice = formatAdminCurrency;

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Services Management</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">{services.length} services total</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-500 transition-colors active:scale-[0.98]"
        >
          <FaPlus className="text-xs" />
          Add New Service
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  {service.isPopular && <FaStar className="text-yellow-400 text-[10px] flex-shrink-0" />}
                  {language === 'en' ? service.name_en : service.name_sv}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {service.serviceCategory
                    ? (language === 'en' ? service.serviceCategory.name_en : service.serviceCategory.name_sv)
                    : (service.category || '—')}
                </p>
              </div>
              <span
                className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  service.isActive
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                }`}
              >
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-3">
              {service.discountPrice != null ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 line-through">
                      {formatPrice(service.price, service.currency)}
                    </span>
                    <AdminPriceDisplay
                      price={service.discountPrice}
                      currency={service.currency}
                      primaryClassName="text-base font-bold text-red-600"
                    />
                  </div>
                </div>
              ) : (
                <AdminPriceDisplay
                  price={service.price}
                  currency={service.currency}
                  primaryClassName="text-base font-bold text-white"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500 active:scale-[0.98]"
              >
                <FaEdit className="text-[10px]" />
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(service.id)}
                className={`px-3 py-2 text-xs rounded-lg active:scale-[0.98] ${
                  service.isActive
                    ? 'bg-yellow-900/30 text-yellow-400'
                    : 'bg-green-900/30 text-green-400'
                }`}
              >
                {service.isActive ? <FaToggleOff /> : <FaToggleOn />}
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="px-3 py-2 bg-red-900/200 text-white text-xs rounded-lg hover:bg-red-600 active:scale-[0.98]"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        <table className="min-w-full divide-y divide-surface-700">
          <thead className="bg-surface-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Service Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-850 divide-y divide-surface-700">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-surface-700">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {service.isPopular && <FaStar className="text-yellow-400 text-xs flex-shrink-0" />}
                    {language === 'en' ? service.name_en : service.name_sv}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-400">
                  {service.serviceCategory
                    ? (language === 'en' ? service.serviceCategory.name_en : service.serviceCategory.name_sv)
                    : (service.category || '—')}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-white">
                  {service.discountPrice != null ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-neutral-500 text-xs">
                          {formatPrice(service.price, service.currency)}
                        </span>
                        <AdminPriceDisplay
                          price={service.discountPrice}
                          currency={service.currency}
                          primaryClassName="text-red-600 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <AdminPriceDisplay
                      price={service.price}
                      currency={service.currency}
                      primaryClassName="font-bold text-white"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      service.isActive
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(service.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                        service.isActive
                          ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/30'
                          : 'bg-green-900/30 text-green-400 hover:bg-green-900/30'
                      }`}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-3 py-1.5 bg-red-900/200 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {services.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-2xl text-neutral-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No services yet</h3>
            <p className="text-sm text-neutral-400">Get started by adding your first service.</p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {services.length === 0 && (
        <div className="sm:hidden text-center py-12">
          <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox className="text-2xl text-neutral-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No services yet</h3>
          <p className="text-sm text-neutral-400 mb-4">Get started by adding your first service.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500"
          >
            <FaPlus className="text-xs" />
            Add New Service
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface-900 w-full sm:rounded-2xl sm:max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-900 px-4 sm:px-6 py-4 border-b border-surface-700 flex items-center justify-between z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Name (Swedish)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_sv}
                    onChange={(e) => setFormData({ ...formData, name_sv: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Description (English)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.desc_en}
                    onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Description (Swedish)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.desc_sv}
                    onChange={(e) => setFormData({ ...formData, desc_sv: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Price, Discount, Currency, Category */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <AdminPriceInput
                  label="Price"
                  value={formData.price}
                  onChange={(v) => setFormData({ ...formData, price: v })}
                  currency={formData.currency}
                  required
                  min={0}
                  step={0.01}
                />
                <AdminPriceInput
                  label="Discount"
                  value={formData.discountPrice}
                  onChange={(v) => setFormData({ ...formData, discountPrice: v })}
                  currency={formData.currency}
                  min={0}
                  step={0.01}
                  placeholder="—"
                />
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="SEK">SEK</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.serviceCategoryId}
                    onChange={(e) => setFormData({ ...formData, serviceCategoryId: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'en' ? cat.name_en : cat.name_sv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.discountPrice !== '' && formData.price !== '' &&
                parseFloat(formData.discountPrice) >= parseFloat(formData.price) && (
                <p className="text-xs text-red-500 -mt-2">Discount must be less than original price</p>
              )}

              {/* File Upload */}
              <FileUpload
                label="Service Image"
                accept="image/*"
                maxSize={3}
                onFileSelect={(base64, file) => { setFormData({ ...formData, imageFile: base64, imageUrl: base64 }); setRawFile(file); }}
                currentUrl={formData.imageFile || formData.imageUrl}
                preview={true}
                previewClassName="h-24 sm:h-32 w-auto object-contain"
              />

              {/* Features Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FaCheck className="text-green-500 text-[10px]" />
                      Features (English)
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput_en}
                      onChange={(e) => setFeatureInput_en(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature('en'))}
                      placeholder="Add feature"
                      className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => addFeature('en')}
                      className="px-3 py-2 bg-green-900/30 text-green-400 text-xs font-bold rounded-lg hover:bg-green-900/30 active:scale-[0.98]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {formData.features_en.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="flex-1 px-2 py-1.5 bg-green-900/20 text-green-400 rounded-lg truncate">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature('en', feature)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FaCheck className="text-green-500 text-[10px]" />
                      Features (Swedish)
                    </span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput_sv}
                      onChange={(e) => setFeatureInput_sv(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature('sv'))}
                      placeholder="Lägg till funktion"
                      className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => addFeature('sv')}
                      className="px-3 py-2 bg-green-900/30 text-green-400 text-xs font-bold rounded-lg hover:bg-green-900/30 active:scale-[0.98]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {formData.features_sv.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="flex-1 px-2 py-1.5 bg-green-900/20 text-green-400 rounded-lg truncate">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature('sv', feature)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Excluded Features Section */}
              <div className="border-t border-surface-700 pt-4">
                <h4 className="text-xs sm:text-sm font-bold text-red-400 mb-3 flex items-center gap-1.5">
                  <FaBan className="text-red-500" />
                  Excluded Features (Not Included)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                      Excluded (English)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={excludedFeatureInput_en}
                        onChange={(e) => setExcludedFeatureInput_en(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedFeature('en'))}
                        placeholder="Add excluded"
                        className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => addExcludedFeature('en')}
                        className="px-3 py-2 bg-red-900/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-900/30 active:scale-[0.98]"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {formData.excludedFeatures_en.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="flex-1 px-2 py-1.5 bg-red-900/20 text-red-400 rounded-lg truncate">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeExcludedFeature('en', feature)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTimes className="text-[10px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                      Excluded (Swedish)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={excludedFeatureInput_sv}
                        onChange={(e) => setExcludedFeatureInput_sv(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedFeature('sv'))}
                        placeholder="Lägg till exkluderad"
                        className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => addExcludedFeature('sv')}
                        className="px-3 py-2 bg-red-900/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-900/30 active:scale-[0.98]"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {formData.excludedFeatures_sv.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="flex-1 px-2 py-1.5 bg-red-900/20 text-red-400 rounded-lg truncate">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeExcludedFeature('sv', feature)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTimes className="text-[10px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Checkbox */}
              <div className="py-2 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-400 border-surface-600 rounded focus:ring-primary-500/50"
                  />
                  <span className="text-xs sm:text-sm font-medium text-neutral-300">Active Service</span>
                </label>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 text-yellow-400 border-surface-600 rounded focus:ring-yellow-500/50"
                    />
                    <span className="text-xs sm:text-sm font-medium text-neutral-300 flex items-center gap-1.5">
                      <FaStar className="text-yellow-400 text-xs" />
                      Mark as Most Popular
                    </span>
                  </label>
                  <p className="text-[10px] text-neutral-500 ml-6 mt-1">Only one service per category can be popular. Setting this will clear it from others in the same category.</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-surface-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-surface-600 text-neutral-300 text-sm font-bold rounded-xl hover:bg-surface-700 transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-500 transition-colors active:scale-[0.98]"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
