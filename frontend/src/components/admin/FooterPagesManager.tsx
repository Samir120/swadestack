import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import { footerApi } from '../../models/api/footerApi';
import {
  FooterCategoryTitle,
  FooterMainPage,
  CreateFooterMainPage,
  UpdateFooterMainPage,
} from '../../models/types/footer.types';
import RichTextEditor from '../common/RichTextEditor';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaToggleOn, FaToggleOff, FaBuilding, FaSortNumericDown, FaLink, FaFolder, FaCalendarAlt, FaCode } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * FooterPagesManager Component
 * Admin interface for managing footer main pages with HTML content editor
 */
const FooterPagesManager: React.FC = () => {
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
  const [pages, setPages] = useState<FooterMainPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<FooterMainPage | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form data
  const [formData, setFormData] = useState<CreateFooterMainPage>({
    pageName_en: '',
    pageName_sv: '',
    includeBusinessName: false,
    pageUrl: '',
    footerCategoryTitleId: '',
    displayOrder: 1,
    availableFrom: undefined,
    availableTo: undefined,
    pageHtmlContent_en: '',
    pageHtmlContent_sv: '',
    isHtmlContent: false,
    isActive: true,
  });

  // Load data on mount
  useEffect(() => {
    loadCategories();
    loadPages();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await footerApi.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadPages = async () => {
    try {
      setIsLoading(true);
      // Use admin endpoint to get all pages including inactive ones
      const response = await footerApi.getAllPages();
      if (response.success && response.data) {
        setPages(response.data);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPage(null);
    setFormData({
      pageName_en: '',
      pageName_sv: '',
      includeBusinessName: false,
      pageUrl: '',
      footerCategoryTitleId: categories.length > 0 ? categories[0].id : '',
      displayOrder: pages.length + 1,
      availableFrom: undefined,
      availableTo: undefined,
      pageHtmlContent_en: '',
      pageHtmlContent_sv: '',
      isHtmlContent: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = async (page: FooterMainPage) => {
    try {
      // Fetch full page details including HTML content
      const response = await footerApi.getPageById(page.id);
      if (response.success && response.data) {
        const fullPage = response.data;
        setEditingPage(fullPage);
        setFormData({
          pageName_en: fullPage.pageName_en,
          pageName_sv: fullPage.pageName_sv,
          includeBusinessName: fullPage.includeBusinessName,
          pageUrl: fullPage.pageUrl,
          footerCategoryTitleId: fullPage.footerCategoryTitleId,
          displayOrder: fullPage.displayOrder,
          availableFrom: fullPage.availableFrom
            ? new Date(fullPage.availableFrom).toISOString().split('T')[0]
            : undefined,
          availableTo: fullPage.availableTo
            ? new Date(fullPage.availableTo).toISOString().split('T')[0]
            : undefined,
          pageHtmlContent_en: fullPage.pageHtmlContent_en || '',
          pageHtmlContent_sv: fullPage.pageHtmlContent_sv || '',
          isHtmlContent: fullPage.isHtmlContent || false,
          isActive: fullPage.isActive,
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to load page details:', error);
      toast.error('Failed to load page details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.footerCategoryTitleId) {
      toast.warning('Please select a category');
      return;
    }

    try {
      const submitData = {
        ...formData,
        availableFrom: formData.availableFrom
          ? new Date(formData.availableFrom).toISOString()
          : undefined,
        availableTo: formData.availableTo
          ? new Date(formData.availableTo).toISOString()
          : undefined,
      };

      if (editingPage) {
        // Update existing page
        const updateData: UpdateFooterMainPage = submitData;
        const response = await footerApi.updatePage(editingPage.id, updateData);
        if (response.success) {
          await loadPages();
          setShowModal(false);
          toast.success('Page updated successfully!');
        } else {
          toast.error('Failed to update page: ' + response.message);
        }
      } else {
        // Create new page
        const response = await footerApi.createPage(submitData);
        if (response.success) {
          await loadPages();
          setShowModal(false);
          toast.success('Page created successfully!');
        } else {
          toast.error('Failed to create page: ' + response.message);
        }
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error saving page');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Page',
      message: 'Are you sure you want to delete this page? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await footerApi.deletePage(id);
      if (response.success) {
        await loadPages();
        toast.success('Page deleted successfully!');
      } else {
        toast.error('Failed to delete page: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Error deleting page');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await footerApi.togglePageActive(id);
      if (response.success) {
        await loadPages();
      } else {
        toast.error('Failed to toggle page status: ' + response.message);
      }
    } catch (error) {
      console.error('Error toggling page status:', error);
      toast.error('Error toggling page status');
    }
  };

  const getPageName = (page: FooterMainPage) => {
    const name = language === 'en' ? page.pageName_en : page.pageName_sv;
    return page.includeBusinessName ? `${siteName} - ${name}` : name;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return 'Unknown';
    return language === 'en' ? category.categoryTitle_en : category.categoryTitle_sv;
  };

  const filteredPages =
    selectedCategoryFilter === 'all'
      ? pages
      : pages.filter((p) => p.footerCategoryTitleId === selectedCategoryFilter);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <LoadingSpinner />
        <div className="text-neutral-400 text-sm">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Footer Pages</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Manage footer pages with custom HTML content</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} /> Add Page
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-surface-850 rounded-lg shadow-dark-md p-3 sm:p-4">
        <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">
          <FaFolder className="inline mr-1.5" size={12} /> Filter by Category
        </label>
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {language === 'en' ? cat.categoryTitle_en : cat.categoryTitle_sv}
            </option>
          ))}
        </select>
      </div>

      {/* Pages List */}
      <div className="bg-surface-850 rounded-lg shadow-dark-md overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="px-4 py-8 text-center text-neutral-400 text-sm">
            No pages found. Create your first page to get started.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-surface-700">
              {filteredPages.map((page) => (
                <div key={page.id} className="p-3 hover:bg-surface-800 active:bg-surface-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Order Badge and Status Toggle */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-surface-800 text-neutral-300 text-[10px] font-bold rounded">
                          <FaSortNumericDown size={10} /> #{page.displayOrder}
                        </span>
                        <button
                          onClick={() => handleToggleActive(page.id)}
                          className="flex items-center gap-1 active:scale-95 transition"
                        >
                          {page.isActive ? (
                            <FaToggleOn size={18} className="text-green-500" />
                          ) : (
                            <FaToggleOff size={18} className="text-neutral-500" />
                          )}
                        </button>
                      </div>

                      {/* Page Name */}
                      <h3 className="text-sm font-bold text-white truncate">
                        {getPageName(page)}
                      </h3>

                      {/* Category */}
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-medium rounded">
                        <FaFolder size={8} /> {getCategoryName(page.footerCategoryTitleId)}
                      </span>

                      {/* URL */}
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400">
                        <FaLink size={8} />
                        <span className="truncate">{page.pageUrl}</span>
                      </div>

                      {/* Business Name Indicator */}
                      {page.includeBusinessName && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-primary-600/20 text-primary-400 text-[10px] font-medium rounded">
                          <FaBuilding size={8} /> Includes Business Name
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleEdit(page)}
                        className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 active:scale-95 transition"
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
                      Page Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      URL
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
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-surface-800">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-800 text-neutral-300 text-xs font-bold rounded">
                          <FaSortNumericDown size={10} /> {page.displayOrder}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-bold text-white">{getPageName(page)}</div>
                        <div className="text-xs text-neutral-400 mt-1">
                          EN: {page.pageName_en} | SV: {page.pageName_sv}
                        </div>
                        {page.includeBusinessName && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-primary-600/20 text-primary-400 text-[10px] font-medium rounded">
                            <FaBuilding size={8} /> Business Name
                          </span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-medium rounded">
                          <FaFolder size={10} /> {getCategoryName(page.footerCategoryTitleId)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                        <a
                          href={page.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm truncate max-w-[200px]"
                        >
                          <FaLink size={10} /> {page.pageUrl}
                        </a>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(page.id)}
                          className="flex items-center gap-1.5 active:scale-95 transition"
                        >
                          {page.isActive ? (
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
                            onClick={() => handleEdit(page)}
                            className="p-2 bg-primary-600/10 text-primary-400 rounded-lg hover:bg-primary-600/20 active:scale-95 transition"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 active:scale-95 transition"
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
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-4xl lg:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">
                {editingPage ? 'Edit Footer Page' : 'Add New Footer Page'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-400 hover:bg-surface-800 rounded-lg active:scale-95 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Page Names - Bilingual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Page Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pageName_en}
                    onChange={(e) =>
                      setFormData({ ...formData, pageName_en: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="e.g., Privacy Policy"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Page Name (Swedish) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pageName_sv}
                    onChange={(e) =>
                      setFormData({ ...formData, pageName_sv: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="t.ex. Integritetspolicy"
                  />
                </div>
              </div>

              {/* Page URL and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaLink className="inline mr-1" size={10} /> Page URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pageUrl}
                    onChange={(e) => setFormData({ ...formData, pageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    placeholder="/privacy-policy"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    Internal path or external URL
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaFolder className="inline mr-1" size={10} /> Category *
                  </label>
                  <select
                    required
                    value={formData.footerCategoryTitleId}
                    onChange={(e) =>
                      setFormData({ ...formData, footerCategoryTitleId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'en' ? cat.categoryTitle_en : cat.categoryTitle_sv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                  <FaSortNumericDown className="inline mr-1" size={10} /> Display Order
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
                  Lower numbers appear first in the category
                </p>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaCalendarAlt className="inline mr-1" size={10} /> Available From
                  </label>
                  <input
                    type="date"
                    value={formData.availableFrom || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, availableFrom: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    Leave empty for immediate availability
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    <FaCalendarAlt className="inline mr-1" size={10} /> Available To
                  </label>
                  <input
                    type="date"
                    value={formData.availableTo || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, availableTo: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">
                    Leave empty for indefinite availability
                  </p>
                </div>
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
                      <span className="font-bold">Preview:</span> {siteName} - {formData.pageName_en || '[Page Name]'}
                    </p>
                  </div>
                )}
              </div>

              {/* HTML Mode Toggle */}
              <div className="bg-surface-800 rounded-lg p-3 sm:p-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FaCode size={14} className="text-amber-400" />
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-neutral-300">HTML Mode</span>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Paste raw HTML instead of using the rich text editor
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isHtmlContent: !formData.isHtmlContent })}
                    className="active:scale-95 transition"
                  >
                    {formData.isHtmlContent ? (
                      <FaToggleOn size={28} className="text-amber-400" />
                    ) : (
                      <FaToggleOff size={28} className="text-neutral-500" />
                    )}
                  </button>
                </label>
              </div>

              {/* HTML Content - Bilingual Editors */}
              {formData.isHtmlContent && (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                  <FaCode className="text-amber-400 mt-0.5 flex-shrink-0" size={13} />
                  <p className="text-xs text-neutral-400">
                    Embedded <code className="text-amber-300">&lt;style&gt;</code>, <code className="text-amber-300">&lt;head&gt;</code>, and <code className="text-amber-300">&lt;body&gt;</code> tags are stripped on the frontend. Styling is applied automatically by the site theme — only HTML structure and class names are used.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {formData.isHtmlContent ? (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                        <FaCode className="inline mr-1" size={10} /> Raw HTML Content (English)
                      </label>
                      <textarea
                        value={formData.pageHtmlContent_en}
                        onChange={(e) =>
                          setFormData({ ...formData, pageHtmlContent_en: e.target.value })
                        }
                        placeholder="Paste raw HTML content in English..."
                        rows={12}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-surface-600 rounded-lg text-slate-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-[13px] leading-relaxed resize-y"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                        <FaCode className="inline mr-1" size={10} /> Raw HTML Content (Swedish)
                      </label>
                      <textarea
                        value={formData.pageHtmlContent_sv}
                        onChange={(e) =>
                          setFormData({ ...formData, pageHtmlContent_sv: e.target.value })
                        }
                        placeholder="Klistra in rå HTML-innehåll på svenska..."
                        rows={12}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-surface-600 rounded-lg text-slate-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-[13px] leading-relaxed resize-y"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <RichTextEditor
                        label="Page HTML Content (English)"
                        value={formData.pageHtmlContent_en}
                        onChange={(value) =>
                          setFormData({ ...formData, pageHtmlContent_en: value })
                        }
                        placeholder="Enter HTML content in English..."
                        height="200px"
                      />
                    </div>
                    <div>
                      <RichTextEditor
                        label="Page HTML Content (Swedish)"
                        value={formData.pageHtmlContent_sv}
                        onChange={(value) =>
                          setFormData({ ...formData, pageHtmlContent_sv: value })
                        }
                        placeholder="Ange HTML-innehåll på svenska..."
                        height="200px"
                      />
                    </div>
                  </>
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
                className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg text-neutral-300 font-bold text-sm hover:bg-surface-800 active:scale-[0.98] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-500 active:scale-[0.98] transition"
              >
                {editingPage ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterPagesManager;
