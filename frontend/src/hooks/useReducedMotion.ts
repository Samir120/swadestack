import { useState, useEffect } from 'react';

/**
 * Returns true when animations should be reduced:
 * - On mobile devices (viewport < 768px)
 * - When user has prefers-reduced-motion enabled
 */
const useReducedMotion = (): boolean => {
  const [shouldReduce, setShouldReduce] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.innerWidth < 768;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || prefersReduced;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const check = () => {
      const isMobile = window.innerWidth < 768;
      setShouldReduce(isMobile || mediaQuery.matches);
    };

    window.addEventListener('resize', check);
    mediaQuery.addEventListener('change', check);

    return () => {
      window.removeEventListener('resize', check);
      mediaQuery.removeEventListener('change', check);
    };
  }, []);

  return shouldReduce;
};

export default useReducedMotion;
