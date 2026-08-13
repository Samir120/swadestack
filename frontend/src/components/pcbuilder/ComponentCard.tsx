import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from '../common/icons';
import { PCComponent, getComponentImageSrc } from '../../models/types/pcComponent.types';
import { ValidationError } from '../../models/types/validation.types';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

/**
 * Component Card
 * Displays a single PC component with details and selection functionality
 */

interface ComponentCardProps {
  component: PCComponent;
  isSelected: boolean;
  onSelect: (component: PCComponent, quantity?: number) => void;
  onRemove: () => void;
  language: string;
  compatibilityWarning?: ValidationError;
  incompatibilityError?: any; // Pre-validation error that blocks selection
  showQuantity?: boolean; // For RAM and Storage
  isMultiSelect?: boolean; // For components that allow multiple selections
  disabled?: boolean; // When all slots are full or incompatible
  isValidating?: boolean; // When checking compatibility
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  isSelected,
  onSelect,
  onRemove,
  language,
  compatibilityWarning,
  incompatibilityError,
  showQuantity = false,
  isMultiSelect = false,
  disabled = false,
  isValidating = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const vatRate = useVatRate();

  // Get component name based on language
  const getName = () => (language === 'en' ? component.name_en : component.name_sv);
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-SE' : 'sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  // Get key specifications based on component type
  const getKeySpecs = () => {
    const specs = component.specifications;
    if (!specs) return [];

    switch (component.componentType) {
      case 'cpu':
        return [
          { label: 'Socket', value: (specs as any).socket },
          { label: 'Cores/Threads', value: `${(specs as any).cores}C/${(specs as any).threads}T` },
          { label: 'Clock', value: `${(specs as any).baseClock}-${(specs as any).boostClock} GHz` },
          { label: 'TDP', value: `${(specs as any).tdp}W` },
        ];
      case 'motherboard':
        return [
          { label: 'Socket', value: (specs as any).socket },
          { label: 'Chipset', value: (specs as any).chipset },
          { label: 'RAM', value: `${(specs as any).ramType} / ${(specs as any).ramSlots} slots` },
          { label: 'Form Factor', value: (specs as any).formFactor },
        ];
      case 'ram':
        return [
          { label: 'Type', value: (specs as any).ramType },
          { label: 'Speed', value: `${(specs as any).speed} MHz` },
          { label: 'Capacity', value: `${(specs as any).capacity}GB x ${(specs as any).sticks}` },
          { label: 'Slots Used', value: `${(specs as any).sticks || 1}` },
        ];
      case 'gpu':
        return [
          { label: 'VRAM', value: `${(specs as any).vram}GB` },
          { label: 'TDP', value: `${(specs as any).tdp}W` },
          { label: 'Length', value: `${(specs as any).length}mm` },
          { label: 'Min PSU', value: `${(specs as any).minPSU}W` },
        ];
      case 'ssd':
        return [
          { label: 'Type', value: (specs as any).ssdType },
          { label: 'Capacity', value: `${(specs as any).capacity}GB` },
          { label: 'Read', value: (specs as any).readSpeed ? `${(specs as any).readSpeed} MB/s` : 'N/A' },
          { label: 'Interface', value: (specs as any).interface },
        ];
      case 'hdd':
        return [
          { label: 'Capacity', value: `${(specs as any).capacity}GB` },
          { label: 'RPM', value: `${(specs as any).rpm}` },
          { label: 'Cache', value: (specs as any).cacheSize ? `${(specs as any).cacheSize}MB` : 'N/A' },
          { label: 'Interface', value: (specs as any).interface },
        ];
      case 'optical':
        return [
          { label: 'Type', value: (specs as any).driveType },
          { label: 'Read', value: (specs as any).readSpeed || 'N/A' },
          { label: 'Write', value: (specs as any).writeSpeed || 'N/A' },
          { label: 'Form Factor', value: (specs as any).formFactor },
        ];
      case 'fan':
        return [
          { label: 'Size', value: `${(specs as any).size}mm` },
          { label: 'RPM', value: `${(specs as any).rpm?.min}-${(specs as any).rpm?.max}` },
          { label: 'Airflow', value: (specs as any).airflow ? `${(specs as any).airflow} CFM` : 'N/A' },
          { label: 'RGB', value: (specs as any).rgb ? 'Yes' : 'No' },
        ];
      case 'os':
        return [
          { label: 'OS', value: (specs as any).osType },
          { label: 'Architecture', value: (specs as any).architecture },
          { label: 'License', value: (specs as any).licenseType },
          { label: 'Language', value: (specs as any).language || 'Multi' },
        ];
      case 'psu':
        return [
          { label: 'Wattage', value: `${(specs as any).wattage}W` },
          { label: 'Efficiency', value: (specs as any).efficiency },
          { label: 'Modular', value: (specs as any).modular ? 'Yes' : 'No' },
          { label: 'Form Factor', value: (specs as any).formFactor },
        ];
      case 'case':
        return [
          { label: 'Form Factors', value: (specs as any).formFactor?.join(', ') },
          { label: 'Max GPU', value: `${(specs as any).maxGpuLength}mm` },
          { label: 'Max Cooler', value: `${(specs as any).maxCpuCoolerHeight}mm` },
          { label: 'Radiator', value: (specs as any).maxRadiatorSize ? `${(specs as any).maxRadiatorSize}mm` : 'N/A' },
        ];
      case 'cooling':
        return [
          { label: 'Type', value: (specs as any).coolingType },
          { label: 'Sockets', value: (specs as any).socket?.slice(0, 2).join(', ') },
          { label: 'Max TDP', value: `${(specs as any).maxTdp}W` },
          { label: 'Height/Size', value: (specs as any).height ? `${(specs as any).height}mm` : `${(specs as any).radiatorSize}mm AIO` },
        ];
      default:
        return [];
    }
  };

  const handleSelect = () => {
    if (isMultiSelect) {
      // In multi-select mode, always add the component
      onSelect(component, showQuantity ? quantity : undefined);
    } else if (isSelected) {
      onRemove();
    } else {
      onSelect(component, showQuantity ? quantity : undefined);
    }
  };

  const isOutOfStock = component.stock === 0;
  const isLowStock = component.stock > 0 && component.stock <= 5;
  const hasIncompatibilityError = !!incompatibilityError;

  return (
    <div
      className={`
        relative bg-white dark:bg-surface-850 rounded-xl border overflow-hidden transition-all duration-200
        ${isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-light-lg dark:shadow-dark-lg'
          : compatibilityWarning && !hasIncompatibilityError
            ? 'border-yellow-400 ring-2 ring-yellow-400/20 shadow-sm'
            : 'border-gray-200 dark:border-surface-700 shadow-sm hover:shadow-md hover:border-primary-500/30'
        }
        ${isOutOfStock ? 'opacity-60' : ''}
        ${hasIncompatibilityError ? 'opacity-75' : ''}
      `}
    >
      {/* Selection Badge - only show for single-select components */}
      {isSelected && !isMultiSelect && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="bg-green-500 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {language === 'en' ? 'Selected' : 'Vald'}
          </span>
        </div>
      )}

      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {language === 'en' ? 'Out of Stock' : 'Slut i lager'}
          </span>
        </div>
      )}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            {language === 'en' ? `Only ${component.stock} left` : `Endast ${component.stock} kvar`}
          </span>
        </div>
      )}

      {/* Component Image */}
      {(() => {
        const imgSrc = getComponentImageSrc(component.imageUrl, component.componentType);
        const hasRealImage = imgSrc === component.imageUrl;
        return (
          <div className={`h-28 sm:h-36 md:h-40 flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-surface-700 ${
            hasRealImage
              ? 'bg-gray-50 dark:bg-surface-800'
              : 'bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900'
          }`}>
            <img
              src={imgSrc}
              alt={getName()}
              className={hasRealImage
                ? 'h-full w-full object-contain p-3 sm:p-4'
                : 'w-full h-full object-contain'
              }
            />
          </div>
        );
      })()}

      {/* Content */}
      <div className="p-3.5 sm:p-5">
        {/* Manufacturer */}
        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-[0.12em] font-medium mb-0.5 sm:mb-1">
          {component.manufacturer}
        </p>

        {/* Name */}
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
          {getName()}
        </h3>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-1.5 mb-3 sm:mb-4">
          {getKeySpecs().slice(0, 4).map((spec, index) => (
            <div key={index} className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-50 dark:bg-surface-800">
              <span className="text-gray-400 dark:text-neutral-500">{spec.label}: </span>
              <span className="text-gray-700 dark:text-neutral-300 font-medium">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Incompatibility Error - shown when pre-validation detects incompatibility */}
        {hasIncompatibilityError && (
          <div className="mb-2 sm:mb-3 p-1.5 sm:p-2 bg-primary-600/10 border border-primary-500/30 rounded text-[10px] sm:text-xs text-primary-600 dark:text-primary-400">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-2">
                {language === 'en'
                  ? incompatibilityError.message_en || incompatibilityError.message
                  : incompatibilityError.message_sv || incompatibilityError.message}
              </span>
            </div>
          </div>
        )}

        {/* Compatibility Warning - shown for post-add warnings */}
        {compatibilityWarning && !hasIncompatibilityError && (
          <div className="mb-2 sm:mb-3 p-1.5 sm:p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 rounded text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400">
            <span className="font-bold inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3 inline" />{language === 'en' ? 'Warning' : 'Varning'}:</span>{' '}
            <span className="line-clamp-2">{language === 'en' ? compatibilityWarning.message_en : compatibilityWarning.message_sv}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">{formatPrice(component.price)}</span>
        </div>

        {/* Quantity Selector (only for non-multi-select components that support quantity) */}
        {showQuantity && !isSelected && !isMultiSelect && (
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <label className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
              {language === 'en' ? 'Qty:' : 'Antal:'}
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border border-gray-300 dark:border-surface-600 rounded px-2 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-surface-800 text-gray-900 dark:text-white"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          onClick={handleSelect}
          disabled={(isOutOfStock && !isSelected) || (disabled && !isSelected) || hasIncompatibilityError || isValidating}
          whileHover={!((isOutOfStock && !isSelected) || (disabled && !isSelected) || hasIncompatibilityError || isValidating) ? { scale: 1.04 } : undefined}
          whileTap={!((isOutOfStock && !isSelected) || (disabled && !isSelected) || hasIncompatibilityError || isValidating) ? { scale: 0.96 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`
            w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2
            ${isSelected && !isMultiSelect
              ? 'border border-red-300 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : isOutOfStock || disabled || hasIncompatibilityError || isValidating
              ? 'bg-gray-100 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm hover:shadow-md active:scale-[0.97]'
            }
          `}
        >
          {isValidating ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{language === 'en' ? 'Checking...' : 'Kontrollerar...'}</span>
            </>
          ) : isMultiSelect ? (
            hasIncompatibilityError
              ? language === 'en' ? 'Incompatible' : 'Inkompatibel'
              : disabled
              ? language === 'en' ? 'No Slots' : 'Inga platser'
              : language === 'en' ? 'Add' : 'Lägg till'
          ) : isSelected ? (
            language === 'en' ? 'Remove' : 'Ta bort'
          ) : hasIncompatibilityError ? (
            language === 'en' ? 'Incompatible' : 'Inkompatibel'
          ) : (
            language === 'en' ? 'Select' : 'Välj'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ComponentCard;
