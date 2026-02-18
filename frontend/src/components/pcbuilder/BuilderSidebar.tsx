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
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  HardDrive,
  Database,
  Zap,
  Server,
  Fan,
  Disc,
  AppWindow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

/**
 * Builder Sidebar Component
 * Dark vertical sidebar with component categories and inline selections
 * Styled similar to inet.se PC builder
 */

interface BuilderSidebarProps {
  selectedComponents: SelectedComponents;
  priceBreakdown: PriceBreakdown | null;
  validationResult: ValidationResult | null;
  includesBuildService: boolean;
  buildServiceOptions: PCBuildServiceOption[];
  selectedBuildService?: PCBuildServiceOption;
  selectedDiyOptionId?: string; // Track when DIY is explicitly selected
  onToggleBuildService: (enabled: boolean, optionId?: string) => void;
  onRemoveComponent: (componentType: ComponentType) => void;
  onRemoveMultiSelectComponent?: (componentType: 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', slotIndex: number) => void;
  onCategoryClick: (componentType: ComponentType) => void;
  onBuildServiceClick: () => void;
  isBuildServiceView: boolean;
  onAddMore?: (componentType: ComponentType) => void;
  onSave: () => void;
  onCheckout: () => void;
  onStartOver: () => void;
  currentStep: number;
  componentSteps: { type: ComponentType; labelKey: string; required: boolean; multiSelect?: boolean; conditionallyRequired?: boolean }[];
  isAuthenticated: boolean;
  isSaving: boolean;
  language: string;
  availableSlots?: Record<string, number>;
}

// Component type icons
const COMPONENT_ICONS: Record<ComponentType, LucideIcon> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  gpu: MonitorPlay,
  ssd: HardDrive,
  hdd: Database,
  psu: Zap,
  case: Server,
  cooling: Fan,
  optical: Disc,
  fan: Fan,
  os: AppWindow,
};

// Component type labels
const COMPONENT_LABELS: Record<ComponentType, { en: string; sv: string }> = {
  cpu: { en: 'Processor', sv: 'Processor' },
  motherboard: { en: 'Motherboard', sv: 'Moderkort' },
  ram: { en: 'Memory (RAM)', sv: 'Internminne (RAM)' },
  gpu: { en: 'Graphics Card', sv: 'Grafikkort' },
  ssd: { en: 'SSD Storage', sv: 'Hårddisk SSD' },
  hdd: { en: 'HDD Storage', sv: 'Hårddisk HDD' },
  psu: { en: 'Power Supply', sv: 'Nätaggregat' },
  case: { en: 'Case', sv: 'Chassi' },
  cooling: { en: 'CPU Cooler', sv: 'CPU Kylare' },
  optical: { en: 'Optical Drive', sv: 'Optisk Enhet' },
  fan: { en: 'Case Fans', sv: 'Chassifläktar' },
  os: { en: 'Operating System', sv: 'Operativsystem' },
};

const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  selectedComponents,
  priceBreakdown,
  validationResult,
  includesBuildService,
  buildServiceOptions,
  selectedBuildService,
  selectedDiyOptionId,
  onToggleBuildService: _onToggleBuildService,
  onRemoveComponent,
  onRemoveMultiSelectComponent,
  onCategoryClick,
  onBuildServiceClick,
  isBuildServiceView,
  onAddMore,
  onSave,
  onCheckout,
  onStartOver,
  currentStep,
  componentSteps,
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

  // Check if a step has selection
  const hasSelection = (type: ComponentType, isMultiSelect?: boolean): boolean => {
    if (isMultiSelect) {
      return getMultiSelectComponents(type).length > 0;
    }
    return !!getSingleComponent(type);
  };

  // Check if can add more
  const canAddMore = (type: ComponentType): boolean => {
    const slots = availableSlots[type] ?? 0;
    return slots > 0;
  };

  // Count selected components
  const countSelectedComponents = () => {
    let count = 0;
    componentSteps.forEach(({ type, multiSelect }) => {
      if (hasSelection(type, multiSelect)) count++;
    });
    return count;
  };

  // Check if all required components are selected
  const hasRequiredComponents = () => {
    const hasCpu = !!getSingleComponent('cpu');
    const hasMotherboard = !!getSingleComponent('motherboard');
    const hasRam = getMultiSelectComponents('ram').length > 0;
    const hasPsu = !!getSingleComponent('psu');
    const hasCase = !!getSingleComponent('case');
    return hasCpu && hasMotherboard && hasRam && hasPsu && hasCase;
  };

  // Check if a build service option has been selected (DIY or paid service)
  const hasBuildServiceSelection = !!selectedDiyOptionId || (includesBuildService && !!selectedBuildService);

  const selectedCount = countSelectedComponents();
  const canCheckout = validationResult?.isValid && hasRequiredComponents() && hasBuildServiceSelection;

  // Render category item
  const renderCategory = (step: typeof componentSteps[0], index: number) => {
    const { type, required, multiSelect, conditionallyRequired } = step;
    const isActive = index === currentStep;
    const hasComponents = hasSelection(type, multiSelect);
    const label = language === 'en' ? COMPONENT_LABELS[type].en : COMPONENT_LABELS[type].sv;

    return (
      <div key={type} className="border-b border-gray-100 dark:border-surface-800 last:border-b-0">
        {/* Category Header */}
        <button
          onClick={() => onCategoryClick(type)}
          className={`
            w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200 relative
            ${isActive
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-[3px] border-l-primary-500'
              : hasComponents
                ? 'text-gray-800 dark:text-white hover:bg-white dark:hover:bg-surface-800'
                : 'text-gray-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-surface-800'
            }
          `}
        >
          {/* Icon */}
          {React.createElement(COMPONENT_ICONS[type], { size: 18, strokeWidth: 1.5, className: `w-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : hasComponents ? 'text-gray-500 dark:text-neutral-400' : 'text-gray-400 dark:text-neutral-500'}` })}

          {/* Label */}
          <span className="flex-1 font-medium text-sm">{label}</span>

          {/* Required/Conditional Asterisk */}
          {required && !hasComponents && (
            <span className="text-red-400 text-xs font-semibold" title={language === 'en' ? 'Required' : 'Obligatorisk'}>*</span>
          )}
          {conditionallyRequired && !required && !hasComponents && (
            <span className="text-yellow-500 text-xs font-semibold" title={language === 'en' ? 'Required for build service' : 'Krävs för byggservice'}>*</span>
          )}

          {/* Checkmark for completed */}
          {hasComponents && (
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Selected Components */}
        {hasComponents && (
          <div className="px-4 py-2 space-y-1.5">
            {multiSelect ? (
              // Multi-select components
              <>
                {getMultiSelectComponents(type).map((component) => (
                  <div
                    key={`${component.id}-${component.slotIndex}`}
                    className="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg p-2 border border-gray-100 dark:border-surface-700"
                  >
                    <img
                      src={getComponentImageSrc(component.imageUrl, component.componentType || type)}
                      alt=""
                      className="w-9 h-9 object-contain rounded-md bg-gray-50 dark:bg-surface-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-800 dark:text-neutral-200 truncate">
                        {getComponentName(component)}
                      </p>
                      <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{formatPrice(component.price)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMultiSelectComponent?.(type as 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan', component.slotIndex);
                      }}
                      className="text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 p-1 transition-colors"
                      title={language === 'en' ? 'Remove' : 'Ta bort'}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                {canAddMore(type) && onAddMore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMore(type);
                    }}
                    className="w-full py-1.5 text-[11px] text-primary-600 dark:text-primary-400 hover:text-primary-500 flex items-center justify-center gap-1 border border-dashed border-gray-200 dark:border-surface-600 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {language === 'en' ? 'Add more' : 'Lägg till fler'}
                  </button>
                )}
              </>
            ) : (
              // Single-select component
              <>
                {(() => {
                  const component = getSingleComponent(type);
                  if (!component) return null;
                  return (
                    <div className="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg p-2 border border-gray-100 dark:border-surface-700">
                      <img
                        src={getComponentImageSrc(component.imageUrl, component.componentType || type)}
                        alt=""
                        className="w-9 h-9 object-contain rounded-md bg-gray-50 dark:bg-surface-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-gray-800 dark:text-neutral-200 truncate">
                          {getComponentName(component)}
                        </p>
                        <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{formatPrice(component.price)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveComponent(type);
                        }}
                        className="text-gray-300 dark:text-neutral-600 hover:text-red-400 dark:hover:text-red-400 p-1 transition-colors"
                        title={language === 'en' ? 'Remove' : 'Ta bort'}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-surface-900/80 border-r border-gray-200 dark:border-surface-700 overflow-hidden flex flex-col h-full">
      {/* Header with Total Price and Action Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-surface-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-gray-400 dark:text-neutral-500">
            {language === 'en' ? 'PC Builder' : 'Datorbyggare'}
          </h2>
        </div>

        {/* Total Price Display */}
        <div className="bg-white dark:bg-surface-850 rounded-xl p-3 border border-gray-200 dark:border-surface-700 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500 font-medium">
            {language === 'en' ? 'Total' : 'Totalt'}
          </span>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">
            {formatPrice(priceBreakdown?.grandTotal || 0)}
          </p>
        </div>

        {/* Validation Status Compact */}
        {validationResult && validationResult.errors.length > 0 && (
          <div className="mb-3 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationResult.errors.length} {language === 'en' ? 'issue(s)' : 'problem'}
          </div>
        )}

        {/* Action Buttons - Side by Side */}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={selectedCount === 0 || isSaving}
            className={`
              flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200 text-xs border
              ${selectedCount > 0
                ? 'border-gray-300 dark:border-surface-600 text-gray-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-surface-700 hover:border-primary-500/30 active:scale-[0.97]'
                : 'border-gray-200 dark:border-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
              }
            `}
          >
            {isSaving
              ? language === 'en' ? 'Saving...' : 'Sparar...'
              : language === 'en' ? 'Save' : 'Spara'}
          </button>

          <button
            onClick={onCheckout}
            disabled={!canCheckout}
            className={`
              flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200
              ${canCheckout
                ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm hover:shadow-md active:scale-[0.97]'
                : 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
              }
            `}
          >
            {language === 'en' ? 'Complete' : 'Slutför'}
          </button>
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-center text-gray-400 dark:text-neutral-500 mt-2.5">
            {language === 'en'
              ? 'Log in to save'
              : 'Logga in för att spara'}
          </p>
        )}
      </div>

      {/* Component Categories - Takes priority, scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {componentSteps.map((step, index) => renderCategory(step, index))}

        {/* Build Service as last category item - REQUIRED */}
        {buildServiceOptions.length > 0 && (
          <div className="border-b border-gray-100 dark:border-surface-800 last:border-b-0">
            {/* Build Service Header - Clickable */}
            <button
              onClick={onBuildServiceClick}
              className={`
                w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all duration-200 relative
                ${isBuildServiceView
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-[3px] border-l-primary-500'
                  : hasBuildServiceSelection
                    ? 'text-gray-800 dark:text-white hover:bg-white dark:hover:bg-surface-800'
                    : 'text-gray-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-surface-800'
                }
              `}
            >
              <Wrench size={18} strokeWidth={1.5} className={`w-5 flex-shrink-0 ${isBuildServiceView ? 'text-primary-600 dark:text-primary-400' : hasBuildServiceSelection ? 'text-gray-500 dark:text-neutral-400' : 'text-gray-400 dark:text-neutral-500'}`} />
              <span className="flex-1 font-medium text-sm">
                {language === 'en' ? 'Build Service' : 'Byggservice'}
              </span>

              {/* Required asterisk when no selection made */}
              {!hasBuildServiceSelection && (
                <span className="text-red-400 text-xs font-semibold" title={language === 'en' ? 'Required' : 'Obligatorisk'}>*</span>
              )}

              {/* Checkmark when selection is made */}
              {hasBuildServiceSelection && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Selected Build Service - Show inline summary */}
            {hasBuildServiceSelection && (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 bg-white dark:bg-surface-800 rounded-lg p-2 border border-gray-100 dark:border-surface-700">
                  <div className="flex-1 min-w-0">
                    {/* DIY selected */}
                    {selectedDiyOptionId && !includesBuildService && (
                      <>
                        <p className="text-[11px] font-medium text-gray-800 dark:text-neutral-200 truncate">
                          {language === 'en' ? 'DIY (Do It Yourself)' : 'DIY (Gör det själv)'}
                        </p>
                        <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                          {language === 'en' ? 'Free' : 'Gratis'}
                        </p>
                      </>
                    )}
                    {/* Paid service selected */}
                    {includesBuildService && selectedBuildService && (
                      <>
                        <p className="text-[11px] font-medium text-gray-800 dark:text-neutral-200 truncate">
                          {language === 'en' ? selectedBuildService.name_en : selectedBuildService.name_sv}
                        </p>
                        <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                          +{formatPrice(selectedBuildService.priceType === 'fixed'
                            ? selectedBuildService.amount
                            : Math.round((priceBreakdown?.componentsTotal || 0) * selectedBuildService.amount / 100))}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Button - At Bottom */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-surface-700">
        <button
          onClick={onStartOver}
          disabled={selectedCount === 0}
          className="w-full py-1.5 text-xs text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-gray-400 dark:disabled:hover:text-neutral-500"
        >
          {language === 'en' ? 'Clear All Components' : 'Rensa alla komponenter'}
        </button>
      </div>
    </div>
  );
};

export default BuilderSidebar;
