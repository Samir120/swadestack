import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '../../store/hooks';
import { notificationBannersApi } from '../../models/api/notificationBannersApi';
import { ActiveNotificationBanner } from '../../models/types/notificationBanner.types';
import DynamicLucideIcon from './DynamicLucideIcon';
import { FaTimes, FaCopy, FaCheck, FaPhone, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';

const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const FONT_SIZE_MAP: Record<string, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
};

const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const NotificationBanner: React.FC = () => {
  const location = useLocation();
  const language = useAppSelector((state) => state.ui.language);

  const [banner, setBanner] = useState<ActiveNotificationBanner | null>(null);
  const [visible, setVisible] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const impressionTracked = useRef(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Fetch active banner
  useEffect(() => {
    let cancelled = false;
    notificationBannersApi.getActive().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setBanner(res.data);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Check dismissal, page targeting, and visibility
  useEffect(() => {
    if (!banner) {
      setVisible(false);
      return;
    }

    // Check localStorage dismissal
    const dismissKey = `nb_dismissed_${banner.id}`;
    const dismissedAt = localStorage.getItem(dismissKey);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION_MS) {
        setVisible(false);
        return;
      }
      localStorage.removeItem(dismissKey);
    }

    const path = location.pathname;

    // Auth page filtering
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
    if (!banner.showOnAuthPages && authPaths.some((p) => path.startsWith(p))) {
      setVisible(false);
      return;
    }

    // Admin panel filtering
    if (!banner.showOnAdminPanel && path.startsWith('/admin')) {
      setVisible(false);
      return;
    }

    // Page targeting
    if (!banner.showOnPages.includes('all')) {
      const matches = banner.showOnPages.some((p) => {
        if (p === path) return true;
        if (p.endsWith('*') && path.startsWith(p.slice(0, -1))) return true;
        return false;
      });
      if (!matches) {
        setVisible(false);
        return;
      }
    }

    setVisible(true);
  }, [banner, location.pathname]);

  // Set CSS variable for header offset
  useEffect(() => {
    if (!visible || !bannerRef.current) {
      document.documentElement.style.setProperty('--nb-height', '0px');
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        document.documentElement.style.setProperty(
          '--nb-height',
          `${entry.contentRect.height}px`
        );
      }
    });

    observer.observe(bannerRef.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty('--nb-height', '0px');
    };
  }, [visible]);

  // Track impression (once)
  useEffect(() => {
    if (visible && banner && !impressionTracked.current) {
      impressionTracked.current = true;
      notificationBannersApi.track(banner.id, 'impression').catch(() => {});
    }
  }, [visible, banner]);

  const handleDismiss = useCallback(() => {
    if (!banner) return;
    localStorage.setItem(`nb_dismissed_${banner.id}`, Date.now().toString());
    notificationBannersApi.track(banner.id, 'dismiss').catch(() => {});
    setVisible(false);
  }, [banner]);

  const handleLinkClick = useCallback(() => {
    if (!banner) return;
    notificationBannersApi.track(banner.id, 'click').catch(() => {});
  }, [banner]);

  const handleCopyCoupon = useCallback(async () => {
    if (!banner?.couponCode) return;
    try {
      await navigator.clipboard.writeText(banner.couponCode);
      setCopiedCoupon(true);
      notificationBannersApi.track(banner.id, 'click').catch(() => {});
      setTimeout(() => setCopiedCoupon(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = banner.couponCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  }, [banner]);

  if (!banner) return null;

  const message = language === 'en' ? banner.message_en : banner.message_sv;
  const linkText = language === 'en' ? banner.linkText_en : banner.linkText_sv;

  const bgStyle =
    banner.backgroundType === 'gradient'
      ? {
          background: `linear-gradient(${banner.gradientDirection || 'to right'}, ${banner.backgroundColor}, ${banner.gradientEndColor || banner.backgroundColor})`,
        }
      : { backgroundColor: banner.backgroundColor };

  const hasLink = banner.linkUrl && linkText;
  const hasContact = banner.contactPhone || banner.contactEmail;

  // On mobile, if there's a link and no coupon, the entire banner becomes tappable
  const MobileWrapper = hasLink && !banner.couponCode
    ? ({ children }: { children: React.ReactNode }) => (
        <a
          href={banner.linkUrl!}
          onClick={handleLinkClick}
          className="sm:hidden contents"
          target={banner.linkUrl!.startsWith('http') ? '_blank' : undefined}
          rel={banner.linkUrl!.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    : React.Fragment;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bannerRef}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
        >
          <div
            className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3"
            style={{
              ...bgStyle,
              color: banner.textColor,
              fontWeight: FONT_WEIGHT_MAP[banner.fontWeight] || '500',
              fontSize: FONT_SIZE_MAP[banner.fontSize] || '0.875rem',
            }}
          >
            {/* ── Zone 1: Message + CTA (left, takes available space) ── */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 justify-center sm:justify-start">
              {/* Icon — hidden on mobile to save space */}
              {banner.icon && (
                <DynamicLucideIcon
                  name={banner.icon}
                  size={16}
                  className="flex-shrink-0 hidden sm:block"
                  style={{ color: banner.textColor }}
                />
              )}

              {/* Message — truncated on mobile */}
              <MobileWrapper>
                <span className="truncate sm:whitespace-normal text-center sm:text-left">
                  {message}
                </span>
              </MobileWrapper>

              {/* Coupon Code — visible at sm+ */}
              {banner.couponCode && (
                <button
                  onClick={handleCopyCoupon}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-white/20 hover:bg-white/30 transition-colors cursor-pointer flex-shrink-0"
                  style={{ color: banner.textColor }}
                >
                  {copiedCoupon ? <FaCheck size={10} /> : <FaCopy size={10} />}
                  {copiedCoupon ? (language === 'en' ? 'Copied!' : 'Kopierat!') : banner.couponCode}
                </button>
              )}

              {/* Link text — visible at sm+ */}
              {hasLink && (
                <a
                  href={banner.linkUrl!}
                  onClick={handleLinkClick}
                  className="hidden sm:inline-flex items-center gap-1 text-xs underline underline-offset-2 hover:opacity-80 transition-opacity flex-shrink-0"
                  style={{ color: banner.textColor }}
                  target={banner.linkUrl!.startsWith('http') ? '_blank' : undefined}
                  rel={banner.linkUrl!.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {linkText}
                  <FaExternalLinkAlt size={8} />
                </a>
              )}
            </div>

            {/* ── Zone 2: Contact Info (right side, before dismiss) ── */}
            {hasContact && (
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-xs">
                {banner.contactPhone && (
                  <a
                    href={`tel:${banner.contactPhone}`}
                    className="inline-flex items-center gap-1 hover:opacity-80 opacity-80"
                    style={{ color: banner.textColor }}
                    aria-label="Call us"
                  >
                    <FaPhone size={12} className="sm:w-[10px] sm:h-[10px]" />
                    <span className="hidden lg:inline">{banner.contactPhone}</span>
                  </a>
                )}
                {banner.contactEmail && (
                  <a
                    href={`mailto:${banner.contactEmail}`}
                    className="inline-flex items-center gap-1 hover:opacity-80 opacity-80"
                    style={{ color: banner.textColor }}
                    aria-label="Email us"
                  >
                    <FaEnvelope size={12} className="sm:w-[10px] sm:h-[10px]" />
                    <span className="hidden lg:inline">{banner.contactEmail}</span>
                  </a>
                )}
              </div>
            )}

            {/* ── Zone 3: Dismiss button (far right) ── */}
            {banner.isDismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
                style={{ color: banner.textColor }}
                aria-label="Dismiss notification"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBanner;
