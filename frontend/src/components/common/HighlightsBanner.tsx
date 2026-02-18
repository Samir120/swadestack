import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { Banner } from '../../models/types/bannerTypes';
import LoadingSpinner from './LoadingSpinner';

interface HighlightsBannerProps {
  scrollToSection: (sectionId: string) => void;
}

const HighlightsBanner: React.FC<HighlightsBannerProps> = ({ scrollToSection }) => {
  // 1. Get Language + Settings from Redux Store
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);

  // 2. State for Dynamic Data
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. State for Carousel Animation
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 4. Fetch Banners on Mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiClient.get<any>('/banners');

        if (response.success && response.data) {
          const fetchedBanners = Array.isArray(response.data)
            ? response.data
            : response.data.banners || [];

          setBanners(fetchedBanners);
        }
      } catch (error) {
        console.error('Failed to load highlights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // 5. Navigation Logic
  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // 6. Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  // 7. Auto-rotation Effect
  useEffect(() => {
    if (banners.length === 0 || !isPlaying) return;
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [currentSlide, banners.length, isPlaying]);

  // 8. Slide z-index and opacity helpers
  const getSlideStyle = (index: number): React.CSSProperties => {
    const isActive = index === currentSlide;
    return {
      opacity: isActive ? 1 : 0,
      zIndex: isActive ? 10 : 0,
      transition: 'opacity 1s ease-in-out',
    };
  };

  // Helper for localization
  const getLocalizedContent = (banner: Banner) => {
    return {
      title: language === 'en' ? banner.title_en : banner.title_sv,
      desc: language === 'en' ? banner.desc_en : banner.desc_sv,
    };
  };

  // Localized hero overlay text
  const heroStatusText = language === 'en'
    ? (settings?.heroStatus_en || 'Available for new projects')
    : (settings?.heroStatus_sv || 'Tillgängliga för nya projekt');

  const heroPrimaryButton = language === 'en'
    ? (settings?.heroButtonPrimary_en || 'View Our Work')
    : (settings?.heroButtonPrimary_sv || 'Se Vårt Arbete');

  const heroSecondaryButton = language === 'en'
    ? (settings?.heroButtonSecondary_en || 'Our Services')
    : (settings?.heroButtonSecondary_sv || 'Våra Tjänster');

  // 8. Render Loading State
  if (isLoading) {
    return (
      <div className="relative z-0 w-full h-[300px] sm:h-[480px] md:h-[580px] lg:h-[660px] bg-gray-200 dark:bg-surface-800 flex flex-col items-center justify-center gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">Loading highlights...</span>
      </div>
    );
  }

  // Fallback hero when no banners exist
  if (banners.length === 0) {
    const heroHeading = language === 'en'
      ? (settings?.heroFallbackText_en || 'Agency')
      : (settings?.heroFallbackText_sv || 'Byrå');

    const tagline = settings
      ? (language === 'en' ? settings.tagline_en : settings.tagline_sv)
      : 'Building Digital Excellence';

    return (
      <div className="relative z-0 w-full h-[300px] sm:h-[480px] md:h-[580px] lg:h-[660px] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900">
        {/* Decorative gradient blobs */}
        <div className="absolute top-[10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary-600/20 rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent-500/10 rounded-full blur-[100px] sm:blur-[150px]" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 sm:px-10 text-center z-10">
          <div className="inline-flex items-center justify-center px-3 sm:px-5 py-1 sm:py-2 mb-3 sm:mb-7 border border-primary-400/30 rounded-full bg-primary-500/15 backdrop-blur-sm">
            <span className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-primary-400 mr-1.5 sm:mr-2.5 animate-pulse"></span>
            <span className="text-primary-200 text-[9px] sm:text-sm font-bold tracking-widest uppercase">
              {heroStatusText}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-thin text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-accent-300 mb-3 sm:mb-6 leading-[1.1] tracking-wide drop-shadow-lg">
            {heroHeading}
          </h1>

          {tagline && (
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-5 sm:mb-10 max-w-4xl font-light leading-relaxed">
              {tagline}
            </p>
          )}

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => scrollToSection('portfolio')}
              className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-8 py-2.5 sm:py-3 bg-white text-primary-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/90 transition-all duration-300 active:scale-[0.97] shadow-lg hover:shadow-xl"
            >
              {heroPrimaryButton}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-8 py-2.5 sm:py-3 border border-white/25 text-white/90 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-300 active:scale-[0.97] backdrop-blur-sm"
            >
              {heroSecondaryButton}
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 9. Main Render — Carousel with persistent hero overlay
  return (
    <div
      className="relative z-0 w-full h-[300px] sm:h-[480px] md:h-[580px] lg:h-[660px] overflow-hidden bg-gray-100 dark:bg-surface-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image slides — background + Ken Burns + gradient only */}
      {banners.map((banner, index) => {
        const isActive = index === currentSlide;

        return (
          <div
            key={banner.id}
            className="absolute inset-0 overflow-hidden"
            style={getSlideStyle(index)}
          >
            {/* Background image with Ken Burns zoom */}
            <div
              className={isActive ? 'absolute inset-0 animate-kenBurns' : 'absolute inset-0'}
              key={isActive ? `kb-${index}-${currentSlide}` : `idle-${index}`}
              style={{
                backgroundImage: `url(${banner.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            {/* Multi-layer gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
          </div>
        );
      })}

      {/* Persistent content overlay — positioned lower for cinematic feel */}
      <div className="absolute inset-0 z-[15] flex flex-col justify-end items-center text-white px-4 sm:px-10 pb-14 sm:pb-20 md:pb-24 text-center pointer-events-none">
        {/* Status badge */}
        <div className="inline-flex items-center justify-center px-3 sm:px-5 py-1 sm:py-2 mb-3 sm:mb-5 border border-primary-400/30 rounded-full bg-primary-500/15 backdrop-blur-sm pointer-events-auto">
          <span className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-primary-400 mr-1.5 sm:mr-2.5 animate-pulse"></span>
          <span className="text-primary-200 text-[9px] sm:text-sm font-bold tracking-widest uppercase">
            {heroStatusText}
          </span>
        </div>

        {/* Per-slide title + description */}
        <div key={currentSlide} className="max-w-4xl">
          <h2
            className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-thin mb-2 sm:mb-3 md:mb-4 drop-shadow-lg leading-tight tracking-wide animate-bannerTextIn"
            style={{ animationDelay: '0.15s' }}
          >
            {getLocalizedContent(banners[currentSlide]).title}
          </h2>
          <p
            className="text-xs sm:text-base md:text-lg lg:text-xl drop-shadow-md max-w-3xl mx-auto font-light leading-relaxed text-white/80 animate-bannerTextIn line-clamp-2 sm:line-clamp-none"
            style={{ animationDelay: '0.4s' }}
          >
            {getLocalizedContent(banners[currentSlide]).desc}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-7 pointer-events-auto animate-bannerTextIn" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={() => scrollToSection('portfolio')}
            className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-8 py-2.5 sm:py-3 bg-white text-primary-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-white/90 transition-all duration-300 active:scale-[0.97] shadow-lg hover:shadow-xl"
          >
            {heroPrimaryButton}
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => scrollToSection('services')}
            className="group inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-8 py-2.5 sm:py-3 border border-white/25 text-white/90 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-300 active:scale-[0.97] backdrop-blur-sm"
          >
            {heroSecondaryButton}
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Buttons - hidden on mobile, dots are sufficient */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute top-1/2 left-4 md:left-5 -translate-y-1/2 z-20 bg-white/15 backdrop-blur-sm hover:bg-white/30 border border-white/20 rounded-full w-10 h-10 md:w-12 md:h-12 items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Previous Slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute top-1/2 right-4 md:right-5 -translate-y-1/2 z-20 bg-white/15 backdrop-blur-sm hover:bg-white/30 border border-white/20 rounded-full w-10 h-10 md:w-12 md:h-12 items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Next Slide"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators + Play/Pause */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 z-20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-6 sm:w-8'
                  : 'bg-white/40 w-2 sm:w-2.5 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90"
          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isPlaying ? (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default HighlightsBanner;
