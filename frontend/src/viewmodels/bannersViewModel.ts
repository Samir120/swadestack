import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchBanners,
  fetchBannerById,
} from '../store/slices/bannerSlice'
import { Banner } from '../models/types/bannerTypes';

/**
 * Banners ViewModel - Business Logic Layer
 * Handles banner-related business logic and state management
 * Connects View (Components) to Model (API)
 */

export const useBannersViewModel = () => {
  const dispatch = useAppDispatch();
  const { banners, currentBanner, total, isLoading, error } =
    useAppSelector((state) => state.banners);

  /**
   * Load all banners
   * Note: Category filter removed as banners don't have categories
   */
  const loadBanners = (page = 1, limit = 20) => {
    dispatch(fetchBanners({ page, limit }));
  };

  /**
   * Load a single banner by ID
   */
  const loadBannerById = (id: string) => {
    dispatch(fetchBannerById(id));
  };

  /**
   * Auto-load banners on mount if list is empty
   */
  useEffect(() => {
    if (banners.length === 0) {
      loadBanners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get localized banner title/name
   * Assumes Banner type has name_en/name_sv or title_en/title_sv
   */
  const getBannerTitle = (banner: Banner, language: 'en' | 'sv'): string => {
    // Adjust property names based on your actual Banner interface (e.g., title_en vs name_en)
    return language === 'en' ? banner.title_en : banner.title_sv;
  };

  /**
   * Get localized banner description
   */
  const getBannerDescription = (
    banner: Banner,
    language: 'en' | 'sv'
  ): string => {
    return language === 'en' ? banner.desc_en : banner.desc_sv;
  };

  /**
   * Helper to check if a banner is active/visible
   * (Optional business logic specific to banners)
   */
  const isBannerActive = (banner: Banner): boolean => {
    return banner.is_active; 
  };

  return {
    // State
    banners,
    currentBanner,
    total,
    isLoading,
    error,

    // Actions
    loadBanners,
    loadBannerById,

    // Business Logic
    getBannerTitle,
    getBannerDescription,
    isBannerActive,
  };
};

export default useBannersViewModel;