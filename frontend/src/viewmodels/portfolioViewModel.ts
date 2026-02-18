import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPortfolio,
  fetchFeaturedPortfolio,
} from '../store/slices/portfolioSlice';
import { PortfolioItem } from '../models/types/portfolio.types';

/**
 * Portfolio ViewModel - Business Logic Layer
 * Handles portfolio-related business logic and state management
 * Connects View (Components) to Model (API)
 */

export const usePortfolioViewModel = () => {
  const dispatch = useAppDispatch();
  const { items, featuredItems, currentItem, total, isLoading, error } =
    useAppSelector((state) => state.portfolio);

  /**
   * Load all portfolio items with optional filters
   */
  const loadPortfolio = (page = 1, limit = 20, category?: string) => {
    dispatch(fetchPortfolio({ page, limit, category }));
  };

  /**
   * Load featured portfolio items
   */
  const loadFeaturedItems = (limit = 6) => {
    dispatch(fetchFeaturedPortfolio(limit));
  };

  /**
   * Auto-load featured items on mount
   */
  useEffect(() => {
    if (featuredItems.length === 0) {
      loadFeaturedItems();
    }
  }, []);

  /**
   * Get portfolio items for current language
   */
  const getLocalizedItems = (_language: 'en' | 'sv'): PortfolioItem[] => {
    return items; // Items already contain both languages
  };

  /**
   * Filter items by category
   */
  const filterByCategory = (category: string) => {
    loadPortfolio(1, 20, category);
  };

  /**
   * Get localized title for an item
   */
  const getItemTitle = (item: PortfolioItem, language: 'en' | 'sv'): string => {
    return language === 'en' ? item.title_en : item.title_sv;
  };

  /**
   * Get localized description for an item
   */
  const getItemDescription = (
    item: PortfolioItem,
    language: 'en' | 'sv'
  ): string => {
    return language === 'en' ? item.description_en : item.description_sv;
  };

  /**
   * Check if there are more items to load
   */
  const hasMoreItems = (): boolean => {
    return items.length < total;
  };

  return {
    // State
    items,
    featuredItems,
    currentItem,
    isLoading,
    error,
    total,

    // Actions
    loadPortfolio,
    loadFeaturedItems,
    filterByCategory,

    // Business Logic
    getLocalizedItems,
    getItemTitle,
    getItemDescription,
    hasMoreItems,
  };
};

export default usePortfolioViewModel;
