import React from 'react';
import { Zap, Lightbulb } from 'lucide-react';
import { PowerSummary } from '../../models/types/validation.types';
interface PowerConsumptionGaugeProps {
  powerSummary: PowerSummary;
  language: string;
}

const PowerConsumptionGauge: React.FC<PowerConsumptionGaugeProps> = ({
  powerSummary,
  language,
}) => {
  // Safely destructure with defaults for optional fields
  const {
    totalDraw = 0,
    psuWattage = 0,
    headroom = 0,
    headroomPercentage: headroomPct,
    percentage, // Alternative name from backend
    recommendedWattage = 0,
    componentBreakdown,
  } = powerSummary || {};

  // Use headroomPercentage or percentage (backend uses 'percentage')
  const headroomPercentage = headroomPct ?? percentage ?? 0;

  // Early return if no valid power data (no PSU selected)
  if (!powerSummary || psuWattage === 0) {
    return null;
  }

  // Calculate percentage of PSU capacity used
  const usagePercentage = psuWattage > 0 ? (totalDraw / psuWattage) * 100 : 0;

  // Determine status color
  const getStatusColor = () => {
    if (usagePercentage > 100) return 'red'; // Over capacity
    if (usagePercentage > 80) return 'yellow'; // Warning zone (>80%)
    if (usagePercentage > 60) return 'green'; // Good zone (60-80%)
    return 'blue'; // Excellent headroom (<60%)
  };

  const statusColor = getStatusColor();

  // Color classes
  const colorClasses = {
    red: {
      bg: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      lightBg: 'bg-red-100 dark:bg-red-900/20',
      border: 'border-red-300 dark:border-red-500/30',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400',
      lightBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      border: 'border-yellow-300 dark:border-yellow-500/30',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
      lightBg: 'bg-green-100 dark:bg-green-900/20',
      border: 'border-green-300 dark:border-green-500/30',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      lightBg: 'bg-blue-100 dark:bg-blue-900/20',
      border: 'border-blue-300 dark:border-blue-500/30',
    },
  };

  const colors = colorClasses[statusColor];

  // Get status message
  const getStatusMessage = () => {
    if (usagePercentage > 100) {
      return language === 'en'
        ? 'PSU is insufficient! Upgrade recommended.'
        : 'PSU är otillräcklig! Uppgradering rekommenderas.';
    }
    if (usagePercentage > 80) {
      return language === 'en'
        ? 'Power headroom is low. Consider a larger PSU.'
        : 'Effektmarginal är låg. Överväg en större PSU.';
    }
    if (usagePercentage > 60) {
      return language === 'en'
        ? 'Good power headroom for stable operation.'
        : 'Bra effektmarginal för stabil drift.';
    }
    return language === 'en'
      ? 'Excellent power headroom.'
      : 'Utmärkt effektmarginal.';
  };

  return (
    <div className="bg-white dark:bg-surface-850 rounded-xl border border-gray-200 dark:border-surface-700 p-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        {language === 'en' ? 'Power Consumption' : 'Strömförbrukning'}
      </h4>

      {/* Main Gauge */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-4 bg-gray-200 dark:bg-surface-700 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className={`h-full ${colors.bg} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />

          {/* 80% Warning Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neutral-500"
            style={{ left: '80%' }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-neutral-400">
          <span>0W</span>
          <span>{psuWattage}W</span>
        </div>
      </div>

      {/* Power Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={`p-2 rounded ${colors.lightBg}`}>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {language === 'en' ? 'System Draw' : 'Systemförbrukning'}
          </p>
          <p className={`text-lg font-bold ${colors.text}`}>{totalDraw}W</p>
        </div>
        <div className="p-2 rounded bg-gray-100 dark:bg-surface-800">
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {language === 'en' ? 'PSU Capacity' : 'PSU-kapacitet'}
          </p>
          <p className="text-lg font-bold text-gray-700 dark:text-neutral-300">{psuWattage}W</p>
        </div>
      </div>

      {/* Headroom */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-neutral-400">
          {language === 'en' ? 'Headroom:' : 'Marginal:'}
        </span>
        <span className={`font-semibold ${headroom >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {headroom >= 0 ? '+' : ''}{headroom}W
          {headroomPercentage ? ` (${Math.round(headroomPercentage)}%)` : ''}
        </span>
      </div>

      {/* Status Message */}
      <div className={`mt-3 p-2 rounded ${colors.lightBg} border ${colors.border}`}>
        <p className={`text-xs ${colors.text}`}>{getStatusMessage()}</p>
      </div>

      {/* Component Breakdown (Collapsible) - only show if breakdown data exists */}
      {componentBreakdown && (
        <details className="mt-3">
          <summary className="text-xs text-gray-500 dark:text-neutral-400 cursor-pointer hover:text-gray-700 dark:hover:text-neutral-300">
            {language === 'en' ? 'Show breakdown' : 'Visa uppdelning'}
          </summary>
          <div className="mt-2 space-y-1 text-xs">
            {componentBreakdown.cpu > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">CPU</span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.cpu}W</span>
              </div>
            )}
            {componentBreakdown.gpu && componentBreakdown.gpu > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">GPU</span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.gpu}W</span>
              </div>
            )}
            {componentBreakdown.motherboard > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">
                  {language === 'en' ? 'Motherboard' : 'Moderkort'}
                </span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.motherboard}W</span>
              </div>
            )}
            {componentBreakdown.ram > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">RAM</span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.ram}W</span>
              </div>
            )}
            {componentBreakdown.storage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">
                  {language === 'en' ? 'Storage' : 'Lagring'}
                </span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.storage}W</span>
              </div>
            )}
            {componentBreakdown.cooling > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-neutral-400">
                  {language === 'en' ? 'Cooling' : 'Kylning'}
                </span>
                <span className="text-gray-700 dark:text-neutral-300">{componentBreakdown.cooling}W</span>
              </div>
            )}
            <div className="pt-1 border-t border-gray-200 dark:border-surface-700 font-medium flex justify-between">
              <span className="text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Total' : 'Totalt'}</span>
              <span className="text-gray-700 dark:text-neutral-300">{totalDraw}W</span>
            </div>
          </div>
        </details>
      )}

      {/* Recommendation */}
      {recommendedWattage > psuWattage && (
        <p className="mt-3 text-xs text-orange-400 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
          {language === 'en'
            ? `Recommended PSU: ${recommendedWattage}W or higher`
            : `Rekommenderad PSU: ${recommendedWattage}W eller högre`}
        </p>
      )}
    </div>
  );
};

export default PowerConsumptionGauge;
