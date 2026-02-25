import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../common/Toast';
import { customersApi } from '../../models/api/customersApi';
import AdminPriceDisplay, { formatAdminCurrency } from './common/AdminPriceDisplay';
import {
  CustomerProfile as CustomerProfileType,
  UpdateCustomerData,
  CustomerAddress,
  CreateAddressData,
  UpdateAddressData,
  AuditLogEntry,
  CustomerCart,
  CustomerCartItem,
  CustomerOrderItem,
  CustomerOrdersQuery,
  InternalNote,
  LoginAttemptEntry,
  EmailHistoryEntry,
} from '../../models/types/customer.types';
import {
  FaChevronRight,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaUser,
  FaShoppingBag,
  FaShoppingCart,
  FaUserCog,
  FaPlus,
  FaTrash,
  FaStar,
  FaMapMarkerAlt,
  FaEnvelope,
  FaSearch,
  FaChevronLeft,
  FaHistory,
  FaStickyNote,
  FaPaperPlane,
  FaExclamationTriangle,
  FaSignInAlt,
  FaDesktop,
  FaMobileAlt,
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

type TabKey = 'overview' | 'orders' | 'cart' | 'addresses' | 'activity' | 'notes' | 'emails';

// ==================== Confirmation Modal ====================
const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  typedConfirmation?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}> = ({ isOpen, title, message, confirmLabel, confirmClass, typedConfirmation, isLoading, onConfirm, onCancel, children }) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (isOpen) setTyped('');
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = !typedConfirmation || typed === typedConfirmation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-surface-850 rounded-2xl border border-surface-700 shadow-dark-lg w-full max-w-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{message}</p>
        {children}
        {typedConfirmation && (
          <div className="mb-4">
            <label className="block text-xs text-neutral-500 mb-1">
              Type <span className="font-bold text-white">{typedConfirmation}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder={typedConfirmation}
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm || isLoading}
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

// ==================== Address Modal ====================
const AddressModal: React.FC<{
  isOpen: boolean;
  title: string;
  address?: CustomerAddress | null;
  isLoading?: boolean;
  onSave: (data: CreateAddressData | UpdateAddressData) => void;
  onCancel: () => void;
}> = ({ isOpen, title, address, isLoading, onSave, onCancel }) => {
  const [form, setForm] = useState<CreateAddressData>({
    type: 'shipping',
    fullName: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    country: 'SE',
  });

  useEffect(() => {
    if (isOpen && address) {
      setForm({
        type: address.type,
        fullName: address.fullName,
        company: address.company || '',
        streetAddress: address.streetAddress,
        postalCode: address.postalCode,
        city: address.city,
        country: address.country,
        phone: address.phone || '',
        organizationNumber: address.organizationNumber || '',
      });
    } else if (isOpen) {
      setForm({ type: 'shipping', fullName: '', streetAddress: '', postalCode: '', city: '', country: 'SE' });
    }
  }, [isOpen, address]);

  if (!isOpen) return null;

  const isValid = form.fullName && form.streetAddress && form.postalCode && form.city && form.country;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-surface-850 rounded-2xl border border-surface-700 shadow-dark-lg w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Type</label>
            <div className="flex gap-2">
              {(['shipping', 'billing'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-4 py-2 text-sm font-bold rounded-lg border transition-colors ${
                    form.type === t
                      ? 'border-primary-500 bg-primary-600/20 text-primary-400'
                      : 'border-surface-600 text-neutral-400 hover:border-surface-500'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Full Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Company</label>
            <input
              type="text"
              value={form.company || ''}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Street Address *</label>
            <input
              type="text"
              value={form.streetAddress}
              onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Postal Code *</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Country *</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Phone</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Org. Number</label>
              <input
                type="text"
                value={form.organizationNumber || ''}
                onChange={(e) => setForm({ ...form, organizationNumber: e.target.value })}
                className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!isValid || isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Saving...' : address ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customer, setCustomer] = useState<CustomerProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>((searchParams.get('tab') as TabKey) || 'overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<UpdateCustomerData>({});

  // Account actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendEndDate, setSuspendEndDate] = useState('');
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteAnonymize, setDeleteAnonymize] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressModal, setAddressModal] = useState<{ open: boolean; address: CustomerAddress | null }>({ open: false, address: null });
  const [addressSaving, setAddressSaving] = useState(false);
  const [deleteAddressModal, setDeleteAddressModal] = useState<CustomerAddress | null>(null);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CustomerCart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [clearCartModal, setClearCartModal] = useState(false);
  const [removeItemModal, setRemoveItemModal] = useState<CustomerCartItem | null>(null);

  // Orders state (filtered)
  const [orders, setOrders] = useState<CustomerOrderItem[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersQuery, setOrdersQuery] = useState<CustomerOrdersQuery>({ page: 1, pageSize: 20 });
  const [ordersSearch, setOrdersSearch] = useState('');
  const ordersSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notes state
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [deleteNoteModal, setDeleteNoteModal] = useState<string | null>(null);

  // Activity state
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptEntry[]>([]);
  const [loginAttemptsLoading, setLoginAttemptsLoading] = useState(false);
  const [recentFailedCount, setRecentFailedCount] = useState(0);

  // Emails state
  const [emailHistory, setEmailHistory] = useState<EmailHistoryEntry[]>([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const loadCustomer = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await customersApi.getById(id);
      if (response.success && response.data) {
        setCustomer(response.data);
      } else {
        toast.error('Customer not found');
        navigate('/admin/customers');
      }
    } catch {
      toast.error('Failed to load customer');
      navigate('/admin/customers');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  const loadAddresses = useCallback(async () => {
    if (!id) return;
    setAddressesLoading(true);
    try {
      const response = await customersApi.getAddresses(id);
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  }, [id, toast]);

  const loadAuditLogs = useCallback(async () => {
    if (!id) return;
    setAuditLogsLoading(true);
    try {
      const response = await customersApi.getAuditLogs('User', id);
      if (response.success && response.data) {
        setAuditLogs(response.data.logs);
      }
    } catch {
      // Silently fail for audit logs
    } finally {
      setAuditLogsLoading(false);
    }
  }, [id]);

  const loadCart = useCallback(async () => {
    if (!id) return;
    setCartLoading(true);
    try {
      const response = await customersApi.getCart(id);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setCartLoading(false);
    }
  }, [id, toast]);

  const loadOrders = useCallback(async (query: CustomerOrdersQuery = ordersQuery) => {
    if (!id) return;
    setOrdersLoading(true);
    try {
      const response = await customersApi.getOrders(id, query);
      if (response.success && response.data) {
        setOrders(response.data.orders);
        setOrdersTotal(response.data.total);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [id, toast, ordersQuery]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    setNotesLoading(true);
    try {
      const response = await customersApi.getNotes(id);
      if (response.success && response.data) {
        setNotes(response.data.notes);
      }
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setNotesLoading(false);
    }
  }, [id, toast]);

  const loadLoginActivity = useCallback(async () => {
    if (!id) return;
    setLoginAttemptsLoading(true);
    try {
      const response = await customersApi.getLoginActivity(id);
      if (response.success && response.data) {
        setLoginAttempts(response.data.attempts);
        setRecentFailedCount(response.data.recentFailedCount);
      }
    } catch {
      toast.error('Failed to load login activity');
    } finally {
      setLoginAttemptsLoading(false);
    }
  }, [id, toast]);

  const loadEmailHistory = useCallback(async () => {
    if (!id) return;
    setEmailHistoryLoading(true);
    try {
      const response = await customersApi.getEmailHistory(id);
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
    loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    if (activeTab === 'addresses' && id) {
      loadAddresses();
    }
    if (activeTab === 'cart' && id) {
      loadCart();
    }
    if (activeTab === 'orders' && id) {
      loadOrders(ordersQuery);
    }
    if (activeTab === 'notes' && id) {
      loadNotes();
    }
    if (activeTab === 'activity' && id) {
      loadLoginActivity();
    }
    if (activeTab === 'emails' && id) {
      loadEmailHistory();
    }
  }, [activeTab, id, loadAddresses, loadCart, loadNotes, loadLoginActivity, loadEmailHistory]);

  useEffect(() => {
    if (customer && id) {
      loadAuditLogs();
    }
  }, [customer, id, loadAuditLogs]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const startEditing = () => {
    if (!customer) return;
    setEditData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      dateOfBirth: customer.dateOfBirth || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveEdits = async () => {
    if (!customer || !id) return;
    setIsSaving(true);
    try {
      const response = await customersApi.update(id, editData);
      if (response.success && response.data) {
        setCustomer(response.data);
        setIsEditing(false);
        toast.success('Customer updated', 'Profile changes saved successfully.');
      } else {
        toast.error('Update failed', response.message || 'Could not save changes.');
      }
    } catch {
      toast.error('Update failed', 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== Account Actions ====================

  const handleActivate = async () => {
    if (!id) return;
    setActionLoading('activate');
    try {
      const response = await customersApi.changeStatus(id, { status: 'active' });
      if (response.success && response.data) {
        setCustomer(response.data);
        toast.success('Account activated');
      }
    } catch {
      toast.error('Failed to activate account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    setActionLoading('suspend');
    try {
      const response = await customersApi.changeStatus(id, {
        status: 'suspended',
        reason: suspendReason || undefined,
        endDate: suspendEndDate || undefined,
      });
      if (response.success && response.data) {
        setCustomer(response.data);
        setSuspendModal(false);
        setSuspendReason('');
        setSuspendEndDate('');
        toast.success('Account suspended');
      }
    } catch {
      toast.error('Failed to suspend account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!id) return;
    setActionLoading('deactivate');
    try {
      const response = await customersApi.changeStatus(id, { status: 'deactivated' });
      if (response.success && response.data) {
        setCustomer(response.data);
        setDeactivateModal(false);
        toast.success('Account deactivated');
      }
    } catch {
      toast.error('Failed to deactivate account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyEmail = async () => {
    if (!id) return;
    setActionLoading('verify');
    try {
      const response = await customersApi.verifyEmail(id);
      if (response.success && response.data) {
        setCustomer(response.data);
        toast.success('Email verified');
      }
    } catch {
      toast.error('Failed to verify email');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeVerification = async () => {
    if (!id) return;
    setActionLoading('revoke');
    try {
      const response = await customersApi.revokeVerification(id);
      if (response.success && response.data) {
        setCustomer(response.data);
        toast.success('Verification revoked');
      }
    } catch {
      toast.error('Failed to revoke verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendVerification = async () => {
    if (!id) return;
    setActionLoading('resend');
    try {
      const response = await customersApi.resendVerification(id);
      if (response.success) {
        toast.success('Verification email queued');
      }
    } catch {
      toast.error('Failed to resend verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    setActionLoading('resetPassword');
    try {
      const response = await customersApi.resetPassword(id);
      if (response.success) {
        toast.success('Password reset email queued');
      }
    } catch {
      toast.error('Failed to send password reset');
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceLogout = async () => {
    if (!id) return;
    setActionLoading('forceLogout');
    try {
      const response = await customersApi.forceLogout(id);
      if (response.success) {
        toast.success('All sessions invalidated');
      }
    } catch {
      toast.error('Failed to force logout');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading('delete');
    try {
      const response = await customersApi.deleteCustomer(id, deleteAnonymize);
      if (response.success) {
        toast.success(deleteAnonymize ? 'Account anonymized' : 'Account deleted');
        navigate('/admin/customers');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setActionLoading(null);
      setDeleteModal(false);
    }
  };

  // ==================== Address Actions ====================

  const handleSaveAddress = async (data: CreateAddressData | UpdateAddressData) => {
    if (!id) return;
    setAddressSaving(true);
    try {
      if (addressModal.address) {
        const response = await customersApi.updateAddress(id, addressModal.address.id, data as UpdateAddressData);
        if (response.success) {
          toast.success('Address updated');
          setAddressModal({ open: false, address: null });
          loadAddresses();
        }
      } else {
        const response = await customersApi.createAddress(id, data as CreateAddressData);
        if (response.success) {
          toast.success('Address created');
          setAddressModal({ open: false, address: null });
          loadAddresses();
        }
      }
    } catch {
      toast.error('Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!id || !deleteAddressModal) return;
    try {
      const response = await customersApi.deleteAddress(id, deleteAddressModal.id);
      if (response.success) {
        toast.success('Address deleted');
        setDeleteAddressModal(null);
        loadAddresses();
      }
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addrId: string) => {
    if (!id) return;
    try {
      const response = await customersApi.setAddressDefault(id, addrId);
      if (response.success) {
        toast.success('Default address updated');
        loadAddresses();
      }
    } catch {
      toast.error('Failed to set default address');
    }
  };

  // ==================== Cart Actions ====================

  const handleClearCart = async () => {
    if (!id) return;
    try {
      const response = await customersApi.clearCart(id);
      if (response.success) {
        toast.success('Cart cleared');
        setClearCartModal(false);
        loadCart();
      }
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const handleRemoveCartItem = async () => {
    if (!id || !removeItemModal) return;
    try {
      const response = await customersApi.removeCartItem(id, removeItemModal.id);
      if (response.success) {
        toast.success('Item removed from cart');
        setRemoveItemModal(null);
        loadCart();
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleSendReminder = async () => {
    if (!id) return;
    setReminderLoading(true);
    try {
      const response = await customersApi.sendCartReminder(id);
      if (response.success) {
        toast.success('Cart reminder email queued');
        loadCart();
      } else {
        toast.error(response.message || 'Failed to send reminder');
      }
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setReminderLoading(false);
    }
  };

  // ==================== Orders Filter Handlers ====================

  const handleOrdersSearchChange = (value: string) => {
    setOrdersSearch(value);
    if (ordersSearchTimer.current) clearTimeout(ordersSearchTimer.current);
    ordersSearchTimer.current = setTimeout(() => {
      const newQuery = { ...ordersQuery, search: value || undefined, page: 1 };
      setOrdersQuery(newQuery);
      loadOrders(newQuery);
    }, 400);
  };

  const handleOrdersFilterChange = (key: keyof CustomerOrdersQuery, value: string) => {
    const newQuery = { ...ordersQuery, [key]: value || undefined, page: 1 };
    setOrdersQuery(newQuery);
    loadOrders(newQuery);
  };

  const handleOrdersPageChange = (page: number) => {
    const newQuery = { ...ordersQuery, page };
    setOrdersQuery(newQuery);
    loadOrders(newQuery);
  };

  // ==================== Notes Actions ====================

  const handleCreateNote = async () => {
    if (!id || !newNoteContent.trim()) return;
    setNoteSaving(true);
    try {
      const response = await customersApi.createNote(id, newNoteContent);
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
      const response = await customersApi.updateNote(noteId, editingNoteContent);
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
      const response = await customersApi.deleteNote(deleteNoteModal);
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
      const response = await customersApi.sendCustomEmail(id, { subject: emailSubject, body: emailBody });
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

  // ==================== Helpers ====================

  const parseUserAgent = (ua?: string): { device: string; browser: string } => {
    if (!ua) return { device: 'Unknown', browser: 'Unknown' };
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    let browser = 'Unknown';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    return { device: isMobile ? 'Mobile' : 'Desktop', browser };
  };

  const maskIp = (ip?: string): string => {
    if (!ip) return '—';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
    return ip.substring(0, Math.min(ip.length, 12)) + '...';
  };

  const getEmailTypeIcon = (templateType: string) => {
    const icons: Record<string, string> = {
      'welcome': 'text-green-400',
      'email-verification': 'text-blue-400',
      'order-confirmation': 'text-emerald-400',
      'order-status-update': 'text-purple-400',
      'password-reset': 'text-amber-400',
      'cart-reminder': 'text-orange-400',
      'admin-custom': 'text-cyan-400',
      'newsletter': 'text-indigo-400',
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

  const formatCurrency = formatAdminCurrency;

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '—';
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateWithTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600',
      'bg-pink-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-900/30 text-amber-400',
      partial_paid: 'bg-orange-900/30 text-orange-400',
      awaiting_final: 'bg-purple-900/30 text-purple-400',
      paid: 'bg-green-900/30 text-green-400',
      processing: 'bg-blue-900/30 text-blue-400',
      shipped: 'bg-purple-900/30 text-purple-400',
      delivered: 'bg-teal-900/30 text-teal-400',
      completed: 'bg-emerald-900/30 text-emerald-400',
      cancelled: 'bg-gray-900/30 text-gray-400',
      refunded: 'bg-red-900/30 text-red-400',
      partial_refunded: 'bg-indigo-900/30 text-indigo-400',
    };
    return colors[status] || 'bg-surface-800 text-neutral-200';
  };

  const isCartAbandoned = (lastUpdated: string | null) => {
    if (!lastUpdated) return false;
    const diffMs = Date.now() - new Date(lastUpdated).getTime();
    return diffMs > 3 * 24 * 60 * 60 * 1000; // > 3 days
  };

  const getReminderHoursAgo = (sentAt: string | null): number | null => {
    if (!sentAt) return null;
    return Math.round((Date.now() - new Date(sentAt).getTime()) / (1000 * 60 * 60));
  };

  const getAccountStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'Active' },
      suspended: { bg: 'bg-amber-900/30', text: 'text-amber-400', label: 'Suspended' },
      deactivated: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Deactivated' },
    };
    const s = map[status] || map.active;
    return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  const getAuditActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'status_change': 'Changed account status',
      'verify_email': 'Verified email',
      'revoke_verification': 'Revoked email verification',
      'force_logout': 'Forced logout',
      'delete_account': 'Deleted account',
      'anonymize_account': 'Anonymized account (GDPR)',
      'create_address': 'Created address',
      'update_address': 'Updated address',
      'delete_address': 'Deleted address',
      'set_default_address': 'Set default address',
    };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4 sm:mb-6 min-w-0">
        <Link to="/admin/customers" className="hover:text-white transition-colors shrink-0">
          Customers
        </Link>
        <FaChevronRight className="text-[10px] text-neutral-600 shrink-0" />
        <span className="text-white font-medium truncate">{customer.firstName} {customer.lastName}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold flex-shrink-0 ${getAvatarColor(customer.firstName + customer.lastName)}`}>
            {getInitials(customer.firstName, customer.lastName)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-thin text-white">
                  {customer.firstName} {customer.lastName}
                </h2>
                {getAccountStatusBadge(customer.accountStatus)}
                {!customer.isEmailVerified && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-900/30 text-amber-400">
                    Unverified
                  </span>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 transition-colors self-start"
                >
                  <FaEdit className="text-[10px]" /> Edit
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-400">{customer.email}</p>
            {customer.phone && (
              <p className="text-sm text-neutral-400">{customer.phone}</p>
            )}
            {customer.accountStatus === 'suspended' && customer.suspensionReason && (
              <p className="text-xs text-amber-400 mt-1">
                Reason: {customer.suspensionReason}
                {customer.suspensionEndDate && (
                  <> &middot; Until: {formatDate(customer.suspensionEndDate)}</>
                )}
              </p>
            )}

            {/* Mini stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-surface-800 rounded-xl p-3">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">Total Orders</p>
                <p className="text-lg font-bold text-white">{customer.totalOrders}</p>
              </div>
              <div className="bg-surface-800 rounded-xl p-3">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">Total Spent</p>
                <AdminPriceDisplay
                  price={customer.totalSpent}
                  primaryClassName="text-lg font-bold text-white"
                  secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                />
              </div>
              <div className="bg-surface-800 rounded-xl p-3">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">Avg. Order</p>
                <AdminPriceDisplay
                  price={customer.averageOrderValue}
                  primaryClassName="text-lg font-bold text-white"
                  secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                />
              </div>
              <div className="bg-surface-800 rounded-xl p-3">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">Member Since</p>
                <p className="text-lg font-bold text-white">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 text-xs text-neutral-500 mt-3">
              <span>Last active: {getRelativeTime(customer.lastActive)}</span>
              {customer.lastOrderDate && (
                <span className="sm:before:content-['·'] sm:before:mx-1.5">Last order: {getRelativeTime(customer.lastOrderDate)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-700 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {([
            { key: 'overview' as TabKey, label: 'Overview' },
            { key: 'orders' as TabKey, label: 'Orders' },
            { key: 'cart' as TabKey, label: 'Cart' },
            { key: 'addresses' as TabKey, label: 'Addresses' },
            { key: 'activity' as TabKey, label: 'Activity' },
            { key: 'notes' as TabKey, label: 'Notes' },
            { key: 'emails' as TabKey, label: 'Emails' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300 hover:border-surface-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== Overview Tab ==================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-white">Personal Information</h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
                    >
                      <FaTimes className="text-[9px]" /> Cancel
                    </button>
                    <button
                      onClick={saveEdits}
                      disabled={isSaving}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                    >
                      <FaSave className="text-[9px]" /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startEditing}
                    className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">First Name</label>
                        <input
                          type="text"
                          value={editData.firstName || ''}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editData.lastName || ''}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Phone</label>
                      <input
                        type="text"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editData.dateOfBirth || ''}
                        onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Full Name</span>
                      <span className="text-sm text-white">{customer.firstName} {customer.lastName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Email</span>
                      <span className="text-sm text-white flex items-center gap-1.5 break-all sm:break-normal">
                        {customer.email}
                        {customer.isEmailVerified ? (
                          <FaCheck className="text-[10px] text-green-400 shrink-0" />
                        ) : (
                          <FaTimes className="text-[10px] text-red-400 shrink-0" />
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Phone</span>
                      <span className="text-sm text-white">{customer.phone || '—'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Date of Birth</span>
                      <span className="text-sm text-white">{customer.dateOfBirth ? formatDate(customer.dateOfBirth) : '—'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Language</span>
                      <span className="text-sm text-white">English</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Registered</span>
                      <span className="text-sm text-white">{formatDate(customer.createdAt)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-0.5">
                      <span className="text-xs text-neutral-500 uppercase font-bold">Last Login</span>
                      <span className="text-sm text-white">{formatDateWithTime(customer.updatedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
                <h3 className="text-sm sm:text-base font-semibold text-white">Account Actions</h3>
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                {/* Status Controls */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase font-bold mb-3">Status Controls</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.accountStatus !== 'active' && (
                      <button
                        onClick={handleActivate}
                        disabled={actionLoading === 'activate'}
                        className="px-3 py-1.5 text-xs font-bold text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/10 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === 'activate' ? 'Activating...' : 'Activate'}
                      </button>
                    )}
                    {customer.accountStatus !== 'suspended' && (
                      <button
                        onClick={() => setSuspendModal(true)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600/10 disabled:opacity-50 transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    {customer.accountStatus !== 'deactivated' && (
                      <button
                        onClick={() => setDeactivateModal(true)}
                        disabled={!!actionLoading}
                        className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/10 disabled:opacity-50 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Verification */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase font-bold mb-3">Email Verification</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-neutral-300">
                      Status: {customer.isEmailVerified ? (
                        <span className="text-green-400 font-bold">Verified</span>
                      ) : (
                        <span className="text-amber-400 font-bold">Unverified</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!customer.isEmailVerified && (
                      <>
                        <button
                          onClick={handleVerifyEmail}
                          disabled={actionLoading === 'verify'}
                          className="px-3 py-1.5 text-xs font-bold text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/10 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === 'verify' ? 'Verifying...' : 'Manually Verify'}
                        </button>
                        <button
                          onClick={handleResendVerification}
                          disabled={actionLoading === 'resend'}
                          className="px-3 py-1.5 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === 'resend' ? 'Sending...' : 'Resend Email'}
                        </button>
                      </>
                    )}
                    {customer.isEmailVerified && (
                      <button
                        onClick={handleRevokeVerification}
                        disabled={actionLoading === 'revoke'}
                        className="px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600/10 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === 'revoke' ? 'Revoking...' : 'Revoke Verification'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h4 className="text-xs text-neutral-500 uppercase font-bold mb-3">Security</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleResetPassword}
                      disabled={actionLoading === 'resetPassword'}
                      className="px-3 py-1.5 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === 'resetPassword' ? 'Sending...' : 'Send Password Reset'}
                    </button>
                    <button
                      onClick={handleForceLogout}
                      disabled={actionLoading === 'forceLogout'}
                      className="px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600/10 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === 'forceLogout' ? 'Logging out...' : 'Force Logout'}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-surface-700 pt-5">
                  <h4 className="text-xs text-red-500 uppercase font-bold mb-3">Danger Zone</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setDeleteAnonymize(false); setDeleteModal(true); }}
                      disabled={!!actionLoading}
                      className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/10 disabled:opacity-50 transition-colors"
                    >
                      Delete Account
                    </button>
                    <button
                      onClick={() => { setDeleteAnonymize(true); setDeleteModal(true); }}
                      disabled={!!actionLoading}
                      className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/10 disabled:opacity-50 transition-colors"
                    >
                      Anonymize (GDPR)
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2">
                    Anonymize preserves order records for accounting retention (Bokforingslagen 7-year rule) while stripping all personal data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-white">Recent Orders</h3>
                {customer.totalOrders > 0 && (
                  <button
                    onClick={() => handleTabChange('orders')}
                    className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>
              <div className="divide-y divide-surface-700">
                {customer.recentOrders.length === 0 ? (
                  <div className="p-6 text-center">
                    <FaShoppingBag className="text-2xl text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No orders yet</p>
                  </div>
                ) : (
                  customer.recentOrders.map(order => (
                    <div
                      key={order.id}
                      className="px-4 sm:px-6 py-3 hover:bg-surface-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-white truncate">{order.orderNumber}</p>
                        <AdminPriceDisplay
                          price={order.totalAmount}
                          primaryClassName="text-sm font-bold text-white whitespace-nowrap"
                          secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                        </p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {customer.recentOrders.length > 0 && customer.totalOrders > customer.recentOrders.length && (
                <div className="px-4 sm:px-6 py-3 border-t border-surface-700">
                  <p className="text-xs text-neutral-500">
                    Showing {customer.recentOrders.length} of {customer.totalOrders} orders
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity / Audit Log */}
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
                <h3 className="text-sm sm:text-base font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-surface-700">
                {auditLogsLoading ? (
                  <div className="p-6 text-center">
                    <LoadingSpinner />
                  </div>
                ) : auditLogs.length === 0 && customer.recentOrders.length === 0 ? (
                  <div className="p-6 text-center">
                    <FaUserCog className="text-2xl text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {auditLogs.slice(0, 5).map(log => (
                      <div key={log.id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <FaUserCog className="text-xs text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">{getAuditActionLabel(log.action)}</p>
                          <p className="text-[11px] text-neutral-500">by {log.adminUserName}</p>
                        </div>
                        <span className="text-xs text-neutral-500 flex-shrink-0">{getRelativeTime(log.createdAt)}</span>
                      </div>
                    ))}
                    {customer.recentOrders.map(order => (
                      <div key={`activity-${order.id}`} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <FaShoppingBag className="text-xs text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">Order placed <span className="font-bold">#{order.orderNumber}</span></p>
                        </div>
                        <span className="text-xs text-neutral-500 flex-shrink-0">{getRelativeTime(order.createdAt)}</span>
                      </div>
                    ))}
                    {customer.createdAt && (
                      <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-xs text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white">Account created</p>
                        </div>
                        <span className="text-xs text-neutral-500 flex-shrink-0">{getRelativeTime(customer.createdAt)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Orders Tab (Enhanced) ==================== */}
      {activeTab === 'orders' && (
        <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
          {/* Filter Bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
                <input
                  type="text"
                  value={ordersSearch}
                  onChange={(e) => handleOrdersSearchChange(e.target.value)}
                  placeholder="Search by order number..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              {/* Status */}
              <select
                value={ordersQuery.status || ''}
                onChange={(e) => handleOrdersFilterChange('status', e.target.value)}
                className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial_paid">Partial Paid</option>
                <option value="awaiting_final">Awaiting Final</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-[10px] text-neutral-500 uppercase font-bold whitespace-nowrap">From</label>
                <input
                  type="date"
                  value={ordersQuery.dateFrom || ''}
                  onChange={(e) => handleOrdersFilterChange('dateFrom', e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <label className="text-[10px] text-neutral-500 uppercase font-bold whitespace-nowrap">To</label>
                <input
                  type="date"
                  value={ordersQuery.dateTo || ''}
                  onChange={(e) => handleOrdersFilterChange('dateTo', e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <span className="text-xs text-neutral-500">
                {ordersTotal} order{ordersTotal !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <FaShoppingBag className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No orders found</h4>
              <p className="text-sm text-neutral-400">
                {ordersQuery.search || ordersQuery.status || ordersQuery.dateFrom
                  ? 'Try adjusting your filters.'
                  : "This customer hasn't placed any orders yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-surface-700">
                {orders.map(order => (
                  <Link key={order.id} to={`/admin/orders/${order.id}`} className="block p-4 hover:bg-surface-800/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                        <span className="text-xs text-neutral-500 ml-2">
                          {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <AdminPriceDisplay
                        price={order.totalAmount}
                        primaryClassName="text-sm font-bold text-white"
                        secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-surface-700">
                  <thead className="bg-surface-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700">
                    {orders.map(order => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="hover:bg-surface-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-400">{order.orderNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                          {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                          {order.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <AdminPriceDisplay
                            price={order.totalAmount}
                            primaryClassName="text-sm font-bold text-white"
                            secondaryClassName="block text-[10px] text-neutral-500 font-normal"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {ordersTotal > (ordersQuery.pageSize || 20) && (
                <div className="px-4 sm:px-6 py-3 border-t border-surface-700 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    Page {ordersQuery.page || 1} of {Math.ceil(ordersTotal / (ordersQuery.pageSize || 20))}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOrdersPageChange((ordersQuery.page || 1) - 1)}
                      disabled={(ordersQuery.page || 1) <= 1}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleOrdersPageChange((ordersQuery.page || 1) + 1)}
                      disabled={(ordersQuery.page || 1) >= Math.ceil(ordersTotal / (ordersQuery.pageSize || 20))}
                      className="p-2 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==================== Cart Tab ==================== */}
      {activeTab === 'cart' && (
        <div>
          {cartLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-12 text-center">
              <FaShoppingCart className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Cart is empty</h4>
              <p className="text-sm text-neutral-400">This customer's cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-white">
                    Shopping Cart ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
                  </h3>
                  {cart.lastUpdated && isCartAbandoned(cart.lastUpdated) && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-900/30 text-amber-400">
                      Abandoned ({Math.floor((Date.now() - new Date(cart.lastUpdated).getTime()) / 86400000)}d)
                    </span>
                  )}
                </div>
                {cart.lastUpdated && (
                  <p className="text-xs text-neutral-500">
                    Last updated: {getRelativeTime(cart.lastUpdated)}
                  </p>
                )}
              </div>

              {/* Cart Items */}
              <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 divide-y divide-surface-700">
                {cart.items.map(item => (
                  <div key={item.id} className="px-4 sm:px-6 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.category}</p>
                      </div>
                      <button
                        onClick={() => setRemoveItemModal(item)}
                        title="Remove item"
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors shrink-0"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 sm:mt-0 sm:pl-0">
                      <span className="text-xs text-neutral-400">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-white whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Cart Footer */}
                <div className="px-4 sm:px-6 py-4 bg-surface-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-neutral-500">VAT</span>
                    <span className="text-sm text-neutral-400">{formatCurrency(cart.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Total (incl. VAT)</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(cart.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSendReminder}
                  disabled={reminderLoading || (cart.lastReminderSentAt !== null && getReminderHoursAgo(cart.lastReminderSentAt) !== null && (getReminderHoursAgo(cart.lastReminderSentAt) as number) < 24)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-600/10 disabled:opacity-50 transition-colors"
                >
                  <FaEnvelope className="text-[10px]" />
                  {reminderLoading ? 'Sending...' : 'Send Cart Reminder'}
                  {cart.lastReminderSentAt && getReminderHoursAgo(cart.lastReminderSentAt) !== null && (getReminderHoursAgo(cart.lastReminderSentAt) as number) < 24 && (
                    <span className="text-neutral-500 ml-1">
                      (Sent {getReminderHoursAgo(cart.lastReminderSentAt)}h ago)
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setClearCartModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/10 transition-colors"
                >
                  <FaTrash className="text-[10px]" /> Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== Addresses Tab ==================== */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Addresses</h3>
            <button
              onClick={() => setAddressModal({ open: true, address: null })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FaPlus className="text-[10px]" /> Add Address
            </button>
          </div>

          {addressesLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-12 text-center">
              <FaMapMarkerAlt className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No addresses</h4>
              <p className="text-sm text-neutral-400">This customer hasn't added any addresses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        addr.type === 'shipping' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <FaStar className="text-[8px]" /> Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          title="Set as default"
                          className="p-1.5 text-neutral-500 hover:text-amber-400 transition-colors"
                        >
                          <FaStar className="text-xs" />
                        </button>
                      )}
                      <button
                        onClick={() => setAddressModal({ open: true, address: addr })}
                        title="Edit"
                        className="p-1.5 text-neutral-500 hover:text-primary-400 transition-colors"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setDeleteAddressModal(addr)}
                        title="Delete"
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">{addr.fullName}</p>
                  {addr.company && <p className="text-sm text-neutral-400">{addr.company}</p>}
                  <p className="text-sm text-neutral-400">{addr.streetAddress}</p>
                  <p className="text-sm text-neutral-400">{addr.postalCode} {addr.city}</p>
                  <p className="text-sm text-neutral-400">{addr.country}</p>
                  {addr.phone && <p className="text-xs text-neutral-500 mt-1">{addr.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Activity Tab ==================== */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Login Activity */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm sm:text-base font-semibold text-white">Login Activity</h3>
                {recentFailedCount > 3 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-900/30 text-red-400">
                    <FaExclamationTriangle className="text-[8px]" /> {recentFailedCount} failed (24h)
                  </span>
                )}
              </div>
            </div>
            {loginAttemptsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : loginAttempts.length === 0 ? (
              <div className="p-12 text-center">
                <FaSignInAlt className="text-3xl text-neutral-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">No login activity</h4>
                <p className="text-sm text-neutral-400">No login attempts recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-700">
                {loginAttempts.map(attempt => {
                  const ua = parseUserAgent(attempt.userAgent);
                  return (
                    <div key={attempt.id} className="px-4 sm:px-6 py-3 flex items-start sm:items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        attempt.success ? 'bg-green-900/30' : 'bg-red-900/30'
                      }`}>
                        {attempt.success ? (
                          <FaCheck className="text-xs text-green-400" />
                        ) : (
                          <FaTimes className="text-xs text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {attempt.success ? 'Successful login' : 'Failed login'}
                          {attempt.failureReason && (
                            <span className="text-neutral-500 ml-1">({attempt.failureReason})</span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
                          <span>{maskIp(attempt.ipAddress)}</span>
                          <span className="flex items-center gap-1">
                            {ua.device === 'Mobile' ? <FaMobileAlt className="text-[9px]" /> : <FaDesktop className="text-[9px]" />}
                            {ua.browser}
                          </span>
                          <span className="sm:hidden">{getRelativeTime(attempt.createdAt)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 flex-shrink-0 hidden sm:block">
                        {getRelativeTime(attempt.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Audit Trail */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
              <h3 className="text-sm sm:text-base font-semibold text-white">Admin Audit Trail</h3>
            </div>
            {auditLogsLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center">
                <FaHistory className="text-3xl text-neutral-600 mx-auto mb-3" />
                <p className="text-sm text-neutral-400">No admin actions recorded.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-700">
                {auditLogs.map(log => (
                  <div key={log.id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <FaUserCog className="text-xs text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{getAuditActionLabel(log.action)}</p>
                      <p className="text-[11px] text-neutral-500">by {log.adminUserName}</p>
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">{getRelativeTime(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Notes Tab ==================== */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add Note Form */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Add Internal Note</h3>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write an internal note about this customer..."
              rows={3}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCreateNote}
                disabled={noteSaving || !newNoteContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
              >
                <FaStickyNote className="text-[10px]" /> {noteSaving ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </div>

          {/* Notes List */}
          {notesLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-12 text-center">
              <FaStickyNote className="text-3xl text-neutral-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No notes yet</h4>
              <p className="text-sm text-neutral-400">Add internal notes for this customer above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-neutral-300">{note.authorName}</p>
                      <p className="text-[11px] text-neutral-500">{getRelativeTime(note.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); }}
                        className="p-1.5 text-neutral-500 hover:text-primary-400 transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setDeleteNoteModal(note.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                  {editingNoteId === note.id ? (
                    <div>
                      <textarea
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateNote(note.id)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== Emails Tab ==================== */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          {/* Send Email Section */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Email Communication</h3>
            <button
              onClick={() => setShowSendEmail(!showSendEmail)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FaPaperPlane className="text-[10px]" /> Send Email
            </button>
          </div>

          {showSendEmail && (
            <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 p-4 sm:p-6">
              <h4 className="text-sm font-semibold text-white mb-3">Compose Email</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Subject *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Body *</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message... (HTML supported)"
                    rows={6}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowSendEmail(false); setEmailSubject(''); setEmailBody(''); }}
                    className="px-4 py-2 text-xs font-bold text-neutral-400 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-500 disabled:opacity-50 transition-colors"
                  >
                    <FaPaperPlane className="text-[10px]" /> {emailSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Email History */}
          <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-700">
              <h3 className="text-sm sm:text-base font-semibold text-white">Email History</h3>
            </div>
            {emailHistoryLoading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : emailHistory.length === 0 ? (
              <div className="p-12 text-center">
                <FaEnvelope className="text-3xl text-neutral-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">No emails sent</h4>
                <p className="text-sm text-neutral-400">No emails have been sent to this customer yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-700">
                {emailHistory.map(email => (
                  <div key={email.id} className="px-4 sm:px-6 py-3 flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className={`text-xs ${getEmailTypeIcon(email.templateType)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{email.subject}</p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {email.templateType.replace(/-/g, ' ')} &middot; {email.to}
                      </p>
                      <div className="flex items-center gap-2 mt-1 sm:hidden">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getEmailStatusBadge(email.status)}`}>
                          {email.status}
                        </span>
                        <span className="text-[11px] text-neutral-500">{getRelativeTime(email.createdAt)}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getEmailStatusBadge(email.status)}`}>
                        {email.status}
                      </span>
                      <span className="text-xs text-neutral-500">{getRelativeTime(email.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Modals ==================== */}

      {/* Delete Note Modal */}
      <ConfirmModal
        isOpen={!!deleteNoteModal}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleDeleteNote}
        onCancel={() => setDeleteNoteModal(null)}
      />

      {/* Suspend Modal */}
      <ConfirmModal
        isOpen={suspendModal}
        title="Suspend Account"
        message={`Suspend ${customer.firstName} ${customer.lastName}'s account? They will be unable to log in while suspended.`}
        confirmLabel="Suspend Account"
        confirmClass="bg-amber-600 hover:bg-amber-500"
        isLoading={actionLoading === 'suspend'}
        onConfirm={handleSuspend}
        onCancel={() => setSuspendModal(false)}
      >
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Reason (optional)</label>
            <input
              type="text"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Suspicious activity"
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">End Date (optional)</label>
            <input
              type="date"
              value={suspendEndDate}
              onChange={(e) => setSuspendEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>
      </ConfirmModal>

      {/* Deactivate Modal */}
      <ConfirmModal
        isOpen={deactivateModal}
        title="Deactivate Account"
        message={`Deactivate ${customer.firstName} ${customer.lastName}'s account? This will permanently block their access until manually reactivated.`}
        confirmLabel="Deactivate"
        confirmClass="bg-red-600 hover:bg-red-500"
        typedConfirmation="DEACTIVATE"
        isLoading={actionLoading === 'deactivate'}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateModal(false)}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        title={deleteAnonymize ? 'Anonymize Account (GDPR)' : 'Delete Account'}
        message={
          deleteAnonymize
            ? `This will replace all personal data for ${customer.firstName} ${customer.lastName} with anonymized values while preserving order records for Bokforingslagen compliance. This action cannot be undone.`
            : `Permanently delete ${customer.firstName} ${customer.lastName}'s account and all associated data? This action cannot be undone.`
        }
        confirmLabel={deleteAnonymize ? 'Anonymize' : 'Delete'}
        confirmClass="bg-red-600 hover:bg-red-500"
        typedConfirmation="DELETE"
        isLoading={actionLoading === 'delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />

      {/* Delete Address Modal */}
      <ConfirmModal
        isOpen={!!deleteAddressModal}
        title="Delete Address"
        message={deleteAddressModal ? `Delete the ${deleteAddressModal.type} address for ${deleteAddressModal.fullName}?` : ''}
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteAddressModal(null)}
      />

      {/* Address Create/Edit Modal */}
      <AddressModal
        isOpen={addressModal.open}
        title={addressModal.address ? 'Edit Address' : 'Add Address'}
        address={addressModal.address}
        isLoading={addressSaving}
        onSave={handleSaveAddress}
        onCancel={() => setAddressModal({ open: false, address: null })}
      />

      {/* Clear Cart Modal */}
      <ConfirmModal
        isOpen={clearCartModal}
        title="Clear Cart"
        message={`Remove all items from ${customer.firstName} ${customer.lastName}'s cart? This cannot be undone.`}
        confirmLabel="Clear Cart"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleClearCart}
        onCancel={() => setClearCartModal(false)}
      />

      {/* Remove Cart Item Modal */}
      <ConfirmModal
        isOpen={!!removeItemModal}
        title="Remove Item"
        message={removeItemModal ? `Remove "${removeItemModal.name}" from the cart?` : ''}
        confirmLabel="Remove"
        confirmClass="bg-red-600 hover:bg-red-500"
        onConfirm={handleRemoveCartItem}
        onCancel={() => setRemoveItemModal(null)}
      />
    </div>
  );
};

export default CustomerProfilePage;
