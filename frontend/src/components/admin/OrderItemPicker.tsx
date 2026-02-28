import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaSearch, FaBoxOpen, FaDesktop, FaMicrochip } from 'react-icons/fa';
import { ordersApi } from '../../models/api/ordersApi';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProductSearchItem {
  id: string;
  type: 'service' | 'gaming-pc' | 'pc-component';
  name: string;
  description: string;
  price: string;
  priceRaw: number;
  priceNet: number;
  imageUrl: string;
  category: string;
}

interface OrderItemPickerProps {
  orderId: string;
  onSelect: (product: { serviceName: string; serviceDescription: string; price: number; serviceId?: string; pcComponentId?: string; pcConfigurationId?: string }) => void;
  onClose: () => void;
}

const PAGE_SIZE = 12;

const OrderItemPicker: React.FC<OrderItemPickerProps> = ({ orderId, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async (
    searchQuery: string,
    searchCategory: string,
    searchPage: number,
    append: boolean,
  ) => {
    setLoading(true);
    try {
      const response = await ordersApi.searchCatalog(orderId, {
        query: searchQuery || undefined,
        category: searchCategory || undefined,
        page: searchPage,
        pageSize: PAGE_SIZE,
      });
      if (response.success && response.data) {
        const { products: items, total: totalCount, categories: cats } = response.data;
        setProducts(prev => append ? [...prev, ...items] : items);
        setTotal(totalCount);
        // Always update categories from an unfiltered fetch so the sidebar stays complete
        if (!searchCategory && !searchQuery) {
          setCategories(cats);
        } else if (!initialLoaded) {
          setCategories(cats);
        }
        if (!initialLoaded) setInitialLoaded(true);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [orderId, initialLoaded]);

  // Initial load — fetch everything (no filter) to populate categories + grid
  useEffect(() => {
    fetchProducts('', '', 1, false);
    // Also do a separate unfiltered fetch just for categories
    // (the main fetch already does this, but this ensures categories stay stable)
  }, [fetchProducts]);

  // Debounced search when query or category changes
  useEffect(() => {
    if (!initialLoaded) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(query, query ? '' : selectedCategory, 1, false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedCategory, fetchProducts, initialLoaded]);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setQuery(''); // clear search when picking a category
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(query, query ? '' : selectedCategory, nextPage, true);
  };

  const handleSelect = (product: ProductSearchItem) => {
    onSelect({
      serviceName: product.name,
      serviceDescription: product.description,
      price: product.priceNet,
      serviceId: product.type === 'service' ? product.id : undefined,
      pcComponentId: product.type === 'pc-component' ? product.id : undefined,
      pcConfigurationId: product.type === 'gaming-pc' ? product.id : undefined,
    });
  };

  const hasMore = products.length < total;

  // Effective category for display — when searching, category filter is overridden
  const activeCategory = query ? '' : selectedCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-surface-850 rounded-2xl border border-surface-700 shadow-dark-lg w-full max-w-3xl flex flex-col max-h-modal">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-surface-700 flex-shrink-0">
          <h3 className="text-sm sm:text-base font-semibold text-white">Add Product or Service</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-surface-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="px-4 sm:px-5 py-3 border-b border-surface-700 flex-shrink-0">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products & services..."
              className="w-full bg-surface-900 border border-surface-600 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <FaTimes className="text-[10px]" />
              </button>
            )}
          </div>

          {/* Mobile category pills */}
          {categories.length > 0 && (
            <div className="sm:hidden flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide pb-0.5">
              <button
                onClick={() => handleCategoryClick('')}
                className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                  activeCategory === ''
                    ? 'border-primary-500 bg-primary-600/20 text-primary-400'
                    : 'border-surface-600 text-neutral-400 hover:border-surface-500'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                    activeCategory === cat
                      ? 'border-primary-500 bg-primary-600/20 text-primary-400'
                      : 'border-surface-600 text-neutral-400 hover:border-surface-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Body: sidebar + grid ── */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar — categories (hidden on mobile, shown as pills above) */}
          {categories.length > 0 && (
            <div className="hidden sm:block w-44 flex-shrink-0 border-r border-surface-700 overflow-y-auto py-2">
              <button
                onClick={() => handleCategoryClick('')}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  activeCategory === ''
                    ? 'text-primary-400 bg-primary-600/10 font-bold border-r-2 border-primary-500'
                    : 'text-neutral-400 hover:text-white hover:bg-surface-800'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    activeCategory === cat
                      ? 'text-primary-400 bg-primary-600/10 font-bold border-r-2 border-primary-500'
                      : 'text-neutral-400 hover:text-white hover:bg-surface-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Main grid area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {/* Search active indicator */}
            {query && (
              <p className="text-xs text-neutral-500 mb-3">
                Searching for "<span className="text-neutral-300">{query}</span>" across all categories
              </p>
            )}

            {/* Product grid — single column on mobile, 2 columns on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((product) => (
                <div
                  key={`${product.type}-${product.id}`}
                  className="bg-surface-800 rounded-xl border border-surface-700 hover:border-primary-500/40 transition-colors group flex sm:flex-col"
                >
                  {/* Thumbnail — horizontal on mobile, stacked on desktop */}
                  <div className="w-20 h-20 sm:w-full sm:h-28 rounded-l-xl sm:rounded-l-none sm:rounded-t-xl bg-surface-900 overflow-hidden flex items-center justify-center shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-neutral-600">
                        {product.type === 'gaming-pc' ? (
                          <FaDesktop className="text-xl sm:text-2xl" />
                        ) : product.type === 'pc-component' ? (
                          <FaMicrochip className="text-xl sm:text-2xl" />
                        ) : (
                          <FaBoxOpen className="text-xl sm:text-2xl" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info + Select — row layout on mobile */}
                  <div className="flex-1 flex flex-col p-3 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate" title={product.name}>
                      {product.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wide">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between mt-2 sm:flex-col sm:items-start sm:gap-2">
                      <p className="text-sm font-semibold text-primary-400">
                        {product.price}
                      </p>
                      <button
                        onClick={() => handleSelect(product)}
                        className="px-4 py-1.5 sm:w-full sm:py-2 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && initialLoaded && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaBoxOpen className="text-3xl text-neutral-600 mb-3" />
                <p className="text-sm font-bold text-neutral-300 mb-1">No products found</p>
                <p className="text-xs text-neutral-500">Try a different search term or category.</p>
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-5 py-2 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 transition-colors"
                >
                  Load More
                </button>
                <p className="text-[10px] text-neutral-500 mt-1.5">
                  Showing {products.length} of {total}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-5 py-3 border-t border-surface-700 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-neutral-500">
            {total} product{total !== 1 ? 's' : ''}
            {activeCategory ? ` in ${activeCategory}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemPicker;
