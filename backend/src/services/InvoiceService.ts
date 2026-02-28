import Order from '../models/sequelize/Order';
import OrderItem from '../models/sequelize/OrderItem';
import SiteSettings from '../models/sequelize/SiteSettings';
import CompanyLegalSettings from '../models/sequelize/CompanyLegalSettings';
import puppeteer from 'puppeteer';
import { config } from '../config/environment';
import PaymentRepository from '../integration/repositories/PaymentRepository';
import VatSettingsService from './VatSettingsService';

// --- PC Configuration invoice helpers ---

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', gpu: 'GPU',
  ssd: 'SSD', hdd: 'HDD', psu: 'PSU', case: 'Case',
  cooling: 'Cooling', optical: 'Optical Drive', os: 'OS', fan: 'Fan',
};

const ARRAY_COMPONENT_TYPES = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];

function formatSEK(amount: number, currency: string): string {
  return amount.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

function isPCConfigDescription(description: string): boolean {
  return typeof description === 'string' && description.startsWith('{') && description.includes('"components"');
}

function renderPCConfigTableRows(name: string, description: string, quantity: number, unitPrice: number, total: number, currency: string): string {
  try {
    const configData = JSON.parse(description);
    if (!configData.components) throw new Error('no components');

    const rows: string[] = [];

    // Main item header row
    rows.push(`<tr>
      <td><div class="item-name">${name}</div></td>
      <td class="text-right">${quantity}</td>
      <td class="text-right">${formatSEK(unitPrice, currency)}</td>
      <td class="text-right">${formatSEK(total, currency)}</td>
    </tr>`);

    // Component sub-rows
    for (const [category, component] of Object.entries(configData.components)) {
      if (!component) continue;

      if (ARRAY_COMPONENT_TYPES.includes(category) && Array.isArray(component)) {
        const singular = category.slice(0, -1);
        const label = CATEGORY_LABELS[singular] || singular.toUpperCase();
        for (const comp of component) {
          if (comp && typeof comp === 'object') {
            const c = comp as any;
            const compName = c.name_en || c.name_sv || c.name || label;
            const price = typeof c.price === 'string' ? parseFloat(c.price) : (c.price || 0);
            const qty = c.quantity || 1;
            rows.push(`<tr class="pc-sub-row">
              <td class="pc-sub-desc"><span class="pc-cat">${label}</span> ${compName}</td>
              <td class="text-right pc-sub-cell">${qty}</td>
              <td class="text-right pc-sub-cell">${formatSEK(price, currency)}</td>
              <td class="text-right pc-sub-cell">${formatSEK(price * qty, currency)}</td>
            </tr>`);
          }
        }
      } else if (typeof component === 'object' && !Array.isArray(component)) {
        const label = CATEGORY_LABELS[category] || category.toUpperCase();
        const c = component as any;
        const compName = c.name_en || c.name_sv || c.name || label;
        const price = typeof c.price === 'string' ? parseFloat(c.price) : (c.price || 0);
        const qty = c.quantity || 1;
        rows.push(`<tr class="pc-sub-row">
          <td class="pc-sub-desc"><span class="pc-cat">${label}</span> ${compName}</td>
          <td class="text-right pc-sub-cell">${qty}</td>
          <td class="text-right pc-sub-cell">${formatSEK(price, currency)}</td>
          <td class="text-right pc-sub-cell">${formatSEK(price * qty, currency)}</td>
        </tr>`);
      }
    }

    // Build service
    if (configData.buildService) {
      const bs = configData.buildService;
      const bsName = bs.name_en || bs.name_sv || bs.name || 'Professional Assembly';
      const bsPrice = typeof bs.price === 'string' ? parseFloat(bs.price) : (bs.price || 0);
      rows.push(`<tr class="pc-sub-row">
        <td class="pc-sub-desc"><span class="pc-cat">Build Service</span> ${bsName}</td>
        <td class="text-right pc-sub-cell">1</td>
        <td class="text-right pc-sub-cell">${formatSEK(bsPrice, currency)}</td>
        <td class="text-right pc-sub-cell">${formatSEK(bsPrice, currency)}</td>
      </tr>`);
    } else if (configData.includesBuildService && configData.buildServiceCharge) {
      const charge = typeof configData.buildServiceCharge === 'string' ? parseFloat(configData.buildServiceCharge) : configData.buildServiceCharge;
      rows.push(`<tr class="pc-sub-row">
        <td class="pc-sub-desc"><span class="pc-cat">Build Service</span> Professional Assembly</td>
        <td class="text-right pc-sub-cell">1</td>
        <td class="text-right pc-sub-cell">${formatSEK(charge, currency)}</td>
        <td class="text-right pc-sub-cell">${formatSEK(charge, currency)}</td>
      </tr>`);
    } else if (configData.priceBreakdown?.buildServiceCharge) {
      const charge = typeof configData.priceBreakdown.buildServiceCharge === 'string' ? parseFloat(configData.priceBreakdown.buildServiceCharge) : configData.priceBreakdown.buildServiceCharge;
      rows.push(`<tr class="pc-sub-row">
        <td class="pc-sub-desc"><span class="pc-cat">Build Service</span> Professional Assembly</td>
        <td class="text-right pc-sub-cell">1</td>
        <td class="text-right pc-sub-cell">${formatSEK(charge, currency)}</td>
        <td class="text-right pc-sub-cell">${formatSEK(charge, currency)}</td>
      </tr>`);
    }

    return rows.join('');
  } catch {
    return `<tr>
      <td><div class="item-name">${name}</div>${description}</td>
      <td class="text-right">${quantity}</td>
      <td class="text-right">${formatSEK(unitPrice, currency)}</td>
      <td class="text-right">${formatSEK(total, currency)}</td>
    </tr>`;
  }
}

/**
 * Invoice Service
 * Handles invoice generation and retrieval
 */
export class InvoiceService {
  private paymentRepository: PaymentRepository;
  private vatSettingsService: VatSettingsService;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.vatSettingsService = new VatSettingsService();
  }

  /**
   * Get rendered invoice disclaimer HTML for PDF invoices
   */
  private async getDisclaimerHTML(): Promise<string> {
    const legalSettings = await CompanyLegalSettings.findOne();
    if (!legalSettings || !legalSettings.showInvoiceDisclaimer) return '';

    const text = legalSettings.invoiceDisclaimer_en
      || 'All payments and invoices are issued by {CompanyName} (Org.nr: {OrganizationNumber}, VAT: {VatNumber}), {StreetAddress}, {PostalCode} {City}. {TradingName} is a trading name of {CompanyName}.';

    const rendered = text
      .replace(/\{CompanyName\}/g, legalSettings.companyName || '')
      .replace(/\{TradingName\}/g, legalSettings.tradingName || '')
      .replace(/\{OrganizationNumber\}/g, legalSettings.orgNumber || '')
      .replace(/\{VatNumber\}/g, legalSettings.vatNumber || '')
      .replace(/\{StreetAddress\}/g, legalSettings.streetAddress || '')
      .replace(/\{PostalCode\}/g, legalSettings.postalCode || '')
      .replace(/\{City\}/g, legalSettings.city || '');

    return `
    <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: left;">
      <p style="font-size: 8.5px; color: #9ca3af; line-height: 1.5; margin: 0;">${rendered}</p>
    </div>`;
  }

  /**
   * Get invoice data for an order
   */
  async getInvoiceData(userId: string | null, orderId: string) {
    const whereClause: any = { id: orderId };
    if (userId) {
      whereClause.userId = userId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get company details from site settings
    const settings = await SiteSettings.findOne();

    const orderData = order.toJSON() as any;
    const items = orderData.items || [];

    // Calculate totals
    const itemsSubtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = orderData.discountAmount ? Number(orderData.discountAmount) : 0;
    const couponCode = orderData.couponCode || null;
    const vatRate = await this.vatSettingsService.getCurrentRate();
    // Coupon is flat off gross: total = items_gross - flat_discount
    const total = itemsSubtotal * (1 + vatRate) - discountAmount;
    // Derive VAT and net from the final gross total
    const tax = total * vatRate / (1 + vatRate);
    const subtotal = total - tax;

    // Resolve logo URL: prefer logoFile, fallback to logoUrl, skip placeholders
    let logoImage: string | null = null;
    if (settings?.logoFile && !settings.logoFile.match(/^\/?logo\.png$/)) {
      if (settings.logoFile.startsWith('data:')) {
        logoImage = settings.logoFile;
      } else {
        logoImage = settings.logoFile.startsWith('http')
          ? settings.logoFile
          : `${config.frontendUrl}${settings.logoFile.startsWith('/') ? '' : '/'}${settings.logoFile}`;
      }
    } else if (settings?.logoUrl && !settings.logoUrl.match(/^\/?logo\.png$/)) {
      logoImage = settings.logoUrl.startsWith('http')
        ? settings.logoUrl
        : `${config.frontendUrl}${settings.logoUrl.startsWith('/') ? '' : '/'}${settings.logoUrl}`;
    }

    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      dueDate: new Date(new Date(order.createdAt!).getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days

      // Logo
      logoImage,

      // Company details
      from: {
        company: settings?.siteName_en || 'Company Name',
        email: settings?.email || 'info@company.com',
        phone: settings?.phone || '',
        address: settings?.address || '',
        city: settings?.city || '',
        postalCode: settings?.postalCode || '',
        country: settings?.country || 'Sweden',
      },

      // Customer details
      to: {
        name: `${order.firstName} ${order.lastName}`,
        email: order.email,
        address: order.address || '',
        city: order.city || '',
        postalCode: order.postalCode || '',
        country: order.country,
      },

      // Order items
      items: items.map((item: any) => ({
        name: item.serviceName,
        description: item.serviceDescription || '',
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
      })),

      // Totals
      itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      couponCode,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      taxRate: Math.round(vatRate * 100),
      total: Number(total.toFixed(2)),
      currency: order.currency,

      // Payment info
      status: order.status,
      paymentId: order.paymentId,
      paymentMethod: 'Card', // Could be expanded based on payment provider

      // Notes
      notes: 'Thank you for your business!',
      terms: 'Payment is due within 30 days of invoice date.',
    };

    return invoice;
  }

  /**
   * Generate simple HTML invoice (can be used with PDF library)
   */
  async generateInvoiceHTML(userId: string | null, orderId: string) {
    const invoice = await this.getInvoiceData(userId, orderId);
    const disclaimerHTML = await this.getDisclaimerHTML();

    const isPaid = invoice.status === 'paid' || invoice.status === 'completed';
    const statusLabel = invoice.status === 'paid' ? 'PAID' : invoice.status === 'completed' ? 'COMPLETED' : invoice.status.toUpperCase();
    const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #374151;
      font-size: 12.5px;
      line-height: 1.5;
    }

    /* Top accent bar */
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
    }

    .page {
      padding: 44px 48px 36px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }
    .logo {
      max-height: 52px;
      max-width: 200px;
      object-fit: contain;
    }
    .header-right {
      text-align: right;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: 800;
      color: #1d4ed8;
      letter-spacing: 2px;
      line-height: 1;
    }
    .invoice-number {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      letter-spacing: 0.3px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin-bottom: 28px;
    }

    /* Info bar */
    .info-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #fff;
      background: ${isPaid ? '#059669' : '#d97706'};
    }

    /* Addresses */
    .addresses {
      display: flex;
      gap: 48px;
      margin-bottom: 32px;
    }
    .address-block {
      flex: 1;
    }
    .address-heading {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1d4ed8;
      margin-bottom: 10px;
    }
    .address-name {
      font-weight: 700;
      font-size: 14px;
      color: #111827;
      margin-bottom: 4px;
    }
    .address-detail {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.7;
    }

    /* Items table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    thead th {
      background: #1d4ed8;
      color: #ffffff;
      padding: 11px 16px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border: none;
    }
    thead th:first-child { border-radius: 4px 0 0 0; }
    thead th:last-child { border-radius: 0 4px 0 0; }
    tbody td {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    tbody tr:last-child td {
      border-bottom: 2px solid #e5e7eb;
    }
    .item-name {
      font-weight: 600;
      color: #111827;
      font-size: 13px;
    }
    .item-desc {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .text-right {
      text-align: right;
    }

    /* PC Config sub-rows */
    .pc-sub-row td {
      padding: 2px 16px;
      border-bottom: none;
    }
    .pc-sub-desc {
      font-size: 10px;
      color: #6b7280;
      padding-left: 28px !important;
    }
    .pc-sub-desc .pc-cat {
      font-weight: 600;
      color: #374151;
    }
    .pc-sub-desc .pc-cat::after {
      content: ' — ';
    }
    .pc-sub-cell {
      font-size: 10px;
      color: #6b7280;
    }

    /* Totals */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0 28px;
    }
    .totals-table {
      width: 260px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12.5px;
      color: #6b7280;
    }
    .totals-row .t-label {
      font-weight: 500;
    }
    .totals-row .t-value {
      font-weight: 600;
      color: #374151;
    }
    .total-grand {
      border-top: 2px solid #1d4ed8;
      margin-top: 8px;
      padding-top: 10px;
    }
    .total-grand .t-label {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
    }
    .total-grand .t-value {
      font-size: 15px;
      font-weight: 800;
      color: #1d4ed8;
    }

    /* Footer */
    .footer {
      margin-top: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-columns {
      display: flex;
      gap: 32px;
      margin-bottom: 14px;
    }
    .footer-col {
      flex: 1;
    }
    .footer-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .footer-text {
      font-size: 11.5px;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer-closing {
      text-align: center;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 11px;
      color: #d1d5db;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>

  <div class="accent-bar"></div>
  <div class="page">

    <!-- Header: logo left, invoice title right -->
    <div class="header">
      <div>
        ${invoice.logoImage ? `<img src="${invoice.logoImage}" alt="" class="logo" />` : ''}
      </div>
      <div class="header-right">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Info bar -->
    <div class="info-bar">
      <div class="info-group">
        <span class="info-label">Order</span>
        <span class="info-value">${invoice.orderNumber}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Issue Date</span>
        <span class="info-value">${formatDate(invoice.date)}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Due Date</span>
        <span class="info-value">${formatDate(invoice.dueDate)}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Payment</span>
        <span class="info-value">${invoice.paymentMethod}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Status</span>
        <span class="status-badge">${statusLabel}</span>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-block">
        <div class="address-heading">From</div>
        <div class="address-name">${invoice.from.company}</div>
        <div class="address-detail">
          ${invoice.from.address}<br>
          ${invoice.from.postalCode} ${invoice.from.city}<br>
          ${invoice.from.country}<br>
          ${invoice.from.email}${invoice.from.phone ? '<br>' + invoice.from.phone : ''}
        </div>
      </div>
      <div class="address-block">
        <div class="address-heading">Bill To</div>
        <div class="address-name">${invoice.to.name}</div>
        <div class="address-detail">
          ${invoice.to.email}
          ${invoice.to.address ? '<br>' + invoice.to.address : ''}
          ${invoice.to.city ? '<br>' + invoice.to.postalCode + ' ' + invoice.to.city : ''}
          ${invoice.to.country ? '<br>' + invoice.to.country : ''}
        </div>
      </div>
    </div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left; width: 44%;">Description</th>
          <th class="text-right" style="width: 12%;">Qty</th>
          <th class="text-right" style="width: 22%;">Unit Price</th>
          <th class="text-right" style="width: 22%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => {
          const isPC = item.description && isPCConfigDescription(item.description);
          if (isPC) {
            return renderPCConfigTableRows(item.name, item.description, item.quantity, item.price, item.total, invoice.currency);
          }
          return `<tr>
            <td><div class="item-name">${item.name}</div>${item.description ? `<div class="item-desc">${item.description}</div>` : ''}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.price.toFixed(2)} ${invoice.currency}</td>
            <td class="text-right">${item.total.toFixed(2)} ${invoice.currency}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <span class="t-label">Subtotal</span>
          <span class="t-value">${formatSEK(invoice.itemsSubtotal, invoice.currency)}</span>
        </div>
        ${invoice.discountAmount > 0 ? `
        <div class="totals-row" style="color: #059669;">
          <span class="t-label">Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ''}</span>
          <span class="t-value" style="color: #059669;">-${formatSEK(invoice.discountAmount, invoice.currency)}</span>
        </div>
        ` : ''}
        <div class="totals-row">
          <span class="t-label">VAT (${invoice.taxRate}%)</span>
          <span class="t-value">${formatSEK(invoice.tax, invoice.currency)}</span>
        </div>
        <div class="totals-row total-grand">
          <span class="t-label">Total</span>
          <span class="t-value">${formatSEK(invoice.total, invoice.currency)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-columns">
        <div class="footer-col">
          <div class="footer-label">Payment Terms</div>
          <div class="footer-text">${invoice.terms}</div>
        </div>
        ${invoice.paymentId ? `
        <div class="footer-col">
          <div class="footer-label">Payment Reference</div>
          <div class="footer-text">${invoice.paymentId}</div>
        </div>
        ` : ''}
      </div>
      <div class="footer-closing">Thank you for your business</div>
    </div>

    ${disclaimerHTML}

  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate PDF invoice
   */
  async generateInvoicePDF(userId: string | null, orderId: string): Promise<Buffer> {
    const html = await this.generateInvoiceHTML(userId, orderId);

    let browser;
    try {
      // Launch headless browser using Puppeteer's bundled Chrome
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      const page = await browser.newPage();

      // Set content and wait for it to load
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      // Puppeteer v24+ returns Uint8Array, must convert to Node Buffer
      // so Express sends it as binary data instead of JSON
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF invoice');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML for partial payment invoice (after initial 50% payment)
   */
  async generatePartialPaymentInvoiceHTML(userId: string | null, orderId: string): Promise<string> {
    const invoice = await this.getInvoiceData(userId, orderId);
    const disclaimerHTML = await this.getDisclaimerHTML();

    // Fetch payment records to get phase details
    const payments = await this.paymentRepository.findByOrderId(orderId);
    const initialPayment = payments.find(p => p.phase === 'initial');
    const finalPayment = payments.find(p => p.phase === 'final');

    // Each phase is half the gross total (invoice.total already has flat discount applied)
    const initialAmount = invoice.total / 2;
    const finalAmount = invoice.total / 2;
    const paidDate = initialPayment?.metadata?.completedAt
      ? new Date(initialPayment.metadata.completedAt as string)
      : new Date();

    const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Partial Payment Invoice PP-INV-${invoice.orderNumber}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #374151;
      font-size: 12.5px;
      line-height: 1.5;
    }

    /* Top accent bar */
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
    }

    .page {
      padding: 44px 48px 36px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }
    .logo {
      max-height: 52px;
      max-width: 200px;
      object-fit: contain;
    }
    .header-right {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 800;
      color: #1d4ed8;
      letter-spacing: 1.5px;
      line-height: 1;
    }
    .invoice-number {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      letter-spacing: 0.3px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin-bottom: 28px;
    }

    /* Info bar */
    .info-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #fff;
      background: #059669;
    }

    /* Addresses */
    .addresses {
      display: flex;
      gap: 48px;
      margin-bottom: 32px;
    }
    .address-block {
      flex: 1;
    }
    .address-heading {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1d4ed8;
      margin-bottom: 10px;
    }
    .address-name {
      font-weight: 700;
      font-size: 14px;
      color: #111827;
      margin-bottom: 4px;
    }
    .address-detail {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.7;
    }

    /* Items table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    thead th {
      background: #1d4ed8;
      color: #ffffff;
      padding: 11px 16px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border: none;
    }
    thead th:first-child { border-radius: 4px 0 0 0; }
    thead th:last-child { border-radius: 0 4px 0 0; }
    tbody td {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    tbody tr:last-child td {
      border-bottom: 2px solid #e5e7eb;
    }
    .item-name {
      font-weight: 600;
      color: #111827;
      font-size: 13px;
    }
    .item-desc {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .text-right {
      text-align: right;
    }

    /* PC Config sub-rows */
    .pc-sub-row td {
      padding: 2px 16px;
      border-bottom: none;
    }
    .pc-sub-desc {
      font-size: 10px;
      color: #6b7280;
      padding-left: 28px !important;
    }
    .pc-sub-desc .pc-cat {
      font-weight: 600;
      color: #374151;
    }
    .pc-sub-desc .pc-cat::after {
      content: ' — ';
    }
    .pc-sub-cell {
      font-size: 10px;
      color: #6b7280;
    }

    /* Payment schedule */
    .payment-schedule {
      margin-top: 20px;
      padding: 20px 0;
    }
    .schedule-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1d4ed8;
      margin-bottom: 16px;
    }
    .schedule-table {
      width: 100%;
    }
    .schedule-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .schedule-row:last-child {
      border-bottom: none;
    }
    .schedule-label {
      font-size: 12.5px;
      color: #374151;
      font-weight: 500;
    }
    .schedule-value {
      font-size: 12.5px;
      font-weight: 600;
      color: #111827;
    }
    .schedule-row.order-total {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 4px;
    }
    .schedule-row.order-total .schedule-label,
    .schedule-row.order-total .schedule-value {
      font-weight: 700;
    }
    .phase-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-left: 8px;
    }
    .badge-paid {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .schedule-row.summary {
      margin-top: 8px;
      border-top: 2px solid #1d4ed8;
      padding-top: 12px;
    }
    .schedule-row.summary .schedule-label {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
    .schedule-row.summary .schedule-value {
      font-size: 14px;
      font-weight: 800;
      color: #1d4ed8;
    }

    /* Footer */
    .footer {
      margin-top: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-columns {
      display: flex;
      gap: 32px;
      margin-bottom: 14px;
    }
    .footer-col {
      flex: 1;
    }
    .footer-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .footer-text {
      font-size: 11.5px;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer-closing {
      text-align: center;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 11px;
      color: #d1d5db;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>

  <div class="accent-bar"></div>
  <div class="page">

    <!-- Header: logo left, invoice title right -->
    <div class="header">
      <div>
        ${invoice.logoImage ? `<img src="${invoice.logoImage}" alt="" class="logo" />` : ''}
      </div>
      <div class="header-right">
        <div class="invoice-title">PARTIAL PAYMENT INVOICE</div>
        <div class="invoice-number">PP-INV-${invoice.orderNumber}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Info bar -->
    <div class="info-bar">
      <div class="info-group">
        <span class="info-label">Order</span>
        <span class="info-value">${invoice.orderNumber}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Issue Date</span>
        <span class="info-value">${formatDate(paidDate)}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Payment Type</span>
        <span class="info-value">Two-Phase (50/50)</span>
      </div>
      <div class="info-group">
        <span class="info-label">Status</span>
        <span class="status-badge">PHASE 1 PAID</span>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-block">
        <div class="address-heading">From</div>
        <div class="address-name">${invoice.from.company}</div>
        <div class="address-detail">
          ${invoice.from.address}<br>
          ${invoice.from.postalCode} ${invoice.from.city}<br>
          ${invoice.from.country}<br>
          ${invoice.from.email}${invoice.from.phone ? '<br>' + invoice.from.phone : ''}
        </div>
      </div>
      <div class="address-block">
        <div class="address-heading">Bill To</div>
        <div class="address-name">${invoice.to.name}</div>
        <div class="address-detail">
          ${invoice.to.email}
          ${invoice.to.address ? '<br>' + invoice.to.address : ''}
          ${invoice.to.city ? '<br>' + invoice.to.postalCode + ' ' + invoice.to.city : ''}
          ${invoice.to.country ? '<br>' + invoice.to.country : ''}
        </div>
      </div>
    </div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left; width: 44%;">Description</th>
          <th class="text-right" style="width: 12%;">Qty</th>
          <th class="text-right" style="width: 22%;">Unit Price</th>
          <th class="text-right" style="width: 22%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => {
          const isPC = item.description && isPCConfigDescription(item.description);
          if (isPC) {
            return renderPCConfigTableRows(item.name, item.description, item.quantity, item.price, item.total, invoice.currency);
          }
          return `<tr>
            <td><div class="item-name">${item.name}</div>${item.description ? `<div class="item-desc">${item.description}</div>` : ''}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.price.toFixed(2)} ${invoice.currency}</td>
            <td class="text-right">${item.total.toFixed(2)} ${invoice.currency}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Payment Schedule -->
    <div class="payment-schedule">
      <div class="schedule-title">Payment Schedule</div>

      <div class="schedule-row">
        <span class="schedule-label">Subtotal</span>
        <span class="schedule-value">${formatSEK(invoice.itemsSubtotal, invoice.currency)}</span>
      </div>
      ${invoice.discountAmount > 0 ? `
      <div class="schedule-row" style="color: #059669;">
        <span class="schedule-label">Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ''}</span>
        <span class="schedule-value" style="color: #059669;">-${formatSEK(invoice.discountAmount, invoice.currency)}</span>
      </div>
      ` : ''}
      <div class="schedule-row">
        <span class="schedule-label">VAT (${invoice.taxRate}%)</span>
        <span class="schedule-value">${formatSEK(invoice.tax, invoice.currency)}</span>
      </div>
      <div class="schedule-row order-total">
        <span class="schedule-label">Order Total</span>
        <span class="schedule-value">${formatSEK(invoice.total, invoice.currency)}</span>
      </div>

      <div class="schedule-row">
        <span class="schedule-label">Phase 1 — 50% <span class="phase-badge badge-paid">PAID</span></span>
        <span class="schedule-value">${formatSEK(initialAmount, invoice.currency)}</span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label" style="font-size: 11px; color: #6b7280; padding-left: 12px;">Paid on ${formatDate(paidDate)}</span>
        <span class="schedule-value"></span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label">Phase 2 — 50% <span class="phase-badge badge-pending">PENDING</span></span>
        <span class="schedule-value">${formatSEK(finalAmount, invoice.currency)}</span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label" style="font-size: 11px; color: #6b7280; padding-left: 12px;">Due when project is ready for delivery</span>
        <span class="schedule-value"></span>
      </div>

      <div class="schedule-row summary">
        <span class="schedule-label">Amount Paid</span>
        <span class="schedule-value">${formatSEK(initialAmount, invoice.currency)}</span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label">Amount Remaining</span>
        <span class="schedule-value">${formatSEK(finalAmount, invoice.currency)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-columns">
        <div class="footer-col">
          <div class="footer-label">Payment Terms</div>
          <div class="footer-text">
            This order uses a two-phase payment plan. The initial 50% has been received.
            The remaining 50% will be invoiced when your project is ready for delivery.
          </div>
        </div>
        ${invoice.paymentId ? `
        <div class="footer-col">
          <div class="footer-label">Payment Reference</div>
          <div class="footer-text">${invoice.paymentId}</div>
        </div>
        ` : ''}
      </div>
      <div class="footer-closing">Thank you for your business</div>
    </div>

    ${disclaimerHTML}

  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate PDF for partial payment invoice
   */
  async generatePartialPaymentInvoicePDF(userId: string | null, orderId: string): Promise<Buffer> {
    const html = await this.generatePartialPaymentInvoiceHTML(userId, orderId);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating partial payment PDF:', error);
      throw new Error('Failed to generate partial payment PDF invoice');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML for final payment invoice (after remaining 50% payment completes the order)
   */
  async generateFinalPaymentInvoiceHTML(userId: string | null, orderId: string): Promise<string> {
    const invoice = await this.getInvoiceData(userId, orderId);
    const disclaimerHTML = await this.getDisclaimerHTML();

    // Fetch payment records to get phase details
    const payments = await this.paymentRepository.findByOrderId(orderId);
    const initialPayment = payments.find(p => p.phase === 'initial');
    const finalPayment = payments.find(p => p.phase === 'final');

    // Each phase is half the gross total (invoice.total already has flat discount applied)
    const initialAmount = invoice.total / 2;
    const finalAmount = invoice.total / 2;
    const initialPaidDate = initialPayment?.metadata?.completedAt
      ? new Date(initialPayment.metadata.completedAt as string)
      : new Date(invoice.date);
    const finalPaidDate = finalPayment?.metadata?.completedAt
      ? new Date(finalPayment.metadata.completedAt as string)
      : new Date();

    const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Payment Invoice FP-INV-${invoice.orderNumber}</title>
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #374151;
      font-size: 12.5px;
      line-height: 1.5;
    }

    /* Top accent bar */
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%);
    }

    .page {
      padding: 44px 48px 36px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }
    .logo {
      max-height: 52px;
      max-width: 200px;
      object-fit: contain;
    }
    .header-right {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 800;
      color: #1d4ed8;
      letter-spacing: 1.5px;
      line-height: 1;
    }
    .invoice-number {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      letter-spacing: 0.3px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #e5e7eb;
      margin-bottom: 28px;
    }

    /* Info bar */
    .info-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 16px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #fff;
      background: #059669;
    }

    /* Addresses */
    .addresses {
      display: flex;
      gap: 48px;
      margin-bottom: 32px;
    }
    .address-block {
      flex: 1;
    }
    .address-heading {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1d4ed8;
      margin-bottom: 10px;
    }
    .address-name {
      font-weight: 700;
      font-size: 14px;
      color: #111827;
      margin-bottom: 4px;
    }
    .address-detail {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.7;
    }

    /* Items table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
    }
    thead th {
      background: #1d4ed8;
      color: #ffffff;
      padding: 11px 16px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border: none;
    }
    thead th:first-child { border-radius: 4px 0 0 0; }
    thead th:last-child { border-radius: 0 4px 0 0; }
    tbody td {
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    tbody tr:last-child td {
      border-bottom: 2px solid #e5e7eb;
    }
    .item-name {
      font-weight: 600;
      color: #111827;
      font-size: 13px;
    }
    .item-desc {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .text-right {
      text-align: right;
    }

    /* PC Config sub-rows */
    .pc-sub-row td {
      padding: 2px 16px;
      border-bottom: none;
    }
    .pc-sub-desc {
      font-size: 10px;
      color: #6b7280;
      padding-left: 28px !important;
    }
    .pc-sub-desc .pc-cat {
      font-weight: 600;
      color: #374151;
    }
    .pc-sub-desc .pc-cat::after {
      content: ' — ';
    }
    .pc-sub-cell {
      font-size: 10px;
      color: #6b7280;
    }

    /* Payment schedule */
    .payment-schedule {
      margin-top: 20px;
      padding: 20px 0;
    }
    .schedule-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1d4ed8;
      margin-bottom: 16px;
    }
    .schedule-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .schedule-row:last-child {
      border-bottom: none;
    }
    .schedule-label {
      font-size: 12.5px;
      color: #374151;
      font-weight: 500;
    }
    .schedule-value {
      font-size: 12.5px;
      font-weight: 600;
      color: #111827;
    }
    .schedule-row.order-total {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 4px;
    }
    .schedule-row.order-total .schedule-label,
    .schedule-row.order-total .schedule-value {
      font-weight: 700;
    }
    .phase-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-left: 8px;
    }
    .badge-paid {
      background: #d1fae5;
      color: #065f46;
    }
    .schedule-row.summary {
      margin-top: 8px;
      border-top: 2px solid #059669;
      padding-top: 12px;
    }
    .schedule-row.summary .schedule-label {
      font-size: 14px;
      font-weight: 700;
      color: #059669;
    }
    .schedule-row.summary .schedule-value {
      font-size: 14px;
      font-weight: 800;
      color: #059669;
    }

    /* Footer */
    .footer {
      margin-top: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-columns {
      display: flex;
      gap: 32px;
      margin-bottom: 14px;
    }
    .footer-col {
      flex: 1;
    }
    .footer-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .footer-text {
      font-size: 11.5px;
      color: #6b7280;
      line-height: 1.6;
    }
    .footer-closing {
      text-align: center;
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 11px;
      color: #d1d5db;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>

  <div class="accent-bar"></div>
  <div class="page">

    <!-- Header: logo left, invoice title right -->
    <div class="header">
      <div>
        ${invoice.logoImage ? `<img src="${invoice.logoImage}" alt="" class="logo" />` : ''}
      </div>
      <div class="header-right">
        <div class="invoice-title">FINAL PAYMENT INVOICE</div>
        <div class="invoice-number">FP-INV-${invoice.orderNumber}</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Info bar -->
    <div class="info-bar">
      <div class="info-group">
        <span class="info-label">Order</span>
        <span class="info-value">${invoice.orderNumber}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Issue Date</span>
        <span class="info-value">${formatDate(finalPaidDate)}</span>
      </div>
      <div class="info-group">
        <span class="info-label">Payment Type</span>
        <span class="info-value">Two-Phase (50/50)</span>
      </div>
      <div class="info-group">
        <span class="info-label">Status</span>
        <span class="status-badge">FULLY PAID</span>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-block">
        <div class="address-heading">From</div>
        <div class="address-name">${invoice.from.company}</div>
        <div class="address-detail">
          ${invoice.from.address}<br>
          ${invoice.from.postalCode} ${invoice.from.city}<br>
          ${invoice.from.country}<br>
          ${invoice.from.email}${invoice.from.phone ? '<br>' + invoice.from.phone : ''}
        </div>
      </div>
      <div class="address-block">
        <div class="address-heading">Bill To</div>
        <div class="address-name">${invoice.to.name}</div>
        <div class="address-detail">
          ${invoice.to.email}
          ${invoice.to.address ? '<br>' + invoice.to.address : ''}
          ${invoice.to.city ? '<br>' + invoice.to.postalCode + ' ' + invoice.to.city : ''}
          ${invoice.to.country ? '<br>' + invoice.to.country : ''}
        </div>
      </div>
    </div>

    <!-- Items table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left; width: 44%;">Description</th>
          <th class="text-right" style="width: 12%;">Qty</th>
          <th class="text-right" style="width: 22%;">Unit Price</th>
          <th class="text-right" style="width: 22%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => {
          const isPC = item.description && isPCConfigDescription(item.description);
          if (isPC) {
            return renderPCConfigTableRows(item.name, item.description, item.quantity, item.price, item.total, invoice.currency);
          }
          return `<tr>
            <td><div class="item-name">${item.name}</div>${item.description ? `<div class="item-desc">${item.description}</div>` : ''}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${item.price.toFixed(2)} ${invoice.currency}</td>
            <td class="text-right">${item.total.toFixed(2)} ${invoice.currency}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Payment Schedule -->
    <div class="payment-schedule">
      <div class="schedule-title">Payment Summary</div>

      <div class="schedule-row">
        <span class="schedule-label">Subtotal</span>
        <span class="schedule-value">${formatSEK(invoice.itemsSubtotal, invoice.currency)}</span>
      </div>
      ${invoice.discountAmount > 0 ? `
      <div class="schedule-row" style="color: #059669;">
        <span class="schedule-label">Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ''}</span>
        <span class="schedule-value" style="color: #059669;">-${formatSEK(invoice.discountAmount, invoice.currency)}</span>
      </div>
      ` : ''}
      <div class="schedule-row">
        <span class="schedule-label">VAT (${invoice.taxRate}%)</span>
        <span class="schedule-value">${formatSEK(invoice.tax, invoice.currency)}</span>
      </div>
      <div class="schedule-row order-total">
        <span class="schedule-label">Order Total</span>
        <span class="schedule-value">${formatSEK(invoice.total, invoice.currency)}</span>
      </div>

      <div class="schedule-row">
        <span class="schedule-label">Phase 1 — 50% <span class="phase-badge badge-paid">PAID</span></span>
        <span class="schedule-value">${formatSEK(initialAmount, invoice.currency)}</span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label" style="font-size: 11px; color: #6b7280; padding-left: 12px;">Paid on ${formatDate(initialPaidDate)}</span>
        <span class="schedule-value"></span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label">Phase 2 — 50% <span class="phase-badge badge-paid">PAID</span></span>
        <span class="schedule-value">${formatSEK(finalAmount, invoice.currency)}</span>
      </div>
      <div class="schedule-row">
        <span class="schedule-label" style="font-size: 11px; color: #6b7280; padding-left: 12px;">Paid on ${formatDate(finalPaidDate)}</span>
        <span class="schedule-value"></span>
      </div>

      <div class="schedule-row summary">
        <span class="schedule-label">Total Paid</span>
        <span class="schedule-value">${formatSEK(invoice.total, invoice.currency)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-columns">
        <div class="footer-col">
          <div class="footer-label">Payment Status</div>
          <div class="footer-text">
            This order has been fully paid via two-phase payment plan.
            Both payments have been received. No further payment is required.
          </div>
        </div>
        ${invoice.paymentId ? `
        <div class="footer-col">
          <div class="footer-label">Payment Reference</div>
          <div class="footer-text">${invoice.paymentId}</div>
        </div>
        ` : ''}
      </div>
      <div class="footer-closing">Thank you for your business</div>
    </div>

    ${disclaimerHTML}

  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate PDF for final payment invoice
   */
  async generateFinalPaymentInvoicePDF(userId: string | null, orderId: string): Promise<Buffer> {
    const html = await this.generateFinalPaymentInvoiceHTML(userId, orderId);

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating final payment PDF:', error);
      throw new Error('Failed to generate final payment PDF invoice');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Get list of invoices for user
   */
  async getUserInvoices(userId: string, options?: {
    limit?: number;
    offset?: number;
  }) {
    const orders = await Order.findAll({
      where: {
        userId,
        status: ['paid', 'completed'], // Only paid/completed orders have invoices
      },
      order: [['createdAt', 'DESC']],
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    });

    const vatRate = await this.vatSettingsService.getCurrentRate();

    const invoices = orders.map((order) => {
      const netTotal = Number(order.totalAmount);
      const discount = order.discountAmount ? Number(order.discountAmount) : 0;
      // Reconstruct gross: items_gross - flat_discount
      const grossTotal = (netTotal + discount) * (1 + vatRate) - discount;
      return {
        id: order.id,
        invoiceNumber: `INV-${(order as any).orderNumber}`,
        orderNumber: (order as any).orderNumber,
        date: order.createdAt,
        total: Number(grossTotal.toFixed(2)),
        currency: order.currency,
        status: order.status,
      };
    });

    return invoices;
  }
}

export default InvoiceService;
