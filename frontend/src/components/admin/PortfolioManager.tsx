import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { PortfolioItem } from '../../models/types/portfolio.types';
import FileUpload from '../common/FileUpload';
import { FaPlus, FaEdit, FaStar, FaTrash, FaTimes, FaImage, FaGlobe, FaCode } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const PortfolioManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_sv: '',
    description_en: '',
    description_sv: '',
    category: '',
    techStack: [] as string[],
    projectUrl: '',
    imageUrl: '',
    imageFile: '',
    deviceFrame: 'none' as 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'none',
    featured: false,
    isPublished: true,
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/portfolio/admin/all', { page: 1, limit: 100 });
      if (response.success && response.data) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_sv: '',
      description_en: '',
      description_sv: '',
      category: '',
      techStack: [],
      projectUrl: '',
      imageUrl: '',
      imageFile: '',
      deviceFrame: 'none',
      featured: false,
      isPublished: true,
    });
    setTechInput('');
    setRawFile(null);
    setShowModal(true);
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title_en: item.title_en,
      title_sv: item.title_sv,
      description_en: item.description_en,
      description_sv: item.description_sv,
      category: item.category,
      techStack: item.techStack,
      projectUrl: item.projectUrl || '',
      imageUrl: item.imageUrl,
      imageFile: (item as any).imageFile || '',
      deviceFrame: (item as any).deviceFrame || 'none',
      featured: item.featured,
      isPublished: item.isPublished,
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
      data.append('description_en', formData.description_en);
      data.append('description_sv', formData.description_sv);
      data.append('category', formData.category);
      data.append('projectUrl', formData.projectUrl);
      data.append('deviceFrame', formData.deviceFrame);
      data.append('techStack', JSON.stringify(formData.techStack));
      data.append('featured', String(formData.featured));
      data.append('isPublished', String(formData.isPublished));
      if (rawFile) {
        data.append('imageFile', rawFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
        data.append('imageFile', formData.imageFile);
      }

      if (editingItem) {
        await apiClient.put(`/portfolio/${editingItem.id}`, data);
      } else {
        await apiClient.post('/portfolio', data);
      }
      setShowModal(false);
      loadPortfolio();
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Portfolio Item',
      message: 'Are you sure you want to delete this portfolio item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      await apiClient.delete(`/portfolio/${id}`);
      loadPortfolio();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await apiClient.patch(`/portfolio/${id}/toggle-featured`, {});
      loadPortfolio();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Portfolio Management</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">{items.length} projects total</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-500 transition-colors active:scale-[0.98]"
        >
          <FaPlus className="text-xs" />
          Add New Project
        </button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden hover:shadow-dark-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={item.imageUrl}
                alt={item.title_en}
                className="w-full h-36 sm:h-48 object-cover"
              />
              {item.featured && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-primary-600 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1">
                  <FaStar className="text-[8px] sm:text-[10px]" /> Featured
                </span>
              )}
              {!item.isPublished && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-surface-700 text-white text-[10px] sm:text-xs font-bold rounded-lg">
                  Draft
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4">
              <h3 className="text-sm sm:text-lg font-bold text-white mb-1 line-clamp-1">
                {language === 'en' ? item.title_en : item.title_sv}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mb-2 sm:mb-3">{item.category}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                {item.techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 bg-surface-800 text-neutral-400 text-[10px] sm:text-xs rounded-md font-medium"
                  >
                    {tech}
                  </span>
                ))}
                {item.techStack.length > 3 && (
                  <span className="px-2 py-0.5 bg-surface-800 text-neutral-400 text-[10px] sm:text-xs rounded-md">
                    +{item.techStack.length - 3}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-primary-500 transition-colors active:scale-[0.98]"
                >
                  <FaEdit className="text-[10px] sm:text-xs" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleFeatured(item.id)}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors active:scale-[0.98] ${
                    item.featured
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'bg-surface-800 text-neutral-400 hover:bg-surface-700'
                  }`}
                  title="Toggle Featured"
                >
                  <FaStar />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-2 bg-red-500 text-white text-xs sm:text-sm rounded-lg hover:bg-red-600 transition-colors active:scale-[0.98]"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaImage className="text-2xl sm:text-3xl text-neutral-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">No projects yet</h3>
          <p className="text-sm text-neutral-400 mb-4">Get started by adding your first portfolio project.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500"
          >
            <FaPlus className="text-xs" />
            Add New Project
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface-900 w-full sm:rounded-2xl sm:max-w-3xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-900 px-4 sm:px-6 py-4 border-b border-surface-700 flex items-center justify-between z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">
                {editingItem ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Title (Swedish)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_sv}
                    onChange={(e) => setFormData({ ...formData, title_sv: e.target.value })}
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
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
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
                    value={formData.description_sv}
                    onChange={(e) => setFormData({ ...formData, description_sv: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Category & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Web Development"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FaGlobe className="text-neutral-500" />
                      Project URL (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* File Upload */}
              <FileUpload
                label="Portfolio Image"
                accept="image/*"
                maxSize={5}
                onFileSelect={(base64, file) => { setFormData({ ...formData, imageFile: base64, imageUrl: base64 }); setRawFile(file); }}
                currentUrl={formData.imageFile || formData.imageUrl}
                preview={true}
                previewClassName="h-32 sm:h-48 w-auto object-contain"
              />

              {/* Device Frame */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  Display Frame
                </label>
                <select
                  value={formData.deviceFrame}
                  onChange={(e) => setFormData({ ...formData, deviceFrame: e.target.value as any })}
                  className="w-full px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                >
                  <option value="none">No Frame (Just Image)</option>
                  <option value="desktop">Desktop Monitor</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet (iPad Style)</option>
                  <option value="mobile">Mobile Phone</option>
                </select>
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                  Choose how the portfolio image will be displayed
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FaCode className="text-neutral-500" />
                    Tech Stack
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    placeholder="Add technology"
                    className="flex-1 px-3 py-2.5 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="px-4 py-2.5 bg-surface-800 text-neutral-300 text-sm font-bold rounded-lg hover:bg-surface-700 active:scale-[0.98]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-primary-600/20 text-primary-300 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-primary-400 border-surface-600 rounded focus:ring-primary-500/50"
                  />
                  <span className="text-xs sm:text-sm font-medium text-neutral-300 flex items-center gap-1.5">
                    <FaStar className="text-primary-400" /> Featured Project
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-primary-400 border-surface-600 rounded focus:ring-primary-500/50"
                  />
                  <span className="text-xs sm:text-sm font-medium text-neutral-300">Published</span>
                </label>
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
                  {editingItem ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
