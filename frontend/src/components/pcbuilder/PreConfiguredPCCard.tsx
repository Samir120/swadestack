import React from 'react';
import { Link } from 'react-router-dom';
import { PCConfiguration, PCTier } from '../../models/types/pcConfiguration.types';
import { FaImages } from 'react-icons/fa';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

interface PreConfiguredPCCardProps {
  pc: PCConfiguration;
  language: 'en' | 'sv';
}

// Tier badge colors
const TIER_COLORS: Record<PCTier, { bg: string; text: string }> = {
  core: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  pro: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  ultra: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  custom: { bg: 'bg-primary-600/20', text: 'text-primary-600 dark:text-primary-400' },
};

// Tier labels
const TIER_LABELS: Record<PCTier, { en: string; sv: string }> = {
  core: { en: 'Core', sv: 'Core' },
  pro: { en: 'Pro', sv: 'Pro' },
  ultra: { en: 'Ultra', sv: 'Ultra' },
  custom: { en: 'Custom', sv: 'Custom' },
};

const PreConfiguredPCCard: React.FC<PreConfiguredPCCardProps> = ({ pc, language }) => {
  const vatRate = useVatRate();
  const name = language === 'en' ? pc.name_en : pc.name_sv;
  const hasDiscount = pc.discountedPrice && pc.discountedPrice < pc.totalPrice;
  const componentPrice = hasDiscount ? pc.discountedPrice : pc.totalPrice;
  const buildServiceCharge = pc.includesBuildService ? (pc.buildServiceCharge || 0) : 0;
  const grandTotal = (componentPrice || 0) + buildServiceCharge;
  // Original total for strikethrough (components + build service at full price)
  const originalTotal = pc.totalPrice + buildServiceCharge;
  const tierColors = pc.tier ? TIER_COLORS[pc.tier] : null;
  const tierLabel = pc.tier ? TIER_LABELS[pc.tier][language] : null;

  // Extract key specs from components for display
  const getKeySpecs = () => {
    const specs: string[] = [];

    if (pc.components.cpu) {
      const cpuName = language === 'en' ? pc.components.cpu.name_en : pc.components.cpu.name_sv;
      const shortCpu = cpuName?.split(' ').slice(0, 4).join(' ') || '';
      if (shortCpu) specs.push(shortCpu);
    }

    if (pc.components.gpus && pc.components.gpus.length > 0) {
      const gpu = pc.components.gpus[0];
      const gpuName = language === 'en' ? gpu.name_en : gpu.name_sv;
      const shortGpu = gpuName?.split(' ').slice(0, 3).join(' ') || '';
      if (shortGpu) specs.push(shortGpu);
    }

    if (pc.components.rams && pc.components.rams.length > 0) {
      const ramSpec = pc.components.rams[0].specifications as any;
      if (ramSpec?.capacity) {
        const totalRam = pc.components.rams.reduce((sum, ram) => {
          const spec = ram.specifications as any;
          return sum + (spec?.capacity || 0);
        }, 0);
        specs.push(`${totalRam}GB RAM`);
      }
    }

    // Calculate total storage
    let totalStorage = 0;
    let storageType = 'SSD';
    if (pc.components.ssds && pc.components.ssds.length > 0) {
      pc.components.ssds.forEach(ssd => {
        const spec = ssd.specifications as any;
        totalStorage += spec?.capacity || 0;
      });
    }
    if (pc.components.hdds && pc.components.hdds.length > 0) {
      pc.components.hdds.forEach(hdd => {
        const spec = hdd.specifications as any;
        totalStorage += spec?.capacity || 0;
      });
      if (!pc.components.ssds?.length) storageType = 'HDD';
    }
    if (totalStorage > 0) {
      const storageStr = totalStorage >= 1000 ? `${totalStorage / 1000}TB` : `${totalStorage}GB`;
      specs.push(`${storageStr} ${storageType}`);
    }

    return specs;
  };

  const keySpecs = getKeySpecs();

  // Get display image
  const getDisplayImage = (): string | undefined => {
    if (pc.imageUrls && pc.imageUrls.length > 0) {
      return pc.imageUrls[0];
    }
    return pc.imageUrl;
  };

  const displayImage = getDisplayImage();
  const imageCount = pc.imageUrls?.length || (pc.imageUrl ? 1 : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: pc.currency || 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  return (
    <Link
      to={`/pre-configured-pcs/${pc.id}`}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800/50 hover:-translate-y-1 hover:shadow-lg shadow-sm transition-all duration-300 flex flex-col h-full w-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-surface-800 p-4 overflow-hidden">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{Math.round(((pc.totalPrice - pc.discountedPrice!) / pc.totalPrice) * 100)}%
            </span>
          </div>
        )}

        {/* Tier Badge */}
        {tierColors && tierLabel && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`rounded-full text-xs font-semibold px-3 py-1 ${tierColors.bg} ${tierColors.text}`}>
              {tierLabel}
            </span>
          </div>
        )}

        {/* PC Image */}
        {displayImage ? (
          <>
            <img
              src={displayImage}
              alt={name || 'Pre-configured PC'}
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {/* Multi-image indicator */}
            {imageCount > 1 && (
              <div className="absolute bottom-3 right-3 z-10 px-2 py-1 bg-black bg-opacity-60 text-white text-xs font-bold rounded-full flex items-center gap-1">
                <FaImages size={10} />
                {imageCount}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name || `${language === 'en' ? 'Pre-configured PC' : 'Förkonfigurerad dator'}`}
        </h3>

        {/* Key Specs */}
        {keySpecs.length > 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
            {keySpecs.join(' \u00B7 ')}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 dark:text-slate-500 line-through text-sm">
                {formatPrice(originalTotal)}
              </span>
              <span className="text-red-600 font-bold text-xl">
                {formatPrice(grandTotal)}
              </span>
            </div>
          ) : (
            <span className="text-gray-900 dark:text-white font-bold text-xl">
              {formatPrice(grandTotal)}
            </span>
          )}

          {/* Build service indicator */}
          {pc.includesBuildService && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium px-3 py-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'en' ? 'Build service included' : 'Byggservice ingår'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PreConfiguredPCCard;
