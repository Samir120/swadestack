import React from 'react';
import {
  SelectedComponents,
  ComponentType,
  PCComponent,
  PCComponentWithSlot,
  SSDComponentWithSlot,
  getComponentImageSrc,
} from '../../models/types/pcComponent.types';
import { PriceBreakdown, PCBuildServiceOption } from '../../models/types/pcConfiguration.types';
import { ValidationResult } from '../../models/types/validation.types';
import BuildServiceSelector from './BuildServiceSelector';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';
interface ConfigurationSummaryProps {
  selectedComponents: SelectedComponents;
  priceBreakdown: PriceBreakdown | null;
  validationResult: ValidationResult | null;
  includesBuildService: boolean;
  buildServiceOptions: PCBuildServiceOption[];
  selectedBuildService?: PCBuildServiceOption;
  onToggleBuildService: (enabled: boolean, optionId?: string) => void;
  onRemoveComponent: (componentType: ComponentType) => void;
  onRemoveMultiSelectComponent?: (componentType: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', slotIndex: number) => void;
  onAddMore?: (componentType: ComponentType) => void;
  onSave: () => void;
  onCheckout: () => void;
  onStartOver: () => void;
  isAuthenticated: boolean;
  isSaving: boolean;
  language: string;
  availableSlots?: Record<string, number>;
}

// Component order for display - all 12 component types
const COMPONENT_ORDER: { type: ComponentType; multiSelect?: boolean }[] = [
  { type: 'cpu' },
  { type: 'motherboard' },
  { type: 'ram', multiSelect: true },
  { type: 'gpu', multiSelect: true },
  { type: 'ssd', multiSelect: true },
  { type: 'hdd', multiSelect: true },
  { type: 'psu' },
  { type: 'case' },
  { type: 'cooling' },
  { type: 'optical' },
  { type: 'fan', multiSelect: true },
  { type: 'os' },
];

// Component type labels - all 12 types
const COMPONENT_LABELS: Record<ComponentType, { en: string; sv: string }> = {
  cpu: { en: 'CPU', sv: 'CPU' },
  motherboard: { en: 'Motherboard', sv: 'Moderkort' },
  ram: { en: 'RAM', sv: 'Internminne / RAM' },
  gpu: { en: 'Graphics Card', sv: 'Grafikkort' },
  ssd: { en: 'SSD', sv: 'Hårddisk SSD' },
  hdd: { en: 'HDD', sv: 'Hårddisk HDD' },
  psu: { en: 'Power Supply', sv: 'Nätaggregat' },
  case: { en: 'Case', sv: 'Chassi' },
  cooling: { en: 'CPU Cooling', sv: 'CPU Kylning' },
  optical: { en: 'Optical Drive', sv: 'Optisk Enhet' },
  fan: { en: 'Case Fans', sv: 'Chassifläktar' },
  os: { en: 'Operating System', sv: 'Operativsystem' },
};

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  selectedComponents,
  priceBreakdown,
  validationResult,
  includesBuildService,
  buildServiceOptions,
  selectedBuildService,
  onToggleBuildService,
  onRemoveComponent,
  onRemoveMultiSelectComponent,
  onAddMore,
  onSave,
  onCheckout,
  onStartOver,
  isAuthenticated,
  isSaving,
  language,
  availableSlots = {},
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

  // Get multi-select components array
  const getMultiSelectComponents = (type: ComponentType): (PCComponentWithSlot | SSDComponentWithSlot)[] => {
    const pluralKey = `${type}s` as keyof SelectedComponents;
    const components = selectedComponents[pluralKey];
    if (Array.isArray(components)) {
      return components as (PCComponentWithSlot | SSDComponentWithSlot)[];
    }
    return [];
  };

  // Get single component
  const getSingleComponent = (type: ComponentType): PCComponent | undefined => {
    return selectedComponents[type as keyof SelectedComponents] as PCComponent | undefined;
  };

  // Count selected components
  const countSelectedComponents = () => {
    let count = 0;
    COMPONENT_ORDER.forEach(({ type, multiSelect }) => {
      if (multiSelect) {
        const components = getMultiSelectComponents(type);
        if (components.length > 0) count++;
      } else {
        if (getSingleComponent(type)) count++;
      }
    });
    return count;
  };

  const selectedCount = countSelectedComponents();

  // Check if all required components are selected
  // Required: CPU, Motherboard, RAM, PSU, Case
  const hasRequiredComponents = () => {
    const hasCpu = !!getSingleComponent('cpu');
    const hasMotherboard = !!getSingleComponent('motherboard');
    const hasRam = getMultiSelectComponents('ram').length > 0;
    const hasPsu = !!getSingleComponent('psu');
    const hasCase = !!getSingleComponent('case');
    return hasCpu && hasMotherboard && hasRam && hasPsu && hasCase;
  };

  // Check if configuration is valid for checkout
  // Must have all required components AND pass compatibility validation
  const canCheckout = validationResult?.isValid && hasRequiredComponents();

  // Check if at least one storage device (SSD or HDD) is selected
  // Required for build service (non-DIY)
  const hasStorage = getMultiSelectComponents('ssd').length > 0 || getMultiSelectComponents('hdd').length > 0;

  // Check if can add more of a multi-select type
  const canAddMore = (type: ComponentType): boolean => {
    const slots = availableSlots[type] ?? 0;
    return slots > 0;
  };

  // Render single component item
  const renderSingleComponent = (type: ComponentType) => {
    const component = getSingleComponent(type);
    const label = language === 'en' ? COMPONENT_LABELS[type].en : COMPONENT_LABELS[type].sv;

    return (
      <div
        key={type}
        className={`
          py-3 border-b border-gray-200 dark:border-surface-700 last:border-0
          ${!component ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wide flex items-center">
              {label}
              {component && (
                <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </p>
            {component ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={getComponentImageSrc(component.imageUrl, type)}
                  alt=""
                  className="w-10 h-10 object-contain rounded bg-white dark:bg-surface-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getComponentName(component)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{formatPrice(component.price)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-neutral-500 italic mt-1">
                {language === 'en' ? 'Not selected' : 'Inte vald'}
              </p>
            )}
          </div>

          {component && (
            <button
              onClick={() => onRemoveComponent(type)}
              className="text-neutral-400 hover:text-red-500 p-1 ml-2"
              title={language === 'en' ? 'Remove' : 'Ta bort'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render multi-select component section
  const renderMultiSelectComponent = (type: ComponentType) => {
    const components = getMultiSelectComponents(type);
    const label = language === 'en' ? COMPONENT_LABELS[type].en : COMPONENT_LABELS[type].sv;
    const hasSelection = components.length > 0;
    const slotsAvailable = canAddMore(type);

    return (
      <div
        key={type}
        className={`
          py-3 border-b border-gray-200 dark:border-surface-700 last:border-0
          ${!hasSelection ? 'opacity-50' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wide flex items-center">
            {label}
            {hasSelection && (
              <svg className="w-4 h-4 ml-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </p>
        </div>

        {hasSelection ? (
          <div className="space-y-2">
            {components.map((component) => (
              <div key={`${component.id}-${component.slotIndex}`} className="flex items-center gap-2 bg-gray-100 dark:bg-surface-800 rounded p-2">
                <img
                  src={getComponentImageSrc(component.imageUrl, type)}
                  alt=""
                  className="w-8 h-8 object-contain rounded bg-white dark:bg-surface-700"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getComponentName(component)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">{formatPrice(component.price)}</p>
                </div>
                <button
                  onClick={() => onRemoveMultiSelectComponent?.(type as 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', component.slotIndex)}
                  className="text-neutral-400 hover:text-red-500 p-1"
                  title={language === 'en' ? 'Remove' : 'Ta bort'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add More Button */}
            {slotsAvailable && onAddMore && (
              <button
                onClick={() => onAddMore(type)}
                className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 border border-dashed border-gray-300 dark:border-surface-600 rounded hover:border-blue-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {language === 'en' ? 'Add more' : 'Lägg till fler'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-neutral-500 italic">
            {language === 'en' ? 'Not selected' : 'Inte vald'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-lg shadow-light-lg dark:shadow-dark-lg overflow-hidden text-gray-900 dark:text-white">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-surface-800 p-4">
        <h3 className="text-lg font-semibold">
          {language === 'en' ? 'Your Configuration' : 'Din konfiguration'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {language === 'en'
            ? `${selectedCount} component types selected`
            : `${selectedCount} komponenttyper valda`}
        </p>
      </div>

      {/* Component List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {COMPONENT_ORDER.map(({ type, multiSelect }) =>
          multiSelect ? renderMultiSelectComponent(type) : renderSingleComponent(type)
        )}
      </div>

      {/* Build Service Selector */}
      {buildServiceOptions.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-surface-700 bg-gray-100 dark:bg-surface-800">
          <BuildServiceSelector
            options={buildServiceOptions}
            selectedOption={selectedBuildService}
            includesBuildService={includesBuildService}
            onToggle={onToggleBuildService}
            totalPrice={priceBreakdown?.componentsTotal || 0}
            language={language}
            hasStorage={hasStorage}
          />
        </div>
      )}

      {/* Validation Status */}
      {validationResult && (
        <div className="p-4 border-t border-gray-200 dark:border-surface-700">
          {validationResult.errors.length > 0 ? (
            <div className="flex items-start gap-2 text-red-400">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium">
                  {language === 'en'
                    ? `${validationResult.errors.length} compatibility issue(s)`
                    : `${validationResult.errors.length} kompatibilitetsproblem`}
                </p>
                <p className="text-xs text-red-300">
                  {language === 'en'
                    ? 'Please fix issues before checkout'
                    : 'Vänligen åtgärda problem innan du går till kassan'}
                </p>
              </div>
            </div>
          ) : validationResult.warnings.length > 0 ? (
            <div className="flex items-start gap-2 text-yellow-400">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium">
                  {language === 'en'
                    ? `${validationResult.warnings.length} warning(s)`
                    : `${validationResult.warnings.length} varning(ar)`}
                </p>
                <p className="text-xs text-yellow-300">
                  {language === 'en'
                    ? 'Review warnings before checkout'
                    : 'Granska varningar innan du går till kassan'}
                </p>
              </div>
            </div>
          ) : selectedCount > 1 ? (
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">
                {language === 'en' ? 'All components compatible' : 'Alla komponenter kompatibla'}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="p-4 bg-gray-100 dark:bg-surface-800 border-t border-gray-200 dark:border-surface-700">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-neutral-400">
              {language === 'en' ? 'Components' : 'Komponenter'}
            </span>
            <span className="font-medium">
              {formatPrice(priceBreakdown?.componentsTotal || 0)}
            </span>
          </div>

          {includesBuildService && priceBreakdown?.buildServiceCharge && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">
                {language === 'en' ? 'Build Service' : 'Byggservice'}
              </span>
              <span className="font-medium">
                {formatPrice(priceBreakdown.buildServiceCharge)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-surface-700">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">
                {language === 'en' ? 'Total' : 'Totalt'}
              </span>
              <span className="text-lg font-bold text-green-400">
                {formatPrice(priceBreakdown?.grandTotal || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 border-t border-gray-200 dark:border-surface-700">
        <button
          onClick={onCheckout}
          disabled={!canCheckout}
          className={`
            w-full py-3 rounded-lg font-medium transition-colors
            ${canCheckout
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
            }
          `}
        >
          {language === 'en' ? 'Proceed to Checkout' : 'Gå till kassan'}
        </button>

        <button
          onClick={onSave}
          disabled={selectedCount === 0 || isSaving}
          className={`
            w-full py-2 rounded-lg font-medium transition-colors
            ${selectedCount > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
            }
          `}
        >
          {isSaving
            ? language === 'en'
              ? 'Saving...'
              : 'Sparar...'
            : language === 'en'
            ? 'Save Configuration'
            : 'Spara konfiguration'}
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onStartOver}
            className="w-full py-2 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {language === 'en' ? 'Start Over' : 'Börja om'}
          </button>
        )}

        {!isAuthenticated && (
          <p className="text-xs text-center text-gray-400 dark:text-neutral-500 mt-2">
            {language === 'en'
              ? 'Log in to save your configuration'
              : 'Logga in för att spara din konfiguration'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConfigurationSummary;
