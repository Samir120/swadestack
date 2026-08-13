import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SpecificationsTable from '../components/shop/SpecificationsTable';
import { useComponentsShopViewModel } from '../viewmodels/componentsShopViewModel';
import { useCartViewModel } from '../viewmodels/cartViewModel';
import { useAppSelector } from '../store/hooks';
import { getComponentImageSrc } from '../models/types/pcComponent.types';
import AmbientBackground from '../components/common/AmbientBackground';

const ComponentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, actions, computed } = useComponentsShopViewModel();
  const cartVM = useCartViewModel();
  const language = useAppSelector((s) => s.ui.language) as 'en' | 'sv';

  const [quantity, setQuantity] = useState(1);

  // Load component on mount, clear on unmount
  useEffect(() => {
    if (id) {
      actions.loadComponent(id);
    }
    return () => {
      actions.clearCurrent();
    };
  }, [id, actions]);

  const component = state.currentComponent;

  // Cart state for this component
  const inCart = component ? cartVM.isComponentInCart(component.id) : false;
  const cartQty = component ? cartVM.getComponentQuantity(component.id) : 0;

  // Handle add to cart
  const handleAddToCart = () => {
    if (!component || component.stock === 0) return;
    const compData = {
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
    };
    cartVM.addComponentToCart(compData, quantity);
  };

  // Handle remove from cart
  const handleRemoveFromCart = () => {
    if (!component) return;
    cartVM.removeComponentFromCart(component.id);
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
        <AmbientBackground />
        <Header mode="page" />
        <main className="max-w-7xl mx-auto px-4 py-12 pt-28 relative z-10">
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <LoadingSpinner />
            <span className="text-gray-500 dark:text-neutral-400 text-sm">
              {language === 'en' ? 'Loading component...' : 'Laddar komponent...'}
            </span>
          </div>
        </main>
        <DynamicFooter />
        <ShoppingCart />
      </div>
    );
  }

  // Not found state
  if (!component) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
        <AmbientBackground />
        <Header mode="page" />
        <main className="max-w-7xl mx-auto px-4 py-12 pt-28 relative z-10">
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <p className="text-gray-500 dark:text-neutral-400 text-lg mb-4">
              {language === 'en' ? 'Component not found' : 'Komponenten hittades inte'}
            </p>
            <Link
              to="/components"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {language === 'en' ? 'Back to Components' : 'Tillbaka till Komponenter'}
            </Link>
          </div>
        </main>
        <DynamicFooter />
        <ShoppingCart />
      </div>
    );
  }

  // Derived values
  const componentName = computed.getComponentName(component);
  const categoryLabel = computed.getCategoryLabel(component.componentType);
  const description = computed.getComponentDesc(component);
  const compatNotes = language === 'en' ? component.compatibilityNotes_en : component.compatibilityNotes_sv;

  const isOutOfStock = component.stock === 0;
  const isLowStock = component.stock >= 1 && component.stock <= 5;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
      {/* Ambient Dark Mode Background */}
      <AmbientBackground />

      <Header mode="page" />

      <main className="max-w-7xl mx-auto px-4 py-12 pt-28 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-400 dark:text-neutral-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {language === 'en' ? 'Home' : 'Hem'}
          </Link>
          <svg className="w-4 h-4 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/components" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {language === 'en' ? 'Components' : 'Datorkomponenter'}
          </Link>
          <svg className="w-4 h-4 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link
            to={`/components?type=${component.componentType}`}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {categoryLabel}
          </Link>
          <svg className="w-4 h-4 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 dark:text-neutral-300 font-medium truncate">
            {componentName}
          </span>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left column - Image */}
          <div className="aspect-square bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 overflow-hidden p-8">
            <img
              src={getComponentImageSrc(component.imageUrl, component.componentType)}
              alt={componentName}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Right column - Product Info */}
          <div>
            {/* Category badge */}
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              {categoryLabel}
            </span>

            {/* Manufacturer */}
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-3">
              {component.manufacturer}
            </p>

            {/* Product name */}
            <h1 className="text-3xl lg:text-4xl font-thin text-gray-900 dark:text-white mt-2">
              {componentName}
            </h1>

            {/* Model number */}
            {component.modelNumber && (
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-1">
                {component.modelNumber}
              </p>
            )}

            {/* Price block */}
            <div className="mt-6">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                {computed.formatPrice(component.price, component.currency)}
              </p>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                {component.price.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {component.currency} ex. moms
              </p>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mt-4">
              {isOutOfStock ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600 dark:text-neutral-300">
                    {language === 'en' ? 'Out of Stock' : 'Slut i lager'}
                  </span>
                </>
              ) : isLowStock ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-neutral-300">
                    {language === 'en'
                      ? `Low Stock (${component.stock} left)`
                      : `Fa kvar (${component.stock} st)`}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600 dark:text-neutral-300">
                    {language === 'en'
                      ? `In Stock (${component.stock} available)`
                      : `I lager (${component.stock} tillgangliga)`}
                  </span>
                </>
              )}
            </div>

            {/* Add to cart section */}
            <div className="mt-6">
              {/* Quantity selector */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center text-lg font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(component.stock, q + 1))}
                  disabled={quantity >= component.stock}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  isOutOfStock
                    ? 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-500 active:scale-[0.98] text-white shadow-lg shadow-primary-600/20'
                }`}
              >
                {isOutOfStock
                  ? language === 'en'
                    ? 'Out of Stock'
                    : 'Slut i lager'
                  : language === 'en'
                    ? 'Add to Cart'
                    : 'Lagg i kundvagn'}
              </button>

              {/* Already in cart indicator */}
              {inCart && (
                <div className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {language === 'en'
                        ? `Already in cart (${cartQty})`
                        : `Redan i kundvagn (${cartQty})`}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveFromCart}
                    className="text-sm text-red-500 dark:text-red-400 font-medium hover:underline"
                  >
                    {language === 'en' ? 'Remove' : 'Ta bort'}
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-surface-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'en' ? 'Description' : 'Beskrivning'}
                </h2>
                <p className="text-gray-600 dark:text-neutral-300 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Compatibility notes */}
            {compatNotes && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {language === 'en' ? 'Compatibility Notes' : 'Kompatibilitetsinformation'}
                </h2>
                <p className="text-gray-600 dark:text-neutral-300 leading-relaxed">
                  {compatNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Full-width Specifications section */}
        <div className="mt-12">
          <h2 className="text-2xl font-thin text-gray-900 dark:text-white mb-6">
            {language === 'en' ? 'Specifications' : 'Specifikationer'}
          </h2>
          <SpecificationsTable component={component} language={language} />
        </div>
      </main>

      <DynamicFooter />
      <ShoppingCart />
    </div>
  );
};

export default ComponentDetail;
