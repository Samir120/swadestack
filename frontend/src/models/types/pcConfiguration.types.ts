// PC Configuration Types

import { ValidationError, PowerSummary } from './validation.types';

export type ConfigurationStatus = 'draft' | 'saved' | 'ordered';

// Pre-configured PC tier (like Webhallen Core/Pro/Ultra)
export type PCTier = 'core' | 'pro' | 'ultra' | 'custom';

// Component Snapshot (stored in configuration)

export interface ComponentSnapshot {
  id: string;
  name_en: string;
  name_sv: string;
  manufacturer: string;
  modelNumber?: string;
  price: number;
  specifications: any; // Component-specific specs
  quantity?: number; // For RAM and Storage
}

// Slot-based component snapshot (for multi-select components)
export interface SlotBasedComponentSnapshot extends ComponentSnapshot {
  slotIndex: number;
}

// SSD component snapshot with slot type
export interface SSDComponentSnapshot extends SlotBasedComponentSnapshot {
  slotType: 'nvme' | 'sata';
}

export interface ComponentsSnapshot {
  // Single-select components
  cpu?: ComponentSnapshot;
  motherboard?: ComponentSnapshot;
  psu?: ComponentSnapshot;
  case?: ComponentSnapshot;
  cooling?: ComponentSnapshot;
  optical?: ComponentSnapshot;
  os?: ComponentSnapshot;

  // Multi-select array components
  rams?: SlotBasedComponentSnapshot[];
  gpus?: SlotBasedComponentSnapshot[];
  ssds?: SSDComponentSnapshot[];
  hdds?: SlotBasedComponentSnapshot[];
  fans?: SlotBasedComponentSnapshot[];

  // Legacy singular types (for backwards compatibility)
  ram?: ComponentSnapshot;
  gpu?: ComponentSnapshot;
  storage?: ComponentSnapshot[]; // Legacy storage array
}

// PC Configuration

export interface PCConfiguration {
  id: string;
  userId?: string;
  name_en?: string;
  name_sv?: string;
  components: ComponentsSnapshot;
  totalPrice: number;
  currency: string;
  discountedPrice?: number;
  includesBuildService: boolean;
  buildServiceCharge: number;
  buildServiceSnapshot?: BuildServiceSnapshot;
  isValid: boolean;
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  powerSummary?: PowerSummary;
  status: ConfigurationStatus;
  orderId?: string;
  // Pre-configured PC fields
  isPreConfigured: boolean;
  isFeatured: boolean;
  tier?: PCTier;
  displayOrder: number;
  imageUrl?: string;
  imageUrls?: string[]; // Multiple product images (array of base64 or URLs)
  shortDescription_en?: string;
  shortDescription_sv?: string;
  stock: number;
  // Computed fields
  componentCount?: number;
  isComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Price Breakdown

export interface PriceBreakdown {
  componentPrices: {
    cpu?: number;
    motherboard?: number;
    ram?: number;
    gpu?: number;
    ssd?: number;
    hdd?: number;
    storage?: number; // Legacy - total for old storage array
    psu?: number;
    case?: number;
    cooling?: number;
    optical?: number;
    fan?: number;
    os?: number;
  };
  componentsTotal: number;
  buildServiceCharge: number;
  grandTotal: number;
  currency: string;
}

// Configuration Stats (for admin dashboard)

export interface ConfigurationStats {
  totalConfigurations: number;
  draftCount: number;
  savedCount: number;
  orderedCount: number;
  averagePrice: number;
  buildServiceAdoptionRate: number; // Percentage of configs with build service
  popularComponents: {
    componentType: string;
    componentId: string;
    componentName: string;
    usageCount: number;
  }[];
  revenueByComponentType: Record<string, number>;
}

// API Request/Response Types

export interface CreateConfigurationRequest {
  name_en?: string;
  name_sv?: string;
}

export interface CreateConfigurationResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface AddComponentRequest {
  componentType: string;
  componentId: string;
  quantity?: number; // For RAM and Storage
}

export interface AddComponentResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface RemoveComponentRequest {
  componentType: string;
}

export interface RemoveComponentResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface UpdateComponentRequest {
  componentType: string;
  componentId: string;
  quantity?: number;
}

export interface UpdateComponentResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface ToggleBuildServiceRequest {
  enabled: boolean;
}

export interface ToggleBuildServiceResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface CalculatePriceResponse {
  success: boolean;
  data: PriceBreakdown;
}

export interface GetConfigurationsRequest {
  status?: ConfigurationStatus;
  page?: number;
  limit?: number;
}

export interface GetConfigurationsResponse {
  success: boolean;
  data: {
    configurations: PCConfiguration[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetConfigurationResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface DeleteConfigurationResponse {
  success: boolean;
  message: string;
}

export interface DuplicateConfigurationResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface ValidateConfigurationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    powerSummary?: PowerSummary;
  };
}

export interface CheckoutConfigurationRequest {
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethodId: string;
}

export interface CheckoutConfigurationResponse {
  success: boolean;
  data: {
    orderId: string;
    clientSecret: string; // For Stripe payment
    totalAmount: number;
  };
}

export interface ExportPDFResponse {
  success: boolean;
  data: {
    pdfUrl: string;
    fileName: string;
  };
}

// Build Service Option

export interface PCBuildServiceOption {
  id: string;
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  priceType: 'fixed' | 'percentage';
  amount: number;
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Build Service Snapshot (stored in configuration for historical record)
export interface BuildServiceSnapshot {
  id: string;
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  priceType: 'fixed' | 'percentage';
  amount: number;
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;
}

export interface BuildServiceOptionsResponse {
  success: boolean;
  data: {
    options: PCBuildServiceOption[];
  };
}

export interface BuildServiceOptionResponse {
  success: boolean;
  data: PCBuildServiceOption;
}

export interface CalculateServiceChargeRequest {
  totalPrice: number;
  optionId: string;
}

export interface CalculateServiceChargeResponse {
  success: boolean;
  data: {
    serviceCharge: number;
    totalWithService: number;
    option: PCBuildServiceOption;
  };
}

// Create/Update DTOs

export interface CreateBuildServiceOptionDTO {
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  priceType: 'fixed' | 'percentage';
  amount: number;
  estimatedBuildTime_en?: string;
  estimatedBuildTime_sv?: string;
  warrantyInfo_en?: string;
  warrantyInfo_sv?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdateBuildServiceOptionDTO extends Partial<CreateBuildServiceOptionDTO> {
  id: string;
}

// Configuration Summary (for cart/checkout display)

export interface ConfigurationSummary {
  configurationId: string;
  configurationName: string;
  componentCount: number;
  isValid: boolean;
  hasWarnings: boolean;
  totalPrice: number;
  includesBuildService: boolean;
  buildServiceCharge: number;
  estimatedBuildTime?: string;
  components: {
    type: string;
    name: string;
    price: number;
    quantity?: number;
  }[];
}

// PC Builder UI State Types

export interface BuilderUIState {
  currentStep: number; // 0-7 for 8 component types
  selectedComponentType: string | null;
  isValidating: boolean;
  isSaving: boolean;
  showValidationModal: boolean;
  showAlternativesModal: boolean;
  alternativeSuggestions: any[];
  filterOptions: {
    manufacturer?: string;
    minPrice?: number;
    maxPrice?: number;
    socket?: string;
    ramType?: string;
  };
  sortBy: 'price' | 'name' | 'manufacturer';
  sortOrder: 'asc' | 'desc';
}

// =====================================================
// PRE-CONFIGURED PC TYPES
// =====================================================

// Pre-configured PC filter options
export interface PreConfiguredPCFilters {
  tier?: PCTier;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

// Pre-configured PC stats (admin)
export interface PreConfiguredStats {
  total: number;
  featured: number;
  byTier: Record<string, number>;
  averagePrice: number;
}

// API Request/Response Types for Pre-Configured PCs

export interface GetPreConfiguredPCsRequest {
  tier?: PCTier;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface GetPreConfiguredPCsResponse {
  success: boolean;
  data: {
    configurations: PCConfiguration[];
    total: number;
  };
}

export interface GetFeaturedPCsResponse {
  success: boolean;
  data: PCConfiguration[];
}

export interface GetPreConfiguredPCResponse {
  success: boolean;
  data: PCConfiguration;
}

export interface OrderPreConfiguredPCResponse {
  success: boolean;
  message: string;
  data: PCConfiguration;
}

// Admin Pre-Configured PC Types

export interface CreatePreConfiguredPCRequest {
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
  stock?: number;
}

export interface UpdatePreConfiguredPCRequest {
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

export interface PromoteToPreConfiguredRequest {
  name_en?: string;
  name_sv?: string;
  tier?: PCTier;
  imageUrl?: string;
  imageUrls?: string[];
  shortDescription_en?: string;
  shortDescription_sv?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  discountedPrice?: number;
  includesBuildService?: boolean;
  buildServiceCharge?: number;
  buildServiceSnapshot?: BuildServiceSnapshot;
  stock?: number;
}

export interface ToggleFeaturedResponse {
  success: boolean;
  message: string;
  data: {
    isFeatured: boolean;
  };
}

export interface PreConfiguredStatsResponse {
  success: boolean;
  data: PreConfiguredStats;
}
