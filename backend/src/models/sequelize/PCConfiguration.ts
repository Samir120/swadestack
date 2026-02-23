import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';
import { ComponentSpecifications } from './PCComponent';

// Configuration status enum
export type ConfigurationStatus = 'draft' | 'saved' | 'ordered';

// Pre-configured PC tier enum (like Webhallen Core/Pro/Ultra)
export type PCTier = 'core' | 'pro' | 'ultra' | 'custom';

// Selected component snapshot interface
export interface SelectedComponentSnapshot {
  id: string;
  componentType: string;
  name_en: string;
  name_sv: string;
  manufacturer: string;
  modelNumber?: string;
  price: number;
  imageUrl?: string;
  specifications: ComponentSpecifications;
}

// Extended snapshot for slot-based components
export interface SlotBasedComponentSnapshot extends SelectedComponentSnapshot {
  slotIndex: number;
}

// Extended snapshot for SSDs that can use different slot types
export interface SSDComponentSnapshot extends SlotBasedComponentSnapshot {
  slotType: 'nvme' | 'sata';
}

// Components collection interface - supports multiple selections for slot-based components
export interface ComponentsSnapshot {
  cpu?: SelectedComponentSnapshot;
  motherboard?: SelectedComponentSnapshot;
  // Multiple RAM sticks based on motherboard RAM slots
  rams?: SlotBasedComponentSnapshot[];
  // Multiple GPUs based on motherboard PCI slots
  gpus?: SlotBasedComponentSnapshot[];
  // Multiple SSDs (NVMe uses nvmeSlots, SATA uses sataSlots)
  ssds?: SSDComponentSnapshot[];
  // Multiple HDDs based on motherboard SATA slots
  hdds?: SlotBasedComponentSnapshot[];
  psu?: SelectedComponentSnapshot;
  case?: SelectedComponentSnapshot;
  cooling?: SelectedComponentSnapshot;
  // New component types
  optical?: SelectedComponentSnapshot;
  fans?: SlotBasedComponentSnapshot[]; // Multiple case fans
  os?: SelectedComponentSnapshot;
}

// Validation error interface
export interface ValidationError {
  type: string; // e.g., 'cpu_motherboard'
  severity: 'error' | 'warning';
  message_en: string;
  message_sv: string;
  affectedComponents: string[]; // Component IDs
  timestamp?: Date;
}

// Power summary interface
export interface PowerSummary {
  totalDraw: number; // Watts
  psuWattage: number; // Watts
  headroom: number; // Watts
  percentage: number; // % of PSU capacity used
}

// Build service snapshot interface (stores selected build service details)
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

// Model attributes interface
export interface PCConfigurationAttributes {
  id: string;
  userId?: string; // Required for user configs, null for pre-configured PCs

  // Bilingual configuration name
  name_en?: string;
  name_sv?: string;

  // Component selections (JSON snapshot)
  components: ComponentsSnapshot;

  // Pricing
  totalPrice: number;
  currency: string;
  discountedPrice?: number; // Sale price for pre-configured PCs

  // Build service option
  includesBuildService: boolean;
  buildServiceCharge: number;
  buildServiceSnapshot?: BuildServiceSnapshot; // Snapshot of selected build service details

  // Validation status
  isValid: boolean;
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  powerSummary?: PowerSummary;

  // Status tracking
  status: ConfigurationStatus;
  orderId?: string; // FK to Orders when ordered

  // Pre-configured PC fields (admin-created PCs for sale)
  isPreConfigured: boolean;       // true = admin-created for sale
  isFeatured: boolean;            // Show on home page carousel
  tier?: PCTier;                  // Core/Pro/Ultra/Custom tier
  displayOrder: number;           // Sort order for display
  imageUrl?: string;              // Main product image URL (legacy, use first from imageUrls)
  imageUrls?: string[];           // Multiple product images (array of base64 or URLs)
  shortDescription_en?: string;   // Brief description for card display
  shortDescription_sv?: string;
  stock: number;                  // Inventory count for pre-configured PCs

  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes
interface PCConfigurationCreationAttributes extends Optional<
  PCConfigurationAttributes,
  'id' | 'userId' | 'name_en' | 'name_sv' | 'totalPrice' | 'includesBuildService' |
  'buildServiceCharge' | 'buildServiceSnapshot' | 'isValid' | 'validationErrors' | 'validationWarnings' |
  'powerSummary' | 'status' | 'orderId' | 'createdAt' | 'updatedAt' |
  'isPreConfigured' | 'isFeatured' | 'tier' | 'displayOrder' | 'imageUrl' | 'imageUrls' |
  'shortDescription_en' | 'shortDescription_sv' | 'discountedPrice' | 'stock'
> {}

// Model class
class PCConfiguration extends Model<
  PCConfigurationAttributes,
  PCConfigurationCreationAttributes
> implements PCConfigurationAttributes {

  public id!: string;
  public userId?: string;

  public name_en?: string;
  public name_sv?: string;

  public components!: ComponentsSnapshot;

  public totalPrice!: number;
  public currency!: string;
  public discountedPrice?: number;

  public includesBuildService!: boolean;
  public buildServiceCharge!: number;
  public buildServiceSnapshot?: BuildServiceSnapshot;

  public isValid!: boolean;
  public validationErrors!: ValidationError[];
  public validationWarnings!: ValidationError[];
  public powerSummary?: PowerSummary;

  public status!: ConfigurationStatus;
  public orderId?: string;

  // Pre-configured PC fields
  public isPreConfigured!: boolean;
  public isFeatured!: boolean;
  public tier?: PCTier;
  public displayOrder!: number;
  public imageUrl?: string;
  public imageUrls?: string[];
  public shortDescription_en?: string;
  public shortDescription_sv?: string;
  public stock!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to count selected components
  public getComponentCount(): number {
    let count = 0;
    if (this.components.cpu) count++;
    if (this.components.motherboard) count++;
    if (this.components.rams && this.components.rams.length > 0) count++;
    if (this.components.gpus && this.components.gpus.length > 0) count++;
    if (this.components.ssds && this.components.ssds.length > 0) count++;
    if (this.components.hdds && this.components.hdds.length > 0) count++;
    if (this.components.psu) count++;
    if (this.components.case) count++;
    if (this.components.cooling) count++;
    if (this.components.optical) count++;
    if (this.components.fans && this.components.fans.length > 0) count++;
    if (this.components.os) count++;
    return count;
  }

  // Helper method to check if configuration is complete (all required components)
  // Required: CPU, Motherboard, RAM, PSU, Case
  // Optional: GPU, SSD, HDD, Cooling, Optical, Fans, OS
  public isComplete(): boolean {
    const hasRam = this.components.rams && this.components.rams.length > 0;
    return !!(
      this.components.cpu &&
      this.components.motherboard &&
      hasRam &&
      this.components.psu &&
      this.components.case
    );
  }

  // Helper method to get configuration name in specified language
  public getName(language: 'en' | 'sv' = 'en'): string {
    const name = language === 'en' ? this.name_en : this.name_sv;
    return name || `Configuration ${this.id.substring(0, 8)}`;
  }
}

// Initialize model
PCConfiguration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // null for pre-configured PCs (admin-created)
    },

    // Bilingual configuration name
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name_sv: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Component selections (stored as JSON)
    components: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },

    // Pricing
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'SEK',
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },

    // Build service option
    includesBuildService: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    buildServiceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    buildServiceSnapshot: {
      type: DataTypes.JSON, // Snapshot of selected build service details
      allowNull: true,
    },

    // Validation status
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    validationErrors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    validationWarnings: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    powerSummary: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // Status tracking
    status: {
      type: DataTypes.ENUM('draft', 'saved', 'ordered'),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'saved', 'ordered']],
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    // Pre-configured PC fields (admin-created PCs for sale)
    isPreConfigured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tier: {
      type: DataTypes.ENUM('core', 'pro', 'ultra', 'custom'),
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    imageUrl: {
      type: DataTypes.TEXT, // Changed from STRING(500) to support base64 images
      allowNull: true,
    },
    imageUrls: {
      type: DataTypes.JSON, // Array of image URLs/base64 strings
      allowNull: true,
      defaultValue: [],
    },
    shortDescription_en: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    shortDescription_sv: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'PCConfigurations',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['userId', 'status'],
      },
      {
        fields: ['orderId'],
      },
      // Pre-configured PC indexes
      {
        fields: ['isPreConfigured'],
      },
      {
        fields: ['isFeatured'],
      },
      {
        fields: ['tier'],
      },
      {
        fields: ['isPreConfigured', 'isFeatured'],
      },
      {
        fields: ['isPreConfigured', 'displayOrder'],
      },
    ],
  }
);

export default PCConfiguration;
