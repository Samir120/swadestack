import { PriceType } from '../sequelize/PCBuildServiceOption';

/**
 * PC Build Service Option DTO - Read operations
 */
export interface PCBuildServiceOptionDTO {
  id: string;

  // Bilingual service name
  name_en: string;
  name_sv: string;

  // Bilingual description
  desc_en?: string;
  desc_sv?: string;

  // Pricing
  priceType: PriceType;
  amount: number;

  // Service details
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;

  // Status
  isActive: boolean;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Build Service Option DTO
 */
export interface CreateBuildServiceOptionDTO {
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

/**
 * Update Build Service Option DTO
 */
export interface UpdateBuildServiceOptionDTO {
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

/**
 * Service Charge Calculation DTO
 */
export interface ServiceChargeCalculationDTO {
  componentTotal: number;
  optionId: string;
}

/**
 * Service Charge Result DTO
 */
export interface ServiceChargeResultDTO {
  charge: number;
  option: PCBuildServiceOptionDTO;
}

/**
 * Charge Examples DTO
 */
export interface ChargeExampleDTO {
  option: PCBuildServiceOptionDTO;
  charge: number;
}

/**
 * Map model to DTO
 */
export function mapBuildServiceOptionToDTO(option: any): PCBuildServiceOptionDTO {
  return {
    id: option.id,
    name_en: option.name_en,
    name_sv: option.name_sv,
    desc_en: option.desc_en,
    desc_sv: option.desc_sv,
    priceType: option.priceType,
    amount: parseFloat(option.amount),
    estimatedBuildTime_en: option.estimatedBuildTime_en,
    estimatedBuildTime_sv: option.estimatedBuildTime_sv,
    warrantyInfo_en: option.warrantyInfo_en,
    warrantyInfo_sv: option.warrantyInfo_sv,
    isActive: option.isActive,
    isDefault: option.isDefault,
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
  };
}
