import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import ComponentCard from '../components/shop/ComponentCard';
import CategoryNav from '../components/shop/CategoryNav';
import FiltersBar from '../components/shop/FiltersBar';
import { useComponentsShopViewModel } from '../viewmodels/componentsShopViewModel';
import { useCartViewModel } from '../viewmodels/cartViewModel';
import { pcComponentApi } from '../models/api/pcComponentApi';
import { ComponentType, PCComponent } from '../models/types/pcComponent.types';
import { motion } from 'framer-motion';
import AmbientBackground from '../components/common/AmbientBackground';
import { CardGridSkeleton } from '../components/common/Skeleton';

const ComponentsShop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, actions, computed } = useComponentsShopViewModel();
  const cartVM = useCartViewModel();

  const language = state.language as 'en' | 'sv';

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Read type from URL params
  const urlType = searchParams.get('type') as ComponentType | null;

  // Fetch category counts on mount
  useEffect(() => {
    pcComponentApi.getComponentTypeCounts().then((res) => {
      if (res.data?.counts) {
        setCategoryCounts(res.data.counts);
      }
    }).catch(() => {});
  }, []);

  // Load manufacturers when category changes
  useEffect(() => {
    actions.loadManufacturers(urlType ?? undefined);
  }, [urlType, actions]);

  // True only for the render that happens before the mount effect below dispatches
  // the first request. Without it the "no components found" state paints for one
  // frame on every visit, which briefly pulls the footer up into the viewport.
  const beforeFirstRequest = useRef(true);
  useEffect(() => {
    beforeFirstRequest.current = false;
  }, []);

  // Load data on mount and when filters/page/type change
  useEffect(() => {
    if (urlType) {
      actions.updateFilters({ componentType: urlType });
      actions.loadCategory(urlType);
    } else {
      actions.updateFilters({ componentType: undefined });
      actions.loadAll(state.page, state.limit);
    }
  }, [urlType, state.page, state.filters.manufacturer, state.filters.minPrice, state.filters.maxPrice, state.filters.inStock]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      actions.search(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, actions]);

  // When search is cleared, reload
  useEffect(() => {
    if (searchQuery === '') {
      if (urlType) {
        actions.loadCategory(urlType);
      } else {
        actions.loadAll(state.page, state.limit);
      }
    }
  }, [searchQuery]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (type: ComponentType | null) => {
      setSearchQuery('');
      if (type) {
        setSearchParams({ type });
      } else {
        setSearchParams({});
      }
      actions.changePage(1);
    },
    [setSearchParams, actions]
  );

  // Handle filter changes
  const handleManufacturerChange = useCallback(
    (manufacturer: string | undefined) => {
      actions.updateFilters({ manufacturer });
      actions.changePage(1);
    },
    [actions]
  );

  const handlePriceChange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      actions.updateFilters({ minPrice: min, maxPrice: max });
      actions.changePage(1);
    },
    [actions]
  );

  const handleInStockChange = useCallback(
    (inStock: boolean) => {
      actions.updateFilters({ inStock: inStock || undefined });
      actions.changePage(1);
    },
    [actions]
  );

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
  }, []);

  const handleClearFilters = useCallback(() => {
    actions.resetFilters();
    setSortBy('newest');
    setSearchQuery('');
    actions.changePage(1);
  }, [actions]);

  // Handle add to cart
  const handleAddToCart = useCallback(
    (component: PCComponent) => {
      cartVM.addComponentToCart(
        {
          id: component.id,
          componentType: component.componentType,
          name_en: component.name_en,
          name_sv: component.name_sv,
          manufacturer: component.manufacturer,
          modelNumber: component.modelNumber,
          price: component.price,
          currency: component.currency,
          imageUrl: component.imageUrl,
          stock: component.stock,
        },
        1
      );
    },
    [cartVM]
  );

  // Client-side sorting
  const sortedComponents = useMemo(() => {
    const components = [...state.allComponents];
    switch (sortBy) {
      case 'price_asc':
        return components.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return components.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return components.sort((a, b) => {
          const nameA = language === 'en' ? a.name_en : a.name_sv;
          const nameB = language === 'en' ? b.name_en : b.name_sv;
          return nameA.localeCompare(nameB);
        });
      case 'newest':
      default:
        return components;
    }
  }, [state.allComponents, sortBy, language]);

  // Pagination
  const totalPages = Math.ceil(state.total / state.limit);

  const handlePageChange = useCallback(
    (page: number) => {
      actions.changePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [actions]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
      {/* Ambient Dark Mode Background */}
      <AmbientBackground />

      <Header mode="page" />

      <main className="max-w-7xl mx-auto px-4 py-12 pt-28 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-400 dark:text-neutral-500 mb-6">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {language === 'en' ? 'Home' : 'Hem'}
            </Link>
            <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 dark:text-neutral-300 font-medium">
              {language === 'en' ? 'Components' : 'Komponenter'}
            </span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-thin mb-3 leading-tight">
            <span className="bg-gradient-to-r from-primary-500 to-blue-500 bg-clip-text text-transparent">
              {language === 'en' ? 'PC Components' : 'Datorkomponenter'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base lg:text-lg max-w-2xl mb-10">
            {language === 'en'
              ? 'Browse our selection of PC components'
              : 'Utforska v\u00e5rt sortiment av datorkomponenter'}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="w-full max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search components...' : 'S\u00f6k komponenter...'}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Nav */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <CategoryNav
            activeType={urlType}
            language={language}
            onSelect={handleCategorySelect}
            counts={categoryCounts}
          />
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <FiltersBar
              language={language}
              manufacturers={state.manufacturers}
              selectedManufacturer={state.filters.manufacturer}
              onManufacturerChange={handleManufacturerChange}
              minPrice={state.filters.minPrice}
              maxPrice={state.filters.maxPrice}
              onPriceChange={handlePriceChange}
              inStockOnly={state.filters.inStock ?? false}
              onInStockChange={handleInStockChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              onClearAll={handleClearFilters}
            />
            <p className="text-sm text-gray-400 dark:text-neutral-500">
              {language === 'en'
                ? `Showing ${sortedComponents.length} of ${state.total} results`
                : `Visar ${sortedComponents.length} av ${state.total} resultat`}
            </p>
          </div>
        </motion.div>

        {/* Product Grid */}
        {state.isLoading || beforeFirstRequest.current ? (
          <div aria-busy="true">
            <span className="sr-only">
              {language === 'en' ? 'Loading components...' : 'Laddar komponenter...'}
            </span>
            <CardGridSkeleton count={8} />
          </div>
        ) : state.error ? (
          <motion.div
            className="text-center py-20 bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-gray-500 dark:text-neutral-400 mb-4">{state.error}</p>
            <button
              onClick={() => urlType ? actions.loadCategory(urlType) : actions.loadAll(state.page, state.limit)}
              className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-500 active:scale-[0.98] transition-all"
            >
              {language === 'en' ? 'Try Again' : 'F\u00f6rs\u00f6k igen'}
            </button>
          </motion.div>
        ) : sortedComponents.length === 0 ? (
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
              {language === 'en' ? 'No components found' : 'Inga komponenter hittades'}
            </p>
            <p className="text-sm text-gray-400 dark:text-neutral-500 mb-4">
              {language === 'en'
                ? 'Try adjusting your filters or search'
                : 'F\u00f6rs\u00f6k justera filter eller s\u00f6k'}
            </p>
            <button
              onClick={handleClearFilters}
              className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              {language === 'en' ? 'Clear filters' : 'Rensa filter'}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedComponents.map((comp, index) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05 }}
                >
                  <ComponentCard
                    component={comp}
                    language={language}
                    formatPrice={computed.formatPrice}
                    getCategoryLabel={computed.getCategoryLabel}
                    getSpecSummary={computed.getSpecSummary}
                    onAddToCart={handleAddToCart}
                    isInCart={cartVM.isComponentInCart(comp.id)}
                  />
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
                  onClick={() => handlePageChange(state.page - 1)}
                  disabled={state.page === 1}
                  className={`p-2.5 rounded-full border-2 transition-all ${
                    state.page === 1
                      ? 'border-gray-200 dark:border-surface-700 text-gray-300 dark:text-neutral-600 cursor-not-allowed'
                      : 'border-gray-300 dark:border-surface-600 text-gray-500 dark:text-neutral-400 hover:bg-primary-600 hover:text-white hover:border-primary-600 active:scale-95'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-sm text-gray-500 dark:text-neutral-400 px-4">
                  {language === 'en'
                    ? `Page ${state.page} of ${totalPages}`
                    : `Sida ${state.page} av ${totalPages}`}
                </span>

                <button
                  onClick={() => handlePageChange(state.page + 1)}
                  disabled={state.page === totalPages}
                  className={`p-2.5 rounded-full border-2 transition-all ${
                    state.page === totalPages
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
      </main>

      <DynamicFooter />
      <ShoppingCart />
    </div>
  );
};

export default ComponentsShop;
