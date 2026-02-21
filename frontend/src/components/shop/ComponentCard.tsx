import React from 'react';
import { Link } from 'react-router-dom';
import { PCComponent, ComponentType, getComponentImageSrc } from '../../models/types/pcComponent.types';

interface ComponentCardProps {
  component: PCComponent;
  language: 'en' | 'sv';
  formatPrice: (price: number, currency?: string) => string;
  getCategoryLabel: (type: ComponentType) => string;
  getSpecSummary: (comp: PCComponent) => string;
  onAddToCart: (component: PCComponent) => void;
  isInCart: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  language,
  formatPrice,
  getCategoryLabel,
  getSpecSummary,
  onAddToCart,
  isInCart,
}) => {
  const name = language === 'en' ? component.name_en : component.name_sv;
  const isOutOfStock = component.stock === 0;
  const isLowStock = component.stock >= 1 && component.stock <= 5;

  const stockLabel = isOutOfStock
    ? language === 'sv' ? 'Slut' : 'Out of Stock'
    : isLowStock
      ? language === 'sv' ? 'F\u00e5 kvar' : 'Low Stock'
      : language === 'sv' ? 'I lager' : 'In Stock';

  const stockDotColor = isOutOfStock
    ? 'bg-red-500'
    : isLowStock
      ? 'bg-yellow-500'
      : 'bg-green-500';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart(component);
  };

  return (
    <Link
      to={`/components/${component.id}`}
      className="block bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 shadow-light-sm dark:shadow-dark-sm hover:shadow-light-lg dark:hover:shadow-dark-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="aspect-square bg-gray-100 dark:bg-surface-800 rounded-t-xl overflow-hidden">
        <img
          src={getComponentImageSrc(component.imageUrl, component.componentType)}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="p-4">
        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {getCategoryLabel(component.componentType)}
        </span>

        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          {component.manufacturer}
        </p>

        <h3 className="font-medium text-gray-900 dark:text-white mt-1 line-clamp-2">
          {name}
        </h3>

        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 line-clamp-1">
          {getSpecSummary(component)}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full ${stockDotColor}`} />
          <span className="text-xs text-gray-500 dark:text-neutral-400">
            {stockLabel}
          </span>
        </div>

        <p className="font-bold text-lg text-primary-600 dark:text-primary-400 mt-2">
          {formatPrice(component.price, component.currency)}
        </p>

        {isOutOfStock ? (
          <button
            disabled
            className="w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-400 dark:bg-surface-700 dark:text-neutral-500 cursor-not-allowed"
          >
            {language === 'sv' ? 'Slut i lager' : 'Out of Stock'}
          </button>
        ) : isInCart ? (
          <button
            disabled
            className="w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed"
          >
            {language === 'sv' ? 'I kundvagn' : 'In Cart'}
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
          >
            {language === 'sv' ? 'L\u00e4gg i kundvagn' : 'Add to Cart'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default ComponentCard;
