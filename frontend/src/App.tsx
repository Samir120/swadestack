import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { rehydrateSession, logout } from './store/slices/authSlice';
import apiClient from './models/api/apiClient';
import { fetchPublicSettings } from './store/slices/siteSettingsSlice';
import { fetchLegalSettings } from './store/slices/legalSettingsSlice';
import { fetchVatSettings } from './store/slices/vatSettingsSlice';
import SEO from './components/common/SEO';
import CookieConsentBanner from './components/common/CookieConsentBanner';
import { ToastProvider } from './components/common/Toast';
import MaintenanceChecker from './components/common/MaintenanceChecker';
import { ConfirmProvider } from './components/common/ConfirmDialog';
import { useSessionViewModel } from './viewmodels/sessionViewModel';
import SessionTimeoutWarning from './components/common/SessionTimeoutWarning';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotificationBanner from './components/common/NotificationBanner';

// Home page loaded eagerly (it's the landing page)
import Home from './pages/Home';

// All other routes lazy-loaded for code splitting
const Checkout = lazy(() => import('./pages/Checkout'));
const KlarnaCheckout = lazy(() => import('./pages/KlarnaCheckout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminRoutes = lazy(() => import('./pages/AdminRoutes'));
const FooterPage = lazy(() => import('./pages/FooterPage'));
const PCBuilder = lazy(() => import('./pages/PCBuilder'));
const PreConfiguredPCList = lazy(() => import('./pages/PreConfiguredPCList'));
const PreConfiguredPCDetail = lazy(() => import('./pages/PreConfiguredPCDetail'));

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.siteSettings);
  const theme = useAppSelector((state) => state.ui.theme);

  // Check if Gaming PC section is enabled (default true while settings load)
  const gamingPcEnabled = settings?.gamingPcSectionVisible !== false;

  // Idle timeout — active for all authenticated users on every page
  const { showWarning, remainingSeconds, warningDurationSeconds, handleStayLoggedIn, handleLogoutNow, language: sessionLang } = useSessionViewModel();

  // Set up auth failure callback for API client
  useEffect(() => {
    apiClient.setOnAuthFailure(() => {
      dispatch(logout());
    });
    return () => {
      apiClient.setOnAuthFailure(null);
    };
  }, [dispatch]);

  // Sync theme class on <html> element whenever Redux theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Update meta theme-color for mobile browser chrome
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#09090b' : '#ffffff');
    }
  }, [theme]);

  // Rehydrate session on mount: use refresh token to restore auth state
  useEffect(() => {
    if (localStorage.getItem('refresh_token')) {
      dispatch(rehydrateSession());
    }
  }, [dispatch]);

  // Load site settings on mount
  useEffect(() => {
    dispatch(fetchPublicSettings());
    dispatch(fetchLegalSettings());
    dispatch(fetchVatSettings());
  }, [dispatch]);

  return (
    <ToastProvider>
    <ConfirmProvider>
      {/* Notification Banner - Above everything */}
      <NotificationBanner />

      {/* SEO Component - Updates page title and meta tags */}
      <SEO />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      <MaintenanceChecker>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
          <Routes>
            {/* Home Page - Single-page with scrollspy (has its own header/footer) */}
            <Route path="/" element={<Home />} />

            {/* Public Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/klarna-checkout/:orderId" element={<KlarnaCheckout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

            {/* User Dashboard - No Header/Footer */}
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* PC Builder & Pre-Configured PCs - Only when Gaming PC section is enabled */}
            {gamingPcEnabled && (
              <>
                <Route path="/pc-builder" element={<PCBuilder />} />
                <Route path="/pre-configured-pcs" element={<PreConfiguredPCList />} />
                <Route path="/pre-configured-pcs/:id" element={<PreConfiguredPCDetail />} />
              </>
            )}

            {/* Admin Routes - No Header/Footer */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Dynamic Footer Pages - Catch-all for footer page URLs */}
            <Route path="*" element={<FooterPage />} />
          </Routes>
        </Suspense>
      </MaintenanceChecker>
    </ConfirmProvider>
    <SessionTimeoutWarning
      isVisible={showWarning}
      remainingSeconds={remainingSeconds}
      totalSeconds={warningDurationSeconds}
      onStayLoggedIn={handleStayLoggedIn}
      onLogout={handleLogoutNow}
      language={sessionLang}
    />
    </ToastProvider>
  );
};

export default App;
