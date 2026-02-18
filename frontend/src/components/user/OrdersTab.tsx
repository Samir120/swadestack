import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/Toast';
import apiClient from '../../models/api/apiClient';
import { ordersApi } from '../../models/api/ordersApi';
import { PaymentSummary } from '../../models/types/order.types';
import { useAppSelector } from '../../store/hooks';
import { useConfirm } from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross } from '../../utils/vat';

const OrdersTab: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const vatRate = useVatRate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [filter, setFilter] = useState('all');

  const calcGross = (net: number, discount: number) => netToGross(net + discount, vatRate) - discount;
  const selectedOrderDiscount = Number(selectedOrder?.discountAmount || 0);
  const selectedOrderGross = selectedOrder ? calcGross(Number(selectedOrder.totalAmount), selectedOrderDiscount) : 0;

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await apiClient.get<any[]>('/user/orders', params);
      if (response.success) {
        setOrders(response.data as any[]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const response = await apiClient.get<any>(`/user/orders/${orderId}`);
      if (response.success) {
        const orderData = response.data as any;
        setSelectedOrder(orderData);

        if (
          orderData.requiresPartialPayment &&
          orderData.status !== 'cancelled' &&
          orderData.status !== 'completed'
        ) {
          try {
            const paymentResponse = await ordersApi.getPaymentStatus(orderId);
            setPaymentSummary(paymentResponse.data || null);
          } catch (error) {
            console.error('Failed to load payment summary:', error);
            setPaymentSummary(null);
          }
        } else {
          setPaymentSummary(null);
        }
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  };

  const handlePayFinal = (orderId: string) => {
    navigate(`/klarna-checkout/${orderId}?phase=final`);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = await confirm({
      title: language === 'en' ? 'Cancel Order' : 'Avbryt beställning',
      message: language === 'en'
        ? 'Are you sure you want to cancel this order? This action cannot be undone.'
        : 'Är du säker på att du vill avbryta denna beställning? Denna åtgärd kan inte ångras.',
      confirmText: language === 'en' ? 'Yes, Cancel' : 'Ja, avbryt',
      cancelText: language === 'en' ? 'Keep Order' : 'Behåll',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await apiClient.post<any>(`/user/orders/${orderId}/cancel`);
      if (response.success) {
        loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(response.data);
        }
        toast.success(language === 'en' ? 'Order cancelled successfully' : 'Beställning avbruten');
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Failed to cancel order' : 'Kunde inte avbryta beställning'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'paid':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'partial_paid':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'awaiting_final':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-surface-800 text-gray-700 dark:text-neutral-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { en: string; sv: string } } = {
      all: { en: 'All', sv: 'Alla' },
      pending: { en: 'Pending', sv: 'Väntande' },
      partial_paid: { en: 'Partial', sv: 'Delbet.' },
      awaiting_final: { en: 'Awaiting', sv: 'Väntar' },
      paid: { en: 'Paid', sv: 'Betald' },
      completed: { en: 'Done', sv: 'Klar' },
      cancelled: { en: 'Cancelled', sv: 'Avbruten' },
    };
    return labels[status]?.[language === 'en' ? 'en' : 'sv'] || status;
  };

  const getFullStatusLabel = (status: string) => {
    const labels: { [key: string]: { en: string; sv: string } } = {
      pending: { en: 'Pending', sv: 'Väntande' },
      partial_paid: { en: 'Partial Paid', sv: 'Delbetalad' },
      awaiting_final: { en: 'Awaiting Final', sv: 'Väntar slutbetalning' },
      paid: { en: 'Paid', sv: 'Betald' },
      completed: { en: 'Completed', sv: 'Slutförd' },
      cancelled: { en: 'Cancelled', sv: 'Avbruten' },
    };
    return labels[status]?.[language === 'en' ? 'en' : 'sv'] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">
          {language === 'en' ? 'Loading orders...' : 'Laddar beställningar...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filter - Simple grid layout */}
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
        {['all', 'pending', 'paid', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-[10px] sm:text-sm transition-all ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-surface-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-surface-700'
            }`}
          >
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-gray-100 dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gray-200 dark:bg-surface-700 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-700 dark:text-neutral-300 text-sm sm:text-base font-bold mb-1">
            {language === 'en' ? 'No orders found' : 'Inga beställningar hittades'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
            {language === 'en'
              ? 'Your orders will appear here.'
              : 'Dina beställningar visas här.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-surface-850 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-surface-700 hover:shadow-light-md dark:hover:shadow-dark-md transition-all cursor-pointer"
              onClick={() => loadOrderDetails(order.id)}
            >
              {/* Header Row */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                    #{order.orderNumber}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full flex-shrink-0 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                  {calcGross(Number(order.totalAmount), Number(order.discountAmount || 0)).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {order.currency}
                </p>
                {order.items && (
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400">
                    {order.items.length} {language === 'en' ? 'items' : 'artiklar'}
                  </span>
                )}
              </div>

              {/* Partial Payment Badge */}
              {order.requiresPartialPayment && order.status !== 'cancelled' && order.status !== 'completed' && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {language === 'en' ? 'Partial Payment' : 'Delbetalning'}
                  </span>
                </div>
              )}

              {/* Actions */}
              {(order.status === 'pending' || (order.status === 'awaiting_final' && order.readyForFinalPayment)) && (
                <div className="pt-3 border-t border-gray-200 dark:border-surface-700 flex gap-2">
                  {order.status === 'awaiting_final' && order.readyForFinalPayment && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayFinal(order.id);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold"
                    >
                      {language === 'en' ? 'Pay Final' : 'Slutbetala'}
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelOrder(order.id);
                      }}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs sm:text-sm font-bold"
                    >
                      {language === 'en' ? 'Cancel' : 'Avbryt'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white dark:bg-surface-850 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-surface-850 border-b border-gray-200 dark:border-surface-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {language === 'en' ? 'Order Details' : 'Beställningsdetaljer'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-400 truncate">
                    #{selectedOrder.orderNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-surface-700 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Status & Amount */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getFullStatusLabel(selectedOrder.status)}
                </span>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {selectedOrderGross.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency}
                </p>
              </div>

              {/* Date */}
              <div className="bg-gray-100 dark:bg-surface-800 p-3 rounded-lg">
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-medium tracking-wider mb-1">
                  {language === 'en' ? 'Order Date' : 'Beställningsdatum'}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Payment Progress */}
              {selectedOrder.requiresPartialPayment &&
               paymentSummary &&
               selectedOrder.status !== 'cancelled' &&
               selectedOrder.status !== 'completed' && (
                <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700/30 p-3 rounded-lg">
                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'en' ? 'Payment Progress' : 'Betalningsförlopp'}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      paymentSummary.initialPayment?.status === 'succeeded'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-surface-700 text-gray-500 dark:text-neutral-400'
                    }`}>
                      {paymentSummary.initialPayment?.status === 'succeeded' ? '✓' : '1'}
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-surface-700 rounded">
                      <div className={`h-full rounded ${
                        paymentSummary.finalPayment?.status === 'succeeded' ? 'bg-green-500 w-full' : 'bg-blue-400 w-1/2'
                      }`} />
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      paymentSummary.finalPayment?.status === 'succeeded'
                        ? 'bg-green-500 text-white'
                        : selectedOrder.readyForFinalPayment
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-surface-700 text-gray-500 dark:text-neutral-400'
                    }`}>
                      {paymentSummary.finalPayment?.status === 'succeeded' ? '✓' : '2'}
                    </div>
                  </div>

                  {paymentSummary.nextAction === 'pay_final' && (
                    <button
                      onClick={() => handlePayFinal(selectedOrder.id)}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm"
                    >
                      {language === 'en' ? 'Pay Final' : 'Slutbetala'} ({(selectedOrderGross * 0.5).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency})
                    </button>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-gray-100 dark:bg-surface-800 p-3 rounded-lg">
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-medium tracking-wider mb-1">
                  {language === 'en' ? 'Customer' : 'Kund'}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedOrder.firstName} {selectedOrder.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{selectedOrder.email}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-medium tracking-wider mb-2">
                  {language === 'en' ? 'Items' : 'Artiklar'}
                </p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start p-2 bg-gray-100 dark:bg-surface-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400">{item.quantity} × {netToGross(Number(item.price), vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white ml-2">
                        {netToGross(item.quantity * Number(item.price), vatRate).toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency}
                      </p>
                    </div>
                  ))}
                  {selectedOrderDiscount > 0 && (
                    <div className="flex justify-between items-center p-2 text-green-600 dark:text-green-400">
                      <p className="text-xs font-bold">{language === 'en' ? 'Coupon Discount' : 'Kupongrabatt'}</p>
                      <p className="text-xs font-bold">-{selectedOrderDiscount.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-2 border-t border-gray-200 dark:border-surface-600">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{language === 'en' ? 'Total' : 'Totalt'}</p>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{selectedOrderGross.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} {selectedOrder.currency}</p>
                  </div>
                </div>
              </div>

              {/* Cancel Button */}
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="w-full px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-bold text-sm"
                >
                  {language === 'en' ? 'Cancel Order' : 'Avbryt beställning'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
