import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import { useAppSelector } from '../store/hooks';
import apiClient from '../models/api/apiClient';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import ProfileTab from '../components/user/ProfileTab';
import OrdersTab from '../components/user/OrdersTab';
import InvoicesTab from '../components/user/InvoicesTab';
import StatisticsTab from '../components/user/StatisticsTab';
import PCConfigurationsTab from '../components/user/PCConfigurationsTab';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthViewModel();
  const language = useAppSelector((state) => state.ui.language);
  const [activeTab, setActiveTab] = useState('overview');
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth check to complete before deciding to redirect
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      loadStatistics();
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadStatistics = async () => {
    try {
      const response = await apiClient.get('/user/statistics');
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'overview',
      name: language === 'en' ? 'Overview' : 'Översikt',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      name: language === 'en' ? 'Profile' : 'Profil',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'orders',
      name: language === 'en' ? 'Orders' : 'Beställningar',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'invoices',
      name: language === 'en' ? 'Invoices' : 'Fakturor',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'pc-configs',
      name: language === 'en' ? 'PC Builds' : 'Datorbyggen',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">{language === 'en' ? 'Loading dashboard...' : 'Laddar instrumentpanel...'}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 font-sans relative flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-950 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <Header mode="page" />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-16 relative flex-1">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl font-thin text-gray-800 dark:text-white mb-1.5 sm:mb-2">
            {language === 'en' ? 'Welcome back' : 'Välkommen tillbaka'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">{user?.firstName}</span>
          </h1>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500 mt-2">
            {language === 'en' ? 'Your Dashboard' : 'Din Instrumentpanel'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl border border-b-0 border-gray-200 dark:bg-surface-850 dark:border-surface-700 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold transition-all whitespace-nowrap relative flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'text-primary-600 bg-gray-100/50 dark:text-primary-400 dark:bg-surface-800/50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/30 dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-surface-800/30'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.name}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 dark:bg-surface-850 dark:border-surface-700 p-4 sm:p-6 md:p-8 min-h-[50vh] overflow-x-hidden">
          {activeTab === 'overview' && (
            <StatisticsTab statistics={statistics} />
          )}
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'invoices' && <InvoicesTab />}
          {activeTab === 'pc-configs' && <PCConfigurationsTab />}
        </div>
      </div>

      {/* Footer */}
      <DynamicFooter />

      {/* Shopping Cart */}
      <ShoppingCart />

    </div>
  );
};

export default UserDashboard;
