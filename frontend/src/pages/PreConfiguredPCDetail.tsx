import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPreConfiguredPCById,
  clearCurrentPC,
} from '../store/slices/preConfiguredPCSlice';
import { toggleCart } from '../store/slices/uiSlice';
import { useCartViewModel } from '../viewmodels/cartViewModel';
import { PCTier } from '../models/types/pcConfiguration.types';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';
import { motion, AnimatePresence } from 'framer-motion';
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
  ListChecks,
  Wrench,
  Expand,
  Clock,
  ShieldCheck,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
// Tier badge colors
const TIER_COLORS: Record<PCTier, { bg: string; text: string; border: string; iconBg: string }> = {
  core: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800/50',
    iconBg: 'bg-green-500',
  },
  pro: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/50',
    iconBg: 'bg-blue-500',
  },
  ultra: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/50',
    iconBg: 'bg-purple-500',
  },
  custom: {
    bg: 'bg-primary-50 dark:bg-primary-600/10',
    text: 'text-primary-600 dark:text-primary-400',
    border: 'border-primary-200 dark:border-primary-500/30',
    iconBg: 'bg-primary-500',
  },
};

// Component type config with Lucide icons and accent colors
const COMPONENT_CONFIG: Record<string, { en: string; sv: string; icon: LucideIcon; color: string }> = {
  cpu: { en: 'Processor', sv: 'Processor', icon: Cpu, color: 'bg-blue-500' },
  motherboard: { en: 'Motherboard', sv: 'Moderkort', icon: CircuitBoard, color: 'bg-emerald-500' },
  rams: { en: 'Memory (RAM)', sv: 'Minne (RAM)', icon: MemoryStick, color: 'bg-violet-500' },
  gpus: { en: 'Graphics Card', sv: 'Grafikkort', icon: MonitorPlay, color: 'bg-red-500' },
  ssds: { en: 'SSD Storage', sv: 'SSD Lagring', icon: HardDrive, color: 'bg-amber-500' },
  hdds: { en: 'HDD Storage', sv: 'HDD Lagring', icon: Database, color: 'bg-orange-500' },
  psu: { en: 'Power Supply', sv: 'Nätaggregat', icon: Zap, color: 'bg-yellow-500' },
  case: { en: 'Case', sv: 'Chassi', icon: Server, color: 'bg-slate-500' },
  cooling: { en: 'CPU Cooler', sv: 'CPU-kylare', icon: Fan, color: 'bg-cyan-500' },
  optical: { en: 'Optical Drive', sv: 'Optisk enhet', icon: Disc, color: 'bg-pink-500' },
  fans: { en: 'Case Fans', sv: 'Chassifläktar', icon: Fan, color: 'bg-teal-500' },
  os: { en: 'Operating System', sv: 'Operativsystem', icon: AppWindow, color: 'bg-indigo-500' },
};

// Specification groups for organized layout
const SPEC_GROUPS = [
  { key: 'core', en: 'Core Components', sv: 'Kärnkomponenter', types: ['cpu', 'motherboard', 'rams', 'gpus'] },
  { key: 'storage', en: 'Storage', sv: 'Lagring', types: ['ssds', 'hdds'] },
  { key: 'infra', en: 'Infrastructure', sv: 'Infrastruktur', types: ['psu', 'case', 'cooling', 'fans'] },
  { key: 'software', en: 'Software', sv: 'Programvara', types: ['optical', 'os'] },
];

const PreConfiguredPCDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const vatRate = useVatRate();

  const language = useAppSelector((state) => state.ui.language) as 'en' | 'sv';
  const { currentPC, isCurrentLoading, currentError } = useAppSelector(
    (state) => state.preConfiguredPC
  );
  const { addPCToCart, isPCInCart } = useCartViewModel();

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const navDirection = useRef(0); // 1 = forward, -1 = backward

  // Touch/swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Get all images (imageUrls array or fall back to imageUrl)
  const getAllImages = useCallback((): string[] => {
    if (!currentPC) return [];
    if (currentPC.imageUrls && currentPC.imageUrls.length > 0) {
      return currentPC.imageUrls;
    }
    if (currentPC.imageUrl) {
      return [currentPC.imageUrl];
    }
    return [];
  }, [currentPC]);

  // Navigate to next/previous image
  const goToNextImage = useCallback(() => {
    const images = getAllImages();
    navDirection.current = 1;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  }, [getAllImages]);

  const goToPrevImage = useCallback(() => {
    const images = getAllImages();
    navDirection.current = -1;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [getAllImages]);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') goToNextImage();
      if (e.key === 'ArrowLeft') goToPrevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // Non-passive touchmove to prevent page scroll during horizontal image swipe
  useEffect(() => {
    const el = imageContainerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (getAllImages().length <= 1) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (isHorizontalSwipe.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      }
      if (isHorizontalSwipe.current) {
        e.preventDefault();
      }
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [getAllImages]);

  // Touch handlers for image swipe navigation
  const handleImageTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = null;
  }, []);

  const handleImageTouchMove = useCallback((e: React.TouchEvent) => {
    if (getAllImages().length <= 1) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (isHorizontalSwipe.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }
  }, [getAllImages]);

  const handleImageTouchEnd = useCallback((e: React.TouchEvent) => {
    if (getAllImages().length <= 1 || !isHorizontalSwipe.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dx) / elapsed;
    if (velocity > 0.25 || Math.abs(dx) > 50) {
      if (dx < 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  }, [getAllImages, goToNextImage, goToPrevImage]);

  // Load PC details
  useEffect(() => {
    if (id) {
      dispatch(fetchPreConfiguredPCById(id));
    }
    return () => {
      dispatch(clearCurrentPC());
    };
  }, [dispatch, id]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!currentPC) return;
    if (currentPC.stock === 0) return;

    if (isPCInCart(currentPC.id)) {
      dispatch(toggleCart());
      return;
    }

    addPCToCart(currentPC);
    toast.success(
      language === 'en' ? 'Added to cart!' : 'Tillagd i kundvagnen!'
    );
    dispatch(toggleCart());
  };

  const pcAlreadyInCart = currentPC ? isPCInCart(currentPC.id) : false;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currentPC?.currency || 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  // Get components for a given type key
  const getComponentItems = (key: string): any[] | null => {
    if (!currentPC?.components) return null;
    const value = (currentPC.components as any)[key];
    if (!value) return null;
    const items = Array.isArray(value) ? value : [value];
    if (items.length === 0 || !items[0]) return null;
    return items;
  };

  // Check if a group has any components
  const groupHasComponents = (types: string[]) => {
    return types.some((key) => getComponentItems(key) !== null);
  };

  if (isCurrentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner />
            <span className="text-gray-500 dark:text-neutral-400 text-sm">
              {language === 'en' ? 'Loading configuration...' : 'Laddar konfiguration...'}
            </span>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  if (currentError || !currentPC) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex flex-col">
        <Header />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <motion.div
            className="text-center bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700 p-10 mx-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-gray-500 dark:text-neutral-400 mb-6">
              {currentError || (language === 'en' ? 'PC not found' : 'Datorn hittades inte')}
            </p>
            <Link
              to="/pre-configured-pcs"
              className="px-6 py-3 bg-primary-600 text-white rounded-full font-bold hover:bg-primary-500 active:scale-[0.98] transition-all"
            >
              {language === 'en' ? 'Back to list' : 'Tillbaka till listan'}
            </Link>
          </motion.div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  const name = language === 'en' ? currentPC.name_en : currentPC.name_sv;
  const shortDesc = language === 'en' ? currentPC.shortDescription_en : currentPC.shortDescription_sv;
  const hasDiscount = currentPC.discountedPrice && currentPC.discountedPrice < currentPC.totalPrice;
  const componentPrice = hasDiscount ? currentPC.discountedPrice : currentPC.totalPrice;
  const buildServiceCharge = currentPC.includesBuildService ? (currentPC.buildServiceCharge || 0) : 0;
  const grandTotal = (componentPrice || 0) + buildServiceCharge;
  const tierColors = currentPC.tier ? TIER_COLORS[currentPC.tier] : null;
  const images = getAllImages();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-surface-950 dark:text-neutral-200 font-sans relative flex flex-col">
      {/* Ambient Dark Mode Background */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-950 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-accent-500/3 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="flex-1 pt-20 relative z-[1]">
        {/* Breadcrumb */}
        <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-surface-700/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center text-sm text-gray-400 dark:text-neutral-500 flex-wrap">
              <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline underline-offset-4 transition-colors">
                {language === 'en' ? 'Home' : 'Hem'}
              </Link>
              <svg className="w-3.5 h-3.5 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link to="/pre-configured-pcs" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline underline-offset-4 transition-colors">
                {language === 'en' ? 'Pre-Built PCs' : 'Färdigbyggda datorer'}
              </Link>
              <svg className="w-3.5 h-3.5 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-700 dark:text-neutral-300 font-medium truncate max-w-[200px]">
                {name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700/50 overflow-hidden sticky top-24 shadow-sm">
                {/* Main Image */}
                <div ref={imageContainerRef} className="relative group bg-gray-50 dark:bg-surface-800 p-6 sm:p-10" onTouchStart={handleImageTouchStart} onTouchEnd={handleImageTouchEnd}>
                  {/* Badges - top left */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    {tierColors && currentPC.tier && (
                      <span className={`px-3 py-1.5 ${tierColors.bg} ${tierColors.text} border ${tierColors.border} text-xs font-medium rounded-full backdrop-blur-sm shadow-sm`}>
                        {currentPC.tier.charAt(0).toUpperCase() + currentPC.tier.slice(1)}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="px-3 py-1.5 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-sm">
                        -{Math.round(((currentPC.totalPrice - currentPC.discountedPrice!) / currentPC.totalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Expand button */}
                  {images.length > 0 && (
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute top-4 right-4 z-10 p-2.5 bg-black/40 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 shadow-sm"
                      title={language === 'en' ? 'View larger' : 'Visa större'}
                    >
                      <Expand size={16} />
                    </button>
                  )}

                  {/* Image with AnimatePresence */}
                  <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                      <motion.img
                        key={selectedImageIndex}
                        src={images[selectedImageIndex]}
                        alt={name || 'Pre-configured PC'}
                        className="w-full aspect-square object-contain cursor-pointer"
                        onClick={() => setIsLightboxOpen(true)}
                        initial={{ opacity: 0, x: navDirection.current * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: navDirection.current * -40 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center">
                        <svg className="w-32 h-32 text-gray-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Navigation arrows for multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                        className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm text-gray-600 dark:text-neutral-300 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-surface-700 shadow-sm border border-gray-200/50 dark:border-surface-600/50 items-center justify-center"
                      >
                        <FaChevronLeft size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                        className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm text-gray-600 dark:text-neutral-300 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-surface-700 shadow-sm border border-gray-200/50 dark:border-surface-600/50 items-center justify-center"
                      >
                        <FaChevronRight size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery & Counter */}
                {images.length > 1 && (
                  <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-surface-700/50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              index === selectedImageIndex
                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                : 'border-gray-200 dark:border-surface-600 hover:border-gray-300 dark:hover:border-surface-500 hover:brightness-110'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${name} - ${index + 1}`}
                              loading="lazy"
                              className="w-full h-full object-contain bg-gray-50 dark:bg-surface-800"
                            />
                          </button>
                        ))}
                      </div>
                      {/* Image counter pill */}
                      <span className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-surface-700 text-gray-500 dark:text-neutral-400 text-xs font-medium rounded-full">
                        {selectedImageIndex + 1}/{images.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Details & Pricing */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-thin text-gray-800 dark:text-white mb-3 leading-tight">
                {name}
              </h1>

              {/* Short Description */}
              {shortDesc && (
                <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base leading-relaxed mb-5">{shortDesc}</p>
              )}

              {/* Stock Indicator */}
              {(() => {
                const stock = currentPC.stock ?? 0;
                const isOutOfStock = stock === 0;
                const isLowStock = stock >= 1 && stock <= 5;

                return (
                  <div className="flex items-center gap-2 mb-6">
                    {isOutOfStock ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600 dark:text-neutral-300">
                          {language === 'en' ? 'Out of Stock' : 'Slut i lager'}
                        </span>
                      </>
                    ) : isLowStock ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-sm text-gray-600 dark:text-neutral-300">
                          {language === 'en'
                            ? `Low Stock (${stock} left)`
                            : `Få kvar (${stock} st)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600 dark:text-neutral-300">
                          {language === 'en'
                            ? `In Stock (${stock} available)`
                            : `I lager (${stock} tillgängliga)`}
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Price & Order Card */}
              <div className="bg-white dark:bg-surface-850 rounded-2xl border border-gray-200 dark:border-surface-700/50 overflow-hidden mb-8 shadow-sm">
                {/* Accent line at top */}
                <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400"></div>

                <div className="p-6 sm:p-8">
                  {/* Grand Total */}
                  <div className="mb-5">
                    {hasDiscount && !buildServiceCharge ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-gray-400 dark:text-neutral-500 line-through text-xl font-medium">
                          {formatPrice(currentPC.totalPrice)}
                        </span>
                        <span className="text-red-500 font-bold text-3xl sm:text-4xl tracking-tight">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-800 dark:text-white font-bold text-3xl sm:text-4xl tracking-tight">
                        {formatPrice(grandTotal)}
                      </span>
                    )}
                    <span className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider mt-1 block">
                      {language === 'en' ? 'incl. VAT' : 'inkl. moms'}
                    </span>
                  </div>

                  {/* Price Breakdown */}
                  {buildServiceCharge > 0 && (
                    <div className="bg-gray-50 dark:bg-surface-800/50 rounded-xl p-4 mb-5">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-neutral-400 py-2">
                        <span>{language === 'en' ? 'Components' : 'Komponenter'}</span>
                        <span className="font-medium">
                          {hasDiscount && (
                            <span className="text-gray-400 dark:text-neutral-500 line-through mr-2 text-xs">
                              {formatPrice(currentPC.totalPrice)}
                            </span>
                          )}
                          {formatPrice(componentPrice!)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-purple-500 dark:text-purple-400 py-2">
                        <span>{language === 'en' ? 'Build Service' : 'Byggservice'}</span>
                        <span className="font-medium">+{formatPrice(buildServiceCharge)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-3 mt-1 border-t-2 border-gray-200 dark:border-surface-600">
                        <span>{language === 'en' ? 'Total' : 'Totalt'}</span>
                        <span className="text-lg">{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  )}

                  {/* Build Service Info */}
                  {currentPC.includesBuildService && (
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/20 rounded-xl p-5 mb-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Settings size={16} className="text-purple-500 dark:text-purple-400" />
                        </div>
                        <span className="font-bold text-sm text-purple-700 dark:text-purple-300">
                          {currentPC.buildServiceSnapshot
                            ? (language === 'en' ? currentPC.buildServiceSnapshot.name_en : currentPC.buildServiceSnapshot.name_sv)
                            : (language === 'en' ? 'Professional Build Service Included' : 'Professionell byggservice ingår')}
                        </span>
                      </div>

                      {currentPC.buildServiceSnapshot && (
                        <>
                          {(language === 'en' ? currentPC.buildServiceSnapshot.desc_en : currentPC.buildServiceSnapshot.desc_sv) && (
                            <p className="text-purple-600/80 dark:text-purple-400/80 text-sm mb-4 leading-relaxed">
                              {language === 'en' ? currentPC.buildServiceSnapshot.desc_en : currentPC.buildServiceSnapshot.desc_sv}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {/* Estimated Build Time */}
                            {(language === 'en'
                              ? currentPC.buildServiceSnapshot.estimatedBuildTime_en
                              : currentPC.buildServiceSnapshot.estimatedBuildTime_sv) && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-800/20 rounded-full">
                                <Clock size={13} className="text-purple-500 dark:text-purple-400" />
                                <span className="text-purple-700 dark:text-purple-300 text-xs font-medium">
                                  {language === 'en'
                                    ? currentPC.buildServiceSnapshot.estimatedBuildTime_en
                                    : currentPC.buildServiceSnapshot.estimatedBuildTime_sv}
                                </span>
                              </div>
                            )}

                            {/* Warranty Info */}
                            {(language === 'en'
                              ? currentPC.buildServiceSnapshot.warrantyInfo_en
                              : currentPC.buildServiceSnapshot.warrantyInfo_sv) && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-800/20 rounded-full">
                                <ShieldCheck size={13} className="text-purple-500 dark:text-purple-400" />
                                <span className="text-purple-700 dark:text-purple-300 text-xs font-medium">
                                  {language === 'en'
                                    ? currentPC.buildServiceSnapshot.warrantyInfo_en
                                    : currentPC.buildServiceSnapshot.warrantyInfo_sv}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={(currentPC.stock ?? 0) === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      (currentPC.stock ?? 0) === 0
                        ? 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                        : pcAlreadyInCart
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-glow hover:scale-[1.01] active:scale-[0.98]'
                    }`}
                  >
                    {(currentPC.stock ?? 0) === 0
                      ? (language === 'en' ? 'Out of Stock' : 'Slut i lager')
                      : pcAlreadyInCart
                        ? (language === 'en' ? 'View Cart' : 'Visa kundvagn')
                        : (language === 'en' ? 'Add to Cart' : 'Lägg i kundvagn')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gradient divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-12 sm:my-16"></div>

          {/* Specifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Section Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="flex items-center justify-center gap-3 mb-3">
                <ListChecks size={28} className="text-primary-500" />
                <h2 className="text-3xl sm:text-4xl font-thin text-gray-800 dark:text-white">
                  {language === 'en' ? 'Specifications' : 'Specifikationer'}
                </h2>
              </div>
              <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
                {language === 'en' ? 'Complete component breakdown' : 'Komplett komponentöversikt'}
              </p>
            </div>

            {/* Grouped Specifications */}
            <div className="space-y-8 sm:space-y-10">
              {SPEC_GROUPS.map((group) => {
                if (!groupHasComponents(group.types)) return null;

                return (
                  <div key={group.key}>
                    {/* Group Subheading */}
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-neutral-300 mb-4 pl-4 sm:pl-5 border-l-[4px] border-primary-500 uppercase tracking-wider">
                      {group[language]}
                    </h3>

                    {/* Component Cards */}
                    <div className="space-y-2">
                      {group.types.map((typeKey, typeIndex) => {
                        const items = getComponentItems(typeKey);
                        if (!items) return null;
                        const config = COMPONENT_CONFIG[typeKey];
                        if (!config) return null;
                        const IconComponent = config.icon;

                        return (
                          <motion.div
                            key={typeKey}
                            className="bg-white dark:bg-surface-850 rounded-xl border border-gray-200/80 dark:border-surface-700/50 px-5 sm:px-6 py-4 hover:border-primary-500/30 dark:hover:border-primary-500/20 hover:bg-gray-50/50 dark:hover:bg-surface-800/50 transition-all duration-200 group/row"
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: typeIndex * 0.07 }}
                            viewport={{ once: true, margin: "-50px" }}
                          >
                            {items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-4 ${
                                  idx > 0 ? 'mt-3 pt-3 border-t border-gray-100 dark:border-surface-700/40' : ''
                                }`}
                              >
                                {/* Icon */}
                                {idx === 0 && (
                                  <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <IconComponent size={18} className="text-white" />
                                  </div>
                                )}
                                {idx > 0 && <div className="w-10 flex-shrink-0" />}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  {idx === 0 && (
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">
                                      {config[language]}
                                    </p>
                                  )}
                                  <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate group-hover/row:text-primary-600 dark:group-hover/row:text-primary-400 transition-colors">
                                    {language === 'en' ? item.name_en : item.name_sv}
                                  </p>
                                  {item.manufacturer && (
                                    <p className="text-xs text-gray-400 dark:text-neutral-500">{item.manufacturer}</p>
                                  )}
                                </div>

                                {/* Price */}
                                <span className="font-bold text-primary-600 dark:text-primary-400 text-sm sm:text-base flex-shrink-0 tabular-nums">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Gradient divider */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-12 sm:my-16"></div>

          {/* Build Your Own CTA */}
          <motion.div
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-surface-800 dark:via-surface-850 dark:to-surface-800 mb-4"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary-600/20 to-transparent" />
              <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-blue-500/20 to-transparent" />
            </div>

            <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary-600/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Wrench size={28} className="text-primary-500" />
              </div>

              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-thin text-gray-800 dark:text-white mb-2">
                  {language === 'en' ? 'Want to customize?' : 'Vill du anpassa?'}
                </h3>
                <p className="text-gray-500 dark:text-neutral-400 text-sm sm:text-base">
                  {language === 'en'
                    ? 'Build your own PC with our configurator. Choose every component to match your exact needs.'
                    : 'Bygg din egen dator med vår konfigurator. Välj varje komponent för att matcha dina exakta behov.'}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                to="/pc-builder"
                className="px-8 py-3.5 sm:py-4 bg-primary-600 text-white rounded-full text-sm sm:text-base font-bold hover:bg-primary-500 active:scale-[0.98] transition-all shadow-md hover:shadow-glow flex-shrink-0"
              >
                {language === 'en' ? 'Build Your Own' : 'Bygg din egen'}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <DynamicFooter />

      {/* Shopping Cart Drawer */}
      <ShoppingCart />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
            >
              <X size={20} />
            </button>

            {/* Navigation - Previous */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Navigation - Next */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Main Image Container */}
            <motion.div
              className="relative rounded-xl overflow-hidden shadow-2xl max-w-[85vw] sm:max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={handleImageTouchEnd}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selectedImageIndex}
                  src={images[selectedImageIndex]}
                  alt={name || 'Pre-configured PC'}
                  className="max-w-full max-h-[75vh] object-contain bg-black/40"
                  initial={{ opacity: 0, x: navDirection.current * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: navDirection.current * -50 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            </motion.div>

            {/* Bottom Controls: Thumbnails + Counter */}
            {images.length > 1 && (
              <div
                className="flex flex-col items-center mt-6 gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Thumbnail strip */}
                <div className="flex gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-2xl max-w-[90vw] overflow-x-auto scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navDirection.current = index > selectedImageIndex ? 1 : -1;
                        setSelectedImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedImageIndex
                          ? 'border-white opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover bg-neutral-900"
                      />
                    </button>
                  ))}
                </div>

                {/* Image counter pill */}
                <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white/80 font-medium">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreConfiguredPCDetail;
