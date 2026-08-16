import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchAllPreConfiguredPCs,
  setFilters,
  clearFilters,
  setCurrentPage,
} from '../store/slices/preConfiguredPCSlice';
import { PCTier } from '../models/types/pcConfiguration.types';
import Header from '../components/common/Header';
import DynamicFooter from '../components/common/DynamicFooter';
import PreConfiguredPCCard from '../components/pcbuilder/PreConfiguredPCCard';
import { motion } from 'framer-motion';
import Reveal from '../components/common/Reveal';
import AmbientBackground from '../components/common/AmbientBackground';
import { CardGridSkeleton } from '../components/common/Skeleton';
// Tier configuration with styled colors instead of emojis
const TIERS: { value: PCTier | 'all'; label: { en: string; sv: string }; color: string; activeColor: string }[] = [
  {
    value: 'all',
    label: { en: 'All Models', sv: 'Alla modeller' },
    color: 'text-gray-600 dark:text-neutral-400 border-gray-300 dark:border-surface-600 hover:border-gray-400 dark:hover:border-surface-500',
    activeColor: 'bg-primary-600 text-white border-primary-600',
  },
  {
    value: 'core',
    label: { en: 'Core', sv: 'Core' },
    color: 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600',
    activeColor: 'bg-green-600 text-white border-green-600',
  },
  {
    value: 'pro',
    label: { en: 'Pro', sv: 'Pro' },
    color: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600',
    activeColor: 'bg-blue-600 text-white border-blue-600',
  },
  {
    value: 'ultra',
    label: { en: 'Ultra', sv: 'Ultra' },
    color: 'text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600',
    activeColor: 'bg-purple-600 text-white border-purple-600',
  },
  {
    value: 'custom',
    label: { en: 'Custom', sv: 'Custom' },
    color: 'text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600',
    activeColor: 'bg-primary-600 text-white border-primary-600',
  },
];

const PreConfiguredPCList: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language) as 'en' | 'sv';
  const { settings } = useAppSelector((state) => state.siteSettings);
  const {
    allPCs,
    totalPCs,
    isAllLoading,
    allError,
    filters,
    currentPage,
    pageSize,
  } = useAppSelector((state) => state.preConfiguredPC);

  // True only for the render before the mount effect below dispatches the first
  // request, so the "no PCs found" state cannot paint for a frame on arrival.
  const beforeFirstRequest = useRef(true);
  useEffect(() => {
    beforeFirstRequest.current = false;
  }, []);

  // Load PCs on mount and when filters/page change
  useEffect(() => {
    dispatch(fetchAllPreConfiguredPCs({ filters, page: currentPage, pageSize }));
  }, [dispatch, filters, currentPage, pageSize]);

  // Handle tier filter change
  const handleTierChange = (tier: PCTier | 'all') => {
    if (tier === 'all') {
      dispatch(clearFilters());
    } else {
      dispatch(setFilters({ tier }));
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalPCs / pageSize);
  const selectedTier = filters.tier || 'all';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-surface-950 dark:text-neutral-200 font-sans relative flex flex-col">
      {/* Ambient Dark Mode Background */}
      <AmbientBackground variant="soft" wash="surface-950" />

      <Header />

      <main className="flex-1 pt-20 relative z-[1]">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-surface-900 dark:via-surface-850 dark:to-surface-950">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-blue-500/20 to-transparent" />
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              className="py-12 sm:py-16 lg:py-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-gray-400 dark:text-neutral-500 mb-6 sm:mb-8">
                <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {language === 'en' ? 'Home' : 'Hem'}
                </Link>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700 dark:text-neutral-300 font-medium">
                  {language === 'en' ? 'Pre-Built PCs' : 'Färdigbyggda datorer'}
                </span>
              </nav>

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
                <h1 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4 leading-tight">
                  {language === 'en' ? 'Pre-Built PCs' : 'Färdigbyggda datorer'}
                </h1>

                {/* Subtitle */}
                <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 mb-4 sm:mb-6">
                  {language === 'en'
                    ? (settings?.gamingPcTagline_en || 'No compromise. Pure Power.')
                    : (settings?.gamingPcTagline_sv || 'Inga kompromisser. Ren kraft.')}
                </p>

                {/* Description */}
                <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base lg:text-lg max-w-2xl">
                  {language === 'en'
                    ? (settings?.gamingPcDescription_en || 'Premium components, expertly assembled, and ready to game. Browse our selection of pre-configured systems built for performance.')
                    : (settings?.gamingPcDescription_sv || 'Premiumkomponenter, fackmässigt monterade och redo för gaming. Utforska vårt urval av förkonfigurerade system byggda för prestanda.')}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Gradient divider */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

        {/* Filter & Content Section */}
        <section className="py-10 sm:py-14 lg:py-16 relative bg-gray-50/80 dark:bg-surface-950/50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tier Filter Pills */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {TIERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => handleTierChange(tier.value)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-300 active:scale-[0.96] ${
                    selectedTier === tier.value
                      ? tier.activeColor
                      : tier.color
                  }`}
                >
                  {tier.label[language]}
                </button>
              ))}
            </motion.div>

            {/* Results Count */}
            <motion.div
              className="flex items-center justify-between mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p className="text-sm text-gray-400 dark:text-neutral-500">
                {language === 'en'
                  ? `Showing ${allPCs.length} of ${totalPCs} results`
                  : `Visar ${allPCs.length} av ${totalPCs} resultat`}
                {selectedTier !== 'all' && (
                  <span className="ml-2 text-primary-600 dark:text-primary-400 font-medium">
                    — {TIERS.find(t => t.value === selectedTier)?.label[language]}
                  </span>
                )}
              </p>
            </motion.div>

            {/* PC Grid */}
            {isAllLoading || beforeFirstRequest.current ? (
              <div aria-busy="true">
                <span className="sr-only">
                  {language === 'en' ? 'Loading PCs...' : 'Laddar datorer...'}
                </span>
                <CardGridSkeleton
                  count={8}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                />
              </div>
            ) : allError ? (
              <motion.div
                className="text-center py-20 bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-gray-500 dark:text-neutral-400 mb-4">{allError}</p>
                <button
                  onClick={() => dispatch(fetchAllPreConfiguredPCs({ filters, page: currentPage, pageSize }))}
                  className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-500 active:scale-[0.98] transition-all"
                >
                  {language === 'en' ? 'Try Again' : 'Försök igen'}
                </button>
              </motion.div>
            ) : allPCs.length === 0 ? (
              <motion.div
                className="text-center py-20 bg-white dark:bg-surface-850 rounded-2xl border border-dashed border-gray-200 dark:border-surface-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <p className="text-gray-500 dark:text-neutral-400 mb-2">
                  {language === 'en' ? 'No pre-configured PCs found' : 'Inga förkonfigurerade datorer hittades'}
                </p>
                {selectedTier !== 'all' && (
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline mt-2"
                  >
                    {language === 'en' ? 'Clear filters' : 'Rensa filter'}
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden -mx-4">
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 px-[7.5vw] scrollbar-hide">
                    {allPCs.map((pc, index) => (
                      <motion.div
                        key={pc.id}
                        className="w-[85vw] flex-shrink-0 snap-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05 }}
                      >
                        <PreConfiguredPCCard pc={pc} language={language} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Desktop: Grid */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {allPCs.map((pc, index) => (
                    <motion.div
                      key={pc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05 }}
                    >
                      <PreConfiguredPCCard pc={pc} language={language} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="flex justify-center items-center gap-2 mt-10 sm:mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-full border-2 transition-all ${
                        currentPage === 1
                          ? 'border-gray-200 dark:border-surface-700 text-gray-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'border-gray-300 dark:border-surface-600 text-gray-500 dark:text-neutral-400 hover:bg-primary-600 hover:text-white hover:border-primary-600 active:scale-95'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all active:scale-95 ${
                          page === currentPage
                            ? 'bg-primary-600 text-white shadow-glow'
                            : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2.5 rounded-full border-2 transition-all ${
                        currentPage === totalPages
                          ? 'border-gray-200 dark:border-surface-700 text-gray-300 dark:text-neutral-600 cursor-not-allowed'
                          : 'border-gray-300 dark:border-surface-600 text-gray-500 dark:text-neutral-400 hover:bg-primary-600 hover:text-white hover:border-primary-600 active:scale-95'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Gradient divider */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

        {/* Build Your Own CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 relative bg-white dark:bg-surface-900">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-surface-800 dark:via-surface-850 dark:to-surface-800" y={30} duration={0.6} margin="0px 0px -100px 0px">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary-600/20 to-transparent" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-blue-500/20 to-transparent" />
              </div>

              <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4">
                  {language === 'en' ? 'Want something unique?' : 'Vill du ha något unikt?'}
                </h2>
                <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 mb-6 sm:mb-8">
                  {language === 'en'
                    ? 'Build your dream PC with our configurator'
                    : 'Bygg din drömdator med vår konfigurator'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Link
                    to="/pc-builder"
                    className="px-8 py-3.5 sm:py-4 bg-primary-600 text-white rounded-full text-sm sm:text-base font-bold hover:bg-primary-500 active:scale-[0.98] transition-all shadow-md hover:shadow-glow"
                  >
                    {language === 'en' ? 'Build Your Own' : 'Bygg din egen'}
                  </Link>
                  <Link
                    to="/"
                    className="px-8 py-3.5 sm:py-4 bg-transparent border-2 border-gray-300 dark:border-surface-600 text-gray-700 dark:text-neutral-300 rounded-full text-sm sm:text-base font-bold hover:border-gray-400 dark:hover:border-surface-500 hover:bg-gray-100 dark:hover:bg-surface-700/50 active:scale-[0.98] transition-all"
                  >
                    {language === 'en' ? 'Back to Home' : 'Tillbaka till startsidan'}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <DynamicFooter />
    </div>
  );
};

export default PreConfiguredPCList;
