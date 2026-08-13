import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { Feature } from '../../models/types/feature.types';
import FileUpload from '../common/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import DynamicLucideIcon from '../common/DynamicLucideIcon';
import { availableIconNames } from '../common/icons';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash,
  FaSortNumericDown,
} from 'react-icons/fa';

const FeaturesManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_sv: '',
    shortDescription_en: '',
    shortDescription_sv: '',
    fullDescription_en: '',
    fullDescription_sv: '',
    iconName: 'Star',
    previewImageUrl: '',
    previewImageFile: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/features/admin/all');
      if (response.success && response.data) {
        setFeatures(response.data);
      }
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFeature(null);
    setFormData({
      title_en: '',
      title_sv: '',
      shortDescription_en: '',
      shortDescription_sv: '',
      fullDescription_en: '',
      fullDescription_sv: '',
      iconName: 'Star',
      previewImageUrl: '',
      previewImageFile: '',
      displayOrder: features.length,
      isActive: true,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title_en: feature.title_en,
      title_sv: feature.title_sv,
      shortDescription_en: feature.shortDescription_en,
      shortDescription_sv: feature.shortDescription_sv,
      fullDescription_en: feature.fullDescription_en,
      fullDescription_sv: feature.fullDescription_sv,
      iconName: feature.iconName,
      previewImageUrl: feature.previewImageUrl || '',
      previewImageFile: feature.previewImageFile || '',
      displayOrder: feature.displayOrder,
      isActive: feature.isActive,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title_en', formData.title_en);
      data.append('title_sv', formData.title_sv);
      data.append('shortDescription_en', formData.shortDescription_en);
      data.append('shortDescription_sv', formData.shortDescription_sv);
      data.append('fullDescription_en', formData.fullDescription_en);
      data.append('fullDescription_sv', formData.fullDescription_sv);
      data.append('iconName', formData.iconName);
      data.append('displayOrder', String(formData.displayOrder));
      data.append('isActive', String(formData.isActive));
      if (rawFile) {
        data.append('previewImageFile', rawFile);
      } else if (formData.previewImageUrl) {
        data.append('previewImageUrl', formData.previewImageUrl);
        data.append('previewImageFile', formData.previewImageFile);
      }

      if (editingFeature) {
        await apiClient.put(`/features/${editingFeature.id}`, data);
        toast.success('Feature updated successfully');
      } else {
        await apiClient.post('/features', data);
        toast.success('Feature created successfully');
      }
      setShowModal(false);
      loadFeatures();
    } catch (error) {
      console.error('Failed to save feature:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Feature',
      message: 'Are you sure you want to delete this feature? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;
    try {
      await apiClient.delete(`/features/${id}`);
      toast.success('Feature deleted');
      loadFeatures();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/features/${id}/toggle-active`, {});
      loadFeatures();
    } catch (error) {
      console.error('Failed to toggle active:', error);
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
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Features</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Homepage Features</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} />
          Add Feature
        </button>
      </div>

      {/* Features List */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          {features.length === 0 ? (
            <div className="p-6 text-center text-sm text-neutral-400">
              No features yet. Click "Add Feature" to get started.
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {features.map((feature) => (
                <div key={feature.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
                        <DynamicLucideIcon name={feature.iconName} size={20} className="text-primary-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {language === 'en' ? feature.title_en : feature.title_sv}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                            {language === 'en' ? feature.shortDescription_en : feature.shortDescription_sv}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            feature.isActive
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {feature.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <FaSortNumericDown size={10} />
                          Order: {feature.displayOrder}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Icon: {feature.iconName}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(feature)}
                          className="p-1.5 text-primary-400 hover:bg-primary-600/10 rounded-lg active:scale-[0.98]"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(feature.id)}
                          className={`p-1.5 rounded-lg active:scale-[0.98] ${
                            feature.isActive
                              ? 'text-yellow-600 hover:bg-yellow-900/20'
                              : 'text-green-600 hover:bg-green-900/20'
                          }`}
                        >
                          {feature.isActive ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(feature.id)}
                          className="p-1.5 text-red-600 hover:bg-red-900/20 rounded-lg active:scale-[0.98]"
                        >
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
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Order</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Icon</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Title</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Description</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Image</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {features.map((feature) => (
                <tr key={feature.id} className="hover:bg-surface-700">
                  <td className="px-4 lg:px-6 py-4 text-sm text-neutral-400">{feature.displayOrder}</td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                      <DynamicLucideIcon name={feature.iconName} size={18} className="text-primary-400" />
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm font-semibold text-white">
                      {language === 'en' ? feature.title_en : feature.title_sv}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">{feature.iconName}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-neutral-400 max-w-xs truncate">
                    {language === 'en' ? feature.shortDescription_en : feature.shortDescription_sv}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    {(feature.previewImageFile || feature.previewImageUrl) ? (
                      <img
                        src={feature.previewImageFile || feature.previewImageUrl}
                        alt={feature.title_en}
                        className="w-16 h-10 object-cover rounded-lg border border-surface-700"
                      />
                    ) : (
                      <span className="text-xs text-neutral-500">No image</span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feature.isActive
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {feature.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(feature)}
                        className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(feature.id)}
                        className={`p-2 rounded-lg transition ${
                          feature.isActive
                            ? 'text-yellow-600 hover:bg-yellow-900/20'
                            : 'text-green-600 hover:bg-green-900/20'
                        }`}
                        title={feature.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {feature.isActive ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(feature.id)}
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

        {features.length === 0 && (
          <div className="hidden sm:block text-center py-12 text-neutral-400">
            No features yet. Click "Add Feature" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <DynamicLucideIcon name={formData.iconName} size={16} className="text-primary-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">
                  {editingFeature ? 'Edit Feature' : 'Add Feature'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition active:scale-[0.98]"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form id="feature-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., Responsive Design"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Title (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_sv}
                    onChange={(e) => setFormData({ ...formData, title_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., Responsiv Design"
                  />
                </div>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Short Description (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription_en}
                    onChange={(e) => setFormData({ ...formData, shortDescription_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="Brief feature summary..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Short Description (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription_sv}
                    onChange={(e) => setFormData({ ...formData, shortDescription_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="Kort funktionsbeskrivning..."
                  />
                </div>
              </div>

              {/* Full Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Full Description (English) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.fullDescription_en}
                    onChange={(e) => setFormData({ ...formData, fullDescription_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    placeholder="Detailed description shown in the preview panel..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Full Description (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.fullDescription_sv}
                    onChange={(e) => setFormData({ ...formData, fullDescription_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    placeholder="Detaljerad beskrivning som visas i förhandsgranskningspanelen..."
                  />
                </div>
              </div>

              {/* Icon Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                  Icon Name (Lucide) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    list="available-icon-names"
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="Start typing to see available icons"
                  />
                  <datalist id="available-icon-names">
                    {availableIconNames.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                  <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                    <DynamicLucideIcon name={formData.iconName} size={20} className="text-primary-400" />
                  </div>
                </div>
                {formData.iconName && !availableIconNames.includes(formData.iconName) ? (
                  <p className="text-[10px] sm:text-xs text-red-400 mt-1">
                    &quot;{formData.iconName}&quot; is not an available icon — it will render as blank.
                    Pick one of the {availableIconNames.length} suggestions above.
                  </p>
                ) : (
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    Choose from the {availableIconNames.length} bundled icons (PascalCase, e.g. Monitor, ShieldCheck).
                    To add more, extend frontend/scripts/gen-icons.py and rebuild.
                  </p>
                )}
              </div>

              {/* Preview Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  Preview Image
                </label>
                <FileUpload
                  label=""
                  accept="image/*"
                  maxSize={5}
                  onFileSelect={(base64, file) => {
                    setFormData({ ...formData, previewImageFile: base64, previewImageUrl: base64 });
                    setRawFile(file);
                  }}
                  currentUrl={formData.previewImageFile || formData.previewImageUrl}
                  preview={true}
                  previewClassName="h-32 sm:h-40 w-full object-cover rounded-xl"
                />
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                  Recommended: 16:9 aspect ratio, at least 800x450px, max 5MB
                </p>
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">Lower numbers appear first</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-lg self-end">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`p-1 rounded-lg transition ${formData.isActive ? 'text-green-600' : 'text-neutral-500'}`}
                  >
                    {formData.isActive ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
                  </button>
                  <div>
                    <p className="text-sm font-medium text-neutral-300">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-neutral-400">
                      {formData.isActive ? 'Visible on homepage' : 'Hidden from homepage'}
                    </p>
                  </div>
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                type="submit"
                form="feature-form"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
              >
                {editingFeature ? 'Update Feature' : 'Create Feature'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg hover:bg-surface-700 text-neutral-300 font-bold text-sm active:scale-[0.98] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesManager;
