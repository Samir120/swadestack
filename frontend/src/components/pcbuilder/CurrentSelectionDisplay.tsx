import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SelectedComponents,
  ComponentType,
  PCComponent,
  PCComponentWithSlot,
  SSDComponentWithSlot,
  getComponentImageSrc,
} from '../../models/types/pcComponent.types';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

/**
 * Current Selection Display Component
 * Shows the selected component(s) for the current category at the top of the main content area
 * Similar to inet.se's "Ditt val av [Category]:" section
 */

interface CurrentSelectionDisplayProps {
  componentType: ComponentType;
  isMultiSelect: boolean;
  selectedComponents: SelectedComponents;
  onRemove: (type: ComponentType) => void;
  onRemoveMultiSelect: (type: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', slotIndex: number) => void;
  onAddMore: () => void;
  language: string;
  availableSlots: number;
}

// Component type labels
const COMPONENT_LABELS: Record<ComponentType, { en: string; sv: string }> = {
  cpu: { en: 'Processor', sv: 'Processor' },
  motherboard: { en: 'Motherboard', sv: 'Moderkort' },
  ram: { en: 'Memory (RAM)', sv: 'Internminne / RAM' },
  gpu: { en: 'Graphics Card', sv: 'Grafikkort' },
  ssd: { en: 'SSD Storage', sv: 'Hårddisk SSD' },
  hdd: { en: 'HDD Storage', sv: 'Hårddisk HDD' },
  psu: { en: 'Power Supply', sv: 'Nätaggregat' },
  case: { en: 'Case', sv: 'Chassi' },
  cooling: { en: 'CPU Cooler', sv: 'Processorkylning' },
  optical: { en: 'Optical Drive', sv: 'DVD- & Blu-Ray-spelare' },
  fan: { en: 'Case Fans', sv: 'Fläkt' },
  os: { en: 'Operating System', sv: 'Operativsystem' },
};

const CurrentSelectionDisplay: React.FC<CurrentSelectionDisplayProps> = ({
  componentType,
  isMultiSelect,
  selectedComponents,
  onRemove,
  onRemoveMultiSelect,
  onAddMore,
  language,
  availableSlots,
}) => {
  const vatRate = useVatRate();

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-SE' : 'sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  // Get component name
  const getComponentName = (component: PCComponent) =>
    language === 'en' ? component.name_en : component.name_sv;

  // Get label for component type
  const getLabel = () =>
    language === 'en' ? COMPONENT_LABELS[componentType].en : COMPONENT_LABELS[componentType].sv;

  // Get multi-select components array
  const getMultiSelectComponents = (): (PCComponentWithSlot | SSDComponentWithSlot)[] => {
    const pluralKey = `${componentType}s` as keyof SelectedComponents;
    const components = selectedComponents[pluralKey];
    if (Array.isArray(components)) {
      return components as (PCComponentWithSlot | SSDComponentWithSlot)[];
    }
    return [];
  };

  // Get single component
  const getSingleComponent = (): PCComponent | undefined => {
    return selectedComponents[componentType as keyof SelectedComponents] as PCComponent | undefined;
  };

  // Get key specs for display
  const getKeySpecs = (component: PCComponent): string => {
    const specs = component.specifications as any;
    if (!specs) return '';

    switch (componentType) {
      case 'cpu':
        return `${specs.cores || '?'} ${language === 'en' ? 'cores' : 'kärnor'} | ${specs.threads || '?'} ${language === 'en' ? 'threads' : 'trådar'}`;
      case 'motherboard':
        return `${specs.socket || ''} | ${specs.chipset || ''} | ${specs.formFactor || ''}`;
      case 'ram':
        return `${specs.ramType || ''} | ${specs.speed || ''}MHz | ${specs.capacity || ''}GB x ${specs.sticks || 1}`;
      case 'gpu':
        return `${specs.vram || ''}GB VRAM | ${specs.tdp || ''}W TDP`;
      case 'ssd':
        return `${specs.ssdType || ''} | ${specs.capacity || ''}GB`;
      case 'hdd':
        return `${specs.capacity || ''}GB | ${specs.rpm || ''}RPM`;
      case 'psu':
        return `${specs.wattage || ''}W | ${specs.efficiency || ''}`;
      case 'case':
        return `${specs.formFactor?.join(', ') || ''} | Max GPU: ${specs.maxGpuLength || '?'}mm`;
      case 'cooling':
        return `${specs.coolingType || ''} | Max TDP: ${specs.maxTdp || '?'}W`;
      case 'fan':
        return `${specs.size || ''}mm | ${specs.rpm?.min || '?'}-${specs.rpm?.max || '?'}RPM`;
      case 'os':
        return `${specs.osType || ''} | ${specs.architecture || ''}`;
      case 'optical':
        return `${specs.driveType || ''}`;
      default:
        return '';
    }
  };

  // Check if there are any selections
  const multiComponents = isMultiSelect ? getMultiSelectComponents() : [];
  const singleComponent = !isMultiSelect ? getSingleComponent() : undefined;
  const hasSelection = isMultiSelect ? multiComponents.length > 0 : !!singleComponent;

  if (!hasSelection) {
    return null; // Don't show section if nothing is selected
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 border-l-4 border-l-primary-500 p-4 sm:p-5 md:p-6 mb-6 sm:mb-8"
    >
      {/* Section Header */}
      <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
        {language === 'en' ? `Your selection of ${getLabel()}:` : `Ditt val av ${getLabel()}:`}
      </h2>

      {/* Selected Items */}
      <div className="space-y-2 sm:space-y-3">
        <AnimatePresence>
          {isMultiSelect ? (
            // Multi-select display
            <>
              {multiComponents.map((component) => (
                <motion.div
                  key={`${component.id}-${component.slotIndex}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-surface-800 rounded-xl border border-gray-100 dark:border-surface-700"
                >
                  {/* Top row on mobile: Image + Info + Remove */}
                  <div className="flex items-center gap-3 w-full sm:contents">
                    {/* Image */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white dark:bg-surface-850 rounded-lg border border-gray-100 dark:border-surface-700 overflow-hidden">
                      <img
                        src={getComponentImageSrc(component.imageUrl, component.componentType || componentType)}
                        alt={getComponentName(component)}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {getComponentName(component)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 dark:text-neutral-500 truncate">
                        {getKeySpecs(component)}
                      </p>
                    </div>

                    {/* Remove Button - visible on mobile in row */}
                    <button
                      onClick={() => onRemoveMultiSelect(componentType as 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', component.slotIndex)}
                      className="p-1.5 sm:p-2 text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all sm:hidden"
                      title={language === 'en' ? 'Remove' : 'Ta bort'}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Price - Full width on mobile */}
                  <div className="flex justify-between items-center w-full sm:w-auto sm:text-right sm:flex-shrink-0 pl-15 sm:pl-0">
                    <span className="text-xs text-gray-400 dark:text-neutral-500 sm:hidden">{language === 'en' ? 'Price:' : 'Pris:'}</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(component.price)}
                    </span>
                  </div>

                  {/* Remove Button - Hidden on mobile, visible on desktop */}
                  <button
                    onClick={() => onRemoveMultiSelect(componentType as 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', component.slotIndex)}
                    className="hidden sm:flex p-2 text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title={language === 'en' ? 'Remove' : 'Ta bort'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              ))}

              {/* Add More Button */}
              {availableSlots > 0 && (
                <button
                  onClick={onAddMore}
                  className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-200 dark:border-surface-600 rounded-xl text-gray-400 dark:text-neutral-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {language === 'en' ? 'Add more' : 'Lägg till fler'}
                </button>
              )}
            </>
          ) : (
            // Single-select display
            singleComponent && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-surface-800 rounded-xl border border-gray-100 dark:border-surface-700"
              >
                {/* Top row on mobile: Image + Info + Remove */}
                <div className="flex items-center gap-3 w-full sm:contents">
                  {/* Image */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white dark:bg-surface-850 rounded-lg border border-gray-100 dark:border-surface-700 overflow-hidden">
                    <img
                      src={getComponentImageSrc(singleComponent.imageUrl, componentType)}
                      alt={getComponentName(singleComponent)}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {getComponentName(singleComponent)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-neutral-500 truncate">
                      {getKeySpecs(singleComponent)}
                    </p>
                  </div>

                  {/* Remove Button - visible on mobile in row */}
                  <button
                    onClick={() => onRemove(componentType)}
                    className="p-1.5 sm:p-2 text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all sm:hidden"
                    title={language === 'en' ? 'Remove' : 'Ta bort'}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Price - Full width on mobile */}
                <div className="flex justify-between items-center w-full sm:w-auto sm:text-right sm:flex-shrink-0 pl-15 sm:pl-0">
                  <span className="text-xs text-gray-400 dark:text-neutral-500 sm:hidden">{language === 'en' ? 'Price:' : 'Pris:'}</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(singleComponent.price)}
                  </span>
                </div>

                {/* Remove Button - Hidden on mobile, visible on desktop */}
                <button
                  onClick={() => onRemove(componentType)}
                  className="hidden sm:flex p-2 text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title={language === 'en' ? 'Remove' : 'Ta bort'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CurrentSelectionDisplay;
