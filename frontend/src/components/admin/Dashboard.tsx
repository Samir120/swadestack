import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioViewModel } from '../../viewmodels/portfolioViewModel';
import { useServicesViewModel } from '../../viewmodels/servicesViewModel';
import apiClient from '../../models/api/apiClient';
import { FaShoppingCart, FaMoneyBillWave, FaClock, FaBox, FaArrowRight, FaImages, FaCog } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminPriceDisplay from './common/AdminPriceDisplay';

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const AdminDashboard: React.FC = () => {
  const { items: portfolioItems, loadPortfolio } = usePortfolioViewModel();
  const { services = [], loadServices } = useServicesViewModel();

  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load statistics
      const statsResponse = await apiClient.get<any>('/orders/stats/summary');
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalOrders: statsResponse.data.total || 0,
          totalRevenue: statsResponse.data.totalRevenue || 0,
          pendingOrders: statsResponse.data.pending || 0,
        });
      }

      // Load recent orders
      const ordersResponse = await apiClient.get<any>('/orders', { page: 1, limit: 5 });
      if (ordersResponse.success && ordersResponse.data) {
        setRecentOrders(ordersResponse.data.orders || []);
      }

      // Load portfolio and services counts
      loadPortfolio(1, 100);
      loadServices(1, 100);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
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
      <div className="mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-thin text-white">Dashboard Overview</h2>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Overview</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500 hover:shadow-dark-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{stats.totalOrders}</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
              <FaShoppingCart className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500 hover:shadow-dark-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Revenue</p>
              <div className="mt-0.5 sm:mt-2 overflow-hidden">
                <AdminPriceDisplay
                  price={stats.totalRevenue}
                  primaryClassName="text-base sm:text-3xl font-bold text-white flex flex-wrap items-baseline gap-x-1"
                  secondaryClassName="block text-[10px] sm:text-xs text-neutral-400 font-normal"
                />
              </div>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
              <FaMoneyBillWave className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500 hover:shadow-dark-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Pending Orders</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
              <FaClock className="text-base sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500 hover:shadow-dark-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">Active Services</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{services?.length || 0}</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
              <FaBox className="text-base sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Link
          to="/admin/portfolio"
          className="bg-surface-850 rounded-2xl shadow-dark-md p-4 sm:p-6 hover:shadow-dark-md transition-shadow border border-surface-700 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-400">
              <FaImages className="text-sm sm:text-base" />
            </div>
            <h3 className="text-sm sm:text-lg font-semibold text-white">Manage Portfolio</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mb-2 sm:mb-4">
            {portfolioItems?.length || 0} projects published
          </p>
          <span className="text-primary-400 font-bold text-xs sm:text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            Manage Projects <FaArrowRight size={10} />
          </span>
        </Link>

        <Link
          to="/admin/services"
          className="bg-surface-850 rounded-2xl shadow-dark-md p-4 sm:p-6 hover:shadow-dark-md transition-shadow border border-surface-700 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-400">
              <FaCog className="text-sm sm:text-base" />
            </div>
            <h3 className="text-sm sm:text-lg font-semibold text-white">Manage Services</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mb-2 sm:mb-4">
            {services?.length || 0} services available
          </p>
          <span className="text-primary-400 font-bold text-xs sm:text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            Manage Services <FaArrowRight size={10} />
          </span>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-surface-850 rounded-2xl shadow-dark-md p-4 sm:p-6 hover:shadow-dark-md transition-shadow border border-surface-700 group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-400">
              <FaShoppingCart className="text-sm sm:text-base" />
            </div>
            <h3 className="text-sm sm:text-lg font-semibold text-white">View Orders</h3>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mb-2 sm:mb-4">
            {stats.pendingOrders} pending orders
          </p>
          <span className="text-primary-400 font-bold text-xs sm:text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
            View All Orders <FaArrowRight size={10} />
          </span>
        </Link>
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

        {/* Mobile Card View */}
        <div className="sm:hidden">
          {recentOrders.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-400">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-400">{order.firstName} {order.lastName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        order.status === 'paid'
                          ? 'bg-green-900/30 text-green-400'
                          : order.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-surface-800 text-neutral-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <AdminPriceDisplay
                      price={order.totalAmount}
                      primaryClassName="text-sm font-bold text-white"
                      secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                    />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AdminPriceDisplay
                        price={order.totalAmount}
                        primaryClassName="text-sm text-white"
                        secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'paid'
                            ? 'bg-green-900/30 text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-surface-800 text-neutral-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
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

export default AdminDashboard;
