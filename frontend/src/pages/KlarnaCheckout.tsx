import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../models/api/ordersApi';
import { Order, PaymentSummary, PaymentPhase } from '../models/types/order.types';
import { useAppSelector } from '../store/hooks';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

const KlarnaCheckout: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const phase = (searchParams.get('phase') as PaymentPhase) || 'full';
  useAppSelector((state) => state.ui.language);
  useAppSelector((state) => state.siteSettings);
  const vatRate = useVatRate();

  const [order, setOrder] = useState<Order | null>(null);
  const [_paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [klarnaSnippet, setKlarnaSnippet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const klarnaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    loadPaymentData();
  }, [orderId, phase]);

  // Re-initialize Klarna widget when snippet changes
  useEffect(() => {
    if (klarnaSnippet && klarnaContainerRef.current) {
      // Clear previous content
      klarnaContainerRef.current.innerHTML = klarnaSnippet;

      // Execute any scripts in the snippet
      const scripts = klarnaContainerRef.current.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
    }
  }, [klarnaSnippet]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get order details
      const orderResponse = await ordersApi.getById(orderId!);
      if (!orderResponse.data) {
        setError('Order not found');
        return;
      }
      setOrder(orderResponse.data);

      // Determine correct phase based on order
      let correctPhase = phase;

      // Get payment summary if partial payment
      if (orderResponse.data.requiresPartialPayment) {
        const summaryResponse = await ordersApi.getPaymentStatus(orderId!);
        if (!summaryResponse.data) {
          setError('Could not load payment status');
          return;
        }
        setPaymentSummary(summaryResponse.data);

        // Auto-correct phase based on payment summary
        if (summaryResponse.data.nextAction === 'pay_initial') {
          correctPhase = 'initial';
        } else if (summaryResponse.data.nextAction === 'pay_final') {
          correctPhase = 'final';
        } else if (summaryResponse.data.nextAction === 'completed') {
          setError('All payments have been completed for this order.');
          return;
        } else if (summaryResponse.data.nextAction === 'wait_for_ready') {
          setError('This order is awaiting preparation. You will be notified when the final payment is ready.');
          return;
        }

        // Validate phase matches expected action
        if (phase === 'initial' && summaryResponse.data.nextAction !== 'pay_initial') {
          setError('Initial payment already completed or not available.');
          return;
        }

        if (phase === 'final' && summaryResponse.data.nextAction !== 'pay_final') {
          setError('Final payment not ready yet. Please wait for admin to mark the order ready.');
          return;
        }
      } else if (!orderResponse.data.requiresPartialPayment && phase !== 'full') {
        // Order doesn't require partial payment, use full payment
        correctPhase = 'full';
      }

      // Create Klarna checkout session
      const klarnaResponse = await ordersApi.createKlarnaCheckout(orderId!, correctPhase);
      if (!klarnaResponse.data) {
        setError('Could not create Klarna checkout');
        return;
      }
      setKlarnaSnippet(klarnaResponse.data.htmlSnippet);
    } catch (err: any) {
      console.error('Error loading payment data:', err);

      // Provide specific error messages
      const errorMsg = err.response?.data?.message || err.message || '';

      if (errorMsg.includes('Invalid payment phase') || errorMsg.includes('requires partial payment')) {
        setError('This order requires partial payment. Please use the correct payment flow from your order confirmation page.');
      } else if (errorMsg.toLowerCase().includes('klarna') || err.response?.status === 500) {
        setError('Payment system configuration error. Please contact support or try again later.');
      } else if (errorMsg) {
        setError(errorMsg);
      } else {
        setError('Failed to load payment data. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-gray-700 dark:text-neutral-300 font-medium text-lg">Loading Klarna Checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl p-8 max-w-md w-full border border-gray-200 dark:border-surface-700">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 shadow-light-md dark:shadow-dark-md">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-thin text-gray-900 dark:text-white">Payment Error</h2>
            <p className="mt-3 text-gray-500 dark:text-neutral-400 leading-relaxed">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md dark:shadow-dark-md hover:shadow-light-lg dark:hover:shadow-dark-lg transform hover:-translate-y-0.5"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderDiscount = order.discountAmount || 0;
  // Gross total with flat discount: items_gross - flat_discount
  const fullGross = netToGross(order.totalAmount + orderDiscount, vatRate) - orderDiscount;
  const amount = phase === 'initial'
    ? fullGross * 0.5
    : phase === 'final'
    ? fullGross * 0.5
    : fullGross;

  const phaseLabel = phase === 'initial' ? 'Initial Payment (50%)' : phase === 'final' ? 'Final Payment (50%)' : 'Full Payment';
  const stepIndicator = phase === 'initial' ? 'Step 1 of 2' : phase === 'final' ? 'Step 2 of 2' : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-850 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 mix-blend-multiply"></div>
      </div>
      <Header mode="page" />
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-28 relative z-10">
        <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl border border-gray-200 dark:border-surface-700 p-4 sm:p-8 lg:p-10">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary-600/10 p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-thin text-gray-900 dark:text-white">Complete Payment</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                  Order: <span className="font-bold text-primary-600 dark:text-primary-400">{order.orderNumber}</span>
                </p>
              </div>
            </div>

            {/* Payment Phase Info */}
            <div className="bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-4 sm:p-6 mb-6 shadow-light-md dark:shadow-dark-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{phaseLabel}</h3>
                  {stepIndicator && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">{stepIndicator}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: order.currency }).format(amount)}
                  </p>
                </div>
              </div>
            </div>

            {order.requiresPartialPayment && (
              <div className="p-5 bg-primary-600/10 border-2 border-primary-500/30 rounded-xl shadow-light-md dark:shadow-dark-md">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-1">Partial Payment Plan</p>
                    <p className="text-sm text-gray-700 dark:text-neutral-300">
                      This order uses a two-phase payment system. You'll pay 50% now, and the remaining 50% when your order is ready for delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Klarna Checkout Widget */}
          <div className="mb-8">
            <div
              ref={klarnaContainerRef}
              id="klarna-checkout-container"
              className="min-h-[400px] bg-gray-100 dark:bg-surface-800 rounded-lg"
              dangerouslySetInnerHTML={{ __html: klarnaSnippet || '' }}
            />
          </div>

          {/* Order Summary */}
          <div className="pt-8 border-t-2 border-gray-200 dark:border-surface-700">
            <h3 className="text-lg font-thin text-gray-900 dark:text-white mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Order Summary
            </h3>
            <div className="space-y-3 bg-gray-100 dark:bg-surface-800 rounded-2xl p-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm pb-3 border-b border-gray-200 dark:border-surface-600 last:border-0 last:pb-0">
                  <span className="text-gray-700 dark:text-neutral-300 font-medium">
                    {item.serviceName} <span className="text-gray-500 dark:text-neutral-400">x {item.quantity}</span>
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: order.currency }).format(netToGross(item.price * item.quantity, vatRate))}
                  </span>
                </div>
              ))}
              {orderDiscount > 0 && (
                <div className="flex justify-between text-sm pb-3 border-b border-gray-200 dark:border-surface-600" style={{ color: '#059669' }}>
                  <span className="font-medium">
                    {order.couponCode ? `Coupon: ${order.couponCode}` : 'Discount'}
                  </span>
                  <span className="font-bold">
                    -{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: order.currency }).format(orderDiscount)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 border-gray-200 dark:border-surface-600 flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600 dark:text-primary-400">{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: order.currency }).format(amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-400 font-medium">Powered by Klarna - Secure Payment</span>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate(`/order-confirmation/${orderId}`)}
            className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-300 font-medium underline"
          >
            Cancel and return to order
          </button>
        </div>
      </main>

      {/* Footer */}
      <DynamicFooter />

      {/* Shopping Cart */}
      <ShoppingCart />
    </div>
  );
};

export default KlarnaCheckout;
