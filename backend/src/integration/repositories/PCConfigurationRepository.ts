import { BaseDAO } from '../dao/BaseDAO';
import { Op } from 'sequelize';
import PCConfiguration, {
  ConfigurationStatus,
  ComponentsSnapshot,
  ValidationError as ConfigValidationError,
  PowerSummary,
  PCTier,
  BuildServiceSnapshot,
} from '../../models/sequelize/PCConfiguration';

// Pre-configured PC filter options
export interface PreConfiguredPCFilters {
  tier?: PCTier;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

// Pre-configured PC creation data
export interface CreatePreConfiguredPCData {
  name_en: string;
  name_sv: string;
  components: ComponentsSnapshot;
  totalPrice: number;
  discountedPrice?: number;
  tier?: PCTier;
  imageUrl?: string;
  imageUrls?: string[];
  shortDescription_en?: string;
  shortDescription_sv?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  includesBuildService?: boolean;
  buildServiceCharge?: number;
  buildServiceSnapshot?: BuildServiceSnapshot;
  stock?: number;
}

// Pre-configured PC update data
export interface UpdatePreConfiguredPCData {
  name_en?: string;
  name_sv?: string;
  totalPrice?: number;
  discountedPrice?: number | null;
  tier?: PCTier | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  shortDescription_en?: string | null;
  shortDescription_sv?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
  includesBuildService?: boolean;
  buildServiceCharge?: number;
  buildServiceSnapshot?: BuildServiceSnapshot | null;
  stock?: number;
}

export class PCConfigurationRepository extends BaseDAO<PCConfiguration> {
  constructor() {
    super(PCConfiguration);
  }

  /**
   * Find all configurations for a user with optional status filter
   */
  async findUserConfigurations(
    userId: string,
    status?: ConfigurationStatus
  ): Promise<PCConfiguration[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    } else {
      // Exclude drafts by default - drafts are in-progress builds not yet saved
      where.status = { [Op.ne]: 'draft' };
    }

    return await this.model.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });
  }

  /**
   * Find user configurations with pagination
   */
  async findUserConfigurationsWithPagination(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    status?: ConfigurationStatus
  ): Promise<{ configurations: PCConfiguration[]; total: number }> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    });

    return { configurations: rows, total: count };
  }

  /**
   * Find draft configurations for a user
   */
  async findDraftsByUser(userId: string): Promise<PCConfiguration[]> {
    return await this.findUserConfigurations(userId, 'draft');
  }

  /**
   * Find saved configurations for a user
   */
  async findSavedByUser(userId: string): Promise<PCConfiguration[]> {
    return await this.findUserConfigurations(userId, 'saved');
  }

  /**
   * Find ordered configurations for a user
   */
  async findOrderedByUser(userId: string): Promise<PCConfiguration[]> {
    return await this.findUserConfigurations(userId, 'ordered');
  }

  /**
   * Create a new configuration
   */
  async createConfiguration(
    userId: string,
    name?: { en?: string; sv?: string }
  ): Promise<PCConfiguration> {
    return await this.create({
      userId,
      name_en: name?.en,
      name_sv: name?.sv,
      components: {},
      totalPrice: 0,
      currency: 'SEK',
      includesBuildService: false,
      buildServiceCharge: 0,
      isValid: false,
      validationErrors: [],
      validationWarnings: [],
      status: 'draft',
    } as any);
  }

  /**
   * Update configuration components
   */
  async updateComponents(
    configId: string,
    components: ComponentsSnapshot
  ): Promise<void> {
    await this.model.update({ components }, { where: { id: configId } });
  }

  /**
   * Update configuration validation status
   */
  async updateValidationStatus(
    configId: string,
    validationResult: {
      isValid: boolean;
      validationErrors: ConfigValidationError[];
      validationWarnings: ConfigValidationError[];
      powerSummary?: PowerSummary;
    }
  ): Promise<void> {
    await this.model.update(
      {
        isValid: validationResult.isValid,
        validationErrors: validationResult.validationErrors,
        validationWarnings: validationResult.validationWarnings,
        powerSummary: validationResult.powerSummary,
      },
      { where: { id: configId } }
    );
  }

  /**
   * Update configuration pricing
   */
  async updatePricing(
    configId: string,
    totalPrice: number,
    includesBuildService: boolean,
    buildServiceCharge: number
  ): Promise<void> {
    await this.model.update(
      {
        totalPrice,
        includesBuildService,
        buildServiceCharge,
      },
      { where: { id: configId } }
    );
  }

  /**
   * Update configuration status
   */
  async updateStatus(
    configId: string,
    status: ConfigurationStatus
  ): Promise<void> {
    await this.model.update({ status }, { where: { id: configId } });
  }

  /**
   * Convert configuration to ordered (link to order)
   */
  async convertToOrdered(configId: string, orderId: string): Promise<void> {
    await this.model.update(
      {
        status: 'ordered',
        orderId,
      },
      { where: { id: configId } }
    );
  }

  /**
   * Find configuration by order ID
   */
  async findByOrderId(orderId: string): Promise<PCConfiguration | null> {
    return await this.model.findOne({
      where: { orderId },
    });
  }

  /**
   * Get configuration count by user
   */
  async getCountByUser(userId: string, status?: ConfigurationStatus): Promise<number> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    return await this.count(where);
  }

  /**
   * Get configuration statistics
   */
  async getConfigurationStats(): Promise<{
    total: number;
    draft: number;
    saved: number;
    ordered: number;
  }> {
    const [total, draft, saved, ordered] = await Promise.all([
      this.count({}),
      this.count({ status: 'draft' }),
      this.count({ status: 'saved' }),
      this.count({ status: 'ordered' }),
    ]);

    return { total, draft, saved, ordered };
  }

  /**
   * Find configurations by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    status?: ConfigurationStatus
  ): Promise<PCConfiguration[]> {
    const where: any = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };

    if (status) {
      where.status = status;
    }

    return await this.model.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get average configuration price
   */
  async getAverageTotalPrice(status?: ConfigurationStatus): Promise<number> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const result = await this.model.findOne({
      attributes: [
        [
          this.model.sequelize!.fn('AVG', this.model.sequelize!.col('totalPrice')),
          'avgPrice',
        ],
      ],
      where,
    });

    return parseFloat((result as any)?.get('avgPrice') || '0');
  }

  /**
   * Find configurations with build service
   */
  async findWithBuildService(): Promise<PCConfiguration[]> {
    return await this.model.findAll({
      where: {
        includesBuildService: true,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get build service adoption rate
   */
  async getBuildServiceAdoptionRate(): Promise<number> {
    const [total, withService] = await Promise.all([
      this.count({ status: 'ordered' }),
      this.count({ status: 'ordered', includesBuildService: true }),
    ]);

    return total > 0 ? (withService / total) * 100 : 0;
  }

  /**
   * Delete old draft configurations (cleanup)
   */
  async deleteOldDrafts(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await this.model.destroy({
      where: {
        status: 'draft',
        updatedAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });
  }

  // =====================================================
  // PRE-CONFIGURED PC METHODS (Admin-created PCs for sale)
  // =====================================================

  /**
   * Find all pre-configured PCs with optional filters (public)
   */
  async findPreConfigured(
    filters?: PreConfiguredPCFilters,
    limit?: number,
    offset?: number
  ): Promise<{ configurations: PCConfiguration[]; total: number }> {
    const where: any = { isPreConfigured: true };

    if (filters?.tier) {
      where.tier = filters.tier;
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.totalPrice = {};
      if (filters.minPrice !== undefined) {
        where.totalPrice[Op.gte] = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.totalPrice[Op.lte] = filters.maxPrice;
      }
    }
    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit: limit || undefined,
      offset: offset || undefined,
    });

    return { configurations: rows, total: count };
  }

  /**
   * Find featured pre-configured PCs for home page carousel (public)
   */
  async findFeatured(limit: number = 8): Promise<PCConfiguration[]> {
    return await this.model.findAll({
      where: {
        isPreConfigured: true,
        isFeatured: true,
      },
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });
  }

  /**
   * Find pre-configured PCs by tier (public)
   */
  async findByTier(tier: PCTier): Promise<PCConfiguration[]> {
    return await this.model.findAll({
      where: {
        isPreConfigured: true,
        tier,
      },
      order: [
        ['displayOrder', 'ASC'],
        ['totalPrice', 'ASC'],
      ],
    });
  }

  /**
   * Get single pre-configured PC by ID (public)
   */
  async findPreConfiguredById(id: string): Promise<PCConfiguration | null> {
    return await this.model.findOne({
      where: {
        id,
        isPreConfigured: true,
      },
    });
  }

  /**
   * Create a new pre-configured PC (admin)
   */
  async createPreConfiguredPC(data: CreatePreConfiguredPCData): Promise<PCConfiguration> {
    return await this.create({
      userId: undefined, // No user for pre-configured PCs
      name_en: data.name_en,
      name_sv: data.name_sv,
      components: data.components,
      totalPrice: data.totalPrice,
      discountedPrice: data.discountedPrice,
      currency: 'SEK',
      includesBuildService: data.includesBuildService || false,
      buildServiceCharge: data.buildServiceCharge || 0,
      isValid: true, // Pre-configured PCs should always be valid
      validationErrors: [],
      validationWarnings: [],
      status: 'saved', // Pre-configured PCs are always "saved"
      isPreConfigured: true,
      isFeatured: data.isFeatured || false,
      tier: data.tier,
      displayOrder: data.displayOrder || 0,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls || [],
      shortDescription_en: data.shortDescription_en,
      shortDescription_sv: data.shortDescription_sv,
      stock: data.stock || 0,
    } as any);
  }

  /**
   * Promote an existing user configuration to pre-configured PC (admin)
   */
  async promoteToPreConfigured(
    configId: string,
    data: Partial<UpdatePreConfiguredPCData>
  ): Promise<void> {
    await this.model.update(
      {
        userId: null, // Remove user association
        isPreConfigured: true,
        isFeatured: data.isFeatured || false,
        tier: data.tier || null,
        displayOrder: data.displayOrder || 0,
        imageUrl: data.imageUrl || null,
        imageUrls: data.imageUrls || [],
        shortDescription_en: data.shortDescription_en || null,
        shortDescription_sv: data.shortDescription_sv || null,
        discountedPrice: data.discountedPrice,
        name_en: data.name_en,
        name_sv: data.name_sv,
        status: 'saved', // Ensure status is saved
        includesBuildService: data.includesBuildService || false,
        buildServiceCharge: data.buildServiceCharge || 0,
        buildServiceSnapshot: data.buildServiceSnapshot || null,
        stock: data.stock ?? 0,
      } as any,
      { where: { id: configId } }
    );
  }

  /**
   * Update pre-configured PC metadata (admin)
   */
  async updatePreConfiguredPC(
    configId: string,
    data: UpdatePreConfiguredPCData
  ): Promise<void> {
    const updateData: any = {};

    if (data.name_en !== undefined) updateData.name_en = data.name_en;
    if (data.name_sv !== undefined) updateData.name_sv = data.name_sv;
    if (data.totalPrice !== undefined) updateData.totalPrice = data.totalPrice;
    if (data.discountedPrice !== undefined) updateData.discountedPrice = data.discountedPrice;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.imageUrls !== undefined) updateData.imageUrls = data.imageUrls;
    if (data.shortDescription_en !== undefined) updateData.shortDescription_en = data.shortDescription_en;
    if (data.shortDescription_sv !== undefined) updateData.shortDescription_sv = data.shortDescription_sv;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.includesBuildService !== undefined) updateData.includesBuildService = data.includesBuildService;
    if (data.buildServiceCharge !== undefined) updateData.buildServiceCharge = data.buildServiceCharge;
    if (data.buildServiceSnapshot !== undefined) updateData.buildServiceSnapshot = data.buildServiceSnapshot;
    if (data.stock !== undefined) updateData.stock = data.stock;

    await this.model.update(updateData, {
      where: { id: configId, isPreConfigured: true },
    });
  }

  /**
   * Toggle featured status for a pre-configured PC (admin)
   */
  async toggleFeatured(configId: string): Promise<boolean> {
    const config = await this.findById(configId);
    if (!config || !config.isPreConfigured) {
      throw new Error('Pre-configured PC not found');
    }

    const newFeaturedStatus = !config.isFeatured;
    await this.model.update(
      { isFeatured: newFeaturedStatus },
      { where: { id: configId } }
    );

    return newFeaturedStatus;
  }

  /**
   * Update display order for pre-configured PCs (admin)
   */
  async updateDisplayOrder(configId: string, displayOrder: number): Promise<void> {
    await this.model.update(
      { displayOrder },
      { where: { id: configId, isPreConfigured: true } }
    );
  }

  /**
   * Delete a pre-configured PC (admin)
   */
  async deletePreConfiguredPC(configId: string): Promise<boolean> {
    const deleted = await this.model.destroy({
      where: {
        id: configId,
        isPreConfigured: true,
      },
    });
    return deleted > 0;
  }

  /**
   * Get pre-configured PC statistics (admin)
   */
  async getPreConfiguredStats(): Promise<{
    total: number;
    featured: number;
    byTier: Record<string, number>;
    averagePrice: number;
  }> {
    const [total, featured] = await Promise.all([
      this.count({ isPreConfigured: true }),
      this.count({ isPreConfigured: true, isFeatured: true }),
    ]);

    // Count by tier
    const tiers: PCTier[] = ['core', 'pro', 'ultra', 'custom'];
    const byTier: Record<string, number> = {};
    for (const tier of tiers) {
      byTier[tier] = await this.count({ isPreConfigured: true, tier });
    }
    byTier['unassigned'] = await this.count({ isPreConfigured: true, tier: null } as any);

    // Average price
    const avgResult = await this.model.findOne({
      attributes: [
        [
          this.model.sequelize!.fn('AVG', this.model.sequelize!.col('totalPrice')),
          'avgPrice',
        ],
      ],
      where: { isPreConfigured: true },
    });
    const averagePrice = parseFloat((avgResult as any)?.get('avgPrice') || '0');

    return { total, featured, byTier, averagePrice };
  }

  /**
   * Clone a pre-configured PC to user's configurations (for ordering)
   */
  async cloneToUserConfiguration(
    preConfiguredId: string,
    userId: string
  ): Promise<PCConfiguration | null> {
    const preConfigured = await this.findPreConfiguredById(preConfiguredId);
    if (!preConfigured) {
      return null;
    }

    // Create a copy for the user
    return await this.create({
      userId,
      name_en: preConfigured.name_en,
      name_sv: preConfigured.name_sv,
      components: preConfigured.components,
      totalPrice: preConfigured.discountedPrice || preConfigured.totalPrice,
      currency: preConfigured.currency,
      includesBuildService: preConfigured.includesBuildService,
      buildServiceCharge: preConfigured.buildServiceCharge,
      isValid: preConfigured.isValid,
      validationErrors: preConfigured.validationErrors,
      validationWarnings: preConfigured.validationWarnings,
      powerSummary: preConfigured.powerSummary,
      status: 'saved', // Ready for checkout
      isPreConfigured: false, // This is now a user configuration
      isFeatured: false,
      tier: undefined,
      displayOrder: 0,
    } as any);
  }

  /**
   * Get all configurations including pre-configured (admin)
   */
  async findAllAdmin(
    filters?: {
      status?: ConfigurationStatus;
      isPreConfigured?: boolean;
    },
    limit?: number,
    offset?: number
  ): Promise<{ configurations: PCConfiguration[]; total: number }> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // Exclude drafts by default - drafts are in-progress builds not yet saved
      where.status = { [Op.ne]: 'draft' };
    }
    if (filters?.isPreConfigured !== undefined) {
      where.isPreConfigured = filters.isPreConfigured;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [['updatedAt', 'DESC']],
      limit: limit || undefined,
      offset: offset || undefined,
    });

    return { configurations: rows, total: count };
  }
  /**
   * Increment stock for a pre-configured PC
   */
  async incrementStock(configId: string, quantity: number): Promise<void> {
    const config = await this.findById(configId);
    if (config) {
      config.stock = (config.stock || 0) + quantity;
      await config.save();
    }
  }

  /**
   * Decrement stock for a pre-configured PC
   */
  async decrementStock(configId: string, quantity: number): Promise<boolean> {
    const config = await this.findById(configId);
    if (!config || (config.stock || 0) < quantity) {
      return false; // Insufficient stock
    }

    config.stock = (config.stock || 0) - quantity;
    await config.save();
    return true;
  }
}

export default PCConfigurationRepository;
