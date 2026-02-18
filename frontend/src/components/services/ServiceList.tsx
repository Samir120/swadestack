import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useServicesViewModel } from '../../viewmodels/servicesViewModel';
import { useCartViewModel } from '../../viewmodels/cartViewModel';
import { useAppSelector } from '../../store/hooks';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ServiceList Component - VIEW LAYER
 * 
 * This component demonstrates the proper MVVM architecture:
 * 1. Uses ViewModels (useServicesViewModel, useCartViewModel) for business logic
 * 2. ViewModels handle state management and data transformation
 * 3. ViewModels connect to the Model layer (API services)
 * 4. Component focuses ONLY on rendering UI
 */

const ServiceList: React.FC = () => {
  // ViewModel - Business Logic Layer
  const {
    services,
    isLoading,
    error,
    loadServices,
    getServiceName,
    getServiceDescription,
    formatPrice,
    formatOriginalPrice,
    hasDiscount,
  } = useServicesViewModel();

  const { addServiceToCart, isInCart } = useCartViewModel();

  // UI State (language from Redux)
  const language = useAppSelector((state) => state.ui.language);

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  // Event Handlers
  const handleAddToCart = (service: any) => {
    addServiceToCart(service);
    // Show success notification (can be handled by a notification ViewModel)
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {language === 'en' ? 'Our Services' : 'Våra Tjänster'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white dark:bg-surface-850 rounded-lg shadow-light-md dark:shadow-dark-md overflow-hidden hover:shadow-light-lg dark:hover:shadow-dark-lg transition-shadow duration-300"
          >
            {/* Service Image */}
            {service.imageUrl && (
              <div className="h-48 bg-gray-100 dark:bg-surface-800">
                <img
                  src={service.imageUrl}
                  alt={getServiceName(service, language)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Service Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {getServiceName(service, language)}
              </h3>

              <p className="text-gray-500 dark:text-neutral-400 mb-4 line-clamp-3">
                {getServiceDescription(service, language)}
              </p>

              {/* Price */}
              <div className="mb-4">
                {hasDiscount(service) ? (
                  <>
                    <span className="text-lg text-gray-400 dark:text-neutral-500 line-through mr-2">
                      {formatOriginalPrice(service)}
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(service)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(service)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleAddToCart(service)}
                  disabled={isInCart(service.id)}
                  whileHover={!isInCart(service.id) ? { scale: 1.04 } : undefined}
                  whileTap={!isInCart(service.id) ? { scale: 0.96 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    isInCart(service.id)
                      ? 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isInCart(service.id)
                    ? language === 'en'
                      ? 'In Cart'
                      : 'I Kundvagn'
                    : language === 'en'
                    ? 'Add to Cart'
                    : 'Lägg i Kundvagn'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="px-4 py-2 border border-gray-300 dark:border-surface-600 rounded-md font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-surface-700 transition-colors"
                  onClick={() => {
                    /* Navigate to service detail */
                  }}
                >
                  {language === 'en' ? 'Details' : 'Detaljer'}
                </motion.button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500 dark:text-neutral-400">
          {language === 'en'
            ? 'No services available at the moment.'
            : 'Inga tjänster tillgängliga för tillfället.'}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
