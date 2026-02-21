import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { customersApi } from '../../models/api/customersApi';
import { CustomerListItem, CustomerStats, CustomerListQuery } from '../../models/types/customer.types';
import {
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaSearch,
  FaTimes,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH,
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminPriceDisplay from './common/AdminPriceDisplay';

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialSortBy = (searchParams.get('sortBy') as CustomerListQuery['sortBy']) || 'createdAt';
  const initialSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialPageSize = parseInt(searchParams.get('pageSize') || '25');

  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string[]>(initialStatus ? initialStatus.split(',') : []);
  const [sortBy, setSortBy] = useState<CustomerListQuery['sortBy']>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Sync URL params
  const updateURLParams = useCallback((params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Debounced search
  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      updateURLParams({ search: value, page: '1' });
    }, 300);
  }, [updateURLParams]);

  // Load data
  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = statusFilter.join(',');
      const response = await customersApi.getAll({
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      if (response.success && response.data) {
        setCustomers(response.data.customers);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, sortBy, sortOrder, page, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const response = await customersApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load customer stats:', error);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Status filter toggle
  const toggleStatus = (status: string) => {
    const newStatuses = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    setStatusFilter(newStatuses);
    setPage(1);
    updateURLParams({ status: newStatuses.join(','), page: '1' });
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setStatusFilter([]);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  // Sort handler
  const handleSort = (field: CustomerListQuery['sortBy']) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    setPage(1);
    updateURLParams({ sortBy: field || '', sortOrder: newOrder, page: '1' });
  };

  // CSV export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await customersApi.exportCSV({
        search: search || undefined,
        status: statusFilter.join(',') || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `customers-export-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export started', 'CSV file downloading...');
    } catch (error) {
      toast.error('Export failed', 'Could not export customers.');
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURLParams({ page: newPage.toString() });
  };

  // Helpers
  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600',
      'bg-pink-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusBadge = (customer: CustomerListItem) => {
    if (customer.accountStatus === 'suspended') {
      return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-amber-900/30 text-amber-400">Suspended</span>;
    }
    if (customer.accountStatus === 'deactivated') {
      return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-red-900/30 text-red-400">Deactivated</span>;
    }
    if (!customer.isEmailVerified) {
      return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-yellow-900/30 text-yellow-400">Unverified</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-green-900/30 text-green-400">Active</span>;
  };

  const hasActiveFilters = search || statusFilter.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Customers</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
            Manage customer accounts and order history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-neutral-300 bg-surface-800 border border-surface-700 rounded-lg hover:bg-surface-700 transition-colors disabled:opacity-50"
          >
            <FaDownload className="text-xs" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Customers</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{stats.totalCustomers}</p>
                {stats.newLastMonth > 0 && (
                  <p className="text-[10px] text-emerald-400 mt-1">
                    <FaArrowUp className="inline text-[8px] mr-0.5" />
                    {Math.round(((stats.newThisMonth - stats.newLastMonth) / stats.newLastMonth) * 100)}% vs last mo
                  </p>
                )}
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
                <FaUsers className="text-base sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Active</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{stats.activeCustomers}</p>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
                <FaUserCheck className="text-base sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">New This Month</p>
                <p className="text-3xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{stats.newThisMonth}</p>
                {stats.newLastMonth > 0 && (
                  <p className="text-[10px] text-emerald-400 mt-1">
                    <FaArrowUp className="inline text-[8px] mr-0.5" />
                    {stats.newThisMonth - stats.newLastMonth > 0 ? '+' : ''}{stats.newThisMonth - stats.newLastMonth} vs last mo
                  </p>
                )}
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
                <FaUserPlus className="text-base sm:text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Avg. Lifetime Spend</p>
                <div className="mt-0.5 sm:mt-2">
                  <AdminPriceDisplay
                    price={stats.averageLifetimeSpend}
                    primaryClassName="text-lg sm:text-3xl font-bold text-white"
                    secondaryClassName="block text-[10px] sm:text-xs text-neutral-400 font-normal"
                  />
                </div>
              </div>
              <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
                <FaMoneyBillWave className="text-base sm:text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); updateURLParams({ search: '', page: '1' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Status filter buttons */}
          <button
            onClick={() => toggleStatus('active')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              statusFilter.includes('active')
                ? 'bg-green-600 text-white'
                : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => toggleStatus('unverified')}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
              statusFilter.includes('unverified')
                ? 'bg-amber-600 text-white'
                : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
            }`}
          >
            Unverified
          </button>

          {/* Sort dropdown */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [CustomerListQuery['sortBy'], 'asc' | 'desc'];
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
              updateURLParams({ sortBy: field || '', sortOrder: order, page: '1' });
            }}
            className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs sm:text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="lastActive-desc">Last Active</option>
            <option value="totalOrders-desc">Most Orders</option>
            <option value="totalSpent-desc">Highest Spend</option>
            <option value="name-asc">Name A-Z</option>
          </select>

          {/* Per page */}
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value);
              setPageSize(newSize);
              setPage(1);
              updateURLParams({ pageSize: newSize.toString(), page: '1' });
            }}
            className="hidden sm:block px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-xs sm:text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilter.map(status => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <button onClick={() => toggleStatus(status)} className="hover:opacity-75">
                <FaTimes className="text-[9px]" />
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-400 hover:text-neutral-300 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-2xl text-neutral-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No customers found</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Adjust your search or filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => navigate(`/admin/customers/${customer.id}`)}
                className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${getAvatarColor(customer.firstName + customer.lastName)}`}>
                    {getInitials(customer.firstName, customer.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      {getStatusBadge(customer)}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">
                    {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''} &middot; <AdminPriceDisplay price={customer.totalSpent} className="inline" primaryClassName="inline" secondaryClassName="inline text-[10px] text-neutral-500 ml-1" />
                  </span>
                  <span className="text-neutral-500">{getRelativeTime(customer.lastActive)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-700">
                <thead className="bg-surface-800">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      <button onClick={() => handleSort('totalOrders')} className="inline-flex items-center gap-1 hover:text-neutral-300">
                        Orders
                        {sortBy === 'totalOrders' && (sortOrder === 'desc' ? <FaArrowDown className="text-[8px]" /> : <FaArrowUp className="text-[8px]" />)}
                      </button>
                    </th>
                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      <button onClick={() => handleSort('totalSpent')} className="inline-flex items-center gap-1 hover:text-neutral-300">
                        Spent
                        {sortBy === 'totalSpent' && (sortOrder === 'desc' ? <FaArrowDown className="text-[8px]" /> : <FaArrowUp className="text-[8px]" />)}
                      </button>
                    </th>
                    <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-4 lg:px-6 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-surface-850 divide-y divide-surface-700">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="hover:bg-surface-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(customer.firstName + customer.lastName)}`}>
                            {getInitials(customer.firstName, customer.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-neutral-400 truncate max-w-[220px]">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(customer)}
                      </td>
                      <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-white text-right">
                        {customer.totalOrders}
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <AdminPriceDisplay
                          price={customer.totalSpent}
                          primaryClassName="text-sm font-bold text-white"
                          secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                        />
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                        <span title={customer.lastActive ? new Date(customer.lastActive).toLocaleString('sv-SE') : ''}>
                          {getRelativeTime(customer.lastActive)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${customer.id}`); }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
                        >
                          <FaEllipsisH className="text-xs" />
                        </button>
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
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} customers
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-neutral-400 hover:text-white hover:bg-surface-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
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
    </div>
  );
};

export default CustomerList;
