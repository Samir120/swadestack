export interface CustomerListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  accountStatus: 'active' | 'suspended' | 'deactivated';
  isEmailVerified: boolean;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastActive?: string;
  lastOrderDate?: string;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  userType: 'personal' | 'company';
  accountStatus: 'active' | 'suspended' | 'deactivated';
  suspensionReason?: string;
  suspensionEndDate?: string;
  isEmailVerified: boolean;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastActive?: string;
  lastOrderDate?: string;
  recentOrders: CustomerOrderSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  newLastMonth: number;
  averageLifetimeSpend: number;
}

export interface CustomerListQuery {
  search?: string;
  status?: string;
  sortBy?: 'createdAt' | 'lastActive' | 'totalOrders' | 'totalSpent' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CustomerListResponse {
  customers: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  fullName: string;
  company?: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  organizationNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  type: 'shipping' | 'billing';
  isDefault?: boolean;
  fullName: string;
  company?: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
  organizationNumber?: string;
}

export interface UpdateAddressData {
  fullName?: string;
  company?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  organizationNumber?: string;
}

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminUserName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any> | null;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Part 3: Cart & Orders ====================

export interface CustomerCartItem {
  id: string;
  serviceId: string | null;
  pcConfigurationId: string | null;
  quantity: number;
  name: string;
  category: string;
  price: number;
  currency: string;
}

export interface CustomerCart {
  items: CustomerCartItem[];
  totalAmount: number;
  vatAmount: number;
  lastUpdated: string | null;
  lastReminderSentAt: string | null;
}

export interface CustomerOrderItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  itemCount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface CustomerOrdersQuery {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerOrdersResponse {
  orders: CustomerOrderItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== Part 4: Notes, Activity, Emails ====================

export interface InternalNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  notes: InternalNote[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoginAttemptEntry {
  id: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  createdAt: string;
}

export interface LoginActivityResponse {
  attempts: LoginAttemptEntry[];
  total: number;
  page: number;
  pageSize: number;
  recentFailedCount: number;
}

export interface EmailHistoryEntry {
  id: string;
  to: string;
  subject: string;
  templateType: string;
  status: 'pending' | 'sent' | 'failed' | 'queued';
  sentAt?: string;
  failedAt?: string;
  createdAt: string;
}

export interface EmailHistoryResponse {
  emails: EmailHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderAdjustment {
  id: string;
  type: 'discount' | 'fee' | 'correction' | 'refund';
  description: string;
  amount: number;
  adminUserName: string;
  createdAt: string;
}

export interface OrderDetailItem {
  id: string;
  serviceId?: string;
  pcComponentId?: string;
  pcConfigurationId?: string;
  serviceName: string;
  serviceDescription?: string;
  quantity: number;
  price: number;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  phase: string;
  status: string;
  paymentIntentId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  userId?: string;
  totalAmount: number;
  status: string;
  currency: string;
  paymentId?: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  couponCode?: string;
  discountAmount?: number;
  requiresPartialPayment?: boolean;
  partialPaymentStatus?: string;
  items: OrderDetailItem[];
  payments?: OrderPayment[];
  adjustments: OrderAdjustment[];
  createdAt: string;
  updatedAt: string;
}
