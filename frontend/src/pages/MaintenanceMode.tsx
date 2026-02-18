import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import useAuthViewModel from '@/viewmodels/authViewModel';
import Lottie from 'lottie-react';
import maintenanceGearsAnimation from '@/assets/animations/maintenance-gears.json';

const MaintenanceMode: React.FC = () => {
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { isAuthenticated, isAdmin } = useAuthViewModel();
  const [countdown, setCountdown] = useState(10);

  // Get maintenance message
  const message = settings
    ? (language === 'en' ? settings.maintenanceMessage_en : settings.maintenanceMessage_sv)
    : (language === 'en' 
      ? 'We are currently performing scheduled maintenance. Please check back soon.' 
      : 'Vi utför för närvarande planerat underhåll. Vänligen kom tillbaka snart.');

  const siteName = settings
    ? (language === 'en' ? settings.siteName_en : settings.siteName_sv)
    : 'Website';

  // If user is admin, redirect to admin panel
  useEffect(() => {
    if (isAuthenticated && isAdmin()) {
      navigate('/admin');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Countdown for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animated Gears */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto">
            <Lottie animationData={maintenanceGearsAnimation} loop />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-thin text-gray-800 dark:text-white mb-4">
          🚧 {language === 'en' ? 'Under Maintenance' : 'Under Underhåll'}
        </h1>

        {/* Site Name */}
        <p className="text-xl text-gray-500 dark:text-neutral-400 mb-8">{siteName}</p>

        {/* Message */}
        <div className="bg-white/80 dark:bg-surface-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-surface-700">
          <p className="text-lg text-gray-700 dark:text-neutral-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Auto-refresh countdown */}
        <div className="bg-primary-600/10 rounded-xl p-6 border border-primary-500/30">
          <p className="text-primary-600 dark:text-primary-400 mb-2">
            {language === 'en' ? 'Auto-refreshing in' : 'Uppdaterar automatiskt om'}
          </p>
          <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">{countdown}s</div>
        </div>

        {/* Login for Admins */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-surface-700 dark:hover:bg-surface-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            {language === 'en' ? 'Admin Login' : 'Admin Inloggning'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-400 dark:text-neutral-500 text-sm">
          <p>
            {language === 'en' 
              ? 'Thank you for your patience' 
              : 'Tack för ditt tålamod'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
