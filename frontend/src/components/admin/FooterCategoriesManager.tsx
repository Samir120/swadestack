import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import { footerApi } from '../../models/api/footerApi';
import {
  FooterCategoryTitle,
  CreateFooterCategoryTitle,
  UpdateFooterCategoryTitle,
} from '../../models/types/footer.types';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaBuilding, FaSortNumericDown } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * FooterCategoriesManager Component
 * Admin interface for managing footer category titles with bilingual support
 */
const FooterCategoriesManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const siteName = useAppSelector((state) =>
    language === 'en'
      ? state.siteSettings.settings?.siteName_en
      : state.siteSettings.settings?.siteName_sv
  );

  // State management
  const [categories, setCategories] = useState<FooterCategoryTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FooterCategoryTitle | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateFooterCategoryTitle>({
    categoryTitle_en: '',
    categoryTitle_sv: '',
    includeBusinessName: false,
    displayOrder: 1,
    isActive: true,
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await footerApi.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      categoryTitle_en: '',
      categoryTitle_sv: '',
      includeBusinessName: false,
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (category: FooterCategoryTitle) => {
    setEditingCategory(category);
    setFormData({
      categoryTitle_en: category.categoryTitle_en,
      categoryTitle_sv: category.categoryTitle_sv,
      includeBusinessName: category.includeBusinessName,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateFooterCategoryTitle = formData;
        const response = await footerApi.updateCategory(editingCategory.id, updateData);
        if (response.success) {
          await loadCategories();
          setShowModal(false);
          toast.success('Category updated successfully!');
        } else {
          toast.error('Failed to update category: ' + response.message);
        }
      } else {
        // Create new category
        const response = await footerApi.createCategory(formData);
        if (response.success) {
          await loadCategories();
          setShowModal(false);
          toast.success('Category created successfully!');
        } else {
          toast.error('Failed to create category: ' + response.message);
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will also delete all pages in this category. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await footerApi.deleteCategory(id);
      if (response.success) {
        await loadCategories();
        toast.success('Category deleted successfully!');
      } else {
        toast.error('Failed to delete category: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await footerApi.toggleCategoryActive(id);
      if (response.success) {
        await loadCategories();
      } else {
        toast.error('Failed to toggle category status: ' + response.message);
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Error toggling category status');
    }
  };

  const getCategoryTitle = (category: FooterCategoryTitle) => {
    const title = language === 'en' ? category.categoryTitle_en : category.categoryTitle_sv;
    return category.includeBusinessName ? `${siteName} - ${title}` : title;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <LoadingSpinner />
        <div className="text-neutral-400 text-sm">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Footer Categories</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage footer category titles</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} /> Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
        {categories.length === 0 ? (
          <div className="px-4 py-8 text-center text-neutral-400 text-sm">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-surface-700">
              {categories.map((category) => (
                <div key={category.id} className="p-3 hover:bg-surface-700 active:bg-surface-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Order Badge and Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-surface-800 text-neutral-300 text-[10px] font-bold rounded">
                          <FaSortNumericDown size={10} /> #{category.displayOrder}
                        </span>
                        <button
                          onClick={() => handleToggleActive(category.id)}
                          className="flex items-center gap-1 active:scale-95 transition"
                        >
                          {category.isActive ? (
                            <FaToggleOn size={18} className="text-green-500" />
                          ) : (
                            <FaToggleOff size={18} className="text-neutral-500" />
                          )}
                        </button>
                      </div>

                      {/* Category Title */}
                      <h3 className="text-sm font-bold text-white truncate">
                        {getCategoryTitle(category)}
                      </h3>

                      {/* Bilingual Titles */}
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        EN: {category.categoryTitle_en} | SV: {category.categoryTitle_sv}
                      </p>

                      {/* Business Name Indicator */}
                      {category.includeBusinessName && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-primary-600/20 text-primary-400 text-[10px] font-medium rounded">
                          <FaBuilding size={8} /> Includes Business Name
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-900/20 text-red-600 rounded-lg hover:bg-red-900/20 active:scale-95 transition"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-700">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Business Name
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
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-surface-700">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-800 text-neutral-300 text-xs font-bold rounded">
                          <FaSortNumericDown size={10} /> {category.displayOrder}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-bold text-white">
                          {getCategoryTitle(category)}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          EN: {category.categoryTitle_en} | SV: {category.categoryTitle_sv}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        {category.includeBusinessName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-600/20 text-primary-400 text-xs font-medium rounded">
                            <FaBuilding size={10} /> Yes
                          </span>
                        ) : (
                          <span className="text-neutral-500">No</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(category.id)}
                          className="flex items-center gap-1.5 active:scale-95 transition"
                        >
                          {category.isActive ? (
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
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 bg-red-900/20 text-red-600 rounded-lg hover:bg-red-900/20 active:scale-95 transition"
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
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
              {/* Category Titles - Bilingual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryTitle_en}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryTitle_en: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="e.g., Quick Links"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Title (Swedish) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryTitle_sv}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryTitle_sv: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="t.ex. Snabblänkar"
                  />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
                <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                  Lower numbers appear first in the footer
                </p>
              </div>

              {/* Include Business Name Toggle */}
              <div className="bg-surface-800 rounded-lg p-3 sm:p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FaBuilding size={14} className="text-primary-400" />
                    <span className="text-xs sm:text-sm font-medium text-neutral-300">Include Business Name</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, includeBusinessName: !formData.includeBusinessName })}
                    className="active:scale-95 transition"
                  >
                    {formData.includeBusinessName ? (
                      <FaToggleOn size={28} className="text-primary-400" />
                    ) : (
                      <FaToggleOff size={28} className="text-neutral-500" />
                    )}
                  </button>
                </label>
                {formData.includeBusinessName && (
                  <div className="mt-3 bg-primary-600/10 border border-primary-500/30 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-primary-300">
                      <span className="font-bold">Preview:</span> {siteName} - {formData.categoryTitle_en || '[Category Title]'}
                    </p>
                  </div>
                )}
              </div>

              {/* Active Status Toggle */}
              <div className="bg-surface-800 rounded-lg p-3 sm:p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs sm:text-sm font-medium text-neutral-300">Active (visible on website)</span>
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
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterCategoriesManager;
