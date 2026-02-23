import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../../config/database';

// Component type enum
export type ComponentType =
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'ssd'      // NVMe and SATA SSDs
  | 'hdd'      // Hard disk drives
  | 'psu'
  | 'case'
  | 'cooling'
  | 'optical'  // DVD/Blu-Ray drives
  | 'fan'      // Case fans
  | 'os';      // Operating system

// Type-specific specifications interfaces
export interface CPUSpecifications {
  socket: string; // e.g., 'AM5', 'LGA1700'
  tdp: number; // Thermal Design Power in watts
  cores: number;
  threads?: number;
  baseClock?: number; // GHz
  boostClock?: number; // GHz
}

export interface MotherboardSpecifications {
  socket: string; // e.g., 'AM5', 'LGA1700'
  ramType: string; // e.g., 'DDR5', 'DDR4'
  ramSlots: number; // Number of RAM slots for multiple RAM selection
  maxRamSpeed: number; // MHz
  maxRamCapacity?: number; // GB
  formFactor: string; // e.g., 'ATX', 'mATX', 'ITX'
  pciSlots: number; // Number of PCIe x16 slots for GPU selection
  nvmeSlots: number; // Number of M.2 NVMe slots for SSD selection
  sataSlots: number; // Number of SATA ports for HDD/SSD selection
  hasNVMe: boolean;
  chipset?: string;
}

export interface RAMSpecifications {
  ramType: string; // e.g., 'DDR5', 'DDR4'
  speed: number; // MHz
  capacity: number; // GB per stick
  latency?: string; // e.g., 'CL36'
  voltage?: number;
}

export interface GPUSpecifications {
  length: number; // mm
  width?: number; // mm (card thickness)
  tdp: number; // watts
  pciSlots: number; // Number of slots occupied
  interface?: string; // e.g., 'PCIe 4.0 x16'
  vram?: number; // GB
  vramType?: string; // e.g., 'GDDR6X'
}

export interface SSDSpecifications {
  ssdType: string; // 'NVMe', 'SATA'
  capacity: number; // GB
  interface: string; // e.g., 'M.2 PCIe 4.0', 'M.2 PCIe 5.0', 'SATA III'
  readSpeed?: number; // MB/s
  writeSpeed?: number; // MB/s
  formFactor: string; // e.g., 'M.2 2280', '2.5"'
}

export interface HDDSpecifications {
  capacity: number; // GB
  rpm: number; // e.g., 7200, 5400
  interface: string; // 'SATA III'
  cacheSize?: number; // MB
  formFactor: string; // e.g., '3.5"', '2.5"'
}

export interface OpticalSpecifications {
  driveType: string; // 'DVD-ROM', 'DVD-RW', 'Blu-Ray', 'Blu-Ray Writer'
  interface: string; // 'SATA', 'USB'
  readSpeed?: string; // e.g., '16x DVD', '6x BD'
  writeSpeed?: string; // e.g., '24x DVD', '4x BD'
  formFactor: string; // '5.25"', 'External'
}

export interface FanSpecifications {
  size: number; // mm (e.g., 120, 140, 200)
  rpm: { min: number; max: number };
  airflow?: number; // CFM
  noiseLevel?: number; // dBA
  connector: string; // '3-pin', '4-pin PWM', 'ARGB'
  rgb?: boolean;
}

export interface OSSpecifications {
  osType: string; // 'Windows 11 Home', 'Windows 11 Pro', 'Windows 10 Pro'
  architecture: string; // '64-bit'
  licenseType: string; // 'OEM', 'Retail', 'Volume'
  language?: string; // e.g., 'Multi-language'
}

export interface PSUSpecifications {
  wattage: number; // Watts
  efficiency: string; // e.g., '80+ Gold', '80+ Platinum'
  modular?: string; // 'Full', 'Semi', 'Non-modular'
  formFactor?: string; // 'ATX', 'SFX'
}

export interface CaseSpecifications {
  formFactor: string[]; // e.g., ['ATX', 'mATX', 'ITX']
  maxGpuLength: number; // mm
  maxCpuCoolerHeight?: number; // mm
  maxRadiatorSize?: number; // mm (max supported AIO radiator size)
  fanSlots?: number; // Total fan mounting positions
  has525Bay?: boolean; // Whether case has a 5.25" drive bay
  driveBays?: {
    '3.5inch'?: number;
    '2.5inch'?: number;
  };
  fans?: {
    included?: number;
    maxSupported?: number;
  };
}

export interface CoolingSpecifications {
  coolingType: string; // 'Air', 'AIO Liquid', 'Custom Loop'
  socket: string[]; // Compatible sockets e.g., ['AM5', 'LGA1700']
  height?: number; // mm (for air coolers)
  radiatorSize?: number; // mm (for liquid coolers, e.g., 240, 360)
  tdpRating?: number; // Watts of heat it can dissipate
  maxTdp?: number; // Max TDP this cooler can handle (watts)
}

// Union type for all specifications
export type ComponentSpecifications =
  | CPUSpecifications
  | MotherboardSpecifications
  | RAMSpecifications
  | GPUSpecifications
  | SSDSpecifications
  | HDDSpecifications
  | PSUSpecifications
  | CaseSpecifications
  | CoolingSpecifications
  | OpticalSpecifications
  | FanSpecifications
  | OSSpecifications;

// Model attributes interface
export interface PCComponentAttributes {
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

  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes (optional fields for creation)
interface PCComponentCreationAttributes extends Optional<
  PCComponentAttributes,
  'id' | 'desc_en' | 'desc_sv' | 'modelNumber' | 'imageUrl' | 'stock' |
  'isActive' | 'compatibilityNotes_en' | 'compatibilityNotes_sv' | 'distributorCost' | 'costCurrency' | 'createdAt' | 'updatedAt'
> {}

// Model class
class PCComponent extends Model<PCComponentAttributes, PCComponentCreationAttributes>
  implements PCComponentAttributes {

  public id!: string;
  public componentType!: ComponentType;

  public name_en!: string;
  public name_sv!: string;
  public desc_en?: string;
  public desc_sv?: string;

  public manufacturer!: string;
  public modelNumber?: string;
  public price!: number;
  public currency!: string;
  public imageUrl?: string;

  public specifications!: ComponentSpecifications;

  public stock!: number;
  public isActive!: boolean;

  public distributorCost?: number | null;
  public costCurrency?: string | null;

  public compatibilityNotes_en?: string;
  public compatibilityNotes_sv?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize model
PCComponent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    componentType: {
      type: DataTypes.ENUM(
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
        'os'
      ),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // Bilingual content
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    name_sv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    desc_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    desc_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Product info
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    modelNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'SEK',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    // Type-specific specifications (stored as JSON)
    specifications: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    // Inventory
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Distributor pricing
    distributorCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    costCurrency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'SEK',
    },

    // Optional compatibility notes
    compatibilityNotes_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    compatibilityNotes_sv: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'PCComponents',
    timestamps: true,
    indexes: [
      {
        fields: ['componentType'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['manufacturer'],
      },
      {
        fields: ['price'],
      },
      {
        fields: ['componentType', 'isActive'],
      },
    ],
  }
);

export default PCComponent;
