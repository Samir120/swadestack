import { ComponentType, ComponentSpecifications } from '../sequelize/PCComponent';

/**
 * PC Component DTO - Read operations
 */
export interface PCComponentDTO {
  id: string;
  componentType: ComponentType;

  // Bilingual content
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;

  // Product info
  manufacturer: string;
  modelNumber?: string;
  price: number;
  currency: string;
  imageUrl?: string;

  // Type-specific specifications
  specifications: ComponentSpecifications;

  // Inventory
  stock: number;
  isActive: boolean;

  // Distributor pricing
  distributorCost?: number | null;
  costCurrency?: string | null;

  // Optional compatibility notes
  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create PC Component DTO - For component creation
 */
export interface CreatePCComponentDTO {
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

  distributorCost?: number | null;
  costCurrency?: string | null;

  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
}

/**
 * Update PC Component DTO - For component updates (all fields optional)
 */
export interface UpdatePCComponentDTO {
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

  distributorCost?: number | null;
  costCurrency?: string | null;

  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
}

/**
 * PC Component List DTO - For paginated lists
 */
export interface PCComponentListDTO {
  components: PCComponentDTO[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Component search filters DTO
 */
export interface ComponentFiltersDTO {
  isActive?: boolean;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Component type count DTO
 */
export interface ComponentTypeCountDTO {
  type: ComponentType;
  count: number;
}

/**
 * Map model to DTO
 */
export function mapPCComponentToDTO(component: any): PCComponentDTO {
  return {
    id: component.id,
    componentType: component.componentType,
    name_en: component.name_en,
    name_sv: component.name_sv,
    desc_en: component.desc_en,
    desc_sv: component.desc_sv,
    manufacturer: component.manufacturer,
    modelNumber: component.modelNumber,
    price: parseFloat(component.price),
    currency: component.currency,
    imageUrl: component.imageUrl,
    specifications: component.specifications,
    stock: component.stock,
    isActive: component.isActive,
    distributorCost: component.distributorCost != null ? parseFloat(component.distributorCost) : null,
    costCurrency: component.costCurrency,
    compatibilityNotes_en: component.compatibilityNotes_en,
    compatibilityNotes_sv: component.compatibilityNotes_sv,
    createdAt: component.createdAt,
    updatedAt: component.updatedAt,
  };
}
