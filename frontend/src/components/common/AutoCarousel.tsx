import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Checks only the OS-level prefers-reduced-motion setting.
 * Unlike useReducedMotion (which also triggers on mobile viewport < 768px),
 * this lets the carousel auto-rotate and animate on mobile devices while
 * still respecting users who explicitly enable reduced motion in their OS.
 */
const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
};

// iOS-native deceleration curve — fast response on finger release, long smooth ease-out
const SNAP_TRANSITION = 'transform 0.75s cubic-bezier(0.23, 1, 0.32, 1)';
const AUTO_TRANSITION = 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)';

interface AutoCarouselProps {
  items: React.ReactNode[];
  itemKeys: string[];
  interval?: number;       // Auto-rotate interval in ms (default 4500, 0 = off)
  gap?: number;            // Gap between cards in px (default 24)
  className?: string;      // Outer wrapper class
  ariaLabel?: string;      // Accessibility label
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({
  items,
  itemKeys,
  interval = 4500,
  gap = 24,
  className = '',
  ariaLabel = 'Carousel',
}) => {
  const reduceMotion = usePrefersReducedMotion();

  // Responsive breakpoints: 1 (<640), 2 (640-1023), 3 (1024+)
  const [perPage, setPerPage] = useState(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  });

  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      setPerPage(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const count = items.length;
  const needsCarousel = count > perPage;

  // Current "real" index (0-based, refers to the first visible real item)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const autoResumeTimer = useRef<ReturnType<typeof setTimeout>>();

  // Touch/swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const dragOffsetRef = useRef(0);
  const isDragging = useRef(false);
  const swipeDirection = useRef<'horizontal' | 'vertical' | null>(null);

  // Tracks whether the current animation originated from a touch swipe (uses faster SNAP_TRANSITION)
  const isSwipeSnap = useRef(false);

  // Mirror refs so native touchmove listener can access current values without stale closures
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const cardWidthRef = useRef(0);

  // Reset index when items or perPage change
  useEffect(() => { setCurrentIndex(0); }, [perPage, count]);

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Calculate card width from container width
  const cardWidth = containerWidth > 0 ? (containerWidth - gap * (perPage - 1)) / perPage : 0;
  cardWidthRef.current = cardWidth;

  // Build the offset for the track.
  // Extended track: [clone last N] [real items] [clone first N] where N = perPage
  // The "real" items start at index `perPage` in the extended array.
  // Position = -(perPage + currentIndex) * (cardWidth + gap)
  const getOffset = useCallback((idx: number) => {
    return -((perPage + idx) * (cardWidth + gap));
  }, [perPage, cardWidth, gap]);

  // Navigation
  const goTo = useCallback((newIndex: number) => {
    if (isTransitioning || !needsCarousel) return;
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
  }, [isTransitioning, needsCarousel]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  // Handle transition end — jump if in clone zone
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    isSwipeSnap.current = false;
    if (currentIndex >= count) {
      setCurrentIndex(currentIndex - count);
    } else if (currentIndex < 0) {
      setCurrentIndex(currentIndex + count);
    }
  }, [currentIndex, count]);

  // When snapping (no transition), the offset changes instantly
  const shouldAnimate = isTransitioning && !reduceMotion;
  const trackOffset = needsCarousel && cardWidth > 0 ? getOffset(currentIndex) : 0;

  // Auto-rotation
  useEffect(() => {
    if (!needsCarousel || interval === 0 || isPaused || reduceMotion) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [needsCarousel, interval, isPaused, goNext, reduceMotion]);

  // Pause/resume handlers
  const pauseAuto = useCallback(() => {
    setIsPaused(true);
    if (autoResumeTimer.current) clearTimeout(autoResumeTimer.current);
  }, []);

  const resumeAuto = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resumeAutoDelayed = useCallback(() => {
    if (autoResumeTimer.current) clearTimeout(autoResumeTimer.current);
    autoResumeTimer.current = setTimeout(() => setIsPaused(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (autoResumeTimer.current) clearTimeout(autoResumeTimer.current);
    };
  }, []);

  // --- Touch handlers ---

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    dragOffsetRef.current = 0;
    isDragging.current = true;
    swipeDirection.current = null;

    // Cancel any running CSS transition so drag starts from current position
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
    setIsTransitioning(false);

    pauseAuto();
  }, [pauseAuto]);

  // Non-passive touchmove — enables preventDefault for horizontal swipes so
  // vertical page scroll doesn't fight with the carousel drag.
  // Uses refs for values that change between renders to avoid re-registering.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !needsCarousel) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;

      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Decide direction on first significant movement (8px dead-zone)
      if (swipeDirection.current === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          swipeDirection.current = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
          if (swipeDirection.current === 'vertical') {
            isDragging.current = false;
            return;
          }
        } else {
          return; // Still in dead-zone
        }
      }

      if (swipeDirection.current !== 'horizontal') return;

      // Prevent vertical scroll during horizontal drag
      e.preventDefault();
      dragOffsetRef.current = dx;

      // Move track directly (no React state update) for zero-jank finger-follow
      const track = trackRef.current;
      if (track) {
        const cw = cardWidthRef.current;
        if (cw > 0) {
          const baseOffset = -((perPage + currentIndexRef.current) * (cw + gap));
          track.style.transform = `translateX(${baseOffset + dx}px)`;
        }
      }
    };

    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => container.removeEventListener('touchmove', handleTouchMove);
  }, [needsCarousel, perPage, gap]);

  const handleTouchEnd = useCallback(() => {
    const wasDragging = isDragging.current;
    const wasHorizontal = swipeDirection.current === 'horizontal';
    isDragging.current = false;
    swipeDirection.current = null;

    // Not a horizontal swipe — just resume auto-rotation
    if (!wasDragging || !wasHorizontal) {
      resumeAutoDelayed();
      return;
    }

    const dx = dragOffsetRef.current;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = elapsed > 0 ? dx / elapsed : 0; // px/ms, negative = swiped left
    const slideWidth = cardWidth + gap;
    const threshold = slideWidth * 0.3;

    // Momentum decision: fast swipe OR dragged past 30% of card width
    const shouldGoNext = velocity < -0.25 || (dx < 0 && Math.abs(dx) > threshold);
    const shouldGoPrev = velocity > 0.25 || (dx > 0 && Math.abs(dx) > threshold);

    if (shouldGoNext) {
      isSwipeSnap.current = true;
      goTo(currentIndex + 1);
    } else if (shouldGoPrev) {
      isSwipeSnap.current = true;
      goTo(currentIndex - 1);
    } else {
      // Snap back to current slide (no state change, animate via direct DOM)
      if (trackRef.current) {
        const baseOffset = getOffset(currentIndex);
        trackRef.current.style.transition = SNAP_TRANSITION;
        trackRef.current.style.transform = `translateX(${baseOffset}px)`;
      }
    }

    dragOffsetRef.current = 0;
    resumeAutoDelayed();
  }, [currentIndex, cardWidth, gap, goTo, getOffset, resumeAutoDelayed]);

  // Dot click
  const goToDot = useCallback((dotIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(dotIndex);
  }, [isTransitioning]);

  // Normalize index for dot highlighting
  const normalizedIndex = ((currentIndex % count) + count) % count;

  // --- Static fallback: no carousel needed ---
  if (!needsCarousel) {
    const gridCols =
      count === 1 ? 'grid-cols-1 max-w-md mx-auto' :
      count === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' :
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return (
      <div className={`pt-4 ${className}`} aria-label={ariaLabel} role="region">
        <div className={`grid ${gridCols} items-stretch`} style={{ gap }}>
          {items.map((item, i) => (
            <div key={itemKeys[i]} className="flex">{item}</div>
          ))}
        </div>
      </div>
    );
  }

  // --- Build extended items: [clone last N] [real] [clone first N] ---
  const cloneBefore = items.slice(-perPage);
  const cloneBeforeKeys = itemKeys.slice(-perPage).map(k => `clone-end-${k}`);
  const cloneAfter = items.slice(0, perPage);
  const cloneAfterKeys = itemKeys.slice(0, perPage).map(k => `clone-start-${k}`);

  const extendedItems = [...cloneBefore, ...items, ...cloneAfter];
  const extendedKeys = [...cloneBeforeKeys, ...itemKeys, ...cloneAfterKeys];

  return (
    <div
      className={`relative ${className}`}
      aria-label={ariaLabel}
      role="region"
      onMouseEnter={pauseAuto}
      onMouseLeave={resumeAuto}
      onFocusCapture={pauseAuto}
      onBlurCapture={resumeAuto}
    >
      {/* Track container */}
      <div
        ref={containerRef}
        className="overflow-x-clip overflow-y-visible pt-5 px-1"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex items-stretch"
          style={{
            gap,
            willChange: 'transform',
            transform: cardWidth > 0 ? `translateX(${trackOffset}px)` : undefined,
            transition: shouldAnimate ? (isSwipeSnap.current ? SNAP_TRANSITION : AUTO_TRANSITION) : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedItems.map((item, i) => (
            <div
              key={extendedKeys[i]}
              className="flex-shrink-0 flex overflow-visible"
              style={{ width: cardWidth > 0 ? cardWidth : undefined }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow — hidden on mobile/tablet, visible from lg+ */}
      <button
        onClick={goPrev}
        className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center hover:shadow-lg transition-all z-10 active:scale-95"
        aria-label="Previous"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-slate-600 dark:text-slate-300">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      {/* Right Arrow — hidden on mobile/tablet, visible from lg+ */}
      <button
        onClick={goNext}
        className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center hover:shadow-lg transition-all z-10 active:scale-95"
        aria-label="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-slate-600 dark:text-slate-300">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, i) => (
          <button
            key={itemKeys[i]}
            onClick={() => goToDot(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all ${
              i === normalizedIndex
                ? 'w-2.5 h-2.5 bg-primary-500'
                : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoCarousel;
