import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { Banner } from '../../models/types/bannerTypes';
import FileUpload from '../common/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaToggleOn,
  FaToggleOff,
  FaBullhorn,
} from 'react-icons/fa';

const BannersManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Adjusted form data for Banners (removed price, category, excluded features)
  const [formData, setFormData] = useState({
    title_en: '',
    title_sv: '',
    desc_en: '',
    desc_sv: '',
    image_url: '',
    image_file: '',
    is_active: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      // Use admin endpoint to get all banners including inactive ones
      const response = await apiClient.get<any>('/banners/admin/all', { page: 1, limit: 100 });
      if (response.success && response.data) {
        // Handle if response.data is an array or object with a banners property
        setBanners(Array.isArray(response.data) ? response.data : response.data.banners || []);
      }
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setFormData({
      title_en: '',
      title_sv: '',
      desc_en: '',
      desc_sv: '',
      image_url: '',
      image_file: '',
      is_active: true,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title_en: banner.title_en || '',
      title_sv: banner.title_sv || '',
      desc_en: banner.desc_en || '',
      desc_sv: banner.desc_sv || '',
      image_url: banner.image_url || '',
      image_file: banner.image_file || '',
      is_active: banner.is_active,
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
      data.append('desc_en', formData.desc_en);
      data.append('desc_sv', formData.desc_sv);
      data.append('is_active', String(formData.is_active));
      if (rawFile) {
        data.append('imageFile', rawFile);
      } else if (formData.image_url) {
        data.append('image_url', formData.image_url);
        data.append('image_file', formData.image_file);
      }

      if (editingBanner) {
        await apiClient.put(`/banners/${editingBanner.id}`, data);
      } else {
        await apiClient.post('/banners', data);
      }
      setShowModal(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to save banner:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await apiClient.delete(`/banners/${id}`);
      loadBanners();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/banners/${id}/toggle-active`, {});
      loadBanners();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <LoadingSpinner />
        <span className="text-neutral-400 text-sm">Loading banners...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white flex items-center gap-2">
            <FaBullhorn className="text-primary-400" size={24} />
            Banners Management
          </h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage hero banners and promotional content</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} />
          Add Banner
        </button>
      </div>

      {/* Banners */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          {banners.length === 0 ? (
            <div className="p-8 text-center">
              <FaBullhorn className="mx-auto text-neutral-500 mb-3" size={32} />
              <p className="text-sm text-neutral-400">No banners yet. Click "Add Banner" to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {banners.map((banner) => (
                <div key={banner.id} className="p-4">
                  {/* Banner Image Preview */}
                  <div className="mb-3">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt="Banner Preview"
                        className="h-24 w-full object-cover rounded-lg border border-surface-700"
                      />
                    ) : (
                      <div className="h-24 w-full bg-surface-800 rounded-lg flex items-center justify-center">
                        <FaImage className="text-neutral-500" size={24} />
                      </div>
                    )}
                  </div>

                  {/* Banner Info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <FaBullhorn className="text-neutral-500" size={14} />
                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {language === 'en' ? banner.title_en : banner.title_sv}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className="active:scale-95 transition"
                    >
                      {banner.is_active ? (
                        <FaToggleOn size={22} className="text-green-500" />
                      ) : (
                        <FaToggleOff size={22} className="text-neutral-500" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                    {language === 'en' ? banner.desc_en : banner.desc_sv}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-surface-700">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-800 text-neutral-300 rounded-lg text-xs font-bold hover:bg-surface-700 active:scale-[0.98] transition"
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-2 bg-red-900/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-900/30 active:scale-[0.98] transition"
                    >
                      <FaTrash size={12} />
                    </button>
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
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-surface-700">
                  <td className="px-4 lg:px-6 py-4">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt="Banner Preview"
                        className="h-12 w-20 object-cover rounded-lg border border-surface-700"
                      />
                    ) : (
                      <div className="h-12 w-20 bg-surface-800 rounded-lg flex items-center justify-center">
                        <FaImage className="text-neutral-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaBullhorn className="text-neutral-500 flex-shrink-0" size={14} />
                      <div>
                        <div className="text-sm font-bold text-white truncate max-w-xs">
                          {language === 'en' ? banner.title_en : banner.title_sv}
                        </div>
                        <div className="text-xs text-neutral-400 truncate max-w-xs mt-0.5">
                          {language === 'en' ? banner.desc_en : banner.desc_sv}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className="flex items-center gap-1.5 active:scale-95 transition"
                    >
                      {banner.is_active ? (
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
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

        {banners.length === 0 && (
          <div className="hidden sm:flex flex-col items-center justify-center py-12 text-neutral-400">
            <FaBullhorn className="text-neutral-500 mb-3" size={40} />
            <p>No banners yet. Click "Add Banner" to get started.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-850 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-850 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center">
                  <FaImage className="text-primary-400 text-sm" />
                </div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
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
            <form id="banner-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Title Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-surface-800 text-white"
                    placeholder="Hero Banner Title"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Title (Swedish)
                  </label>
                  <input
                    type="text"
                    value={formData.title_sv}
                    onChange={(e) => setFormData({ ...formData, title_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-surface-800 text-white"
                    placeholder="Huvudrubrik"
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Description (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.desc_en}
                    onChange={(e) => setFormData({ ...formData, desc_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none bg-surface-800 text-white"
                    placeholder="Enter banner description..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Description (Swedish)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.desc_sv}
                    onChange={(e) => setFormData({ ...formData, desc_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none bg-surface-800 text-white"
                    placeholder="Ange bannerbeskrivning..."
                  />
                </div>
              </div>

              {/* File Upload Component */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  Banner Image
                </label>
                <FileUpload
                  label=""
                  accept="image/*"
                  maxSize={5}
                  onFileSelect={(base64, file) => { setFormData({ ...formData, image_file: base64, image_url: base64 }); setRawFile(file); }}
                  currentUrl={formData.image_file || formData.image_url}
                  preview={true}
                  previewClassName="h-32 sm:h-48 w-full object-cover rounded-lg border border-surface-700"
                />
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                  Recommended size: 1920x600px, max 5MB
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`p-1 rounded-lg transition ${formData.is_active ? 'text-green-400' : 'text-neutral-500'}`}
                >
                  {formData.is_active ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
                </button>
                <div>
                  <p className="text-sm font-medium text-neutral-300">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-neutral-400">
                    {formData.is_active ? 'Banner is visible to users' : 'Banner is hidden from users'}
                  </p>
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                type="submit"
                form="banner-form"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
              >
                {editingBanner ? 'Update Banner' : 'Create Banner'}
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

export default BannersManager;
