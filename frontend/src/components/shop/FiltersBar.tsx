import React, { useState } from 'react';

interface FiltersBarProps {
  language: 'en' | 'sv';
  manufacturers: string[];
  selectedManufacturer: string | undefined;
  onManufacturerChange: (manufacturer: string | undefined) => void;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  language,
  manufacturers,
  selectedManufacturer,
  onManufacturerChange,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onInStockChange,
  sortBy,
  onSortChange,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    selectedManufacturer !== undefined,
    minPrice !== undefined,
    maxPrice !== undefined,
    inStockOnly,
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const selectClasses =
    'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-900 dark:text-white text-sm';

  const inputClasses =
    'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-900 dark:text-white text-sm';

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>{language === 'en' ? 'Filters' : 'Filter'}</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-600 text-white text-xs font-medium">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 p-4 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manufacturer dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {language === 'en' ? 'Manufacturer' : 'Tillverkare'}
              </label>
              <select
                className={selectClasses}
                value={selectedManufacturer ?? ''}
                onChange={(e) =>
                  onManufacturerChange(e.target.value || undefined)
                }
              >
                <option value="">
                  {language === 'en'
                    ? 'All Manufacturers'
                    : 'Alla tillverkare'}
                </option>
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {language === 'en' ? 'Price Range' : 'Prisintervall'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className={inputClasses}
                  placeholder="Min"
                  value={minPrice ?? ''}
                  onChange={(e) =>
                    onPriceChange(
                      e.target.value ? Number(e.target.value) : undefined,
                      maxPrice
                    )
                  }
                />
                <input
                  type="number"
                  className={inputClasses}
                  placeholder="Max"
                  value={maxPrice ?? ''}
                  onChange={(e) =>
                    onPriceChange(
                      minPrice,
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* In-stock toggle */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {language === 'en' ? 'Availability' : 'Tillg\u00e4nglighet'}
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-1.5">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={inStockOnly}
                    onChange={(e) => onInStockChange(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-surface-600 rounded-full peer-checked:bg-accent-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {language === 'en' ? 'In Stock Only' : 'Visa bara i lager'}
                </span>
              </label>
            </div>

            {/* Sort dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {language === 'en' ? 'Sort By' : 'Sortera efter'}
              </label>
              <select
                className={selectClasses}
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                <option value="price_asc">
                  {language === 'en'
                    ? 'Price: Low to High'
                    : 'Pris: L\u00e5gt till h\u00f6gt'}
                </option>
                <option value="price_desc">
                  {language === 'en'
                    ? 'Price: High to Low'
                    : 'Pris: H\u00f6gt till l\u00e5gt'}
                </option>
                <option value="name_asc">
                  {language === 'en' ? 'Name: A-Z' : 'Namn: A-\u00d6'}
                </option>
                <option value="newest">
                  {language === 'en' ? 'Newest' : 'Nyast'}
                </option>
              </select>
            </div>
          </div>

          {/* Clear all button */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            >
              {language === 'en' ? 'Clear All' : 'Rensa alla'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersBar;
