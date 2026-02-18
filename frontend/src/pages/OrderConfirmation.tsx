import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useOrdersViewModel } from '../viewmodels/ordersViewModel';
import { ordersApi } from '../models/api/ordersApi';
import { PaymentSummary } from '../models/types/order.types';
import { useAuthViewModel } from '../viewmodels/authViewModel';
import Header from '../components/common/Header';
import ShoppingCart from '../components/cart/ShoppingCart';
import DynamicFooter from '../components/common/DynamicFooter';
import Lottie from 'lottie-react';
import successCheckmarkAnimation from '../assets/animations/success-checkmark.json';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useVatRate } from '../hooks/useVatRate';
import { netToGross } from '../utils/vat';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const language = useAppSelector((state) => state.ui.language);
  const vatRate = useVatRate();
  const { currentOrder, getOrderById, formatOrderDate } = useOrdersViewModel();
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  useAuthViewModel();
  const [confirmingPayment] = useState(false);


  useEffect(() => {
    if (orderId) {
      checkAndConfirmPayment();
    }
  }, [orderId]);

  const checkAndConfirmPayment = async () => {
    if (!orderId) return;

    // Verify payment with Klarna/Kustom and process if completed
    // This handles the case where push notifications don't arrive
    try {
      await ordersApi.getKlarnaConfirmation(orderId);
    } catch (error) {
      // Confirmation check may fail if no payment record exists yet - that's OK
      console.log('Klarna confirmation check:', error);
    }

    await loadOrderData();
  };

  const loadOrderData = async () => {
    if (!orderId) return;

    await getOrderById(orderId);

    // Load payment summary for partial payment orders
    try {
      const response = await ordersApi.getPaymentStatus(orderId);
      setPaymentSummary(response.data ?? null);
    } catch (error) {
      console.error('Failed to load payment summary:', error);
    }
  };

  const handlePayFinal = () => {
    navigate(`/klarna-checkout/${orderId}?phase=final`);
  };

  if (!currentOrder || confirmingPayment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner className="mb-4" />
          {confirmingPayment && (
            <p className="text-gray-500 dark:text-neutral-400">
              {language === 'en' ? 'Confirming payment...' : 'Bekräftar betalning...'}
            </p>
          )}
        </div>
      </div>
    );
  }

  const orderDiscount = Number(currentOrder.discountAmount || 0);
  const orderGrossTotal = netToGross(Number(currentOrder.totalAmount) + orderDiscount, vatRate) - orderDiscount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-white font-sans selection:bg-primary-600 selection:text-white relative">
          <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-900 via-surface-850 to-surface-950"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 mix-blend-multiply"></div>
      </div>

      <Header mode="page" />
      <main className="max-w-4xl mx-auto px-4 py-12 pt-28 relative z-10">
    <div className="text-center mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
          <Lottie animationData={successCheckmarkAnimation} loop={false} />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-thin mb-3 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
          {language === 'en' ? 'Order Confirmed!' : 'Beställning Bekräftad!'}
        </h1>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500 mt-2">
          {language === 'en' ? 'Thank You' : 'Tack'}
        </p>
      </div>

      <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl border border-gray-200 dark:border-surface-700 p-4 sm:p-6 lg:p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className="bg-primary-600/10 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-thin text-gray-900 dark:text-white">
            {language === 'en' ? 'Order Details' : 'Beställningsdetaljer'}
          </h2>
        </div>
        <div className="space-y-3 bg-gray-100 dark:bg-surface-800 rounded-2xl p-5">
          <div className="flex justify-between pb-3 border-b border-gray-200 dark:border-surface-600">
            <span className="text-gray-500 dark:text-neutral-400 font-medium">{language === 'en' ? 'Order Number' : 'Ordernummer'}:</span>
            <span className="font-bold text-primary-600 dark:text-primary-400">{currentOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-gray-200 dark:border-surface-600">
            <span className="text-gray-500 dark:text-neutral-400 font-medium">{language === 'en' ? 'Date' : 'Datum'}:</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatOrderDate(currentOrder)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-neutral-400 font-medium">{language === 'en' ? 'Status' : 'Status'}:</span>
            <span className="font-bold text-gray-900 dark:text-white capitalize">{currentOrder.status}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Payment Progress for Partial Payments */}
      {currentOrder.requiresPartialPayment && paymentSummary && (
        <div className="bg-white dark:bg-surface-850 rounded-2xl shadow-light-xl dark:shadow-dark-xl border border-gray-200 dark:border-surface-700 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-primary-600/10 p-3 rounded-xl mr-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-thin text-gray-900 dark:text-white">
              {language === 'en' ? 'Payment Progress' : 'Betalningsframsteg'}
            </h2>
          </div>

          {/* Payment Timeline */}
          <div className="relative bg-gray-100 dark:bg-surface-800 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-8">
              {/* Initial Payment */}
              <div className="flex-1">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-light-md dark:shadow-dark-md ${paymentSummary.initialPayment?.status === 'succeeded'
                    ? 'bg-gradient-to-br from-green-100 dark:from-green-900/30 to-emerald-100 dark:to-emerald-900/30 text-green-400 border-4 border-white dark:border-surface-850'
                    : 'bg-surface-700 text-gray-500 dark:text-neutral-400'
                }`}>
                  {paymentSummary.initialPayment?.status === 'succeeded' ? (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold">1</span>
                  )}
                </div>
                <p className="text-center text-sm font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? 'Initial Payment' : 'Första Betalningen'}
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-neutral-400 mt-1 font-semibold">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency }).format(orderGrossTotal * 0.5)}
                </p>
              </div>

              {/* Progress Line */}
              <div className="flex-1 h-2 bg-surface-700 mx-2 sm:mx-4 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${paymentSummary.finalPayment?.status === 'succeeded'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full'
                      : 'bg-surface-700 w-0'
                  }`}
                />
              </div>

              {/* Final Payment */}
              <div className="flex-1">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-light-md dark:shadow-dark-md ${paymentSummary.finalPayment?.status === 'succeeded'
                    ? 'bg-gradient-to-br from-green-100 dark:from-green-900/30 to-emerald-100 dark:to-emerald-900/30 text-green-400 border-4 border-white dark:border-surface-850'
                    : currentOrder.readyForFinalPayment
                    ? 'bg-gradient-to-br from-primary-600/20 to-primary-600/10 text-primary-600 dark:text-primary-400 border-4 border-white dark:border-surface-850'
                    : 'bg-surface-700 text-gray-500 dark:text-neutral-400'
                }`}>
                  {paymentSummary.finalPayment?.status === 'succeeded' ? (
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-lg sm:text-xl font-bold">2</span>
                  )}
                </div>
                <p className="text-center text-sm font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? 'Final Payment' : 'Slutbetalning'}
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-neutral-400 mt-1 font-semibold">
                  {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency }).format(orderGrossTotal * 0.5)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {paymentSummary.nextAction === 'wait_for_ready' && (
            <div className="mt-6 bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-5 shadow-light-md dark:shadow-dark-md">
              <div className="flex items-start">
                <div className="bg-primary-600/10 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                    {language === 'en' ? 'Awaiting Preparation' : 'Väntar på Förberedelse'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-neutral-300 mt-1 leading-relaxed">
                    {language === 'en'
                      ? 'Your initial payment has been received. We\'re preparing your order and will notify you when the final payment is due.'
                      : 'Din första betalning har mottagits. Vi förbereder din beställning och meddelar dig när slutbetalningen ska göras.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentSummary.nextAction === 'pay_final' && currentOrder.readyForFinalPayment && (
            <div className="mt-6 bg-primary-600/10 border-2 border-primary-500/30 rounded-xl p-5 shadow-light-md dark:shadow-dark-md">
              <div className="flex items-start">
                <div className="bg-primary-600/10 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 ml-3">
                  <h3 className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                    {language === 'en' ? 'Ready for Final Payment!' : 'Redo för Slutbetalning!'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-neutral-300 mt-1 mb-4 leading-relaxed">
                    {language === 'en'
                      ? 'Your order is ready! Complete the final payment to proceed with delivery.'
                      : 'Din beställning är klar! Slutför slutbetalningen för att fortsätta med leveransen.'}
                  </p>
                  <button
                    onClick={handlePayFinal}
                    className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-500 transition-all shadow-light-md dark:shadow-dark-md hover:shadow-light-lg dark:hover:shadow-dark-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    <span>{language === 'en' ? 'Pay Final Amount' : 'Betala Slutbelopp'}</span>{' '}
                    <span className="whitespace-nowrap">({new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency }).format(orderGrossTotal * (paymentSummary.amountRemaining / Number(currentOrder.totalAmount)))})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentSummary.nextAction === 'completed' && (
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 rounded-xl p-5 shadow-light-md dark:shadow-dark-md">
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-green-400 text-lg">
                    {language === 'en' ? 'Payment Complete!' : 'Betalning Slutförd!'}
                  </h3>
                  <p className="text-sm text-green-400/80 mt-1 leading-relaxed">
                    {language === 'en'
                      ? 'All payments have been received. Your order is being processed for delivery.'
                      : 'Alla betalningar har mottagits. Din beställning behandlas för leverans.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-surface-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Amount Paid' : 'Betalt Belopp'}:</span>
              <span className="font-medium text-green-400">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency }).format(orderGrossTotal * (paymentSummary.amountPaid / Number(currentOrder.totalAmount)))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-neutral-400">{language === 'en' ? 'Remaining' : 'Återstående'}:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency }).format(orderGrossTotal * (paymentSummary.amountRemaining / Number(currentOrder.totalAmount)))}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      <div className="bg-white dark:bg-surface-850 shadow-light-md dark:shadow-dark-md rounded-2xl p-4 sm:p-6 mb-6 border border-gray-200 dark:border-surface-700">
        <h2 className="text-xl font-thin mb-4 text-gray-900 dark:text-white">
          {language === 'en' ? 'Items' : 'Artiklar'}
        </h2>
        <div className="space-y-3">
          {currentOrder.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.serviceName} x {item.quantity}</span>
              <span className="font-medium">
                {netToGross(item.price * item.quantity, vatRate).toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currentOrder.currency}
              </span>
            </div>
          ))}
          {orderDiscount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>{language === 'en' ? 'Coupon Discount' : 'Kupongrabatt'}</span>
              <span className="font-medium">-{orderDiscount.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currentOrder.currency}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-surface-600 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>{language === 'en' ? 'Total' : 'Totalt'}:</span>
              <span className="text-primary-600 dark:text-primary-400">{new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currentOrder.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(orderGrossTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/" className="btn-primary inline-block">
          {language === 'en' ? 'Back to Home' : 'Tillbaka till Startsidan'}
        </Link>
      </div>
      </main>

      {/* Footer */}
      <DynamicFooter />

      {/* Shopping Cart */}
      <ShoppingCart />
    </div>
  );
};

export default OrderConfirmation;