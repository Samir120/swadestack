import OrdersRepository from '../integration/repositories/OrdersRepository';
import ServicesRepository from '../integration/repositories/ServicesRepository';
import OrderItem from '../models/sequelize/OrderItem';
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
import InvoiceService from './InvoiceService';
import CouponsService from './CouponsService';
import { CartItemContext } from '../models/dto/CouponDTO';

/**
 * Orders Service - Business Logic Layer
 * Handles order processing, payment, and fulfillment
 */
export class OrdersService {
  private ordersRepository: OrdersRepository;
  private servicesRepository: ServicesRepository;
  private partialPaymentService: PartialPaymentService;
  private orderEmailService: OrderEmailService;
  private invoiceService: InvoiceService;
  private couponsService: CouponsService;

  constructor() {
    this.ordersRepository = new OrdersRepository();
    this.servicesRepository = new ServicesRepository();
    this.partialPaymentService = new PartialPaymentService();
    this.orderEmailService = new OrderEmailService();
    this.invoiceService = new InvoiceService();
    this.couponsService = new CouponsService();
  }

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderDTO): Promise<OrderDTO> {
    const hasServiceItems = data.items && data.items.length > 0;
    const hasPCItems = data.pcItems && data.pcItems.length > 0;

    // Validate at least one item exists
    if (!hasServiceItems && !hasPCItems) {
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
      serviceName: item.serviceName,
      serviceDescription: item.serviceDescription,
      quantity: item.quantity,
      price: parseFloat(item.price),
    };
  };
}

export default OrdersService;
