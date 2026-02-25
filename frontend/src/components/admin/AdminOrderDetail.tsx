import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { ordersApi } from '../../models/api/ordersApi';
import {
  AdminOrderDetail as AdminOrderDetailType,
  InternalNote,
  AuditLogEntry,
  EmailHistoryEntry,
} from '../../models/types/customer.types';
import {
  FaChevronRight,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaShoppingBag,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaHistory,
  FaStickyNote,
  FaPaperPlane,
  FaExternalLinkAlt,
  FaLock,
  FaLockOpen,
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import AdminPriceDisplay, { formatAdminCurrency } from './common/AdminPriceDisplay';
import AdminPriceInput from './common/AdminPriceInput';
import { useVatRate } from '../../hooks/useVatRate';
import { netToGross, vatAmount as calcVatAmount, vatPercent } from '../../utils/vat';
import OrderItemPicker from './OrderItemPicker';

type TabKey = 'details' | 'notes' | 'activity' | 'emails';

// ==================== Confirmation Modal ====================
const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, confirmLabel, confirmClass, isLoading, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-surface-850 rounded-2xl border border-surface-700 shadow-dark-lg w-full max-w-md p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{message}</p>
        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50 ${
              confirmClass || 'bg-primary-600 hover:bg-primary-500'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Order state
  const [order, setOrder] = useState<AdminOrderDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>((searchParams.get('tab') as TabKey) || 'details');

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editItems, setEditItems] = useState<Array<{ id?: string; serviceName: string; serviceDescription?: string; quantity: number; price: number; pcComponentId?: string; pcConfigurationId?: string }>>([]);
  const [editStatus, setEditStatus] = useState<string>('');
  const [newAdjustment, setNewAdjustment] = useState<{ type: string; description: string; amount: string }>({ type: 'discount', description: '', amount: '' });
  const [pendingAdjustments, setPendingAdjustments] = useState<Array<{ type: string; description: string; amount: number }>>([]);
  const [deleteAdjustmentModal, setDeleteAdjustmentModal] = useState<string | null>(null);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // Lock state for completed/cancelled orders
  const [isLockOverridden, setIsLockOverridden] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [deleteNoteModal, setDeleteNoteModal] = useState<string | null>(null);

  // Activity state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  // Emails state
  const [emailHistory, setEmailHistory] = useState<EmailHistoryEntry[]>([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  // VAT rate
  const vatRate = useVatRate();

  // ==================== Data Loading ====================

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await ordersApi.getAdminDetail(id);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast.error('Order not found');
        navigate('/admin/orders');
      }
    } catch {
      toast.error('Failed to load order');
      navigate('/admin/orders');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    setNotesLoading(true);
    try {
      const response = await ordersApi.getOrderNotes(id);
      if (response.success && response.data) {
        setNotes(response.data.notes);
      }
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  }, [id, toast]);

  const loadActivity = useCallback(async () => {
    if (!id) return;
    setAuditLogsLoading(true);
    try {
      const response = await ordersApi.getOrderActivity(id);
      if (response.success && response.data) {
        setAuditLogs(response.data.logs);
      }
    } catch {
      // Silently fail
    } finally {
      setAuditLogsLoading(false);
    }
  }, [id]);

  const loadEmailHistory = useCallback(async () => {
    if (!id) return;
    setEmailHistoryLoading(true);
    try {
      const response = await ordersApi.getOrderEmails(id);
      if (response.success && response.data) {
        setEmailHistory(response.data.emails);
      }
    } catch {
      toast.error('Failed to load email history');
    } finally {
      setEmailHistoryLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (activeTab === 'notes' && id) loadNotes();
    if (activeTab === 'activity' && id) loadActivity();
    if (activeTab === 'emails' && id) loadEmailHistory();
  }, [activeTab, id, loadNotes, loadActivity, loadEmailHistory]);

  // ==================== Edit Mode ====================

  const startEditing = () => {
    if (!order) return;
    setEditItems(order.items.map(item => ({
      id: item.id,
      serviceName: item.serviceName,
      serviceDescription: item.serviceDescription || '',
      quantity: item.quantity,
      price: item.price,
      pcComponentId: item.pcComponentId,
      pcConfigurationId: item.pcConfigurationId,
    })));
    setEditStatus(order.status);
    setPendingAdjustments([]);
    setNewAdjustment({ type: 'discount', description: '', amount: '' });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditItems([]);
    setPendingAdjustments([]);
  };

  const handleSaveChanges = async () => {
    if (!id || !order) return;
    setIsSaving(true);
    try {
      const data: {
        items?: typeof editItems;
        adjustments?: typeof pendingAdjustments;
        status?: string;
      } = {};

      // Only send items if they changed
      const itemsChanged = JSON.stringify(editItems) !== JSON.stringify(
        order.items.map(i => ({ id: i.id, serviceName: i.serviceName, serviceDescription: i.serviceDescription || '', quantity: i.quantity, price: i.price }))
      );
      if (itemsChanged) data.items = editItems;
      if (pendingAdjustments.length > 0) data.adjustments = pendingAdjustments;
      if (editStatus !== order.status) data.status = editStatus;

      if (!data.items && !data.adjustments && !data.status) {
        toast.info('No changes to save');
        setIsEditing(false);
        setIsSaving(false);
        return;
      }

      const response = await ordersApi.modifyOrder(id, data);
      if (response.success && response.data) {
        const orderData = response.data;
        const balanceInfo = (orderData as any).balanceInfo;
        setOrder(orderData);
        setIsEditing(false);
        if (balanceInfo && balanceInfo.balanceDue > 0) {
          toast.success(`Order updated. Balance due of ${formatCurrency(balanceInfo.balanceDue, orderData.currency)} created and customer notified.`);
        } else {
          toast.success('Order updated');
        }
      } else {
        toast.error('Failed to update order');
      }
    } catch {
      toast.error('Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = () => {
    setEditItems([...editItems, { serviceName: '', serviceDescription: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...editItems];
    (updated[index] as any)[field] = value;
    setEditItems(updated);
  };

  const handleAddAdjustment = () => {
    const amount = parseFloat(newAdjustment.amount);
    if (!newAdjustment.description.trim() || isNaN(amount)) return;
    setPendingAdjustments([...pendingAdjustments, {
      type: newAdjustment.type,
      description: newAdjustment.description,
      amount,
    }]);
    setNewAdjustment({ type: 'discount', description: '', amount: '' });
  };

  const handleRemovePendingAdjustment = (index: number) => {
    setPendingAdjustments(pendingAdjustments.filter((_, i) => i !== index));
  };

  const handleDeleteAdjustment = async () => {
    if (!id || !deleteAdjustmentModal) return;
    try {
      const response = await ordersApi.deleteAdjustment(id, deleteAdjustmentModal);
      if (response.success) {
        toast.success('Adjustment removed');
        setDeleteAdjustmentModal(null);
        loadOrder();
      }
    } catch {
      toast.error('Failed to remove adjustment');
    }
  };

  // ==================== Notes Actions ====================

  const handleCreateNote = async () => {
    if (!id || !newNoteContent.trim()) return;
    setNoteSaving(true);
    try {
      const response = await ordersApi.createOrderNote(id, newNoteContent);
      if (response.success) {
        setNewNoteContent('');
        loadNotes();
        toast.success('Note added');
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return;
    try {
      const response = await ordersApi.updateOrderNote(noteId, editingNoteContent);
      if (response.success) {
        setEditingNoteId(null);
        loadNotes();
        toast.success('Note updated');
      }
    } catch {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteModal) return;
    try {
      const response = await ordersApi.deleteOrderNote(deleteNoteModal);
      if (response.success) {
        setDeleteNoteModal(null);
        loadNotes();
        toast.success('Note deleted');
      }
    } catch {
      toast.error('Failed to delete note');
    }
  };

  // ==================== Email Actions ====================

  const handleSendEmail = async () => {
    if (!id || !emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    try {
      const response = await ordersApi.sendOrderEmail(id, { subject: emailSubject, body: emailBody });
      if (response.success) {
        setShowSendEmail(false);
        setEmailSubject('');
        setEmailBody('');
        loadEmailHistory();
        toast.success('Email queued');
      }
    } catch {
      toast.error('Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  // ==================== Lock Override ====================

  const isLockedStatus = order?.status === 'completed' || order?.status === 'cancelled';

  const handleOverrideLock = async () => {
    if (!id) return;
    setOverrideLoading(true);
    try {
      const response = await ordersApi.overrideLock(id);
      if (response.success) {
        setIsLockOverridden(true);
        setShowOverrideModal(false);
        toast.success('Order unlocked for editing');
      }
    } catch {
      toast.error('Failed to override lock');
    } finally {
      setOverrideLoading(false);
    }
  };

  // ==================== Helpers ====================

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const formatCurrency = formatAdminCurrency;

  const formatDateWithTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-900/30 text-amber-400',
      partial_paid: 'bg-orange-900/30 text-orange-400',
      awaiting_final: 'bg-purple-900/30 text-purple-400',
      paid: 'bg-green-900/30 text-green-400',
      processing: 'bg-blue-900/30 text-blue-400',
      completed: 'bg-emerald-900/30 text-emerald-400',
      cancelled: 'bg-gray-900/30 text-gray-400',
      refunded: 'bg-red-900/30 text-red-400',
    };
    return colors[status] || 'bg-surface-800 text-neutral-200';
  };

  const getAdjustmentColor = (type: string) => {
    const colors: Record<string, string> = {
      discount: 'text-green-400',
      fee: 'text-orange-400',
      correction: 'text-blue-400',
      refund: 'text-red-400',
    };
    return colors[type] || 'text-neutral-400';
  };

  const getAuditActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'order_modified': 'Modified order',
      'order_status_changed': 'Changed order status',
      'order_items_updated': 'Updated line items',
      'adjustment_added': 'Added adjustment',
      'adjustment_removed': 'Removed adjustment',
      'note_added': 'Added note',
      'note_deleted': 'Deleted note',
      'email_sent': 'Sent email',
      'send_custom_email': 'Sent custom email',
      'modify_order': 'Modified order',
      'order.lock_overridden': 'Overrode edit lock',
      'order.modified': 'Modified order',
    };
    return labels[action] || action;
  };

  const getEmailTypeIcon = (templateType: string) => {
    const icons: Record<string, string> = {
      'order-confirmation': 'text-emerald-400',
      'order-status-update': 'text-purple-400',
      'admin-custom': 'text-cyan-400',
      'invoice': 'text-blue-400',
      'payment-reminder': 'text-amber-400',
    };
    return icons[templateType] || 'text-neutral-400';
  };

  const getEmailStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      sent: 'bg-green-900/30 text-green-400',
      pending: 'bg-amber-900/30 text-amber-400',
      queued: 'bg-blue-900/30 text-blue-400',
      failed: 'bg-red-900/30 text-red-400',
    };
    return map[status] || 'bg-surface-800 text-neutral-200';
  };


  // ==================== Render ====================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4 sm:mb-6">
        <Link to="/admin/orders" className="hover:text-white transition-colors">
          Orders
        </Link>
        <FaChevronRight className="text-[10px] text-neutral-600" />
        <span className="text-white font-medium">{order.orderNumber}</span>
      </div>

      {/* Locked Order Banner */}
      {isLockedStatus && !isLockOverridden && (
        <div className={`rounded-2xl border p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          order.status === 'completed'
            ? 'bg-amber-900/20 border-amber-600/30'
            : 'bg-surface-800 border-surface-600'
        }`}>
          <div className="flex items-start gap-3">
            <FaLock className={`text-sm mt-0.5 flex-shrink-0 ${
              order.status === 'completed' ? 'text-amber-400' : 'text-neutral-400'
            }`} />
            <div>
              <p className={`text-sm font-bold ${
                order.status === 'completed' ? 'text-amber-400' : 'text-neutral-300'
              }`}>
                This order is {order.status} and locked for editing.
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {order.status === 'completed'
                  ? 'To make changes, override the lock or create a new order.'
                  : 'To make changes, create a new order.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOverrideModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-900/20 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <FaLockOpen className="text-[10px]" /> Override Lock
          </button>
        </div>
      )}

      {/* Order Header Card */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-thin text-white">{order.orderNumber}</h2>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Customer info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-400 mb-3">
              <span className="flex items-center gap-1.5">
                <FaUser className="text-xs text-neutral-500" />
                {order.firstName} {order.lastName}
              </span>
              <span className="flex items-center gap-1.5 break-all sm:break-normal">
                <FaEnvelope className="text-xs text-neutral-500 shrink-0" />
                {order.email}
              </span>
              {order.userId && (
                <Link
                  to={`/admin/customers/${order.userId}`}
                  className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View Customer <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              )}
            </div>

            {/* Address */}
            {order.address && (
              <p className="text-sm text-neutral-400 flex items-start gap-1.5">
                <FaMapMarkerAlt className="text-xs text-neutral-500 mt-0.5 shrink-0" />
                <span>{order.address}, {order.postalCode} {order.city}, {order.country}</span>
              </p>
            )}

            {/* Dates */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="text-neutral-600" />
                Created: {formatDateWithTime(order.createdAt)}
              </span>
              <span>Updated: {getRelativeTime(order.updatedAt)}</span>
            </div>
          </div>

          {/* Total + Edit button */}
          <div className="text-right flex-shrink-0">
            <AdminPriceDisplay price={order.totalAmount} currency={order.currency} primaryClassName="text-2xl font-bold text-primary-400" />
            {order.couponCode && (
              <p className="text-xs text-emerald-400 mt-1">
                Coupon: {order.couponCode} (-{formatCurrency(order.discountAmount || 0, order.currency)})
              </p>
            )}
            {!isEditing && (!isLockedStatus || isLockOverridden) && (
              <button
                onClick={startEditing}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 transition-colors ml-auto"
              >
                <FaEdit className="text-[10px]" /> Edit Order
              </button>
            )}
          </div>
        </div>

        {/* Payment info */}
        {order.payments && order.payments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-700">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FaCreditCard className="text-neutral-500" /> Payments
            </h4>
            <div className="space-y-2">
              {order.payments.map(payment => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 text-sm">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    <span className="text-neutral-400 capitalize">{payment.phase}</span>
                    {payment.paymentIntentId && (
                      <span className="hidden sm:inline text-[10px] text-neutral-500 font-mono">
                        {payment.paymentIntentId.substring(0, 20)}...
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-white shrink-0">{formatCurrency(payment.amount, payment.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-700 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {([
            { key: 'details' as TabKey, label: 'Items', labelFull: 'Items & Adjustments', icon: FaShoppingBag },
            { key: 'notes' as TabKey, label: 'Notes', labelFull: 'Notes', icon: FaStickyNote },
            { key: 'activity' as TabKey, label: 'Activity', labelFull: 'Activity', icon: FaHistory },
            { key: 'emails' as TabKey, label: 'Emails', labelFull: 'Emails', icon: FaPaperPlane },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-surface-600'
              }`}
            >
              <tab.icon className="text-xs" />
              <span className="hidden sm:inline">{tab.labelFull}</span>
              <span className="sm:hidden">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== Details Tab ==================== */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Edit Mode Bar */}
          {isEditing && (
            <div className="bg-primary-900/20 border border-primary-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-primary-400">Edit Mode</h4>
                <p className="text-xs text-neutral-400">Modify line items, add adjustments, or change status.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
                >
                  <FaTimes className="text-[9px]" /> Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                >
                  <FaSave className="text-[9px]" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <FaShoppingBag className="text-primary-400 text-sm" /> Line Items
              </h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowItemPicker(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 transition-colors"
                  >
                    <FaPlus className="text-[9px]" /> Add Item
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    + Custom
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="p-4 sm:p-6 space-y-3">
                {editItems.map((item, index) => (
                  <div key={index} className="bg-surface-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Service Name</label>
                          <input
                            type="text"
                            value={item.serviceName}
                            onChange={(e) => handleItemChange(index, 'serviceName', e.target.value)}
                            className="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Description</label>
                          <input
                            type="text"
                            value={item.serviceDescription || ''}
                            onChange={(e) => handleItemChange(index, 'serviceDescription', e.target.value)}
                            className="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors mt-4"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                      </div>
                      <AdminPriceInput
                        label="Price"
                        value={item.price}
                        onChange={(val) => handleItemChange(index, 'price', parseFloat(val) || 0)}
                        currency={order.currency}
                        min={0}
                        step={0.01}
                        labelClassName="block text-[10px] text-neutral-500 uppercase font-bold mb-1"
                        inputClassName="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    <div className="text-right text-sm text-neutral-400">
                      Subtotal: <AdminPriceDisplay price={item.price * item.quantity} currency={order.currency} primaryClassName="font-bold text-white" />
                    </div>
                  </div>
                ))}
                {editItems.length === 0 && (
                  <p className="text-sm text-neutral-400 text-center py-4">No items. Click "Add Item" to add one.</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-surface-700">
                {order.items.map(item => {
                  // Try to parse PC configuration JSON from serviceDescription
                  let pcConfig: any = null;
                  if (item.serviceDescription) {
                    try {
                      const parsed = JSON.parse(item.serviceDescription);
                      if (parsed && parsed.components) pcConfig = parsed;
                    } catch {
                      // Not JSON, treat as plain text
                    }
                  }

                  return (
                    <div key={item.id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{item.serviceName}</p>
                        {pcConfig ? (
                          <div className="mt-1.5 space-y-0.5">
                            {(['cpu', 'motherboard', 'case', 'psu', 'cooling', 'os'] as const).map(key => {
                              const comp = pcConfig.components[key];
                              if (!comp) return null;
                              return (
                                <p key={key} className="text-xs text-neutral-400">
                                  <span className="text-neutral-500 uppercase">{key === 'cpu' ? 'CPU' : key === 'psu' ? 'PSU' : key === 'os' ? 'OS' : key.charAt(0).toUpperCase() + key.slice(1)}:</span>{' '}
                                  {comp.name_en}
                                </p>
                              );
                            })}
                            {(['rams', 'gpus', 'ssds', 'hdds', 'fans'] as const).map(key => {
                              const arr = pcConfig.components[key];
                              if (!arr || arr.length === 0) return null;
                              const label = key === 'rams' ? 'RAM' : key === 'gpus' ? 'GPU' : key === 'ssds' ? 'SSD' : key === 'hdds' ? 'HDD' : 'Fan';
                              return arr.map((comp: any, i: number) => (
                                <p key={`${key}-${i}`} className="text-xs text-neutral-400">
                                  <span className="text-neutral-500 uppercase">{label}{arr.length > 1 ? ` ${i + 1}` : ''}:</span>{' '}
                                  {comp.name_en}
                                </p>
                              ));
                            })}
                            {pcConfig.includesBuildService && (
                              <p className="text-xs text-primary-400 mt-1">+ Build Service</p>
                            )}
                          </div>
                        ) : item.serviceDescription ? (
                          <p className="text-xs text-neutral-400 mt-0.5">{item.serviceDescription}</p>
                        ) : null}
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Qty: {item.quantity} x <AdminPriceDisplay price={item.price} currency={order.currency} primaryClassName="text-xs text-neutral-500" secondaryClassName="text-[10px] text-neutral-600 font-normal" />
                        </p>
                      </div>
                      <AdminPriceDisplay price={item.price * item.quantity} currency={order.currency} primaryClassName="text-sm font-bold text-white shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adjustments */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
              <h3 className="text-sm sm:text-base font-semibold text-white">Adjustments</h3>
            </div>
            <div className="divide-y divide-surface-700">
              {order.adjustments.map(adj => (
                <div key={adj.id} className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase ${getAdjustmentColor(adj.type)}`}>{adj.type}</span>
                      <span className="text-sm text-white">{adj.description}</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      by {adj.adminUserName} &middot; {getRelativeTime(adj.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${adj.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {adj.amount > 0 ? '+' : ''}{formatCurrency(adj.amount, order.currency)}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => setDeleteAdjustmentModal(adj.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FaTrash className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pending adjustments (during edit) */}
              {pendingAdjustments.map((adj, index) => (
                <div key={`pending-${index}`} className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 bg-primary-900/10">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className={`text-xs font-bold uppercase ${getAdjustmentColor(adj.type)}`}>{adj.type}</span>
                    <span className="text-sm text-white">{adj.description}</span>
                    <span className="text-[10px] text-primary-400 font-bold">NEW</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${adj.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {adj.amount > 0 ? '+' : ''}{formatCurrency(adj.amount, order.currency)}
                    </span>
                    <button
                      onClick={() => handleRemovePendingAdjustment(index)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                </div>
              ))}

              {order.adjustments.length === 0 && pendingAdjustments.length === 0 && !isEditing && (
                <div className="px-4 sm:px-6 py-6 text-center text-sm text-neutral-400">
                  No adjustments
                </div>
              )}
            </div>

            {/* Add Adjustment Form (edit mode) */}
            {isEditing && (
              <div className="px-4 sm:px-6 py-4 border-t border-surface-700 bg-surface-800/50">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Add Adjustment</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={newAdjustment.type}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, type: e.target.value })}
                    className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    <option value="discount">Discount</option>
                    <option value="fee">Fee</option>
                    <option value="correction">Correction</option>
                    <option value="refund">Refund</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newAdjustment.description}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
                    className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount (negative for deductions)"
                    value={newAdjustment.amount}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, amount: e.target.value })}
                    className="w-full sm:w-40 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button
                    onClick={handleAddAdjustment}
                    disabled={!newAdjustment.description.trim() || !newAdjustment.amount}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    <FaPlus className="text-[9px]" /> Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Totals Card */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
            {(() => {
              const itemsNet = isEditing
                ? editItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                : order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const itemsVat = calcVatAmount(itemsNet, vatRate);
              const itemsGross = netToGross(itemsNet, vatRate);
              const adjustmentsTotal = order.adjustments.reduce((sum, adj) => sum + adj.amount, 0) +
                pendingAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
              const discount = order.discountAmount || 0;
              // Coupon is flat off gross: gross_total = items_gross - flat_discount + adjustments
              const orderTotalGross = itemsGross - discount + adjustmentsTotal;
              const orderTotalVat = Math.round(orderTotalGross * vatRate / (1 + vatRate));

              return (
                <div className="space-y-2">
                  {/* Items Subtotal (net) */}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Items Subtotal</span>
                    <AdminPriceDisplay price={itemsNet} currency={order.currency} primaryClassName="font-bold text-white" />
                  </div>

                  {/* VAT */}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">VAT ({vatPercent(vatRate)}%)</span>
                    <span className="font-bold text-white">{formatCurrency(itemsVat, order.currency)}</span>
                  </div>

                  {/* Items inkl. moms */}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Items inkl. moms</span>
                    <span className="font-bold text-white">{formatCurrency(itemsGross, order.currency)}</span>
                  </div>

                  {/* Adjustments */}
                  {(order.adjustments.length > 0 || pendingAdjustments.length > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Adjustments</span>
                      <span className="font-bold text-white">
                        {formatCurrency(adjustmentsTotal, order.currency)}
                      </span>
                    </div>
                  )}

                  {/* Coupon */}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Coupon ({order.couponCode})</span>
                      <span className="font-bold text-green-400">-{formatCurrency(discount, order.currency)}</span>
                    </div>
                  )}

                  {/* Order Total */}
                  <div className="pt-2 border-t border-surface-700 flex justify-between items-baseline gap-2">
                    <span className="text-sm sm:text-base font-bold text-white">Order Total (inkl. moms)</span>
                    <span className="text-lg sm:text-xl font-bold text-primary-400 shrink-0">
                      {formatCurrency(orderTotalGross, order.currency)}
                    </span>
                  </div>

                  {/* Effective VAT on final total */}
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Varav moms ({vatPercent(vatRate)}%)</span>
                    <span className="text-neutral-500">{formatCurrency(orderTotalVat, order.currency)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Status Change (edit mode) */}
          {isEditing && (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Change Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['pending', 'partial_paid', 'awaiting_final', 'paid', 'completed', 'cancelled'] as string[]).map(status => (
                  <button
                    key={status}
                    onClick={() => setEditStatus(status)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      editStatus === status
                        ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                        : 'bg-surface-800 text-neutral-300 hover:bg-surface-700'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== Notes Tab ==================== */}
      {activeTab === 'notes' && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
          {/* Add Note */}
          <div className="px-4 sm:px-6 py-4 border-b border-surface-700">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FaStickyNote className="text-primary-400" /> Internal Notes
            </h3>
            <div className="space-y-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Add an internal note..."
                rows={3}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCreateNote}
                  disabled={!newNoteContent.trim() || noteSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                >
                  <FaPlus className="text-[9px]" /> {noteSaving ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>

          {notesLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : notes.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <FaStickyNote className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No notes yet</h4>
              <p className="text-sm text-neutral-400">Add the first internal note for this order.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {notes.map(note => (
                <div key={note.id} className="px-4 sm:px-6 py-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="px-3 py-1 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-white whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-neutral-500">
                          {note.authorName} &middot; {getRelativeTime(note.createdAt)}
                          {note.updatedAt !== note.createdAt && ' (edited)'}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingNoteContent(note.content);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-primary-400 transition-colors"
                          >
                            <FaEdit className="text-[10px]" />
                          </button>
                          <button
                            onClick={() => setDeleteNoteModal(note.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Activity Tab ==================== */}
      {activeTab === 'activity' && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
            <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <FaHistory className="text-primary-400" /> Order Activity
            </h3>
          </div>

          {auditLogsLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <FaHistory className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No activity yet</h4>
              <p className="text-sm text-neutral-400">Order actions will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {auditLogs.map(log => (
                <div key={log.id} className="px-4 sm:px-6 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-white">{getAuditActionLabel(log.action)}</p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {log.adminUserName} &middot; {getRelativeTime(log.createdAt)}
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1 text-[10px] text-neutral-500">
                          {log.details.oldStatus && log.details.newStatus && (
                            <span>
                              Status: <span className="text-neutral-400">{log.details.oldStatus}</span>
                              {' → '}
                              <span className="text-neutral-400">{log.details.newStatus}</span>
                            </span>
                          )}
                          {log.details.description && !log.details.oldStatus && (
                            <span className="text-neutral-400">{log.details.description}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Emails Tab ==================== */}
      {activeTab === 'emails' && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
          {/* Send Email Form */}
          <div className="px-4 sm:px-6 py-4 border-b border-surface-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaPaperPlane className="text-primary-400" /> Email Communication
              </h3>
              {!showSendEmail && (
                <button
                  onClick={() => setShowSendEmail(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 transition-colors"
                >
                  <FaPlus className="text-[9px]" /> Compose
                </button>
              )}
            </div>

            {showSendEmail && (
              <div className="space-y-3 mt-3">
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body..."
                  rows={4}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowSendEmail(false); setEmailSubject(''); setEmailBody(''); }}
                    className="px-3 py-1.5 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={!emailSubject.trim() || !emailBody.trim() || emailSending}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                  >
                    <FaPaperPlane className="text-[9px]" /> {emailSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {emailHistoryLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : emailHistory.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <FaEnvelope className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No emails sent</h4>
              <p className="text-sm text-neutral-400">Email history for this order will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {emailHistory.map(email => (
                <div key={email.id} className="px-4 sm:px-6 py-3">
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                      <FaEnvelope className={`text-sm flex-shrink-0 mt-0.5 sm:mt-0 ${getEmailTypeIcon(email.templateType)}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{email.subject}</p>
                        <p className="text-[10px] text-neutral-500 break-all sm:break-normal">
                          {email.templateType.replace(/-/g, ' ')} &middot; {email.to}
                        </p>
                        <div className="flex items-center gap-2 mt-1 sm:hidden">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getEmailStatusBadge(email.status)}`}>
                            {email.status}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {getRelativeTime(email.sentAt || email.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getEmailStatusBadge(email.status)}`}>
                        {email.status}
                      </span>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                        {getRelativeTime(email.sentAt || email.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Modals ==================== */}
      <ConfirmModal
        isOpen={!!deleteNoteModal}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleDeleteNote}
        onCancel={() => setDeleteNoteModal(null)}
      />

      <ConfirmModal
        isOpen={!!deleteAdjustmentModal}
        title="Remove Adjustment"
        message="Are you sure you want to remove this adjustment? The order total will be recalculated."
        confirmLabel="Remove"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleDeleteAdjustment}
        onCancel={() => setDeleteAdjustmentModal(null)}
      />

      {/* Override Lock Modal */}
      <ConfirmModal
        isOpen={showOverrideModal}
        title="Override Edit Lock"
        message="Editing completed/cancelled orders can create accounting discrepancies. Are you sure you want to unlock this order for editing?"
        confirmLabel="Override Lock"
        confirmClass="bg-amber-600 hover:bg-amber-500"
        isLoading={overrideLoading}
        onConfirm={handleOverrideLock}
        onCancel={() => setShowOverrideModal(false)}
      />

      {/* Item Picker Modal */}
      {showItemPicker && id && (
        <OrderItemPicker
          orderId={id}
          onSelect={(product) => {
            setEditItems([...editItems, {
              serviceName: product.serviceName,
              serviceDescription: product.serviceDescription,
              quantity: 1,
              price: product.price,
              pcComponentId: product.pcComponentId,
              pcConfigurationId: product.pcConfigurationId,
            }]);
            setShowItemPicker(false);
          }}
          onClose={() => setShowItemPicker(false)}
        />
      )}
    </div>
  );
};

export default AdminOrderDetailPage;
