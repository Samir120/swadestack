import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/common/Toast';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleCart } from '../store/slices/uiSlice';
import { addToCart } from '../store/slices/cartSlice';
import { submitContactForm, clearSubmitSuccess, clearError } from '../store/slices/contactSlice';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import useReducedMotion from '../hooks/useReducedMotion';
import apiClient from '../models/api/apiClient';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import HighlightsBanner from '../components/common/HighlightsBanner';
import LazySection from '../components/common/LazySection';
import { Service } from '../models/types/service.types';
import DynamicFooter from '../components/common/DynamicFooter';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { motion } from 'framer-motion';
// Inline SVG icons to avoid loading the 857KB lucide-react chunk
const CircleCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
const XCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);
import AutoCarousel from '../components/common/AutoCarousel';

// Lazy-load below-fold heavy components
const FeatureFocus = lazy(() => import('../components/sections/FeatureFocus'));
const OurTeam = lazy(() => import('../components/sections/OurTeam'));
const PreConfiguredPCSection = lazy(() => import('../components/pcbuilder/PreConfiguredPCSection'));
const ComponentsShopSection = lazy(() => import('../components/sections/ComponentsShopSection'));

// Lazy-load Lottie (heavy library) — only needed for empty states and send animation
const Lottie = lazy(() => import('lottie-react'));

// Animation data — imported eagerly but they're tiny JSON files (6-11KB)
import emptyContentAnimation from '../assets/animations/empty-content.json';
import paperPlaneSendAnimation from '../assets/animations/paper-plane-send.json';
import AmbientBackground from '../components/common/AmbientBackground';


const Home: React.FC = () => {
  const toast = useToast();
  useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const { settings } = useAppSelector((state) => state.siteSettings);
  useAuthViewModel();
  const reduceMotion = useReducedMotion();
  const vatRate = useVatRate();
  const teamMembers = useAppSelector((state) => state.team.members);
  const hasTeamMembers = teamMembers.length > 0;

  const [activeSection, setActiveSection] = useState('home');
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Contact Form State ---
  const { isSubmitting, submitSuccess, error: contactError } = useAppSelector((state) => state.contact);
  const [showSentAnimation, setShowSentAnimation] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [portfolioRes, servicesRes] = await Promise.all([
          apiClient.get<any>('/portfolio', { page: 1, limit: 100 }),
          apiClient.get<any>('/services', { page: 1, limit: 100 })
        ]);

        if (portfolioRes.success && portfolioRes.data) {
          setPortfolioItems(portfolioRes.data.items.filter((item: any) => item.isPublished));
        }

        if (servicesRes.success && servicesRes.data) {
          setServices(servicesRes.data.items.filter((s: any) => s.isActive));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Group Services by ServiceCategory ---
  const groupedServices = useMemo(() => {
    const sortedServices = [...services].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    const groups: Record<string, any[]> = {};

    sortedServices.forEach((service) => {
      const key = service.serviceCategoryId || '__uncategorized__';
      if (!groups[key]) groups[key] = [];
      groups[key].push(service);
    });

    return groups;
  }, [services]);

  // --- Contact Form Handlers ---
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error(language === 'en' ? 'Please fill in all required fields' : 'Vänligen fyll i alla obligatoriska fält');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'Vänligen ange en giltig e-postadress');
      return;
    }

    // Submit form
    await dispatch(submitContactForm({ ...contactForm, language }));
  };

  // Handle contact form success
  useEffect(() => {
    if (submitSuccess) {
      setShowSentAnimation(true);
      toast.success(
        language === 'en'
          ? 'Thank you for your message! We will get back to you soon.'
          : 'Tack för ditt meddelande! Vi återkommer till dig snart.'
      );
      // Reset form
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      dispatch(clearSubmitSuccess());

      const timer = setTimeout(() => setShowSentAnimation(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, language, dispatch]);

  // Handle contact form error
  useEffect(() => {
    if (contactError) {
      toast.error(contactError);
      dispatch(clearError());
    }
  }, [contactError, dispatch]);

  // --- Scroll & UI Logic ---
  const gamingPcVisible = settings?.gamingPcSectionVisible !== false;

  useEffect(() => {
    const baseSections = ['home', 'features', 'portfolio', 'services'];
    const sections = [
      ...baseSections,
      ...(gamingPcVisible ? ['pc-configurations', 'components-shop'] : []),
      ...(hasTeamMembers ? ['team'] : []),
      'contact'
    ];

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 100;
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const offsetTop = element.offsetTop;
            const offsetBottom = offsetTop + element.offsetHeight;
            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasTeamMembers, gamingPcVisible]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const showGamingPcSection = settings?.gamingPcSectionVisible !== false;

  const navLinks = [
    { id: 'home', label: language === 'en' ? 'Home' : 'Hem' },
    { id: 'features', label: language === 'en' ? 'Features' : 'Funktioner' },
    { id: 'portfolio', label: language === 'en' ? 'Work' : 'Arbete' },
    { id: 'services', label: language === 'en' ? 'Services' : 'Tjänster' },
    ...(showGamingPcSection ? [{ id: 'pc-configurations', label: language === 'en' ? 'Gaming PCs' : 'Speldatorer' }] : []),
    ...(showGamingPcSection ? [{ id: 'components-shop', label: language === 'en' ? 'Components' : 'Komponenter' }] : []),
    ...(hasTeamMembers ? [{ id: 'team', label: language === 'en' ? 'Our Team' : 'Vårt Team' }] : []),
    { id: 'contact', label: language === 'en' ? 'Contact' : 'Kontakt' },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(netToGross(price, vatRate));
  };

  const getDomain = (url: string) => {
    try { return new URL(url).hostname; } catch { return ''; }
  };

  const handleAddToCart = (service: Service) => {
    dispatch(addToCart(service));
    dispatch(toggleCart());
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-surface-950 dark:text-neutral-200 font-sans relative">
      <AmbientBackground variant="soft" wash="surface-950" />

      <Header
        mode="home"
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
        navLinks={navLinks}
      />
      <div id='home'>
        <HighlightsBanner scrollToSection={scrollToSection} />
      </div>

      {/* Shopping Cart */}
      <ShoppingCart />

      {/* Feature Focus Section — lazy-loaded when scrolled near */}
      <div id="features">
        <LazySection minHeight="400px" rootMargin="400px">
          <div className="relative">
            <Suspense fallback={<div className="flex justify-center items-center py-24"><LoadingSpinner /></div>}>
              <FeatureFocus />
            </Suspense>
          </div>
        </LazySection>
      </div>

      {/* Section divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

      <section id="portfolio" className="py-16 sm:py-20 lg:py-24 relative bg-slate-50/70 dark:bg-surface-900/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-10 lg:mb-14"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6 }}
            viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4">
              {language === 'en' ? (settings?.portfolioTitle_en || 'Selected Work') : (settings?.portfolioTitle_sv || 'Utvalda Projekt')}
            </h2>
            <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
              {language === 'en' ? (settings?.portfolioSubtitle_en || 'We build digital products that help brands grow.') : (settings?.portfolioSubtitle_sv || 'Vi bygger digitala produkter som hjälper varumärken att växa.')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <LoadingSpinner />
              <span className="text-gray-500 dark:text-neutral-400 text-sm">{language === 'en' ? 'Loading projects...' : 'Laddar projekt...'}</span>
            </div>
          ) : portfolioItems.length > 0 ? (
            portfolioItems.length === 1 ? (
              /* Featured single-item layout */
              (() => {
                const item = portfolioItems[0];
                const title = language === 'en' ? item.title_en : item.title_sv;
                const description = language === 'en' ? item.description_en : item.description_sv;
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                    {/* Browser Frame — 60% */}
                    <motion.div
                      className="lg:col-span-3"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={reduceMotion ? undefined : { duration: 0.6 }}
                      viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                    >
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl [transform:perspective(1200px)_rotateY(-3deg)] md:hover:[transform:perspective(1200px)_rotateY(0deg)] transition-all duration-[400ms] ease-out">
                        {/* Chrome bar */}
                        <div className="h-9 bg-slate-100 dark:bg-slate-700 flex items-center relative">
                          <div className="flex gap-1.5 ml-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                          </div>
                          {item.projectUrl && (
                            <div className="absolute left-1/2 -translate-x-1/2 bg-slate-200/60 dark:bg-slate-600/60 rounded-md px-3 py-0.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{getDomain(item.projectUrl)}</span>
                            </div>
                          )}
                        </div>
                        {/* Screenshot */}
                        <img
                          src={item.imageFile || item.imageUrl}
                          alt={title}
                          loading="lazy"
                          className="w-full object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Project Info — 40% */}
                    <div className="lg:col-span-2 space-y-5">
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.1 }}
                        viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                      >
                        <span className="inline-block rounded-full text-xs font-medium px-3 py-1 bg-primary-50 text-primary-600 dark:bg-primary-600/10 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                          {item.category}
                        </span>
                      </motion.div>
                      <motion.h3
                        className="text-2xl font-thin text-gray-800 dark:text-white"
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.2 }}
                        viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                      >
                        {title}
                      </motion.h3>
                      <motion.p
                        className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed line-clamp-3"
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.3 }}
                        viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                      >
                        {description}
                      </motion.p>
                      <motion.div
                        className="flex flex-wrap gap-2"
                        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.4 }}
                        viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                      >
                        {item.techStack.map((tech: string, idx: number) => (
                          <span key={idx} className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            {tech}
                          </span>
                        ))}
                      </motion.div>
                      {item.projectUrl && (
                        <motion.div
                          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          transition={reduceMotion ? undefined : { duration: 0.5, delay: 0.5 }}
                          viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                        >
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm"
                          >
                            <span className="relative">
                              {language === 'en' ? 'View Project' : 'Visa Projekt'}
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover/link:w-full transition-all duration-300" />
                            </span>
                            <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Grid layout for 2+ items */
              <div className={`grid grid-cols-1 gap-8 ${portfolioItems.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
                {portfolioItems.map((item, index) => {
                  const title = language === 'en' ? item.title_en : item.title_sv;
                  const description = language === 'en' ? item.description_en : item.description_sv;
                  return (
                    <motion.div
                      key={item.id}
                      className="group"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={reduceMotion ? undefined : { duration: 0.5, delay: index * 0.1 }}
                      viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
                    >
                      {/* Browser Frame */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl group-hover:shadow-2xl [transform:perspective(1200px)_rotateY(-3deg)] md:group-hover:[transform:perspective(1200px)_rotateY(0deg)] transition-all duration-[400ms] ease-out mb-5">
                        <div className="h-9 bg-slate-100 dark:bg-slate-700 flex items-center relative">
                          <div className="flex gap-1.5 ml-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                          </div>
                          {item.projectUrl && (
                            <div className="absolute left-1/2 -translate-x-1/2 bg-slate-200/60 dark:bg-slate-600/60 rounded-md px-3 py-0.5">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{getDomain(item.projectUrl)}</span>
                            </div>
                          )}
                        </div>
                        <img src={item.imageFile || item.imageUrl} alt={title} loading="lazy" className="w-full object-cover" />
                      </div>

                      {/* Project Info */}
                      <div className="space-y-3 px-1">
                        <span className="inline-block rounded-full text-xs font-medium px-3 py-1 bg-primary-50 text-primary-600 dark:bg-primary-600/10 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20">
                          {item.category}
                        </span>
                        <h3 className="text-2xl font-thin text-gray-800 dark:text-white">{title}</h3>
                        <p className="text-gray-500 dark:text-neutral-400 text-sm leading-relaxed line-clamp-3">{description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.techStack.map((tech: string, idx: number) => (
                            <span key={idx} className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              {tech}
                            </span>
                          ))}
                        </div>
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm pt-1"
                          >
                            <span className="relative">
                              {language === 'en' ? 'View Project' : 'Visa Projekt'}
                              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover/link:w-full transition-all duration-300" />
                            </span>
                            <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-12 sm:py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50 dark:text-neutral-500 dark:border-surface-700 dark:bg-surface-850 mx-2">
              <div className="w-20 h-20 mx-auto mb-3 opacity-50 dark:opacity-40">
                <Suspense fallback={null}><Lottie animationData={emptyContentAnimation} loop /></Suspense>
              </div>
              {language === 'en' ? (settings?.portfolioEmptyMessage_en || 'Projects coming soon') : (settings?.portfolioEmptyMessage_sv || 'Projekt kommer snart')}
            </div>
          )}
        </div>
      </section>

      {/* Section divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

      <section id="services" className="py-16 sm:py-20 lg:py-24 relative bg-white dark:bg-surface-900 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10 sm:mb-14 lg:mb-16"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6 }}
            viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4">
              {language === 'en' ? (settings?.servicesTitle_en || 'Expertise') : (settings?.servicesTitle_sv || 'Expertis')}
            </h2>
            <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {language === 'en' ? (settings?.servicesSubtitle_en || 'High-end solutions for ambitious companies.') : (settings?.servicesSubtitle_sv || 'Högklassiga lösningar för ambitiösa företag.')}
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <LoadingSpinner />
              <span className="text-gray-500 dark:text-neutral-400 text-sm">{language === 'en' ? 'Loading services...' : 'Laddar tjänster...'}</span>
            </div>
          ) : Object.keys(groupedServices).length > 0 ? (
            <div>
              {Object.entries(groupedServices)
                .sort(([, aServices], [, bServices]) => {
                  const aOrder = aServices[0]?.serviceCategory?.displayOrder ?? 999;
                  const bOrder = bServices[0]?.serviceCategory?.displayOrder ?? 999;
                  return aOrder - bOrder;
                })
                .map(([categoryKey, categoryServices], categoryIndex) => {
                const categoryName = categoryServices[0]?.serviceCategory
                  ? (language === 'en' ? categoryServices[0].serviceCategory.name_en : categoryServices[0].serviceCategory.name_sv)
                  : (language === 'en' ? 'Other' : 'Övrigt');
                const renderCard = (service: any) => {
                  const isRecommended = service.isPopular === true;
                  const includedFeatures = (language === 'en' ? service.features_en : service.features_sv) || [];
                  const excludedFeatures = (language === 'en' ? service.excludedFeatures_en : service.excludedFeatures_sv) || [];

                  return (
                    <div
                      className={`rounded-2xl p-5 sm:p-7 flex flex-col h-full w-full transition-all duration-300 relative hover:-translate-y-1 shadow-md hover:shadow-xl ${
                        isRecommended
                          ? 'ring-2 ring-indigo-500 bg-white dark:bg-slate-800/50'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                      }`}
                    >
                      {/* Recommended badge */}
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-indigo-600 text-white text-xs font-semibold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                          {language === 'en' ? 'Most Popular' : 'Mest Populär'}
                        </div>
                      )}

                      {/* Category badge */}
                      <span className="inline-block self-start rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                        {categoryName}
                      </span>

                      {/* Plan name */}
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mt-2 sm:mt-3 leading-snug">
                        {language === 'en' ? service.name_en : service.name_sv}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {language === 'en' ? service.desc_en : service.desc_sv}
                      </p>

                      {/* Price area */}
                      <div className="pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-slate-100 dark:border-slate-700 mt-3 sm:mt-5">
                        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-800 dark:text-white">
                          {service.discountPrice != null && service.discountPrice < service.price ? (
                            <div className="flex items-baseline gap-2 sm:gap-3">
                              <span className="text-base sm:text-lg text-slate-400 dark:text-slate-500 line-through font-medium">
                                {formatPrice(service.price, service.currency)}
                              </span>
                              <span className="text-red-500">
                                {formatPrice(service.discountPrice, service.currency)}
                              </span>
                            </div>
                          ) : (
                            formatPrice(service.price, service.currency)
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 block">
                          {language === 'en' ? 'starting at' : 'från'}
                        </span>
                      </div>

                      {/* Feature list */}
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-grow max-h-[calc(100vh-28rem)] sm:max-h-none overflow-y-auto">
                        {includedFeatures.map((feature: string, index: number) => (
                          <div key={`inc-${index}`} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                            <CircleCheck className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                          </div>
                        ))}
                        {excludedFeatures.length > 0 && includedFeatures.length > 0 && (
                          <div className="border-t border-slate-100 dark:border-slate-700/50 my-1" />
                        )}
                        {excludedFeatures.map((feature: string, index: number) => (
                          <div key={`exc-${index}`} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                            <XCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-400 dark:text-slate-500 line-through">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={() => handleAddToCart(service)}
                        className={`w-full rounded-xl py-2.5 sm:py-3.5 font-bold text-sm sm:text-base transition-all duration-200 mt-auto active:scale-[0.98] ${
                          isRecommended
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md'
                            : 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-500 dark:hover:text-white'
                        }`}
                      >
                        {language === 'en' ? 'Add to Cart' : 'Lägg till i kundvagn'}
                      </button>
                    </div>
                  );
                };

                return (
                  <div key={categoryKey}>
                    {categoryIndex > 0 && (
                      <div className="my-14 sm:my-16 border-t border-slate-100 dark:border-slate-800" />
                    )}

                    {/* Category subheader */}
                    <motion.h3
                      className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-neutral-200 mb-8 pl-5 border-l-[4px] border-primary-500"
                      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                      transition={reduceMotion ? undefined : { duration: 0.5 }}
                      viewport={reduceMotion ? undefined : { once: true, margin: "-50px" }}
                    >
                      {categoryName}
                    </motion.h3>

                    {/* Cards grid with optional pagination */}
                    <AutoCarousel
                      items={categoryServices.map((service) => renderCard(service))}
                      itemKeys={categoryServices.map((service) => service.id)}
                      interval={4500}
                      gap={24}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-neutral-500 mx-2">
              <div className="w-20 h-20 mx-auto mb-3 opacity-50 dark:opacity-40">
                <Suspense fallback={null}><Lottie animationData={emptyContentAnimation} loop /></Suspense>
              </div>
              {language === 'en' ? (settings?.servicesEmptyMessage_en || 'No services available') : (settings?.servicesEmptyMessage_sv || 'Inga tjänster tillgängliga')}
            </div>
          )}
        </div>
      </section>

      {/* Section divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

      {/* Pre-Configured PC Section — lazy-loaded */}
      {showGamingPcSection && (
        <div id="pc-configurations">
          <LazySection minHeight="300px" rootMargin="400px">
            <section className="relative">
              <Suspense fallback={<div className="flex justify-center items-center py-16"><LoadingSpinner /></div>}>
                <PreConfiguredPCSection />
              </Suspense>
            </section>
          </LazySection>
        </div>
      )}

      {showGamingPcSection && (
        <div id="components-shop">
          <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          <LazySection minHeight="300px" rootMargin="400px">
            <Suspense fallback={<div className="flex justify-center items-center py-16"><LoadingSpinner /></div>}>
              <ComponentsShopSection />
            </Suspense>
          </LazySection>
        </div>
      )}

      <LazySection minHeight="200px" rootMargin="400px">
        <div className="relative">
          <Suspense fallback={<div className="flex justify-center items-center py-16"><LoadingSpinner /></div>}>
            <OurTeam />
          </Suspense>
        </div>
      </LazySection>

      {/* Section divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>

      <section id="contact" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100/80 dark:from-surface-950 dark:to-surface-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-6 sm:mb-10"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6 }}
            viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl sm:text-5xl font-thin text-gray-800 dark:text-white mb-3 sm:mb-4">
              {language === 'en' ? (settings?.contactTitle_en || "Let's work together.") : (settings?.contactTitle_sv || "Låt oss samarbeta.")}
            </h2>
            <p className="font-medium text-xs sm:text-sm uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500">
              {language === 'en' ? (settings?.contactSubtitle_en || 'Ready to start your next project? Drop us a line.') : (settings?.contactSubtitle_sv || 'Redo att starta ditt nästa projekt? Hör av dig till oss.')}
            </p>
          </motion.div>
          <motion.div
            className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl border border-gray-200 shadow-light-xl dark:bg-surface-850 dark:border-surface-700 dark:shadow-dark-xl relative mx-1 sm:mx-0 overflow-hidden"
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.15 }}
            viewport={reduceMotion ? undefined : { once: true, margin: "-100px" }}
          >
            {/* Accent line at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400"></div>
            {showSentAnimation && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-surface-850/95 rounded-2xl z-20 animate-fadeIn">
                <div className="w-28 h-28 sm:w-32 sm:h-32">
                  <Suspense fallback={null}><Lottie animationData={paperPlaneSendAnimation} loop={false} /></Suspense>
                </div>
                <p className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 mt-3">
                  {language === 'en' ? 'Message Sent!' : 'Meddelande Skickat!'}
                </p>
              </div>
            )}
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-primary-600/10 rounded-full blur-3xl pointer-events-none opacity-50"></div>
            <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                    {language === 'en' ? 'Name' : 'Namn'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactFormChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                    {language === 'en' ? 'Email' : 'E-post'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                  {language === 'en' ? 'Phone' : 'Telefon'} <span className="text-gray-400 dark:text-neutral-500 normal-case">({language === 'en' ? 'Optional' : 'Valfritt'})</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  className="form-input"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                  {language === 'en' ? 'Subject' : 'Ämne'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactFormChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider ml-1 font-medium">
                  {language === 'en' ? 'Message' : 'Meddelande'} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  required
                  className="form-input resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl text-sm sm:text-base transition-all transform ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-glow hover:scale-[1.01] active:scale-[0.98]'
                }`}
              >
                {isSubmitting
                  ? language === 'en'
                    ? 'Sending...'
                    : 'Skickar...'
                  : language === 'en'
                  ? 'Send Message'
                  : 'Skicka Meddelande'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Footer with Categories and Pages */}
      <DynamicFooter />
    </div>
  );
};

export default Home;
