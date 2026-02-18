import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../models/api/apiClient';
import { FaChartBar, FaMoneyBillWave, FaBox, FaCheckCircle, FaClock, FaBan } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

interface StatisticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalServices: number;
  activeServices: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const orderStats = await apiClient.get<any>('/orders/stats/summary');
      const servicesResponse = await apiClient.get<any>('/services', { page: 1, limit: 100 });
      const activeServices = servicesResponse.data?.items?.filter((s: any) => s.isActive).length || 0;
      const totalServices = servicesResponse.data?.items?.length || 0;
      const ordersResponse = await apiClient.get<any>('/orders', { page: 1, limit: 10 });
      setRecentOrders(ordersResponse.data?.orders || []);

      setStats({
        totalOrders: orderStats.data?.total || 0,
        totalRevenue: orderStats.data?.totalRevenue || 0,
        pendingOrders: orderStats.data?.pending || 0,
        completedOrders: orderStats.data?.completed || 0,
        cancelledOrders: orderStats.data?.cancelled || 0,
        totalServices: totalServices,
        activeServices: activeServices,
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900/30 text-yellow-400',
      paid: 'bg-green-900/30 text-green-400',
      completed: 'bg-blue-900/30 text-blue-400',
      cancelled: 'bg-red-900/30 text-red-400',
    };
    return colors[status] || 'bg-surface-800 text-neutral-200';
  };

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const totalOrdersCount = stats.pendingOrders + stats.completedOrders + stats.cancelledOrders;
  const pendingPercentage = totalOrdersCount > 0 ? (stats.pendingOrders / totalOrdersCount) * 100 : 0;
  const completedPercentage = totalOrdersCount > 0 ? (stats.completedOrders / totalOrdersCount) * 100 : 0;
  const cancelledPercentage = totalOrdersCount > 0 ? (stats.cancelledOrders / totalOrdersCount) * 100 : 0;

  return (
    <div>
      <div className="mb-4 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-thin text-white">Statistics & Analytics</h2>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-dark-md p-3 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-blue-100 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl sm:text-4xl font-bold mt-0.5 sm:mt-2">{stats.totalOrders}</p>
              <p className="text-[10px] sm:text-sm text-blue-100 mt-1">{stats.pendingOrders} pending</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-2xl flex items-center justify-center">
              <FaChartBar className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-dark-md p-3 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-green-100 uppercase tracking-wider">Total Revenue</p>
              <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-2 truncate">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-[10px] sm:text-sm text-green-100 mt-1">{stats.completedOrders} completed</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-2xl flex items-center justify-center">
              <FaMoneyBillWave className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-dark-md p-3 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-purple-100 uppercase tracking-wider">Active Services</p>
              <p className="text-2xl sm:text-4xl font-bold mt-0.5 sm:mt-2">{stats.activeServices}</p>
              <p className="text-[10px] sm:text-sm text-purple-100 mt-1">{stats.totalServices} total</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-2xl flex items-center justify-center">
              <FaBox className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl shadow-dark-md p-3 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-primary-300 uppercase tracking-wider">Completion Rate</p>
              <p className="text-2xl sm:text-4xl font-bold mt-0.5 sm:mt-2">
                {totalOrdersCount > 0 ? Math.round(completedPercentage) : 0}%
              </p>
              <p className="text-[10px] sm:text-sm text-primary-300 mt-1">{stats.completedOrders}/{totalOrdersCount} orders</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-2xl flex items-center justify-center">
              <FaCheckCircle className="text-base sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-4 sm:mb-6">Order Status Breakdown</h3>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-neutral-400 flex items-center gap-2">
                  <FaClock className="text-yellow-500" />
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">Pend.</span>
                </span>
                <span className="font-bold text-white">{stats.pendingOrders} ({Math.round(pendingPercentage)}%)</span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2 sm:h-3">
                <div
                  className="bg-yellow-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pendingPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-neutral-400 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">Comp.</span>
                </span>
                <span className="font-bold text-white">{stats.completedOrders} ({Math.round(completedPercentage)}%)</span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2 sm:h-3">
                <div
                  className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="text-neutral-400 flex items-center gap-2">
                  <FaBan className="text-red-500" />
                  <span className="hidden sm:inline">Cancelled</span>
                  <span className="sm:hidden">Canc.</span>
                </span>
                <span className="font-bold text-white">{stats.cancelledOrders} ({Math.round(cancelledPercentage)}%)</span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2 sm:h-3">
                <div
                  className="bg-red-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${cancelledPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-surface-700">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="bg-yellow-900/20 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-2xl font-bold text-yellow-400">{stats.pendingOrders}</div>
                <div className="text-[10px] sm:text-xs text-neutral-400">Pending</div>
              </div>
              <div className="bg-green-900/20 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-2xl font-bold text-green-400">{stats.completedOrders}</div>
                <div className="text-[10px] sm:text-xs text-neutral-400">Completed</div>
              </div>
              <div className="bg-red-900/20 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-2xl font-bold text-red-400">{stats.cancelledOrders}</div>
                <div className="text-[10px] sm:text-xs text-neutral-400">Cancelled</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-4 sm:mb-6">Service Performance</h3>

          <div className="flex items-center justify-center h-36 sm:h-48">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 96 96">
                  <circle
                    className="text-surface-700"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-purple-600"
                    strokeWidth="6"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${
                        2 * Math.PI * 40 * (1 - (stats.activeServices / Math.max(stats.totalServices, 1)))
                      }`,
                    }}
                  />
                </svg>
                <div className="absolute">
                  <div className="text-3xl sm:text-4xl font-thin text-white">{stats.activeServices}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-400">Active</div>
                </div>
              </div>
              <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-neutral-400">
                {stats.activeServices} of {stats.totalServices} services active
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-purple-900/20 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-400">{stats.activeServices}</div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Active</div>
            </div>
            <div className="bg-surface-800 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-neutral-400">{stats.totalServices - stats.activeServices}</div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Recent Orders */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 flex items-center justify-between">
          <h3 className="text-sm sm:text-lg font-semibold text-white">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs sm:text-sm text-primary-400 font-bold hover:text-primary-400">
            View all
          </Link>
        </div>

        <div className="sm:hidden">
          {recentOrders.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-surface-700">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-400">{order.firstName} {order.lastName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-700">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Order Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-400">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{order.firstName} {order.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
