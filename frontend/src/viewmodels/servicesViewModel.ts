import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchServices,
  fetchServiceById,
} from '../store/slices/servicesSlice';
import { Service } from '../models/types/service.types';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

/**
 * Services ViewModel - Business Logic Layer
 * Handles service-related business logic and state management
 * Connects View (Components) to Model (API)
 */

/**
 * @param options.autoLoad Fetch the service list on mount when the store is empty.
 *   Defaults to true, so every existing caller keeps its current behaviour. Pass false
 *   from components that only want the formatters — getServiceName and friends are pure
 *   functions over a Service handed to them and read nothing from the store, so mounting
 *   the hook for them otherwise cost a /services request on every page that renders the
 *   cart drawer.
 */
export const useServicesViewModel = (options?: { autoLoad?: boolean }) => {
  const autoLoad = options?.autoLoad !== false;
  const dispatch = useAppDispatch();
  const { services, currentService, total, isLoading, error } =
    useAppSelector((state) => state.services);
  const vatRate = useVatRate();

  /**
   * Load all services with optional filters
   */
  const loadServices = (page = 1, limit = 20, category?: string) => {
    dispatch(fetchServices({ page, limit, category }));
  };

  /**
   * Load a single service by ID
   */
  const loadServiceById = (id: string) => {
    dispatch(fetchServiceById(id));
  };

  /**
   * Auto-load services on mount
   */
  useEffect(() => {
    if (autoLoad && services.length === 0) {
      loadServices();
    }
  }, []);

  /**
   * Get localized service name
   */
  const getServiceName = (service: Service, language: 'en' | 'sv'): string => {
    return language === 'en' ? service.name_en : service.name_sv;
  };

  /**
   * Get localized service description
   */
  const getServiceDescription = (
    service: Service,
    language: 'en' | 'sv'
  ): string => {
    return language === 'en' ? service.desc_en : service.desc_sv;
  };

  /**
   * Get localized service features
   */
  const getServiceFeatures = (
    service: Service,
    language: 'en' | 'sv'
  ): string[] => {
    return language === 'en'
      ? service.features_en || []
      : service.features_sv || [];
  };

  /**
   * Get the effective price (discounted or original)
   */
  const getEffectivePrice = (service: Service): number => {
    return service.discountPrice ?? service.price;
  };

  /**
   * Check if a service has a discount
   */
  const hasDiscount = (service: Service): boolean => {
    return service.discountPrice != null && service.discountPrice < service.price;
  };

  /**
   * Format service price with currency (uses effective price)
   */
  const formatPrice = (service: Service): string => {
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: service.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(netToGross(getEffectivePrice(service), vatRate));
  };

  /**
   * Format the original price (for strikethrough display when discounted)
   */
  const formatOriginalPrice = (service: Service): string => {
    const formatter = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: service.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(netToGross(service.price, vatRate));
  };

  /**
   * Filter services by category
   */
  const filterByCategory = (category: string) => {
    loadServices(1, 20, category);
  };

  /**
   * Sort services by price
   */
  const sortByPrice = (ascending = true): Service[] => {
    return [...services].sort((a, b) => {
      const priceA = getEffectivePrice(a);
      const priceB = getEffectivePrice(b);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  };

  /**
   * Get services by price range
   */
  const filterByPriceRange = (min: number, max: number): Service[] => {
    return services.filter((service) => {
      const effectivePrice = getEffectivePrice(service);
      return effectivePrice >= min && effectivePrice <= max;
    });
  };

  return {
    // State
    services,
    currentService,
    total,
    isLoading,
    error,

    // Actions
    loadServices,
    loadServiceById,
    filterByCategory,

    // Business Logic
    getServiceName,
    getServiceDescription,
    getServiceFeatures,
    formatPrice,
    formatOriginalPrice,
    getEffectivePrice,
    hasDiscount,
    sortByPrice,
    filterByPriceRange,
  };
};

export default useServicesViewModel;
