import crypto from 'crypto';
import CustomersRepository from '../integration/repositories/CustomersRepository';
import OrdersRepository from '../integration/repositories/OrdersRepository';
import AddressRepository from '../integration/repositories/AddressRepository';
import RefreshTokenRepository from '../integration/repositories/RefreshTokenRepository';
import CartRepository from '../integration/repositories/CartRepository';
import InternalNoteRepository from '../integration/repositories/InternalNoteRepository';
import LoginAttemptRepository from '../integration/repositories/LoginAttemptRepository';
import AuditLogService from './AuditLogService';
import { EmailService } from './EmailService';
import VatSettingsService from './VatSettingsService';
import Order from '../models/sequelize/Order';
import Email from '../models/sequelize/Email';
import User from '../models/sequelize/User';
import VatSettings from '../models/sequelize/VatSettings';
import { Op } from 'sequelize';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import {
  AdminCustomerListDTO,
  AdminCustomerProfileDTO,
  AdminCustomerOrderSummaryDTO,
  AdminCustomerStatsDTO,
  AdminCustomerListQueryDTO,
  AdminUpdateCustomerDTO,
} from '../models/dto/AdminCustomerDTO';

export class CustomerService {
  private customersRepository: CustomersRepository;
  private ordersRepository: OrdersRepository;
  private addressRepository: AddressRepository;
  private refreshTokenRepository: RefreshTokenRepository;
  private cartRepository: CartRepository;
  private internalNoteRepository: InternalNoteRepository;
  private loginAttemptRepository: LoginAttemptRepository;
  private auditLogService: AuditLogService;
  private emailService: EmailService;
  private vatSettingsService: VatSettingsService;

  constructor() {
    this.customersRepository = new CustomersRepository();
    this.ordersRepository = new OrdersRepository();
    this.addressRepository = new AddressRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.cartRepository = new CartRepository();
    this.internalNoteRepository = new InternalNoteRepository();
    this.loginAttemptRepository = new LoginAttemptRepository();
    this.auditLogService = new AuditLogService();
    this.emailService = new EmailService();
    this.vatSettingsService = new VatSettingsService();
  }

  /**
   * Get paginated customer list with search/filter/sort
   */
  async getCustomers(query: AdminCustomerListQueryDTO): Promise<{
    customers: AdminCustomerListDTO[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;
    const offset = (page - 1) * pageSize;

    const { customers, total } = await this.customersRepository.findCustomers({
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: pageSize,
      offset,
    });

    // Get order stats for all customers in this page
    const customerIds = customers.map(c => c.id);
    const orderStats = await this.getOrderStatsForCustomers(customerIds);

    const customerDTOs: AdminCustomerListDTO[] = customers.map(customer => {
      const stats = orderStats.get(customer.id) || { totalOrders: 0, totalSpent: 0, lastOrderDate: undefined };
      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: customer.role,
        accountStatus: customer.accountStatus || 'active',
        isEmailVerified: customer.isEmailVerified,
        phone: customer.phone || undefined,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastActive: customer.updatedAt,
        lastOrderDate: stats.lastOrderDate,
        createdAt: customer.createdAt,
      };
    });

    // If sorting by totalOrders or totalSpent, sort in-memory after enrichment
    if (query.sortBy === 'totalOrders' || query.sortBy === 'totalSpent') {
      const sortField = query.sortBy;
      const sortDir = query.sortOrder === 'asc' ? 1 : -1;
      customerDTOs.sort((a, b) => (a[sortField] - b[sortField]) * sortDir);
    }

    return { customers: customerDTOs, total, page, pageSize };
  }

  /**
   * Get customer profile by ID
   */
  async getCustomerProfile(id: string): Promise<AdminCustomerProfileDTO | null> {
    const customer = await this.customersRepository.findCustomerById(id);
    if (!customer) return null;

    // Get order data
    const { orders: recentOrders, total: totalOrders } = await this.ordersRepository.findByUserId(id, 5, 0);

    // Calculate total spend
    const allOrdersResult = await this.ordersRepository.findByUserId(id, 1000, 0);
    const totalSpent = allOrdersResult.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);

    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const lastOrder = recentOrders.length > 0 ? recentOrders[0] : null;

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      role: customer.role,
      userType: customer.userType,
      accountStatus: customer.accountStatus || 'active',
      suspensionReason: customer.suspensionReason || undefined,
      suspensionEndDate: customer.suspensionEndDate || undefined,
      isEmailVerified: customer.isEmailVerified,
      phone: customer.phone || undefined,
      address: customer.address || undefined,
      city: customer.city || undefined,
      postalCode: customer.postalCode || undefined,
      country: customer.country || undefined,
      avatarUrl: customer.avatarUrl || undefined,
      dateOfBirth: customer.dateOfBirth || undefined,
      company: customer.company || undefined,
      organizationNumber: customer.organizationNumber || undefined,
      vatNumber: customer.vatNumber || undefined,
      totalOrders,
      totalSpent,
      averageOrderValue,
      lastActive: customer.updatedAt,
      lastOrderDate: lastOrder ? lastOrder.createdAt : undefined,
      recentOrders: recentOrders.map(this.mapOrderToSummary),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id: string, data: AdminUpdateCustomerDTO): Promise<AdminCustomerProfileDTO | null> {
    const existing = await this.customersRepository.findCustomerById(id);
    if (!existing) return null;

    // Check email uniqueness if changing email
    if (data.email && data.email.toLowerCase() !== existing.email) {
      const existingWithEmail = await this.customersRepository.findOne({ email: data.email.toLowerCase() } as any);
      if (existingWithEmail) {
        throw new Error('Email is already in use by another account');
      }
    }

    await this.customersRepository.updateCustomer(id, data);
    return this.getCustomerProfile(id);
  }

  /**
   * Get aggregate customer statistics
   */
  async getStats(): Promise<AdminCustomerStatsDTO> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [totalCustomers, activeCustomers, newThisMonth, newLastMonth] = await Promise.all([
      this.customersRepository.getCustomerCount(),
      this.customersRepository.getCustomerCount({ isEmailVerified: true }),
      this.customersRepository.getCustomersCreatedBetween(startOfMonth, now),
      this.customersRepository.getCustomersCreatedBetween(startOfLastMonth, endOfLastMonth),
    ]);

    // Calculate average lifetime spend
    let averageLifetimeSpend = 0;
    if (totalCustomers > 0) {
      const revenue = await this.ordersRepository.calculateRevenue();
      averageLifetimeSpend = revenue / totalCustomers;
    }

    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      newLastMonth,
      averageLifetimeSpend,
    };
  }

  /**
   * Generate CSV content for customer export
   */
  async exportCustomersCSV(query: { search?: string; status?: string }): Promise<string> {
    const customerIds = await this.customersRepository.findAllCustomerIds(query);

    // Fetch full data for all matching customers
    const { customers } = await this.customersRepository.findCustomers({
      search: query.search,
      status: query.status,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: customerIds.length || 10000,
      offset: 0,
    });

    const orderStats = await this.getOrderStatsForCustomers(customers.map(c => c.id));

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Orders', 'Total Spent (SEK)', 'Registered'];
    const rows = customers.map(c => {
      const stats = orderStats.get(c.id) || { totalOrders: 0, totalSpent: 0 };
      const status = c.isEmailVerified ? 'Active' : 'Unverified';
      return [
        `"${c.firstName} ${c.lastName}"`,
        c.email,
        c.phone || '',
        status,
        stats.totalOrders.toString(),
        stats.totalSpent.toFixed(0),
        new Date(c.createdAt).toISOString().split('T')[0],
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // ==================== PART 2: Account Actions ====================

  /**
   * Change customer account status (active/suspended/deactivated)
   */
  async changeAccountStatus(
    customerId: string,
    status: 'active' | 'suspended' | 'deactivated',
    options: { reason?: string; endDate?: string } = {},
    admin: { id: string; name: string; ip?: string }
  ): Promise<AdminCustomerProfileDTO | null> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) return null;

    const previousStatus = customer.accountStatus || 'active';

    const updateData: any = { accountStatus: status };
    if (status === 'suspended') {
      updateData.suspensionReason = options.reason || null;
      updateData.suspensionEndDate = options.endDate ? new Date(options.endDate) : null;
    } else {
      updateData.suspensionReason = null;
      updateData.suspensionEndDate = null;
    }

    await User.update(updateData, { where: { id: customerId } as any });

    // Force logout if suspending or deactivating
    if (status !== 'active') {
      await this.refreshTokenRepository.revokeAllUserTokens(customerId);
    }

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: `user.status_changed`,
      targetType: 'User',
      targetId: customerId,
      details: { previousStatus, newStatus: status, reason: options.reason },
      ipAddress: admin.ip,
    });

    return this.getCustomerProfile(customerId);
  }

  /**
   * Manually verify customer email
   */
  async verifyEmail(
    customerId: string,
    admin: { id: string; name: string; ip?: string }
  ): Promise<AdminCustomerProfileDTO | null> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) return null;

    await User.update(
      { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null } as any,
      { where: { id: customerId } as any }
    );

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'user.email_verified',
      targetType: 'User',
      targetId: customerId,
      details: { method: 'admin_manual' },
      ipAddress: admin.ip,
    });

    return this.getCustomerProfile(customerId);
  }

  /**
   * Revoke email verification
   */
  async revokeVerification(
    customerId: string,
    admin: { id: string; name: string; ip?: string }
  ): Promise<AdminCustomerProfileDTO | null> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) return null;

    await User.update(
      { isEmailVerified: false } as any,
      { where: { id: customerId } as any }
    );

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'user.verification_revoked',
      targetType: 'User',
      targetId: customerId,
      ipAddress: admin.ip,
    });

    return this.getCustomerProfile(customerId);
  }

  /**
   * Resend verification email (generates new token)
   */
  async resendVerification(customerId: string): Promise<{ token: string; email: string } | null> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) return null;
    if (customer.isEmailVerified) throw new Error('Email is already verified');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.update(
      { emailVerificationToken: verificationToken, emailVerificationExpires: expires } as any,
      { where: { id: customerId } as any }
    );

    return { token: verificationToken, email: customer.email };
  }

  /**
   * Trigger password reset email
   */
  async triggerPasswordReset(customerId: string): Promise<{ token: string; email: string; firstName: string } | null> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) return null;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.update(
      { resetPasswordToken: resetToken, resetPasswordExpires: expires } as any,
      { where: { id: customerId } as any }
    );

    return { token: resetToken, email: customer.email, firstName: customer.firstName };
  }

  /**
   * Force logout all sessions
   */
  async forceLogout(
    customerId: string,
    admin: { id: string; name: string; ip?: string }
  ): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(customerId);

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'user.force_logout',
      targetType: 'User',
      targetId: customerId,
      ipAddress: admin.ip,
    });
  }

  /**
   * Delete or anonymize customer account
   */
  async deleteCustomer(
    customerId: string,
    anonymize: boolean,
    admin: { id: string; name: string; ip?: string }
  ): Promise<void> {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    // Revoke all sessions first
    await this.refreshTokenRepository.revokeAllUserTokens(customerId);

    if (anonymize) {
      // GDPR anonymize: strip PII but keep record for Bokföringslagen
      const hash = crypto.createHash('sha256').update(customerId).digest('hex').substring(0, 8);

      await User.update({
        firstName: 'Anonymized',
        lastName: `Customer #${hash}`,
        email: `anonymized-${hash}@deleted.local`,
        phone: null,
        address: null,
        city: null,
        postalCode: null,
        country: null,
        avatarUrl: null,
        dateOfBirth: null,
        company: null,
        organizationNumber: null,
        vatNumber: null,
        password: crypto.randomBytes(32).toString('hex'),
        accountStatus: 'deactivated',
        isEmailVerified: false,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        suspensionReason: null,
        suspensionEndDate: null,
      } as any, { where: { id: customerId } as any });

      // Delete addresses
      await this.addressRepository.deleteAllByUserId(customerId);

      await this.auditLogService.log({
        adminUserId: admin.id,
        adminUserName: admin.name,
        action: 'user.anonymized',
        targetType: 'User',
        targetId: customerId,
        details: { originalEmail: customer.email, method: 'gdpr_anonymize' },
        ipAddress: admin.ip,
      });
    } else {
      // Hard delete - remove user and cascade
      await this.addressRepository.deleteAllByUserId(customerId);
      await User.destroy({ where: { id: customerId } as any });

      await this.auditLogService.log({
        adminUserId: admin.id,
        adminUserName: admin.name,
        action: 'user.deleted',
        targetType: 'User',
        targetId: customerId,
        details: { originalEmail: customer.email },
        ipAddress: admin.ip,
      });
    }
  }

  // ==================== PART 2: Address Management ====================

  async getAddresses(customerId: string): Promise<any[]> {
    const addresses = await this.addressRepository.findByUserId(customerId);
    return addresses.map(a => a.toJSON());
  }

  async createAddress(customerId: string, data: any, admin: { id: string; name: string; ip?: string }): Promise<any> {
    // If marking as default, clear existing defaults for this type
    if (data.isDefault) {
      await this.addressRepository.clearDefaultForType(customerId, data.type);
    }

    // If this is the first address of this type, make it default
    const existing = await this.addressRepository.findByUserIdAndType(customerId, data.type);
    if (existing.length === 0) {
      data.isDefault = true;
    }

    const address = await this.addressRepository.create({ ...data, userId: customerId });

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'address.created',
      targetType: 'User',
      targetId: customerId,
      details: { addressId: address.id, type: data.type },
      ipAddress: admin.ip,
    });

    return address.toJSON();
  }

  async updateAddress(customerId: string, addressId: string, data: any, admin: { id: string; name: string; ip?: string }): Promise<any> {
    const address = await this.addressRepository.findByIdAndUser(addressId, customerId);
    if (!address) throw new Error('Address not found');

    await this.addressRepository.update(addressId, data);
    const updated = await this.addressRepository.findById(addressId);

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'address.updated',
      targetType: 'User',
      targetId: customerId,
      details: { addressId },
      ipAddress: admin.ip,
    });

    return updated?.toJSON();
  }

  async deleteAddress(customerId: string, addressId: string, admin: { id: string; name: string; ip?: string }): Promise<void> {
    const address = await this.addressRepository.findByIdAndUser(addressId, customerId);
    if (!address) throw new Error('Address not found');

    await this.addressRepository.deleteByIdAndUser(addressId, customerId);

    // If deleted address was default, make the first remaining one default
    if (address.isDefault) {
      const remaining = await this.addressRepository.findByUserIdAndType(customerId, address.type);
      if (remaining.length > 0) {
        await this.addressRepository.setDefault(remaining[0].id, customerId, address.type);
      }
    }

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'address.deleted',
      targetType: 'User',
      targetId: customerId,
      details: { addressId, type: address.type },
      ipAddress: admin.ip,
    });
  }

  async setAddressDefault(customerId: string, addressId: string, admin: { id: string; name: string; ip?: string }): Promise<void> {
    const address = await this.addressRepository.findByIdAndUser(addressId, customerId);
    if (!address) throw new Error('Address not found');

    await this.addressRepository.setDefault(addressId, customerId, address.type);

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'address.set_default',
      targetType: 'User',
      targetId: customerId,
      details: { addressId, type: address.type },
      ipAddress: admin.ip,
    });
  }

  // ==================== PART 3: Cart & Orders ====================

  /**
   * Get customer's cart for admin view
   */
  async getCustomerCart(userId: string): Promise<any> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return { items: [], totalAmount: 0, vatAmount: 0, lastUpdated: null, lastReminderSentAt: null };
    }

    // Get VAT rate (stored as decimal, e.g. 0.25 for 25%)
    let vatRate = 0.25; // default
    try {
      const vatSettings = await VatSettings.findOne();
      if (vatSettings) vatRate = Number(vatSettings.vatRate);
    } catch {
      // Use default
    }

    const items = (cart as any).items || [];
    const vatMultiplier = 1 + vatRate;
    let totalGross = 0;

    const tierLabels: Record<string, string> = {
      core: 'Core Gaming PC',
      pro: 'Pro Gaming PC',
      ultra: 'Ultra Gaming PC',
      custom: 'Custom Gaming PC',
    };

    const mappedItems = items.map((item: any) => {
      const data = item.itemData || {};
      const pc = item.pcConfiguration; // eager-loaded relation
      const service = item.service; // eager-loaded relation

      // Resolve name: prefer relation/itemData name, then tier-based fallback for PCs
      let name = 'Unknown Item';
      if (item.pcConfigurationId) {
        const pcName = pc?.name_en || pc?.name_sv || data.name_en || data.name_sv || '';
        const tier = pc?.tier || data.tier || '';
        name = pcName || tierLabels[tier] || 'Pre-configured PC';
      } else {
        name = service?.name_en || service?.name_sv || data.name_en || data.name_sv || 'Unknown Item';
      }

      // Resolve net price: prefer fresh data from relations, then itemData snapshot
      let netPrice: number;
      if (item.pcConfigurationId) {
        const pcData = pc || data;
        const componentPrice = Number(pcData.discountedPrice ?? pcData.totalPrice) || 0;
        const buildCharge = pcData.includesBuildService ? (Number(pcData.buildServiceCharge) || 0) : 0;
        netPrice = componentPrice + buildCharge;
      } else {
        const svc = service || data;
        netPrice = Number(svc.discountPrice ?? svc.price) || 0;
      }

      // Convert to gross (VAT-inclusive) — matches what the end-user sees
      const grossPrice = Math.round(netPrice * vatMultiplier);
      const quantity = item.quantity || 1;
      const itemTotal = grossPrice * quantity;
      totalGross += itemTotal;

      return {
        id: item.id,
        serviceId: item.serviceId,
        pcConfigurationId: item.pcConfigurationId,
        quantity,
        name,
        category: data.category || (item.pcConfigurationId ? 'PC Configuration' : 'Service'),
        price: grossPrice,
        currency: data.currency || 'SEK',
      };
    });

    const vatAmount = Math.round(totalGross - totalGross / vatMultiplier);

    return {
      items: mappedItems,
      totalAmount: totalGross,
      vatAmount,
      lastUpdated: cart.updatedAt,
      lastReminderSentAt: cart.lastReminderSentAt,
    };
  }

  /**
   * Clear a customer's entire cart
   */
  async clearCustomerCart(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }

  /**
   * Remove a single item from customer's cart
   */
  async removeCartItem(userId: string, itemId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new Error('Cart not found');
    await this.cartRepository.removeItem(cart.id, itemId);
  }

  /**
   * Send cart reminder email to customer (rate-limited to 24h)
   */
  async sendCartReminder(userId: string): Promise<void> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new Error('Cart is empty');

    const items = (cart as any).items || [];
    if (items.length === 0) throw new Error('Cart is empty');

    // Rate limit: 24h since last reminder
    if (cart.lastReminderSentAt) {
      const hoursSince = (Date.now() - new Date(cart.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        throw new Error(`Reminder already sent ${Math.round(hoursSince)} hours ago. Please wait 24 hours.`);
      }
    }

    const customer = await this.customersRepository.findCustomerById(userId);
    if (!customer) throw new Error('Customer not found');

    // Build template data — convert NET prices to GROSS for customer-facing email
    const vatRate = await this.vatSettingsService.getCurrentRate();
    const grossMultiplier = 1 + vatRate;
    const cartItems = items.map((item: any) => {
      const data = item.itemData || {};
      const netPrice = data.discountPrice ?? data.price ?? data.totalPrice ?? 0;
      return {
        name: data.name_en || data.name_sv || 'Item',
        quantity: item.quantity || 1,
        price: netPrice * grossMultiplier,
        currency: data.currency || 'SEK',
      };
    });

    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    await this.emailService.sendEmailWithRetry({
      to: customer.email,
      subject: 'Complete Your Order - Items in Your Cart',
      templateType: EmailTemplateType.CART_REMINDER,
      templateData: {
        firstName: customer.firstName,
        items: cartItems,
        total,
        currency: cartItems[0]?.currency || 'SEK',
        checkoutUrl: `${frontendUrl}/checkout`,
      },
      priority: EmailPriority.NORMAL,
      userId,
      language: 'en',
    });

    await this.cartRepository.updateReminderSent(cart.id);
  }

  /**
   * Get customer orders with filtering/pagination (admin)
   */
  async getCustomerOrders(
    userId: string,
    query: { search?: string; status?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number }
  ): Promise<{
    orders: AdminCustomerOrderSummaryDTO[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const { orders, total } = await this.ordersRepository.findByUserIdFiltered(userId, {
      search: query.search,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: pageSize,
      offset,
    });

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: parseFloat(order.totalAmount.toString()),
        currency: order.currency,
        status: order.status,
        itemCount: (order as any).items?.length || 0,
        paymentMethod: order.paymentId ? 'Klarna' : 'Unknown',
        createdAt: order.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  // ==================== PART 4: Notes ====================

  /**
   * Get internal notes for a customer
   */
  async getCustomerNotes(customerId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize;
    const { notes, total } = await this.internalNoteRepository.findByTarget('customer', customerId, pageSize, offset);
    return {
      notes: notes.map(n => ({
        id: n.id,
        content: n.content,
        authorId: n.authorId,
        authorName: n.authorName,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Create an internal note for a customer
   */
  async createCustomerNote(
    customerId: string,
    content: string,
    admin: { id: string; name: string }
  ) {
    const note = await this.internalNoteRepository.createNote({
      targetType: 'customer',
      targetId: customerId,
      authorId: admin.id,
      authorName: admin.name,
      content,
    });
    return {
      id: note.id,
      content: note.content,
      authorId: note.authorId,
      authorName: note.authorName,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  /**
   * Update an internal note
   */
  async updateCustomerNote(noteId: string, content: string, adminId: string) {
    const existing = await this.internalNoteRepository.findById(noteId);
    if (!existing) throw new Error('Note not found');
    if (existing.authorId !== adminId) throw new Error('You can only edit your own notes');

    const updated = await this.internalNoteRepository.updateNote(noteId, content);
    return updated ? {
      id: updated.id,
      content: updated.content,
      authorId: updated.authorId,
      authorName: updated.authorName,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } : null;
  }

  /**
   * Delete an internal note
   */
  async deleteCustomerNote(noteId: string, adminId: string) {
    const existing = await this.internalNoteRepository.findById(noteId);
    if (!existing) throw new Error('Note not found');
    if (existing.authorId !== adminId) throw new Error('You can only delete your own notes');

    return this.internalNoteRepository.deleteNote(noteId);
  }

  // ==================== PART 4: Activity ====================

  /**
   * Get login activity for a customer
   */
  async getCustomerLoginActivity(customerId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize;
    const { attempts, total } = await this.loginAttemptRepository.findByUserId(customerId, pageSize, offset);

    const recentFailedCount = await this.loginAttemptRepository.getRecentFailedCount(customerId, 24);

    return {
      attempts: attempts.map(a => ({
        id: a.id,
        success: a.success,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        failureReason: a.failureReason,
        createdAt: a.createdAt,
      })),
      total,
      page,
      pageSize,
      recentFailedCount,
    };
  }

  // ==================== PART 4: Emails ====================

  /**
   * Get email history for a customer
   */
  async getCustomerEmails(customerId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Email.findAndCountAll({
      where: { userId: customerId } as any,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return {
      emails: rows.map(e => ({
        id: e.id,
        to: e.to,
        subject: e.subject,
        templateType: e.templateType,
        status: e.status,
        sentAt: e.sentAt,
        failedAt: e.failedAt,
        createdAt: e.createdAt,
      })),
      total: count,
      page,
      pageSize,
    };
  }

  /**
   * Send a custom admin email to a customer
   */
  async sendCustomEmail(
    customerId: string,
    data: { subject: string; body: string; language?: 'en' | 'sv' },
    admin: { id: string; name: string; ip?: string }
  ) {
    const customer = await this.customersRepository.findCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    await this.emailService.sendEmail({
      to: customer.email,
      subject: data.subject,
      templateType: EmailTemplateType.ADMIN_CUSTOM,
      templateData: {
        firstName: customer.firstName,
        subject: data.subject,
        body: data.body,
      },
      priority: EmailPriority.NORMAL,
      userId: customerId,
      language: data.language || 'en',
    });

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'email.custom_sent',
      targetType: 'User',
      targetId: customerId,
      details: { subject: data.subject },
      ipAddress: admin.ip,
    });
  }

  /**
   * Get order statistics for a batch of customer IDs
   */
  private async getOrderStatsForCustomers(
    customerIds: string[]
  ): Promise<Map<string, { totalOrders: number; totalSpent: number; lastOrderDate?: Date }>> {
    const result = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate?: Date }>();

    if (customerIds.length === 0) return result;

    const orders = await Order.findAll({
      where: {
        userId: { [Op.in]: customerIds },
        status: { [Op.ne]: 'cancelled' },
      } as any,
      attributes: ['userId', 'totalAmount', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    for (const order of orders) {
      const userId = order.userId!;
      const existing = result.get(userId);
      const amount = parseFloat(order.totalAmount.toString());

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += amount;
      } else {
        result.set(userId, {
          totalOrders: 1,
          totalSpent: amount,
          lastOrderDate: order.createdAt,
        });
      }
    }

    return result;
  }

  private mapOrderToSummary(order: Order): AdminCustomerOrderSummaryDTO {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: parseFloat(order.totalAmount.toString()),
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}

export default CustomerService;
