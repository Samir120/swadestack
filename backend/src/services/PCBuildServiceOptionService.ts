import PCBuildServiceOption, { PriceType } from '../models/sequelize/PCBuildServiceOption';
import PCBuildServiceOptionRepository from '../integration/repositories/PCBuildServiceOptionRepository';

// Create data interface
export interface CreateBuildServiceOptionData {
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  priceType: PriceType;
  amount: number;
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Update data interface
export interface UpdateBuildServiceOptionData {
  name_en?: string;
  name_sv?: string;
  desc_en?: string;
  desc_sv?: string;
  priceType?: PriceType;
  amount?: number;
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export class PCBuildServiceOptionService {
  private buildServiceRepo: PCBuildServiceOptionRepository;

  constructor() {
    this.buildServiceRepo = new PCBuildServiceOptionRepository();
  }

  /**
   * Get all build service options (including inactive) - for admin
   */
  async getAllOptions(): Promise<PCBuildServiceOption[]> {
    return await this.buildServiceRepo.findAllOptions();
  }

  /**
   * Get all active build service options
   */
  async getActiveOptions(): Promise<PCBuildServiceOption[]> {
    return await this.buildServiceRepo.findActiveOptions();
  }

  /**
   * Get default build service option
   */
  async getDefaultOption(): Promise<PCBuildServiceOption | null> {
    return await this.buildServiceRepo.findDefaultOption();
  }

  /**
   * Get build service option by ID
   */
  async getOptionById(id: string): Promise<PCBuildServiceOption | null> {
    return await this.buildServiceRepo.findById(id);
  }

  /**
   * Calculate service charge for a given component total
   */
  async calculateServiceCharge(
    componentTotal: number,
    optionId: string
  ): Promise<{ charge: number; option: PCBuildServiceOption }> {
    if (componentTotal < 0) {
      throw new Error('Component total cannot be negative');
    }

    const charge = await this.buildServiceRepo.calculateServiceCharge(componentTotal, optionId);
    const option = await this.buildServiceRepo.findActiveById(optionId);

    if (!option) {
      throw new Error('Build service option not found');
    }

    return { charge, option };
  }

  /**
   * Create new build service option (Admin)
   */
  async createOption(data: CreateBuildServiceOptionData): Promise<PCBuildServiceOption> {
    // Validate data
    this.validateOptionData(data);

    return await this.buildServiceRepo.create({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDefault: data.isDefault || false,
    });
  }

  /**
   * Update build service option (Admin)
   */
  async updateOption(id: string, data: UpdateBuildServiceOptionData): Promise<PCBuildServiceOption> {
    const option = await this.buildServiceRepo.findById(id);
    if (!option) {
      throw new Error('Build service option not found');
    }

    // Validate updated data
    if (data.priceType !== undefined || data.amount !== undefined) {
      const validationData = {
        priceType: data.priceType || option.priceType,
        amount: data.amount !== undefined ? data.amount : option.amount,
      };
      this.validatePricing(validationData.priceType, validationData.amount);
    }

    const [affectedCount, updatedOptions] = await this.buildServiceRepo.update(id, data);

    if (affectedCount === 0) {
      throw new Error('Failed to update build service option');
    }

    return updatedOptions[0];
  }

  /**
   * Delete build service option (Admin)
   */
  async deleteOption(id: string): Promise<void> {
    const option = await this.buildServiceRepo.findById(id);
    if (!option) {
      throw new Error('Build service option not found');
    }

    // Prevent deletion of default option
    if (option.isDefault) {
      throw new Error('Cannot delete the default build service option');
    }

    await this.buildServiceRepo.delete(id);
  }

  /**
   * Set default option (Admin)
   */
  async setDefaultOption(id: string): Promise<PCBuildServiceOption> {
    const option = await this.buildServiceRepo.setDefaultOption(id);
    if (!option) {
      throw new Error('Build service option not found');
    }
    return option;
  }

  /**
   * Toggle option active status (Admin)
   */
  async toggleActive(id: string): Promise<PCBuildServiceOption> {
    const option = await this.buildServiceRepo.toggleActive(id);
    if (!option) {
      throw new Error('Build service option not found');
    }
    return option;
  }

  /**
   * Get options by price type
   */
  async getOptionsByPriceType(priceType: PriceType): Promise<PCBuildServiceOption[]> {
    return await this.buildServiceRepo.findByPriceType(priceType);
  }

  /**
   * Get fixed-price options
   */
  async getFixedPriceOptions(): Promise<PCBuildServiceOption[]> {
    return await this.buildServiceRepo.findFixedPriceOptions();
  }

  /**
   * Get percentage-based options
   */
  async getPercentageOptions(): Promise<PCBuildServiceOption[]> {
    return await this.buildServiceRepo.findPercentageOptions();
  }

  /**
   * Get active option count
   */
  async getActiveCount(): Promise<number> {
    return await this.buildServiceRepo.getActiveCount();
  }

  /**
   * Calculate charge example for all active options
   */
  async calculateChargeExamples(
    componentTotal: number
  ): Promise<{ option: PCBuildServiceOption; charge: number }[]> {
    const options = await this.buildServiceRepo.findActiveOptions();

    return options.map((option) => ({
      option,
      charge: option.calculateCharge(componentTotal),
    }));
  }

  /**
   * Validate option data
   */
  private validateOptionData(data: CreateBuildServiceOptionData): void {
    // Validate bilingual names
    if (!data.name_en || data.name_en.trim().length < 2) {
      throw new Error('English name must be at least 2 characters long');
    }
    if (!data.name_sv || data.name_sv.trim().length < 2) {
      throw new Error('Swedish name must be at least 2 characters long');
    }

    // Validate pricing
    this.validatePricing(data.priceType, data.amount);
  }

  /**
   * Validate pricing configuration
   */
  private validatePricing(priceType: PriceType, amount: number): void {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    if (priceType === 'percentage') {
      if (amount > 100) {
        throw new Error('Percentage amount cannot exceed 100');
      }
      if (amount === 0) {
        throw new Error('Percentage amount must be greater than 0');
      }
    }

    if (priceType === 'fixed' && amount === 0) {
      // Fixed amount of 0 is allowed (for DIY/no service option)
      // No error
    }
  }
}

export default PCBuildServiceOptionService;
