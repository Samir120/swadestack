import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import { CampaignListItem, CampaignStatus, CampaignValidation, TemplateListItem, SegmentListItem, AdminSubscriberListItem } from '../../models/types/newsletterAdmin.types';
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaCopy,
  FaTrash,
  FaBan,
  FaPen,
  FaChevronLeft,
  FaChevronRight,
  FaPaperPlane,
  FaChartBar,
  FaClock,
  FaUser,
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const STATUS_TABS: Array<{ key: string; value?: CampaignStatus }> = [
  { key: 'all' },
  { key: 'draft', value: 'draft' },
  { key: 'scheduled', value: 'scheduled' },
  { key: 'sent', value: 'sent' },
  { key: 'failed', value: 'failed' },
];

const NewsletterCampaigns: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', subject: '', previewText: '', templateId: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', subject: '', previewText: '', templateId: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Send modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendCampaignId, setSendCampaignId] = useState<string | null>(null);
  const [sendCampaignName, setSendCampaignName] = useState('');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [validation, setValidation] = useState<CampaignValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Recipient targeting
  const [targetingMode, setTargetingMode] = useState<'all' | 'segments' | 'subscribers'>('all');
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [segments, setSegments] = useState<SegmentListItem[]>([]);
  const [segmentsLoaded, setSegmentsLoaded] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<AdminSubscriberListItem[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberResults, setSubscriberResults] = useState<AdminSubscriberListItem[]>([]);
  const [isSearchingSubscribers, setIsSearchingSubscribers] = useState(false);
  const subscriberSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusTab = STATUS_TABS.find(t => t.key === activeTab);
      const response = await newsletterAdminApi.getCampaigns({
        status: statusTab?.value,
        search: search || undefined,
        page,
        pageSize,
      });
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, page, pageSize]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const openCreateModal = async () => {
    setShowCreateModal(true);
    if (!templatesLoaded) {
      try {
        const res = await newsletterAdminApi.getTemplates();
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch { /* ignore */ }
      setTemplatesLoaded(true);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.subject) return;
    setIsCreating(true);
    try {
      // Find selected template and copy its content blocks
      const selectedTemplate = templates.find(t => t.id === createForm.templateId);
      const contentJson = selectedTemplate?.contentBlocks?.length
        ? { blocks: selectedTemplate.contentBlocks }
        : undefined;

      await newsletterAdminApi.createCampaign({
        name: createForm.name,
        subject: createForm.subject,
        previewText: createForm.previewText || undefined,
        contentJson,
        templateId: createForm.templateId || undefined,
      });
      toast.success(t('newsletterAdmin.campaigns.created'));
      setShowCreateModal(false);
      setCreateForm({ name: '', subject: '', previewText: '', templateId: '' });
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await newsletterAdminApi.duplicateCampaign(id);
      toast.success(t('newsletterAdmin.campaigns.duplicated'));
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to duplicate campaign');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('newsletterAdmin.campaigns.confirmDelete'))) return;
    try {
      await newsletterAdminApi.deleteCampaign(id);
      toast.success(t('newsletterAdmin.campaigns.deleted'));
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete campaign');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('newsletterAdmin.campaigns.confirmCancel'))) return;
    try {
      await newsletterAdminApi.cancelCampaign(id);
      toast.success(t('newsletterAdmin.campaigns.cancelled'));
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel campaign');
    }
  };

  const openEditModal = async (campaign: CampaignListItem) => {
    setEditCampaignId(campaign.id);
    setEditForm({
      name: campaign.name,
      subject: campaign.subject,
      previewText: campaign.previewText || '',
      templateId: campaign.templateId || '',
    });
    setShowEditModal(true);
    if (!templatesLoaded) {
      try {
        const res = await newsletterAdminApi.getTemplates();
        if (res.success && res.data) {
          setTemplates(res.data);
        }
      } catch { /* ignore */ }
      setTemplatesLoaded(true);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCampaignId || !editForm.name || !editForm.subject) return;
    setIsUpdating(true);
    try {
      await newsletterAdminApi.updateCampaign(editCampaignId, {
        name: editForm.name,
        subject: editForm.subject,
        previewText: editForm.previewText || undefined,
        templateId: editForm.templateId || undefined,
      });
      toast.success(t('newsletterAdmin.campaigns.updated'));
      setShowEditModal(false);
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update campaign');
    } finally {
      setIsUpdating(false);
    }
  };

  const openSendModal = async (campaign: CampaignListItem) => {
    setSendCampaignId(campaign.id);
    setSendCampaignName(campaign.name);
    setSendMode('now');
    setScheduleDate('');
    setScheduleTime('');
    setTestEmail('');
    setValidation(null);
    setShowSendModal(true);

    // Initialize targeting from campaign data
    const hasSubscribers = campaign.targetSubscriberIds && campaign.targetSubscriberIds.length > 0;
    const hasSegments = campaign.targetSegmentIds && campaign.targetSegmentIds.length > 0;
    setTargetingMode(hasSubscribers ? 'subscribers' : hasSegments ? 'segments' : 'all');
    setSelectedSegmentIds(campaign.targetSegmentIds || []);
    setSelectedSubscribers([]);
    setSubscriberSearch('');
    setSubscriberResults([]);

    // Load segments if not already loaded
    if (!segmentsLoaded) {
      try {
        const res = await newsletterAdminApi.getSegments();
        if (res.success && res.data) {
          setSegments(res.data);
        }
      } catch { /* ignore */ }
      setSegmentsLoaded(true);
    }

    // Validate
    setIsValidating(true);
    try {
      const response = await newsletterAdminApi.validateCampaign(campaign.id);
      if (response.success && response.data) {
        setValidation(response.data);
      }
    } catch {
      // leave validation null
    } finally {
      setIsValidating(false);
    }
  };

  const handleSend = async () => {
    if (!sendCampaignId) return;
    setIsSending(true);
    try {
      if (sendMode === 'schedule') {
        if (!scheduleDate || !scheduleTime) {
          toast.error(t('newsletterAdmin.campaigns.send.scheduleDateRequired', 'Please select a date and time'));
          setIsSending(false);
          return;
        }
        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
        await newsletterAdminApi.scheduleCampaign(sendCampaignId, scheduledAt);
        toast.success(t('newsletterAdmin.campaigns.send.scheduled', 'Campaign scheduled'));
      } else {
        await newsletterAdminApi.sendCampaign(sendCampaignId);
        toast.success(t('newsletterAdmin.campaigns.send.sending', 'Campaign sending initiated'));
      }
      setShowSendModal(false);
      loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!sendCampaignId || !testEmail) return;
    setIsSendingTest(true);
    try {
      await newsletterAdminApi.sendTestEmail(sendCampaignId, testEmail);
      toast.success(t('newsletterAdmin.campaigns.send.testSent', 'Test email sent'));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTargetingChange = async (mode: 'all' | 'segments' | 'subscribers') => {
    setTargetingMode(mode);
    if (!sendCampaignId) return;
    const updateData: any = {};
    if (mode === 'all') {
      updateData.targetSegmentIds = [];
      updateData.targetSubscriberIds = [];
    } else if (mode === 'segments') {
      updateData.targetSegmentIds = selectedSegmentIds;
      updateData.targetSubscriberIds = [];
    } else {
      updateData.targetSegmentIds = [];
      updateData.targetSubscriberIds = selectedSubscribers.map(s => s.id);
    }
    try {
      await newsletterAdminApi.updateCampaign(sendCampaignId, updateData);
      const response = await newsletterAdminApi.validateCampaign(sendCampaignId);
      if (response.success && response.data) {
        setValidation(response.data);
      }
    } catch { /* ignore */ }
  };

  const toggleSegment = async (segmentId: string) => {
    const newIds = selectedSegmentIds.includes(segmentId)
      ? selectedSegmentIds.filter(id => id !== segmentId)
      : [...selectedSegmentIds, segmentId];
    setSelectedSegmentIds(newIds);
    if (!sendCampaignId) return;
    try {
      await newsletterAdminApi.updateCampaign(sendCampaignId, { targetSegmentIds: newIds });
      const response = await newsletterAdminApi.validateCampaign(sendCampaignId);
      if (response.success && response.data) {
        setValidation(response.data);
      }
    } catch { /* ignore */ }
  };

  const handleSubscriberSearch = useCallback((value: string) => {
    setSubscriberSearch(value);
    clearTimeout(subscriberSearchTimeout.current);
    if (!value.trim()) {
      setSubscriberResults([]);
      return;
    }
    subscriberSearchTimeout.current = setTimeout(async () => {
      setIsSearchingSubscribers(true);
      try {
        const res = await newsletterAdminApi.getSubscribers({ search: value, status: 'active', pageSize: 10 });
        if (res.success && res.data) {
          setSubscriberResults(res.data.subscribers);
        }
      } catch { /* ignore */ }
      setIsSearchingSubscribers(false);
    }, 300);
  }, []);

  const addSubscriber = async (subscriber: AdminSubscriberListItem) => {
    if (selectedSubscribers.find(s => s.id === subscriber.id)) return;
    const updated = [...selectedSubscribers, subscriber];
    setSelectedSubscribers(updated);
    setSubscriberSearch('');
    setSubscriberResults([]);
    if (!sendCampaignId) return;
    try {
      await newsletterAdminApi.updateCampaign(sendCampaignId, { targetSubscriberIds: updated.map(s => s.id) });
      const response = await newsletterAdminApi.validateCampaign(sendCampaignId);
      if (response.success && response.data) {
        setValidation(response.data);
      }
    } catch { /* ignore */ }
  };

  const removeSubscriber = async (subscriberId: string) => {
    const updated = selectedSubscribers.filter(s => s.id !== subscriberId);
    setSelectedSubscribers(updated);
    if (!sendCampaignId) return;
    try {
      await newsletterAdminApi.updateCampaign(sendCampaignId, { targetSubscriberIds: updated.map(s => s.id) });
      const response = await newsletterAdminApi.validateCampaign(sendCampaignId);
      if (response.success && response.data) {
        setValidation(response.data);
      }
    } catch { /* ignore */ }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const styles: Record<string, string> = {
      draft: 'bg-neutral-700/50 text-neutral-300',
      scheduled: 'bg-blue-900/30 text-blue-400',
      sending: 'bg-amber-900/30 text-amber-400',
      sent: 'bg-green-900/30 text-green-400',
      failed: 'bg-red-900/30 text-red-400',
      cancelled: 'bg-neutral-700/50 text-neutral-400',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${styles[status] || styles.draft}`}>
        {t(`newsletterAdmin.campaigns.${status}`)}
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">{t('newsletterAdmin.campaigns.title')}</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
            {t('newsletterAdmin.campaigns.subtitle')}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
        >
          <FaPlus className="text-xs" />
          {t('newsletterAdmin.campaigns.create')}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
            }`}
          >
            {t(`newsletterAdmin.campaigns.${tab.key}`)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder={t('newsletterAdmin.campaigns.search')}
          className="w-full pl-10 pr-10 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
        />
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-6 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {search ? t('newsletterAdmin.campaigns.noResults') : t('newsletterAdmin.campaigns.noCampaigns')}
            </h3>
            {!search && (
              <p className="text-sm text-neutral-400 mb-4">{t('newsletterAdmin.campaigns.noCampaignsDesc')}</p>
            )}
            {!search && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500"
              >
                {t('newsletterAdmin.campaigns.create')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Campaign Cards */}
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 truncate">{campaign.subject}</p>
                    {campaign.previewText && (
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{campaign.previewText}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span>{formatDate(campaign.createdAt)}</span>
                      {campaign.sentAt && <span>Sent {formatDate(campaign.sentAt)}</span>}
                      {campaign.sentByAdmin && (
                        <span>by {campaign.sentByAdmin.firstName} {campaign.sentByAdmin.lastName}</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {campaign.stats && campaign.stats.totalSent > 0 && (
                    <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center flex-shrink-0 w-full sm:w-auto sm:flex">
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">{campaign.stats.totalSent}</p>
                        <p className="text-[10px] uppercase text-neutral-500 font-bold">{t('newsletterAdmin.campaigns.stats.sent')}</p>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">
                          {campaign.stats.openRate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] uppercase text-neutral-500 font-bold">{t('newsletterAdmin.campaigns.stats.opened')}</p>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">
                          {campaign.stats.clickRate.toFixed(1)}%
                        </p>
                        <p className="text-[10px] uppercase text-neutral-500 font-bold">{t('newsletterAdmin.campaigns.stats.clicked')}</p>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">{campaign.stats.totalUnsubscribed}</p>
                        <p className="text-[10px] uppercase text-neutral-500 font-bold">{t('newsletterAdmin.campaigns.stats.unsubscribed')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-700">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => openSendModal(campaign)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
                    >
                      <FaPaperPlane className="text-[10px]" />
                      {t('newsletterAdmin.campaigns.send.send', 'Send')}
                    </button>
                  )}
                  {(campaign.status === 'sent' || campaign.status === 'sending') && (
                    <button
                      onClick={() => navigate(`/admin/newsletters/campaigns/${campaign.id}/report`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
                    >
                      <FaChartBar className="text-[10px]" />
                      {t('newsletterAdmin.campaigns.report', 'Report')}
                    </button>
                  )}
                  {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                    <button
                      onClick={() => openEditModal(campaign)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 transition-colors"
                    >
                      <FaPen className="text-[10px]" />
                      {t('newsletterAdmin.campaigns.edit')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(campaign.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 transition-colors"
                  >
                    <FaCopy className="text-[10px]" />
                    {t('newsletterAdmin.campaigns.duplicate')}
                  </button>
                  {(campaign.status === 'scheduled' || campaign.status === 'sending') && (
                    <button
                      onClick={() => handleCancel(campaign.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400 bg-amber-900/20 border border-amber-500/20 rounded-lg hover:bg-amber-900/30 transition-colors"
                    >
                      <FaBan className="text-[10px]" />
                      {t('newsletterAdmin.campaigns.cancel')}
                    </button>
                  )}
                  {campaign.status !== 'sending' && (
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/30 transition-colors"
                    >
                      <FaTrash className="text-[10px]" />
                      {t('newsletterAdmin.campaigns.delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-neutral-400">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        page === pageNum ? 'bg-primary-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-surface-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700">
              <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.campaigns.create')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.name')}</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.subject')}</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.previewText')}</label>
                <input
                  type="text"
                  value={createForm.previewText}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, previewText: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">
                  {t('newsletterAdmin.templates.title', 'Template')} *
                </label>
                <select
                  value={createForm.templateId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, templateId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="">{t('newsletterAdmin.campaigns.selectTemplate', 'Select a template...')}</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}{tmpl.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
                {templates.length === 0 && templatesLoaded && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {t('newsletterAdmin.templates.empty', 'No templates yet. Create your first one!')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700"
                >
                  {t('newsletterAdmin.campaigns.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50"
                >
                  {isCreating ? '...' : t('newsletterAdmin.campaigns.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editCampaignId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700">
              <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.campaigns.edit')}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.name')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.subject')}</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.campaigns.previewText')}</label>
                <input
                  type="text"
                  value={editForm.previewText}
                  onChange={(e) => setEditForm(prev => ({ ...prev, previewText: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">
                  {t('newsletterAdmin.templates.title', 'Template')}
                </label>
                <select
                  value={editForm.templateId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, templateId: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="">{t('newsletterAdmin.campaigns.selectTemplate', 'Select a template...')}</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}{tmpl.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700"
                >
                  {t('newsletterAdmin.campaigns.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50"
                >
                  {isUpdating ? '...' : t('newsletterAdmin.campaigns.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendModal && sendCampaignId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSendModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700 flex-shrink-0">
              <div className="min-w-0 mr-2">
                <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.campaigns.send.title', 'Send Campaign')}</h3>
                <p className="text-xs text-neutral-400 mt-0.5 truncate">{sendCampaignName}</p>
              </div>
              <button onClick={() => setShowSendModal(false)} className="text-neutral-400 hover:text-white flex-shrink-0">
                <FaTimes />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
              {/* Validation */}
              {isValidating ? (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <LoadingSpinner /> {t('newsletterAdmin.campaigns.send.validating', 'Validating...')}
                </div>
              ) : validation ? (
                <div>
                  {validation.valid ? (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                      <span className="text-green-400 text-sm font-bold">
                        {t('newsletterAdmin.campaigns.send.recipientCount', '{{count}} recipients', { count: validation.recipientCount })}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg space-y-1">
                      {validation.errors.map((err, i) => (
                        <p key={i} className="text-red-400 text-sm">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Recipient Targeting */}
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">
                  {t('newsletterAdmin.campaigns.send.recipients', 'Recipients')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  <button
                    onClick={() => handleTargetingChange('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      targetingMode === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-neutral-300 border border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    {t('newsletterAdmin.campaigns.send.allSubscribers', 'All Subscribers')}
                  </button>
                  <button
                    onClick={() => handleTargetingChange('segments')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      targetingMode === 'segments'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-neutral-300 border border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    {t('newsletterAdmin.campaigns.send.specificSegments', 'Specific Segments')}
                  </button>
                  <button
                    onClick={() => handleTargetingChange('subscribers')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      targetingMode === 'subscribers'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-neutral-300 border border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    <FaUser className="inline text-[10px] mr-1" />
                    {t('newsletterAdmin.campaigns.send.specificSubscribers', 'Subscribers')}
                  </button>
                </div>
                {targetingMode === 'segments' && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {segments.length === 0 ? (
                      <p className="text-xs text-neutral-500">{t('newsletterAdmin.segments.noSegments')}</p>
                    ) : (
                      segments.map((segment) => (
                        <label
                          key={segment.id}
                          className="flex items-center gap-3 p-2.5 bg-surface-800 border border-surface-700 rounded-lg cursor-pointer hover:bg-surface-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSegmentIds.includes(segment.id)}
                            onChange={() => toggleSegment(segment.id)}
                            className="rounded border-surface-600 text-primary-600 focus:ring-primary-500/50"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold text-white">{segment.name}</span>
                            <span className="text-xs text-neutral-500 ml-2">
                              {segment.subscriberCount} {t('newsletterAdmin.segments.members')}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                    {selectedSegmentIds.length === 0 && segments.length > 0 && (
                      <p className="text-xs text-amber-400 mt-1">
                        {t('newsletterAdmin.campaigns.send.selectAtLeastOne', 'Select at least one segment')}
                      </p>
                    )}
                  </div>
                )}
                {targetingMode === 'subscribers' && (
                  <div>
                    {/* Subscriber search */}
                    <div className="relative mb-2">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
                      <input
                        type="text"
                        value={subscriberSearch}
                        onChange={(e) => handleSubscriberSearch(e.target.value)}
                        placeholder={t('newsletterAdmin.campaigns.send.searchSubscribers', 'Search by email or name...')}
                        className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    {/* Search results dropdown */}
                    {subscriberSearch && (
                      <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
                        {isSearchingSubscribers ? (
                          <p className="text-xs text-neutral-500 p-2">...</p>
                        ) : subscriberResults.length === 0 ? (
                          <p className="text-xs text-neutral-500 p-2">
                            {t('newsletterAdmin.campaigns.send.noSubscribersFound', 'No subscribers found')}
                          </p>
                        ) : (
                          subscriberResults
                            .filter(s => !selectedSubscribers.find(sel => sel.id === s.id))
                            .map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => addSubscriber(sub)}
                                className="w-full flex items-center gap-2 p-2 bg-surface-800 border border-surface-700 rounded-lg text-left hover:bg-surface-700 transition-colors"
                              >
                                <FaPlus className="text-[10px] text-primary-400 flex-shrink-0" />
                                <span className="text-sm text-white truncate">{sub.email}</span>
                                {(sub.firstName || sub.lastName) && (
                                  <span className="text-xs text-neutral-500 truncate">
                                    {[sub.firstName, sub.lastName].filter(Boolean).join(' ')}
                                  </span>
                                )}
                              </button>
                            ))
                        )}
                      </div>
                    )}
                    {/* Selected subscribers */}
                    {selectedSubscribers.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedSubscribers.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 p-2 bg-surface-800 border border-surface-700 rounded-lg"
                          >
                            <FaUser className="text-[10px] text-neutral-500 flex-shrink-0" />
                            <span className="text-sm text-white truncate flex-1">{sub.email}</span>
                            {(sub.firstName || sub.lastName) && (
                              <span className="text-xs text-neutral-500 truncate">
                                {[sub.firstName, sub.lastName].filter(Boolean).join(' ')}
                              </span>
                            )}
                            <button
                              onClick={() => removeSubscriber(sub.id)}
                              className="text-neutral-500 hover:text-red-400 flex-shrink-0"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedSubscribers.length === 0 && (
                      <p className="text-xs text-amber-400 mt-1">
                        {t('newsletterAdmin.campaigns.send.selectAtLeastOneSubscriber', 'Select at least one subscriber')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Send Mode */}
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">
                  {t('newsletterAdmin.campaigns.send.when', 'When to send?')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSendMode('now')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      sendMode === 'now'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-neutral-300 border border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    <FaPaperPlane className="text-xs" />
                    {t('newsletterAdmin.campaigns.send.now', 'Send Now')}
                  </button>
                  <button
                    onClick={() => setSendMode('schedule')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      sendMode === 'schedule'
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-800 text-neutral-300 border border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    <FaClock className="text-xs" />
                    {t('newsletterAdmin.campaigns.send.scheduleLater', 'Schedule')}
                  </button>
                </div>
              </div>

              {/* Schedule fields */}
              {sendMode === 'schedule' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-neutral-400 mb-1">
                      {t('newsletterAdmin.campaigns.send.date', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-neutral-400 mb-1">
                      {t('newsletterAdmin.campaigns.send.time', 'Time')}
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Test email */}
              <div className="border-t border-surface-700 pt-4">
                <label className="block text-sm font-bold text-neutral-300 mb-2">
                  {t('newsletterAdmin.campaigns.send.testEmail', 'Send Test Email')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={!testEmail || isSendingTest}
                    className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 disabled:opacity-50 transition-colors"
                  >
                    {isSendingTest ? '...' : t('newsletterAdmin.campaigns.send.sendTest', 'Send Test')}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700"
                >
                  {t('newsletterAdmin.campaigns.cancel')}
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !validation?.valid || (targetingMode === 'segments' && selectedSegmentIds.length === 0) || (targetingMode === 'subscribers' && selectedSubscribers.length === 0)}
                  className="px-6 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                >
                  {isSending ? '...' : sendMode === 'now'
                    ? t('newsletterAdmin.campaigns.send.confirmSend', 'Send Now')
                    : t('newsletterAdmin.campaigns.send.confirmSchedule', 'Schedule')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterCampaigns;
