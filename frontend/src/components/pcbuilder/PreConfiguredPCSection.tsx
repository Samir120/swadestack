import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFeaturedPCs } from '../../store/slices/preConfiguredPCSlice';
import useReducedMotion from '../../hooks/useReducedMotion';
import PreConfiguredPCCard from './PreConfiguredPCCard';
import LoadingSpinner from '../common/LoadingSpinner';
import AutoCarousel from '../common/AutoCarousel';
import { motion } from 'framer-motion';

/**
 * Pre-Configured PC Section for Home Page
 * Displays hero banner with CTAs and featured PC cards via AutoCarousel
 */

const PreConfiguredPCSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language) as 'en' | 'sv';
  const { settings } = useAppSelector((state) => state.siteSettings);
  const { featuredPCs, isFeaturedLoading, featuredError } = useAppSelector(
    (state) => state.preConfiguredPC
  );
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    dispatch(fetchFeaturedPCs(8));
  }, [dispatch]);

  // Don't render if section is hidden in admin settings
  if (settings?.gamingPcSectionVisible === false) {
    return null;
  }

  // Don't render if no featured PCs
  if (featuredPCs.length === 0 && !isFeaturedLoading) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative z-10 bg-gray-50/80 dark:bg-surface-950/50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <motion.div
          className="relative mb-8 sm:mb-10 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.6 }}
          viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-blue-500/20 to-transparent" />
          </div>

          <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 mb-4 sm:mb-6 rounded-full bg-primary-600/20 border border-primary-500/30">
                <span className="w-2 h-2 rounded-full bg-primary-600 mr-2 animate-pulse" />
                <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  {language === 'en'
                    ? (settings?.gamingPcBadge_en || 'Gaming PCs')
                    : (settings?.gamingPcBadge_sv || 'Speldatorer')}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4 leading-tight">
                {language === 'en'
                  ? (settings?.gamingPcTitle_en || 'Pre-Built Gaming PCs')
                  : (settings?.gamingPcTitle_sv || 'Förkonfigurerade Speldatorer')}
              </h2>

              {/* Tagline */}
              <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 mb-4 sm:mb-6">
                {language === 'en'
                  ? (settings?.gamingPcTagline_en || 'No compromise. Pure Power.')
                  : (settings?.gamingPcTagline_sv || 'Inga kompromisser. Ren kraft.')}
              </p>

              {/* Description */}
              <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-2xl">
                {language === 'en'
                  ? (settings?.gamingPcDescription_en || 'Premium components, expertly assembled, and ready to game. Same components a demanding user would choose, optimized for gaming.')
                  : (settings?.gamingPcDescription_sv || 'Premiumkomponenter, fackmässigt monterade och redo för gaming. Samma komponenter som en krävande användare skulle välja, optimerade för gaming.')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/pre-configured-pcs"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-full text-sm sm:text-base font-bold hover:bg-primary-500 active:scale-[0.98] transition-all text-center"
                >
                  {language === 'en'
                    ? (settings?.gamingPcButtonPrimary_en || 'Pre-Built PCs')
                    : (settings?.gamingPcButtonPrimary_sv || 'Färdigbyggda datorer')}
                </Link>
                <Link
                  to="/pc-builder"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-gray-300 dark:border-surface-600 text-gray-900 dark:text-white rounded-full text-sm sm:text-base font-bold hover:border-neutral-400 hover:bg-gray-200 dark:hover:bg-surface-700/50 active:scale-[0.98] transition-all text-center"
                >
                  {language === 'en'
                    ? (settings?.gamingPcButtonSecondary_en || 'Build Your Own')
                    : (settings?.gamingPcButtonSecondary_sv || 'Välj komponenter själv')}
                </Link>
              </div>
            </div>

            {/* Circle Badges - Desktop only */}
            <div className="hidden lg:flex absolute bottom-6 right-6 items-center gap-3">
              {/* Badge 1 - Warranty */}
              {settings?.gamingPcShowWarranty !== false && (
                <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{settings?.gamingPcWarrantyYears || 3}</div>
                    <div className="text-[9px] font-bold text-white/80 uppercase tracking-wider leading-tight">
                      {language === 'en'
                        ? (settings?.gamingPcWarrantyLabel_en || 'Year Warranty')
                        : (settings?.gamingPcWarrantyLabel_sv || 'Års Garanti')}
                    </div>
                  </div>
                </div>
              )}

              {/* Badge 2 */}
              {settings?.gamingPcShowCircleBadge2 && settings?.gamingPcCircleBadge2Value != null && (
                <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{settings.gamingPcCircleBadge2Value}</div>
                    <div className="text-[9px] font-bold text-white/80 uppercase tracking-wider leading-tight">
                      {language === 'en'
                        ? (settings?.gamingPcCircleBadge2Label_en || '')
                        : (settings?.gamingPcCircleBadge2Label_sv || '')}
                    </div>
                  </div>
                </div>
              )}

              {/* Badge 3 */}
              {settings?.gamingPcShowCircleBadge3 && settings?.gamingPcCircleBadge3Value != null && (
                <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{settings.gamingPcCircleBadge3Value}</div>
                    <div className="text-[9px] font-bold text-white/80 uppercase tracking-wider leading-tight">
                      {language === 'en'
                        ? (settings?.gamingPcCircleBadge3Label_en || '')
                        : (settings?.gamingPcCircleBadge3Label_sv || '')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.h3
          className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-8 pl-5 border-l-[4px] border-primary-500"
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.5 }}
          viewport={reduceMotion ? undefined : { once: true, margin: "-50px" }}
        >
          {language === 'en'
            ? (settings?.gamingPcSectionTitle_en || 'Popular Pre-Built Models')
            : (settings?.gamingPcSectionTitle_sv || 'Populära förkonfigurerade modeller')}
        </motion.h3>

        {/* PC Cards */}
        {isFeaturedLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : featuredError ? (
          <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
            {language === 'en'
              ? (settings?.gamingPcEmptyMessage_en || 'Failed to load PCs')
              : (settings?.gamingPcEmptyMessage_sv || 'Kunde inte ladda datorer')}
          </div>
        ) : (
          <AutoCarousel
            items={featuredPCs.map(pc => <PreConfiguredPCCard key={pc.id} pc={pc} language={language} />)}
            itemKeys={featuredPCs.map(pc => pc.id)}
            interval={4500}
            gap={24}
          />
        )}

        {/* See All Button */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Link
            to="/pre-configured-pcs"
            className="px-8 py-3 border-2 border-gray-300 dark:border-surface-600 text-gray-700 dark:text-neutral-300 rounded-full font-bold hover:bg-gray-200 dark:hover:bg-surface-700 hover:border-neutral-400 active:scale-[0.98] transition-all"
          >
            {language === 'en'
              ? (settings?.gamingPcViewAllButton_en || 'See all pre-built models')
              : (settings?.gamingPcViewAllButton_sv || 'Se alla färdigbyggda modeller')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PreConfiguredPCSection;
