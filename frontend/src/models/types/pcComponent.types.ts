// PC Component Types and Specifications

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

// Components that support multiple selection based on motherboard slots
export type MultiSelectComponentType = 'ram' | 'gpu' | 'ssd' | 'hdd' | 'fan';

export type PriceType = 'fixed' | 'percentage';

export type RamType = 'DDR4' | 'DDR5';

export type SSDType = 'NVMe' | 'SATA';

export type OpticalType = 'DVD-ROM' | 'DVD-RW' | 'Blu-Ray' | 'Blu-Ray Writer';

export type CoolingType = 'Air' | 'AIO Liquid';

export type MotherboardFormFactor = 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';

export type PSUFormFactor = 'ATX' | 'SFX' | 'SFX-L';

// Component Specifications Interfaces

export interface CPUSpecifications {
  socket: string; // e.g., "AM5", "LGA1700"
  tdp: number; // Thermal Design Power in watts
  cores: number;
  threads: number;
  baseClock: number; // GHz
  boostClock: number; // GHz
  integratedGraphics?: boolean;
}

export interface MotherboardSpecifications {
  socket: string; // Must match CPU socket
  ramType: RamType; // DDR4 or DDR5
  ramSlots: number; // Number of RAM slots for multiple RAM selection
  maxRamSpeed: number; // MHz
  formFactor: MotherboardFormFactor;
  pciSlots: number; // Number of PCIe x16 slots for GPU selection
  hasNVMe: boolean; // Supports NVMe drives
  nvmeSlots: number; // Number of M.2 NVMe slots for SSD selection
  sataSlots: number; // Number of SATA ports for HDD/SSD selection
  chipset: string; // e.g., "Z790", "B650"
}

export interface RAMSpecifications {
  ramType: RamType; // DDR4 or DDR5
  speed: number; // MHz (e.g., 6000)
  capacity: number; // GB per stick
  sticks: number; // Number of sticks in kit (e.g., 2 for dual channel)
  latency: string; // CAS latency (e.g., "CL30")
}

export interface GPUSpecifications {
  vram: number; // VRAM in GB
  tdp: number; // Power consumption in watts
  length: number; // Physical length in mm
  width: number; // Slot width (e.g., 2.5 slots)
  pciSlots: number; // Number of slots occupied (usually 2-3)
  minPSU: number; // Minimum recommended PSU wattage
  chipset: string; // e.g., "RTX 4090", "RX 7900 XTX"
}

export interface SSDSpecifications {
  ssdType: SSDType; // NVMe or SATA
  capacity: number; // GB
  readSpeed?: number; // MB/s
  writeSpeed?: number; // MB/s
  formFactor: string; // e.g., "M.2 2280", "2.5 inch"
  interface: string; // e.g., "PCIe 4.0 x4", "PCIe 5.0 x4", "SATA III"
}

export interface HDDSpecifications {
  capacity: number; // GB
  rpm: number; // e.g., 7200, 5400
  interface: string; // "SATA III"
  cacheSize?: number; // MB
  formFactor: string; // e.g., "3.5 inch", "2.5 inch"
}

export interface PSUSpecifications {
  wattage: number; // Total wattage
  efficiency: string; // e.g., "80+ Gold", "80+ Platinum"
  modular: boolean; // Fully modular, semi-modular, or non-modular
  formFactor: PSUFormFactor;
}

export interface CaseSpecifications {
  formFactor: MotherboardFormFactor[]; // Supported motherboard sizes
  maxGpuLength: number; // Maximum GPU length in mm
  maxCpuCoolerHeight: number; // Maximum CPU cooler height in mm
  maxRadiatorSize?: number; // Maximum radiator size in mm (for AIO)
  psuFormFactor: PSUFormFactor; // Supported PSU form factor
  driveBays: {
    '2.5inch': number;
    '3.5inch': number;
  };
  fanSlots?: number; // Number of fan mounting positions
  has525Bay?: boolean; // Has 5.25" bay for optical drive
}

export interface CoolingSpecifications {
  coolingType: CoolingType; // Air or AIO Liquid
  socket: string[]; // Supported CPU sockets
  maxTdp: number; // Maximum TDP rating in watts
  height?: number; // Height in mm (for air coolers)
  radiatorSize?: number; // Radiator size in mm (for AIO)
  fanCount?: number; // Number of fans
}

export interface OpticalSpecifications {
  driveType: OpticalType; // DVD-ROM, DVD-RW, Blu-Ray, Blu-Ray Writer
  interface: string; // SATA, USB
  readSpeed?: string; // e.g., "16x DVD", "6x BD"
  writeSpeed?: string; // e.g., "24x DVD", "4x BD"
  formFactor: string; // "5.25 inch", "External"
}

export interface FanSpecifications {
  size: number; // mm (e.g., 120, 140, 200)
  rpm: { min: number; max: number };
  airflow?: number; // CFM
  noiseLevel?: number; // dBA
  connector: string; // "3-pin", "4-pin PWM", "ARGB"
  rgb?: boolean;
}

export interface OSSpecifications {
  osType: string; // "Windows 11 Home", "Windows 11 Pro", "Windows 10 Pro"
  architecture: string; // "64-bit"
  licenseType: string; // "OEM", "Retail", "Volume"
  language?: string; // e.g., "Multi-language"
}

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

// PC Component Interface

export interface PCComponent {
  id: string;
  componentType: ComponentType;
  name_en: string;
  name_sv: string;
  desc_en?: string;
  desc_sv?: string;
  manufacturer: string;
  modelNumber?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  specifications: ComponentSpecifications;
  stock: number;
  isActive: boolean;
  distributorCost?: number | null;
  costCurrency?: string | null;
  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Component with slot index for multi-select components
export interface PCComponentWithSlot extends PCComponent {
  slotIndex: number;
}

// SSD component with slot type info
export interface SSDComponentWithSlot extends PCComponentWithSlot {
  slotType: 'nvme' | 'sata';
}

// Component Filters

export interface ComponentFilters {
  componentType?: ComponentType;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  inStock?: boolean;
  // Type-specific filters
  socket?: string; // For CPUs, Motherboards, Cooling
  ramType?: RamType; // For RAM, Motherboards
  ssdType?: SSDType; // For SSDs
  minWattage?: number; // For PSUs
  maxWattage?: number; // For PSUs
}

// API Response Types

export interface PCComponentListResponse {
  success: boolean;
  data: {
    components: PCComponent[];
    total: number;
    page?: number;
    limit?: number;
  };
}

export interface PCComponentResponse {
  success: boolean;
  data: PCComponent;
}

export interface ManufacturersResponse {
  success: boolean;
  data: {
    manufacturers: string[];
  };
}

export interface ComponentTypeCountResponse {
  success: boolean;
  data: {
    counts: Record<ComponentType, number>;
  };
}

// Selected Components (for PC Builder) - supports multiple selections

export interface SelectedComponents {
  cpu?: PCComponent;
  motherboard?: PCComponent;
  rams?: PCComponentWithSlot[]; // Multiple RAM sticks
  gpus?: PCComponentWithSlot[]; // Multiple GPUs
  ssds?: SSDComponentWithSlot[]; // Multiple SSDs
  hdds?: PCComponentWithSlot[]; // Multiple HDDs
  psu?: PCComponent;
  case?: PCComponent;
  cooling?: PCComponent;
  optical?: PCComponent;
  fans?: PCComponentWithSlot[]; // Multiple case fans
  os?: PCComponent;
}

// Slot availability info based on motherboard
export interface SlotAvailability {
  ramSlots: { total: number; used: number; available: number };
  pciSlots: { total: number; used: number; available: number };
  nvmeSlots: { total: number; used: number; available: number };
  sataSlots: { total: number; used: number; available: number };
  fanSlots?: { total: number; used: number; available: number };
}

// Component Step Information (for PC Builder UI)

export interface ComponentStep {
  type: ComponentType;
  name: string;
  required: boolean;
  completed: boolean;
  multiSelect?: boolean; // Indicates if this step allows multiple selections
  maxSlots?: number; // Maximum number of items based on motherboard
}

// Create/Update DTOs

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
  compatibilityNotes_en?: string;
  compatibilityNotes_sv?: string;
  distributorCost?: number | null;
  costCurrency?: string | null;
}

export interface UpdatePCComponentDTO extends Partial<CreatePCComponentDTO> {
  id: string;
}

export interface UpdateStockDTO {
  componentId: string;
  quantity: number;
  operation?: 'set' | 'increment' | 'decrement';
}

// Low Stock Alert

export interface LowStockComponent {
  component: PCComponent;
  stockLevel: number;
  threshold: number;
}

// Helper function to check if a component type supports multiple selection
export const isMultiSelectType = (type: ComponentType): boolean => {
  return ['ram', 'gpu', 'ssd', 'hdd', 'fan'].includes(type);
};

// Fallback SVG images per component category (served from public/images/components/)
const COMPONENT_FALLBACK_IMAGES: Record<ComponentType, string> = {
  cpu: '/images/components/fallback-cpu.svg',
  motherboard: '/images/components/fallback-motherboard.svg',
  ram: '/images/components/fallback-ram.svg',
  gpu: '/images/components/fallback-gpu.svg',
  ssd: '/images/components/fallback-ssd.svg',
  hdd: '/images/components/fallback-hdd.svg',
  psu: '/images/components/fallback-psu.svg',
  case: '/images/components/fallback-case.svg',
  cooling: '/images/components/fallback-cooling.svg',
  optical: '/images/components/fallback-optical.svg',
  fan: '/images/components/fallback-fan.svg',
  os: '/images/components/fallback-os.svg',
};

// Resolve the image source for a PC component.
// Returns the component's imageUrl if it's a valid URL, otherwise the category fallback SVG.
export const getComponentImageSrc = (
  imageUrl: string | null | undefined,
  componentType: ComponentType,
): string => {
  if (imageUrl && !imageUrl.includes('example.com')) {
    return imageUrl;
  }
  return COMPONENT_FALLBACK_IMAGES[componentType] || '/images/components/fallback-cpu.svg';
};
