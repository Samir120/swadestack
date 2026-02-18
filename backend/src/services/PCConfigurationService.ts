import PCConfiguration, {
  ConfigurationStatus,
  ComponentsSnapshot,
  SelectedComponentSnapshot,
  PCTier,
} from '../models/sequelize/PCConfiguration';
import PCConfigurationRepository, {
  PreConfiguredPCFilters,
  CreatePreConfiguredPCData,
  UpdatePreConfiguredPCData,
} from '../integration/repositories/PCConfigurationRepository';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import PCBuildServiceOptionRepository from '../integration/repositories/PCBuildServiceOptionRepository';
import PCCompatibilityService, { ValidationResult } from './PCCompatibilityService';

// Price breakdown interface
export interface PriceBreakdown {
  componentsTotal: number;
  buildServiceCharge: number;
  grandTotal: number;
  currency: string;
  componentPrices: {
    cpu?: number;
    motherboard?: number;
    ram?: number;
    gpu?: number;
    ssd?: number;
    hdd?: number;
    storage?: number; // Legacy
    psu?: number;
    case?: number;
    cooling?: number;
    optical?: number;
    fan?: number;
    os?: number;
  };
}

/**
 * PC Configuration Service - Business Logic Layer
 * Handles configuration management, pricing, validation, and order conversion
 */
export class PCConfigurationService {
  private configRepo: PCConfigurationRepository;
  private componentRepo: PCComponentRepository;
  private buildServiceRepo: PCBuildServiceOptionRepository;
  private compatibilityService: PCCompatibilityService;

  constructor() {
    this.configRepo = new PCConfigurationRepository();
    this.componentRepo = new PCComponentRepository();
    this.buildServiceRepo = new PCBuildServiceOptionRepository();
    this.compatibilityService = new PCCompatibilityService();
  }

  /**
   * Get all configurations for a user
   */
  async getUserConfigurations(
    userId: string,
    status?: ConfigurationStatus
  ): Promise<PCConfiguration[]> {
    return await this.configRepo.findUserConfigurations(userId, status);
  }

  /**
   * Get configuration by ID
   */
  async getConfigurationById(configId: string): Promise<PCConfiguration | null> {
    return await this.configRepo.findById(configId);
  }

  /**
   * Create new configuration
   */
  async createConfiguration(
    userId: string,
    name?: { en?: string; sv?: string }
  ): Promise<PCConfiguration> {
    return await this.configRepo.createConfiguration(userId, name);
  }

  /**
   * Delete configuration
   */
  async deleteConfiguration(configId: string, userId: string): Promise<void> {
    const config = await this.configRepo.findById(configId);

    if (!config) {
      throw new Error('Configuration not found');
    }

    // Verify ownership
    if (config.userId !== userId) {
      throw new Error('Unauthorized: You do not own this configuration');
    }

    // Prevent deletion of ordered configurations
    if (config.status === 'ordered') {
      throw new Error('Cannot delete ordered configurations');
    }

    await this.configRepo.delete(configId);
  }

  /**
   * Add component to configuration
   */
  async addComponentToConfig(
    configId: string,
    componentType: string,
    componentId: string,
    quantity: number = 1,
    slotIndex?: number,
    slotType?: 'nvme' | 'sata'
  ): Promise<PCConfiguration> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Prevent modification of ordered configurations
    if (config.status === 'ordered') {
      throw new Error('Cannot modify ordered configurations');
    }

    const component = await this.componentRepo.findById(componentId);
    if (!component) {
      throw new Error('Component not found');
    }

    // Verify component type matches
    if (component.componentType !== componentType) {
      throw new Error(`Component type mismatch: expected ${componentType}, got ${component.componentType}`);
    }

    // Create component snapshot
    // Parse price as number (PostgreSQL DECIMAL returns as string)
    const price = typeof component.price === 'string' ? parseFloat(component.price) : component.price;
    const snapshot: SelectedComponentSnapshot = {
      id: component.id,
      componentType: component.componentType,
      name_en: component.name_en,
      name_sv: component.name_sv,
      manufacturer: component.manufacturer,
      modelNumber: component.modelNumber,
      price,
      imageUrl: component.imageUrl,
      specifications: component.specifications,
    };

    // Update configuration components
    const updatedComponents: ComponentsSnapshot = { ...config.components };

    // Multi-select component types (supports multiple items based on motherboard slots)
    const multiSelectTypes = ['ram', 'gpu', 'ssd', 'hdd', 'fan'];

    if (multiSelectTypes.includes(componentType)) {
      // Multi-select components stored in arrays with slot information
      const pluralKey = `${componentType}s` as keyof ComponentsSnapshot; // rams, gpus, ssds, hdds, fans

      // Calculate slot index if not provided
      const existingArray = (updatedComponents as any)[pluralKey] || [];
      const actualSlotIndex = slotIndex ?? (existingArray.length > 0
        ? Math.max(...existingArray.map((c: any) => c.slotIndex || 0)) + 1
        : 0);

      const slotSnapshot = {
        ...snapshot,
        slotIndex: actualSlotIndex,
        ...(componentType === 'ssd' && slotType ? { slotType } : {}),
      };

      if (!(updatedComponents as any)[pluralKey]) {
        (updatedComponents as any)[pluralKey] = [];
      }
      (updatedComponents as any)[pluralKey].push(slotSnapshot);
    } else {
      // Single-select components (cpu, motherboard, psu, case, cooling, optical, os)
      (updatedComponents as any)[componentType] = snapshot;
    }

    await this.configRepo.updateComponents(configId, updatedComponents);

    // Recalculate pricing
    await this.updateConfigurationPricing(configId, updatedComponents, config.includesBuildService);

    // Revalidate configuration
    const validationResult = await this.compatibilityService.validateConfiguration(updatedComponents);
    await this.configRepo.updateValidationStatus(configId, {
      isValid: validationResult.isValid,
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      powerSummary: validationResult.powerSummary,
    });

    return (await this.configRepo.findById(configId))!;
  }

  /**
   * Remove component from configuration
   */
  async removeComponentFromConfig(
    configId: string,
    componentType: string,
    slotIndex?: number
  ): Promise<PCConfiguration> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    if (config.status === 'ordered') {
      throw new Error('Cannot modify ordered configurations');
    }

    const updatedComponents: ComponentsSnapshot = { ...config.components };

    // Multi-select component types
    const multiSelectTypes = ['ram', 'gpu', 'ssd', 'hdd', 'fan'];

    if (multiSelectTypes.includes(componentType) && slotIndex !== undefined) {
      // Remove specific multi-select item by slot index
      const pluralKey = `${componentType}s` as keyof ComponentsSnapshot;
      const existingArray = (updatedComponents as any)[pluralKey] as any[];
      if (existingArray) {
        (updatedComponents as any)[pluralKey] = existingArray.filter(
          (c: any) => c.slotIndex !== slotIndex
        );
      }
    } else {
      // Remove singular component
      delete (updatedComponents as any)[componentType];
    }

    await this.configRepo.updateComponents(configId, updatedComponents);

    // Recalculate pricing
    await this.updateConfigurationPricing(configId, updatedComponents, config.includesBuildService);

    // Revalidate configuration
    const validationResult = await this.compatibilityService.validateConfiguration(updatedComponents);
    await this.configRepo.updateValidationStatus(configId, {
      isValid: validationResult.isValid,
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      powerSummary: validationResult.powerSummary,
    });

    return (await this.configRepo.findById(configId))!;
  }

  /**
   * Validate and save configuration
   */
  async validateAndSaveConfiguration(configId: string, save: boolean = false): Promise<ValidationResult> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Validate configuration
    const validationResult = await this.compatibilityService.validateConfiguration(config.components);

    // Update validation status
    await this.configRepo.updateValidationStatus(configId, {
      isValid: validationResult.isValid,
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      powerSummary: validationResult.powerSummary,
    });

    // Only transition status from 'draft' to 'saved' when explicitly saving
    if (save && validationResult.isValid && config.status === 'draft') {
      await this.configRepo.updateStatus(configId, 'saved');
    }

    return validationResult;
  }

  /**
   * Validate if a component can be added to the configuration (pre-add validation)
   * This is called before adding a component to check compatibility
   */
  async validateComponentSelection(
    configId: string,
    componentType: string,
    componentId: string
  ): Promise<{ isCompatible: boolean; errors: any[]; warnings: any[] }> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    const component = await this.componentRepo.findById(componentId);
    if (!component) {
      throw new Error('Component not found');
    }

    // Verify component type matches
    if (component.componentType !== componentType) {
      return {
        isCompatible: false,
        errors: [{
          type: 'type_mismatch',
          severity: 'error',
          message_en: `Component type mismatch: expected ${componentType}, got ${component.componentType}`,
          message_sv: `Komponenttyp matchar inte: förväntade ${componentType}, fick ${component.componentType}`,
          affectedComponents: [componentId],
          timestamp: new Date(),
        }],
        warnings: [],
      };
    }

    // Use compatibility service to validate the component selection
    const result = await this.compatibilityService.validateComponentSelection(
      component,
      config.components
    );

    return result;
  }

  /**
   * Toggle build service for configuration
   */
  async toggleBuildService(
    configId: string,
    includesBuildService: boolean,
    buildServiceOptionId?: string
  ): Promise<PCConfiguration> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Calculate component total - use stored totalPrice or calculate from components if 0
    let componentTotal = config.totalPrice;
    if (!componentTotal || componentTotal === 0) {
      const priceBreakdown = this.calculatePriceBreakdown(config.components, false, 0);
      componentTotal = priceBreakdown.componentsTotal;
    }

    let buildServiceCharge = 0;

    if (includesBuildService) {
      // Calculate service charge based on component total
      if (buildServiceOptionId) {
        buildServiceCharge = await this.buildServiceRepo.calculateServiceCharge(
          componentTotal,
          buildServiceOptionId
        );
      } else {
        // Find first active paid option (non-DIY) when no specific option is provided
        // DIY option has amount = 0, so we look for options with amount > 0
        const activeOptions = await this.buildServiceRepo.findActiveOptions();
        const paidOption = activeOptions.find(opt => {
          const amount = typeof opt.amount === 'string' ? parseFloat(opt.amount) : opt.amount;
          return amount > 0;
        });
        if (paidOption) {
          buildServiceCharge = paidOption.calculateCharge(componentTotal);
        }
      }
    }

    await this.configRepo.updatePricing(
      configId,
      componentTotal, // Use calculated component total
      includesBuildService,
      buildServiceCharge
    );

    return (await this.configRepo.findById(configId))!;
  }

  /**
   * Calculate configuration price breakdown
   */
  async calculateConfigurationPrice(configId: string): Promise<PriceBreakdown> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    return this.calculatePriceBreakdown(config.components, config.includesBuildService, config.buildServiceCharge);
  }

  /**
   * Duplicate configuration
   */
  async duplicateConfiguration(configId: string, userId: string): Promise<PCConfiguration> {
    const original = await this.configRepo.findById(configId);
    if (!original) {
      throw new Error('Configuration not found');
    }

    // Verify ownership
    if (original.userId !== userId) {
      throw new Error('Unauthorized: You do not own this configuration');
    }

    // Create new configuration with copied data
    const duplicate = await this.configRepo.create({
      userId,
      name_en: original.name_en ? `${original.name_en} (Copy)` : undefined,
      name_sv: original.name_sv ? `${original.name_sv} (Kopia)` : undefined,
      components: original.components,
      totalPrice: original.totalPrice,
      currency: original.currency,
      includesBuildService: original.includesBuildService,
      buildServiceCharge: original.buildServiceCharge,
      isValid: original.isValid,
      validationErrors: original.validationErrors,
      validationWarnings: original.validationWarnings,
      powerSummary: original.powerSummary,
      status: 'draft',
    } as any);

    return duplicate;
  }

  /**
   * Convert configuration to order (mark as ordered and link to order ID)
   */
  async convertConfigurationToOrder(configId: string, orderId: string): Promise<void> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Verify configuration is valid
    if (!config.isValid) {
      throw new Error('Cannot order invalid configuration');
    }

    // Verify configuration is complete
    if (!config.isComplete()) {
      throw new Error('Configuration is incomplete');
    }

    await this.configRepo.convertToOrdered(configId, orderId);
  }

  /**
   * Get configuration statistics
   */
  async getConfigurationStats(): Promise<{
    total: number;
    draft: number;
    saved: number;
    ordered: number;
    averagePrice: number;
    buildServiceAdoptionRate: number;
  }> {
    const stats = await this.configRepo.getConfigurationStats();
    const averagePrice = await this.configRepo.getAverageTotalPrice('ordered');
    const buildServiceAdoptionRate = await this.configRepo.getBuildServiceAdoptionRate();

    return {
      ...stats,
      averagePrice,
      buildServiceAdoptionRate,
    };
  }

  // =====================================================
  // PRE-CONFIGURED PC METHODS (Admin-created PCs for sale)
  // =====================================================

  /**
   * Get all pre-configured PCs with optional filtering (PUBLIC)
   */
  async getPreConfiguredPCs(
    filters?: PreConfiguredPCFilters,
    limit?: number,
    offset?: number
  ): Promise<{ configurations: PCConfiguration[]; total: number }> {
    return await this.configRepo.findPreConfigured(filters, limit, offset);
  }

  /**
   * Get featured pre-configured PCs for home page (PUBLIC)
   */
  async getFeaturedPCs(limit: number = 8): Promise<PCConfiguration[]> {
    return await this.configRepo.findFeatured(limit);
  }

  /**
   * Get pre-configured PCs by tier (PUBLIC)
   */
  async getPreConfiguredByTier(tier: PCTier): Promise<PCConfiguration[]> {
    return await this.configRepo.findByTier(tier);
  }

  /**
   * Get single pre-configured PC by ID (PUBLIC)
   */
  async getPreConfiguredById(id: string): Promise<PCConfiguration | null> {
    return await this.configRepo.findPreConfiguredById(id);
  }

  /**
   * Create a new pre-configured PC (ADMIN)
   */
  async createPreConfiguredPC(data: CreatePreConfiguredPCData): Promise<PCConfiguration> {
    // Validate the components if provided
    if (data.components && Object.keys(data.components).length > 0) {
      const validationResult = await this.compatibilityService.validateConfiguration(data.components);
      if (!validationResult.isValid) {
        throw new Error('Invalid configuration: ' + validationResult.errors.map(e => e.message_en).join(', '));
      }
    }

    return await this.configRepo.createPreConfiguredPC(data);
  }

  /**
   * Promote an existing user configuration to pre-configured PC (ADMIN)
   * Admin uses PC Builder to create a config, then promotes it
   */
  async promoteToPreConfigured(
    configId: string,
    data: Partial<UpdatePreConfiguredPCData>
  ): Promise<PCConfiguration> {
    const config = await this.configRepo.findById(configId);
    if (!config) {
      throw new Error('Configuration not found');
    }

    // Validate the configuration before promoting
    if (!config.isValid) {
      throw new Error('Cannot promote an invalid configuration');
    }

    await this.configRepo.promoteToPreConfigured(configId, data);

    return (await this.configRepo.findById(configId))!;
  }

  /**
   * Update pre-configured PC metadata (ADMIN)
   */
  async updatePreConfiguredPC(
    configId: string,
    data: UpdatePreConfiguredPCData
  ): Promise<PCConfiguration> {
    const config = await this.configRepo.findPreConfiguredById(configId);
    if (!config) {
      throw new Error('Pre-configured PC not found');
    }

    await this.configRepo.updatePreConfiguredPC(configId, data);

    return (await this.configRepo.findById(configId))!;
  }

  /**
   * Toggle featured status for a pre-configured PC (ADMIN)
   */
  async toggleFeaturedStatus(configId: string): Promise<boolean> {
    return await this.configRepo.toggleFeatured(configId);
  }

  /**
   * Update display order for a pre-configured PC (ADMIN)
   */
  async updateDisplayOrder(configId: string, displayOrder: number): Promise<void> {
    await this.configRepo.updateDisplayOrder(configId, displayOrder);
  }

  /**
   * Delete a pre-configured PC (ADMIN)
   */
  async deletePreConfiguredPC(configId: string): Promise<boolean> {
    return await this.configRepo.deletePreConfiguredPC(configId);
  }

  /**
   * Get pre-configured PC statistics (ADMIN)
   */
  async getPreConfiguredStats(): Promise<{
    total: number;
    featured: number;
    byTier: Record<string, number>;
    averagePrice: number;
  }> {
    return await this.configRepo.getPreConfiguredStats();
  }

  /**
   * Order a pre-configured PC (USER)
   * Creates a copy of the pre-configured PC for the user and returns it
   */
  async orderPreConfiguredPC(
    preConfiguredId: string,
    userId: string
  ): Promise<PCConfiguration> {
    const preConfigured = await this.configRepo.findPreConfiguredById(preConfiguredId);
    if (!preConfigured) {
      throw new Error('Pre-configured PC not found');
    }

    // Clone the pre-configured PC to user's configurations
    const userConfig = await this.configRepo.cloneToUserConfiguration(preConfiguredId, userId);
    if (!userConfig) {
      throw new Error('Failed to create user configuration');
    }

    return userConfig;
  }

  /**
   * Get all configurations for admin (ADMIN)
   */
  async getAllConfigurationsAdmin(
    filters?: {
      status?: ConfigurationStatus;
      isPreConfigured?: boolean;
    },
    limit?: number,
    offset?: number
  ): Promise<{ configurations: PCConfiguration[]; total: number }> {
    return await this.configRepo.findAllAdmin(filters, limit, offset);
  }

  /**
   * Private: Update configuration pricing
   */
  private async updateConfigurationPricing(
    configId: string,
    components: ComponentsSnapshot,
    includesBuildService: boolean
  ): Promise<void> {
    const priceBreakdown = this.calculatePriceBreakdown(components, false, 0);

    let buildServiceCharge = 0;
    if (includesBuildService) {
      // Find first active paid option (non-DIY) since we don't track selected option ID
      // DIY option has amount = 0, so we look for options with amount > 0
      const activeOptions = await this.buildServiceRepo.findActiveOptions();
      const paidOption = activeOptions.find(opt => {
        const amount = typeof opt.amount === 'string' ? parseFloat(opt.amount) : opt.amount;
        return amount > 0;
      });
      if (paidOption) {
        buildServiceCharge = paidOption.calculateCharge(priceBreakdown.componentsTotal);
      }
    }

    await this.configRepo.updatePricing(
      configId,
      priceBreakdown.componentsTotal,
      includesBuildService,
      buildServiceCharge
    );
  }

  /**
   * Private: Calculate price breakdown from components
   * Note: Prices from PostgreSQL DECIMAL are returned as strings, so we parse them
   */
  private calculatePriceBreakdown(
    components: ComponentsSnapshot,
    includesBuildService: boolean,
    buildServiceCharge: number
  ): PriceBreakdown {
    const componentPrices: any = {};
    let componentTotal = 0;

    // Helper to parse price (PostgreSQL DECIMAL returns as string)
    const parsePrice = (price: number | string | undefined): number => {
      if (price === undefined || price === null) return 0;
      return typeof price === 'string' ? parseFloat(price) : price;
    };

    // Single-select components
    if (components.cpu) {
      const cpuPrice = parsePrice(components.cpu.price);
      componentPrices.cpu = cpuPrice;
      componentTotal += cpuPrice;
    }
    if (components.motherboard) {
      const moboPrice = parsePrice(components.motherboard.price);
      componentPrices.motherboard = moboPrice;
      componentTotal += moboPrice;
    }
    if (components.psu) {
      const psuPrice = parsePrice(components.psu.price);
      componentPrices.psu = psuPrice;
      componentTotal += psuPrice;
    }
    if (components.case) {
      const casePrice = parsePrice(components.case.price);
      componentPrices.case = casePrice;
      componentTotal += casePrice;
    }
    if (components.cooling) {
      const coolingPrice = parsePrice(components.cooling.price);
      componentPrices.cooling = coolingPrice;
      componentTotal += coolingPrice;
    }
    if (components.optical) {
      const opticalPrice = parsePrice(components.optical.price);
      componentPrices.optical = opticalPrice;
      componentTotal += opticalPrice;
    }
    if (components.os) {
      const osPrice = parsePrice(components.os.price);
      componentPrices.os = osPrice;
      componentTotal += osPrice;
    }

    // Multi-select array components (rams, gpus, ssds, hdds, fans)
    if (components.rams && components.rams.length > 0) {
      const ramsTotal = components.rams.reduce(
        (sum, item) => sum + parsePrice(item.price) * ((item as any).quantity || 1),
        0
      );
      componentPrices.ram = ramsTotal;
      componentTotal += ramsTotal;
    }
    if (components.gpus && components.gpus.length > 0) {
      const gpusTotal = components.gpus.reduce(
        (sum, item) => sum + parsePrice(item.price) * ((item as any).quantity || 1),
        0
      );
      componentPrices.gpu = gpusTotal;
      componentTotal += gpusTotal;
    }
    if (components.ssds && components.ssds.length > 0) {
      const ssdsTotal = components.ssds.reduce(
        (sum, item) => sum + parsePrice(item.price) * ((item as any).quantity || 1),
        0
      );
      componentPrices.ssd = ssdsTotal;
      componentTotal += ssdsTotal;
    }
    if (components.hdds && components.hdds.length > 0) {
      const hddsTotal = components.hdds.reduce(
        (sum, item) => sum + parsePrice(item.price) * ((item as any).quantity || 1),
        0
      );
      componentPrices.hdd = hddsTotal;
      componentTotal += hddsTotal;
    }
    if (components.fans && components.fans.length > 0) {
      const fansTotal = components.fans.reduce(
        (sum, item) => sum + parsePrice(item.price) * ((item as any).quantity || 1),
        0
      );
      componentPrices.fan = fansTotal;
      componentTotal += fansTotal;
    }

    // Legacy support for old singular ram/gpu and storage array
    if ((components as any).ram && !components.rams) {
      const ramPrice = parsePrice((components as any).ram.price) * ((components as any).ram.quantity || 1);
      componentPrices.ram = ramPrice;
      componentTotal += ramPrice;
    }
    if ((components as any).gpu && !components.gpus) {
      const gpuPrice = parsePrice((components as any).gpu.price);
      componentPrices.gpu = gpuPrice;
      componentTotal += gpuPrice;
    }
    if ((components as any).storage && (components as any).storage.length > 0) {
      const storageTotal = (components as any).storage.reduce(
        (sum: number, item: any) => sum + parsePrice(item.price) * (item.quantity || 1),
        0
      );
      componentPrices.storage = storageTotal;
      componentTotal += storageTotal;
    }

    const grandTotal = componentTotal + parsePrice(buildServiceCharge);

    return {
      componentsTotal: componentTotal,
      buildServiceCharge: parsePrice(buildServiceCharge),
      grandTotal,
      currency: 'SEK',
      componentPrices,
    };
  }
}

export default PCConfigurationService;
