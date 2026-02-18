import {
  ConfigurationStatus,
  ComponentsSnapshot,
  ValidationError,
  PowerSummary,
  PCTier,
  BuildServiceSnapshot,
} from '../sequelize/PCConfiguration';

/**
 * PC Configuration DTO - Read operations
 */
export interface PCConfigurationDTO {
  id: string;
  userId?: string;

  // Bilingual configuration name
  name_en?: string;
  name_sv?: string;

  // Component selections
  components: ComponentsSnapshot;

  // Pricing
  totalPrice: number;
  currency: string;
  discountedPrice?: number;

  // Build service option
  includesBuildService: boolean;
  buildServiceCharge: number;
  buildServiceSnapshot?: BuildServiceSnapshot;

  // Validation status
  isValid: boolean;
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  powerSummary?: PowerSummary;

  // Status tracking
  status: ConfigurationStatus;
  orderId?: string;

  // Pre-configured PC fields
  isPreConfigured: boolean;
  isFeatured: boolean;
  tier?: PCTier;
  displayOrder: number;
  imageUrl?: string;
  imageUrls?: string[];
  shortDescription_en?: string;
  shortDescription_sv?: string;

  // Metadata
  componentCount: number;
  isComplete: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create PC Configuration DTO
 */
export interface CreatePCConfigurationDTO {
  userId: string;
  name_en?: string;
  name_sv?: string;
}

/**
 * Update PC Configuration DTO
 */
export interface UpdatePCConfigurationDTO {
  name_en?: string;
  name_sv?: string;
}

/**
 * Add Component to Configuration DTO
 */
export interface AddComponentDTO {
  componentType: string;
  componentId: string;
  quantity?: number;
}

/**
 * Remove Component from Configuration DTO
 */
export interface RemoveComponentDTO {
  componentType: string;
  index?: number; // For storage items
}

/**
 * Validation Result DTO
 */
export interface ValidationResultDTO {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  powerSummary?: PowerSummary;
}

/**
 * Price Breakdown DTO
 */
export interface PriceBreakdownDTO {
  componentTotal: number;
  buildServiceCharge: number;
  grandTotal: number;
  currency: string;
  components: {
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
 * Configuration Statistics DTO
 */
export interface ConfigurationStatsDTO {
  total: number;
  draft: number;
  saved: number;
  ordered: number;
  averagePrice: number;
  buildServiceAdoptionRate: number;
}

/**
 * PC Configuration List DTO
 */
export interface PCConfigurationListDTO {
  configurations: PCConfigurationDTO[];
  total: number;
}

/**
 * Map model to DTO
 */
export function mapPCConfigurationToDTO(config: any): PCConfigurationDTO {
  return {
    id: config.id,
    userId: config.userId,
    name_en: config.name_en,
    name_sv: config.name_sv,
    components: config.components,
    totalPrice: parseFloat(config.totalPrice),
    currency: config.currency,
    discountedPrice: config.discountedPrice ? parseFloat(config.discountedPrice) : undefined,
    includesBuildService: config.includesBuildService,
    buildServiceCharge: parseFloat(config.buildServiceCharge),
    buildServiceSnapshot: config.buildServiceSnapshot,
    isValid: config.isValid,
    validationErrors: config.validationErrors,
    validationWarnings: config.validationWarnings,
    powerSummary: config.powerSummary,
    status: config.status,
    orderId: config.orderId,
    // Pre-configured PC fields
    isPreConfigured: config.isPreConfigured || false,
    isFeatured: config.isFeatured || false,
    tier: config.tier,
    displayOrder: config.displayOrder || 0,
    imageUrl: config.imageUrl,
    imageUrls: config.imageUrls || [],
    shortDescription_en: config.shortDescription_en,
    shortDescription_sv: config.shortDescription_sv,
    // Metadata
    componentCount: config.getComponentCount ? config.getComponentCount() : 0,
    isComplete: config.isComplete ? config.isComplete() : false,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

/**
 * Pre-Configured PC Statistics DTO
 */
export interface PreConfiguredStatsDTO {
  total: number;
  featured: number;
  byTier: Record<string, number>;
  averagePrice: number;
}

/**
 * Create Pre-Configured PC DTO
 */
export interface CreatePreConfiguredPCDTO {
  name_en: string;
  name_sv: string;
  components?: ComponentsSnapshot;
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
}

/**
 * Update Pre-Configured PC DTO
 */
export interface UpdatePreConfiguredPCDTO {
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
}
