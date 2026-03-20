import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import OrdersService from './OrdersService';
import PartialPaymentService from './PartialPaymentService';
import PaymentRepository from '../integration/repositories/PaymentRepository';
import { PaymentPhase } from '../models/sequelize/Payment';
import { OrderEmailService } from './OrderEmailService';
import InvoiceService from './InvoiceService';
import VatSettingsService from './VatSettingsService';

// Klarna API Types
interface KlarnaOrderLine {
  type: 'physical' | 'discount' | 'shipping_fee' | 'digital';
  reference: string;
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
  total_tax_amount: number;
  image_url?: string;
  product_url?: string;
}

interface KlarnaAddress {
  given_name?: string;
  family_name?: string;
  email?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
}

interface KlarnaOrderRequest {
  purchase_country: string;
  purchase_currency: string;
  locale: string;
  order_amount: number;
  order_tax_amount: number;
  order_lines: KlarnaOrderLine[];
  merchant_urls: {
    terms: string;
    checkout: string;
    confirmation: string;
    push: string;
  };
  billing_address?: KlarnaAddress;
  merchant_reference1?: string;
  merchant_reference2?: string;
  merchant_data?: string;
}

interface KlarnaOrderResponse {
  order_id: string;
  status: string;
  html_snippet: string;
  merchant_reference1?: string;
  merchant_reference2?: string;
  billing_address?: KlarnaAddress;
  shipping_address?: KlarnaAddress;
  order_amount: number;
  order_tax_amount: number;
  order_lines: KlarnaOrderLine[];
}

interface KlarnaCheckoutResult {
  htmlSnippet: string;
  klarnaOrderId: string;
  paymentId?: string;
}

export class KlarnaService {
  private client: AxiosInstance;
  private ordersService: OrdersService;
  private partialPaymentService: PartialPaymentService;
  private paymentRepository: PaymentRepository;
  private orderEmailService: OrderEmailService;
  private invoiceService: InvoiceService;
  private vatSettingsService: VatSettingsService;

  constructor() {
    // Initialize Axios client with Basic Auth
    this.client = axios.create({
      baseURL: config.klarna.baseUrl,
      auth: {
        username: config.klarna.username,
        password: config.klarna.password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.ordersService = new OrdersService();
    this.partialPaymentService = new PartialPaymentService();
    this.paymentRepository = new PaymentRepository();
    this.orderEmailService = new OrderEmailService();
    this.invoiceService = new InvoiceService();
    this.vatSettingsService = new VatSettingsService();
  }

  /** Calculate VAT portion from a gross (VAT-inclusive) amount in öre */
  private calcVATFromGross(grossOre: number, klarnaTaxRate: number): number {
    return grossOre - Math.round(grossOre * 10000 / (10000 + klarnaTaxRate));
  }

  /**
   * Create a Klarna Checkout session for an order
   */
  async createCheckoutOrder(
    orderId: string,
    phase: PaymentPhase
  ): Promise<KlarnaCheckoutResult> {
    // Get order details
    const order = await this.ordersService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate payment phase
    const validation = await this.partialPaymentService.validatePaymentPhase(orderId, phase);
    if (!validation.valid) {
      throw new Error(`Invalid payment phase: ${validation.reason}`);
    }

    // Get the appropriate payment record and amount
    let paymentRecord;
    let amount: number;

    if (phase === 'full') {
      amount = order.totalAmount;
    } else {
      const payments = await this.paymentRepository.findByOrderId(orderId);

      if (phase === 'additional') {
        paymentRecord = payments.find(p => p.phase === 'additional' && p.status === 'pending');
      } else {
        paymentRecord = payments.find(p => p.phase === phase);
      }

      if (!paymentRecord) {
        throw new Error(`Payment record not found for phase: ${phase}`);
      }

      amount = parseFloat(paymentRecord.amount.toString());
    }

    // Fetch dynamic VAT rate
    const vatRate = await this.vatSettingsService.getCurrentRate();
    const grossMultiplier = 1 + vatRate; // e.g. 1.25
    const klarnaTaxRate = Math.round(vatRate * 10000); // e.g. 2500

    // Convert to GROSS minor units (öre) — prices in DB are VAT-exclusive
    // Coupon discount is flat (no VAT): gross_total = items_gross - flat_discount
    const discountNet = order.discountAmount != null ? parseFloat(order.discountAmount.toString()) : 0;
    let amountInMinorUnits: number;
    if (phase === 'additional') {
      // Additional payment: amount is the exact balance due (net), convert to gross directly
      amountInMinorUnits = Math.round(amount * grossMultiplier * 100);
    } else if (discountNet > 0) {
      // Recover pre-discount items total and compute gross with flat discount
      const itemsNetTotal = order.totalAmount + discountNet;
      const fullGrossMinor = Math.round(itemsNetTotal * grossMultiplier * 100) - Math.round(discountNet * 100); // items_gross - flat_discount
      if (phase === 'full') {
        amountInMinorUnits = fullGrossMinor;
      } else {
        // Partial: proportional share of the full gross total
        const ratio = amount / order.totalAmount; // e.g. 0.5 for 50/50
        amountInMinorUnits = Math.round(fullGrossMinor * ratio);
      }
    } else {
      amountInMinorUnits = Math.round(amount * grossMultiplier * 100); // net * (1+vatRate) * 100
    }

    // Build order lines and ensure total matches order amount
    const orderLines: KlarnaOrderLine[] = this.buildOrderLines(order, amount, phase, amountInMinorUnits, vatRate);

    // Build merchant URLs with our order ID directly in the path
    // Replace the placeholder with our order ID for simpler tracking
    const merchantUrls = {
      terms: config.klarna.termsUrl,
      checkout: config.klarna.checkoutUrl.replace('{checkout.order.id}', orderId),
      confirmation: config.klarna.confirmationUrl.replace('{checkout.order.id}', orderId),
      push: `${config.klarna.pushUrl}?order_id=${orderId}&phase=${phase}${paymentRecord ? `&payment_id=${paymentRecord.id}` : ''}`,
    };

    console.log('Klarna Merchant URLs:', JSON.stringify(merchantUrls, null, 2));

    // Build Klarna order request
    // Using SE/SEK for Swedish market
    const klarnaOrderRequest: KlarnaOrderRequest = {
      purchase_country: 'SE',
      purchase_currency: 'SEK',
      locale: 'sv-SE',
      order_amount: amountInMinorUnits,
      order_tax_amount: orderLines.reduce((sum, line) => sum + line.total_tax_amount, 0),
      order_lines: orderLines,
      merchant_urls: merchantUrls,
      merchant_reference1: order.orderNumber,
      merchant_reference2: phase,
      merchant_data: JSON.stringify({
        orderId: order.id,
        phase: phase,
        paymentId: paymentRecord?.id || null,
      }),
    };

    // Pre-fill customer info if available
    if (order.email || order.firstName || order.lastName) {
      klarnaOrderRequest.billing_address = {
        email: order.email,
        given_name: order.firstName,
        family_name: order.lastName,
      };
    }

    try {
      console.log('=== Klarna Checkout Request ===');
      console.log('Request payload:', JSON.stringify(klarnaOrderRequest, null, 2));
      console.log('===============================');

      // Create Klarna checkout order
      const response = await this.client.post<KlarnaOrderResponse>(
        '/checkout/v3/orders',
        klarnaOrderRequest
      );

      const klarnaOrder = response.data;

      // Update payment record with Klarna order ID (partial payments)
      if (paymentRecord) {
        await this.paymentRepository.update(paymentRecord.id, {
          klarnaOrderId: klarnaOrder.order_id,
          status: 'processing',
        });
      }

      // For full payments, create a Payment record to track the Klarna order ID
      if (phase === 'full') {
        const fullPaymentRecord = await this.paymentRepository.create({
          orderId,
          amount,
          currency: order.currency || 'SEK',
          phase: 'full',
          status: 'processing',
          klarnaOrderId: klarnaOrder.order_id,
        });
        console.log(`✓ Created payment record ${fullPaymentRecord.id} for full payment order ${order.orderNumber}`);
      }

      console.log(`✓ Created Klarna checkout for order ${order.orderNumber} (${phase}): ${klarnaOrder.order_id}`);

      return {
        htmlSnippet: klarnaOrder.html_snippet,
        klarnaOrderId: klarnaOrder.order_id,
        paymentId: paymentRecord?.id,
      };
    } catch (error: any) {
      console.error('=== Klarna API Error Details ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Response Headers:', JSON.stringify(error.response?.headers, null, 2));
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('================================');

      // Provide helpful error messages based on status code
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.error_messages?.[0] ||
                        error.response?.data?.message ||
                        'Access denied. Your Klarna account may not have Klarna Checkout enabled. Please check your Klarna Merchant Portal or contact Klarna support.';
        throw new Error(`Klarna 403 Forbidden: ${errorMsg}`);
      }

      throw new Error(`Failed to create Klarna checkout: ${error.response?.data?.error_messages?.[0] || error.message}`);
    }
  }

  /**
   * Build order lines for Klarna
   * @param order - The order object
   * @param _amount - The amount in major units (SEK) - unused, kept for API compatibility
   * @param phase - Payment phase
   * @param targetAmountMinorUnits - The target total in minor units (öre) - order lines must sum to this
   */
  private buildOrderLines(order: any, _amount: number, phase: PaymentPhase, targetAmountMinorUnits: number, vatRate: number = 0.25): KlarnaOrderLine[] {
    const klarnaTaxRate = Math.round(vatRate * 10000);
    const grossMultiplier = 1 + vatRate;

    // For partial/additional payments, create a single line item
    // targetAmountMinorUnits is already gross (VAT-inclusive)
    if (phase !== 'full') {
      const phaseDescription = phase === 'initial' ? 'Initial Payment (50%)' : phase === 'final' ? 'Final Payment (50%)' : 'Additional Payment (Balance Due)';
      return [
        {
          type: 'physical',
          reference: order.orderNumber,
          name: `Order ${order.orderNumber} - ${phaseDescription}`,
          quantity: 1,
          unit_price: targetAmountMinorUnits,
          tax_rate: klarnaTaxRate,
          total_amount: targetAmountMinorUnits,
          total_tax_amount: this.calcVATFromGross(targetAmountMinorUnits, klarnaTaxRate),
        },
      ];
    }

    // For full payment, include individual items if available
    // item.price is NET (VAT-exclusive) — multiply by 1.25 for gross Klarna prices
    if (order.items && order.items.length > 0) {
      const orderLines: KlarnaOrderLine[] = [];
      let lineIndex = 1;

      for (const item of order.items) {
        // Check if this is a PC Configuration with component details
        if (item.serviceName === 'Custom PC Configuration' && item.serviceDescription) {
          try {
            const configData = JSON.parse(item.serviceDescription);

            // Extract components from the configuration
            if (configData.components) {
              console.log('Processing PC Configuration components for Klarna order lines...');

              // Array-based component types (multiple items per category)
              const arrayComponentTypes = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];

              // Helper function to add a single component to order lines
              const addComponentLine = (categoryName: string, comp: any) => {
                const componentName = comp.name_en || comp.name || categoryName;
                const componentPrice = typeof comp.price === 'string' ? parseFloat(comp.price) : (comp.price || 0);
                const componentImage = comp.imageUrl || comp.image_url || comp.image || null;
                const quantity = comp.quantity || 1;

                console.log(`  - ${categoryName}: ${componentName}, price: ${componentPrice}, quantity: ${quantity}, hasImage: ${!!componentImage}`);

                // Net price → gross (VAT-inclusive) for Klarna
                const grossUnitPrice = Math.round(componentPrice * grossMultiplier * 100); // net * 1.25 * 100
                const totalAmount = grossUnitPrice * quantity;

                const orderLine: KlarnaOrderLine = {
                  type: 'physical',
                  reference: `${order.orderNumber}-${lineIndex}`,
                  name: `${categoryName.toUpperCase()}: ${componentName}`,
                  quantity: quantity,
                  unit_price: grossUnitPrice,
                  tax_rate: klarnaTaxRate,
                  total_amount: totalAmount,
                  total_tax_amount: this.calcVATFromGross(totalAmount, klarnaTaxRate),
                };

                // Add image URL if available
                if (componentImage) {
                  orderLine.image_url = componentImage;
                }

                orderLines.push(orderLine);
                lineIndex++;
              };

              for (const [category, component] of Object.entries(configData.components)) {
                if (!component) continue;

                // Check if this is an array-based component type
                if (arrayComponentTypes.includes(category) && Array.isArray(component)) {
                  // Handle array components (rams, gpus, ssds, hdds, fans)
                  const singularName = category.slice(0, -1); // rams -> ram, gpus -> gpu, etc.
                  for (const item of component) {
                    if (item && typeof item === 'object') {
                      addComponentLine(singularName, item);
                    }
                  }
                } else if (typeof component === 'object' && !Array.isArray(component)) {
                  // Handle single components (cpu, motherboard, psu, case, cooling, optical, os)
                  addComponentLine(category, component);
                }
              }
            }

            // Add build service if present
            // Check for buildService object OR includesBuildService flag with buildServiceCharge
            if (configData.buildService) {
              const buildService = configData.buildService;
              const bsPrice = typeof buildService.price === 'string' ? parseFloat(buildService.price) : (buildService.price || 0);
              const grossPrice = Math.round(bsPrice * grossMultiplier * 100);
              const buildServiceLine: KlarnaOrderLine = {
                type: 'physical',
                reference: `${order.orderNumber}-${lineIndex}`,
                name: `BUILD SERVICE: ${buildService.name_en || buildService.name || 'Professional Assembly'}`,
                quantity: 1,
                unit_price: grossPrice,
                tax_rate: klarnaTaxRate,
                total_amount: grossPrice,
                total_tax_amount: this.calcVATFromGross(grossPrice, klarnaTaxRate),
              };
              // Add build service image if available
              if (buildService.imageUrl || buildService.image_url) {
                buildServiceLine.image_url = buildService.imageUrl || buildService.image_url;
              }
              orderLines.push(buildServiceLine);
              lineIndex++;
            } else if (configData.includesBuildService && configData.buildServiceCharge) {
              // Handle legacy format where build service is stored as separate fields
              const charge = typeof configData.buildServiceCharge === 'string' ? parseFloat(configData.buildServiceCharge) : configData.buildServiceCharge;
              const grossCharge = Math.round(charge * grossMultiplier * 100);
              orderLines.push({
                type: 'physical',
                reference: `${order.orderNumber}-${lineIndex}`,
                name: 'BUILD SERVICE: Professional Assembly',
                quantity: 1,
                unit_price: grossCharge,
                tax_rate: klarnaTaxRate,
                total_amount: grossCharge,
                total_tax_amount: this.calcVATFromGross(grossCharge, klarnaTaxRate),
              });
              lineIndex++;
            } else if (configData.priceBreakdown?.buildServiceCharge) {
              // Also check priceBreakdown for build service
              const charge = typeof configData.priceBreakdown.buildServiceCharge === 'string' ? parseFloat(configData.priceBreakdown.buildServiceCharge) : configData.priceBreakdown.buildServiceCharge;
              const grossCharge = Math.round(charge * grossMultiplier * 100);
              orderLines.push({
                type: 'physical',
                reference: `${order.orderNumber}-${lineIndex}`,
                name: 'BUILD SERVICE: Professional Assembly',
                quantity: 1,
                unit_price: grossCharge,
                tax_rate: klarnaTaxRate,
                total_amount: grossCharge,
                total_tax_amount: this.calcVATFromGross(grossCharge, klarnaTaxRate),
              });
              lineIndex++;
            }
          } catch (e) {
            // If JSON parsing fails, fall back to single item
            console.warn('Failed to parse PC configuration:', e);
            const grossUnitPrice = Math.round((item.price || 0) * grossMultiplier * 100);
            const totalAmount = grossUnitPrice * (item.quantity || 1);
            orderLines.push({
              type: 'physical',
              reference: `${order.orderNumber}-${lineIndex}`,
              name: item.serviceName || 'Custom PC Configuration',
              quantity: item.quantity || 1,
              unit_price: grossUnitPrice,
              tax_rate: klarnaTaxRate,
              total_amount: totalAmount,
              total_tax_amount: this.calcVATFromGross(totalAmount, klarnaTaxRate),
            });
            lineIndex++;
          }
        } else {
          // Regular service item
          const grossUnitPrice = Math.round((item.price || 0) * grossMultiplier * 100);
          const totalAmount = grossUnitPrice * (item.quantity || 1);
          const serviceImage = item.imageUrl || item.image_url || item.image || null;
          const serviceLine: KlarnaOrderLine = {
            type: 'physical',
            reference: `${order.orderNumber}-${lineIndex}`,
            name: item.serviceName || item.name || 'Product',
            quantity: item.quantity || 1,
            unit_price: grossUnitPrice,
            tax_rate: klarnaTaxRate,
            total_amount: totalAmount,
            total_tax_amount: this.calcVATFromGross(totalAmount, klarnaTaxRate),
          };
          // Add image URL if available
          if (serviceImage) {
            serviceLine.image_url = serviceImage;
          }
          orderLines.push(serviceLine);
          lineIndex++;
        }
      }

      // Add coupon discount line if applicable
      const discountAmount = order.discountAmount != null ? parseFloat(order.discountAmount.toString()) : 0;
      if (discountAmount > 0) {
        // Coupon is a flat deduction off gross — carries the same VAT rate
        // so Klarna correctly reduces VAT proportionally
        const flatDiscountOre = Math.round(discountAmount * 100); // discount in öre (gross)
        const couponLabel = order.couponCode ? `Coupon: ${order.couponCode}` : 'Discount';
        orderLines.push({
          type: 'discount',
          reference: `${order.orderNumber}-COUPON`,
          name: couponLabel,
          quantity: 1,
          unit_price: -flatDiscountOre,
          tax_rate: klarnaTaxRate,
          total_amount: -flatDiscountOre,
          total_tax_amount: -this.calcVATFromGross(flatDiscountOre, klarnaTaxRate),
        });
      }

      // Calculate the sum of all order lines
      const linesTotal = orderLines.reduce((sum, line) => sum + line.total_amount, 0);

      // If there's a difference, add a rounding adjustment line item (don't modify existing items)
      const difference = targetAmountMinorUnits - linesTotal;
      if (difference !== 0) {
        console.log(`Adding rounding adjustment of ${difference} öre to match order amount`);
        if (difference > 0) {
          // Add a small adjustment fee
          orderLines.push({
            type: 'physical',
            reference: `${order.orderNumber}-ADJ`,
            name: 'Price Adjustment',
            quantity: 1,
            unit_price: difference,
            tax_rate: klarnaTaxRate,
            total_amount: difference,
            total_tax_amount: this.calcVATFromGross(difference, klarnaTaxRate),
          });
        } else {
          // Add a discount for negative adjustment
          orderLines.push({
            type: 'discount',
            reference: `${order.orderNumber}-DISC`,
            name: 'Price Adjustment',
            quantity: 1,
            unit_price: difference,
            tax_rate: klarnaTaxRate,
            total_amount: difference,
            total_tax_amount: this.calcVATFromGross(difference, klarnaTaxRate),
          });
        }
      }

      return orderLines;
    }

    // Fallback: single line item (targetAmountMinorUnits is already gross)
    return [
      {
        type: 'physical',
        reference: order.orderNumber,
        name: `Order ${order.orderNumber}`,
        quantity: 1,
        unit_price: targetAmountMinorUnits,
        tax_rate: klarnaTaxRate,
        total_amount: targetAmountMinorUnits,
        total_tax_amount: this.calcVATFromGross(targetAmountMinorUnits, klarnaTaxRate),
      },
    ];
  }

  /**
   * Get Klarna order by ID
   */
  async getKlarnaOrder(klarnaOrderId: string): Promise<KlarnaOrderResponse> {
    try {
      const response = await this.client.get<KlarnaOrderResponse>(
        `/checkout/v3/orders/${klarnaOrderId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get Klarna order:', error.response?.data || error.message);
      throw new Error(`Failed to get Klarna order: ${error.message}`);
    }
  }

  /**
   * Handle Klarna push notification (webhook)
   */
  async handlePushNotification(
    klarnaOrderId: string,
    orderId: string,
    phase: PaymentPhase,
    paymentId?: string
  ): Promise<void> {
    console.log(`📧 Processing Klarna push notification for order: ${orderId}, phase: ${phase}`);

    try {
      // Fetch order from Klarna to verify status
      const klarnaOrder = await this.getKlarnaOrder(klarnaOrderId);

      if (klarnaOrder.status !== 'checkout_complete') {
        console.log(`Klarna order ${klarnaOrderId} status is ${klarnaOrder.status}, not processing`);
        return;
      }

      // Acknowledge the order to Klarna
      await this.acknowledgeOrder(klarnaOrderId);

      // Get local order
      const order = await this.ordersService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Guard: If order already processed (e.g., via confirmation page), skip
      if (order.status === 'paid' || order.status === 'completed') {
        console.log(`Order ${orderId} already has status ${order.status}, skipping push notification`);
        return;
      }

      // Log Klarna address for reference (address is collected by Klarna)
      if (klarnaOrder.billing_address || klarnaOrder.shipping_address) {
        const address = klarnaOrder.shipping_address || klarnaOrder.billing_address;
        if (address) {
          console.log(`Klarna address for order ${orderId}:`, JSON.stringify(address, null, 2));
          // Note: Address from Klarna can be stored if needed using a separate update method
        }
      }

      // Handle partial payment
      if (phase && paymentId) {
        await this.handlePartialPaymentSuccess(klarnaOrderId, orderId, phase, paymentId);
      } else {
        // Full payment - skip auto email since we send confirmation below
        await this.ordersService.updateOrderStatus(orderId, {
          status: 'paid',
          skipEmail: true,
        });
        console.log(`✅ Order ${orderId} marked as paid`);
      }

      // Send confirmation email with invoice PDF attached
      const updatedOrder = await this.ordersService.getOrderById(orderId);
      if (updatedOrder) {
        try {
          await this.sendPaymentEmail(updatedOrder, phase);
          console.log(`✅ Order confirmation email sent for order ${updatedOrder.orderNumber}`);
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
        }
      }
    } catch (error) {
      console.error('Error processing Klarna push notification:', error);
      throw error;
    }
  }

  /**
   * Handle partial payment success
   */
  private async handlePartialPaymentSuccess(
    klarnaOrderId: string,
    orderId: string,
    phase: PaymentPhase,
    paymentId: string
  ): Promise<void> {
    // Update Payment record
    await this.paymentRepository.updatePaymentStatus(paymentId, 'succeeded', {
      klarnaOrderId: klarnaOrderId,
      completedAt: new Date().toISOString(),
    });

    // Get order
    const order = await this.ordersService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status based on phase
    // Skip auto email - KlarnaService handles email sending in handlePushNotification
    if (phase === 'initial') {
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'partial_paid',
        skipEmail: true,
      });
      console.log(`✅ Order ${order.orderNumber} - Initial payment succeeded (50%)`);
    } else if (phase === 'final') {
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'paid',
        skipEmail: true,
      });
      console.log(`✅ Order ${order.orderNumber} - Final payment succeeded (100% complete)`);
    } else if (phase === 'additional') {
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'paid',
        skipEmail: true,
      });
      console.log(`✅ Order ${order.orderNumber} - Additional payment succeeded (balance paid)`);
    }
  }

  /**
   * Send the appropriate payment email + invoice PDF based on phase
   * Shared by handlePushNotification and processCompletedPayment
   */
  private async sendPaymentEmail(order: any, phase: PaymentPhase): Promise<void> {
    const userId = order.userId || null;
    const netTotal = Number(order.totalAmount); // NET after discount
    const vatRate = await this.vatSettingsService.getCurrentRate();
    const vatRatePercent = Math.round(vatRate * 100);
    const discountAmount = order.discountAmount != null ? Number(order.discountAmount) : 0;
    const itemsNet = netTotal + discountAmount; // items NET before discount

    // Convert item prices from NET to GROSS (VAT-inclusive) for customer-facing emails
    const orderItems = order.items.map((item: any) => ({
      name: item.serviceName,
      quantity: item.quantity,
      price: Number(item.price) * (1 + vatRate),
    }));

    // Coupon is a flat deduction off gross: total = items_gross - flat_discount
    const grossTotal = itemsNet * (1 + vatRate) - discountAmount;
    // VAT is the proportional portion of the final gross total
    const vatAmount = grossTotal * vatRate / (1 + vatRate);

    // Fetch payment records for partial/final payment details
    const payments = await this.paymentRepository.findByOrderId(order.id);
    const initialPmt = payments.find(p => p.phase === 'initial');
    const finalPmt = payments.find(p => p.phase === 'final');

    let invoiceAttachments;

    if (phase === 'initial') {
      // --- Initial (partial) payment ---
      try {
        const pdfBuffer = await this.invoiceService.generatePartialPaymentInvoicePDF(userId, order.id);
        invoiceAttachments = [{
          filename: `PP-INV-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }];
      } catch (pdfError) {
        console.error('Failed to generate partial payment invoice PDF:', pdfError);
      }

      const paidDate = initialPmt?.metadata?.completedAt
        ? new Date(initialPmt.metadata.completedAt as string)
        : new Date();

      await this.orderEmailService.sendPartialPaymentConfirmation({
        orderId: order.id,
        email: order.email,
        customerName: order.firstName || 'Customer',
        orderItems,
        totalAmount: grossTotal,
        vatAmount,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: order.couponCode || undefined,
        initialAmount: grossTotal * 0.5,
        remainingAmount: grossTotal * 0.5,
        paidDate,
        orderDate: order.createdAt,
        language: 'en',
        vatRatePercent,
      }, invoiceAttachments);

    } else if (phase === 'final') {
      // --- Final payment (completes the two-phase order) ---
      try {
        const pdfBuffer = await this.invoiceService.generateFinalPaymentInvoicePDF(userId, order.id);
        invoiceAttachments = [{
          filename: `FP-INV-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }];
      } catch (pdfError) {
        console.error('Failed to generate final payment invoice PDF:', pdfError);
      }

      const initialAmountNet = initialPmt ? Number(initialPmt.amount) : netTotal / 2;
      const finalAmountNet = finalPmt ? Number(finalPmt.amount) : netTotal / 2;
      const initialPaidDate = initialPmt?.metadata?.completedAt
        ? new Date(initialPmt.metadata.completedAt as string)
        : new Date(order.createdAt);
      const finalPaidDate = finalPmt?.metadata?.completedAt
        ? new Date(finalPmt.metadata.completedAt as string)
        : new Date();

      await this.orderEmailService.sendFinalPaymentConfirmation({
        orderId: order.id,
        email: order.email,
        customerName: order.firstName || 'Customer',
        orderItems,
        totalAmount: grossTotal,
        vatAmount,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: order.couponCode || undefined,
        initialAmount: grossTotal * 0.5,
        finalAmount: grossTotal * 0.5,
        initialPaidDate,
        finalPaidDate,
        orderDate: order.createdAt,
        language: 'en',
        vatRatePercent,
      }, invoiceAttachments);

    } else {
      // --- Full payment (single payment) ---
      try {
        const pdfBuffer = await this.invoiceService.generateInvoicePDF(userId, order.id);
        const invoiceData = await this.invoiceService.getInvoiceData(userId, order.id);
        invoiceAttachments = [{
          filename: `${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }];
      } catch (pdfError) {
        console.error('Failed to generate invoice PDF:', pdfError);
      }

      await this.orderEmailService.sendOrderConfirmation({
        orderId: order.id,
        email: order.email,
        customerName: order.firstName || 'Customer',
        orderItems,
        totalAmount: grossTotal,
        vatAmount,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: order.couponCode || undefined,
        orderDate: order.createdAt,
        language: 'en',
        vatRatePercent,
      }, invoiceAttachments);
    }
  }

  /**
   * Acknowledge order to Klarna (required after checkout_complete)
   */
  async acknowledgeOrder(klarnaOrderId: string): Promise<void> {
    try {
      await this.client.post(`/ordermanagement/v1/orders/${klarnaOrderId}/acknowledge`);
      console.log(`✓ Acknowledged Klarna order: ${klarnaOrderId}`);
    } catch (error: any) {
      // Acknowledgment might fail if already acknowledged
      console.warn('Klarna acknowledge warning:', error.response?.data || error.message);
    }
  }

  /**
   * Get Klarna order confirmation snippet
   * Also verifies and processes the payment if not yet completed
   */
  async getConfirmationSnippet(orderId: string): Promise<{ htmlSnippet: string }> {
    // Find any payment record for this order with a Klarna order ID
    const payments = await this.paymentRepository.findByOrderId(orderId);

    // Find the most recent payment with a Klarna order ID (succeeded OR processing)
    const payment = payments
      .filter(p => p.klarnaOrderId && (p.status === 'succeeded' || p.status === 'processing'))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    if (!payment || !payment.klarnaOrderId) {
      throw new Error('No Klarna payment found for this order');
    }

    try {
      // Fetch the Klarna order to get confirmation snippet and verify status
      const klarnaOrder = await this.getKlarnaOrder(payment.klarnaOrderId);

      // If payment is still processing, check if Klarna says it's complete
      if (payment.status === 'processing' && klarnaOrder.status === 'checkout_complete') {
        await this.processCompletedPayment(orderId, payment);
      }

      return { htmlSnippet: klarnaOrder.html_snippet };
    } catch (error: any) {
      console.error('Failed to get Klarna confirmation:', error);
      throw new Error('Failed to retrieve Klarna confirmation');
    }
  }

  /**
   * Process a completed payment detected via the confirmation page
   * This handles the case where push notifications don't arrive
   */
  private async processCompletedPayment(
    orderId: string,
    payment: any
  ): Promise<void> {
    const order = await this.ordersService.getOrderById(orderId);
    if (!order) return;

    // Guard: Only process if not already paid/completed
    if (order.status === 'paid' || order.status === 'completed') {
      console.log(`Order ${orderId} already ${order.status}, skipping confirmation processing`);
      return;
    }

    console.log(`Processing completed payment for order ${orderId} via confirmation page`);

    // Acknowledge the order to Klarna
    await this.acknowledgeOrder(payment.klarnaOrderId);

    // Update payment record to succeeded
    await this.paymentRepository.updatePaymentStatus(payment.id, 'succeeded', {
      completedAt: new Date().toISOString(),
      processedVia: 'confirmation',
    });

    // Determine new status based on phase
    const newStatus: 'paid' | 'partial_paid' = payment.phase === 'initial' ? 'partial_paid' : 'paid';

    await this.ordersService.updateOrderStatus(orderId, {
      status: newStatus,
      skipEmail: true,
    });
    console.log(`Order ${orderId} updated to ${newStatus} via confirmation page`);

    // Send confirmation email with invoice PDF attached
    try {
      const updatedOrder = await this.ordersService.getOrderById(orderId);
      if (updatedOrder) {
        await this.sendPaymentEmail(updatedOrder, payment.phase);
        console.log(`Order confirmation email sent for order ${updatedOrder.orderNumber}`);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }
  }

  /**
   * Create refund for a Klarna order
   */
  async createRefund(klarnaOrderId: string, amount?: number): Promise<void> {
    try {
      // First, get the order to know the full amount
      const klarnaOrder = await this.getKlarnaOrder(klarnaOrderId);

      const refundAmount = amount ? Math.round(amount * 100) : klarnaOrder.order_amount;

      await this.client.post(`/ordermanagement/v1/orders/${klarnaOrderId}/refunds`, {
        refunded_amount: refundAmount,
        description: 'Refund requested',
        order_lines: klarnaOrder.order_lines.map(line => ({
          ...line,
          total_amount: amount ? Math.round(amount * 100) : line.total_amount,
        })),
      });

      console.log(`✓ Refund created for Klarna order ${klarnaOrderId}: ${refundAmount / 100} SEK`);
    } catch (error: any) {
      console.error('Failed to create Klarna refund:', error.response?.data || error.message);
      throw new Error(`Failed to create refund: ${error.response?.data?.error_messages?.[0] || error.message}`);
    }
  }

  /**
   * Capture payment for a Klarna order (if using authorization flow)
   */
  async capturePayment(klarnaOrderId: string, amount?: number): Promise<void> {
    try {
      const klarnaOrder = await this.getKlarnaOrder(klarnaOrderId);
      const captureAmount = amount ? Math.round(amount * 100) : klarnaOrder.order_amount;

      await this.client.post(`/ordermanagement/v1/orders/${klarnaOrderId}/captures`, {
        captured_amount: captureAmount,
        description: 'Order capture',
        order_lines: klarnaOrder.order_lines,
      });

      console.log(`✓ Captured payment for Klarna order ${klarnaOrderId}: ${captureAmount / 100} SEK`);
    } catch (error: any) {
      console.error('Failed to capture Klarna payment:', error.response?.data || error.message);
      throw new Error(`Failed to capture payment: ${error.response?.data?.error_messages?.[0] || error.message}`);
    }
  }
}

export default KlarnaService;
