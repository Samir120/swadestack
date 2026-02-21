import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useCartViewModel } from '../viewmodels/cartViewModel';
import { useOrdersViewModel } from '../viewmodels/ordersViewModel';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import { useCouponViewModel } from '../viewmodels/couponViewModel';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
// Address fields removed - Klarna handles address collection
import { pcConfigurationApi } from '../models/api/pcConfigurationApi';
import { PCConfiguration } from '../models/types/pcConfiguration.types';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Lottie from 'lottie-react';
import emptyCartAnimation from '../assets/animations/empty-cart.json';
import paymentFullAnimation from '../assets/animations/payment-full.json';
import paymentSplitAnimation from '../assets/animations/payment-split.json';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross, vatPercent } from '../utils/vat';

const Checkout: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const language = useAppSelector((state) => state.ui.language);
  const { items, pcItems, componentItems, emptyCart, isEmpty, totalAmount } = useCartViewModel();
  const { createOrder, validateOrderData, isLoading } = useOrdersViewModel();
  const { isAuthenticated, user } = useAuthViewModel();
  const vatRate = useVatRate();
  const {
    appliedCoupon,
    couponCode,
    setCouponCode,
    isValidating,
    couponError,
    discountAmount,
    validateAndApplyCoupon,
    removeCoupon,
    formatDiscount,
  } = useCouponViewModel();
  const { settings: legalSettings } = useAppSelector((state) => state.legalSettings);
  const [consentChecked, setConsentChecked] = useState(false);

  // PC Configuration state (from navigation)
  const configurationId = (location.state as any)?.configurationId;
  const [pcConfiguration, setPcConfiguration] = useState<PCConfiguration | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Load PC Configuration if configurationId is provided
  useEffect(() => {
    if (configurationId) {
      setIsLoadingConfig(true);
      setConfigError(null);
      pcConfigurationApi.getById(configurationId)
        .then((response) => {
          if (response.success && response.data) {
            setPcConfiguration(response.data);
          } else {
            setConfigError(response.message || 'Failed to load configuration');
            toast.error(language === 'en' ? 'Failed to load configuration' : 'Kunde inte ladda konfigurationen');
          }
        })
        .catch((_error) => {
          setConfigError('Failed to load configuration');
          toast.error(language === 'en' ? 'Failed to load configuration' : 'Kunde inte ladda konfigurationen');
        })
        .finally(() => {
          setIsLoadingConfig(false);
        });
    }
  }, [configurationId, language]);

  // Calculate total from PC configuration components
  const getConfigurationTotal = (): number => {
    if (!pcConfiguration?.components) return 0;
    const components = pcConfiguration.components;
    let total = 0;
    Object.values(components).forEach((comp: any) => {
      if (Array.isArray(comp)) {
        comp.forEach((c: any) => {
          total += (c.price || 0) * (c.quantity || 1);
        });
      } else if (comp) {
        total += (comp.price || 0) * (comp.quantity || 1);
      }
    });
    // Add build service charge if applicable
    if (pcConfiguration.includesBuildService && pcConfiguration.buildServiceCharge) {
      total += pcConfiguration.buildServiceCharge;
    }
    return total;
  };

  // Determine if we're in PC config mode or cart mode
  const isPCConfigMode = !!configurationId && !!pcConfiguration;
  const hasPCItems = pcItems.length > 0;
  const configTotal = getConfigurationTotal();

  // Effective total for threshold checks (net after discount)
  const effectiveTotal = isPCConfigMode ? configTotal : (totalAmount - discountAmount);
  // Gross total for display: items_gross - flat_discount (coupon has no VAT)
  const displayGrossTotal = isPCConfigMode ? netToGross(configTotal, vatRate) : (netToGross(totalAmount, vatRate) - discountAmount);
  // Show payment choice when order is over 10,000 SEK (not for PC configurations)
  const showPaymentChoice = !isPCConfigMode && !hasPCItems && effectiveTotal > 10000;

  // Payment method state: default to 'full' (guest-friendly)
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'partial'>('full');

  // Pre-fill email if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Clear coupon when cart total changes (items added/removed)
  useEffect(() => {
    if (appliedCoupon) {
      removeCoupon();
    }
  }, [totalAmount]);

  // Check authentication for partial payment orders
  useEffect(() => {
    if (showPaymentChoice && paymentMethod === 'partial' && !isAuthenticated) {
      setShowAuthWarning(true);
    } else {
      setShowAuthWarning(false);
    }
  }, [showPaymentChoice, paymentMethod, isAuthenticated]);

  // Show loading state for PC configuration
  if (isLoadingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mb-4" />
          <p className="text-gray-500 dark:text-neutral-400">
            {language === 'en' ? 'Loading configuration...' : 'Laddar konfiguration...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if configuration failed to load
  if (configurationId && configError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">
          {language === 'en' ? 'Failed to load configuration' : 'Kunde inte ladda konfigurationen'}
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 mb-4">{configError}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          {language === 'en' ? 'Back to Dashboard' : 'Tillbaka till instrumentpanelen'}
        </button>
      </div>
    );
  }

  // Show empty cart message only if not in PC config mode and cart is empty
  if (!isPCConfigMode && isEmpty()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-28 h-28 mx-auto mb-2 opacity-50 dark:opacity-40">
          <Lottie animationData={emptyCartAnimation} loop />
        </div>
        <h2 className="text-2xl font-bold mb-4">
          {language === 'en' ? 'Your cart is empty' : 'Din kundvagn är tom'}
        </h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          {language === 'en' ? 'Browse Services' : 'Bläddra Tjänster'}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block checkout if consent is required but not checked
    if (legalSettings?.showCheckoutConsent && !consentChecked) {
      setErrors([
        language === 'en'
          ? 'You must accept the terms and conditions to place an order.'
          : 'Du måste godkänna villkoren för att lägga en beställning.'
      ]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Block checkout if user chose partial payment but is not authenticated
    if (showPaymentChoice && paymentMethod === 'partial' && !isAuthenticated) {
      setErrors([
        language === 'en'
          ? 'Please sign in or create an account to use two-phase payment. This allows you to track your order and complete the second payment later.'
          : 'Vänligen logga in eller skapa ett konto för att använda tvåfasbetalning. Detta gör att du kan spåra din beställning och slutföra den andra betalningen senare.'
      ]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Handle PC Configuration checkout
    if (isPCConfigMode && pcConfiguration) {
      setErrors([]);
      setIsSubmitting(true);
      try {
        const checkoutData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userId: user?.id,
        };

        const result = await pcConfigurationApi.checkout(pcConfiguration.id, checkoutData as any);

        if (result.success && result.data) {
          toast.success(language === 'en' ? 'Order created successfully!' : 'Beställningen skapades framgångsrikt!');
          // Navigate to payment page
          navigate(`/klarna-checkout/${result.data.orderId}?phase=full`);
        } else {
          setErrors([result.message || 'Failed to create order']);
          toast.error(result.message || (language === 'en' ? 'Failed to create order' : 'Kunde inte skapa beställningen'));
        }
      } catch (error: any) {
        setErrors([error.message || 'An error occurred']);
        toast.error(language === 'en' ? 'An error occurred' : 'Ett fel inträffade');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Handle cart checkout — single order for all items (services + PCs)
    const orderData: any = {
      ...formData,
      items: items.map(item => ({
        serviceId: item.service.id,
        quantity: item.quantity,
      })),
    };

    // Include component items
    if (componentItems.length > 0) {
      orderData.componentItems = componentItems.map(ci => ({
        pcComponentId: ci.component.id,
        quantity: ci.quantity,
      }));
    }

    // Include PC items
    if (hasPCItems) {
      orderData.pcItems = pcItems.map(pcItem => {
        const pc = pcItem.preConfiguredPC;
        const componentPrice = Number(pc.discountedPrice ?? pc.totalPrice) || 0;
        const buildCharge = pc.includesBuildService ? (Number(pc.buildServiceCharge) || 0) : 0;
        return {
          preConfiguredPCId: pc.id,
          name: (language === 'en' ? pc.name_en : pc.name_sv) || 'Gaming PC',
          totalPrice: componentPrice + buildCharge,
          configurationSnapshot: {
            components: pc.components,
            includesBuildService: pc.includesBuildService,
            buildServiceCharge: pc.buildServiceCharge,
          },
        };
      });
    }

    // Include coupon code if applied
    if (appliedCoupon?.code) {
      orderData.couponCode = appliedCoupon.code;
    }

    // Include payment method preference for orders over 10k
    if (showPaymentChoice) {
      orderData.paymentMethod = paymentMethod;
    }

    // Include userId if authenticated
    if (isAuthenticated && user) {
      orderData.userId = user.id;
    }

    // Skip service-item validation when cart has only PC/component items
    if (items.length > 0) {
      const validation = validateOrderData(orderData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    setErrors([]);
    const result = await createOrder(orderData);

    if (result.success && result.order) {
      emptyCart();

      // Check if partial payment is required
      if (result.order.requiresPartialPayment) {
        navigate(`/klarna-checkout/${result.order.id}?phase=initial`);
      } else {
        navigate(`/klarna-checkout/${result.order.id}?phase=full`);
      }
    } else {
      setErrors([result.error || 'Failed to create order']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
          <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-850 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 mix-blend-multiply"></div>
      </div>

      <Header mode="page" />
      <main className="max-w-7xl mx-auto px-4 py-12 pt-28 relative z-10">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-thin mb-3 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
          {language === 'en' ? 'Checkout' : 'Kassan'}
        </h1>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500 mt-2">
          {language === 'en' ? 'Order Details' : 'Beställningsdetaljer'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl border border-gray-200 dark:border-surface-700 p-4 sm:p-6 lg:p-8">
          {/* Authentication Warning for Partial Payment */}
          {showAuthWarning && (
            <div className="bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-4 sm:p-6 mb-6 shadow-light-md dark:shadow-dark-md">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="flex-shrink-0 mb-3 sm:mb-0">
                  <div className="bg-primary-600/10 p-2 rounded-lg w-fit">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="sm:ml-4 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {language === 'en' ? 'Account Required' : 'Konto Krävs'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-neutral-300 mb-4 leading-relaxed">
                    {language === 'en'
                      ? 'Two-phase payment requires an account for order tracking and completing the second payment. You\'ll pay 50% now and 50% when your project is ready.'
                      : 'Tvåfasbetalning kräver ett konto för orderspårning och att slutföra den andra betalningen. Du betalar 50% nu och 50% när ditt projekt är klart.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                      className="px-4 sm:px-5 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-all shadow-light-md dark:shadow-dark-md hover:shadow-light-lg dark:hover:shadow-dark-lg transform hover:-translate-y-0.5 text-center"
                    >
                      {language === 'en' ? 'Sign In' : 'Logga In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/register', { state: { from: '/checkout' } })}
                      className="px-4 sm:px-5 py-2.5 bg-gray-100 dark:bg-surface-800 border-2 border-primary-500/30 text-primary-600 dark:text-primary-400 rounded-lg font-bold hover:bg-surface-700 hover:border-primary-500 transition-all text-center"
                    >
                      {language === 'en' ? 'Create Account' : 'Skapa Konto'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest Account Prompt (non-blocking) */}
          {!isAuthenticated && !showAuthWarning && (
            <div className="bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-4 sm:p-6 mb-6 shadow-light-md dark:shadow-dark-md">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="flex-shrink-0 mb-3 sm:mb-0">
                  <div className="bg-primary-600/10 p-2 rounded-lg w-fit">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <div className="sm:ml-4 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {language === 'en'
                      ? 'Create an Account for a Smoother Experience'
                      : 'Skapa ett konto för en smidigare upplevelse'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-neutral-300 mb-4 leading-relaxed">
                    {language === 'en'
                      ? 'Unlock additional features by creating a free account:'
                      : 'Lås upp fler funktioner genom att skapa ett gratis konto:'}
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-700 dark:text-neutral-300">
                      <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {language === 'en' ? 'Apply for invoice payment' : 'Ansök om fakturabetalning'}
                    </li>
                    <li className="flex items-center text-sm text-gray-700 dark:text-neutral-300">
                      <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {language === 'en' ? 'View payment and order history' : 'Se betalnings- och orderhistorik'}
                    </li>
                    <li className="flex items-center text-sm text-gray-700 dark:text-neutral-300">
                      <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {language === 'en' ? 'Create returns and complaints' : 'Skapa returer och reklamationer'}
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/register', { state: { from: '/checkout' } })}
                      className="px-4 sm:px-5 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-all shadow-light-md dark:shadow-dark-md hover:shadow-light-lg dark:hover:shadow-dark-lg transform hover:-translate-y-0.5 text-center"
                    >
                      {language === 'en' ? 'Create Account' : 'Skapa konto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                      className="px-4 sm:px-5 py-2.5 bg-gray-100 dark:bg-surface-800 border-2 border-primary-500/30 text-primary-600 dark:text-primary-400 rounded-lg font-bold hover:bg-surface-700 hover:border-primary-500 transition-all text-center"
                    >
                      {language === 'en' ? 'Sign In' : 'Logga in'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-5 mb-6 shadow-light-md dark:shadow-dark-md">
              {errors.map((error, i) => (
                <div key={i} className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-400 font-medium text-sm">{error}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-thin mb-5 flex items-center text-gray-900 dark:text-white">
                <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {language === 'en' ? 'Contact Information' : 'Kontaktinformation'}
              </h2>
              <div className="space-y-6">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'First Name' : 'Förnamn'}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    required
                    placeholder={language === 'en' ? 'Last Name' : 'Efternamn'}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Coupon Code Section - only for cart checkout */}
            {!isPCConfigMode && (
              <div className="pt-6 border-t-2 border-gray-200 dark:border-surface-700">
                <h2 className="text-xl sm:text-2xl font-thin mb-5 flex items-center text-gray-900 dark:text-white">
                  <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {language === 'en' ? 'Coupon Code' : 'Rabattkod'}
                </h2>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</span>
                        <span className="text-sm text-green-600 dark:text-green-400 ml-2">
                          (-{formatDiscount(appliedCoupon.discountType, appliedCoupon.discountValue)})
                        </span>
                        <p className="text-sm text-green-600 dark:text-green-300 mt-0.5">
                          {language === 'en'
                            ? `You save ${(appliedCoupon.discountAmount || 0).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`
                            : `Du sparar ${(appliedCoupon.discountAmount || 0).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`}
                          {appliedCoupon.maxDiscountAmount != null && appliedCoupon.discountType === 'percentage' && (
                            <span className="text-xs text-green-500 dark:text-green-400 ml-1">
                              ({language === 'en' ? 'max' : 'max'} {appliedCoupon.maxDiscountAmount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title={language === 'en' ? 'Remove coupon' : 'Ta bort rabattkod'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={language === 'en' ? 'Enter coupon code' : 'Ange rabattkod'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="form-input flex-1"
                        disabled={isValidating}
                      />
                      <button
                        type="button"
                        onClick={() => validateAndApplyCoupon(couponCode, totalAmount, formData.email, items.map(item => ({ serviceId: item.service.id, quantity: item.quantity })))}
                        disabled={isValidating || !couponCode.trim() || !formData.email}
                        className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                          isValidating || !couponCode.trim() || !formData.email
                            ? 'bg-gray-200 dark:bg-surface-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-500 shadow-light-md dark:shadow-dark-md'
                        }`}
                      >
                        {isValidating
                          ? (language === 'en' ? 'Checking...' : 'Kontrollerar...')
                          : (language === 'en' ? 'Apply' : 'Använd')}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {couponError}
                      </p>
                    )}
                    {!formData.email && couponCode.trim() && (
                      <p className="text-amber-400 text-sm mt-2">
                        {language === 'en' ? 'Enter your email above first' : 'Ange din e-post ovan först'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selector (for orders over 10,000 SEK) */}
            {showPaymentChoice && (
              <div className="pt-6 border-t-2 border-gray-200 dark:border-surface-700">
                <h2 className="text-xl sm:text-2xl font-thin mb-5 flex items-center text-gray-900 dark:text-white">
                  <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {language === 'en' ? 'Payment Method' : 'Betalningsmetod'}
                </h2>
                <div className="space-y-3">
                  {/* Option 1: Pay in Full */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('full')}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                      paymentMethod === 'full'
                        ? 'border-primary-500 bg-primary-600/10 shadow-light-md dark:shadow-dark-md'
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300 dark:border-surface-600 dark:bg-surface-800 dark:hover:border-surface-500'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'full' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-500'
                        }`}>
                          {paymentMethod === 'full' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                          )}
                        </div>
                        <div className="w-10 h-10 flex-shrink-0 mr-3 hidden sm:block">
                          <Lottie animationData={paymentFullAnimation} loop={false} />
                        </div>
                        <div>
                          <p className={`font-bold text-base sm:text-lg ${paymentMethod === 'full' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                            {language === 'en' ? 'Pay in Full' : 'Betala hela beloppet'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
                            {language === 'en' ? 'Complete payment in one step' : 'Slutför betalningen i ett steg'}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-base sm:text-lg text-primary-600 dark:text-primary-400 ml-4">
                        {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(displayGrossTotal)}
                      </span>
                    </div>
                  </button>

                  {/* Option 2: Pay in Two Phases */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('partial')}
                    className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
                      paymentMethod === 'partial'
                        ? 'border-primary-500 bg-primary-600/10 shadow-light-md dark:shadow-dark-md'
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300 dark:border-surface-600 dark:bg-surface-800 dark:hover:border-surface-500'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                          paymentMethod === 'partial' ? 'border-primary-500' : 'border-gray-300 dark:border-surface-500'
                        }`}>
                          {paymentMethod === 'partial' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                          )}
                        </div>
                        <div className="w-10 h-10 flex-shrink-0 mr-3 hidden sm:block">
                          <Lottie animationData={paymentSplitAnimation} loop={false} />
                        </div>
                        <div>
                          <p className={`font-bold text-base sm:text-lg ${paymentMethod === 'partial' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                            {language === 'en' ? 'Pay in Two Phases (50/50)' : 'Betala i två faser (50/50)'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
                            {language === 'en'
                              ? 'Pay 50% now, 50% when your project is ready'
                              : 'Betala 50% nu, 50% när ditt projekt är klart'}
                          </p>
                          {!isAuthenticated && (
                            <p className="text-xs text-amber-400 mt-1.5 flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              {language === 'en' ? 'Requires an account' : 'Kräver ett konto'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="font-bold text-base sm:text-lg text-primary-600 dark:text-primary-400 block">
                          {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(displayGrossTotal * 0.5)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-neutral-500">
                          {language === 'en' ? 'now' : 'nu'}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Address fields removed - Klarna Checkout handles address collection */}
            <div className="pt-6 border-t-2 border-gray-200 dark:border-surface-700">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {language === 'en'
                      ? 'Your billing and shipping address will be collected securely by Klarna in the next step.'
                      : 'Din faktura- och leveransadress samlas in säkert av Klarna i nästa steg.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Legal entity & consent */}
            {legalSettings?.companyName && legalSettings.showCheckoutConsent && (
              <div className="border-t border-slate-200 dark:border-slate-700 mt-5 pt-4 space-y-3">
                {/* Legal entity notice */}
                <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 21V6.75A2.25 2.25 0 0 1 6 4.5h3a2.25 2.25 0 0 1 2.25 2.25V21m0 0h4.5M11.25 21V10.5A2.25 2.25 0 0 1 13.5 8.25h3a2.25 2.25 0 0 1 2.25 2.25V21m0 0h1.5m-19.5 0h1.5" />
                  </svg>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === 'en' ? 'Your order will be processed by ' : 'Din beställning hanteras av '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{legalSettings.companyName}</span>
                    {' '}(Org.nr: {legalSettings.orgNumber}).
                  </p>
                </div>

                {/* Consent checkbox */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    consentChecked
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {(() => {
                        const raw = language === 'en'
                          ? (legalSettings.checkoutConsentText_en || 'I agree to the terms and conditions.')
                          : (legalSettings.checkoutConsentText_sv || 'Jag godkänner villkoren.');
                        return raw
                          .replace(/\{CompanyName\}/g, legalSettings.companyName || '')
                          .replace(/\{OrganizationNumber\}/g, legalSettings.orgNumber || '');
                      })()}
                    </span>
                </label>
              </div>
            )}

            {(() => {
              const isDisabled = isLoading || isSubmitting || (legalSettings?.showCheckoutConsent && !consentChecked);
              return (
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 mt-8 ${
                    isDisabled
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5'
                  }`}
                >
                  {(isLoading || isSubmitting)
                    ? (language === 'en' ? 'Processing...' : 'Bearbetar...')
                    : (language === 'en' ? 'Place Order' : 'Lägg Beställning')}
                </button>
              );
            })()}
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl border border-gray-200 dark:border-surface-700 p-4 sm:p-6 lg:p-8 h-fit lg:sticky lg:top-28">
          <div className="flex items-center mb-6">
            <div className="bg-primary-600/10 p-3 rounded-xl mr-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-thin text-gray-900 dark:text-white">
              {language === 'en' ? 'Order Summary' : 'Ordersammanfattning'}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-surface-800 rounded-2xl p-5 space-y-4">
              {/* PC Configuration Items */}
              {isPCConfigMode && pcConfiguration?.components && (
                <>
                  {/* Configuration Name */}
                  <div className="mb-4 pb-3 border-b border-gray-200 dark:border-surface-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Custom PC Configuration' : 'Anpassad PC-konfiguration'}
                      </span>
                    </div>
                    {(pcConfiguration.name_en || pcConfiguration.name_sv) && (
                      <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                        {language === 'en' ? pcConfiguration.name_en : pcConfiguration.name_sv}
                      </p>
                    )}
                  </div>

                  {/* Component List */}
                  {Object.entries(pcConfiguration.components).map(([type, comp]: [string, any]) => {
                    if (!comp) return null;

                    // Helper to get component name based on language
                    const getComponentName = (c: any) => {
                      if (language === 'en') {
                        return c.name_en || c.name || 'Unknown Component';
                      }
                      return c.name_sv || c.name_en || c.name || 'Unknown Component';
                    };

                    // Component type labels (bilingual)
                    const typeLabels: Record<string, { en: string; sv: string }> = {
                      cpu: { en: 'CPU', sv: 'Processor' },
                      motherboard: { en: 'Motherboard', sv: 'Moderkort' },
                      ram: { en: 'RAM', sv: 'RAM-minne' },
                      gpu: { en: 'Graphics Card', sv: 'Grafikkort' },
                      storage: { en: 'Storage', sv: 'Lagring' },
                      psu: { en: 'Power Supply', sv: 'Nätaggregat' },
                      case: { en: 'Case', sv: 'Chassi' },
                      cooling: { en: 'Cooling', sv: 'Kylning' },
                    };
                    const typeLabel = typeLabels[type]?.[language === 'en' ? 'en' : 'sv'] || type.toUpperCase();

                    // Handle array components (storage)
                    if (Array.isArray(comp)) {
                      return comp.map((c: any, idx: number) => (
                        <div key={`${type}-${idx}`} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                          <div>
                            <span className="text-xs uppercase text-primary-600 dark:text-primary-400 font-semibold">{typeLabel}</span>
                            <span className="font-medium text-gray-900 dark:text-white block">{getComponentName(c)}</span>
                            {c.quantity && c.quantity > 1 && (
                              <span className="text-sm text-gray-500 dark:text-neutral-400">x{c.quantity}</span>
                            )}
                          </div>
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            {(netToGross((c.price || 0) * (c.quantity || 1), vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
                          </span>
                        </div>
                      ));
                    }

                    // Handle single component
                    return (
                      <div key={type} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                        <div>
                          <span className="text-xs uppercase text-primary-600 dark:text-primary-400 font-semibold">{typeLabel}</span>
                          <span className="font-medium text-gray-900 dark:text-white block">{getComponentName(comp)}</span>
                          {comp.quantity && comp.quantity > 1 && (
                            <span className="text-sm text-gray-500 dark:text-neutral-400">x{comp.quantity}</span>
                          )}
                        </div>
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          {(netToGross((comp.price || 0) * (comp.quantity || 1), vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
                        </span>
                      </div>
                    );
                  })}

                  {/* Build Service Charge */}
                  {pcConfiguration.includesBuildService && pcConfiguration.buildServiceCharge > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t border-primary-500/30 bg-primary-600/10 -mx-5 px-5 py-3 mt-3">
                      <div>
                        <span className="text-xs uppercase text-primary-600 dark:text-primary-400 font-semibold">
                          {language === 'en' ? 'Build Service' : 'Byggtjänst'}
                        </span>
                        <span className="font-medium text-primary-600 dark:text-primary-400 block">
                          {language === 'en' ? 'Professional Assembly' : 'Professionell montering'}
                        </span>
                      </div>
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        {(netToGross(pcConfiguration.buildServiceCharge, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Regular Cart Items */}
              {!isPCConfigMode && items.map((item) => (
                <div key={item.service.id} className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                  <div>
                    <span className='font-bold text-lg text-gray-900 dark:text-white block'>{item.service.name_en}</span>
                    <span className='text-sm text-gray-500 dark:text-neutral-400'>Quantity: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                    {item.service.discountPrice != null ? (
                      <>
                        <span className="text-sm text-gray-400 dark:text-neutral-500 line-through mr-2">
                          {(netToGross(item.service.price * item.quantity, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}
                        </span>
                        {(netToGross(item.service.discountPrice * item.quantity, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}
                      </>
                    ) : (
                      <>{(netToGross(item.service.price * item.quantity, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {item.service.currency}</>
                    )}
                  </span>
                </div>
              ))}

              {/* PC Cart Items */}
              {!isPCConfigMode && pcItems.map((pcItem) => {
                const pc = pcItem.preConfiguredPC;
                const pcName = language === 'en' ? pc.name_en : pc.name_sv;
                const componentPrice = Number(pc.discountedPrice ?? pc.totalPrice) || 0;
                const buildCharge = pc.includesBuildService ? (Number(pc.buildServiceCharge) || 0) : 0;
                const pcTotal = componentPrice + buildCharge;
                const hasDiscount = pc.discountedPrice != null && Number(pc.discountedPrice) < Number(pc.totalPrice);

                return (
                  <div key={pc.id} className="pb-4 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">{pcName || 'Gaming PC'}</span>
                          {pc.tier && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 uppercase">
                              {pc.tier}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-neutral-400">
                          {language === 'en' ? 'Pre-Built PC' : 'Färdigbyggd dator'}
                        </span>
                      </div>
                      <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 dark:text-neutral-500 line-through mr-2">
                            {(netToGross(Number(pc.totalPrice) + buildCharge, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {pc.currency}
                          </span>
                        )}
                        {(netToGross(pcTotal, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {pc.currency}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Component Cart Items */}
              {!isPCConfigMode && componentItems.map((ci) => {
                const comp = ci.component;
                const compName = language === 'en' ? comp.name_en : comp.name_sv;
                return (
                  <div key={comp.id} className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{compName}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase">
                          {comp.manufacturer}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-neutral-400">
                        {language === 'en' ? 'PC Component' : 'Datorkomponent'} {ci.quantity > 1 ? `x${ci.quantity}` : ''}
                      </span>
                    </div>
                    <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                      {(netToGross(comp.price * ci.quantity, vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {comp.currency}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Coupon Discount Line */}
            {!isPCConfigMode && discountAmount > 0 && appliedCoupon && (
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl px-4 py-3 mt-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {appliedCoupon.code} ({formatDiscount(appliedCoupon.discountType, appliedCoupon.discountValue)})
                  </span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  -{discountAmount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
                </span>
              </div>
            )}

            <div className="border-t-2 border-gray-200 dark:border-surface-600 pt-6 mt-6">
              <div className="flex justify-between text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                <span className="text-gray-900 dark:text-white">{language === 'en' ? 'Total' : 'Totalt'}:</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {`${displayGrossTotal.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-neutral-400 text-right">
                {language === 'en'
                  ? `Incl. VAT (${vatPercent(vatRate)}%): ${Math.round(displayGrossTotal * vatRate / (1 + vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`
                  : `Varav moms (${vatPercent(vatRate)}%): ${Math.round(displayGrossTotal * vatRate / (1 + vatRate)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK`
                }
              </div>

              {/* Partial Payment Badge */}
              {showPaymentChoice && paymentMethod === 'partial' && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-surface-600">
                  <div className="bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-5 shadow-light-md dark:shadow-dark-md">
                    <div className="flex items-start">
                      <div className="bg-primary-600/10 p-2 rounded-lg flex-shrink-0">
                        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-1">
                          {language === 'en' ? 'Two-Phase Payment' : 'Tvåfasbetalning'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
                          {language === 'en'
                            ? `Pay 50% (${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(displayGrossTotal * 0.5)}) now, 50% when ready`
                            : `Betala 50% (${new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', minimumFractionDigits: 0 }).format(displayGrossTotal * 0.5)}) nu, 50% när klart`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Footer */}
      <DynamicFooter />

      {/* Shopping Cart */}
      <ShoppingCart />
    </div>
  );
};

export default Checkout;