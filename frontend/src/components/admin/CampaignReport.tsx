import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../common/Toast';
import { newsletterAdminApi } from '../../models/api/newsletterAdminApi';
import { CampaignReportData, RecipientActivity } from '../../models/types/newsletterAdmin.types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const RECIPIENT_STATUS_TABS = [
  { key: 'all', value: undefined },
  { key: 'sent', value: 'sent' },
  { key: 'opened', value: 'opened' },
  { key: 'clicked', value: 'clicked' },
  { key: 'bounced', value: 'bounced' },
  { key: 'failed', value: 'failed' },
];

const CampaignReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();

  const [report, setReport] = useState<CampaignReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recipients
  const [recipients, setRecipients] = useState<RecipientActivity[]>([]);
  const [recipientsTotal, setRecipientsTotal] = useState(0);
  const [recipientStatus, setRecipientStatus] = useState<string | undefined>(undefined);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientPageSize] = useState(25);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await newsletterAdminApi.getCampaignReport(id);
      if (response.success && response.data) {
        setReport(response.data);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadRecipients = useCallback(async () => {
    if (!id) return;
    setIsLoadingRecipients(true);
    try {
      const response = await newsletterAdminApi.getCampaignRecipients(id, {
        status: recipientStatus,
        page: recipientPage,
        pageSize: recipientPageSize,
      });
      if (response.success && response.data) {
        setRecipients(response.data.recipients);
        setRecipientsTotal(response.data.total);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoadingRecipients(false);
    }
  }, [id, recipientStatus, recipientPage, recipientPageSize]);

  useEffect(() => { loadReport(); }, [loadReport]);
  useEffect(() => { loadRecipients(); }, [loadRecipients]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('sv-SE', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const recipientTotalPages = Math.ceil(recipientsTotal / recipientPageSize);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">{t('newsletterAdmin.report.notFound', 'Report not found')}</p>
      </div>
    );
  }

  const { stats } = report;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-3 mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/admin/newsletters/campaigns')}
          className="p-2 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors flex-shrink-0 mt-0.5"
        >
          <FaArrowLeft />
        </button>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-thin text-white truncate">{report.campaign.name}</h2>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 sm:truncate">
            {report.campaign.subject} — {t('newsletterAdmin.report.sentOn', 'Sent')} {formatDate(report.campaign.sentAt)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: t('newsletterAdmin.report.stats.sent', 'Sent'), value: stats.totalSent, color: 'text-white' },
          { label: t('newsletterAdmin.report.stats.delivered', 'Delivered'), value: stats.totalDelivered, color: 'text-blue-400' },
          { label: t('newsletterAdmin.report.stats.opened', 'Opened'), value: `${stats.openRate.toFixed(1)}%`, color: 'text-green-400' },
          { label: t('newsletterAdmin.report.stats.clicked', 'Clicked'), value: `${stats.clickRate.toFixed(1)}%`, color: 'text-purple-400' },
          { label: t('newsletterAdmin.report.stats.bounced', 'Bounced'), value: stats.totalBounced, color: 'text-amber-400' },
          { label: t('newsletterAdmin.report.stats.failed', 'Failed'), value: stats.totalFailed, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-850 rounded-xl border border-surface-700 p-4 text-center">
            <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Opens Over Time Chart */}
      {report.opensOverTime.length > 0 && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 mb-6">
          <h3 className="text-sm font-bold text-white mb-4">{t('newsletterAdmin.report.opensOverTime', 'Opens Over Time')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.opensOverTime}>
                <defs>
                  <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  labelFormatter={(d) => new Date(d).toLocaleDateString('sv-SE', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Area type="monotone" dataKey="opens" stroke="#3B82F6" fill="url(#colorOpens)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recipient Activity */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">{t('newsletterAdmin.report.recipientActivity', 'Recipient Activity')}</h3>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {RECIPIENT_STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setRecipientStatus(tab.value); setRecipientPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                recipientStatus === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 text-neutral-300 hover:bg-surface-700 border border-surface-700'
              }`}
            >
              {t(`newsletterAdmin.report.recipientTabs.${tab.key}`, tab.key.charAt(0).toUpperCase() + tab.key.slice(1))}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoadingRecipients ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : recipients.length === 0 ? (
          <p className="text-center text-neutral-400 py-8 text-sm">{t('newsletterAdmin.report.noRecipients', 'No recipients found')}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">{t('newsletterAdmin.report.email', 'Email')}</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase">{t('newsletterAdmin.report.status', 'Status')}</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase hidden sm:table-cell">{t('newsletterAdmin.report.sentAt', 'Sent')}</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase hidden md:table-cell">{t('newsletterAdmin.report.openedAt', 'Opened')}</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-neutral-500 uppercase hidden lg:table-cell">{t('newsletterAdmin.report.clickedAt', 'Clicked')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r) => (
                    <tr key={r.id} className="border-b border-surface-700/50 hover:bg-surface-800/50">
                      <td className="py-2.5 px-3">
                        <p className="text-white text-sm truncate max-w-[140px] sm:max-w-[200px] md:max-w-[280px]">{r.email}</p>
                        {r.subscriberName && <p className="text-xs text-neutral-500">{r.subscriberName}</p>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          r.status === 'opened' || r.status === 'clicked' ? 'bg-green-900/30 text-green-400' :
                          r.status === 'sent' || r.status === 'delivered' ? 'bg-blue-900/30 text-blue-400' :
                          r.status === 'bounced' || r.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                          'bg-neutral-700/50 text-neutral-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 text-xs hidden sm:table-cell">{formatDate(r.sentAt)}</td>
                      <td className="py-2.5 px-3 text-neutral-400 text-xs hidden md:table-cell">{formatDate(r.openedAt)}</td>
                      <td className="py-2.5 px-3 text-neutral-400 text-xs hidden lg:table-cell">{formatDate(r.clickedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {recipientTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
                <p className="text-xs text-neutral-400">
                  {(recipientPage - 1) * recipientPageSize + 1}–{Math.min(recipientPage * recipientPageSize, recipientsTotal)} of {recipientsTotal}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRecipientPage(p => p - 1)}
                    disabled={recipientPage <= 1}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="text-xs text-neutral-400 px-2">{recipientPage}/{recipientTotalPages}</span>
                  <button
                    onClick={() => setRecipientPage(p => p + 1)}
                    disabled={recipientPage >= recipientTotalPages}
                    className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg disabled:opacity-30 transition-colors"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignReport;
