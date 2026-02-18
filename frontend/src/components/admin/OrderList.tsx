import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import apiClient from '../../models/api/apiClient';
import { ordersApi } from '../../models/api/ordersApi';
import { Order, OrderStatus, PaymentSummary } from '../../models/types/order.types';
import { FaTimes, FaEye, FaCheck, FaShoppingBag, FaUser, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const OrderList: React.FC = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isMarkingReady, setIsMarkingReady] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  useEffect(() => {
    if (selectedOrder?.requiresPartialPayment) {
      loadPaymentSummary(selectedOrder.id);
    } else {
      setPaymentSummary(null);
    }
  }, [selectedOrder]);

  const loadPaymentSummary = async (orderId: string) => {
    try {
      const response = await ordersApi.getPaymentStatus(orderId);
      if (response.data) {
        setPaymentSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load payment summary:', error);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: 1, limit: 100 };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await apiClient.get<any>('/orders', params);
      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleMarkReadyForFinalPayment = async (orderId: string) => {
    setIsMarkingReady(true);
    try {
      await ordersApi.markReadyForFinalPayment(orderId);
      toast.success('Order marked as ready for final payment successfully!');

      await loadOrders();

      if (selectedOrder && selectedOrder.id === orderId) {
        const summaryResponse = await ordersApi.getPaymentStatus(orderId);
        if (summaryResponse.data) {
          setPaymentSummary(summaryResponse.data);
        }

        const orderResponse = await apiClient.get<any>(`/orders/${orderId}`);
        if (orderResponse.success && orderResponse.data) {
          setSelectedOrder(orderResponse.data);
        }
      }
    } catch (error: any) {
      console.error('Failed to mark order ready:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark order ready. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsMarkingReady(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: 'bg-yellow-900/30 text-yellow-400',
      partial_paid: 'bg-orange-900/30 text-orange-400',
      awaiting_final: 'bg-purple-900/30 text-purple-400',
      paid: 'bg-green-900/30 text-green-400',
      completed: 'bg-blue-900/30 text-blue-400',
      cancelled: 'bg-red-900/30 text-red-400',
    };
    return colors[status] || 'bg-surface-800 text-neutral-200';
  };

  const filterOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'completed', label: 'Done' },
    { value: 'partial_paid', label: 'Partial' },
    { value: 'awaiting_final', label: 'Awaiting' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Orders Management</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">{orders.length} orders total</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors active:scale-[0.98] ${
                filter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 text-neutral-300 hover:bg-surface-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{order.orderNumber}</h3>
                  {order.requiresPartialPayment && (
                    <span className="text-[10px] bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded-full font-medium">
                      Partial
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  {order.firstName} {order.lastName}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-white">
                {formatCurrency(order.totalAmount, order.currency)}
              </span>
              <span className="text-xs text-neutral-400">
                {formatDateShort(order.createdAt)}
              </span>
            </div>

            <button
              onClick={() => setSelectedOrder(order)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500 active:scale-[0.98]"
            >
              <FaEye className="text-[10px]" />
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-700">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-700">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{order.orderNumber}</div>
                    {order.requiresPartialPayment && (
                      <span className="text-[10px] bg-purple-900/30 text-purple-400 px-1.5 py-0.5 rounded-full font-medium">
                        Partial
                      </span>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {order.firstName} {order.lastName}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-400 truncate max-w-[180px]">{order.email}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="text-2xl text-neutral-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">No orders found</h3>
            <p className="text-sm text-neutral-400">
              {filter !== 'all' ? `No orders with status "${filter}"` : 'No orders yet'}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Empty State */}
      {orders.length === 0 && (
        <div className="sm:hidden text-center py-12">
          <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShoppingBag className="text-2xl text-neutral-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No orders found</h3>
          <p className="text-sm text-neutral-400">
            {filter !== 'all' ? `No orders with status "${filter}"` : 'No orders yet'}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-[60] p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface-850 w-full sm:rounded-2xl sm:max-w-2xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-850 px-4 sm:px-6 py-4 border-b border-surface-700 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">Order Details</h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-400 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Customer Information */}
              <div className="bg-surface-800 rounded-xl p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FaUser className="text-primary-400" />
                  Customer Information
                </h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold">Name</dt>
                    <dd className="text-sm text-white font-medium mt-0.5">
                      {selectedOrder.firstName} {selectedOrder.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold flex items-center gap-1">
                      <FaEnvelope className="text-neutral-500" /> Email
                    </dt>
                    <dd className="text-sm text-white font-medium mt-0.5 break-all">{selectedOrder.email}</dd>
                  </div>
                  {selectedOrder.address && (
                    <>
                      <div className="sm:col-span-2">
                        <dt className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold flex items-center gap-1">
                          <FaMapMarkerAlt className="text-neutral-500" /> Address
                        </dt>
                        <dd className="text-sm text-white font-medium mt-0.5">
                          {selectedOrder.address}, {selectedOrder.postalCode} {selectedOrder.city}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FaShoppingBag className="text-primary-400" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-surface-800 rounded-lg"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{item.serviceName}</div>
                        <div className="text-xs text-neutral-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          {formatCurrency(item.price * item.quantity, selectedOrder.currency)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {formatCurrency(item.price, selectedOrder.currency)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-surface-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-xl font-bold text-primary-400">
                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                  </span>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-surface-800 rounded-xl p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FaCalendarAlt className="text-primary-400" />
                  Order Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Current Status:</span>
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Created:</span>
                    <span className="text-xs text-white font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  {selectedOrder.paymentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <FaCreditCard className="text-neutral-500" /> Payment ID:
                      </span>
                      <span className="text-xs text-white font-mono truncate max-w-[150px]">
                        {selectedOrder.paymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Progress (for partial payment orders) */}
              {selectedOrder.requiresPartialPayment && paymentSummary && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-3">Payment Progress</h4>

                  {/* Payment Timeline */}
                  <div className="space-y-3 mb-4">
                    {/* Initial Payment */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {paymentSummary.initialPayment?.status === 'succeeded' ? (
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-neutral-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-bold text-white">Initial (50%)</p>
                            <p className="text-[10px] text-neutral-400">
                              {paymentSummary.initialPayment?.status === 'succeeded' ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(paymentSummary.initialPayment?.amount || 0, selectedOrder.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Final Payment */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {paymentSummary.finalPayment?.status === 'succeeded' ? (
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                            <FaCheck className="text-white text-xs" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-neutral-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-bold text-white">Final (50%)</p>
                            <p className="text-[10px] text-neutral-400">
                              {paymentSummary.finalPayment?.status === 'succeeded'
                                ? 'Completed'
                                : selectedOrder.readyForFinalPayment
                                ? 'Ready'
                                : 'Awaiting'}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(paymentSummary.finalPayment?.amount || 0, selectedOrder.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border-t border-blue-500/30 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Paid:</span>
                      <span className="font-bold text-green-400">
                        {formatCurrency(paymentSummary.amountPaid, selectedOrder.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Remaining:</span>
                      <span className="font-bold text-orange-400">
                        {formatCurrency(paymentSummary.amountRemaining, selectedOrder.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Admin Action: Mark Ready for Final Payment */}
                  {selectedOrder.status === 'partial_paid' && !selectedOrder.readyForFinalPayment && (
                    <div className="mt-4 pt-4 border-t border-blue-500/30">
                      <button
                        onClick={() => handleMarkReadyForFinalPayment(selectedOrder.id)}
                        disabled={isMarkingReady}
                        className="w-full px-4 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                      >
                        {isMarkingReady ? 'Marking Ready...' : 'Mark Ready for Final Payment'}
                      </button>
                      <p className="text-[10px] text-neutral-400 mt-2 text-center">
                        This will allow the customer to pay the remaining 50%
                      </p>
                    </div>
                  )}

                  {/* Status Message */}
                  {selectedOrder.readyForFinalPayment && selectedOrder.status === 'awaiting_final' && (
                    <div className="mt-4 pt-4 border-t border-blue-500/30">
                      <p className="text-xs text-purple-400 font-bold flex items-center gap-1.5">
                        <FaCheck className="text-purple-400" />
                        Ready for final payment
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Update Status */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white mb-3">Update Status</h4>
                {selectedOrder.status === 'cancelled' ? (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-xs sm:text-sm text-red-400 font-bold">
                      This order has been cancelled and cannot be modified.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {(['pending', 'paid', 'completed', 'cancelled'] as OrderStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                        className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors active:scale-[0.98] ${
                          selectedOrder.status === status
                            ? 'bg-surface-800 text-neutral-500 cursor-not-allowed'
                            : status === 'cancelled'
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-primary-600 text-white hover:bg-primary-500'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
