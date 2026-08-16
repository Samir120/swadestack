import React from 'react';

/**
 * Loading placeholders sized to the content they stand in for.
 *
 * The pages these replace rendered a centred spinner while data loaded. A spinner
 * occupies far less height than the grid or detail layout that follows, so the
 * footer sat inside the viewport during loading and was shoved below the fold when
 * the real content arrived — measured at 0.277 CLS on the component detail page and
 * 0.147 on the components shop. Reserving the loaded layout's height keeps the
 * footer off screen throughout, so nothing visible moves.
 */

export const Bar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded bg-gray-200/70 dark:bg-surface-700/50 ${className}`} />
);

export const Block: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl bg-gray-200/60 dark:bg-surface-800/70 ${className}`} />
);

/** Stands in for one product card (~574px tall at desktop grid widths). */
export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700/50 overflow-hidden">
    <div className="w-full aspect-square bg-gray-100 dark:bg-surface-800" />
    <div className="p-4 sm:p-5 space-y-3">
      <Bar className="h-3 w-20" />
      <Bar className="h-5 w-full" />
      <Bar className="h-5 w-3/4" />
      <Bar className="h-4 w-1/2" />
      <Bar className="h-7 w-28" />
      <Block className="h-11 w-full" />
    </div>
  </div>
);

/**
 * Grid of card placeholders. `className` should carry the same grid-column classes
 * as the real grid so the placeholder wraps identically at every breakpoint.
 */
export const CardGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
}) => (
  <div className={`${className} animate-pulse`} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export default CardGridSkeleton;
