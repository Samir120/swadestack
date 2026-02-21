import OrdersRepository from '../integration/repositories/OrdersRepository';
import ServicesRepository from '../integration/repositories/ServicesRepository';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import PCConfigurationRepository from '../integration/repositories/PCConfigurationRepository';
import OrderAdjustmentRepository from '../integration/repositories/OrderAdjustmentRepository';
import InternalNoteRepository from '../integration/repositories/InternalNoteRepository';
import { PaymentRepository } from '../integration/repositories/PaymentRepository';
import OrderItem from '../models/sequelize/OrderItem';
import Payment from '../models/sequelize/Payment';
import Email from '../models/sequelize/Email';
import PCComponent from '../models/sequelize/PCComponent';
import {
  OrderDTO,
  CreateOrderDTO,
  OrderItemDTO,
  UpdateOrderStatusDTO,
  OrderListDTO,
} from '../models/dto/OrderDTO';
import { OrderStatus } from '../models/sequelize/Order';
import PartialPaymentService from './PartialPaymentService';
import { OrderEmailService } from './OrderEmailService';
import { EmailService } from './EmailService';
import AuditLogService from './AuditLogService';
import InvoiceService from './InvoiceService';
import CouponsService from './CouponsService';
import VatSettingsService from './VatSettingsService';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';
import { CartItemContext } from '../models/dto/CouponDTO';

/**
 * Orders Service - Business Logic Layer
 * Handles order processing, payment, and fulfillment
 */
export class OrdersService {
  private ordersRepository: OrdersRepository;
  private servicesRepository: ServicesRepository;
  private pcComponentRepository: PCComponentRepository;
  private pcConfigurationRepository: PCConfigurationRepository;
  private orderAdjustmentRepository: OrderAdjustmentRepository;
  private internalNoteRepository: InternalNoteRepository;
  private partialPaymentService: PartialPaymentService;
  private orderEmailService: OrderEmailService;
  private emailService: EmailService;
  private auditLogService: AuditLogService;
  private invoiceService: InvoiceService;
  private couponsService: CouponsService;
  private vatSettingsService: VatSettingsService;
  private paymentRepository: PaymentRepository;

  constructor() {
    this.ordersRepository = new OrdersRepository();
    this.servicesRepository = new ServicesRepository();
    this.pcComponentRepository = new PCComponentRepository();
    this.pcConfigurationRepository = new PCConfigurationRepository();
    this.orderAdjustmentRepository = new OrderAdjustmentRepository();
    this.internalNoteRepository = new InternalNoteRepository();
    this.partialPaymentService = new PartialPaymentService();
    this.orderEmailService = new OrderEmailService();
    this.emailService = new EmailService();
    this.auditLogService = new AuditLogService();
    this.invoiceService = new InvoiceService();
    this.couponsService = new CouponsService();
    this.vatSettingsService = new VatSettingsService();
    this.paymentRepository = new PaymentRepository();
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDTO): Promise<OrderDTO> {
    const hasServiceItems = data.items && data.items.length > 0;
    const hasPCItems = data.pcItems && data.pcItems.length > 0;
    const hasComponentItems = data.componentItems && data.componentItems.length > 0;

    // Validate at least one item exists
    if (!hasServiceItems && !hasPCItems && !hasComponentItems) {
      throw new Error('Order must contain at least one item');
    }

    let totalAmount = 0;
    const orderItems: any[] = [];
    let currency = 'SEK';

    // Process service items
    if (hasServiceItems) {
      const serviceIds = data.items.map(item => item.serviceId);
      const services = await this.servicesRepository.findByIds(serviceIds);

      if (services.length !== serviceIds.length) {
        throw new Error('One or more services not found or inactive');
      }

      currency = services[0].currency;

      for (const item of data.items) {
        const service = services.find(s => s.id === item.serviceId);
        if (!service) {
          throw new Error(`Service ${item.serviceId} not found`);
        }

        const itemPrice = service.discountPrice != null
          ? parseFloat(service.discountPrice.toString())
          : parseFloat(service.price.toString());
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          serviceId: service.id,
          quantity: item.quantity,
          price: itemPrice,
          serviceName: service.name_en,
          serviceDescription: service.desc_en,
        });
      }
    }

    // Process PC items
    if (hasPCItems) {
      for (const pcItem of data.pcItems!) {
        const pcPrice = Number(pcItem.totalPrice) || 0;
        totalAmount += pcPrice;

        orderItems.push({
          pcConfigurationId: pcItem.preConfiguredPCId,
          quantity: 1,
          price: pcPrice,
          serviceName: pcItem.name,
          serviceDescription: JSON.stringify(pcItem.configurationSnapshot),
        });
      }
    }

    // Process component items
    if (hasComponentItems) {
      for (const compItem of data.componentItems!) {
        const component = await PCComponent.findByPk(compItem.pcComponentId);
        if (!component || !component.isActive) {
          throw new Error(`Component ${compItem.pcComponentId} not found or inactive`);
        }

        const compPrice = parseFloat(component.price.toString());
        const compTotal = compPrice * compItem.quantity;
        totalAmount += compTotal;

        if (!currency || currency === 'SEK') {
          currency = component.currency || 'SEK';
        }

        orderItems.push({
          pcComponentId: component.id,
          quantity: compItem.quantity,
          price: compPrice,
          serviceName: component.name_en,
          serviceDescription: component.name_sv,
        });
      }
    }

    // Validate and apply coupon if provided
    let couponId: string | undefined;
    let couponCode: string | undefined;
    let discountAmount = 0;

    if (data.couponCode) {
      const couponResult = await this.couponsService.validateCoupon(
        data.couponCode, totalAmount, data.email
      );
      if (!couponResult.valid) {
        throw new Error(couponResult.error || 'Invalid coupon');
      }
      couponId = couponResult.couponId;
      couponCode = couponResult.code;
      discountAmount = couponResult.discountAmount || 0;
      totalAmount = Math.max(0, totalAmount - discountAmount);
    }

    // Generate order number
    const orderNumber = await this.ordersRepository.generateOrderNumber();

    // Create order
    const order = await this.ordersRepository.create({
      ...data,
      orderNumber,
      totalAmount,
      status: 'pending',
      currency,
      couponId,
      couponCode,
      discountAmount,
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item,
      });
    }

    // Decrement stock for PC component items
    if (hasComponentItems) {
      for (const compItem of data.componentItems!) {
        const success = await this.pcComponentRepository.decrementStock(
          compItem.pcComponentId,
          compItem.quantity
        );
        if (!success) {
          console.warn(`Warning: Insufficient stock for component ${compItem.pcComponentId}, order ${order.orderNumber}`);
        }
      }
    }

    // Decrement stock for pre-configured PC items
    if (hasPCItems) {
      for (const pcItem of data.pcItems!) {
        if (pcItem.preConfiguredPCId) {
          const success = await this.pcConfigurationRepository.decrementStock(
            pcItem.preConfiguredPCId,
            1
          );
          if (!success) {
            console.warn(`Warning: Insufficient stock for pre-configured PC ${pcItem.preConfiguredPCId}, order ${order.orderNumber}`);
          }
        }
      }
    }

    // Increment coupon usage and track discount amount after order creation
    if (couponId) {
      await this.couponsService.incrementUsage(couponId, discountAmount);
    }

    // Fetch complete order with items
    const completeOrder = await this.ordersRepository.findByIdWithItems(order.id);
    if (!completeOrder) {
      throw new Error('Failed to create order');
    }

    // Only initialize partial payment if the user explicitly chose 'partial'
    // AND the amount qualifies for partial payment
    const requiresPartial = data.paymentMethod === 'partial'
      && this.partialPaymentService.requiresPartialPayment(totalAmount, currency);

    if (requiresPartial) {
      await this.partialPaymentService.initializePartialPayment(order.id);
      console.log(`✓ Order ${order.orderNumber} initialized with partial payment (${totalAmount} ${currency})`);
    }

    return this.mapToDTO(completeOrder);
  }

  /**
   * Create order for PC Configuration
   * NOTE: PC Configuration orders do NOT use partial payment regardless of amount
   */
  async createPCConfigurationOrder(data: {
    userId?: string;
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    pcConfigurationId: string;
    totalAmount: number;
    currency: string;
    configurationSnapshot: any;
    couponId?: string;
    couponCode?: string;
    discountAmount?: number;
  }): Promise<OrderDTO> {
    // Generate order number
    const orderNumber = await this.ordersRepository.generateOrderNumber();

    // Create order - explicitly set requiresPartialPayment to false
    const order = await this.ordersRepository.create({
      userId: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      country: data.country || 'SE',
      orderNumber,
      totalAmount: data.totalAmount,
      status: 'pending',
      currency: data.currency,
      couponId: data.couponId,
      couponCode: data.couponCode,
      discountAmount: data.discountAmount || 0,
      // PC configurations never use partial payment
      requiresPartialPayment: false,
      partialPaymentStatus: null,
    });

    // Create a single order item representing the PC configuration
    await OrderItem.create({
      orderId: order.id,
      serviceName: 'Custom PC Configuration',
      serviceDescription: JSON.stringify(data.configurationSnapshot),
      quantity: 1,
      price: data.totalAmount,
      pcConfigurationId: data.pcConfigurationId,
    });

    // Decrement stock for the PC configuration
    const stockSuccess = await this.pcConfigurationRepository.decrementStock(
      data.pcConfigurationId,
      1
    );
    if (!stockSuccess) {
      console.warn(`Warning: Insufficient stock for PC configuration ${data.pcConfigurationId}, order ${order.orderNumber}`);
    }

    // Fetch complete order with items
    const completeOrder = await this.ordersRepository.findByIdWithItems(order.id);
    if (!completeOrder) {
      throw new Error('Failed to create PC configuration order');
    }

    console.log(`✓ PC Configuration order ${order.orderNumber} created (${data.totalAmount} ${data.currency}) - NO partial payment`);

    return this.mapToDTO(completeOrder);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<OrderDTO | null> {
    const order = await this.ordersRepository.findByIdWithItems(id);
    return order ? this.mapToDTO(order) : null;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<OrderDTO | null> {
    const order = await this.ordersRepository.findByOrderNumber(orderNumber);
    return order ? this.mapToDTO(order) : null;
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<OrderListDTO> {
    const offset = (page - 1) * limit;
    const { orders, total } = await this.ordersRepository.findByUserId(
      userId,
      limit,
      offset
    );

    return {
      orders: orders.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Get all orders (Admin)
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 50,
    status?: OrderStatus
  ): Promise<OrderListDTO> {
    const offset = (page - 1) * limit;
    const { orders, total } = await this.ordersRepository.findAllWithItems(
      limit,
      offset,
      status
    );

    return {
      orders: orders.map(this.mapToDTO),
      total,
      page,
      limit,
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    statusData: UpdateOrderStatusDTO
  ): Promise<OrderDTO | null> {
    // Get the current order to store old status
    const currentOrder = await this.ordersRepository.findById(id);
    if (!currentOrder) return null;

    // Prevent status changes on cancelled orders
    if (currentOrder.status === 'cancelled') {
      throw new Error('Cannot update status of a cancelled order');
    }

    const oldStatus = currentOrder.status;

    // Update the order status
    const order = await this.ordersRepository.updateStatus(
      id,
      statusData.status,
      statusData.paymentId
    );

    if (!order) return null;

    // When setting awaiting_final via status dropdown, mirror what
    // PartialPaymentService.markReadyForFinalPayment does so both paths
    // are fully identical for the Klarna payment flow.
    if (statusData.status === 'awaiting_final') {
      const payments = await this.paymentRepository.findByOrderId(id);

      if (!order.readyForFinalPayment) {
        order.readyForFinalPayment = true;
        order.readyForFinalPaymentAt = new Date();
        order.partialPaymentStatus = 'final_pending';
        await order.save();
      }

      // Update final payment metadata (same as markReadyForFinalPayment)
      const finalPayment = payments.find(p => p.phase === 'final');
      if (finalPayment && finalPayment.status === 'pending') {
        await this.paymentRepository.updatePaymentStatus(finalPayment.id, finalPayment.status, {
          markedReadyAt: new Date().toISOString(),
          markedReadyVia: 'status_change',
        });
      }

      // If there are pending additional payments, merge them into the final payment.
      // This prevents having both "pending final" and "pending additional" simultaneously.
      // The final payment amount becomes: order total - amount already paid.
      const pendingAdditional = payments.filter(p => p.phase === 'additional' && p.status === 'pending');
      if (pendingAdditional.length > 0 && finalPayment && finalPayment.status === 'pending') {
        const succeededPayments = payments.filter(p => p.status === 'succeeded');
        const amountPaid = succeededPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
        const orderTotal = parseFloat(order.totalAmount.toString());
        const newFinalAmount = orderTotal - amountPaid;

        // Update final payment to cover the full remaining balance
        await this.paymentRepository.update(finalPayment.id, { amount: newFinalAmount } as any);

        // Cancel pending additional payments since the final payment now covers everything
        for (const addlPayment of pendingAdditional) {
          await this.paymentRepository.updatePaymentStatus(addlPayment.id, 'cancelled', {
            cancelledReason: 'merged_into_final_payment',
            cancelledAt: new Date().toISOString(),
          });
        }
        console.log(`✓ Merged ${pendingAdditional.length} additional payment(s) into final payment for order ${id}`);
      }
    }

    // Send email notification if status changed (unless skipEmail is set)
    if (oldStatus !== statusData.status && !statusData.skipEmail) {
      try {
        await this.sendOrderStatusEmail(order, oldStatus, statusData.status);
      } catch (error) {
        console.error('Failed to send order status update email:', error);
        // Don't fail the status update if email fails
      }
    }

    const completeOrder = await this.ordersRepository.findByIdWithItems(id);
    return completeOrder ? this.mapToDTO(completeOrder) : null;
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string): Promise<OrderDTO | null> {
    const order = await this.ordersRepository.findById(id);
    if (!order) return null;

    if (order.status === 'paid' || order.status === 'completed') {
      throw new Error('Cannot cancel paid or completed orders');
    }

    return await this.updateOrderStatus(id, { status: 'cancelled' });
  }

  /**
   * Get order statistics (Admin)
   */
  async getStatistics(): Promise<any> {
    const stats = await this.ordersRepository.getStatistics();
    const revenue = await this.ordersRepository.calculateRevenue();

    return {
      ...stats,
      totalRevenue: revenue,
    };
  }

  /**
   * Calculate revenue for date range (Admin)
   */
  async getRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    return await this.ordersRepository.calculateRevenue(startDate, endDate);
  }

  /**
   * Mark order ready for final payment (Admin)
   */
  async markOrderReadyForFinalPayment(
    orderId: string,
    adminUserId: string
  ): Promise<OrderDTO> {
    return await this.partialPaymentService.markReadyForFinalPayment(orderId, adminUserId);
  }

  /**
   * Send order status update email
   */
  private async sendOrderStatusEmail(
    order: any,
    oldStatus: OrderStatus,
    newStatus: OrderStatus
  ): Promise<void> {
    const customerName = `${order.firstName} ${order.lastName}`;
    const language = 'en'; // You can add language preference to order model if needed

    // Choose appropriate email method based on status
    switch (newStatus) {
      case 'completed': {
        // For completed, attach invoice PDF (works for both registered and guest users)
        let invoiceAttachments;
        try {
          const pdfBuffer = await this.invoiceService.generateInvoicePDF(order.userId || null, order.id);
          const invoiceData = await this.invoiceService.getInvoiceData(order.userId || null, order.id);
          invoiceAttachments = [{
            filename: `${invoiceData.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }];
        } catch (pdfError) {
          console.error('Failed to generate invoice PDF for completed status email:', pdfError);
        }
        await this.orderEmailService.sendOrderStatusUpdate(
          order.orderNumber,
          order.email,
          customerName,
          newStatus,
          oldStatus,
          language,
          undefined,
          invoiceAttachments
        );
        break;
      }
      case 'paid':
        // For paid, send general status update
        await this.orderEmailService.sendOrderStatusUpdate(
          order.orderNumber,
          order.email,
          customerName,
          newStatus,
          oldStatus,
          language
        );
        break;

      case 'cancelled':
        // Restore stock for PC component and PC configuration items
        try {
          const cancelledOrder = await this.ordersRepository.findByIdWithItems(order.id) as any;
          if (cancelledOrder?.items) {
            for (const item of cancelledOrder.items) {
              if (item.pcComponentId) {
                await this.pcComponentRepository.incrementStock(
                  item.pcComponentId,
                  item.quantity
                );
              }
              if (item.pcConfigurationId) {
                await this.pcConfigurationRepository.incrementStock(
                  item.pcConfigurationId,
                  item.quantity
                );
              }
            }
          }
        } catch (stockError) {
          console.error('Failed to restore stock on cancellation:', stockError);
        }

        await this.orderEmailService.sendCancelledNotification(
          order.orderNumber,
          order.email,
          customerName,
          undefined, // reason
          undefined, // refundAmount
          language
        );
        break;

      case 'partial_paid':
      case 'awaiting_final':
        // Send status update for partial payment states
        await this.orderEmailService.sendOrderStatusUpdate(
          order.orderNumber,
          order.email,
          customerName,
          newStatus,
          oldStatus,
          language,
          'Your order is progressing. We will notify you when the next step is ready.'
        );
        break;

      default:
        // For any other status changes, send generic update
        await this.orderEmailService.sendOrderStatusUpdate(
          order.orderNumber,
          order.email,
          customerName,
          newStatus,
          oldStatus,
          language
        );
        break;
    }
  }

  // ==================== PART 4: Order Modification ====================

  /**
   * Modify an order (update items, add adjustments, change status)
   */
  async modifyOrder(
    orderId: string,
    data: {
      items?: Array<{ id?: string; serviceName: string; serviceDescription?: string; quantity: number; price: number; pcComponentId?: string; pcConfigurationId?: string }>;
      adjustments?: Array<{ type: 'discount' | 'fee' | 'correction' | 'refund'; description: string; amount: number }>;
      status?: OrderStatus;
    },
    admin: { id: string; name: string; ip?: string }
  ): Promise<OrderDTO | null> {
    const order = await this.ordersRepository.findByIdWithItems(orderId);
    if (!order) return null;

    const changes: string[] = [];

    // Update items if provided
    if (data.items) {
      // Restore stock for old items being removed
      const oldItems = (order as any).items || [];
      for (const oldItem of oldItems) {
        if (oldItem.pcComponentId) {
          await this.pcComponentRepository.incrementStock(oldItem.pcComponentId, oldItem.quantity);
        }
        if (oldItem.pcConfigurationId) {
          await this.pcConfigurationRepository.incrementStock(oldItem.pcConfigurationId, oldItem.quantity);
        }
      }

      // Remove existing items
      await OrderItem.destroy({ where: { orderId } as any });

      // Create new items
      for (const item of data.items) {
        await OrderItem.create({
          orderId,
          serviceName: item.serviceName,
          serviceDescription: item.serviceDescription,
          quantity: item.quantity,
          price: item.price,
          pcComponentId: item.pcComponentId || undefined,
          pcConfigurationId: item.pcConfigurationId || undefined,
        } as any);
      }

      // Decrement stock for new items
      for (const item of data.items) {
        if (item.pcComponentId) {
          const success = await this.pcComponentRepository.decrementStock(item.pcComponentId, item.quantity);
          if (!success) {
            console.warn(`Warning: Insufficient stock for component ${item.pcComponentId} during order modify`);
          }
        }
        if (item.pcConfigurationId) {
          const success = await this.pcConfigurationRepository.decrementStock(item.pcConfigurationId, item.quantity);
          if (!success) {
            console.warn(`Warning: Insufficient stock for PC configuration ${item.pcConfigurationId} during order modify`);
          }
        }
      }

      changes.push('items_updated');
    }

    // Add adjustments if provided
    if (data.adjustments && data.adjustments.length > 0) {
      for (const adj of data.adjustments) {
        await this.orderAdjustmentRepository.createAdjustment({
          orderId,
          type: adj.type,
          description: adj.description,
          amount: adj.amount,
          adminUserId: admin.id,
          adminUserName: admin.name,
        });
      }
      changes.push('adjustments_added');
    }

    // Recalculate total amount
    let balanceInfo: { balanceDue: number; previouslyPaid: number; newTotal: number } | null = null;
    const updatedOrder = await this.ordersRepository.findByIdWithItems(orderId);
    if (updatedOrder) {
      const itemsTotal = (updatedOrder as any).items?.reduce(
        (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity, 0
      ) || 0;
      const adjustmentsTotal = await this.orderAdjustmentRepository.getTotalAdjustments(orderId);
      const newTotal = Math.max(0, itemsTotal + adjustmentsTotal);

      await this.ordersRepository.update(orderId, { totalAmount: newTotal } as any);
      changes.push(`total_recalculated: ${newTotal}`);

      // Check if new total exceeds previously paid amount
      const succeededPayments = (updatedOrder as any).payments?.filter(
        (p: any) => p.status === 'succeeded'
      ) || [];
      const previouslyPaid = succeededPayments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.amount), 0
      );

      if (newTotal > previouslyPaid && previouslyPaid > 0) {
        const balanceDue = newTotal - previouslyPaid;
        const currency = (updatedOrder as any).currency || 'SEK';

        // Create additional payment record
        await Payment.create({
          orderId,
          amount: balanceDue,
          currency,
          phase: 'additional',
          status: 'pending',
        });

        // If order was paid or completed, set status to partial_paid
        const currentStatus = data.status || order.status;
        if (currentStatus === 'paid' || currentStatus === 'completed') {
          await this.ordersRepository.updateStatus(orderId, 'partial_paid');
          changes.push(`status: ${currentStatus} → partial_paid (balance due)`);
          // Skip the explicit status update below since we just handled it
          data.status = undefined;
        }

        // Determine added items for email
        const addedItems = data.items
          ? data.items.filter(i => !i.id).map(i => ({
              serviceName: i.serviceName,
              quantity: i.quantity,
              price: i.price,
            }))
          : [];

        // Send balance due email — but skip if status is also changing to
        // awaiting_final, because the additional payment will be merged into
        // the final payment and the status update email covers it instead.
        if (data.status !== 'awaiting_final') {
          try {
            await this.sendBalanceDueEmail(
              updatedOrder,
              balanceDue,
              addedItems.length > 0 ? addedItems : data.items || [],
              previouslyPaid,
              newTotal,
            );
          } catch (error) {
            console.error('Failed to send balance due email:', error);
          }
        }

        balanceInfo = { balanceDue, previouslyPaid, newTotal };
        changes.push(`balance_due_created: ${balanceDue}`);
      }
    }

    // Update status if provided — delegate to updateOrderStatus so that
    // awaiting_final correctly sets readyForFinalPayment, partialPaymentStatus, etc.
    if (data.status && data.status !== order.status) {
      // Re-read current status in case it was changed above (e.g. partial_paid from balance due)
      const currentOrder = await this.ordersRepository.findById(orderId);
      const oldStatus = currentOrder ? currentOrder.status : order.status;

      await this.updateOrderStatus(orderId, { status: data.status });
      changes.push(`status: ${oldStatus} → ${data.status}`);
    }

    // Log the modification
    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'order.modified',
      targetType: 'Order',
      targetId: orderId,
      details: { changes, ...(balanceInfo || {}) },
      ipAddress: admin.ip,
    });

    // Return updated order in admin detail format (with adjustments)
    const adminDetail = await this.getOrderDetailForAdmin(orderId);
    if (adminDetail && balanceInfo) {
      (adminDetail as any).balanceInfo = balanceInfo;
    }
    return adminDetail;
  }

  /**
   * Get order adjustments
   */
  async getOrderAdjustments(orderId: string) {
    const adjustments = await this.orderAdjustmentRepository.findByOrderId(orderId);
    return adjustments.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      amount: parseFloat(a.amount.toString()),
      adminUserName: a.adminUserName,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Delete an order adjustment and recalculate total
   */
  async deleteOrderAdjustment(
    orderId: string,
    adjustmentId: string,
    admin: { id: string; name: string; ip?: string }
  ) {
    const deleted = await this.orderAdjustmentRepository.deleteAdjustment(adjustmentId);
    if (!deleted) throw new Error('Adjustment not found');

    // Recalculate total
    const order = await this.ordersRepository.findByIdWithItems(orderId);
    if (order) {
      const itemsTotal = (order as any).items?.reduce(
        (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity, 0
      ) || 0;
      const adjustmentsTotal = await this.orderAdjustmentRepository.getTotalAdjustments(orderId);
      const newTotal = Math.max(0, itemsTotal + adjustmentsTotal);
      await this.ordersRepository.update(orderId, { totalAmount: newTotal } as any);
    }

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'order.adjustment_deleted',
      targetType: 'Order',
      targetId: orderId,
      details: { adjustmentId },
      ipAddress: admin.ip,
    });
  }

  // ==================== PART 4: Order Notes ====================

  async getOrderNotes(orderId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize;
    const { notes, total } = await this.internalNoteRepository.findByTarget('order', orderId, pageSize, offset);
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

  async createOrderNote(
    orderId: string,
    content: string,
    admin: { id: string; name: string }
  ) {
    const note = await this.internalNoteRepository.createNote({
      targetType: 'order',
      targetId: orderId,
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

  async updateOrderNote(noteId: string, content: string, adminId: string) {
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

  async deleteOrderNote(noteId: string, adminId: string) {
    const existing = await this.internalNoteRepository.findById(noteId);
    if (!existing) throw new Error('Note not found');
    if (existing.authorId !== adminId) throw new Error('You can only delete your own notes');
    return this.internalNoteRepository.deleteNote(noteId);
  }

  // ==================== PART 4: Order Emails ====================

  async getOrderEmails(orderId: string, page: number = 1, pageSize: number = 50) {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Email.findAndCountAll({
      where: { orderId } as any,
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

  async sendOrderEmail(
    orderId: string,
    data: { subject: string; body: string; language?: 'en' | 'sv' },
    admin: { id: string; name: string; ip?: string }
  ) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    await this.emailService.sendEmailWithRetry({
      to: order.email,
      subject: data.subject,
      templateType: EmailTemplateType.ADMIN_CUSTOM,
      templateData: {
        firstName: order.firstName,
        subject: data.subject,
        body: data.body,
      },
      priority: EmailPriority.NORMAL,
      userId: order.userId,
      orderId,
      language: data.language || 'en',
    });

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'order.email_sent',
      targetType: 'Order',
      targetId: orderId,
      details: { subject: data.subject },
      ipAddress: admin.ip,
    });
  }

  /**
   * Get admin order detail (enhanced for admin view with adjustments)
   */
  async getOrderDetailForAdmin(orderId: string) {
    const order = await this.ordersRepository.findByIdWithItems(orderId);
    if (!order) return null;

    const adjustments = await this.orderAdjustmentRepository.findByOrderId(orderId);
    const dto = this.mapToDTO(order);

    return {
      ...dto,
      adjustments: adjustments.map(a => ({
        id: a.id,
        type: a.type,
        description: a.description,
        amount: parseFloat(a.amount.toString()),
        adminUserName: a.adminUserName,
        createdAt: a.createdAt,
      })),
    };
  }

  // ==================== Order Lock Override ====================

  /**
   * Override edit lock on completed/cancelled orders
   */
  async overrideOrderLock(
    orderId: string,
    admin: { id: string; name: string; ip?: string }
  ): Promise<void> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      throw new Error('Order is not in a locked status');
    }

    await this.auditLogService.log({
      adminUserId: admin.id,
      adminUserName: admin.name,
      action: 'order.lock_overridden',
      targetType: 'Order',
      targetId: orderId,
      details: { status: order.status },
      ipAddress: admin.ip,
    });
  }

  // ==================== Balance Due Email ====================

  /**
   * Send balance due email to customer after order modification
   */
  private async sendBalanceDueEmail(
    order: any,
    balanceDue: number,
    addedItems: Array<{ serviceName: string; quantity: number; price: number }>,
    previouslyPaid: number,
    newTotal: number,
  ): Promise<void> {
    const customerName = `${order.firstName} ${order.lastName}`;
    const language = 'en' as 'en' | 'sv';

    // Convert NET amounts to GROSS for customer-facing email
    const vatRate = await this.vatSettingsService.getCurrentRate();
    const grossMultiplier = 1 + vatRate;
    const grossItems = addedItems.map(item => ({
      ...item,
      price: item.price * grossMultiplier,
    }));
    const grossNewTotal = newTotal * grossMultiplier;
    const grossPreviouslyPaid = previouslyPaid * grossMultiplier;
    const grossBalanceDue = balanceDue * grossMultiplier;

    const subject = language === 'sv'
      ? `Saldo att betala - Order #${order.orderNumber}`
      : `Balance Due - Order #${order.orderNumber}`;

    await this.emailService.sendEmailWithRetry({
      to: order.email,
      subject,
      templateType: EmailTemplateType.ORDER_BALANCE_DUE,
      templateData: {
        orderId: order.orderNumber,
        customerName,
        itemsAdded: grossItems,
        newTotal: grossNewTotal,
        amountPaid: grossPreviouslyPaid,
        balanceDue: grossBalanceDue,
        currency: order.currency || 'SEK',
        dashboardUrl: `${process.env.FRONTEND_URL || ''}/dashboard?tab=orders`,
        language,
      },
      priority: EmailPriority.HIGH,
      userId: order.userId,
      orderId: order.id,
      language,
    });
  }

  // Helper methods

  private mapToDTO = (order: any): OrderDTO => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      totalAmount: parseFloat(order.totalAmount),
      status: order.status,
      currency: order.currency,
      paymentId: order.paymentId,
      email: order.email,
      firstName: order.firstName,
      lastName: order.lastName,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      couponId: order.couponId,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount != null ? parseFloat(order.discountAmount.toString()) : undefined,
      requiresPartialPayment: order.requiresPartialPayment,
      partialPaymentStatus: order.partialPaymentStatus,
      readyForFinalPayment: order.readyForFinalPayment,
      readyForFinalPaymentAt: order.readyForFinalPaymentAt,
      notifiedForFinalPayment: order.notifiedForFinalPayment,
      items: order.items ? order.items.map(this.mapItemToDTO) : [],
      payments: order.payments ? order.payments.map(this.mapPaymentToDTO) : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  };

  private mapPaymentToDTO = (payment: any): any => {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      phase: payment.phase,
      status: payment.status,
      paymentIntentId: payment.paymentIntentId,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  };

  private mapItemToDTO = (item: any): OrderItemDTO => {
    return {
      id: item.id,
      serviceId: item.serviceId,
      pcComponentId: item.pcComponentId || undefined,
      pcConfigurationId: item.pcConfigurationId || undefined,
      serviceName: item.serviceName,
      serviceDescription: item.serviceDescription,
      quantity: item.quantity,
      price: parseFloat(item.price),
    };
  };
}

export default OrdersService;
