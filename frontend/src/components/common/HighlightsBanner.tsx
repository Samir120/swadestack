import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { Banner } from '../../models/types/bannerTypes';
import LoadingSpinner from './LoadingSpinner';
import useReducedMotion from '../../hooks/useReducedMotion';

interface HighlightsBannerProps {
  scrollToSection: (sectionId: string) => void;
}

const HighlightsBanner: React.FC<HighlightsBannerProps> = ({ scrollToSection }) => {
  // 1. Get Language + Settings from Redux Store
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);

  const reduceMotion = useReducedMotion();

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

  // Scroll indicator handler — scroll past the banner
  const handleScrollDown = () => {
    const bannerHeight = window.innerWidth < 640 ? window.innerHeight * 0.85 : window.innerHeight;
    window.scrollTo({ top: bannerHeight, behavior: 'smooth' });
  };

  // Shared scroll indicator
  const ScrollIndicator = () => (
    <button
      onClick={handleScrollDown}
      className="absolute bottom-7 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-white/60 hover:text-white/90 transition-colors duration-300"
      aria-label="Scroll down"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
      </svg>
    </button>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="relative z-0 w-full h-[85vh] sm:h-screen bg-black flex flex-col items-center justify-center gap-3">
        <LoadingSpinner />
        <span className="text-neutral-400 text-xs sm:text-sm">Loading highlights...</span>
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
      <div className="relative z-0 w-full h-[85vh] sm:h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900">
        {/* Decorative gradient blobs */}
        <div className="absolute top-[10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary-600/20 rounded-full blur-[100px] sm:blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-accent-500/10 rounded-full blur-[100px] sm:blur-[150px]" />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-5 sm:px-6 text-center z-10">
          <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 mb-4 sm:mb-8 border border-white/20 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary-400 mr-2 sm:mr-2.5 animate-pulse"></span>
            <span className="text-white/80 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
              {heroStatusText}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-6 leading-[1.1] tracking-tight"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
          >
            {heroHeading}
          </h1>

          {tagline && (
            <p
              className="text-sm sm:text-lg md:text-xl mb-5 sm:mb-10 max-w-2xl font-light leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
            >
              {tagline}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection('portfolio')}
              className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 sm:px-9 sm:py-4 bg-primary-600 text-white rounded-[10px] text-sm sm:text-base font-bold backdrop-blur-sm hover:bg-primary-500 hover:shadow-glow transition-all duration-300 active:scale-[0.97]"
            >
              {heroPrimaryButton}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 sm:px-9 sm:py-4 border-2 border-white text-white rounded-[10px] text-sm sm:text-base font-semibold backdrop-blur-sm hover:bg-white hover:text-gray-900 transition-all duration-300 active:scale-[0.97]"
            >
              {heroSecondaryButton}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        <ScrollIndicator />
      </div>
    );
  }

  // Main Render — Full-viewport carousel (Corsair-style)
  return (
    <div
      className="relative z-0 w-full h-[85vh] sm:h-screen overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image slides */}
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
                backgroundPosition: reduceMotion ? 'top center' : 'center',
              }}
            />

            {/* Dark semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        );
      })}

      {/* Centered content overlay */}
      <div className="absolute inset-0 z-[15] flex flex-col justify-center items-center text-white px-5 sm:px-6 text-center pointer-events-none">
        {/* Status badge */}
        <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 sm:py-2 mb-4 sm:mb-8 border border-white/20 rounded-full bg-white/10 backdrop-blur-sm pointer-events-auto">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary-400 mr-2 sm:mr-2.5 animate-pulse"></span>
          <span className="text-white/80 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
            {heroStatusText}
          </span>
        </div>

        {/* Per-slide title + description */}
        <div key={currentSlide} className="max-w-4xl">
          <h2
            className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-5 md:mb-6 leading-tight tracking-tight text-white${reduceMotion ? '' : ' animate-bannerTextIn'}`}
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)', ...(!reduceMotion ? { animationDelay: '0.15s' } : {}) }}
          >
            {getLocalizedContent(banners[currentSlide]).title}
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light leading-relaxed${reduceMotion ? '' : ' animate-bannerTextIn'}`}
            style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.5)', ...(!reduceMotion ? { animationDelay: '0.4s' } : {}) }}
          >
            {getLocalizedContent(banners[currentSlide]).desc}
          </p>
        </div>

        {/* CTA buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-5 sm:mt-10 w-full sm:w-auto pointer-events-auto${reduceMotion ? '' : ' animate-bannerTextIn'}`}
          style={!reduceMotion ? { animationDelay: '0.6s' } : undefined}
        >
          <button
            onClick={() => scrollToSection('portfolio')}
            className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 sm:px-9 sm:py-4 bg-primary-600 text-white rounded-[10px] text-sm sm:text-base font-bold backdrop-blur-sm hover:bg-primary-500 hover:shadow-glow transition-all duration-300 active:scale-[0.97]"
          >
            {heroPrimaryButton}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => scrollToSection('services')}
            className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 sm:px-9 sm:py-4 border-2 border-white text-white rounded-[10px] text-sm sm:text-base font-semibold backdrop-blur-sm hover:bg-white hover:text-gray-900 transition-all duration-300 active:scale-[0.97]"
          >
            {heroSecondaryButton}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation arrows — subtle dark style */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute top-1/2 left-4 md:left-6 -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 border border-white/10 rounded-full w-10 h-10 md:w-11 md:h-11 items-center justify-center text-white/70 hover:text-white transition-all duration-300 active:scale-95"
            aria-label="Previous Slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute top-1/2 right-4 md:right-6 -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 border border-white/10 rounded-full w-10 h-10 md:w-11 md:h-11 items-center justify-center text-white/70 hover:text-white transition-all duration-300 active:scale-95"
            aria-label="Next Slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide indicators + play/pause — above scroll indicator */}
      <div className="absolute bottom-[68px] sm:bottom-16 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 z-20">
        <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-5 sm:w-6'
                  : 'bg-white/40 w-1.5 sm:w-2 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          <div className="w-px h-3 bg-white/20 mx-0.5"></div>
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Scroll-down indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-7 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/50 hover:text-white/80 transition-colors duration-300"
        aria-label="Scroll down"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </button>
    </div>
  );
};

export default HighlightsBanner;
