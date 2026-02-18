import PCComponent from '../models/sequelize/PCComponent';
import sequelize from '../config/database';

/**
 * Seed PC Components - Comprehensive Component Database
 * Creates 118 sample components across all 12 types with realistic specifications
 *
 * Component counts:
 *   - CPUs: 15
 *   - Motherboards: 14
 *   - RAM: 12
 *   - GPUs: 12
 *   - SSDs: 10
 *   - HDDs: 6
 *   - PSUs: 10
 *   - Cases: 10
 *   - Cooling: 10
 *   - Optical Drives: 4
 *   - Case Fans: 10
 *   - Operating Systems: 5
 */

const components = [
  {
    componentType: "cpu",
    name_en: "Intel Core i3-13100F",
    name_sv: "Intel Core i3-13100F",
    desc_en: "4-Core, 8-Thread Desktop Processor, No Integrated Graphics",
    desc_sv: "4-kärnig, 8-trådig skrivbordsprocessor, ingen integrerad grafik",
    manufacturer: "Intel",
    modelNumber: "BX8071513100F",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i3-13100f.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 58,
      cores: 4,
      threads: 8,
      baseClock: 3.4,
      boostClock: 4.5
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i5-13400F",
    name_sv: "Intel Core i5-13400F",
    desc_en: "10-Core, 16-Thread Desktop Processor",
    desc_sv: "10-kärnig, 16-trådig skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071513400F",
    price: 2199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i5-13400f.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 65,
      cores: 10,
      threads: 16,
      baseClock: 2.5,
      boostClock: 4.6
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i5-13600K",
    name_sv: "Intel Core i5-13600K",
    desc_en: "14-Core (6P+8E), 20-Thread Unlocked Desktop Processor",
    desc_sv: "14-kärnig (6P+8E), 20-trådig olåst skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071513600K",
    price: 3199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i5-13600k.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 125,
      cores: 14,
      threads: 20,
      baseClock: 3.5,
      boostClock: 5.1
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i5-14600K",
    name_sv: "Intel Core i5-14600K",
    desc_en: "14-Core (6P+8E), 20-Thread Unlocked Desktop Processor",
    desc_sv: "14-kärnig (6P+8E), 20-trådig olåst skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071514600K",
    price: 3499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i5-14600k.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 125,
      cores: 14,
      threads: 20,
      baseClock: 3.5,
      boostClock: 5.3
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i7-13700K",
    name_sv: "Intel Core i7-13700K",
    desc_en: "16-Core (8P+8E), 24-Thread Unlocked Desktop Processor",
    desc_sv: "16-kärnig (8P+8E), 24-trådig olåst skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071513700K",
    price: 4299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i7-13700k.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 125,
      cores: 16,
      threads: 24,
      baseClock: 3.4,
      boostClock: 5.4
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i7-14700K",
    name_sv: "Intel Core i7-14700K",
    desc_en: "20-Core (8P+12E), 28-Thread Unlocked Desktop Processor",
    desc_sv: "20-kärnig (8P+12E), 28-trådig olåst skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071514700K",
    price: 4699,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i7-14700k.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 125,
      cores: 20,
      threads: 28,
      baseClock: 3.4,
      boostClock: 5.6
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "Intel Core i9-14900K",
    name_sv: "Intel Core i9-14900K",
    desc_en: "24-Core (8P+16E), 32-Thread Unlocked Desktop Processor",
    desc_sv: "24-kärnig (8P+16E), 32-trådig olåst skrivbordsprocessor",
    manufacturer: "Intel",
    modelNumber: "BX8071514900K",
    price: 6499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/intel-i9-14900k.jpg",
    specifications: {
      socket: "LGA1700",
      tdp: 125,
      cores: 24,
      threads: 32,
      baseClock: 3.2,
      boostClock: 6
    },
    stock: 12,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 5 7500F",
    name_sv: "AMD Ryzen 5 7500F",
    desc_en: "6-Core, 12-Thread Desktop Processor, No Integrated Graphics",
    desc_sv: "6-kärnig, 12-trådig skrivbordsprocessor, ingen integrerad grafik",
    manufacturer: "AMD",
    modelNumber: "100-100000597WOF",
    price: 1899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen5-7500f.jpg",
    specifications: {
      socket: "AM5",
      tdp: 65,
      cores: 6,
      threads: 12,
      baseClock: 3.7,
      boostClock: 5
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 5 7600",
    name_sv: "AMD Ryzen 5 7600",
    desc_en: "6-Core, 12-Thread Desktop Processor with Radeon Graphics",
    desc_sv: "6-kärnig, 12-trådig skrivbordsprocessor med Radeon-grafik",
    manufacturer: "AMD",
    modelNumber: "100-100001015BOX",
    price: 2299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen5-7600.jpg",
    specifications: {
      socket: "AM5",
      tdp: 65,
      cores: 6,
      threads: 12,
      baseClock: 3.8,
      boostClock: 5.1
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 5 7600X",
    name_sv: "AMD Ryzen 5 7600X",
    desc_en: "6-Core, 12-Thread Unlocked Desktop Processor",
    desc_sv: "6-kärnig, 12-trådig olåst skrivbordsprocessor",
    manufacturer: "AMD",
    modelNumber: "100-100000593WOF",
    price: 2699,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen5-7600x.jpg",
    specifications: {
      socket: "AM5",
      tdp: 105,
      cores: 6,
      threads: 12,
      baseClock: 4.7,
      boostClock: 5.3
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 7 7700X",
    name_sv: "AMD Ryzen 7 7700X",
    desc_en: "8-Core, 16-Thread Unlocked Desktop Processor",
    desc_sv: "8-kärnig, 16-trådig olåst skrivbordsprocessor",
    manufacturer: "AMD",
    modelNumber: "100-100000591WOF",
    price: 3499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen7-7700x.jpg",
    specifications: {
      socket: "AM5",
      tdp: 105,
      cores: 8,
      threads: 16,
      baseClock: 4.5,
      boostClock: 5.4
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 7 7800X3D",
    name_sv: "AMD Ryzen 7 7800X3D",
    desc_en: "8-Core, 16-Thread Gaming Processor with 3D V-Cache",
    desc_sv: "8-kärnig, 16-trådig spelprocessor med 3D V-Cache",
    manufacturer: "AMD",
    modelNumber: "100-100000910WOF",
    price: 4199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen7-7800x3d.jpg",
    specifications: {
      socket: "AM5",
      tdp: 120,
      cores: 8,
      threads: 16,
      baseClock: 4.2,
      boostClock: 5
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 9 7900X",
    name_sv: "AMD Ryzen 9 7900X",
    desc_en: "12-Core, 24-Thread Unlocked Desktop Processor",
    desc_sv: "12-kärnig, 24-trådig olåst skrivbordsprocessor",
    manufacturer: "AMD",
    modelNumber: "100-100000589WOF",
    price: 4999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen9-7900x.jpg",
    specifications: {
      socket: "AM5",
      tdp: 170,
      cores: 12,
      threads: 24,
      baseClock: 4.7,
      boostClock: 5.6
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 9 7950X",
    name_sv: "AMD Ryzen 9 7950X",
    desc_en: "16-Core, 32-Thread Unlocked Desktop Processor",
    desc_sv: "16-kärnig, 32-trådig olåst skrivbordsprocessor",
    manufacturer: "AMD",
    modelNumber: "100-100000514WOF",
    price: 6299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen9-7950x.jpg",
    specifications: {
      socket: "AM5",
      tdp: 170,
      cores: 16,
      threads: 32,
      baseClock: 4.5,
      boostClock: 5.7
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "cpu",
    name_en: "AMD Ryzen 5 5600X",
    name_sv: "AMD Ryzen 5 5600X",
    desc_en: "6-Core, 12-Thread Desktop Processor, Socket AM4",
    desc_sv: "6-kärnig, 12-trådig skrivbordsprocessor, Socket AM4",
    manufacturer: "AMD",
    modelNumber: "100-100000065BOX",
    price: 1599,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/amd-ryzen5-5600x.jpg",
    specifications: {
      socket: "AM4",
      tdp: 65,
      cores: 6,
      threads: 12,
      baseClock: 3.7,
      boostClock: 4.6
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "ASUS ROG Strix Z790-E Gaming WiFi",
    name_sv: "ASUS ROG Strix Z790-E Gaming WiFi",
    desc_en: "Intel Z790 ATX Gaming Motherboard with PCIe 5.0, DDR5, WiFi 6E",
    desc_sv: "Intel Z790 ATX spelmoderkort med PCIe 5.0, DDR5, WiFi 6E",
    manufacturer: "ASUS",
    modelNumber: "ROG-STRIX-Z790-E-GAMING-WIFI",
    price: 4499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asus-rog-z790e.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 7200,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 3,
      nvmeSlots: 4,
      sataSlots: 6,
      hasNVMe: true,
      chipset: "Z790"
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "MSI MAG Z790 Tomahawk WiFi",
    name_sv: "MSI MAG Z790 Tomahawk WiFi",
    desc_en: "Intel Z790 ATX Motherboard with DDR5, WiFi 6E",
    desc_sv: "Intel Z790 ATX moderkort med DDR5, WiFi 6E",
    manufacturer: "MSI",
    modelNumber: "MAG-Z790-TOMAHAWK-WIFI",
    price: 3299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/msi-z790-tomahawk.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 7200,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 2,
      nvmeSlots: 4,
      sataSlots: 6,
      hasNVMe: true,
      chipset: "Z790"
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "Gigabyte Z790 Aorus Elite AX",
    name_sv: "Gigabyte Z790 Aorus Elite AX",
    desc_en: "Intel Z790 ATX Motherboard with DDR5, WiFi 6E",
    desc_sv: "Intel Z790 ATX moderkort med DDR5, WiFi 6E",
    manufacturer: "Gigabyte",
    modelNumber: "Z790-AORUS-ELITE-AX",
    price: 2999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gigabyte-z790-aorus.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 7600,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 2,
      nvmeSlots: 4,
      sataSlots: 6,
      hasNVMe: true,
      chipset: "Z790"
    },
    stock: 12,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "MSI MAG B760M Mortar WiFi",
    name_sv: "MSI MAG B760M Mortar WiFi",
    desc_en: "Intel B760 Micro-ATX Motherboard with DDR5, WiFi 6E",
    desc_sv: "Intel B760 Micro-ATX moderkort med DDR5, WiFi 6E",
    manufacturer: "MSI",
    modelNumber: "MAG-B760M-MORTAR-WIFI",
    price: 1899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/msi-b760m-mortar.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR5",
      ramSlots: 2,
      maxRamSpeed: 6800,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B760"
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "ASRock B760M Pro RS/D4",
    name_sv: "ASRock B760M Pro RS/D4",
    desc_en: "Intel B760 Micro-ATX Motherboard with DDR4 Support",
    desc_sv: "Intel B760 Micro-ATX moderkort med DDR4-stöd",
    manufacturer: "ASRock",
    modelNumber: "B760M-PRO-RS-D4",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asrock-b760m-pro-d4.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR4",
      ramSlots: 2,
      maxRamSpeed: 4800,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B760"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "Gigabyte B760M DS3H AX DDR4",
    name_sv: "Gigabyte B760M DS3H AX DDR4",
    desc_en: "Intel B760 Micro-ATX Motherboard with DDR4, WiFi",
    desc_sv: "Intel B760 Micro-ATX moderkort med DDR4, WiFi",
    manufacturer: "Gigabyte",
    modelNumber: "B760M-DS3H-AX-DDR4",
    price: 1199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gigabyte-b760m-ds3h-ddr4.jpg",
    specifications: {
      socket: "LGA1700",
      ramType: "DDR4",
      ramSlots: 2,
      maxRamSpeed: 5333,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B760"
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "ASUS ROG Strix X670E-E Gaming WiFi",
    name_sv: "ASUS ROG Strix X670E-E Gaming WiFi",
    desc_en: "AMD X670E ATX Gaming Motherboard with PCIe 5.0, DDR5, WiFi 6E",
    desc_sv: "AMD X670E ATX spelmoderkort med PCIe 5.0, DDR5, WiFi 6E",
    manufacturer: "ASUS",
    modelNumber: "ROG-STRIX-X670E-E-GAMING-WIFI",
    price: 4799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asus-rog-x670e.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 6400,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 3,
      nvmeSlots: 4,
      sataSlots: 6,
      hasNVMe: true,
      chipset: "X670E"
    },
    stock: 8,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "MSI MAG B650 Tomahawk WiFi",
    name_sv: "MSI MAG B650 Tomahawk WiFi",
    desc_en: "AMD B650 ATX Motherboard with DDR5, WiFi 6E",
    desc_sv: "AMD B650 ATX moderkort med DDR5, WiFi 6E",
    manufacturer: "MSI",
    modelNumber: "MAG-B650-TOMAHAWK-WIFI",
    price: 2499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/msi-b650-tomahawk.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 6000,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 2,
      nvmeSlots: 3,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B650"
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "Gigabyte B650 Aorus Elite AX",
    name_sv: "Gigabyte B650 Aorus Elite AX",
    desc_en: "AMD B650 ATX Motherboard with DDR5, WiFi 6E",
    desc_sv: "AMD B650 ATX moderkort med DDR5, WiFi 6E",
    manufacturer: "Gigabyte",
    modelNumber: "B650-AORUS-ELITE-AX",
    price: 2299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gigabyte-b650-aorus.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 4,
      maxRamSpeed: 6400,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 2,
      nvmeSlots: 3,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B650"
    },
    stock: 14,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "ASRock B650M PG Riptide",
    name_sv: "ASRock B650M PG Riptide",
    desc_en: "AMD B650 Micro-ATX Motherboard with DDR5",
    desc_sv: "AMD B650 Micro-ATX moderkort med DDR5",
    manufacturer: "ASRock",
    modelNumber: "B650M-PG-RIPTIDE",
    price: 1599,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asrock-b650m-riptide.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 2,
      maxRamSpeed: 6200,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B650"
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "MSI PRO B650M-A WiFi",
    name_sv: "MSI PRO B650M-A WiFi",
    desc_en: "AMD B650 Micro-ATX Motherboard with DDR5, WiFi",
    desc_sv: "AMD B650 Micro-ATX moderkort med DDR5, WiFi",
    manufacturer: "MSI",
    modelNumber: "PRO-B650M-A-WIFI",
    price: 1499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/msi-b650m-a-wifi.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 2,
      maxRamSpeed: 6000,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B650"
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "ASUS ROG Strix B650E-I Gaming WiFi",
    name_sv: "ASUS ROG Strix B650E-I Gaming WiFi",
    desc_en: "AMD B650E Mini-ITX Gaming Motherboard with DDR5, WiFi 6E",
    desc_sv: "AMD B650E Mini-ITX spelmoderkort med DDR5, WiFi 6E",
    manufacturer: "ASUS",
    modelNumber: "ROG-STRIX-B650E-I-GAMING-WIFI",
    price: 2999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asus-rog-b650e-itx.jpg",
    specifications: {
      socket: "AM5",
      ramType: "DDR5",
      ramSlots: 2,
      maxRamSpeed: 6400,
      maxRamCapacity: 64,
      formFactor: "Mini-ITX",
      pciSlots: 1,
      nvmeSlots: 2,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B650E"
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "MSI B550-A PRO",
    name_sv: "MSI B550-A PRO",
    desc_en: "AMD B550 ATX Motherboard with DDR4, PCIe 4.0",
    desc_sv: "AMD B550 ATX moderkort med DDR4, PCIe 4.0",
    manufacturer: "MSI",
    modelNumber: "B550-A-PRO",
    price: 1199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/msi-b550a-pro.jpg",
    specifications: {
      socket: "AM4",
      ramType: "DDR4",
      ramSlots: 4,
      maxRamSpeed: 4400,
      maxRamCapacity: 128,
      formFactor: "ATX",
      pciSlots: 2,
      nvmeSlots: 2,
      sataSlots: 6,
      hasNVMe: true,
      chipset: "B550"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "motherboard",
    name_en: "Gigabyte B550M DS3H",
    name_sv: "Gigabyte B550M DS3H",
    desc_en: "AMD B550 Micro-ATX Motherboard with DDR4",
    desc_sv: "AMD B550 Micro-ATX moderkort med DDR4",
    manufacturer: "Gigabyte",
    modelNumber: "B550M-DS3H",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gigabyte-b550m-ds3h.jpg",
    specifications: {
      socket: "AM4",
      ramType: "DDR4",
      ramSlots: 2,
      maxRamSpeed: 4000,
      maxRamCapacity: 64,
      formFactor: "Micro-ATX",
      pciSlots: 1,
      nvmeSlots: 1,
      sataSlots: 4,
      hasNVMe: true,
      chipset: "B550"
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Corsair Vengeance DDR5-5600 16GB (2x8GB)",
    name_sv: "Corsair Vengeance DDR5-5600 16GB (2x8GB)",
    desc_en: "DDR5 RAM Kit, 5600MHz CL36, 1.25V",
    desc_sv: "DDR5 RAM-kit, 5600MHz CL36, 1.25V",
    manufacturer: "Corsair",
    modelNumber: "CMK16GX5M2B5600C36",
    price: 749,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-vengeance-ddr5-16gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 5600,
      capacity: 8,
      sticks: 2,
      latency: "CL36",
      voltage: 1.25
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Corsair Vengeance DDR5-5600 32GB (2x16GB)",
    name_sv: "Corsair Vengeance DDR5-5600 32GB (2x16GB)",
    desc_en: "DDR5 RAM Kit, 5600MHz CL36, 1.25V",
    desc_sv: "DDR5 RAM-kit, 5600MHz CL36, 1.25V",
    manufacturer: "Corsair",
    modelNumber: "CMK32GX5M2B5600C36",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-vengeance-ddr5-32gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 5600,
      capacity: 16,
      sticks: 2,
      latency: "CL36",
      voltage: 1.25
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "G.Skill Trident Z5 DDR5-6000 32GB (2x16GB)",
    name_sv: "G.Skill Trident Z5 DDR5-6000 32GB (2x16GB)",
    desc_en: "DDR5 RAM Kit, 6000MHz CL30, 1.35V",
    desc_sv: "DDR5 RAM-kit, 6000MHz CL30, 1.35V",
    manufacturer: "G.Skill",
    modelNumber: "F5-6000J3038F16GX2-TZ5RK",
    price: 1799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gskill-trident-z5-32gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 6000,
      capacity: 16,
      sticks: 2,
      latency: "CL30",
      voltage: 1.35
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "G.Skill Trident Z5 DDR5-6000 64GB (2x32GB)",
    name_sv: "G.Skill Trident Z5 DDR5-6000 64GB (2x32GB)",
    desc_en: "DDR5 RAM Kit, 6000MHz CL30, 1.40V",
    desc_sv: "DDR5 RAM-kit, 6000MHz CL30, 1.40V",
    manufacturer: "G.Skill",
    modelNumber: "F5-6000J3038F32GX2-TZ5RK",
    price: 3299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gskill-trident-z5-64gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 6000,
      capacity: 32,
      sticks: 2,
      latency: "CL30",
      voltage: 1.4
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Kingston Fury Beast DDR5-5200 16GB (2x8GB)",
    name_sv: "Kingston Fury Beast DDR5-5200 16GB (2x8GB)",
    desc_en: "DDR5 RAM Kit, 5200MHz CL40, 1.25V",
    desc_sv: "DDR5 RAM-kit, 5200MHz CL40, 1.25V",
    manufacturer: "Kingston",
    modelNumber: "KF552C40BBK2-16",
    price: 649,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/kingston-fury-ddr5-16gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 5200,
      capacity: 8,
      sticks: 2,
      latency: "CL40",
      voltage: 1.25
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Corsair Dominator Platinum DDR5-6400 32GB (2x16GB)",
    name_sv: "Corsair Dominator Platinum DDR5-6400 32GB (2x16GB)",
    desc_en: "DDR5 RAM Kit, 6400MHz CL32, 1.40V",
    desc_sv: "DDR5 RAM-kit, 6400MHz CL32, 1.40V",
    manufacturer: "Corsair",
    modelNumber: "CMT32GX5M2X6400C32",
    price: 2199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-dominator-ddr5-32gb.jpg",
    specifications: {
      ramType: "DDR5",
      speed: 6400,
      capacity: 16,
      sticks: 2,
      latency: "CL32",
      voltage: 1.4
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Corsair Vengeance LPX DDR4-3200 16GB (2x8GB)",
    name_sv: "Corsair Vengeance LPX DDR4-3200 16GB (2x8GB)",
    desc_en: "DDR4 RAM Kit, 3200MHz CL16, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3200MHz CL16, 1.35V",
    manufacturer: "Corsair",
    modelNumber: "CMK16GX4M2E3200C16",
    price: 449,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-lpx-ddr4-16gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3200,
      capacity: 8,
      sticks: 2,
      latency: "CL16",
      voltage: 1.35
    },
    stock: 50,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Corsair Vengeance LPX DDR4-3200 32GB (2x16GB)",
    name_sv: "Corsair Vengeance LPX DDR4-3200 32GB (2x16GB)",
    desc_en: "DDR4 RAM Kit, 3200MHz CL16, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3200MHz CL16, 1.35V",
    manufacturer: "Corsair",
    modelNumber: "CMK32GX4M2E3200C16",
    price: 849,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-lpx-ddr4-32gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3200,
      capacity: 16,
      sticks: 2,
      latency: "CL16",
      voltage: 1.35
    },
    stock: 45,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "G.Skill Ripjaws V DDR4-3600 32GB (2x16GB)",
    name_sv: "G.Skill Ripjaws V DDR4-3600 32GB (2x16GB)",
    desc_en: "DDR4 RAM Kit, 3600MHz CL18, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3600MHz CL18, 1.35V",
    manufacturer: "G.Skill",
    modelNumber: "F4-3600C18D-32GVK",
    price: 999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/gskill-ripjaws-ddr4-32gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3600,
      capacity: 16,
      sticks: 2,
      latency: "CL18",
      voltage: 1.35
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Kingston Fury Beast DDR4-3200 16GB (2x8GB)",
    name_sv: "Kingston Fury Beast DDR4-3200 16GB (2x8GB)",
    desc_en: "DDR4 RAM Kit, 3200MHz CL16, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3200MHz CL16, 1.35V",
    manufacturer: "Kingston",
    modelNumber: "KF432C16BBK2-16",
    price: 399,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/kingston-fury-ddr4-16gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3200,
      capacity: 8,
      sticks: 2,
      latency: "CL16",
      voltage: 1.35
    },
    stock: 45,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Kingston Fury Beast DDR4-3200 32GB (2x16GB)",
    name_sv: "Kingston Fury Beast DDR4-3200 32GB (2x16GB)",
    desc_en: "DDR4 RAM Kit, 3200MHz CL16, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3200MHz CL16, 1.35V",
    manufacturer: "Kingston",
    modelNumber: "KF432C16BBK2-32",
    price: 799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/kingston-fury-ddr4-32gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3200,
      capacity: 16,
      sticks: 2,
      latency: "CL16",
      voltage: 1.35
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "ram",
    name_en: "Crucial Ballistix DDR4-3600 16GB (2x8GB)",
    name_sv: "Crucial Ballistix DDR4-3600 16GB (2x8GB)",
    desc_en: "DDR4 RAM Kit, 3600MHz CL16, 1.35V",
    desc_sv: "DDR4 RAM-kit, 3600MHz CL16, 1.35V",
    manufacturer: "Crucial",
    modelNumber: "BL2K8G36C16U4B",
    price: 549,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/crucial-ballistix-ddr4-16gb.jpg",
    specifications: {
      ramType: "DDR4",
      speed: 3600,
      capacity: 8,
      sticks: 2,
      latency: "CL16",
      voltage: 1.35
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4060",
    name_sv: "NVIDIA GeForce RTX 4060",
    desc_en: "8GB GDDR6, PCIe 4.0, 240mm Length",
    desc_sv: "8GB GDDR6, PCIe 4.0, 240mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4060-8G",
    price: 3499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4060.jpg",
    specifications: {
      length: 240,
      tdp: 150,
      pciSlots: 2,
      vram: 8,
      vramType: "GDDR6",
      minPSU: 550,
      chipset: "RTX 4060"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4060 Ti",
    name_sv: "NVIDIA GeForce RTX 4060 Ti",
    desc_en: "8GB GDDR6, PCIe 4.0, 267mm Length",
    desc_sv: "8GB GDDR6, PCIe 4.0, 267mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4060TI-8G",
    price: 4499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4060ti.jpg",
    specifications: {
      length: 267,
      tdp: 160,
      pciSlots: 2,
      vram: 8,
      vramType: "GDDR6",
      minPSU: 550,
      chipset: "RTX 4060 Ti"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4070",
    name_sv: "NVIDIA GeForce RTX 4070",
    desc_en: "12GB GDDR6X, PCIe 4.0, 261mm Length",
    desc_sv: "12GB GDDR6X, PCIe 4.0, 261mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4070-12G",
    price: 5999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4070.jpg",
    specifications: {
      length: 261,
      tdp: 200,
      pciSlots: 2.5,
      vram: 12,
      vramType: "GDDR6X",
      minPSU: 650,
      chipset: "RTX 4070"
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4070 Ti Super",
    name_sv: "NVIDIA GeForce RTX 4070 Ti Super",
    desc_en: "16GB GDDR6X, PCIe 4.0, 302mm Length",
    desc_sv: "16GB GDDR6X, PCIe 4.0, 302mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4070TISUPER-16G",
    price: 8499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4070ti-super.jpg",
    specifications: {
      length: 302,
      tdp: 285,
      pciSlots: 3,
      vram: 16,
      vramType: "GDDR6X",
      minPSU: 700,
      chipset: "RTX 4070 Ti Super"
    },
    stock: 12,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4080 Super",
    name_sv: "NVIDIA GeForce RTX 4080 Super",
    desc_en: "16GB GDDR6X, PCIe 4.0, 336mm Length",
    desc_sv: "16GB GDDR6X, PCIe 4.0, 336mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4080SUPER-16G",
    price: 11999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4080-super.jpg",
    specifications: {
      length: 336,
      tdp: 320,
      pciSlots: 3,
      vram: 16,
      vramType: "GDDR6X",
      minPSU: 750,
      chipset: "RTX 4080 Super"
    },
    stock: 8,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "NVIDIA GeForce RTX 4090",
    name_sv: "NVIDIA GeForce RTX 4090",
    desc_en: "24GB GDDR6X, PCIe 4.0, 336mm Length",
    desc_sv: "24GB GDDR6X, PCIe 4.0, 336mm längd",
    manufacturer: "NVIDIA",
    modelNumber: "RTX4090-24G",
    price: 19999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rtx-4090.jpg",
    specifications: {
      length: 336,
      tdp: 450,
      pciSlots: 3.5,
      vram: 24,
      vramType: "GDDR6X",
      minPSU: 850,
      chipset: "RTX 4090"
    },
    stock: 5,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7600",
    name_sv: "AMD Radeon RX 7600",
    desc_en: "8GB GDDR6, PCIe 4.0, 204mm Length",
    desc_sv: "8GB GDDR6, PCIe 4.0, 204mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7600-8G",
    price: 2999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7600.jpg",
    specifications: {
      length: 204,
      tdp: 165,
      pciSlots: 2,
      vram: 8,
      vramType: "GDDR6",
      minPSU: 550,
      chipset: "RX 7600"
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7700 XT",
    name_sv: "AMD Radeon RX 7700 XT",
    desc_en: "12GB GDDR6, PCIe 4.0, 267mm Length",
    desc_sv: "12GB GDDR6, PCIe 4.0, 267mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7700XT-12G",
    price: 4499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7700xt.jpg",
    specifications: {
      length: 267,
      tdp: 245,
      pciSlots: 2.5,
      vram: 12,
      vramType: "GDDR6",
      minPSU: 650,
      chipset: "RX 7700 XT"
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7800 XT",
    name_sv: "AMD Radeon RX 7800 XT",
    desc_en: "16GB GDDR6, PCIe 4.0, 267mm Length",
    desc_sv: "16GB GDDR6, PCIe 4.0, 267mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7800XT-16G",
    price: 5499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7800xt.jpg",
    specifications: {
      length: 267,
      tdp: 263,
      pciSlots: 2.5,
      vram: 16,
      vramType: "GDDR6",
      minPSU: 700,
      chipset: "RX 7800 XT"
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7900 GRE",
    name_sv: "AMD Radeon RX 7900 GRE",
    desc_en: "16GB GDDR6, PCIe 4.0, 276mm Length",
    desc_sv: "16GB GDDR6, PCIe 4.0, 276mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7900GRE-16G",
    price: 6499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7900gre.jpg",
    specifications: {
      length: 276,
      tdp: 260,
      pciSlots: 2.5,
      vram: 16,
      vramType: "GDDR6",
      minPSU: 700,
      chipset: "RX 7900 GRE"
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7900 XT",
    name_sv: "AMD Radeon RX 7900 XT",
    desc_en: "20GB GDDR6, PCIe 4.0, 276mm Length",
    desc_sv: "20GB GDDR6, PCIe 4.0, 276mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7900XT-20G",
    price: 8999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7900xt.jpg",
    specifications: {
      length: 276,
      tdp: 315,
      pciSlots: 3,
      vram: 20,
      vramType: "GDDR6",
      minPSU: 750,
      chipset: "RX 7900 XT"
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "gpu",
    name_en: "AMD Radeon RX 7900 XTX",
    name_sv: "AMD Radeon RX 7900 XTX",
    desc_en: "24GB GDDR6, PCIe 4.0, 287mm Length",
    desc_sv: "24GB GDDR6, PCIe 4.0, 287mm längd",
    manufacturer: "AMD",
    modelNumber: "RX7900XTX-24G",
    price: 10999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/rx-7900xtx.jpg",
    specifications: {
      length: 287,
      tdp: 355,
      pciSlots: 3,
      vram: 24,
      vramType: "GDDR6",
      minPSU: 800,
      chipset: "RX 7900 XTX"
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Samsung 990 Pro 500GB NVMe SSD",
    name_sv: "Samsung 990 Pro 500GB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    manufacturer: "Samsung",
    modelNumber: "MZ-V9P500BW",
    price: 799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/samsung-990pro-500gb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 500,
      interface: "PCIe 4.0 x4",
      readSpeed: 7450,
      writeSpeed: 6900,
      formFactor: "M.2 2280"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Samsung 990 Pro 1TB NVMe SSD",
    name_sv: "Samsung 990 Pro 1TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    manufacturer: "Samsung",
    modelNumber: "MZ-V9P1T0BW",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/samsung-990pro-1tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 1000,
      interface: "PCIe 4.0 x4",
      readSpeed: 7450,
      writeSpeed: 6900,
      formFactor: "M.2 2280"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Samsung 990 Pro 2TB NVMe SSD",
    name_sv: "Samsung 990 Pro 2TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 7450/6900 MB/s",
    manufacturer: "Samsung",
    modelNumber: "MZ-V9P2T0BW",
    price: 2199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/samsung-990pro-2tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 2000,
      interface: "PCIe 4.0 x4",
      readSpeed: 7450,
      writeSpeed: 6900,
      formFactor: "M.2 2280"
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "WD Black SN850X 1TB NVMe SSD",
    name_sv: "WD Black SN850X 1TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 7300/6300 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 7300/6300 MB/s",
    manufacturer: "Western Digital",
    modelNumber: "WDS100T2X0E",
    price: 1199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/wd-sn850x-1tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 1000,
      interface: "PCIe 4.0 x4",
      readSpeed: 7300,
      writeSpeed: 6300,
      formFactor: "M.2 2280"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "WD Black SN850X 2TB NVMe SSD",
    name_sv: "WD Black SN850X 2TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 7300/6300 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 7300/6300 MB/s",
    manufacturer: "Western Digital",
    modelNumber: "WDS200T2X0E",
    price: 1999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/wd-sn850x-2tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 2000,
      interface: "PCIe 4.0 x4",
      readSpeed: 7300,
      writeSpeed: 6300,
      formFactor: "M.2 2280"
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Crucial P5 Plus 1TB NVMe SSD",
    name_sv: "Crucial P5 Plus 1TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 6600/5000 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 6600/5000 MB/s",
    manufacturer: "Crucial",
    modelNumber: "CT1000P5PSSD8",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/crucial-p5plus-1tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 1000,
      interface: "PCIe 4.0 x4",
      readSpeed: 6600,
      writeSpeed: 5000,
      formFactor: "M.2 2280"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Kingston NV2 1TB NVMe SSD",
    name_sv: "Kingston NV2 1TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 3500/2100 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 3500/2100 MB/s",
    manufacturer: "Kingston",
    modelNumber: "SNV2S/1000G",
    price: 599,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/kingston-nv2-1tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 1000,
      interface: "PCIe 4.0 x4",
      readSpeed: 3500,
      writeSpeed: 2100,
      formFactor: "M.2 2280"
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Kingston NV2 2TB NVMe SSD",
    name_sv: "Kingston NV2 2TB NVMe SSD",
    desc_en: "M.2 2280 PCIe 4.0 NVMe SSD, 3500/2100 MB/s",
    desc_sv: "M.2 2280 PCIe 4.0 NVMe SSD, 3500/2100 MB/s",
    manufacturer: "Kingston",
    modelNumber: "SNV2S/2000G",
    price: 1099,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/kingston-nv2-2tb.jpg",
    specifications: {
      ssdType: "NVMe",
      capacity: 2000,
      interface: "PCIe 4.0 x4",
      readSpeed: 3500,
      writeSpeed: 2100,
      formFactor: "M.2 2280"
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Samsung 870 EVO 1TB SATA SSD",
    name_sv: "Samsung 870 EVO 1TB SATA SSD",
    desc_en: "2.5\" SATA III SSD, 560/530 MB/s",
    desc_sv: "2.5\" SATA III SSD, 560/530 MB/s",
    manufacturer: "Samsung",
    modelNumber: "MZ-77E1T0B/EU",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/samsung-870evo-1tb.jpg",
    specifications: {
      ssdType: "SATA",
      capacity: 1000,
      interface: "SATA III",
      readSpeed: 560,
      writeSpeed: 530,
      formFactor: "2.5 inch"
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "ssd",
    name_en: "Crucial MX500 1TB SATA SSD",
    name_sv: "Crucial MX500 1TB SATA SSD",
    desc_en: "2.5\" SATA III SSD, 560/510 MB/s",
    desc_sv: "2.5\" SATA III SSD, 560/510 MB/s",
    manufacturer: "Crucial",
    modelNumber: "CT1000MX500SSD1",
    price: 799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/crucial-mx500-1tb.jpg",
    specifications: {
      ssdType: "SATA",
      capacity: 1000,
      interface: "SATA III",
      readSpeed: 560,
      writeSpeed: 510,
      formFactor: "2.5 inch"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "Seagate Barracuda 1TB HDD",
    name_sv: "Seagate Barracuda 1TB HDD",
    desc_en: "3.5\" 7200RPM SATA III Hard Drive",
    desc_sv: "3.5\" 7200RPM SATA III hårddisk",
    manufacturer: "Seagate",
    modelNumber: "ST1000DM010",
    price: 499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seagate-barracuda-1tb.jpg",
    specifications: {
      capacity: 1000,
      rpm: 7200,
      interface: "SATA III",
      cacheSize: 64,
      formFactor: "3.5 inch"
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "Seagate Barracuda 2TB HDD",
    name_sv: "Seagate Barracuda 2TB HDD",
    desc_en: "3.5\" 7200RPM SATA III Hard Drive",
    desc_sv: "3.5\" 7200RPM SATA III hårddisk",
    manufacturer: "Seagate",
    modelNumber: "ST2000DM008",
    price: 649,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seagate-barracuda-2tb.jpg",
    specifications: {
      capacity: 2000,
      rpm: 7200,
      interface: "SATA III",
      cacheSize: 256,
      formFactor: "3.5 inch"
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "Seagate Barracuda 4TB HDD",
    name_sv: "Seagate Barracuda 4TB HDD",
    desc_en: "3.5\" 5400RPM SATA III Hard Drive",
    desc_sv: "3.5\" 5400RPM SATA III hårddisk",
    manufacturer: "Seagate",
    modelNumber: "ST4000DM004",
    price: 999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seagate-barracuda-4tb.jpg",
    specifications: {
      capacity: 4000,
      rpm: 5400,
      interface: "SATA III",
      cacheSize: 256,
      formFactor: "3.5 inch"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "WD Blue 1TB HDD",
    name_sv: "WD Blue 1TB HDD",
    desc_en: "3.5\" 7200RPM SATA III Hard Drive",
    desc_sv: "3.5\" 7200RPM SATA III hårddisk",
    manufacturer: "Western Digital",
    modelNumber: "WD10EZEX",
    price: 479,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/wd-blue-1tb.jpg",
    specifications: {
      capacity: 1000,
      rpm: 7200,
      interface: "SATA III",
      cacheSize: 64,
      formFactor: "3.5 inch"
    },
    stock: 38,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "WD Blue 2TB HDD",
    name_sv: "WD Blue 2TB HDD",
    desc_en: "3.5\" 5400RPM SATA III Hard Drive",
    desc_sv: "3.5\" 5400RPM SATA III hårddisk",
    manufacturer: "Western Digital",
    modelNumber: "WD20EZAZ",
    price: 599,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/wd-blue-2tb.jpg",
    specifications: {
      capacity: 2000,
      rpm: 5400,
      interface: "SATA III",
      cacheSize: 128,
      formFactor: "3.5 inch"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "hdd",
    name_en: "Toshiba P300 2TB HDD",
    name_sv: "Toshiba P300 2TB HDD",
    desc_en: "3.5\" 7200RPM SATA III Hard Drive",
    desc_sv: "3.5\" 7200RPM SATA III hårddisk",
    manufacturer: "Toshiba",
    modelNumber: "HDWD120UZSVA",
    price: 579,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/toshiba-p300-2tb.jpg",
    specifications: {
      capacity: 2000,
      rpm: 7200,
      interface: "SATA III",
      cacheSize: 64,
      formFactor: "3.5 inch"
    },
    stock: 32,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair RM550e 550W 80+ Gold",
    name_sv: "Corsair RM550e 550W 80+ Gold",
    desc_en: "550W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "550W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020248-EU",
    price: 799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-rm550e.jpg",
    specifications: {
      wattage: 550,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair RM650e 650W 80+ Gold",
    name_sv: "Corsair RM650e 650W 80+ Gold",
    desc_en: "650W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "650W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020249-EU",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-rm650e.jpg",
    specifications: {
      wattage: 650,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair RM750e 750W 80+ Gold",
    name_sv: "Corsair RM750e 750W 80+ Gold",
    desc_en: "750W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "750W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020250-EU",
    price: 999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-rm750e.jpg",
    specifications: {
      wattage: 750,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair RM850x 850W 80+ Gold",
    name_sv: "Corsair RM850x 850W 80+ Gold",
    desc_en: "850W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "850W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020200-EU",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-rm850x.jpg",
    specifications: {
      wattage: 850,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair RM1000x 1000W 80+ Gold",
    name_sv: "Corsair RM1000x 1000W 80+ Gold",
    desc_en: "1000W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "1000W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020201-EU",
    price: 1699,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-rm1000x.jpg",
    specifications: {
      wattage: 1000,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Seasonic Focus GX-650 650W 80+ Gold",
    name_sv: "Seasonic Focus GX-650 650W 80+ Gold",
    desc_en: "650W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "650W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Seasonic",
    modelNumber: "FOCUS-GX-650",
    price: 949,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seasonic-gx650.jpg",
    specifications: {
      wattage: 650,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Seasonic Focus GX-750 750W 80+ Gold",
    name_sv: "Seasonic Focus GX-750 750W 80+ Gold",
    desc_en: "750W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "750W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Seasonic",
    modelNumber: "FOCUS-GX-750",
    price: 1099,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seasonic-gx750.jpg",
    specifications: {
      wattage: 750,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Seasonic Focus GX-850 850W 80+ Gold",
    name_sv: "Seasonic Focus GX-850 850W 80+ Gold",
    desc_en: "850W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "850W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "Seasonic",
    modelNumber: "FOCUS-GX-850",
    price: 1399,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/seasonic-gx850.jpg",
    specifications: {
      wattage: 850,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "EVGA SuperNOVA 850 G7 850W 80+ Gold",
    name_sv: "EVGA SuperNOVA 850 G7 850W 80+ Gold",
    desc_en: "850W 80+ Gold Fully Modular ATX Power Supply",
    desc_sv: "850W 80+ Gold helt modulärt ATX nätaggregat",
    manufacturer: "EVGA",
    modelNumber: "220-G7-0850-X1",
    price: 1299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/evga-supernova-850g7.jpg",
    specifications: {
      wattage: 850,
      efficiency: "80+ Gold",
      modular: true,
      formFactor: "ATX"
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "psu",
    name_en: "Corsair HX1500i 1500W 80+ Platinum",
    name_sv: "Corsair HX1500i 1500W 80+ Platinum",
    desc_en: "1500W 80+ Platinum Fully Modular ATX Power Supply",
    desc_sv: "1500W 80+ Platinum helt modulärt ATX nätaggregat",
    manufacturer: "Corsair",
    modelNumber: "CP-9020215-EU",
    price: 3499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-hx1500i.jpg",
    specifications: {
      wattage: 1500,
      efficiency: "80+ Platinum",
      modular: true,
      formFactor: "ATX"
    },
    stock: 8,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "NZXT H5 Flow",
    name_sv: "NZXT H5 Flow",
    desc_en: "ATX Mid Tower Case, Max GPU 365mm, Max Cooler 165mm",
    desc_sv: "ATX mellantorn chassi, Max GPU 365mm, Max kylare 165mm",
    manufacturer: "NZXT",
    modelNumber: "CC-H51FB-01",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/nzxt-h5-flow.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 365,
      maxCpuCoolerHeight: 165,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 2,
        "2.5inch": 2
      },
      fanSlots: 6,
      has525Bay: false
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Corsair 4000D Airflow",
    name_sv: "Corsair 4000D Airflow",
    desc_en: "ATX Mid Tower Case, Max GPU 360mm, Max Cooler 170mm",
    desc_sv: "ATX mellantorn chassi, Max GPU 360mm, Max kylare 170mm",
    manufacturer: "Corsair",
    modelNumber: "CC-9011201-WW",
    price: 999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-4000d-airflow.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 360,
      maxCpuCoolerHeight: 170,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 2,
        "2.5inch": 2
      },
      fanSlots: 6,
      has525Bay: false
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Fractal Design Meshify 2",
    name_sv: "Fractal Design Meshify 2",
    desc_en: "ATX Mid Tower Case, Max GPU 467mm, Max Cooler 185mm",
    desc_sv: "ATX mellantorn chassi, Max GPU 467mm, Max kylare 185mm",
    manufacturer: "Fractal Design",
    modelNumber: "FD-C-MES2A-02",
    price: 1499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/fractal-meshify2.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 467,
      maxCpuCoolerHeight: 185,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 3,
        "2.5inch": 3
      },
      fanSlots: 9,
      has525Bay: false
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Lian Li Lancool III",
    name_sv: "Lian Li Lancool III",
    desc_en: "ATX Mid Tower Case, Max GPU 435mm, Max Cooler 187mm",
    desc_sv: "ATX mellantorn chassi, Max GPU 435mm, Max kylare 187mm",
    manufacturer: "Lian Li",
    modelNumber: "LANCOOL-III",
    price: 1199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/lianli-lancool3.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 435,
      maxCpuCoolerHeight: 187,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 2,
        "2.5inch": 4
      },
      fanSlots: 10,
      has525Bay: false
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "be quiet! Pure Base 500DX",
    name_sv: "be quiet! Pure Base 500DX",
    desc_en: "ATX Mid Tower Case, Max GPU 369mm, Max Cooler 190mm",
    desc_sv: "ATX mellantorn chassi, Max GPU 369mm, Max kylare 190mm",
    manufacturer: "be quiet!",
    modelNumber: "BGW37",
    price: 1099,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/bequiet-purebase500dx.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 369,
      maxCpuCoolerHeight: 190,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 2,
        "2.5inch": 5
      },
      fanSlots: 7,
      has525Bay: false
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Corsair 7000D Airflow",
    name_sv: "Corsair 7000D Airflow",
    desc_en: "ATX Full Tower Case, Max GPU 450mm, Max Cooler 190mm",
    desc_sv: "ATX fulltorn chassi, Max GPU 450mm, Max kylare 190mm",
    manufacturer: "Corsair",
    modelNumber: "CC-9011218-WW",
    price: 2499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-7000d-airflow.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 450,
      maxCpuCoolerHeight: 190,
      maxRadiatorSize: 420,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 4,
        "2.5inch": 4
      },
      fanSlots: 12,
      has525Bay: false
    },
    stock: 10,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Lian Li O11 Dynamic XL",
    name_sv: "Lian Li O11 Dynamic XL",
    desc_en: "ATX Full Tower Case, Max GPU 446mm, Max Cooler 167mm",
    desc_sv: "ATX fulltorn chassi, Max GPU 446mm, Max kylare 167mm",
    manufacturer: "Lian Li",
    modelNumber: "O11DXL-X",
    price: 1999,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/lianli-o11-xl.jpg",
    specifications: {
      formFactor: [
        "ATX",
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 446,
      maxCpuCoolerHeight: 167,
      maxRadiatorSize: 360,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 3,
        "2.5inch": 6
      },
      fanSlots: 12,
      has525Bay: false
    },
    stock: 12,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Fractal Design Pop Mini Air",
    name_sv: "Fractal Design Pop Mini Air",
    desc_en: "Micro-ATX Tower Case, Max GPU 405mm, Max Cooler 170mm",
    desc_sv: "Micro-ATX torn chassi, Max GPU 405mm, Max kylare 170mm",
    manufacturer: "Fractal Design",
    modelNumber: "FD-C-POR1M-06",
    price: 799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/fractal-pop-mini.jpg",
    specifications: {
      formFactor: [
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 405,
      maxCpuCoolerHeight: 170,
      maxRadiatorSize: 280,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 2,
        "2.5inch": 3
      },
      fanSlots: 7,
      has525Bay: false
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Cooler Master MasterBox Q300L",
    name_sv: "Cooler Master MasterBox Q300L",
    desc_en: "Micro-ATX Tower Case, Max GPU 360mm, Max Cooler 157mm",
    desc_sv: "Micro-ATX torn chassi, Max GPU 360mm, Max kylare 157mm",
    manufacturer: "Cooler Master",
    modelNumber: "MCB-Q300L-KANN-S00",
    price: 549,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/cm-q300l.jpg",
    specifications: {
      formFactor: [
        "Micro-ATX",
        "Mini-ITX"
      ],
      maxGpuLength: 360,
      maxCpuCoolerHeight: 157,
      maxRadiatorSize: 240,
      psuFormFactor: "ATX",
      driveBays: {
        "3.5inch": 1,
        "2.5inch": 2
      },
      fanSlots: 5,
      has525Bay: true
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "case",
    name_en: "Cooler Master NR200P",
    name_sv: "Cooler Master NR200P",
    desc_en: "Mini-ITX Compact Case, Max GPU 330mm, Max Cooler 155mm, SFX PSU Required",
    desc_sv: "Mini-ITX kompakt chassi, Max GPU 330mm, Max kylare 155mm, SFX PSU krävs",
    manufacturer: "Cooler Master",
    modelNumber: "MCB-NR200P-WGNN-S00",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/cm-nr200p.jpg",
    specifications: {
      formFactor: [
        "Mini-ITX"
      ],
      maxGpuLength: 330,
      maxCpuCoolerHeight: 155,
      maxRadiatorSize: 280,
      psuFormFactor: "SFX",
      driveBays: {
        "3.5inch": 1,
        "2.5inch": 2
      },
      fanSlots: 7,
      has525Bay: false
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "Noctua NH-D15",
    name_sv: "Noctua NH-D15",
    desc_en: "Dual Tower Air CPU Cooler, 165mm Height, 250W TDP",
    desc_sv: "Dubbeltorn luftkyld CPU-kylare, 165mm höjd, 250W TDP",
    manufacturer: "Noctua",
    modelNumber: "NH-D15",
    price: 1099,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/noctua-nhd15.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 165,
      maxTdp: 250
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "be quiet! Dark Rock Pro 4",
    name_sv: "be quiet! Dark Rock Pro 4",
    desc_en: "Dual Tower Air CPU Cooler, 162mm Height, 250W TDP",
    desc_sv: "Dubbeltorn luftkyld CPU-kylare, 162mm höjd, 250W TDP",
    manufacturer: "be quiet!",
    modelNumber: "BK022",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/bequiet-darkrockpro4.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 162,
      maxTdp: 250
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "DeepCool AK620",
    name_sv: "DeepCool AK620",
    desc_en: "Dual Tower Air CPU Cooler, 160mm Height, 260W TDP",
    desc_sv: "Dubbeltorn luftkyld CPU-kylare, 160mm höjd, 260W TDP",
    manufacturer: "DeepCool",
    modelNumber: "R-AK620-BKNNMT-G",
    price: 649,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/deepcool-ak620.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 160,
      maxTdp: 260
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "Noctua NH-U12S Redux",
    name_sv: "Noctua NH-U12S Redux",
    desc_en: "Single Tower Air CPU Cooler, 158mm Height, 200W TDP",
    desc_sv: "Enkeltorn luftkyld CPU-kylare, 158mm höjd, 200W TDP",
    manufacturer: "Noctua",
    modelNumber: "NH-U12S-REDUX",
    price: 549,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/noctua-u12s-redux.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 158,
      maxTdp: 200
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "Cooler Master Hyper 212 EVO V2",
    name_sv: "Cooler Master Hyper 212 EVO V2",
    desc_en: "Single Tower Air CPU Cooler, 159mm Height, 150W TDP",
    desc_sv: "Enkeltorn luftkyld CPU-kylare, 159mm höjd, 150W TDP",
    manufacturer: "Cooler Master",
    modelNumber: "RR-2V2E-18PK-R1",
    price: 399,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/cm-hyper212-evov2.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 159,
      maxTdp: 150
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "DeepCool AK400",
    name_sv: "DeepCool AK400",
    desc_en: "Single Tower Air CPU Cooler, 155mm Height, 220W TDP",
    desc_sv: "Enkeltorn luftkyld CPU-kylare, 155mm höjd, 220W TDP",
    manufacturer: "DeepCool",
    modelNumber: "R-AK400-BKNNMN-G",
    price: 349,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/deepcool-ak400.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 155,
      maxTdp: 220
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "ID-COOLING SE-214-XT",
    name_sv: "ID-COOLING SE-214-XT",
    desc_en: "Single Tower Air CPU Cooler, 150mm Height, 180W TDP",
    desc_sv: "Enkeltorn luftkyld CPU-kylare, 150mm höjd, 180W TDP",
    manufacturer: "ID-COOLING",
    modelNumber: "SE-214-XT",
    price: 249,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/idcooling-se214xt.jpg",
    specifications: {
      coolingType: "Air",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      height: 150,
      maxTdp: 180
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "Corsair iCUE H150i Elite",
    name_sv: "Corsair iCUE H150i Elite",
    desc_en: "360mm AIO Liquid CPU Cooler, 250W+ TDP",
    desc_sv: "360mm AIO flytande CPU-kylare, 250W+ TDP",
    manufacturer: "Corsair",
    modelNumber: "CW-9060060-WW",
    price: 1699,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-h150i-elite.jpg",
    specifications: {
      coolingType: "AIO Liquid",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      radiatorSize: 360,
      maxTdp: 300
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "NZXT Kraken X63",
    name_sv: "NZXT Kraken X63",
    desc_en: "280mm AIO Liquid CPU Cooler, 250W+ TDP",
    desc_sv: "280mm AIO flytande CPU-kylare, 250W+ TDP",
    manufacturer: "NZXT",
    modelNumber: "RL-KRX63-01",
    price: 1499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/nzxt-kraken-x63.jpg",
    specifications: {
      coolingType: "AIO Liquid",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      radiatorSize: 280,
      maxTdp: 300
    },
    stock: 18,
    isActive: true
  },
  {
    componentType: "cooling",
    name_en: "Arctic Liquid Freezer II 240",
    name_sv: "Arctic Liquid Freezer II 240",
    desc_en: "240mm AIO Liquid CPU Cooler, 250W+ TDP",
    desc_sv: "240mm AIO flytande CPU-kylare, 250W+ TDP",
    manufacturer: "Arctic",
    modelNumber: "ACFRE00046A",
    price: 899,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/arctic-lf2-240.jpg",
    specifications: {
      coolingType: "AIO Liquid",
      socket: [
        "LGA1700",
        "AM5",
        "AM4"
      ],
      radiatorSize: 240,
      maxTdp: 300
    },
    stock: 22,
    isActive: true
  },
  {
    componentType: "optical",
    name_en: "ASUS DRW-24D5MT DVD Writer",
    name_sv: "ASUS DRW-24D5MT DVD-brännare",
    desc_en: "Internal SATA DVD Writer, 24x Write Speed",
    desc_sv: "Intern SATA DVD-brännare, 24x skrivhastighet",
    manufacturer: "ASUS",
    modelNumber: "DRW-24D5MT",
    price: 199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asus-drw24d5mt.jpg",
    specifications: {
      driveType: "DVD-RW",
      interface: "SATA",
      readSpeed: "16x DVD",
      writeSpeed: "24x DVD",
      formFactor: "5.25 inch"
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "optical",
    name_en: "LG GH24NSD6 DVD Writer",
    name_sv: "LG GH24NSD6 DVD-brännare",
    desc_en: "Internal SATA DVD Writer, 24x Write Speed",
    desc_sv: "Intern SATA DVD-brännare, 24x skrivhastighet",
    manufacturer: "LG",
    modelNumber: "GH24NSD6",
    price: 179,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/lg-gh24nsd6.jpg",
    specifications: {
      driveType: "DVD-RW",
      interface: "SATA",
      readSpeed: "16x DVD",
      writeSpeed: "24x DVD",
      formFactor: "5.25 inch"
    },
    stock: 28,
    isActive: true
  },
  {
    componentType: "optical",
    name_en: "ASUS BW-16D1HT Blu-ray Writer",
    name_sv: "ASUS BW-16D1HT Blu-ray-brännare",
    desc_en: "Internal SATA Blu-ray Writer, 16x BD Write Speed",
    desc_sv: "Intern SATA Blu-ray-brännare, 16x BD skrivhastighet",
    manufacturer: "ASUS",
    modelNumber: "BW-16D1HT",
    price: 699,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/asus-bw16d1ht.jpg",
    specifications: {
      driveType: "Blu-Ray Writer",
      interface: "SATA",
      readSpeed: "16x BD",
      writeSpeed: "16x BD-R",
      formFactor: "5.25 inch"
    },
    stock: 15,
    isActive: true
  },
  {
    componentType: "optical",
    name_en: "LG WH16NS40 Blu-ray Writer",
    name_sv: "LG WH16NS40 Blu-ray-brännare",
    desc_en: "Internal SATA Blu-ray Writer, 16x BD Write Speed",
    desc_sv: "Intern SATA Blu-ray-brännare, 16x BD skrivhastighet",
    manufacturer: "LG",
    modelNumber: "WH16NS40",
    price: 649,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/lg-wh16ns40.jpg",
    specifications: {
      driveType: "Blu-Ray Writer",
      interface: "SATA",
      readSpeed: "16x BD",
      writeSpeed: "16x BD-R",
      formFactor: "5.25 inch"
    },
    stock: 12,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Noctua NF-A12x25 PWM 120mm",
    name_sv: "Noctua NF-A12x25 PWM 120mm",
    desc_en: "Premium 120mm PWM Fan, 22.6 dBA",
    desc_sv: "Premium 120mm PWM-fläkt, 22.6 dBA",
    manufacturer: "Noctua",
    modelNumber: "NF-A12x25-PWM",
    price: 299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/noctua-nfa12x25.jpg",
    specifications: {
      size: 120,
      rpm: {
        min: 450,
        max: 2000
      },
      airflow: 60.1,
      noiseLevel: 22.6,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 40,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Corsair iCUE SP120 RGB Elite",
    name_sv: "Corsair iCUE SP120 RGB Elite",
    desc_en: "120mm PWM RGB Fan, 18 dBA",
    desc_sv: "120mm PWM RGB-fläkt, 18 dBA",
    manufacturer: "Corsair",
    modelNumber: "CO-9050108-WW",
    price: 149,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-sp120-rgb.jpg",
    specifications: {
      size: 120,
      rpm: {
        min: 200,
        max: 1500
      },
      airflow: 47.7,
      noiseLevel: 18,
      connector: "4-pin PWM",
      rgb: true
    },
    stock: 45,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Arctic P12 PWM PST 120mm",
    name_sv: "Arctic P12 PWM PST 120mm",
    desc_en: "120mm PWM Fan, 22.5 dBA",
    desc_sv: "120mm PWM-fläkt, 22.5 dBA",
    manufacturer: "Arctic",
    modelNumber: "ACFAN00120A",
    price: 79,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/arctic-p12.jpg",
    specifications: {
      size: 120,
      rpm: {
        min: 200,
        max: 1800
      },
      airflow: 56.3,
      noiseLevel: 22.5,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 50,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "be quiet! Silent Wings 4 120mm",
    name_sv: "be quiet! Silent Wings 4 120mm",
    desc_en: "120mm PWM Fan, 21.4 dBA",
    desc_sv: "120mm PWM-fläkt, 21.4 dBA",
    manufacturer: "be quiet!",
    modelNumber: "BL094",
    price: 249,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/bequiet-sw4-120.jpg",
    specifications: {
      size: 120,
      rpm: {
        min: 200,
        max: 1600
      },
      airflow: 54.8,
      noiseLevel: 21.4,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Corsair iCUE SP120 RGB Elite 3-Pack",
    name_sv: "Corsair iCUE SP120 RGB Elite 3-pack",
    desc_en: "120mm PWM RGB Fan 3-Pack, 18 dBA",
    desc_sv: "120mm PWM RGB-fläkt 3-pack, 18 dBA",
    manufacturer: "Corsair",
    modelNumber: "CO-9050109-WW",
    price: 399,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-sp120-rgb-3pack.jpg",
    specifications: {
      size: 120,
      rpm: {
        min: 200,
        max: 1500
      },
      airflow: 47.7,
      noiseLevel: 18,
      connector: "4-pin PWM",
      rgb: true
    },
    stock: 25,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Noctua NF-A14 PWM 140mm",
    name_sv: "Noctua NF-A14 PWM 140mm",
    desc_en: "140mm PWM Fan, 24.6 dBA",
    desc_sv: "140mm PWM-fläkt, 24.6 dBA",
    manufacturer: "Noctua",
    modelNumber: "NF-A14-PWM",
    price: 299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/noctua-nfa14.jpg",
    specifications: {
      size: 140,
      rpm: {
        min: 300,
        max: 1500
      },
      airflow: 82.5,
      noiseLevel: 24.6,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Corsair iCUE SP140 RGB Elite",
    name_sv: "Corsair iCUE SP140 RGB Elite",
    desc_en: "140mm PWM RGB Fan, 18 dBA",
    desc_sv: "140mm PWM RGB-fläkt, 18 dBA",
    manufacturer: "Corsair",
    modelNumber: "CO-9050110-WW",
    price: 169,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/corsair-sp140-rgb.jpg",
    specifications: {
      size: 140,
      rpm: {
        min: 200,
        max: 1200
      },
      airflow: 68.1,
      noiseLevel: 18,
      connector: "4-pin PWM",
      rgb: true
    },
    stock: 35,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Arctic P14 PWM PST 140mm",
    name_sv: "Arctic P14 PWM PST 140mm",
    desc_en: "140mm PWM Fan, 22.1 dBA",
    desc_sv: "140mm PWM-fläkt, 22.1 dBA",
    manufacturer: "Arctic",
    modelNumber: "ACFAN00125A",
    price: 89,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/arctic-p14.jpg",
    specifications: {
      size: 140,
      rpm: {
        min: 200,
        max: 1700
      },
      airflow: 72.8,
      noiseLevel: 22.1,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 42,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "be quiet! Silent Wings 4 140mm",
    name_sv: "be quiet! Silent Wings 4 140mm",
    desc_en: "140mm PWM Fan, 19.9 dBA",
    desc_sv: "140mm PWM-fläkt, 19.9 dBA",
    manufacturer: "be quiet!",
    modelNumber: "BL097",
    price: 279,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/bequiet-sw4-140.jpg",
    specifications: {
      size: 140,
      rpm: {
        min: 200,
        max: 1100
      },
      airflow: 78.4,
      noiseLevel: 19.9,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 30,
    isActive: true
  },
  {
    componentType: "fan",
    name_en: "Noctua NF-A14 PWM 140mm 2-Pack",
    name_sv: "Noctua NF-A14 PWM 140mm 2-pack",
    desc_en: "140mm PWM Fan 2-Pack, 24.6 dBA",
    desc_sv: "140mm PWM-fläkt 2-pack, 24.6 dBA",
    manufacturer: "Noctua",
    modelNumber: "NF-A14-PWM-2PACK",
    price: 549,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/noctua-nfa14-2pack.jpg",
    specifications: {
      size: 140,
      rpm: {
        min: 300,
        max: 1500
      },
      airflow: 82.5,
      noiseLevel: 24.6,
      connector: "4-pin PWM",
      rgb: false
    },
    stock: 20,
    isActive: true
  },
  {
    componentType: "os",
    name_en: "Microsoft Windows 11 Home",
    name_sv: "Microsoft Windows 11 Home",
    desc_en: "Microsoft Windows 11 Home 64-bit Digital License",
    desc_sv: "Microsoft Windows 11 Home 64-bitars digital licens",
    manufacturer: "Microsoft",
    modelNumber: "KW9-00664",
    price: 1499,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/windows-11-home.jpg",
    specifications: {
      osType: "Windows 11 Home",
      architecture: "64-bit",
      licenseType: "Retail",
      language: "Multi-language"
    },
    stock: 100,
    isActive: true
  },
  {
    componentType: "os",
    name_en: "Microsoft Windows 11 Pro",
    name_sv: "Microsoft Windows 11 Pro",
    desc_en: "Microsoft Windows 11 Pro 64-bit Digital License",
    desc_sv: "Microsoft Windows 11 Pro 64-bitars digital licens",
    manufacturer: "Microsoft",
    modelNumber: "HAV-00163",
    price: 2299,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/windows-11-pro.jpg",
    specifications: {
      osType: "Windows 11 Pro",
      architecture: "64-bit",
      licenseType: "Retail",
      language: "Multi-language"
    },
    stock: 80,
    isActive: true
  },
  {
    componentType: "os",
    name_en: "Microsoft Windows 11 Home (OEM)",
    name_sv: "Microsoft Windows 11 Home (OEM)",
    desc_en: "Microsoft Windows 11 Home 64-bit OEM License",
    desc_sv: "Microsoft Windows 11 Home 64-bitars OEM-licens",
    manufacturer: "Microsoft",
    modelNumber: "KW9-00632",
    price: 1199,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/windows-11-home-oem.jpg",
    specifications: {
      osType: "Windows 11 Home",
      architecture: "64-bit",
      licenseType: "OEM",
      language: "Multi-language"
    },
    stock: 100,
    isActive: true
  },
  {
    componentType: "os",
    name_en: "Microsoft Windows 11 Pro (OEM)",
    name_sv: "Microsoft Windows 11 Pro (OEM)",
    desc_en: "Microsoft Windows 11 Pro 64-bit OEM License",
    desc_sv: "Microsoft Windows 11 Pro 64-bitars OEM-licens",
    manufacturer: "Microsoft",
    modelNumber: "FQC-10528",
    price: 1799,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/windows-11-pro-oem.jpg",
    specifications: {
      osType: "Windows 11 Pro",
      architecture: "64-bit",
      licenseType: "OEM",
      language: "Multi-language"
    },
    stock: 80,
    isActive: true
  },
  {
    componentType: "os",
    name_en: "Ubuntu Desktop 24.04 LTS",
    name_sv: "Ubuntu Desktop 24.04 LTS",
    desc_en: "Ubuntu Desktop 24.04 LTS, Free and Open Source",
    desc_sv: "Ubuntu Desktop 24.04 LTS, gratis och öppen källkod",
    manufacturer: "Canonical",
    modelNumber: "UBUNTU-2404-LTS",
    price: 0,
    currency: "SEK",
    imageUrl: "https://example.com/images/pc-components/ubuntu-2404.jpg",
    specifications: {
      osType: "Ubuntu 24.04 LTS",
      architecture: "64-bit",
      licenseType: "Open Source",
      language: "Multi-language"
    },
    stock: 999,
    isActive: true
  }
];

async function seedPCComponents() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    console.log('Syncing PCComponent model...');
    await PCComponent.sync({ alter: true });
    console.log('Model synced');

    console.log('Seeding PC components...');

    // Use transaction for data integrity
    const transaction = await sequelize.transaction();
    try {
      // Check if components already exist
      const existingCount = await PCComponent.count({ transaction });
      if (existingCount > 0) {
        console.log(`Found ${existingCount} existing components. Clearing...`);
        await PCComponent.destroy({ where: {}, transaction });
        console.log('Existing components cleared.');
      }

      // Bulk create components
      await PCComponent.bulkCreate(components as any, { transaction });

      await transaction.commit();
      console.log('Transaction committed successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Transaction rolled back due to error.');
      throw error;
    }

    // Count by type
    const counts = await Promise.all([
      PCComponent.count({ where: { componentType: 'cpu' } }),
      PCComponent.count({ where: { componentType: 'motherboard' } }),
      PCComponent.count({ where: { componentType: 'ram' } }),
      PCComponent.count({ where: { componentType: 'gpu' } }),
      PCComponent.count({ where: { componentType: 'ssd' } }),
      PCComponent.count({ where: { componentType: 'hdd' } }),
      PCComponent.count({ where: { componentType: 'psu' } }),
      PCComponent.count({ where: { componentType: 'case' } }),
      PCComponent.count({ where: { componentType: 'cooling' } }),
      PCComponent.count({ where: { componentType: 'optical' } }),
      PCComponent.count({ where: { componentType: 'fan' } }),
      PCComponent.count({ where: { componentType: 'os' } }),
    ]);

    console.log('\nPC Components seeded successfully!');
    console.log('Component counts:');
    console.log(`  - CPUs: ${counts[0]}`);
    console.log(`  - Motherboards: ${counts[1]}`);
    console.log(`  - RAM: ${counts[2]}`);
    console.log(`  - GPUs: ${counts[3]}`);
    console.log(`  - SSDs: ${counts[4]}`);
    console.log(`  - HDDs: ${counts[5]}`);
    console.log(`  - PSUs: ${counts[6]}`);
    console.log(`  - Cases: ${counts[7]}`);
    console.log(`  - Cooling: ${counts[8]}`);
    console.log(`  - Optical Drives: ${counts[9]}`);
    console.log(`  - Case Fans: ${counts[10]}`);
    console.log(`  - Operating Systems: ${counts[11]}`);
    console.log(`  - Total: ${components.length}\n`);
  } catch (error) {
    console.error('Error seeding PC components:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedPCComponents()
    .then(() => {
      console.log('Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export default seedPCComponents;
