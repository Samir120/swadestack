import React, { useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  /** Minimum height for the placeholder (prevents layout shift) */
  minHeight?: string;
  /** How far before the viewport to start loading */
  rootMargin?: string;
  /** Optional className for the wrapper */
  className?: string;
}

/**
 * Lazy-loads children when the section scrolls near the viewport.
 * Renders a placeholder div until visible, then renders children permanently.
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  minHeight = '200px',
  rootMargin = '300px',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : <div style={{ minHeight }} />}
    </div>
  );
};

export default LazySection;
