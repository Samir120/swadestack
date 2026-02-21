import { useRef, useState, useEffect, useCallback } from 'react';
import { ComponentType } from '../../models/types/pcComponent.types';

interface CategoryNavProps {
  activeType: ComponentType | null;
  language: 'en' | 'sv';
  onSelect: (type: ComponentType | null) => void;
  counts?: Record<string, number>;
}

const categories: {
  type: ComponentType | null;
  label_en: string;
  label_sv: string;
}[] = [
  { type: null, label_en: 'All', label_sv: 'Alla' },
  { type: 'cpu', label_en: 'CPU', label_sv: 'Processor' },
  { type: 'gpu', label_en: 'Graphics', label_sv: 'Grafikkort' },
  { type: 'motherboard', label_en: 'Motherboard', label_sv: 'Moderkort' },
  { type: 'ram', label_en: 'RAM', label_sv: 'RAM' },
  { type: 'ssd', label_en: 'SSD', label_sv: 'SSD' },
  { type: 'hdd', label_en: 'HDD', label_sv: 'HDD' },
  { type: 'psu', label_en: 'PSU', label_sv: 'Nätaggregat' },
  { type: 'case', label_en: 'Case', label_sv: 'Chassi' },
  { type: 'cooling', label_en: 'Cooling', label_sv: 'Kylning' },
  { type: 'fan', label_en: 'Fans', label_sv: 'Fläktar' },
  { type: 'optical', label_en: 'Optical', label_sv: 'Optisk' },
  { type: 'os', label_en: 'OS', label_sv: 'OS' },
];

const CategoryNav = ({ activeType, language, onSelect, counts }: CategoryNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 2;
    setCanScrollLeft(el.scrollLeft > threshold);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - threshold);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
  }, []);

  const handleSelect = useCallback(
    (type: ComponentType | null) => {
      onSelect(type);
      const key = type ?? 'all';
      const btn = buttonRefs.current[key];
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    },
    [onSelect]
  );

  return (
    <div className="relative flex items-center">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => scroll('left')}
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all mr-2 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll left"
        tabIndex={-1}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable container wrapper */}
      <div className="relative flex-1 min-w-0">
        {/* Left fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-gray-50 dark:from-surface-950 to-transparent transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map((cat) => {
            const isActive = activeType === cat.type;
            const label = language === 'sv' ? cat.label_sv : cat.label_en;
            const count = cat.type && counts ? counts[cat.type] : undefined;
            const key = cat.type ?? 'all';

            return (
              <button
                key={key}
                ref={(el) => { buttonRefs.current[key] = el; }}
                onClick={() => handleSelect(cat.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/25'
                    : 'bg-white dark:bg-surface-800 text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-surface-600 hover:border-primary-500/50'
                }`}
              >
                {label}
                {counts && count !== undefined && (
                  <span className="text-[10px] opacity-70 ml-1">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-gray-50 dark:from-surface-950 to-transparent transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => scroll('right')}
        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all ml-2 ${
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll right"
        tabIndex={-1}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default CategoryNav;
