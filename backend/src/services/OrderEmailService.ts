import { EmailService } from './EmailService';
import { OrderConfirmationDTO, PartialPaymentConfirmationDTO, FinalPaymentConfirmationDTO, SendEmailDTO, EmailAttachment } from '../models/dto/emailDTO';
import { EmailTemplateType, EmailPriority } from '../config/emailConfig';

export class OrderEmailService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderConfirmationDTO, attachments?: EmailAttachment[]): Promise<void> {
    const subject =
      data.language === 'sv'
        ? `Orderbekräftelse #${data.orderId}`
        : `Order Confirmation #${data.orderId}`;

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.ORDER_CONFIRMATION,
      templateData: {
        orderId: data.orderId,
        customerName: data.customerName,
        orderItems: data.orderItems,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        vatRatePercent: data.vatRatePercent ?? 25,
        discountAmount: data.discountAmount || 0,
        couponCode: data.couponCode || '',
        orderDate: data.orderDate,
        language: data.language,
        dashboardUrl: process.env.FRONTEND_URL || '',
      },
      priority: EmailPriority.HIGH,
      orderId: data.orderId,
      language: data.language,
      attachments,
    };

    await this.emailService.sendEmailWithRetry(emailData);
  }

  /**
   * Send partial payment confirmation email (after initial 50% payment)
   */
  async sendPartialPaymentConfirmation(data: PartialPaymentConfirmationDTO, attachments?: EmailAttachment[]): Promise<void> {
    const subject =
      data.language === 'sv'
        ? `Initial betalning mottagen - Order #${data.orderId}`
        : `Initial Payment Received - Order #${data.orderId}`;

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.PARTIAL_PAYMENT_CONFIRMATION,
      templateData: {
        orderId: data.orderId,
        customerName: data.customerName,
        orderItems: data.orderItems,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        vatRatePercent: data.vatRatePercent ?? 25,
        discountAmount: data.discountAmount || 0,
        couponCode: data.couponCode || '',
        initialAmount: data.initialAmount,
        remainingAmount: data.remainingAmount,
        paidDate: data.paidDate,
        orderDate: data.orderDate,
        language: data.language,
        dashboardUrl: process.env.FRONTEND_URL || '',
      },
      priority: EmailPriority.HIGH,
      orderId: data.orderId,
      language: data.language,
      attachments,
    };

    await this.emailService.sendEmailWithRetry(emailData);
  }

  /**
   * Send final payment confirmation email (after remaining 50% payment completes the order)
   */
  async sendFinalPaymentConfirmation(data: FinalPaymentConfirmationDTO, attachments?: EmailAttachment[]): Promise<void> {
    const subject =
      data.language === 'sv'
        ? `Slutbetalning mottagen - Order #${data.orderId} är fullbetald`
        : `Final Payment Received - Order #${data.orderId} Fully Paid`;

    const emailData: SendEmailDTO = {
      to: data.email,
      subject,
      templateType: EmailTemplateType.FINAL_PAYMENT_CONFIRMATION,
      templateData: {
        orderId: data.orderId,
        customerName: data.customerName,
        orderItems: data.orderItems,
        totalAmount: data.totalAmount,
        vatAmount: data.vatAmount,
        vatRatePercent: data.vatRatePercent ?? 25,
        discountAmount: data.discountAmount || 0,
        couponCode: data.couponCode || '',
        initialAmount: data.initialAmount,
        finalAmount: data.finalAmount,
        initialPaidDate: data.initialPaidDate,
        finalPaidDate: data.finalPaidDate,
        orderDate: data.orderDate,
        language: data.language,
        dashboardUrl: process.env.FRONTEND_URL || '',
      },
      priority: EmailPriority.HIGH,
      orderId: data.orderId,
      language: data.language,
      attachments,
    };

    await this.emailService.sendEmailWithRetry(emailData);
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    orderNumber: string,
    email: string,
    customerName: string,
    newStatus: string,
    oldStatus: string,
    language: 'en' | 'sv' = 'en',
    additionalInfo?: string,
    attachments?: EmailAttachment[]
  ): Promise<void> {
    const statusTranslations: Record<string, { en: string; sv: string }> = {
      pending: { en: 'Pending', sv: 'Väntar' },
      processing: { en: 'Processing', sv: 'Bearbetas' },
      paid: { en: 'Paid', sv: 'Betald' },
      partial_paid: { en: 'Partially Paid', sv: 'Delvis betald' },
      awaiting_final: { en: 'Awaiting Final Payment', sv: 'Väntar på slutbetalning' },
      shipped: { en: 'Shipped', sv: 'Skickad' },
      delivered: { en: 'Delivered', sv: 'Levererad' },
      completed: { en: 'Completed', sv: 'Slutförd' },
      cancelled: { en: 'Cancelled', sv: 'Avbruten' },
    };

    const translatedStatus = statusTranslations[newStatus]?.[language] || newStatus;

    const subject =
      language === 'sv'
        ? `Order #${orderNumber} - Status uppdaterad till ${translatedStatus}`
        : `Order #${orderNumber} - Status Updated to ${translatedStatus}`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.ORDER_STATUS_UPDATE,
      templateData: {
        orderId: orderNumber,
        customerName,
        newStatus: translatedStatus,
        oldStatus: statusTranslations[oldStatus]?.[language] || oldStatus,
        language,
        additionalInfo,
        dashboardUrl: process.env.FRONTEND_URL || '',
        updatedAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      orderId: undefined, // Don't store order ID for status updates (we only have order number)
      language,
      attachments,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send order shipped notification
   */
  async sendShippedNotification(
    orderNumber: string,
    email: string,
    customerName: string,
    trackingNumber?: string,
    estimatedDelivery?: Date,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv'
        ? `Din order #${orderNumber} har skickats!`
        : `Your order #${orderNumber} has been shipped!`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.ORDER_STATUS_UPDATE,
      templateData: {
        orderId: orderNumber,
        customerName,
        newStatus: language === 'sv' ? 'Skickad' : 'Shipped',
        trackingNumber,
        estimatedDelivery,
        language,
        dashboardUrl: process.env.FRONTEND_URL || '',
        shippedAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      orderId: undefined,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send order delivered notification
   */
  async sendDeliveredNotification(
    orderNumber: string,
    email: string,
    customerName: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv'
        ? `Din order #${orderNumber} har levererats!`
        : `Your order #${orderNumber} has been delivered!`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.ORDER_STATUS_UPDATE,
      templateData: {
        orderId: orderNumber,
        customerName,
        newStatus: language === 'sv' ? 'Levererad' : 'Delivered',
        language,
        dashboardUrl: process.env.FRONTEND_URL || '',
        deliveredAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      orderId: undefined,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send order cancelled notification
   */
  async sendCancelledNotification(
    orderNumber: string,
    email: string,
    customerName: string,
    reason?: string,
    refundAmount?: number,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv'
        ? `Order #${orderNumber} har avbrutits`
        : `Order #${orderNumber} has been cancelled`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.ORDER_STATUS_UPDATE,
      templateData: {
        orderId: orderNumber,
        customerName,
        newStatus: language === 'sv' ? 'Avbruten' : 'Cancelled',
        reason,
        refundAmount,
        language,
        cancelledAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      orderId: undefined,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(
    orderNumber: string,
    email: string,
    customerName: string,
    amount: number,
    paymentMethod: string,
    language: 'en' | 'sv' = 'en'
  ): Promise<void> {
    const subject =
      language === 'sv'
        ? `Betalning mottagen för order #${orderNumber}`
        : `Payment received for order #${orderNumber}`;

    const emailData: SendEmailDTO = {
      to: email,
      subject,
      templateType: EmailTemplateType.ORDER_CONFIRMATION,
      templateData: {
        orderId: orderNumber,
        customerName,
        amount,
        paymentMethod,
        language,
        isPaymentConfirmation: true,
        paidAt: new Date(),
      },
      priority: EmailPriority.HIGH,
      orderId: undefined,
      language,
    };

    await this.emailService.sendEmail(emailData);
  }
}
