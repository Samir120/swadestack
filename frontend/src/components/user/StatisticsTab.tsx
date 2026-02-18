import React from 'react';
import { useAppSelector } from '../../store/hooks';
import LoadingSpinner from '../common/LoadingSpinner';

interface StatisticsTabProps {
  statistics: any;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ statistics }) => {
  const language = useAppSelector((state) => state.ui.language);

  if (!statistics) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">
          {language === 'en' ? 'Loading statistics...' : 'Laddar statistik...'}
        </span>
      </div>
    );
  }

  const stats = [
    {
      label: language === 'en' ? 'Total Orders' : 'Totala beställningar',
      value: statistics.totalOrders || 0,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/30',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: language === 'en' ? 'Total Spent' : 'Total spenderat',
      value: `${Number(statistics.totalSpent || 0).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} SEK`,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700/30',
      iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      label: language === 'en' ? 'Pending' : 'Väntande',
      value: statistics.byStatus?.pending || 0,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    },
    {
      label: language === 'en' ? 'Completed' : 'Slutförda',
      value: statistics.byStatus?.completed || 0,
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/30',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-3 sm:p-4 md:p-5 rounded-2xl border ${stat.color} transition-all hover:shadow-md`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-70 mb-0.5 sm:mb-1 truncate">
                  {stat.label}
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0 self-start sm:self-center`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Recent Orders */}
      {statistics.recentOrders && statistics.recentOrders.length > 0 && (
        <div className="bg-gray-100 dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5 border-b border-gray-200 dark:border-surface-700">
            <h3 className="text-base sm:text-lg md:text-xl font-thin text-gray-900 dark:text-white">
              {language === 'en' ? 'Recent Orders' : 'Senaste beställningar'}
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-surface-700">
            {statistics.recentOrders.map((order: any, index: number) => (
              <div
                key={order.id || `order-${index}`}
                className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-200 dark:hover:bg-surface-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">#{order.orderNumber}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                    {new Date(order.date).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                    {Number(order.total || 0).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} SEK
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : order.status === 'partial_paid'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        : order.status === 'awaiting_final'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : order.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tip */}
      <div className="bg-gray-100 dark:bg-surface-800 border border-gray-200 dark:border-surface-700 p-4 sm:p-5 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700 dark:text-neutral-300">
            {language === 'en'
              ? 'Manage your profile, track your orders, and download invoices all in one place.'
              : 'Hantera din profil, följ dina beställningar och ladda ner fakturor på ett ställe.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
