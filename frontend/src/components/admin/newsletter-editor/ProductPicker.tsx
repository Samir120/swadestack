import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Package, Loader2 } from '../../common/icons';
import { newsletterAdminApi } from '../../../models/api/newsletterAdminApi';
import { ProductSearchItem } from '../../../models/types/newsletterAdmin.types';

interface ProductPickerProps {
  onSelect: (product: ProductSearchItem) => void;
  onClose?: () => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ onSelect, onClose }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstLoad = useRef(true);

  const fetchProducts = useCallback(async (searchQuery: string, searchCategory: string, searchPage: number, append: boolean) => {
    setLoading(true);
    try {
      const response = await newsletterAdminApi.searchProducts({
        query: searchQuery || undefined,
        category: searchCategory || undefined,
        page: searchPage,
        pageSize: 6,
      });
      if (response.success && response.data) {
        const { products: items, total: totalCount, categories: cats } = response.data;
        setProducts(prev => append ? [...prev, ...items] : items);
        setTotal(totalCount);
        if (isFirstLoad.current || !searchCategory) {
          setCategories(cats);
        }
        isFirstLoad.current = false;
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts('', '', 1, false);
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(query, category, 1, false);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category, fetchProducts]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(query, category, nextPage, true);
  };

  const hasMore = products.length < total;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('newsletterAdmin.editor.settings.searchProducts', 'Search products...')}
          className="w-full bg-surface-900 border border-surface-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-neutral-500"
          autoFocus
        />
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">{t('newsletterAdmin.editor.settings.allCategories', 'All Categories')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}

      {/* Results */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {products.map((product) => (
          <div
            key={`${product.type}-${product.id}`}
            className="flex items-center gap-3 p-2 bg-surface-800 rounded-lg hover:bg-surface-700 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-neutral-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{product.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">{product.category}</span>
                <span className="text-xs font-semibold text-primary-400">{product.price}</span>
              </div>
            </div>

            {/* Select button */}
            <button
              onClick={() => onSelect(product)}
              className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
            >
              {t('newsletterAdmin.editor.settings.select', 'Select')}
            </button>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-4">
            {t('newsletterAdmin.editor.settings.noResults', 'No products found')}
          </p>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-300 bg-surface-800 rounded-lg transition-colors"
        >
          {t('newsletterAdmin.editor.settings.loadMore', 'Load More')} ({products.length}/{total})
        </button>
      )}

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-2 text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
        >
          {t('common.cancel', 'Cancel')}
        </button>
      )}
    </div>
  );
};

export default ProductPicker;
