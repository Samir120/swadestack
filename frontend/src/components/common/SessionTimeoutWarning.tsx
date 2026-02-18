import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Inline SVG to avoid pulling in the 857KB lucide-react chunk
const Clock: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

interface SessionTimeoutWarningProps {
  isVisible: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
  language: 'en' | 'sv';
}

const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isVisible,
  remainingSeconds,
  totalSeconds,
  onStayLoggedIn,
  onLogout,
  language,
}) => {
  const isUrgent = remainingSeconds <= 10;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const t = {
    en: {
      title: 'Session Expiring',
      message: 'You\'ve been inactive. Your session will expire soon.',
      urgentMessage: 'Logging out soon...',
      stay: 'Stay Logged In',
      logout: 'Log Out Now',
    },
    sv: {
      title: 'Sessionen upphör',
      message: 'Du har varit inaktiv. Din session upphör snart.',
      urgentMessage: 'Loggar ut snart...',
      stay: 'Fortsätt vara inloggad',
      logout: 'Logga ut nu',
    },
  }[language];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-white dark:bg-surface-850 shadow-2xl max-w-sm w-full mx-4 p-8"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <Clock size={24} className="text-amber-600 dark:text-amber-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t.title}
              </h3>

              {/* Message — switches to urgent text in last 10s */}
              <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                {isUrgent ? t.urgentMessage : t.message}
              </p>

              {/* Progress Ring with Countdown */}
              <div className="relative w-28 h-28 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="4"
                    className="stroke-gray-200 dark:stroke-surface-700"
                  />
                  {/* Depleting ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    className={isUrgent ? 'stroke-red-500' : 'stroke-amber-500 dark:stroke-amber-400'}
                    style={{
                      strokeDashoffset: dashOffset,
                      transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                    }}
                  />
                </svg>
                {/* Countdown number centered in ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-3xl font-bold tabular-nums ${
                      isUrgent
                        ? 'text-red-500'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {timeDisplay}
                  </span>
                </div>
              </div>

              {/* Primary action */}
              <button
                onClick={onStayLoggedIn}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
              >
                {t.stay}
              </button>

              {/* Subtle logout link */}
              <button
                onClick={onLogout}
                className="text-sm text-slate-400 hover:text-slate-300 mt-3 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutWarning;
