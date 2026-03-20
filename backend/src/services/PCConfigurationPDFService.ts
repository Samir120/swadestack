import PCConfiguration, { ComponentsSnapshot } from '../models/sequelize/PCConfiguration';
import SiteSettings from '../models/sequelize/SiteSettings';
import puppeteer from 'puppeteer';

interface ComponentDisplayInfo {
  type: string;
  name: string;
  manufacturer: string;
  modelNumber?: string;
  price: number;
  quantity?: number;
  specs?: string;
}

export class PCConfigurationPDFService {
  /**
   * Get component display info from configuration
   */
  private getComponentsForDisplay(
    components: ComponentsSnapshot,
    language: 'en' | 'sv'
  ): ComponentDisplayInfo[] {
    const result: ComponentDisplayInfo[] = [];

    // Helper to format component type for display
    const formatType = (type: string): string => {
      const typeLabels: Record<string, { en: string; sv: string }> = {
        cpu: { en: 'CPU / Processor', sv: 'Processor' },
        motherboard: { en: 'Motherboard', sv: 'Moderkort' },
        rams: { en: 'RAM Memory', sv: 'RAM-minne' },
        gpus: { en: 'Graphics Card', sv: 'Grafikkort' },
        ssds: { en: 'SSD Storage', sv: 'SSD-lagring' },
        hdds: { en: 'HDD Storage', sv: 'Hårddisk' },
        psu: { en: 'Power Supply', sv: 'Nätaggregat' },
        case: { en: 'Computer Case', sv: 'Chassi' },
        cooling: { en: 'CPU Cooler', sv: 'Kylning' },
        optical: { en: 'Optical Drive', sv: 'Optisk enhet' },
        fans: { en: 'Case Fans', sv: 'Chassifläktar' },
        os: { en: 'Operating System', sv: 'Operativsystem' },
      };
      return typeLabels[type]?.[language] || type;
    };

    // Helper to extract key specs
    const getSpecsSummary = (specs: any, type: string): string => {
      if (!specs) return '';
      const parts: string[] = [];

      switch (type) {
        case 'cpu':
          if (specs.cores) parts.push(`${specs.cores} cores`);
          if (specs.threads) parts.push(`${specs.threads} threads`);
          if (specs.baseClock) parts.push(`${specs.baseClock} GHz`);
          if (specs.socket) parts.push(specs.socket);
          break;
        case 'motherboard':
          if (specs.socket) parts.push(specs.socket);
          if (specs.formFactor) parts.push(specs.formFactor);
          if (specs.ramType) parts.push(specs.ramType);
          break;
        case 'rams':
        case 'ram':
          if (specs.capacity) parts.push(`${specs.capacity} GB`);
          if (specs.speed) parts.push(`${specs.speed} MHz`);
          if (specs.ramType) parts.push(specs.ramType);
          break;
        case 'gpus':
        case 'gpu':
          if (specs.vram) parts.push(`${specs.vram} GB VRAM`);
          if (specs.tdp) parts.push(`${specs.tdp}W TDP`);
          break;
        case 'ssds':
        case 'hdds':
        case 'storage':
          if (specs.capacity) parts.push(`${specs.capacity} GB`);
          if (specs.storageType) parts.push(specs.storageType);
          break;
        case 'psu':
          if (specs.wattage) parts.push(`${specs.wattage}W`);
          if (specs.efficiency) parts.push(specs.efficiency);
          break;
        case 'case':
          if (specs.formFactor) parts.push(Array.isArray(specs.formFactor) ? specs.formFactor.join(', ') : specs.formFactor);
          break;
        case 'cooling':
          if (specs.coolingType) parts.push(specs.coolingType);
          break;
      }

      return parts.join(' | ');
    };

    // Single-select components
    const singleComponents = ['cpu', 'motherboard', 'psu', 'case', 'cooling', 'optical', 'os'];
    for (const type of singleComponents) {
      const comp = (components as any)[type];
      if (comp) {
        result.push({
          type: formatType(type),
          name: language === 'en' ? comp.name_en : comp.name_sv,
          manufacturer: comp.manufacturer || '',
          modelNumber: comp.modelNumber,
          price: typeof comp.price === 'string' ? parseFloat(comp.price) : comp.price,
          specs: getSpecsSummary(comp.specifications, type),
        });
      }
    }

    // Multi-select array components
    const multiComponents = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
    for (const type of multiComponents) {
      const arr = (components as any)[type];
      if (arr && Array.isArray(arr) && arr.length > 0) {
        for (const comp of arr) {
          result.push({
            type: formatType(type),
            name: language === 'en' ? comp.name_en : comp.name_sv,
            manufacturer: comp.manufacturer || '',
            modelNumber: comp.modelNumber,
            price: typeof comp.price === 'string' ? parseFloat(comp.price) : comp.price,
            quantity: comp.quantity || 1,
            specs: getSpecsSummary(comp.specifications, type),
          });
        }
      }
    }

    // Legacy support
    if ((components as any).ram && !components.rams) {
      const comp = (components as any).ram;
      result.push({
        type: formatType('rams'),
        name: language === 'en' ? comp.name_en : comp.name_sv,
        manufacturer: comp.manufacturer || '',
        modelNumber: comp.modelNumber,
        price: typeof comp.price === 'string' ? parseFloat(comp.price) : comp.price,
        quantity: comp.quantity || 1,
        specs: getSpecsSummary(comp.specifications, 'ram'),
      });
    }
    if ((components as any).gpu && !components.gpus) {
      const comp = (components as any).gpu;
      result.push({
        type: formatType('gpus'),
        name: language === 'en' ? comp.name_en : comp.name_sv,
        manufacturer: comp.manufacturer || '',
        modelNumber: comp.modelNumber,
        price: typeof comp.price === 'string' ? parseFloat(comp.price) : comp.price,
        specs: getSpecsSummary(comp.specifications, 'gpu'),
      });
    }

    return result;
  }

  /**
   * Calculate total price from components
   */
  private calculateComponentsTotal(components: ComponentsSnapshot): number {
    let total = 0;

    const parsePrice = (price: number | string | undefined): number => {
      if (price === undefined || price === null) return 0;
      return typeof price === 'string' ? parseFloat(price) : price;
    };

    // Single-select
    const singles = ['cpu', 'motherboard', 'psu', 'case', 'cooling', 'optical', 'os'];
    for (const type of singles) {
      const comp = (components as any)[type];
      if (comp) {
        total += parsePrice(comp.price);
      }
    }

    // Multi-select arrays
    const arrays = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
    for (const type of arrays) {
      const arr = (components as any)[type];
      if (arr && Array.isArray(arr)) {
        for (const comp of arr) {
          total += parsePrice(comp.price) * (comp.quantity || 1);
        }
      }
    }

    // Legacy
    if ((components as any).ram && !(components as any).rams) {
      const comp = (components as any).ram;
      total += parsePrice(comp.price) * (comp.quantity || 1);
    }
    if ((components as any).gpu && !(components as any).gpus) {
      total += parsePrice((components as any).gpu.price);
    }

    return total;
  }

  /**
   * Generate HTML for configuration PDF
   */
  async generateConfigurationHTML(
    configuration: PCConfiguration,
    language: 'en' | 'sv' = 'en'
  ): Promise<string> {
    // Get company details from site settings
    const settings = await SiteSettings.findOne();

    const configName = language === 'en'
      ? configuration.name_en
      : configuration.name_sv;
    const displayName = configName || `Configuration ${configuration.id.substring(0, 8)}`;

    const componentsDisplay = this.getComponentsForDisplay(configuration.components, language);
    const componentsTotal = this.calculateComponentsTotal(configuration.components);
    const buildServiceCharge = typeof configuration.buildServiceCharge === 'string'
      ? parseFloat(configuration.buildServiceCharge)
      : configuration.buildServiceCharge || 0;
    const grandTotal = componentsTotal + (configuration.includesBuildService ? buildServiceCharge : 0);

    const labels = {
      en: {
        title: 'PC Configuration',
        subtitle: 'Custom PC Build Specification',
        configId: 'Configuration ID',
        date: 'Generated',
        component: 'Component',
        description: 'Description',
        specs: 'Specifications',
        price: 'Price',
        componentsTotal: 'Components Total',
        buildService: 'Build Service',
        grandTotal: 'Grand Total',
        validStatus: 'Compatibility Status',
        valid: 'All components compatible',
        invalid: 'Has compatibility issues',
        warnings: 'Warnings',
        errors: 'Errors',
        buildServiceIncluded: 'Professional assembly included',
        buildServiceNotIncluded: 'DIY - Self assembly',
        poweredBy: 'Powered by',
        thankYou: 'Thank you for choosing us for your custom PC build!',
      },
      sv: {
        title: 'Datorkonfiguration',
        subtitle: 'Specifikation för anpassad datorbygge',
        configId: 'Konfigurations-ID',
        date: 'Genererad',
        component: 'Komponent',
        description: 'Beskrivning',
        specs: 'Specifikationer',
        price: 'Pris',
        componentsTotal: 'Komponenter totalt',
        buildService: 'Byggservice',
        grandTotal: 'Totalt',
        validStatus: 'Kompatibilitetsstatus',
        valid: 'Alla komponenter är kompatibla',
        invalid: 'Har kompatibilitetsproblem',
        warnings: 'Varningar',
        errors: 'Fel',
        buildServiceIncluded: 'Professionell montering ingår',
        buildServiceNotIncluded: 'Gör-det-själv - Egen montering',
        poweredBy: 'Powered by',
        thankYou: 'Tack för att du valde oss för ditt anpassade datorbygge!',
      },
    };

    const t = labels[language];
    const currency = configuration.currency || 'SEK';

    const formatPrice = (price: number) => {
      return price.toLocaleString(language === 'sv' ? 'sv-SE' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + ' ' + currency;
    };

    const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title} - ${displayName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 30px;
      color: #1f2937;
      background: #fff;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 8px;
    }
    .company-details {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
    }
    .config-info {
      text-align: right;
    }
    .config-title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 4px;
    }
    .config-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 16px;
    }
    .config-meta {
      font-size: 12px;
      color: #6b7280;
    }
    .config-name {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 24px 0 8px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .status-valid {
      background: #d1fae5;
      color: #065f46;
    }
    .status-invalid {
      background: #fee2e2;
      color: #991b1b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    thead {
      background: #f3f4f6;
    }
    th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    th:last-child {
      text-align: right;
    }
    td {
      padding: 12px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    td:last-child {
      text-align: right;
      white-space: nowrap;
    }
    .component-type {
      font-weight: 600;
      color: #2563eb;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .component-name {
      font-weight: 500;
      color: #1f2937;
      margin-top: 2px;
    }
    .component-manufacturer {
      font-size: 11px;
      color: #6b7280;
    }
    .component-specs {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }
    .totals-section {
      margin-top: 24px;
      border-top: 2px solid #e5e7eb;
      padding-top: 16px;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-label {
      width: 180px;
      text-align: right;
      color: #6b7280;
      padding-right: 20px;
    }
    .totals-value {
      width: 140px;
      text-align: right;
      font-weight: 600;
      color: #1f2937;
    }
    .grand-total-row {
      font-size: 18px;
      border-top: 2px solid #2563eb;
      margin-top: 8px;
      padding-top: 16px;
    }
    .grand-total-row .totals-label {
      color: #1f2937;
      font-weight: 600;
    }
    .grand-total-row .totals-value {
      color: #2563eb;
      font-size: 20px;
    }
    .build-service-note {
      margin-top: 24px;
      padding: 16px;
      background: ${configuration.includesBuildService ? '#dbeafe' : '#f3f4f6'};
      border-radius: 8px;
      font-size: 13px;
    }
    .build-service-note strong {
      color: ${configuration.includesBuildService ? '#1d4ed8' : '#374151'};
    }
    .warnings-section, .errors-section {
      margin-top: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
    }
    .warnings-section {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .errors-section {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .warnings-section h4, .errors-section h4 {
      font-size: 13px;
      margin-bottom: 8px;
    }
    .warnings-section ul, .errors-section ul {
      margin-left: 16px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${settings?.siteName_en || 'M24 Design'}</div>
      <div class="company-details">
        ${settings?.address || ''}<br>
        ${settings?.city || ''} ${settings?.postalCode || ''}<br>
        ${settings?.email || ''}<br>
        ${settings?.phone || ''}
      </div>
    </div>
    <div class="config-info">
      <div class="config-title">${t.title}</div>
      <div class="config-subtitle">${t.subtitle}</div>
      <div class="config-meta">
        <strong>${t.configId}:</strong> ${configuration.id.substring(0, 8)}<br>
        <strong>${t.date}:</strong> ${new Date().toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US')}
      </div>
    </div>
  </div>

  <div class="config-name">${displayName}</div>

  <div class="status-badge ${configuration.isValid ? 'status-valid' : 'status-invalid'}">
    ${t.validStatus}: ${configuration.isValid ? t.valid : t.invalid}
  </div>

  <table>
    <thead>
      <tr>
        <th>${t.component}</th>
        <th>${t.specs}</th>
        <th>${t.price}</th>
      </tr>
    </thead>
    <tbody>
      ${componentsDisplay.map(comp => `
        <tr>
          <td>
            <div class="component-type">${comp.type}</div>
            <div class="component-name">${comp.name}${comp.quantity && comp.quantity > 1 ? ` (x${comp.quantity})` : ''}</div>
            <div class="component-manufacturer">${comp.manufacturer}${comp.modelNumber ? ` - ${comp.modelNumber}` : ''}</div>
          </td>
          <td>
            <div class="component-specs">${comp.specs || '-'}</div>
          </td>
          <td>${formatPrice(comp.price * (comp.quantity || 1))}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-row">
      <div class="totals-label">${t.componentsTotal}:</div>
      <div class="totals-value">${formatPrice(componentsTotal)}</div>
    </div>
    ${configuration.includesBuildService ? `
    <div class="totals-row">
      <div class="totals-label">${t.buildService}:</div>
      <div class="totals-value">${formatPrice(buildServiceCharge)}</div>
    </div>
    ` : ''}
    <div class="totals-row grand-total-row">
      <div class="totals-label">${t.grandTotal}:</div>
      <div class="totals-value">${formatPrice(grandTotal)}</div>
    </div>
  </div>

  <div class="build-service-note">
    <strong>${t.buildService}:</strong> ${configuration.includesBuildService ? t.buildServiceIncluded : t.buildServiceNotIncluded}
  </div>

  ${configuration.validationWarnings && configuration.validationWarnings.length > 0 ? `
  <div class="warnings-section">
    <h4>${t.warnings}:</h4>
    <ul>
      ${configuration.validationWarnings.map(w => `<li>${language === 'en' ? w.message_en : w.message_sv}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${configuration.validationErrors && configuration.validationErrors.length > 0 ? `
  <div class="errors-section">
    <h4>${t.errors}:</h4>
    <ul>
      ${configuration.validationErrors.map(e => `<li>${language === 'en' ? e.message_en : e.message_sv}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>${t.thankYou}</p>
    <p>${t.poweredBy} ${settings?.siteName_en || 'M24 Design'}</p>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Generate PDF for configuration
   */
  async generateConfigurationPDF(
    configuration: PCConfiguration,
    language: 'en' | 'sv' = 'en'
  ): Promise<Buffer> {
    const html = await this.generateConfigurationHTML(configuration, language);

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
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export default PCConfigurationPDFService;
