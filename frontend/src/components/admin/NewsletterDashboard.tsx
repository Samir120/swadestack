import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../common/Toast';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import { NewsletterDashboardData, CampaignListItem } from '../../models/types/newsletterAdmin.types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';

const NewsletterDashboard: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [data, setData] = useState<NewsletterDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await newsletterAdminApi.getDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to load newsletter dashboard:', error);
      toast.error('Failed to load newsletter dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getStatusBadge = (status: CampaignListItem['status']) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-4xl font-thin text-white">{t('newsletterAdmin.dashboard.title')}</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
            {t('newsletterAdmin.dashboard.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/newsletters/campaigns"
            className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
          >
            {t('newsletterAdmin.campaigns.create')}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.dashboard.totalSubscribers')}</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{data.totalSubscribers}</p>
              {data.newThisMonth > 0 && (
                <p className="text-[10px] text-emerald-400 mt-1">
                  +{data.newThisMonth} {t('newsletterAdmin.dashboard.newThisMonth').toLowerCase()}
                </p>
              )}
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-primary-400">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.dashboard.activeSubscribers')}</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{data.activeSubscribers}</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.dashboard.avgOpenRate')}</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{data.avgOpenRate.toFixed(1)}%</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-6 border border-surface-700 border-t-4 border-t-primary-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-wider">{t('newsletterAdmin.dashboard.avgClickRate')}</p>
              <p className="text-2xl sm:text-4xl font-thin text-white mt-0.5 sm:mt-2">{data.avgClickRate.toFixed(1)}%</p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-primary-600/10 rounded-lg sm:rounded-2xl flex items-center justify-center text-purple-400">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriber Growth Chart */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 className="text-lg font-bold text-white mb-4">{t('newsletterAdmin.dashboard.subscriberGrowth')}</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.subscriberGrowth}>
              <defs>
                <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#subscriberGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-700">
          <h3 className="text-lg font-bold text-white">{t('newsletterAdmin.dashboard.recentCampaigns')}</h3>
          <Link
            to="/admin/newsletters/campaigns"
            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
          >
            {t('newsletterAdmin.dashboard.viewAll')}
          </Link>
        </div>
        {data.recentCampaigns.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-neutral-400 text-sm">
            {t('newsletterAdmin.dashboard.noCampaigns')}
          </div>
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-surface-700">
            {data.recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{campaign.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{campaign.subject}</p>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
                {campaign.stats && campaign.stats.totalSent > 0 && (
                  <div className="flex gap-4 mt-2 text-[10px] text-neutral-400">
                    <span>Sent: <span className="text-white font-medium">{campaign.stats.totalSent}</span></span>
                    <span>Opens: <span className="text-white font-medium">{campaign.stats.uniqueOpens} ({campaign.stats.openRate.toFixed(1)}%)</span></span>
                    <span>Clicks: <span className="text-white font-medium">{campaign.stats.uniqueClicks} ({campaign.stats.clickRate.toFixed(1)}%)</span></span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-700">
              <thead className="bg-surface-800">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {t('newsletterAdmin.campaigns.name')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {t('newsletterAdmin.subscribers.status')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {t('newsletterAdmin.campaigns.stats.sent')}
                  </th>
                  <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {t('newsletterAdmin.campaigns.stats.opened')}
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    {t('newsletterAdmin.campaigns.stats.clicked')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {data.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-bold text-white">{campaign.name}</div>
                      <div className="text-xs text-neutral-400 truncate max-w-[200px] md:max-w-[300px]">{campaign.subject}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-white text-right">
                      {campaign.stats?.totalSent || 0}
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-white text-right">
                      {campaign.stats?.uniqueOpens || 0}
                      {campaign.stats && campaign.stats.totalSent > 0 && (
                        <span className="text-xs text-neutral-400 ml-1">
                          ({campaign.stats.openRate.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-white text-right">
                      {campaign.stats?.uniqueClicks || 0}
                      {campaign.stats && campaign.stats.totalSent > 0 && (
                        <span className="text-xs text-neutral-400 ml-1">
                          ({campaign.stats.clickRate.toFixed(1)}%)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 sm:mt-8">
        <Link
          to="/admin/newsletters/campaigns"
          className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 hover:border-primary-500/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('newsletterAdmin.campaigns.title')}</h4>
              <p className="text-xs text-neutral-400">{t('newsletterAdmin.campaigns.subtitle')}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/newsletters/subscribers"
          className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 hover:border-primary-500/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('newsletterAdmin.subscribers.title')}</h4>
              <p className="text-xs text-neutral-400">{t('newsletterAdmin.subscribers.subtitle')}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/newsletters/subscribers"
          className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 hover:border-primary-500/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-400 group-hover:bg-primary-600/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('newsletterAdmin.segments.title')}</h4>
              <p className="text-xs text-neutral-400">{t('newsletterAdmin.segments.noSegmentsDesc')}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NewsletterDashboard;
