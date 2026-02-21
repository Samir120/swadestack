import { Op, literal } from 'sequelize';
import ServicesRepository from '../integration/repositories/ServicesRepository';
import PCConfigurationRepository from '../integration/repositories/PCConfigurationRepository';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import VatSettingsRepository from '../integration/repositories/VatSettingsRepository';
import ServiceCategory from '../models/sequelize/ServiceCategory';

interface ProductSearchQuery {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

interface ProductSearchItem {
  id: string;
  type: 'service' | 'gaming-pc' | 'pc-component';
  name: string;
  description: string;
  price: string;
  priceRaw: number;
  priceNet: number;
  imageUrl: string;
  category: string;
  pageUrl: string;
  buttonText: string;
}

interface ProductSearchResult {
  products: ProductSearchItem[];
  total: number;
  categories: string[];
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(amount) + ' SEK';
};

const truncate = (str: string, len: number): string => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

export class ProductSearchService {
  private servicesRepository: ServicesRepository;
  private pcConfigurationRepository: PCConfigurationRepository;
  private pcComponentRepository: PCComponentRepository;
  private vatSettingsRepository: VatSettingsRepository;

  constructor() {
    this.servicesRepository = new ServicesRepository();
    this.pcConfigurationRepository = new PCConfigurationRepository();
    this.pcComponentRepository = new PCComponentRepository();
    this.vatSettingsRepository = new VatSettingsRepository();
  }

  async search(params: ProductSearchQuery): Promise<ProductSearchResult> {
    const { query, category, page = 1, pageSize = 6 } = params;

    // Get VAT rate
    const vatSettings = await this.vatSettingsRepository.getOrCreateSettings();
    const vatRate = parseFloat(String(vatSettings.vatRate)) || 0.25;

    // Build search conditions
    const searchConditions = query
      ? {
          [Op.or]: [
            { name_en: { [Op.iLike]: `%${query}%` } },
            { name_sv: { [Op.iLike]: `%${query}%` } },
          ],
        }
      : {};

    // Search services
    const serviceWhere: any = {
      isActive: true,
      ...searchConditions,
    };
    if (query) {
      serviceWhere[Op.or] = [
        { name_en: { [Op.iLike]: `%${query}%` } },
        { name_sv: { [Op.iLike]: `%${query}%` } },
        { desc_en: { [Op.iLike]: `%${query}%` } },
        { desc_sv: { [Op.iLike]: `%${query}%` } },
        { category: { [Op.iLike]: `%${query}%` } },
      ];
    }

    const services = await this.servicesRepository.findAll({
      where: serviceWhere,
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
    });

    // Search PC configurations
    const pcWhere: any = { isPreConfigured: true };
    if (query) {
      pcWhere[Op.or] = [
        { name_en: { [Op.iLike]: `%${query}%` } },
        { name_sv: { [Op.iLike]: `%${query}%` } },
        { shortDescription_en: { [Op.iLike]: `%${query}%` } },
        { shortDescription_sv: { [Op.iLike]: `%${query}%` } },
        literal(`"tier"::text ILIKE '%${query.replace(/'/g, "''")}%'`),
      ];
    }

    const pcConfigs = await this.pcConfigurationRepository.findAll({
      where: pcWhere,
    });

    // Collect PC config IDs and names to exclude duplicates from services
    const pcNames = new Set(pcConfigs.map((pc: any) => (pc.name_en || pc.name_sv || '').toLowerCase()));

    // Map services to ProductSearchItem (exclude gaming PCs already covered by pcConfigs)
    const serviceItems: ProductSearchItem[] = services
      .filter((svc: any) => {
        const categoryName = (svc.serviceCategory?.name_en || svc.category || '').toLowerCase();
        const serviceName = (svc.name_en || svc.name_sv || '').toLowerCase();
        // Exclude services that belong to "Gaming PCs" category or match a PC config by name
        if (categoryName === 'gaming pcs' || categoryName === 'gaming pc') return false;
        if (pcNames.has(serviceName)) return false;
        return true;
      })
      .map((svc: any) => {
        const priceNet = parseFloat(String(svc.discountPrice || svc.price)) || 0;
        const priceGross = Math.round(priceNet * (1 + vatRate) * 100) / 100;
        const categoryName = svc.serviceCategory?.name_en || svc.category || 'Services';

        return {
          id: svc.id,
          type: 'service' as const,
          name: svc.name_en || svc.name_sv,
          description: truncate(svc.desc_en || svc.desc_sv || '', 120),
          price: formatPrice(priceGross),
          priceRaw: priceGross,
          priceNet,
          imageUrl: svc.imageUrl || '',
          category: categoryName,
          pageUrl: `/services#${svc.id}`,
          buttonText: 'View Details',
        };
      });

    // Map PCs to ProductSearchItem (price matches home page: componentPrice + buildServiceCharge)
    const tierNames: Record<string, string> = {
      core: 'Core Gaming PC',
      pro: 'Pro Gaming PC',
      ultra: 'Ultra Gaming PC',
      custom: 'Custom Gaming PC',
    };

    const pcItems: ProductSearchItem[] = pcConfigs.map((pc: any) => {
      const hasDiscount = pc.discountedPrice && pc.discountedPrice < pc.totalPrice;
      const componentPrice = hasDiscount ? parseFloat(String(pc.discountedPrice)) : parseFloat(String(pc.totalPrice)) || 0;
      const buildServiceCharge = pc.includesBuildService ? (parseFloat(String(pc.buildServiceCharge)) || 0) : 0;
      const priceNet = componentPrice + buildServiceCharge;
      const priceGross = Math.round(priceNet * (1 + vatRate) * 100) / 100;

      // Build name from tier if name_en/name_sv are empty
      const name = pc.name_en || pc.name_sv || tierNames[pc.tier] || 'Pre-configured PC';

      // Build description from key components if shortDescription is empty
      let description = pc.shortDescription_en || pc.shortDescription_sv || '';
      if (!description && pc.components) {
        const specs: string[] = [];
        if (pc.components.cpu) specs.push(pc.components.cpu.name_en || pc.components.cpu.name_sv || '');
        if (pc.components.gpus?.length) specs.push(pc.components.gpus[0].name_en || pc.components.gpus[0].name_sv || '');
        if (pc.components.rams?.length) specs.push(pc.components.rams[0].name_en || pc.components.rams[0].name_sv || '');
        description = specs.filter(Boolean).join(', ');
      }

      return {
        id: pc.id,
        type: 'gaming-pc' as const,
        name,
        description: truncate(description, 120),
        price: formatPrice(priceGross),
        priceRaw: priceGross,
        priceNet,
        imageUrl: pc.imageUrl || '',
        category: 'Gaming PCs',
        pageUrl: '/gaming-pcs',
        buttonText: 'View Details',
      };
    });

    // Search PC components (individual parts)
    const componentWhere: any = { isActive: true };
    if (query) {
      componentWhere[Op.or] = [
        { name_en: { [Op.iLike]: `%${query}%` } },
        { name_sv: { [Op.iLike]: `%${query}%` } },
        { manufacturer: { [Op.iLike]: `%${query}%` } },
        { modelNumber: { [Op.iLike]: `%${query}%` } },
      ];
    }

    const components = await this.pcComponentRepository.findAll({ where: componentWhere });

    const componentTypeLabels: Record<string, string> = {
      cpu: 'CPU',
      gpu: 'Graphics Card',
      motherboard: 'Motherboard',
      ram: 'RAM',
      ssd: 'SSD',
      hdd: 'Hard Drive',
      psu: 'Power Supply',
      case: 'Case',
      cooling: 'Cooling',
      fan: 'Fan',
      optical: 'Optical Drive',
      os: 'Operating System',
    };

    const componentItems: ProductSearchItem[] = components.map((comp: any) => {
      const priceNet = parseFloat(String(comp.price)) || 0;
      const priceGross = Math.round(priceNet * (1 + vatRate) * 100) / 100;
      const typeLabel = componentTypeLabels[comp.componentType] || comp.componentType;

      return {
        id: comp.id,
        type: 'pc-component' as const,
        name: comp.name_en || comp.name_sv,
        description: truncate(`${comp.manufacturer}${comp.modelNumber ? ' ' + comp.modelNumber : ''}`, 120),
        price: formatPrice(priceGross),
        priceRaw: priceGross,
        priceNet,
        imageUrl: comp.imageUrl || '',
        category: typeLabel,
        pageUrl: `/components/${comp.id}`,
        buttonText: 'Select',
      };
    });

    // Merge and apply category filter
    let allProducts = [...serviceItems, ...pcItems, ...componentItems];
    if (category) {
      allProducts = allProducts.filter((p) => p.category === category);
    }

    // Sort by category then name
    allProducts.sort((a, b) => {
      const catCmp = a.category.localeCompare(b.category);
      if (catCmp !== 0) return catCmp;
      return a.name.localeCompare(b.name);
    });

    // Collect distinct categories
    const categories = [...new Set(allProducts.map((p) => p.category))].sort();

    // Paginate
    const total = allProducts.length;
    const offset = (page - 1) * pageSize;
    const products = allProducts.slice(offset, offset + pageSize);

    return { products, total, categories };
  }
}

export default ProductSearchService;
