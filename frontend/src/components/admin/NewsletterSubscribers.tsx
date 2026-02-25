import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../common/Toast';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import {
  AdminSubscriberListItem,
  AdminSubscriberDetail,
  SubscriberStatus,
  SegmentListItem,
  CreateSegmentData,
} from '../../models/types/newsletterAdmin.types';
import {
  FaSearch,
  FaTimes,
  FaPlus,
  FaTrash,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaUsers,
  FaUserCheck,
  FaUserMinus,
  FaUserPlus,
  FaCog,
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const NewsletterSubscribers: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  // Subscribers state
  const [subscribers, setSubscribers] = useState<AdminSubscriberListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | ''>('');
  const [languageFilter, setLanguageFilter] = useState<'en' | 'sv' | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'email' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Stats
  const [statsData, setStatsData] = useState<{
    total: number;
    active: number;
    unsubscribed: number;
    newThisMonth: number;
  } | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', firstName: '', lastName: '', language: 'en' as 'en' | 'sv' });
  const [isAdding, setIsAdding] = useState(false);

  // Detail modal
  const [selectedSubscriber, setSelectedSubscriber] = useState<AdminSubscriberDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Segments tab
  const [activeTab, setActiveTab] = useState<'subscribers' | 'segments'>('subscribers');
  const [segments, setSegments] = useState<SegmentListItem[]>([]);
  const [isLoadingSegments, setIsLoadingSegments] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [segmentForm, setSegmentForm] = useState<CreateSegmentData>({ name: '', type: 'manual' });
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);

  // Segment member management
  const [showSegmentMembersModal, setShowSegmentMembersModal] = useState(false);
  const [managedSegment, setManagedSegment] = useState<SegmentListItem | null>(null);
  const [segmentMembers, setSegmentMembers] = useState<AdminSubscriberListItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<AdminSubscriberListItem[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const memberSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Export
  const [isExporting, setIsExporting] = useState(false);

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await newsletterAdminApi.getSubscribers({
        search: search || undefined,
        status: statusFilter || undefined,
        language: languageFilter || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });
      if (response.success && response.data) {
        setSubscribers(response.data.subscribers);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, languageFilter, sortBy, sortOrder, page, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const response = await newsletterAdminApi.getDashboard();
      if (response.success && response.data) {
        setStatsData({
          total: response.data.totalSubscribers,
          active: response.data.activeSubscribers,
          unsubscribed: response.data.unsubscribedCount,
          newThisMonth: response.data.newThisMonth,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadSegments = useCallback(async () => {
    setIsLoadingSegments(true);
    try {
      const response = await newsletterAdminApi.getSegments();
      if (response.success && response.data) {
        setSegments(response.data as SegmentListItem[]);
      }
    } catch (error) {
      console.error('Failed to load segments:', error);
    } finally {
      setIsLoadingSegments(false);
    }
  }, []);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'segments') {
      loadSegments();
    }
  }, [activeTab, loadSegments]);

  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email) return;
    setIsAdding(true);
    try {
      await newsletterAdminApi.createSubscriber({
        email: addForm.email,
        firstName: addForm.firstName || undefined,
        lastName: addForm.lastName || undefined,
        language: addForm.language,
      });
      toast.success(t('newsletterAdmin.subscribers.created'));
      setShowAddModal(false);
      setAddForm({ email: '', firstName: '', lastName: '', language: 'en' });
      loadSubscribers();
      loadStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to add subscriber');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm(t('newsletterAdmin.subscribers.confirmDelete'))) return;
    try {
      await newsletterAdminApi.deleteSubscriber(id);
      toast.success(t('newsletterAdmin.subscribers.deleted'));
      loadSubscribers();
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t('newsletterAdmin.subscribers.confirmBulkDelete'))) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => newsletterAdminApi.deleteSubscriber(id)));
      toast.success(`${selectedIds.size} ${t('newsletterAdmin.subscribers.deleted').toLowerCase()}`);
      setSelectedIds(new Set());
      loadSubscribers();
      loadStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete subscribers');
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      const response = await newsletterAdminApi.getSubscriberById(id);
      if (response.success && response.data) {
        setSelectedSubscriber(response.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      toast.error('Failed to load subscriber details');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await newsletterAdminApi.exportSubscribers({
        status: statusFilter || undefined,
        language: languageFilter || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `newsletter-subscribers-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export started', 'CSV file downloading...');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segmentForm.name) return;
    setIsCreatingSegment(true);
    try {
      await newsletterAdminApi.createSegment(segmentForm);
      toast.success(t('newsletterAdmin.segments.created'));
      setShowSegmentModal(false);
      setSegmentForm({ name: '', type: 'manual' });
      loadSegments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create segment');
    } finally {
      setIsCreatingSegment(false);
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!confirm(t('newsletterAdmin.segments.confirmDelete'))) return;
    try {
      await newsletterAdminApi.deleteSegment(id);
      toast.success(t('newsletterAdmin.segments.deleted'));
      loadSegments();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete segment');
    }
  };

  const openSegmentMembers = async (segment: SegmentListItem) => {
    setManagedSegment(segment);
    setSegmentMembers([]);
    setMemberSearch('');
    setMemberSearchResults([]);
    setShowSegmentMembersModal(true);
    setIsLoadingMembers(true);
    try {
      // Load subscribers that are in this segment by fetching subscriber details
      // We use the subscribers endpoint and filter client-side for now
      const res = await newsletterAdminApi.getSubscribers({ pageSize: 200 });
      if (res.success && res.data) {
        // Load each subscriber's detail to check segment membership
        // Better approach: load all subscribers and check which ones are in this segment
        // We'll fetch detail for each to check segments
        const allSubs = res.data.subscribers;
        const membersInSegment: AdminSubscriberListItem[] = [];
        // Batch check - get detail for up to 50 at a time
        for (const sub of allSubs) {
          try {
            const detail = await newsletterAdminApi.getSubscriberById(sub.id);
            if (detail.success && detail.data && detail.data.segments.some(s => s.id === segment.id)) {
              membersInSegment.push(sub);
            }
          } catch { /* skip */ }
        }
        setSegmentMembers(membersInSegment);
      }
    } catch { /* ignore */ }
    setIsLoadingMembers(false);
  };

  const handleMemberSearch = useCallback((value: string) => {
    setMemberSearch(value);
    clearTimeout(memberSearchTimeout.current);
    if (!value.trim()) {
      setMemberSearchResults([]);
      return;
    }
    memberSearchTimeout.current = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const res = await newsletterAdminApi.getSubscribers({ search: value, status: 'active', pageSize: 10 });
        if (res.success && res.data) {
          setMemberSearchResults(res.data.subscribers);
        }
      } catch { /* ignore */ }
      setIsSearchingMembers(false);
    }, 300);
  }, []);

  const handleAddMember = async (subscriber: AdminSubscriberListItem) => {
    if (!managedSegment) return;
    try {
      await newsletterAdminApi.addSegmentMembers(managedSegment.id, [subscriber.id]);
      toast.success(t('newsletterAdmin.segments.memberAdded'));
      setSegmentMembers(prev => [...prev, subscriber]);
      setMemberSearch('');
      setMemberSearchResults([]);
      loadSegments(); // Refresh count
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (subscriberId: string) => {
    if (!managedSegment) return;
    try {
      await newsletterAdminApi.removeSegmentMembers(managedSegment.id, [subscriberId]);
      toast.success(t('newsletterAdmin.segments.memberRemoved'));
      setSegmentMembers(prev => prev.filter(s => s.id !== subscriberId));
      loadSegments(); // Refresh count
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove member');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscribers.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const getStatusBadge = (status: SubscriberStatus) => {
    const styles: Record<string, string> = {
      active: 'bg-green-900/30 text-green-400',
      unsubscribed: 'bg-red-900/30 text-red-400',
      bounced: 'bg-amber-900/30 text-amber-400',
      pending_confirmation: 'bg-blue-900/30 text-blue-400',
    };
    const labels: Record<string, string> = {
      active: t('newsletterAdmin.subscribers.active'),
      unsubscribed: t('newsletterAdmin.subscribers.unsubscribed'),
      bounced: t('newsletterAdmin.subscribers.bounced'),
      pending_confirmation: t('newsletterAdmin.subscribers.pendingConfirmation'),
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays < 1) return 'Today';
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-4xl font-thin text-white">{t('newsletterAdmin.subscribers.title')}</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
            {t('newsletterAdmin.subscribers.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 transition-colors disabled:opacity-50"
          >
            <FaDownload className="text-xs" />
            <span className="hidden sm:inline">{isExporting ? '...' : t('newsletterAdmin.subscribers.export')}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
          >
            <FaPlus className="text-xs" />
            <span className="hidden sm:inline">{t('newsletterAdmin.subscribers.addSubscriber')}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.subscribers.total')}</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{statsData.total}</p>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
                <FaUsers className="text-base sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.subscribers.active')}</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{statsData.active}</p>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-emerald-400">
                <FaUserCheck className="text-base sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.subscribers.unsubscribed')}</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{statsData.unsubscribed}</p>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-red-400">
                <FaUserMinus className="text-base sm:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.subscribers.newThisMonth')}</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{statsData.newThisMonth}</p>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-blue-400">
                <FaUserPlus className="text-base sm:text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Subscribers / Segments */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'subscribers' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
          }`}
        >
          {t('newsletterAdmin.subscribers.title')}
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'segments' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
          }`}
        >
          {t('newsletterAdmin.segments.title')}
        </button>
      </div>

      {/* Subscribers Tab Content */}
      {activeTab === 'subscribers' && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder={t('newsletterAdmin.subscribers.search')}
                className="w-full pl-10 pr-10 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
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
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="flex-1 min-w-0 sm:flex-none px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs sm:text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="">{t('newsletterAdmin.subscribers.allStatuses')}</option>
                <option value="active">{t('newsletterAdmin.subscribers.active')}</option>
                <option value="unsubscribed">{t('newsletterAdmin.subscribers.unsubscribed')}</option>
                <option value="bounced">{t('newsletterAdmin.subscribers.bounced')}</option>
                <option value="pending_confirmation">{t('newsletterAdmin.subscribers.pendingConfirmation')}</option>
              </select>
              <select
                value={languageFilter}
                onChange={(e) => { setLanguageFilter(e.target.value as any); setPage(1); }}
                className="flex-1 min-w-0 sm:flex-none px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs sm:text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="">{t('newsletterAdmin.subscribers.allLanguages')}</option>
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                className="flex-1 min-w-0 sm:flex-none px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs sm:text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="email-asc">Email A-Z</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 p-3 bg-primary-600/10 border border-primary-500/30 rounded-lg">
              <span className="text-xs sm:text-sm text-primary-400 font-bold">
                {selectedIds.size} {t('newsletterAdmin.subscribers.bulkActions.selected')}
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/30"
              >
                <FaTrash className="text-[10px]" />
                {t('newsletterAdmin.subscribers.bulkActions.delete')}
              </button>
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
          ) : subscribers.length === 0 ? (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-6 sm:p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-2xl text-neutral-500" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {search || statusFilter || languageFilter ? t('newsletterAdmin.subscribers.noResults') : t('newsletterAdmin.subscribers.noSubscribers')}
                </h3>
                {!search && !statusFilter && !languageFilter && (
                  <p className="text-sm text-neutral-400">{t('newsletterAdmin.subscribers.noSubscribersDesc')}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500/50 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate break-all">{sub.email}</p>
                            {(sub.firstName || sub.lastName) && (
                              <p className="text-xs text-neutral-400">{sub.firstName} {sub.lastName}</p>
                            )}
                          </div>
                          {getStatusBadge(sub.status)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mt-2">
                          <span>{sub.language.toUpperCase()} &middot; {formatDate(sub.createdAt)}</span>
                          <div className="flex gap-3">
                            <button onClick={() => handleViewDetail(sub.id)} className="text-primary-400 hover:text-primary-300 p-1">
                              <FaEye />
                            </button>
                            <button onClick={() => handleDeleteSubscriber(sub.id)} className="text-red-400 hover:text-red-300 p-1">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-700">
                    <thead className="bg-surface-800">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === subscribers.length && subscribers.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500/50"
                          />
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          {t('newsletterAdmin.subscribers.email')}
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          {t('newsletterAdmin.subscribers.status')}
                        </th>
                        <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          {t('newsletterAdmin.subscribers.language')}
                        </th>
                        <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          {t('newsletterAdmin.subscribers.source')}
                        </th>
                        <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          {t('newsletterAdmin.subscribers.joined')}
                        </th>
                        <th className="px-4 lg:px-6 py-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-700">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-surface-800/50 transition-colors">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(sub.id)}
                              onChange={() => toggleSelect(sub.id)}
                              className="rounded border-surface-600 bg-surface-700 text-primary-600 focus:ring-primary-500/50"
                            />
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="text-sm font-bold text-white">{sub.email}</div>
                            {(sub.firstName || sub.lastName) && (
                              <div className="text-xs text-neutral-400">{sub.firstName} {sub.lastName}</div>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(sub.status)}
                          </td>
                          <td className="hidden md:table-cell px-4 lg:px-6 py-4 text-sm text-neutral-300">
                            {sub.language.toUpperCase()}
                          </td>
                          <td className="hidden lg:table-cell px-4 lg:px-6 py-4 text-sm text-neutral-400">
                            {sub.source ? t(`newsletterAdmin.sources.${sub.source}`) : '—'}
                          </td>
                          <td className="hidden lg:table-cell px-4 lg:px-6 py-4 text-sm text-neutral-400">
                            {formatDate(sub.createdAt)}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewDetail(sub.id)}
                                className="p-1.5 text-neutral-400 hover:text-primary-400 hover:bg-surface-700 rounded-lg transition-colors"
                                title="View"
                              >
                                <FaEye className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-surface-700 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
        </>
      )}

      {/* Segments Tab Content */}
      {activeTab === 'segments' && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('newsletterAdmin.segments.title')}</h3>
            <button
              onClick={() => setShowSegmentModal(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors shrink-0"
            >
              <FaPlus className="text-xs" />
              {t('newsletterAdmin.segments.create')}
            </button>
          </div>

          {isLoadingSegments ? (
            <div className="flex justify-center items-center h-32"><LoadingSpinner /></div>
          ) : segments.length === 0 ? (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-6 sm:p-12">
              <div className="text-center">
                <h3 className="text-base font-bold text-white mb-2">{t('newsletterAdmin.segments.noSegments')}</h3>
                <p className="text-sm text-neutral-400 mb-4">{t('newsletterAdmin.segments.noSegmentsDesc')}</p>
                <button
                  onClick={() => setShowSegmentModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500"
                >
                  {t('newsletterAdmin.segments.create')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments.map((segment) => (
                <div key={segment.id} className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{segment.name}</h4>
                      {segment.description && (
                        <p className="text-xs text-neutral-400 mt-0.5">{segment.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      segment.type === 'auto' ? 'bg-blue-900/30 text-blue-400' : 'bg-neutral-700/50 text-neutral-300'
                    }`}>
                      {t(`newsletterAdmin.segments.${segment.type}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700">
                    <span className="text-sm text-neutral-300">
                      <span className="font-bold text-white">{segment.subscriberCount}</span> {t('newsletterAdmin.segments.members')}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openSegmentMembers(segment)}
                        className="p-1.5 text-neutral-400 hover:text-primary-400 hover:bg-surface-700 rounded-lg transition-colors"
                        title={t('newsletterAdmin.segments.manage')}
                      >
                        <FaCog className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDeleteSegment(segment.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-surface-700 rounded-lg transition-colors"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700">
              <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.subscribers.addModal.title')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubscriber} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.subscribers.addModal.email')}</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.subscribers.addModal.firstName')}</label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.subscribers.addModal.lastName')}</label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.subscribers.addModal.language')}</label>
                <select
                  value={addForm.language}
                  onChange={(e) => setAddForm(prev => ({ ...prev, language: e.target.value as 'en' | 'sv' }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="en">English</option>
                  <option value="sv">Svenska</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50"
                >
                  {isAdding ? t('newsletterAdmin.subscribers.addModal.adding') : t('newsletterAdmin.subscribers.addModal.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriber Detail Modal */}
      {showDetailModal && selectedSubscriber && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700 sticky top-0 bg-surface-850 z-10">
              <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.subscribers.detail.title')}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-neutral-400 hover:text-white"><FaTimes /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-white">{selectedSubscriber.email}</p>
                {(selectedSubscriber.firstName || selectedSubscriber.lastName) && (
                  <p className="text-sm text-neutral-400">{selectedSubscriber.firstName} {selectedSubscriber.lastName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{t('newsletterAdmin.subscribers.status')}</p>
                  {getStatusBadge(selectedSubscriber.status)}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{t('newsletterAdmin.subscribers.language')}</p>
                  <p className="text-sm text-white">{selectedSubscriber.language.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-1">{t('newsletterAdmin.subscribers.source')}</p>
                  <p className="text-sm text-white">
                    {selectedSubscriber.source ? t(`newsletterAdmin.sources.${selectedSubscriber.source}`) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-1">
                    {selectedSubscriber.verifiedAt
                      ? t('newsletterAdmin.subscribers.detail.verified')
                      : t('newsletterAdmin.subscribers.detail.notVerified')
                    }
                  </p>
                  <p className="text-sm text-white">
                    {selectedSubscriber.verifiedAt
                      ? new Date(selectedSubscriber.verifiedAt).toLocaleDateString('sv-SE')
                      : '—'
                    }
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase mb-2">{t('newsletterAdmin.subscribers.detail.segments')}</p>
                {selectedSubscriber.segments.length === 0 ? (
                  <p className="text-sm text-neutral-400">{t('newsletterAdmin.subscribers.detail.noSegments')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubscriber.segments.map(seg => (
                      <span key={seg.id} className="px-2.5 py-1 text-xs font-bold bg-primary-600/10 text-primary-400 border border-primary-500/30 rounded-full">
                        {seg.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-neutral-500 pt-2 border-t border-surface-700">
                <p>{t('newsletterAdmin.subscribers.joined')}: {new Date(selectedSubscriber.createdAt).toLocaleString('sv-SE')}</p>
                {selectedSubscriber.unsubscribedAt && (
                  <p>{t('newsletterAdmin.subscribers.unsubscribed')}: {new Date(selectedSubscriber.unsubscribedAt).toLocaleString('sv-SE')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segment Members Modal */}
      {showSegmentMembersModal && managedSegment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSegmentMembersModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-white">{managedSegment.name}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{t('newsletterAdmin.segments.manage')}</p>
              </div>
              <button onClick={() => setShowSegmentMembersModal(false)} className="text-neutral-400 hover:text-white"><FaTimes /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Add member search */}
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">{t('newsletterAdmin.segments.addMembers')}</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                    placeholder={t('newsletterAdmin.segments.searchSubscribers')}
                    className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                {memberSearch && (
                  <div className="space-y-1 max-h-32 overflow-y-auto mt-2">
                    {isSearchingMembers ? (
                      <p className="text-xs text-neutral-500 p-2">...</p>
                    ) : memberSearchResults.length === 0 ? (
                      <p className="text-xs text-neutral-500 p-2">{t('newsletterAdmin.campaigns.send.noSubscribersFound')}</p>
                    ) : (
                      memberSearchResults
                        .filter(s => !segmentMembers.find(m => m.id === s.id))
                        .map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleAddMember(sub)}
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
              </div>

              {/* Current members */}
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-2">
                  {t('newsletterAdmin.segments.members')} ({segmentMembers.length})
                </label>
                {isLoadingMembers ? (
                  <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : segmentMembers.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t('newsletterAdmin.segments.noMembers')}</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {segmentMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-2.5 bg-surface-800 border border-surface-700 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white truncate block">{member.email}</span>
                          {(member.firstName || member.lastName) && (
                            <span className="text-xs text-neutral-500">
                              {[member.firstName, member.lastName].filter(Boolean).join(' ')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-neutral-500 hover:text-red-400 flex-shrink-0 p-1"
                          title={t('newsletterAdmin.segments.removeMember')}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSegmentModal(false)}>
          <div className="bg-surface-850 rounded-2xl shadow-dark-lg border border-surface-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-700">
              <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.segments.create')}</h3>
              <button onClick={() => setShowSegmentModal(false)} className="text-neutral-400 hover:text-white"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateSegment} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.segments.name')}</label>
                <input
                  type="text"
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.segments.description')}</label>
                <textarea
                  value={segmentForm.description || ''}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-300 mb-1">{t('newsletterAdmin.segments.type')}</label>
                <select
                  value={segmentForm.type}
                  onChange={(e) => setSegmentForm(prev => ({ ...prev, type: e.target.value as 'auto' | 'manual' }))}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="manual">{t('newsletterAdmin.segments.manual')}</option>
                  <option value="auto">{t('newsletterAdmin.segments.auto')}</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSegmentModal(false)}
                  className="px-4 py-2 text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSegment}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50"
                >
                  {isCreatingSegment ? '...' : t('newsletterAdmin.segments.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;
