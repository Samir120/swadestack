import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCookieBite } from 'react-icons/fa';
import { useAppSelector } from '../../store/hooks';
import { hasValidCookieConsent, acceptCookieConsent } from '../../utils/cookieConsent';

const CookieConsentBanner: React.FC = () => {
  const settings = useAppSelector((state) => state.siteSettings.settings);
  const language = useAppSelector((state) => state.ui.language);
  const location = useLocation();

  const expiryDays = settings?.cookieConsentExpiryDays ?? 365;

  const [visible, setVisible] = useState(() => !hasValidCookieConsent(expiryDays));

  // Re-check consent on every route change
  useEffect(() => {
    if (!hasValidCookieConsent(expiryDays)) {
      setVisible(true);
    }
  }, [location.pathname, expiryDays]);


  const handleAccept = useCallback(() => {
    acceptCookieConsent(expiryDays);
    setVisible(false);
  }, [expiryDays]);

  // Don't render if: disabled, on admin routes, or settings not loaded
  if (!settings) return null;
  if (!settings.cookieConsentEnabled) return null;
  if (location.pathname.startsWith('/admin')) return null;

  const sv = language === 'sv';
  const title =
    (sv ? settings.cookieConsentTitle_sv : settings.cookieConsentTitle_en) ||
    (sv ? 'Vi använder cookies' : 'We use cookies');
  const description =
    (sv ? settings.cookieConsentDescription_sv : settings.cookieConsentDescription_en) ||
    (sv
      ? 'Denna webbplats använder cookies för att säkerställa att du får den bästa upplevelsen. Genom att klicka på "Jag accepterar" samtycker du till användningen av alla cookies i enlighet med vår cookiepolicy.'
      : 'This website uses cookies to ensure you get the best experience. By clicking "I accept", you consent to the use of all cookies in accordance with our cookie policy.');
  const acceptLabel =
    (sv ? settings.cookieConsentAcceptButton_sv : settings.cookieConsentAcceptButton_en) ||
    (sv ? 'Jag accepterar' : 'I accept');

  // Determine read more link
  let readMoreUrl: string | null = null;
  if (settings.cookieConsentReadMoreType === 'external' && settings.cookieConsentReadMoreExternal) {
    readMoreUrl = settings.cookieConsentReadMoreExternal;
  } else if (settings.cookieConsentReadMoreType === 'internal' && settings.cookieConsentReadMoreInternal) {
    readMoreUrl = settings.cookieConsentReadMoreInternal;
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Blocking overlay */}
          <motion.div
            key="cookie-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/40"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Bottom banner */}
          <motion.div
            key="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-[201]"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="bg-white dark:bg-surface-850 border-t border-gray-200 dark:border-surface-700 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaCookieBite className="text-primary-500 text-sm flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {readMoreUrl && (
                      <a
                        href={readMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200 underline underline-offset-2 transition-colors whitespace-nowrap"
                      >
                        {sv ? 'Läs mer' : 'Read more'}
                      </a>
                    )}
                    <button
                      onClick={handleAccept}
                      className="px-5 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-500 active:scale-[0.98] transition whitespace-nowrap"
                    >
                      {acceptLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
