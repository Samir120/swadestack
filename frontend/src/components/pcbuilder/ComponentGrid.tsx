import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search } from 'lucide-react';
import { PCComponent, ComponentType } from '../../models/types/pcComponent.types';
import { ValidationResult, ValidationError } from '../../models/types/validation.types';
import ComponentCard from './ComponentCard';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Component Grid
 * Displays a grid of PC components with filtering and sorting
 * Supports multi-select mode for slot-based components (RAM, GPU, SSD, HDD, Fan)
 */

// Compatibility status for a component
interface ComponentCompatibilityStatus {
  isCompatible: boolean;
  errors: any[];
  warnings: any[];
}

interface ComponentGridProps {
  components: PCComponent[];
  selectedComponent?: PCComponent;
  componentType?: ComponentType;
  onSelect: (component: PCComponent, quantity?: number) => void;
  onRemove: () => void;
  isLoading: boolean;
  language: string;
  validationResult?: ValidationResult | null;
  isMultiSelect?: boolean;
  availableSlots?: number;
  componentCompatibility?: Record<string, ComponentCompatibilityStatus>;
  isValidatingComponents?: boolean;
}

type SortOption = 'price-asc' | 'price-desc' | 'name' | 'manufacturer';

const ComponentGrid: React.FC<ComponentGridProps> = ({
  components,
  selectedComponent,
  componentType: _componentType,
  onSelect,
  onRemove,
  isLoading,
  language,
  validationResult,
  isMultiSelect = false,
  availableSlots,
  componentCompatibility = {},
  isValidatingComponents = false,
}) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Get unique manufacturers
  const manufacturers = useMemo(() => {
    const uniqueManufacturers = [...new Set(components.map((c) => c.manufacturer))];
    return uniqueManufacturers.sort();
  }, [components]);

  // Get compatibility warning for a component
  const getCompatibilityWarning = (component: PCComponent): ValidationError | undefined => {
    if (!validationResult) return undefined;

    // Check warnings for this component type
    const warnings = [...(validationResult.warnings || [])];
    return warnings.find((w) => w.affectedComponents?.includes(component.id));
  };

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    let result = [...components];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name_en.toLowerCase().includes(query) ||
          c.name_sv.toLowerCase().includes(query) ||
          c.manufacturer.toLowerCase().includes(query) ||
          c.modelNumber?.toLowerCase().includes(query)
      );
    }

    // Filter by manufacturer
    if (selectedManufacturer) {
      result = result.filter((c) => c.manufacturer === selectedManufacturer);
    }

    // Filter by stock
    if (showInStockOnly) {
      result = result.filter((c) => c.stock > 0);
    }

    // Filter by price range
    if (minPrice) {
      result = result.filter((c) => c.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((c) => c.price <= Number(maxPrice));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) =>
          (language === 'en' ? a.name_en : a.name_sv).localeCompare(
            language === 'en' ? b.name_en : b.name_sv
          )
        );
        break;
      case 'manufacturer':
        result.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
        break;
    }

    return result;
  }, [
    components,
    searchQuery,
    selectedManufacturer,
    sortBy,
    showInStockOnly,
    minPrice,
    maxPrice,
    language,
  ]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedManufacturer('');
    setSortBy('price-asc');
    setShowInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-surface-850 rounded-xl shadow-light-md dark:shadow-dark-md p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner className="mb-3 mb-4" />
          <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base">
            {language === 'en' ? 'Loading components...' : 'Laddar komponenter...'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (components.length === 0) {
    return (
      <div className="bg-white dark:bg-surface-850 rounded-xl shadow-light-md dark:shadow-dark-md p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-3 sm:mb-4"><Package className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 dark:text-neutral-600" strokeWidth={1.5} /></div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
          {language === 'en' ? 'No components available' : 'Inga komponenter tillgängliga'}
        </h3>
        <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base">
          {language === 'en'
            ? 'There are no components of this type in stock.'
            : 'Det finns inga komponenter av denna typ i lager.'}
        </p>
      </div>
    );
  }

  // Check if slots are full (for multi-select)
  const noSlotsAvailable = isMultiSelect && availableSlots !== undefined && availableSlots <= 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Multi-select info banner */}
      {isMultiSelect && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`rounded-lg p-3 sm:p-4 border-l-4 ${noSlotsAvailable ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 border-l-yellow-400' : 'bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-500/20 border-l-primary-500'}`}
        >
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${noSlotsAvailable ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-primary-100 dark:bg-primary-900/20'}`}>
              {noSlotsAvailable ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-sm sm:text-base font-semibold ${noSlotsAvailable ? 'text-yellow-700 dark:text-yellow-400' : 'text-primary-700 dark:text-primary-400'}`}>
                {noSlotsAvailable
                  ? (language === 'en' ? 'All slots are full' : 'Alla platser är fulla')
                  : (language === 'en' ? 'Multiple selection available' : 'Flera val möjliga')}
              </p>
              <p className={`text-xs sm:text-sm mt-0.5 ${noSlotsAvailable ? 'text-yellow-600/80 dark:text-yellow-400/70' : 'text-primary-600/70 dark:text-primary-400/70'}`}>
                {noSlotsAvailable
                  ? (language === 'en'
                      ? 'Remove an existing component to add a new one'
                      : 'Ta bort en befintlig komponent för att lägga till en ny')
                  : (language === 'en'
                      ? `You can add ${availableSlots} more component(s) based on available slots`
                      : `Du kan lägga till ${availableSlots} fler komponent(er) baserat på tillgängliga platser`)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters Section */}
      <div className="bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Search - Full width on mobile */}
          <div className="w-full">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search components...' : 'Sök komponenter...'}
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 border border-gray-200 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm bg-gray-50 dark:bg-surface-800 focus:bg-white dark:focus:bg-surface-700 text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Filters row - Stack on mobile, row on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
            {/* Manufacturer Filter */}
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="col-span-1 px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-xs sm:text-sm bg-gray-100 dark:bg-surface-800 focus:bg-gray-200 dark:focus:bg-surface-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">
                {language === 'en' ? 'All Brands' : 'Alla märken'}
              </option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="col-span-1 px-3 py-2.5 sm:py-2 border border-gray-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-xs sm:text-sm bg-gray-100 dark:bg-surface-800 focus:bg-gray-200 dark:focus:bg-surface-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value="price-asc">
                {language === 'en' ? 'Price ↑' : 'Pris ↑'}
              </option>
              <option value="price-desc">
                {language === 'en' ? 'Price ↓' : 'Pris ↓'}
              </option>
              <option value="name">{language === 'en' ? 'Name' : 'Namn'}</option>
              <option value="manufacturer">
                {language === 'en' ? 'Brand' : 'Märke'}
              </option>
            </select>

            {/* In Stock Toggle - Mobile-friendly button style */}
            <label className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 cursor-pointer px-3 py-2.5 sm:py-2 rounded-lg border transition-all text-xs sm:text-sm ${
              showInStockOnly
                ? 'bg-primary-600/10 border-primary-500/30 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-surface-800 border-gray-300 dark:border-surface-600 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-surface-500'
            }`}>
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
                className="sr-only"
              />
              <svg className={`w-4 h-4 ${showInStockOnly ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">
                {language === 'en' ? 'In Stock' : 'I lager'}
              </span>
            </label>
          </div>

          {/* Price Range - Collapsible style on mobile */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-surface-700">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 font-medium">
              {language === 'en' ? 'Price:' : 'Pris:'}
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-16 sm:w-20 px-2 py-1.5 border border-gray-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-xs sm:text-sm bg-gray-100 dark:bg-surface-800 focus:bg-gray-200 dark:focus:bg-surface-700 text-gray-900 dark:text-white"
              />
              <span className="text-neutral-500">–</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-16 sm:w-20 px-2 py-1.5 border border-gray-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-xs sm:text-sm bg-gray-100 dark:bg-surface-800 focus:bg-gray-200 dark:focus:bg-surface-700 text-gray-900 dark:text-white"
              />
              <span className="text-xs text-gray-500 dark:text-neutral-400">SEK</span>
            </div>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs sm:text-sm text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {language === 'en' ? 'Clear' : 'Rensa'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-surface-700 text-xs text-gray-400 dark:text-neutral-500">
          {language === 'en'
            ? `Showing ${filteredComponents.length} of ${components.length} components`
            : `Visar ${filteredComponents.length} av ${components.length} komponenter`}
        </div>
      </div>

      {/* No Results After Filter */}
      {filteredComponents.length === 0 && components.length > 0 && (
        <div className="bg-white dark:bg-surface-850 rounded-xl shadow-light-md dark:shadow-dark-md p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-3 sm:mb-4"><Search className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 dark:text-neutral-600" strokeWidth={1.5} /></div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
            {language === 'en' ? 'No matches found' : 'Inga matchningar hittades'}
          </h3>
          <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base mb-4">
            {language === 'en'
              ? 'Try adjusting your filters or search query.'
              : 'Försök justera dina filter eller sökfråga.'}
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-300 bg-primary-600/10 hover:bg-primary-600/20 rounded-lg transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {language === 'en' ? 'Clear all filters' : 'Rensa alla filter'}
          </button>
        </div>
      )}

      {/* Component Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredComponents.map((component, index) => {
            // Get pre-validation compatibility status for this component
            const compatibilityStatus = componentCompatibility[component.id];
            const isIncompatible = compatibilityStatus && !compatibilityStatus.isCompatible;
            const incompatibilityError = isIncompatible && compatibilityStatus.errors.length > 0
              ? compatibilityStatus.errors[0]
              : undefined;

            return (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
              >
                <ComponentCard
                  component={component}
                  isSelected={!isMultiSelect && selectedComponent?.id === component.id}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  language={language}
                  compatibilityWarning={getCompatibilityWarning(component)}
                  incompatibilityError={incompatibilityError}
                  showQuantity={false}
                  isMultiSelect={isMultiSelect}
                  disabled={noSlotsAvailable || isIncompatible}
                  isValidating={isValidatingComponents && !compatibilityStatus}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ComponentGrid;
