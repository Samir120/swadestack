export interface AdminCustomerListDTO {
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
  lastActive?: Date;
  lastOrderDate?: Date;
  createdAt: Date;
}

export interface AdminCustomerProfileDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  userType: 'personal' | 'company';
  accountStatus: 'active' | 'suspended' | 'deactivated';
  suspensionReason?: string;
  suspensionEndDate?: Date;
  isEmailVerified: boolean;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  company?: string;
  organizationNumber?: string;
  vatNumber?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastActive?: Date;
  lastOrderDate?: Date;
  recentOrders: AdminCustomerOrderSummaryDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminCustomerOrderSummaryDTO {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

export interface AdminCustomerStatsDTO {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  newLastMonth: number;
  averageLifetimeSpend: number;
}

export interface AdminCustomerListQueryDTO {
  search?: string;
  status?: string;
  sortBy?: 'createdAt' | 'lastActive' | 'totalOrders' | 'totalSpent' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AdminUpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AdminAddressDTO {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDTO {
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

export interface UpdateAddressDTO {
  fullName?: string;
  company?: string;
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  organizationNumber?: string;
}
