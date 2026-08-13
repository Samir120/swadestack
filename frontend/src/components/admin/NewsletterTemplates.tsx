import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Plus, MoreVertical, Edit2, Copy, Trash2, Mail } from '../common/icons';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import { TemplateListItem } from '../../models/types/newsletterAdmin.types';

const NewsletterTemplates: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await newsletterAdminApi.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleCreate = async () => {
    try {
      const response = await newsletterAdminApi.createTemplate({
        name: 'Untitled Template',
        globalStyles: {
          emailWidth: 600,
          backgroundColor: '#F1F5F9',
          contentBackgroundColor: '#FFFFFF',
          defaultFont: 'Arial, sans-serif',
          defaultTextColor: '#1E293B',
          defaultLinkColor: '#3B82F6',
          header: {
            showLogo: true,
            logoWidth: 150,
            alignment: 'center',
            backgroundColor: '#FFFFFF',
            padding: 24,
          },
        },
        footerConfig: {
          showUnsubscribe: true,
          unsubscribeText: 'Unsubscribe from this list',
          backgroundColor: '#F8FAFC',
          textColor: '#64748B',
          padding: 24,
        },
        socialMediaConfig: {
          style: 'icons',
          alignment: 'center',
          iconSize: 24,
          platforms: [],
        },
        contentBlocks: [],
      });
      if (response.success && response.data) {
        navigate(`/admin/newsletters/templates/${response.data.id}`);
      }
    } catch {
      // silently handle
    }
  };

  const handleDuplicate = async (id: string) => {
    setDropdownOpen(null);
    const response = await newsletterAdminApi.duplicateTemplate(id);
    if (response.success) {
      loadTemplates();
    }
  };

  const handleSetDefault = async (id: string) => {
    setDropdownOpen(null);
    const response = await newsletterAdminApi.setTemplateDefault(id);
    if (response.success) {
      loadTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    setDropdownOpen(null);
    setDeleteConfirm(null);
    const response = await newsletterAdminApi.deleteTemplate(id);
    if (response.success) {
      loadTemplates();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t('newsletterAdmin.templates.title', 'Templates')}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {t('newsletterAdmin.templates.subtitle', 'Reusable newsletter designs')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('newsletterAdmin.templates.createTemplate', 'Create Template')}
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-surface-800 border border-surface-700 rounded-xl hover:border-surface-600 transition-colors group"
          >
            {/* Preview Thumbnail */}
            <div
              className="h-40 sm:h-48 bg-surface-900 flex items-center justify-center cursor-pointer relative overflow-hidden rounded-t-xl"
              onClick={() => navigate(`/admin/newsletters/templates/${template.id}`)}
            >
              {template.previewThumbnailUrl ? (
                <img
                  src={template.previewThumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center text-neutral-500">
                  <Mail className="w-10 h-10 mb-2" />
                  <span className="text-xs">
                    {t('newsletterAdmin.templates.noPreview', 'No preview available')}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('newsletterAdmin.templates.editTemplate', 'Edit Template')}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {template.usageCount === 0
                      ? t('newsletterAdmin.templates.neverUsed', 'Never used')
                      : t('newsletterAdmin.templates.usedTimes', 'Used {{count}} times', {
                          count: template.usageCount,
                        })}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => navigate(`/admin/newsletters/templates/${template.id}`)}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
                    title={t('newsletterAdmin.templates.edit', 'Edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === template.id ? null : template.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {dropdownOpen === template.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-10 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDuplicate(template.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-surface-700 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                          {t('newsletterAdmin.templates.duplicate', 'Duplicate')}
                        </button>
                        {!template.isDefault && (
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-surface-700 hover:text-white"
                          >
                            <Star className="w-4 h-4" />
                            {t('newsletterAdmin.templates.setDefault', 'Set as Default')}
                          </button>
                        )}
                        {!template.isDefault && (
                          <>
                            <div className="border-t border-surface-700 my-1" />
                            {deleteConfirm === template.id ? (
                              <button
                                onClick={() => handleDelete(template.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('newsletterAdmin.templates.confirmDelete', 'Click to confirm')}
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(template.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600/10"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('newsletterAdmin.templates.delete', 'Delete')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button
          onClick={handleCreate}
          className="h-full min-h-[200px] sm:min-h-[280px] border-2 border-dashed border-surface-600 rounded-xl flex flex-col items-center justify-center gap-3 text-neutral-400 hover:text-primary-400 hover:border-primary-500/50 transition-colors cursor-pointer"
        >
          <Plus className="w-8 h-8" />
          <span className="text-sm font-medium">
            {t('newsletterAdmin.templates.createNew', 'Create New')}
          </span>
        </button>
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 mb-4">
            {t('newsletterAdmin.templates.empty', 'No templates yet. Create your first one!')}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsletterTemplates;
