import PCComponent, { ComponentType, ComponentSpecifications } from '../models/sequelize/PCComponent';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import ProfitMarginService from './ProfitMarginService';

// Placeholder for DTOs (will be created later)
export interface CreatePCComponentData {
  componentType: ComponentType;
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  manufacturer: string;
  modelNumber?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  specifications: ComponentSpecifications;
  stock?: number;
  isActive?: boolean;
  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
  distributorCost?: number | null;
  costCurrency?: string | null;
}

export interface UpdatePCComponentData {
  name_en?: string;
  name_sv?: string;
  desc_en?: string;
  desc_sv?: string;
  manufacturer?: string;
  modelNumber?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  specifications?: ComponentSpecifications;
  stock?: number;
  isActive?: boolean;
  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
  distributorCost?: number | null;
  costCurrency?: string | null;
}

export interface ComponentFilters {
  isActive?: boolean;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * PC Component Service - Business Logic Layer
 * Handles PC component-related business operations
 */
export class PCComponentService {
  private componentRepo: PCComponentRepository;
  private profitMarginService: ProfitMarginService;

  constructor() {
    this.componentRepo = new PCComponentRepository();
    this.profitMarginService = new ProfitMarginService();
  }

  /**
   * Get components by type with optional filters and pagination
   */
  async getComponentsByType(
    componentType: ComponentType,
    page: number = 1,
    limit: number = 50,
    filters?: ComponentFilters
  ): Promise<{ components: PCComponent[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Default to active components only
    const activeFilters = {
      isActive: filters?.isActive !== undefined ? filters.isActive : true,
      manufacturer: filters?.manufacturer,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
    };

    const { components, total } = await this.componentRepo.findByTypeWithPagination(
      componentType,
      limit,
      offset,
      activeFilters
    );

    return {
      components,
      total,
      page,
      limit,
    };
  }

  /**
   * Get component by ID
   */
  async getComponentById(id: string): Promise<PCComponent | null> {
    return await this.componentRepo.findById(id);
  }

  /**
   * Get all active components with optional type filter, pagination, and filters (Public)
   */
  async getActiveComponents(
    page: number = 1,
    limit: number = 50,
    componentType?: ComponentType,
    filters?: ComponentFilters
  ): Promise<{ components: PCComponent[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const { components, total } = await this.componentRepo.findActiveWithPagination(
      limit,
      offset,
      componentType,
      {
        manufacturer: filters?.manufacturer,
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
      }
    );

    return { components, total, page, limit };
  }

  /**
   * Get all components including inactive ones (Admin)
   */
  async getAllComponentsAdmin(
    page: number = 1,
    limit: number = 50,
    componentType?: ComponentType
  ): Promise<{ components: PCComponent[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const { components, total } = await this.componentRepo.findAllComponents(
      limit,
      offset,
      componentType
    );

    return {
      components,
      total,
      page,
      limit,
    };
  }

  /**
   * Search components by query string
   */
  async searchComponents(
    query: string,
    componentType?: ComponentType,
    limit: number = 50
  ): Promise<PCComponent[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    return await this.componentRepo.searchComponents(query, {
      componentType,
      isActive: true,
      limit,
    });
  }

  /**
   * Get all manufacturers for a component type
   */
  async getManufacturers(componentType?: ComponentType): Promise<string[]> {
    return await this.componentRepo.getManufacturers(componentType);
  }

  /**
   * Get multiple components by IDs (bulk fetch)
   */
  async getComponentsByIds(componentIds: string[]): Promise<PCComponent[]> {
    if (componentIds.length === 0) return [];
    return await this.componentRepo.getActiveBulkByIds(componentIds);
  }

  /**
   * Create new component (Admin)
   */
  async createComponent(data: CreatePCComponentData): Promise<PCComponent> {
    // Validate data
    this.validateComponentData(data);

    // Validate specifications based on component type
    this.validateSpecifications(data.componentType, data.specifications);

    const component = await this.componentRepo.create({
      ...data,
      imageUrl: data.imageUrl || undefined,
      modelNumber: data.modelNumber || undefined,
      desc_en: data.desc_en || undefined,
      desc_sv: data.desc_sv || undefined,
      compatibilityNotes_en: data.compatibilityNotes_en || undefined,
      compatibilityNotes_sv: data.compatibilityNotes_sv || undefined,
      currency: data.currency || 'SEK',
      stock: data.stock || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    // Auto-calculate price if distributor cost is set
    if (data.distributorCost && Number(data.distributorCost) > 0) {
      try {
        await this.profitMarginService.recalculatePrice(component.id);
        return (await this.componentRepo.findById(component.id))!;
      } catch {
        // If recalculation fails (e.g., no exchange rates yet), return component as-is
      }
    }

    return component;
  }

  /**
   * Update component (Admin)
   */
  async updateComponent(id: string, data: UpdatePCComponentData): Promise<PCComponent> {
    const component = await this.componentRepo.findById(id);
    if (!component) {
      throw new Error('Component not found');
    }

    // Validate updated specifications if provided
    if (data.specifications) {
      this.validateSpecifications(component.componentType, data.specifications);
    }

    // Sanitize empty optional strings to null to avoid Sequelize isUrl validation failure
    const sanitized = { ...data };
    if ('imageUrl' in sanitized && !sanitized.imageUrl) sanitized.imageUrl = undefined;
    if ('modelNumber' in sanitized && !sanitized.modelNumber) sanitized.modelNumber = undefined;
    if ('desc_en' in sanitized && !sanitized.desc_en) sanitized.desc_en = undefined;
    if ('desc_sv' in sanitized && !sanitized.desc_sv) sanitized.desc_sv = undefined;
    if ('compatibilityNotes_en' in sanitized && !sanitized.compatibilityNotes_en) sanitized.compatibilityNotes_en = undefined;
    if ('compatibilityNotes_sv' in sanitized && !sanitized.compatibilityNotes_sv) sanitized.compatibilityNotes_sv = undefined;

    const [affectedCount, updatedComponents] = await this.componentRepo.update(id, sanitized);

    if (affectedCount === 0) {
      throw new Error('Failed to update component');
    }

    // Auto-recalculate price if distributor cost is present
    const updated = updatedComponents[0];
    if (updated.distributorCost && Number(updated.distributorCost) > 0) {
      try {
        await this.profitMarginService.recalculatePrice(id);
        return (await this.componentRepo.findById(id))!;
      } catch {
        // If recalculation fails, return updated component as-is
      }
    }

    return updated;
  }

  /**
   * Delete component (Admin)
   */
  async deleteComponent(id: string): Promise<void> {
    const component = await this.componentRepo.findById(id);
    if (!component) {
      throw new Error('Component not found');
    }

    // Check if component is being used in any configurations
    // TODO: Add check for configurations using this component

    await this.componentRepo.delete(id);
  }

  /**
   * Update component stock (Admin)
   */
  async updateStock(id: string, quantity: number): Promise<void> {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const component = await this.componentRepo.findById(id);
    if (!component) {
      throw new Error('Component not found');
    }

    await this.componentRepo.updateStock(id, quantity);
  }

  /**
   * Toggle component active status (Admin)
   */
  async toggleActive(id: string): Promise<PCComponent> {
    const component = await this.componentRepo.toggleActive(id);
    if (!component) {
      throw new Error('Component not found');
    }
    return component;
  }

  /**
   * Get components with low stock
   */
  async getLowStockComponents(threshold: number = 5): Promise<PCComponent[]> {
    return await this.componentRepo.findLowStock(threshold);
  }

  /**
   * Get component count by type
   */
  async getComponentCount(componentType: ComponentType, isActive?: boolean): Promise<number> {
    return await this.componentRepo.getCountByType(componentType, isActive);
  }

  /**
   * Get all component types with counts
   */
  async getComponentTypeCounts(): Promise<{ type: ComponentType; count: number }[]> {
    const types: ComponentType[] = [
      'cpu',
      'motherboard',
      'ram',
      'gpu',
      'ssd',
      'hdd',
      'psu',
      'case',
      'cooling',
      'optical',
      'fan',
      'os',
    ];

    const counts = await Promise.all(
      types.map(async (type) => ({
        type,
        count: await this.componentRepo.getCountByType(type, true),
      }))
    );

    return counts;
  }

  /**
   * Validate component data
   */
  private validateComponentData(data: CreatePCComponentData): void {
    // Validate bilingual names
    if (!data.name_en || data.name_en.trim().length < 2) {
      throw new Error('English name must be at least 2 characters long');
    }
    if (!data.name_sv || data.name_sv.trim().length < 2) {
      throw new Error('Swedish name must be at least 2 characters long');
    }

    // Validate manufacturer
    if (!data.manufacturer || data.manufacturer.trim().length < 2) {
      throw new Error('Manufacturer must be at least 2 characters long');
    }

    // Validate price
    if (data.price < 0) {
      throw new Error('Price cannot be negative');
    }

    // Validate stock
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('Stock cannot be negative');
    }
  }

  /**
   * Validate component specifications based on type
   */
  private validateSpecifications(
    componentType: ComponentType,
    specifications: ComponentSpecifications
  ): void {
    if (!specifications || Object.keys(specifications).length === 0) {
      throw new Error('Specifications are required');
    }

    switch (componentType) {
      case 'cpu':
        this.validateCPUSpecifications(specifications as any);
        break;
      case 'motherboard':
        this.validateMotherboardSpecifications(specifications as any);
        break;
      case 'ram':
        this.validateRAMSpecifications(specifications as any);
        break;
      case 'gpu':
        this.validateGPUSpecifications(specifications as any);
        break;
      case 'ssd':
      case 'hdd':
        this.validateStorageSpecifications(specifications as any);
        break;
      case 'psu':
        this.validatePSUSpecifications(specifications as any);
        break;
      case 'case':
        this.validateCaseSpecifications(specifications as any);
        break;
      case 'cooling':
        this.validateCoolingSpecifications(specifications as any);
        break;
    }
  }

  private validateCPUSpecifications(spec: any): void {
    if (!spec.socket) throw new Error('CPU socket is required');
    if (!spec.tdp || spec.tdp <= 0) throw new Error('CPU TDP must be positive');
    if (!spec.cores || spec.cores <= 0) throw new Error('CPU cores must be positive');
  }

  private validateMotherboardSpecifications(spec: any): void {
    if (!spec.socket) throw new Error('Motherboard socket is required');
    if (!spec.ramType) throw new Error('RAM type is required');
    if (!spec.ramSlots || spec.ramSlots <= 0) throw new Error('RAM slots must be positive');
    if (!spec.maxRamSpeed || spec.maxRamSpeed <= 0) throw new Error('Max RAM speed must be positive');
    if (!spec.formFactor) throw new Error('Form factor is required');
    if (spec.hasNVMe === undefined) throw new Error('NVMe support flag is required');
  }

  private validateRAMSpecifications(spec: any): void {
    if (!spec.ramType) throw new Error('RAM type is required');
    if (!spec.speed || spec.speed <= 0) throw new Error('RAM speed must be positive');
    if (!spec.capacity || spec.capacity <= 0) throw new Error('RAM capacity must be positive');
  }

  private validateGPUSpecifications(spec: any): void {
    if (!spec.length || spec.length <= 0) throw new Error('GPU length must be positive');
    if (!spec.tdp || spec.tdp <= 0) throw new Error('GPU TDP must be positive');
    if (!spec.pciSlots || spec.pciSlots <= 0) throw new Error('PCI slots must be positive');
  }

  private validateStorageSpecifications(spec: any): void {
    if (!spec.storageType) throw new Error('Storage type is required');
    if (!spec.capacity || spec.capacity <= 0) throw new Error('Storage capacity must be positive');
  }

  private validatePSUSpecifications(spec: any): void {
    if (!spec.wattage || spec.wattage <= 0) throw new Error('PSU wattage must be positive');
    if (!spec.efficiency) throw new Error('PSU efficiency rating is required');
  }

  private validateCaseSpecifications(spec: any): void {
    if (!spec.formFactor || spec.formFactor.length === 0) {
      throw new Error('Case form factors are required');
    }
    if (!spec.maxGpuLength || spec.maxGpuLength <= 0) {
      throw new Error('Max GPU length must be positive');
    }
  }

  private validateCoolingSpecifications(spec: any): void {
    if (!spec.coolingType) throw new Error('Cooling type is required');
    if (!spec.socket || spec.socket.length === 0) {
      throw new Error('Supported sockets are required');
    }
  }
}

export default PCComponentService;
