import React from 'react';
import { Wrench, Hammer } from '../common/icons';
import { PCBuildServiceOption } from '../../models/types/pcConfiguration.types';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';
interface BuildServiceSelectorProps {
  options: PCBuildServiceOption[];
  selectedOption?: PCBuildServiceOption;
  selectedDiyOptionId?: string; // ID of DIY option if selected (to differentiate from "no selection")
  includesBuildService: boolean;
  onToggle: (enabled: boolean, optionId?: string) => void;
  totalPrice: number;
  language: string;
  hasStorage?: boolean; // Whether at least one SSD or HDD is selected - required for build service
  variant?: 'compact' | 'full';
}

const BuildServiceSelector: React.FC<BuildServiceSelectorProps> = ({
  options,
  selectedOption,
  selectedDiyOptionId,
  includesBuildService,
  onToggle,
  totalPrice,
  language,
  hasStorage = false,
  variant = 'compact',
}) => {
  const vatRate = useVatRate();

  // Separate DIY option (amount = 0) from paid build services
  const diyOption = options.find((opt) => opt.amount === 0);
  const buildServiceOptions = options.filter((opt) => opt.amount > 0 && opt.isActive);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-SE' : 'sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  // Calculate service charge based on price type
  const calculateCharge = (option: PCBuildServiceOption) => {
    if (option.priceType === 'fixed') {
      return option.amount;
    }
    // Percentage-based
    return Math.round((totalPrice * option.amount) / 100);
  };

  // Get localized content
  const getName = (option: PCBuildServiceOption) =>
    language === 'en' ? option.name_en : option.name_sv;

  const getDescription = (option: PCBuildServiceOption) =>
    language === 'en' ? option.desc_en : option.desc_sv;

  const getBuildTime = (option: PCBuildServiceOption) =>
    language === 'en' ? option.estimatedBuildTime_en : option.estimatedBuildTime_sv;

  const getWarrantyInfo = (option: PCBuildServiceOption) =>
    language === 'en' ? option.warrantyInfo_en : option.warrantyInfo_sv;

  // Check if an option is currently selected
  const isOptionSelected = (option: PCBuildServiceOption) => {
    if (option.amount === 0) {
      // DIY is selected only if explicitly chosen (not by default)
      return selectedDiyOptionId === option.id;
    }
    return includesBuildService && selectedOption?.id === option.id;
  };

  // Check if any selection has been made
  const hasSelection = !!selectedDiyOptionId || (includesBuildService && !!selectedOption);

  // Handle option selection
  const handleSelectOption = (option: PCBuildServiceOption) => {
    if (option.amount === 0) {
      // DIY option - pass the ID to track explicit selection
      onToggle(false, option.id);
    } else {
      onToggle(true, option.id);
    }
  };

  if (!diyOption && buildServiceOptions.length === 0) {
    return null;
  }

  // Full variant - for main content area
  if (variant === 'full') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Storage Required Notice */}
        {!hasStorage && (
          <div className="flex items-start sm:items-center gap-3 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 rounded-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-yellow-700 dark:text-yellow-400 text-sm sm:text-base">
                {language === 'en' ? 'Storage Required' : 'Lagring krävs'}
              </p>
              <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400/80">
                {language === 'en'
                  ? 'Please add at least one SSD or HDD to enable build service options.'
                  : 'Lägg till minst en SSD eller HDD för att aktivera byggtjänstalternativ.'}
              </p>
            </div>
          </div>
        )}

        {/* Option Cards - Full */}
        <div className="grid gap-3 sm:gap-4">
          {/* DIY Option */}
          {diyOption && (
            <button
              onClick={() => handleSelectOption(diyOption)}
              className={`
                w-full p-4 sm:p-6 rounded-lg border-2 text-left transition-all
                ${isOptionSelected(diyOption)
                  ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/30'
                  : 'border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-850 hover:border-gray-300 dark:hover:border-surface-600 hover:shadow-light-md dark:hover:shadow-dark-md'
                }
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Radio indicator */}
                  <div className={`mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isOptionSelected(diyOption) ? 'border-blue-500' : 'border-surface-600'}`}>
                    {isOptionSelected(diyOption) && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-neutral-400" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{getName(diyOption)}</h3>
                    </div>
                    {getDescription(diyOption) && (
                      <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-500 dark:text-neutral-400">{getDescription(diyOption)}</p>
                    )}
                    <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {language === 'en' ? 'Ships immediately' : 'Skickas direkt'}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {language === 'en' ? 'Components only' : 'Endast komponenter'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right pl-7 sm:pl-0 flex-shrink-0">
                  <span className="text-lg sm:text-xl font-bold text-green-400">
                    {language === 'en' ? 'Free' : 'Gratis'}
                  </span>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                    {language === 'en' ? 'No assembly' : 'Ingen montering'}
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Paid Build Service Options */}
          {buildServiceOptions.map((option) => {
            const isDisabled = !hasStorage;
            const charge = calculateCharge(option);

            return (
              <button
                key={option.id}
                onClick={() => !isDisabled && handleSelectOption(option)}
                disabled={isDisabled}
                className={`
                  w-full p-4 sm:p-6 rounded-lg border-2 text-left transition-all
                  ${isDisabled
                    ? 'border-gray-200 dark:border-surface-700 bg-gray-100 dark:bg-surface-800 opacity-60 cursor-not-allowed'
                    : isOptionSelected(option)
                    ? 'border-blue-500 bg-blue-900/20 ring-2 ring-blue-500/30'
                    : 'border-gray-200 dark:border-surface-700 bg-white dark:bg-surface-850 hover:border-gray-300 dark:hover:border-surface-600 hover:shadow-light-md dark:hover:shadow-dark-md'
                  }
                `}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Radio indicator */}
                    <div className={`mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isDisabled ? 'border-surface-600' : isOptionSelected(option) ? 'border-blue-500' : 'border-surface-600'}`}>
                      {isOptionSelected(option) && !isDisabled && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Hammer className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 dark:text-primary-400" />
                        <h3 className={`text-base sm:text-lg font-semibold ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-900 dark:text-white'}`}>
                          {getName(option)}
                        </h3>
                        {option.isDefault && (
                          <span className="px-1.5 sm:px-2 py-0.5 text-xs font-medium bg-blue-900/30 text-blue-400 rounded-full">
                            {language === 'en' ? 'Recommended' : 'Rekommenderad'}
                          </span>
                        )}
                      </div>

                      {getDescription(option) && (
                        <p className={`mt-1.5 sm:mt-2 text-sm sm:text-base ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-500 dark:text-neutral-400'}`}>
                          {getDescription(option)}
                        </p>
                      )}

                      <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        {getBuildTime(option) && (
                          <span className={`flex items-center gap-1 ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-500 dark:text-neutral-400'}`}>
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getBuildTime(option)}
                          </span>
                        )}
                        {getWarrantyInfo(option) && (
                          <span className={`flex items-center gap-1 ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-500 dark:text-neutral-400'}`}>
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {getWarrantyInfo(option)}
                          </span>
                        )}
                      </div>

                      {/* Features list */}
                      <div className={`mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-500 dark:text-neutral-400'}`}>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {language === 'en' ? 'Professional assembly' : 'Professionell montering'}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {language === 'en' ? 'Cable management' : 'Kabelhantering'}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {language === 'en' ? 'OS installation (if selected)' : 'OS-installation (om valt)'}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {language === 'en' ? 'Full stress testing' : 'Fullständig stresstest'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pl-7 sm:pl-0 flex-shrink-0">
                    <span className={`text-lg sm:text-xl font-bold ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-900 dark:text-white'}`}>
                      +{formatPrice(charge)}
                    </span>
                    {option.priceType === 'percentage' && (
                      <p className={`text-xs sm:text-sm ${isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-500 dark:text-neutral-400'}`}>
                        ({option.amount}% {language === 'en' ? 'of total' : 'av totalt'})
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Currently Selected Summary */}
        {hasSelection && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-blue-400 text-sm sm:text-base">
                {selectedDiyOptionId && diyOption
                  ? `${language === 'en' ? 'Selected: ' : 'Vald: '}${getName(diyOption)}`
                  : `${language === 'en' ? 'Selected: ' : 'Vald: '}${selectedOption ? getName(selectedOption) : ''}`
                }
              </span>
            </div>
            <span className="font-bold text-blue-400 text-sm sm:text-base pl-7 sm:pl-0">
              {selectedDiyOptionId
                ? (language === 'en' ? 'Free' : 'Gratis')
                : selectedOption ? `+${formatPrice(calculateCharge(selectedOption))}` : ''
              }
            </span>
          </div>
        )}
      </div>
    );
  }

  // Compact variant - for sidebar (default)
  return (
    <div className="space-y-2">
      {/* Storage Required Notice - Compact */}
      {!hasStorage && (
        <div className="flex items-center gap-1 p-1.5 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 rounded text-xs text-yellow-700 dark:text-yellow-400">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{language === 'en' ? 'Add SSD/HDD for build service' : 'Lägg till SSD/HDD för byggtjänst'}</span>
        </div>
      )}

      {/* Option Cards - Compact */}
      <div className="space-y-1">
        {/* DIY Option */}
        {diyOption && (
          <button
            onClick={() => handleSelectOption(diyOption)}
            className={`
              w-full p-2 rounded border text-left transition-all text-xs
              ${isOptionSelected(diyOption)
                ? 'border-blue-500 bg-blue-900/30 text-white'
                : 'border-gray-200 dark:border-surface-700 bg-gray-100 dark:bg-surface-800 text-gray-700 dark:text-neutral-300 hover:border-gray-300 dark:hover:border-surface-600'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isOptionSelected(diyOption) ? 'border-blue-500' : 'border-surface-600'}`}>
                  {isOptionSelected(diyOption) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>
                <span className="font-medium">{getName(diyOption)}</span>
              </div>
              <span className="text-green-400 font-semibold">{language === 'en' ? 'Free' : 'Gratis'}</span>
            </div>
          </button>
        )}

        {/* Paid Build Service Options - Compact */}
        {buildServiceOptions.map((option) => {
          const isDisabled = !hasStorage;
          return (
            <button
              key={option.id}
              onClick={() => !isDisabled && handleSelectOption(option)}
              disabled={isDisabled}
              className={`
                w-full p-2 rounded border text-left transition-all text-xs
                ${isDisabled
                  ? 'border-gray-200 dark:border-surface-700 bg-gray-100/50 dark:bg-surface-800/50 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                  : isOptionSelected(option)
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-gray-200 dark:border-surface-700 bg-gray-100 dark:bg-surface-800 text-gray-700 dark:text-neutral-300 hover:border-gray-300 dark:hover:border-surface-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isDisabled ? 'border-surface-600' : isOptionSelected(option) ? 'border-blue-500' : 'border-surface-600'}`}>
                    {isOptionSelected(option) && !isDisabled && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                  <span className="font-medium truncate">{getName(option)}</span>
                </div>
                <span className={isDisabled ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-700 dark:text-neutral-300'}>+{formatPrice(calculateCharge(option))}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Currently Selected Summary - Compact */}
      {hasSelection && (
        <div className="bg-blue-900/30 rounded p-1.5 flex items-center justify-between text-xs">
          <span className="text-blue-300 truncate">
            {selectedDiyOptionId && diyOption
              ? getName(diyOption)
              : selectedOption ? getName(selectedOption) : ''
            }
          </span>
          <span className="font-semibold text-blue-300">
            {selectedDiyOptionId
              ? (language === 'en' ? 'Free' : 'Gratis')
              : selectedOption ? `+${formatPrice(calculateCharge(selectedOption))}` : ''
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default BuildServiceSelector;
