import { BaseDAO } from '../dao/BaseDAO';
import PCBuildServiceOption, { PriceType } from '../../models/sequelize/PCBuildServiceOption';

export class PCBuildServiceOptionRepository extends BaseDAO<PCBuildServiceOption> {
  constructor() {
    super(PCBuildServiceOption);
  }

  /**
   * Find all build service options (including inactive) - for admin
   */
  async findAllOptions(): Promise<PCBuildServiceOption[]> {
    return await this.model.findAll({
      order: [['isDefault', 'DESC'], ['isActive', 'DESC'], ['amount', 'ASC']],
    });
  }

  /**
   * Find all active build service options
   */
  async findActiveOptions(): Promise<PCBuildServiceOption[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [['amount', 'ASC']], // Sort by price, cheapest first
    });
  }

  /**
   * Find the default build service option
   */
  async findDefaultOption(): Promise<PCBuildServiceOption | null> {
    return await this.model.findOne({
      where: {
        isDefault: true,
        isActive: true,
      },
    });
  }

  /**
   * Find build service option by ID (only if active)
   */
  async findActiveById(id: string): Promise<PCBuildServiceOption | null> {
    return await this.model.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  /**
   * Calculate service charge for a given component total
   */
  async calculateServiceCharge(
    componentTotal: number,
    optionId: string
  ): Promise<number> {
    const option = await this.findActiveById(optionId);
    if (!option) {
      throw new Error('Build service option not found or inactive');
    }

    return option.calculateCharge(componentTotal);
  }

  /**
   * Find options by price type
   */
  async findByPriceType(priceType: PriceType): Promise<PCBuildServiceOption[]> {
    return await this.model.findAll({
      where: {
        priceType,
        isActive: true,
      },
      order: [['amount', 'ASC']],
    });
  }

  /**
   * Find fixed-price options
   */
  async findFixedPriceOptions(): Promise<PCBuildServiceOption[]> {
    return await this.findByPriceType('fixed');
  }

  /**
   * Find percentage-based options
   */
  async findPercentageOptions(): Promise<PCBuildServiceOption[]> {
    return await this.findByPriceType('percentage');
  }

  /**
   * Set default option (ensures only one default)
   */
  async setDefaultOption(id: string): Promise<PCBuildServiceOption | null> {
    // First, unset all other defaults
    await this.model.update({ isDefault: false }, { where: {} });

    // Then set the new default
    const option = await this.findById(id);
    if (!option) return null;

    option.isDefault = true;
    option.isActive = true; // Ensure default is active
    await option.save();
    return option;
  }

  /**
   * Toggle option active status
   */
  async toggleActive(id: string): Promise<PCBuildServiceOption | null> {
    const option = await this.findById(id);
    if (!option) return null;

    // Don't allow deactivating the default option
    if (option.isDefault && option.isActive) {
      throw new Error('Cannot deactivate the default build service option');
    }

    option.isActive = !option.isActive;
    await option.save();
    return option;
  }

  /**
   * Get active option count
   */
  async getActiveCount(): Promise<number> {
    return await this.count({ isActive: true });
  }

  /**
   * Get most popular option (based on usage count in configurations)
   * Note: This requires joining with PCConfiguration, simplified for now
   */
  async getMostPopularOption(): Promise<PCBuildServiceOption | null> {
    // This would require more complex querying with joins
    // For now, return the default option
    return await this.findDefaultOption();
  }
}

export default PCBuildServiceOptionRepository;
