import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useFeaturesViewModel } from '../../viewmodels/featuresViewModel';
import { useAppSelector } from '../../store/hooks';
import useReducedMotion from '../../hooks/useReducedMotion';
import DynamicLucideIcon from '../common/DynamicLucideIcon';
import { Feature } from '../../models/types/feature.types';

/* ═══════════════════════ Accent Color ═══════════════════════ */

const ACCENT = {
  bg: 'bg-indigo-500',
  hex: '#6366f1',
  shadow: 'shadow-indigo-500/25',
  hoverShadow: 'shadow-indigo-500/40',
  modalBg: 'bg-indigo-500',
};

/* ═══════════════════════ Abstract Dashboard Fallback ═══════════════════════ */

const AbstractDashboard: React.FC = () => (
  <div className="absolute inset-0 flex flex-col bg-gray-100 dark:bg-surface-900 overflow-hidden">
    {/* Top nav */}
    <div className="flex items-center h-[8%] min-h-[12px] px-[4%] gap-[3%] bg-white dark:bg-surface-850 border-b border-gray-300/60 dark:border-surface-700/60">
      <div className="w-[3%] aspect-square rounded-full bg-primary-500" />
      <div className="w-[20%] h-[38%] rounded-full bg-gray-200 dark:bg-surface-700" />
      <div className="flex-1" />
      <div className="w-[5%] h-[32%] rounded bg-gray-300 dark:bg-surface-700" />
      <div className="w-[3%] aspect-square rounded-full bg-gray-300 dark:bg-surface-600" />
    </div>
    <div className="flex-1 flex min-h-0">
      {/* Sidebar */}
      <div className="w-[15%] bg-gray-50 dark:bg-surface-850 border-r border-gray-300/60 dark:border-surface-700/60 py-[4%] px-[2.5%] flex flex-col gap-[8%]">
        {[true, false, false, false, false].map((active, i) => (
          <div
            key={i}
            className={`w-full h-[4%] min-h-[3px] rounded-sm ${
              active
                ? 'bg-primary-500/30 dark:bg-primary-400/25'
                : 'bg-gray-300/80 dark:bg-surface-700/50'
            }`}
          />
        ))}
      </div>
      {/* Main content area */}
      <div className="flex-1 p-[4%] flex flex-col gap-[4%] min-h-0">
        {/* Stat cards */}
        <div className="flex gap-[3%] h-[25%]">
          {[true, false, false].map((accent, i) => (
            <div
              key={i}
              className={`flex-1 rounded p-[4%] flex flex-col justify-between border ${
                accent
                  ? 'bg-primary-50 dark:bg-primary-500/[0.08] border-primary-300/60 dark:border-primary-700/25'
                  : 'bg-white dark:bg-surface-800 border-gray-300/50 dark:border-surface-700/40'
              }`}
            >
              <div className="w-[55%] h-[20%] min-h-[2px] rounded-sm bg-gray-400/50 dark:bg-surface-600" />
              <div
                className={`w-[35%] h-[25%] min-h-[3px] rounded-sm ${
                  accent ? 'bg-primary-400/60 dark:bg-primary-400/35' : 'bg-gray-300 dark:bg-surface-600'
                }`}
              />
            </div>
          ))}
        </div>
        {/* Chart area */}
        <div className="flex-1 bg-white dark:bg-surface-800 rounded border border-gray-300/50 dark:border-surface-700/40 p-[4%] flex flex-col min-h-0">
          <div className="w-[22%] h-[6%] min-h-[2px] rounded-sm bg-gray-300 dark:bg-surface-600 mb-[4%]" />
          <div className="flex-1 flex items-end gap-[2.5%]">
            {[
              { h: 40, color: 'bg-primary-400/50 dark:bg-primary-500/35' },
              { h: 65, color: 'bg-emerald-400/50 dark:bg-emerald-500/30' },
              { h: 45, color: 'bg-primary-400/50 dark:bg-primary-500/35' },
              { h: 80, color: 'bg-amber-400/50 dark:bg-amber-500/30' },
              { h: 55, color: 'bg-primary-400/50 dark:bg-primary-500/35' },
              { h: 70, color: 'bg-emerald-400/50 dark:bg-emerald-500/30' },
              { h: 90, color: 'bg-primary-500/50 dark:bg-primary-400/35' },
              { h: 60, color: 'bg-amber-400/50 dark:bg-amber-500/30' },
              { h: 75, color: 'bg-primary-400/50 dark:bg-primary-500/35' },
              { h: 50, color: 'bg-emerald-400/50 dark:bg-emerald-500/30' },
            ].map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${bar.color}`}
                style={{ height: `${bar.h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════ Device Showcase (Laptop + Phone) ═══════════════════════ */

const DeviceShowcase: React.FC<{
  laptopImageUrl?: string | null;
  phoneImageUrl?: string | null;
}> = ({ laptopImageUrl, phoneImageUrl }) => (
  <div className="relative">
    {/* Ambient glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[130%] bg-primary-300/25 dark:bg-primary-500/[0.08] rounded-full -z-10 blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[90%] bg-primary-400/15 dark:bg-primary-400/[0.06] rounded-full -z-10 blur-2xl pointer-events-none" />

    {/* Dot grid pattern */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[140%] -z-20 pointer-events-none opacity-20 dark:opacity-10 text-gray-400 dark:text-neutral-600"
      style={{
        backgroundImage: 'radial-gradient(circle, currentColor 0.8px, transparent 0.8px)',
        backgroundSize: '18px 18px',
      }}
    />

    <div className="relative w-[300px] sm:w-[420px] lg:w-[300px] xl:w-[350px] 2xl:w-[390px]">
      {/* Laptop */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 80, damping: 18 }}
        className="relative"
      >
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          {/* Title bar — slim, matching Selected Work */}
          <div className="h-4 lg:h-5 bg-slate-100 dark:bg-slate-700 flex items-center relative">
            <div className="flex gap-1 ml-2 lg:ml-2.5">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#EF4444]" />
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#F59E0B]" />
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#22C55E]" />
            </div>
          </div>

          {/* Screen — near-borderless */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {laptopImageUrl ? (
              <img
                src={laptopImageUrl}
                alt="Feature showcase"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <AbstractDashboard />
            )}
          </div>
        </div>
      </motion.div>

      {/* Phone — overlapping laptop's bottom-right */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 80, damping: 18 }}
        className="absolute z-10 -right-[4%] lg:-right-[8%]"
        style={{ width: '28%', bottom: '-18%', transform: 'rotate(3deg)' }}
      >
        <div className="rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 p-[1px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.2)] dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.45)]">
          {/* Phone screen with overlaid indicators */}
          <div className="relative rounded-[15px] sm:rounded-[19px] lg:rounded-[23px] overflow-hidden" style={{ aspectRatio: '9 / 19.5' }}>
            {phoneImageUrl ? (
              <img
                src={phoneImageUrl}
                alt="Mobile preview"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'top center' }}
              />
            ) : laptopImageUrl ? (
              <img
                src={laptopImageUrl}
                alt="Mobile preview"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'top center' }}
              />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <AbstractDashboard />
              </div>
            )}

            {/* Dynamic island — overlaid on screen */}
            <div className="absolute top-[2px] sm:top-[3px] left-1/2 -translate-x-1/2 bg-black rounded-full z-10 h-[6px] sm:h-[8px] lg:h-[10px]" style={{ width: '30%' }} />

            {/* Home indicator — overlaid on screen */}
            <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-[40%] h-[4px] rounded-sm bg-gray-400/60 z-10" />
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

/* ═══════════════════════ Desktop Feature Item ═══════════════════════ */

const DesktopFeatureItem: React.FC<{
  feature: Feature;
  align: 'left' | 'right';
  delay: number;
  getTitle: (f: Feature) => string;
  getShortDescription: (f: Feature) => string;
  onClick: () => void;
}> = ({ feature, align, delay, getTitle, getShortDescription, onClick }) => {
  const isLeft = align === 'left';
  const accent = ACCENT;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay }}
      className="flex items-center gap-3 cursor-pointer group"
      onClick={onClick}
    >
      {isLeft ? (
        <>
          {/* Text — strictly right-aligned */}
          <div className="flex-1 min-w-0 text-right">
            <h3 className="text-right text-base xl:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 leading-snug">
              {getTitle(feature)}
            </h3>
            <p className="text-right text-sm text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
              {getShortDescription(feature)}
            </p>
          </div>

          {/* Icon circle with short connector toward center */}
          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-16 h-16 rounded-full ${accent.bg} flex items-center justify-center shadow-lg ${accent.shadow} group-hover:shadow-xl transition-shadow duration-300`}
            >
              <DynamicLucideIcon name={feature.iconName} size={28} className="text-white" />
            </motion.div>
            {/* Gradient accent connector toward center */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-full h-[1.5px]"
              style={{
                width: '26px',
                background: `linear-gradient(to right, ${accent.hex}60, transparent)`,
              }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Icon circle with gradient accent connector toward center */}
          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-16 h-16 rounded-full ${accent.bg} flex items-center justify-center shadow-lg ${accent.shadow} group-hover:shadow-xl transition-shadow duration-300`}
            >
              <DynamicLucideIcon name={feature.iconName} size={28} className="text-white" />
            </motion.div>
            {/* Gradient accent connector toward center */}
            <div
              className="absolute top-1/2 -translate-y-1/2 right-full h-[1.5px]"
              style={{
                width: '26px',
                background: `linear-gradient(to right, transparent, ${accent.hex}60)`,
              }}
            />
          </div>

          {/* Text — left-aligned */}
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-base xl:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 leading-snug">
              {getTitle(feature)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 leading-relaxed">
              {getShortDescription(feature)}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

/* ═══════════════════════ Mobile Feature Card ═══════════════════════ */

const MobileFeatureCard: React.FC<{
  feature: Feature;
  delay: number;
  getTitle: (f: Feature) => string;
  getShortDescription: (f: Feature) => string;
  onClick: () => void;
  reduceMotion?: boolean;
}> = ({ feature, delay, getTitle, getShortDescription, onClick, reduceMotion }) => {
  const accent = ACCENT;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={reduceMotion ? undefined : { once: true, margin: '-80px' }}
      transition={reduceMotion ? undefined : { duration: 0.6, delay }}
      className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer bg-gray-50/80 dark:bg-surface-800/80 hover:bg-primary-50/60 dark:hover:bg-primary-900/10 transition-all duration-300 group ring-1 ring-gray-200/50 dark:ring-surface-700/50 hover:ring-primary-200/60 dark:hover:ring-primary-700/30"
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-full ${accent.bg} flex items-center justify-center flex-shrink-0 shadow-md ${accent.shadow}`}>
        <DynamicLucideIcon name={feature.iconName} size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
          {getTitle(feature)}
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
          {getShortDescription(feature)}
        </p>
      </div>
      <DynamicLucideIcon
        name="ChevronRight"
        size={16}
        className="text-gray-300 dark:text-neutral-600 flex-shrink-0 mt-1 group-hover:text-primary-400 dark:group-hover:text-primary-500 transition-colors"
      />
    </motion.div>
  );
};

/* ═══════════════════════ Feature Detail Modal ═══════════════════════ */

const FeatureDetailModal: React.FC<{
  feature: Feature;
  onClose: () => void;
  getTitle: (f: Feature) => string;
  getShortDescription: (f: Feature) => string;
  getFullDescription: (f: Feature) => string;
}> = ({ feature, onClose, getTitle, getShortDescription, getFullDescription }) => {
  const accent = ACCENT;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Popup */}
      <motion.div
        className="relative w-full max-w-lg max-h-modal overflow-y-auto bg-white dark:bg-surface-850 rounded-2xl ring-1 ring-gray-200/60 dark:ring-white/[0.12]"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.15)' }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 dark:bg-surface-700 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-surface-600 transition-colors"
          aria-label="Close"
        >
          <DynamicLucideIcon name="X" size={16} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-5 pr-10">
            <div className={`w-14 h-14 rounded-xl ${accent.modalBg} flex items-center justify-center shadow-lg ${accent.shadow}`}>
              <DynamicLucideIcon name={feature.iconName} size={26} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {getTitle(feature)}
              </h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                {getShortDescription(feature)}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
            {getFullDescription(feature)}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════ Main Component ═══════════════════════ */

const FeatureFocus: React.FC = () => {
  const {
    features,
    isLoading,
    language,
    getTitle,
    getShortDescription,
    getFullDescription,
  } = useFeaturesViewModel();

  const settings = useAppSelector((state) => state.siteSettings.settings);
  const reduceMotion = useReducedMotion();

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const mid = Math.ceil(features.length / 2);
  const leftFeatures = features.slice(0, mid);
  const rightFeatures = features.slice(mid);

  const sectionTitle =
    (language === 'en'
      ? settings?.featureSectionTitle_en
      : settings?.featureSectionTitle_sv) || (language === 'en' ? 'What We Offer' : 'Vad Vi Erbjuder');

  const sectionSubtitle =
    (language === 'en'
      ? settings?.featureSectionSubtitle_en
      : settings?.featureSectionSubtitle_sv) || (language === 'en' ? 'Our Core Capabilities' : 'Våra Kärnkompetenser');

  const laptopImage = settings?.featureSectionImageFile || null;
  const phoneImage = settings?.featureSectionMobileImageFile || null;

  if (isLoading) {
    return (
      <section className="py-24 bg-white dark:bg-surface-900 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-surface-700 rounded-lg w-56 mx-auto mb-4" />
            <div className="h-5 bg-gray-200 dark:bg-surface-700 rounded-lg w-48 mx-auto mb-16" />
            <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] gap-x-10 gap-y-10 items-center">
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 justify-end">
                    <div className="space-y-2 text-right flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-surface-700 rounded w-32 ml-auto" />
                      <div className="h-4 bg-gray-200 dark:bg-surface-700 rounded w-48 ml-auto" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-surface-700 flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="w-[400px] bg-gray-200 dark:bg-surface-700 rounded-xl aspect-[16/10]" />
              </div>
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-surface-700 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-surface-700 rounded w-32" />
                      <div className="h-4 bg-gray-200 dark:bg-surface-700 rounded w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) return null;

  return (
    <section
      className="pt-28 pb-36 bg-white dark:bg-surface-900 overflow-hidden relative z-10"
      role="region"
      aria-label={language === 'en' ? 'Features' : 'Funktioner'}
    >
      {/* Top section divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent dark:via-neutral-600/40" />

      {/* Bottom section divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent dark:via-neutral-600/40" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-14 lg:mb-16">
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={reduceMotion ? undefined : { once: true, margin: '-80px' }}
            transition={reduceMotion ? undefined : { duration: 0.6 }}
            className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white"
          >
            {sectionTitle}
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={reduceMotion ? undefined : { once: true, margin: '-80px' }}
            transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.1 }}
            className="text-gray-400 dark:text-neutral-500 mt-4 font-medium text-xs sm:text-sm uppercase tracking-[0.2em]"
          >
            {sectionSubtitle}
          </motion.p>
        </div>

        {/* Desktop: CSS Grid */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: '1fr auto 1fr',
            columnGap: '4rem',
            alignItems: 'center',
          }}
        >
          {/* Left column features — single cell, flex centered */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.75rem' }}>
            {leftFeatures.map((feature, i) => (
              <DesktopFeatureItem
                key={feature.id}
                feature={feature}
                align="left"
                delay={i * 0.12}
                getTitle={getTitle}
                getShortDescription={getShortDescription}
                onClick={() => {
                  setSelectedFeature(feature);
                }}
              />
            ))}
          </div>

          {/* Center: Device Showcase */}
          <div
            style={{
              alignSelf: 'center',
              justifySelf: 'center',
              transform: 'translateX(-14px)',
            }}
          >
            <DeviceShowcase laptopImageUrl={laptopImage} phoneImageUrl={phoneImage} />
          </div>

          {/* Right column features — single cell, flex centered */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.75rem' }}>
            {rightFeatures.map((feature, i) => (
              <DesktopFeatureItem
                key={feature.id}
                feature={feature}
                align="right"
                delay={i * 0.12}
                getTitle={getTitle}
                getShortDescription={getShortDescription}
                onClick={() => {
                  setSelectedFeature(feature);
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Device on top + card grid */}
        <div className="lg:hidden">
          <div className="flex justify-center pb-10 mb-6 sm:mb-8" style={{ transform: 'translateX(-3%)' }}>
            <DeviceShowcase laptopImageUrl={laptopImage} phoneImageUrl={phoneImage} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {features.map((feature, i) => (
              <MobileFeatureCard
                key={feature.id}
                feature={feature}
                delay={i * 0.08}
                getTitle={getTitle}
                getShortDescription={getShortDescription}
                reduceMotion={reduceMotion}
                onClick={() => {
                  setSelectedFeature(feature);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail popup — portal to body to escape section stacking context */}
      {createPortal(
        <AnimatePresence>
          {selectedFeature && (
            <FeatureDetailModal
              feature={selectedFeature}
              onClose={() => setSelectedFeature(null)}
              getTitle={getTitle}
              getShortDescription={getShortDescription}
              getFullDescription={getFullDescription}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default FeatureFocus;
