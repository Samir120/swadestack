import PCComponent, {
  ComponentType,
  CPUSpecifications,
  MotherboardSpecifications,
  RAMSpecifications,
  GPUSpecifications,
  PSUSpecifications,
  SSDSpecifications,
  HDDSpecifications,
  CaseSpecifications,
  CoolingSpecifications,
  FanSpecifications,
  OpticalSpecifications,
} from '../models/sequelize/PCComponent';
import {
  ComponentsSnapshot,
  ValidationError,
  PowerSummary,
  SlotBasedComponentSnapshot,
  SSDComponentSnapshot,
} from '../models/sequelize/PCConfiguration';
import PCComponentRepository from '../integration/repositories/PCComponentRepository';
import PCCompatibilityRuleRepository from '../integration/repositories/PCCompatibilityRuleRepository';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  powerSummary?: PowerSummary;
}

// Slot usage summary interface
export interface SlotUsageSummary {
  ramSlots: { total: number; used: number; available: number };
  pciSlots: { total: number; used: number; available: number };
  nvmeSlots: { total: number; used: number; available: number };
  sataSlots: { total: number; used: number; available: number };
  fanSlots?: { total: number; used: number; available: number };
}

export class PCCompatibilityService {
  private componentRepo: PCComponentRepository;
  private ruleRepo: PCCompatibilityRuleRepository;

  constructor() {
    this.componentRepo = new PCComponentRepository();
    this.ruleRepo = new PCCompatibilityRuleRepository();
  }

  /**
   * Main validation method - validates entire configuration
   */
  async validateConfiguration(components: ComponentsSnapshot): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Extract single components from snapshot
    const cpu = components.cpu ? await this.reconstructComponent(components.cpu) : null;
    const motherboard = components.motherboard ? await this.reconstructComponent(components.motherboard) : null;
    const psu = components.psu ? await this.reconstructComponent(components.psu) : null;
    const pcCase = components.case ? await this.reconstructComponent(components.case) : null;
    const cooling = components.cooling ? await this.reconstructComponent(components.cooling) : null;
    const optical = components.optical ? await this.reconstructComponent(components.optical) : null;
    const os = components.os ? await this.reconstructComponent(components.os) : null;

    // Extract multi-select component arrays
    const rams = components.rams || [];
    const gpus = components.gpus || [];
    const ssds = components.ssds || [];
    const hdds = components.hdds || [];
    const fans = components.fans || [];

    // Validate CPU ↔ Motherboard
    if (cpu && motherboard) {
      const result = await this.validateCPUMotherboard(cpu, motherboard);
      if (result.error) errors.push(result.error);
      if (result.warning) warnings.push(result.warning);
    }

    // Validate Motherboard ↔ RAM (for each RAM module)
    if (motherboard && rams.length > 0) {
      // First validate slot limits
      const ramSlotResult = await this.validateRAMSlotLimits(rams, motherboard);
      if (ramSlotResult.error) errors.push(ramSlotResult.error);
      if (ramSlotResult.warning) warnings.push(ramSlotResult.warning);

      // Then validate each RAM module for type compatibility
      for (const ramSnapshot of rams) {
        const ram = await this.reconstructComponent(ramSnapshot);
        if (ram) {
          const result = await this.validateMotherboardRAM(motherboard, ram);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
      }
    }

    // Validate GPU slot limits and case clearance
    if (motherboard && gpus.length > 0) {
      // Validate PCI slot limits
      const gpuSlotResult = await this.validateGPUSlotLimits(gpus, motherboard);
      if (gpuSlotResult.error) errors.push(gpuSlotResult.error);
      if (gpuSlotResult.warning) warnings.push(gpuSlotResult.warning);

      // Validate each GPU for case clearance
      if (pcCase) {
        for (const gpuSnapshot of gpus) {
          const gpu = await this.reconstructComponent(gpuSnapshot);
          if (gpu) {
            const result = await this.validateGPUCase(gpu, pcCase);
            if (result.error) errors.push(result.error);
            if (result.warning) warnings.push(result.warning);
          }
        }
      }
    }

    // Validate SSD slot limits (NVMe and SATA)
    if (motherboard && ssds.length > 0) {
      const ssdSlotResult = await this.validateSSDSlotLimits(ssds, motherboard);
      if (ssdSlotResult.error) errors.push(ssdSlotResult.error);
      if (ssdSlotResult.warning) warnings.push(ssdSlotResult.warning);

      // Validate each SSD for motherboard support
      for (const ssdSnapshot of ssds) {
        const ssd = await this.reconstructComponent(ssdSnapshot);
        if (ssd) {
          const result = await this.validateSSDMotherboard(ssd, motherboard, ssdSnapshot.slotType);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
      }
    }

    // Validate HDD slot limits (SATA)
    if (motherboard && hdds.length > 0) {
      const hddSlotResult = await this.validateHDDSlotLimits(hdds, ssds, motherboard);
      if (hddSlotResult.error) errors.push(hddSlotResult.error);
      if (hddSlotResult.warning) warnings.push(hddSlotResult.warning);
    }

    // Validate Fan slot limits (based on case)
    if (pcCase && fans.length > 0) {
      const fanSlotResult = await this.validateFanSlotLimits(fans, pcCase);
      if (fanSlotResult.error) errors.push(fanSlotResult.error);
      if (fanSlotResult.warning) warnings.push(fanSlotResult.warning);
    }

    // Validate Optical drive ↔ Case compatibility
    if (optical && pcCase) {
      const result = await this.validateOpticalCase(optical, pcCase);
      if (result.error) errors.push(result.error);
      if (result.warning) warnings.push(result.warning);
    }

    // Validate Cooling ↔ CPU
    if (cooling && cpu) {
      const result = await this.validateCoolingCPU(cooling, cpu);
      if (result.error) errors.push(result.error);
      if (result.warning) warnings.push(result.warning);
    }

    // Validate Cooling ↔ Case (for AIO radiator size)
    if (cooling && pcCase) {
      const result = await this.validateCoolingCase(cooling, pcCase);
      if (result.error) errors.push(result.error);
      if (result.warning) warnings.push(result.warning);
    }

    // Validate PSU ↔ Power (must be done last as it depends on all other components)
    let powerSummary: PowerSummary | undefined;
    if (psu) {
      const allComponents = {
        cpu,
        motherboard,
        rams,
        gpus,
        ssds,
        hdds,
        cooling,
        fans,
        optical,
      };
      const result = await this.validatePSUPower(psu, allComponents);
      if (result.error) errors.push(result.error);
      if (result.warning) warnings.push(result.warning);
      powerSummary = result.powerSummary;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      powerSummary,
    };
  }

  /**
   * Calculate slot usage summary based on motherboard and case
   */
  async calculateSlotUsage(
    components: ComponentsSnapshot
  ): Promise<SlotUsageSummary | null> {
    const motherboard = components.motherboard
      ? await this.reconstructComponent(components.motherboard)
      : null;
    const pcCase = components.case
      ? await this.reconstructComponent(components.case)
      : null;

    if (!motherboard) return null;

    const moboSpec = motherboard.specifications as MotherboardSpecifications;
    const caseSpec = pcCase?.specifications as CaseSpecifications | undefined;

    const rams = components.rams || [];
    const gpus = components.gpus || [];
    const ssds = components.ssds || [];
    const hdds = components.hdds || [];
    const fans = components.fans || [];

    // Calculate used NVMe slots
    const nvmeUsed = ssds.filter(ssd => ssd.slotType === 'nvme').length;

    // Calculate used SATA slots (SATA SSDs + all HDDs)
    const sataSsdsUsed = ssds.filter(ssd => ssd.slotType === 'sata').length;
    const sataUsed = sataSsdsUsed + hdds.length;

    // Calculate RAM slots used (counting actual sticks, not products)
    // A 2x16GB kit uses 2 slots, not 1
    const ramSlotsUsed = rams.reduce((acc, ram) => {
      const ramSpec = ram.specifications as any;
      return acc + (ramSpec?.sticks || 1);
    }, 0);

    // Calculate PCI slots used (considering multi-slot GPUs)
    let pciSlotsUsed = 0;
    for (const gpuSnapshot of gpus) {
      const gpu = await this.reconstructComponent(gpuSnapshot);
      if (gpu) {
        const gpuSpec = gpu.specifications as GPUSpecifications;
        pciSlotsUsed += gpuSpec.pciSlots || 2; // Default to 2 slots if not specified
      }
    }

    return {
      ramSlots: {
        total: moboSpec.ramSlots || 4,
        used: ramSlotsUsed,
        available: Math.max(0, (moboSpec.ramSlots || 4) - ramSlotsUsed),
      },
      pciSlots: {
        total: moboSpec.pciSlots || 2,
        used: pciSlotsUsed,
        available: Math.max(0, (moboSpec.pciSlots || 2) - pciSlotsUsed),
      },
      nvmeSlots: {
        total: moboSpec.nvmeSlots || 0,
        used: nvmeUsed,
        available: Math.max(0, (moboSpec.nvmeSlots || 0) - nvmeUsed),
      },
      sataSlots: {
        total: moboSpec.sataSlots || 4,
        used: sataUsed,
        available: Math.max(0, (moboSpec.sataSlots || 4) - sataUsed),
      },
      fanSlots: caseSpec?.fanSlots
        ? {
            total: caseSpec.fanSlots,
            used: fans.length,
            available: Math.max(0, caseSpec.fanSlots - fans.length),
          }
        : undefined,
    };
  }

  /**
   * Reconstruct component from snapshot (fetch full data if needed)
   */
  private async reconstructComponent(snapshot: any): Promise<PCComponent | null> {
    if (snapshot.id) {
      return await this.componentRepo.findById(snapshot.id);
    }
    return null;
  }

  /**
   * Validate CPU ↔ Motherboard compatibility (Socket matching)
   */
  async validateCPUMotherboard(
    cpu: PCComponent,
    motherboard: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const cpuSpec = cpu.specifications as CPUSpecifications;
    const moboSpec = motherboard.specifications as MotherboardSpecifications;

    if (cpuSpec.socket !== moboSpec.socket) {
      return {
        error: {
          type: 'cpu_motherboard',
          severity: 'error',
          message_en: `CPU socket ${cpuSpec.socket} is not compatible with motherboard socket ${moboSpec.socket}. Please select a different motherboard or CPU.`,
          message_sv: `CPU sockel ${cpuSpec.socket} är inte kompatibel med moderkort sockel ${moboSpec.socket}. Välj ett annat moderkort eller en annan processor.`,
          affectedComponents: [cpu.id, motherboard.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate RAM slot limits based on motherboard
   */
  async validateRAMSlotLimits(
    rams: SlotBasedComponentSnapshot[],
    motherboard: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const moboSpec = motherboard.specifications as MotherboardSpecifications;
    const maxSlots = moboSpec.ramSlots || 4;

    // Count actual sticks used, not just products (a 2x16GB kit uses 2 slots)
    const totalSticksUsed = rams.reduce((acc, ram) => {
      const ramSpec = ram.specifications as any;
      return acc + (ramSpec?.sticks || 1);
    }, 0);

    if (totalSticksUsed > maxSlots) {
      return {
        error: {
          type: 'ram_slot_limit',
          severity: 'error',
          message_en: `You have selected RAM kits totaling ${totalSticksUsed} sticks, but the motherboard only has ${maxSlots} RAM slots.`,
          message_sv: `Du har valt RAM-kit med totalt ${totalSticksUsed} minnen, men moderkortet har endast ${maxSlots} RAM-platser.`,
          affectedComponents: [motherboard.id, ...rams.map(r => r.id)],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate Motherboard ↔ RAM compatibility (Type and speed)
   */
  async validateMotherboardRAM(
    motherboard: PCComponent,
    ram: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const moboSpec = motherboard.specifications as MotherboardSpecifications;
    const ramSpec = ram.specifications as RAMSpecifications;

    // Check RAM type compatibility (DDR4 vs DDR5)
    if (ramSpec.ramType !== moboSpec.ramType) {
      return {
        error: {
          type: 'motherboard_ram',
          severity: 'error',
          message_en: `${ramSpec.ramType} RAM is not compatible with this motherboard. The motherboard requires ${moboSpec.ramType} RAM.`,
          message_sv: `${ramSpec.ramType} RAM är inte kompatibelt med detta moderkort. Moderkortet kräver ${moboSpec.ramType} RAM.`,
          affectedComponents: [ram.id, motherboard.id],
          timestamp: new Date(),
        },
      };
    }

    // Check RAM speed support (warning if exceeds max)
    if (ramSpec.speed > moboSpec.maxRamSpeed) {
      return {
        warning: {
          type: 'motherboard_ram',
          severity: 'warning',
          message_en: `RAM speed (${ramSpec.speed}MHz) exceeds motherboard maximum (${moboSpec.maxRamSpeed}MHz). The RAM will run at reduced speed (${moboSpec.maxRamSpeed}MHz).`,
          message_sv: `RAM-hastighet (${ramSpec.speed}MHz) överskrider moderkortets maximum (${moboSpec.maxRamSpeed}MHz). RAM:et kommer att köras vid reducerad hastighet (${moboSpec.maxRamSpeed}MHz).`,
          affectedComponents: [ram.id, motherboard.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate GPU slot limits based on motherboard PCI slots
   */
  async validateGPUSlotLimits(
    gpus: SlotBasedComponentSnapshot[],
    motherboard: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const moboSpec = motherboard.specifications as MotherboardSpecifications;
    const maxSlots = moboSpec.pciSlots || 2;

    // Calculate total PCI slots used by all GPUs
    let totalSlotsUsed = 0;
    for (const gpuSnapshot of gpus) {
      const gpu = await this.reconstructComponent(gpuSnapshot);
      if (gpu) {
        const gpuSpec = gpu.specifications as GPUSpecifications;
        totalSlotsUsed += gpuSpec.pciSlots || 2; // Most GPUs use 2-3 slots
      }
    }

    if (totalSlotsUsed > maxSlots) {
      return {
        error: {
          type: 'gpu_slot_limit',
          severity: 'error',
          message_en: `The selected GPUs require ${totalSlotsUsed} PCI slots, but the motherboard only has ${maxSlots} PCI x16 slots.`,
          message_sv: `De valda GPU:erna kräver ${totalSlotsUsed} PCI-platser, men moderkortet har endast ${maxSlots} PCI x16-platser.`,
          affectedComponents: [motherboard.id, ...gpus.map(g => g.id)],
          timestamp: new Date(),
        },
      };
    }

    // Warning if SLI/CrossFire configuration
    if (gpus.length > 1) {
      return {
        warning: {
          type: 'gpu_multi',
          severity: 'warning',
          message_en: `Multi-GPU configurations may require additional motherboard support (SLI/CrossFire). Please verify your motherboard and GPUs support multi-GPU setups.`,
          message_sv: `Multi-GPU-konfigurationer kan kräva ytterligare moderkortsstöd (SLI/CrossFire). Verifiera att ditt moderkort och GPU:er stöder multi-GPU-konfigurationer.`,
          affectedComponents: gpus.map(g => g.id),
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate GPU ↔ Case compatibility (Physical clearance)
   */
  async validateGPUCase(
    gpu: PCComponent,
    pcCase: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const gpuSpec = gpu.specifications as GPUSpecifications;
    const caseSpec = pcCase.specifications as CaseSpecifications;

    if (gpuSpec.length > caseSpec.maxGpuLength) {
      return {
        error: {
          type: 'gpu_case',
          severity: 'error',
          message_en: `GPU length (${gpuSpec.length}mm) exceeds case maximum (${caseSpec.maxGpuLength}mm). Please select a larger case or a shorter GPU.`,
          message_sv: `GPU längd (${gpuSpec.length}mm) överskrider chassi maximum (${caseSpec.maxGpuLength}mm). Välj ett större chassi eller ett kortare GPU.`,
          affectedComponents: [gpu.id, pcCase.id],
          timestamp: new Date(),
        },
      };
    }

    // Warning if GPU is close to max (within 10mm)
    const clearance = caseSpec.maxGpuLength - gpuSpec.length;
    if (clearance < 10 && clearance > 0) {
      return {
        warning: {
          type: 'gpu_case',
          severity: 'warning',
          message_en: `GPU fits but with minimal clearance (${clearance}mm). Cable management may be challenging.`,
          message_sv: `GPU:n passar men med minimal marginal (${clearance}mm). Kabelhantering kan vara utmanande.`,
          affectedComponents: [gpu.id, pcCase.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate SSD slot limits (NVMe and SATA separately)
   */
  async validateSSDSlotLimits(
    ssds: SSDComponentSnapshot[],
    motherboard: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const moboSpec = motherboard.specifications as MotherboardSpecifications;

    // Count NVMe and SATA SSDs separately
    const nvmeSSDs = ssds.filter(ssd => ssd.slotType === 'nvme');
    const sataSSDs = ssds.filter(ssd => ssd.slotType === 'sata');

    // Validate NVMe slot limits
    const maxNvmeSlots = moboSpec.nvmeSlots || 0;
    if (nvmeSSDs.length > maxNvmeSlots) {
      if (maxNvmeSlots === 0) {
        return {
          error: {
            type: 'ssd_nvme_not_supported',
            severity: 'error',
            message_en: `This motherboard does not support NVMe drives. Please select SATA SSDs instead or choose a different motherboard.`,
            message_sv: `Detta moderkort stöder inte NVMe-enheter. Välj SATA SSD:er istället eller välj ett annat moderkort.`,
            affectedComponents: [motherboard.id, ...nvmeSSDs.map(s => s.id)],
            timestamp: new Date(),
          },
        };
      }
      return {
        error: {
          type: 'ssd_nvme_slot_limit',
          severity: 'error',
          message_en: `You have selected ${nvmeSSDs.length} NVMe SSDs, but the motherboard only has ${maxNvmeSlots} M.2 NVMe slot${maxNvmeSlots > 1 ? 's' : ''}.`,
          message_sv: `Du har valt ${nvmeSSDs.length} NVMe SSD:er, men moderkortet har endast ${maxNvmeSlots} M.2 NVMe-plats${maxNvmeSlots > 1 ? 'er' : ''}.`,
          affectedComponents: [motherboard.id, ...nvmeSSDs.map(s => s.id)],
          timestamp: new Date(),
        },
      };
    }

    // Note: SATA SSD limits are checked together with HDDs in validateHDDSlotLimits

    return {};
  }

  /**
   * Validate SSD ↔ Motherboard compatibility
   */
  async validateSSDMotherboard(
    ssd: PCComponent,
    motherboard: PCComponent,
    slotType: 'nvme' | 'sata'
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const ssdSpec = ssd.specifications as SSDSpecifications;
    const moboSpec = motherboard.specifications as MotherboardSpecifications;

    // Check if NVMe SSD is assigned to NVMe slot but motherboard doesn't support NVMe
    if (slotType === 'nvme' && ssdSpec.ssdType === 'NVMe' && !moboSpec.hasNVMe) {
      return {
        error: {
          type: 'ssd_motherboard',
          severity: 'error',
          message_en: `This motherboard does not support NVMe storage. Please select a SATA SSD or a different motherboard with NVMe support.`,
          message_sv: `Detta moderkort stöder inte NVMe-lagring. Välj en SATA SSD eller ett annat moderkort med NVMe-stöd.`,
          affectedComponents: [ssd.id, motherboard.id],
          timestamp: new Date(),
        },
      };
    }

    // Check if SATA SSD is incorrectly assigned to NVMe slot
    if (slotType === 'nvme' && ssdSpec.ssdType === 'SATA') {
      return {
        error: {
          type: 'ssd_slot_mismatch',
          severity: 'error',
          message_en: `A SATA SSD cannot be installed in an NVMe M.2 slot. Please use a SATA port instead.`,
          message_sv: `En SATA SSD kan inte installeras i en NVMe M.2-plats. Använd en SATA-port istället.`,
          affectedComponents: [ssd.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate HDD slot limits (SATA ports shared with SATA SSDs)
   */
  async validateHDDSlotLimits(
    hdds: SlotBasedComponentSnapshot[],
    ssds: SSDComponentSnapshot[],
    motherboard: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const moboSpec = motherboard.specifications as MotherboardSpecifications;
    const maxSataSlots = moboSpec.sataSlots || 4;

    // Count SATA SSDs
    const sataSSDs = ssds.filter(ssd => ssd.slotType === 'sata');
    const totalSataDevices = sataSSDs.length + hdds.length;

    if (totalSataDevices > maxSataSlots) {
      return {
        error: {
          type: 'sata_slot_limit',
          severity: 'error',
          message_en: `You have selected ${totalSataDevices} SATA devices (${sataSSDs.length} SATA SSDs + ${hdds.length} HDDs), but the motherboard only has ${maxSataSlots} SATA ports.`,
          message_sv: `Du har valt ${totalSataDevices} SATA-enheter (${sataSSDs.length} SATA SSD:er + ${hdds.length} HDD:er), men moderkortet har endast ${maxSataSlots} SATA-portar.`,
          affectedComponents: [motherboard.id, ...sataSSDs.map(s => s.id), ...hdds.map(h => h.id)],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate Fan slot limits based on case
   */
  async validateFanSlotLimits(
    fans: SlotBasedComponentSnapshot[],
    pcCase: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const caseSpec = pcCase.specifications as CaseSpecifications;
    const maxFanSlots = caseSpec.fanSlots || 6;

    if (fans.length > maxFanSlots) {
      return {
        error: {
          type: 'fan_slot_limit',
          severity: 'error',
          message_en: `You have selected ${fans.length} case fans, but the case only has ${maxFanSlots} fan mounting positions.`,
          message_sv: `Du har valt ${fans.length} chassifläktar, men chassit har endast ${maxFanSlots} fläktmonteringspositioner.`,
          affectedComponents: [pcCase.id, ...fans.map(f => f.id)],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate Optical drive ↔ Case compatibility (5.25" bay requirement)
   */
  async validateOpticalCase(
    optical: PCComponent,
    pcCase: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const opticalSpec = optical.specifications as OpticalSpecifications;
    const caseSpec = pcCase.specifications as CaseSpecifications;

    // Check if case has 5.25" bay for internal optical drives
    if (opticalSpec.formFactor === '5.25 inch' && !caseSpec.has525Bay) {
      return {
        error: {
          type: 'optical_case',
          severity: 'error',
          message_en: `This case does not have a 5.25" drive bay for internal optical drives. Please select an external USB optical drive or a different case with a 5.25" bay.`,
          message_sv: `Detta chassi har ingen 5,25" enhetsfack för interna optiska enheter. Välj en extern USB optisk enhet eller ett annat chassi med 5,25" fack.`,
          affectedComponents: [optical.id, pcCase.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate PSU ↔ Power requirements (Total system power draw)
   */
  async validatePSUPower(
    psu: PCComponent,
    allComponents: {
      cpu: PCComponent | null;
      motherboard: PCComponent | null;
      rams: SlotBasedComponentSnapshot[];
      gpus: SlotBasedComponentSnapshot[];
      ssds: SSDComponentSnapshot[];
      hdds: SlotBasedComponentSnapshot[];
      cooling: PCComponent | null;
      fans: SlotBasedComponentSnapshot[];
      optical: PCComponent | null;
    }
  ): Promise<{ error?: ValidationError; warning?: ValidationError; powerSummary?: PowerSummary }> {
    const psuSpec = psu.specifications as PSUSpecifications;
    const psuWattage = psuSpec.wattage;

    // Calculate total power draw
    const totalDraw = await this.calculateTotalPowerDraw(allComponents);
    const recommendedWattage = totalDraw * 1.2; // 20% headroom recommended

    const headroom = psuWattage - totalDraw;
    const percentage = (totalDraw / psuWattage) * 100;

    const powerSummary: PowerSummary = {
      totalDraw,
      psuWattage,
      headroom,
      percentage,
    };

    // Error: PSU insufficient for total power draw
    if (psuWattage < totalDraw) {
      return {
        error: {
          type: 'psu_power',
          severity: 'error',
          message_en: `PSU wattage (${psuWattage}W) is insufficient for the system. The system requires minimum ${Math.ceil(totalDraw)}W. Recommended: ${Math.ceil(recommendedWattage)}W or higher.`,
          message_sv: `PSU wattage (${psuWattage}W) är otillräckligt för systemet. Systemet kräver minst ${Math.ceil(totalDraw)}W. Rekommenderat: ${Math.ceil(recommendedWattage)}W eller högre.`,
          affectedComponents: [psu.id],
          timestamp: new Date(),
        },
        powerSummary,
      };
    }

    // Warning: PSU below recommended wattage (marginal headroom)
    if (psuWattage < recommendedWattage) {
      return {
        warning: {
          type: 'psu_power',
          severity: 'warning',
          message_en: `PSU wattage (${psuWattage}W) is below recommended (${Math.ceil(recommendedWattage)}W with 20% headroom). Current headroom: ${Math.ceil(headroom)}W (${Math.ceil(100 - percentage)}%). Consider a higher wattage PSU for better stability and efficiency.`,
          message_sv: `PSU wattage (${psuWattage}W) är under rekommenderat (${Math.ceil(recommendedWattage)}W med 20% marginal). Nuvarande marginal: ${Math.ceil(headroom)}W (${Math.ceil(100 - percentage)}%). Överväg ett högre wattage PSU för bättre stabilitet och effektivitet.`,
          affectedComponents: [psu.id],
          timestamp: new Date(),
        },
        powerSummary,
      };
    }

    return { powerSummary };
  }

  /**
   * Validate Cooling ↔ CPU compatibility (Socket support)
   */
  async validateCoolingCPU(
    cooling: PCComponent,
    cpu: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const coolingSpec = cooling.specifications as CoolingSpecifications;
    const cpuSpec = cpu.specifications as CPUSpecifications;

    // Check socket compatibility
    if (!coolingSpec.socket.includes(cpuSpec.socket)) {
      return {
        error: {
          type: 'cooling_cpu',
          severity: 'error',
          message_en: `Cooling solution does not support CPU socket ${cpuSpec.socket}. Supported sockets: ${coolingSpec.socket.join(', ')}.`,
          message_sv: `Kyllösningen stöder inte CPU sockel ${cpuSpec.socket}. Sockets som stöds: ${coolingSpec.socket.join(', ')}.`,
          affectedComponents: [cooling.id, cpu.id],
          timestamp: new Date(),
        },
      };
    }

    // Warning if cooling TDP rating is below CPU TDP
    if (coolingSpec.maxTdp && cpuSpec.tdp && coolingSpec.maxTdp < cpuSpec.tdp) {
      return {
        warning: {
          type: 'cooling_cpu',
          severity: 'warning',
          message_en: `Cooling TDP rating (${coolingSpec.maxTdp}W) is below CPU TDP (${cpuSpec.tdp}W). This may result in higher temperatures and thermal throttling.`,
          message_sv: `Kylningens TDP-klassificering (${coolingSpec.maxTdp}W) är under CPU:ns TDP (${cpuSpec.tdp}W). Detta kan resultera i högre temperaturer och termisk strypning.`,
          affectedComponents: [cooling.id, cpu.id],
          timestamp: new Date(),
        },
      };
    }

    return {};
  }

  /**
   * Validate Cooling ↔ Case compatibility (Radiator/cooler height)
   */
  async validateCoolingCase(
    cooling: PCComponent,
    pcCase: PCComponent
  ): Promise<{ error?: ValidationError; warning?: ValidationError }> {
    const coolingSpec = cooling.specifications as CoolingSpecifications;
    const caseSpec = pcCase.specifications as CaseSpecifications;

    // Check air cooler height clearance
    if (coolingSpec.coolingType === 'Air' && coolingSpec.height) {
      if (caseSpec.maxCpuCoolerHeight && coolingSpec.height > caseSpec.maxCpuCoolerHeight) {
        return {
          error: {
            type: 'cooling_case',
            severity: 'error',
            message_en: `CPU cooler height (${coolingSpec.height}mm) exceeds case maximum (${caseSpec.maxCpuCoolerHeight}mm). Please select a lower profile cooler or a larger case.`,
            message_sv: `CPU-kylarens höjd (${coolingSpec.height}mm) överskrider chassits maximum (${caseSpec.maxCpuCoolerHeight}mm). Välj en lägre kylare eller ett större chassi.`,
            affectedComponents: [cooling.id, pcCase.id],
            timestamp: new Date(),
          },
        };
      }
    }

    // Check AIO radiator size compatibility
    if (coolingSpec.coolingType === 'AIO Liquid' && coolingSpec.radiatorSize) {
      if (!caseSpec.maxRadiatorSize || coolingSpec.radiatorSize > caseSpec.maxRadiatorSize) {
        return {
          error: {
            type: 'cooling_case',
            severity: 'error',
            message_en: `AIO radiator size (${coolingSpec.radiatorSize}mm) ${caseSpec.maxRadiatorSize ? `exceeds case maximum (${caseSpec.maxRadiatorSize}mm)` : 'is not supported by this case'}. Please select a smaller radiator or a different case.`,
            message_sv: `AIO-radiatorstorlek (${coolingSpec.radiatorSize}mm) ${caseSpec.maxRadiatorSize ? `överskrider chassits maximum (${caseSpec.maxRadiatorSize}mm)` : 'stöds inte av detta chassi'}. Välj en mindre radiator eller ett annat chassi.`,
            affectedComponents: [cooling.id, pcCase.id],
            timestamp: new Date(),
          },
        };
      }
    }

    return {};
  }

  /**
   * Calculate total power draw for all components
   */
  private async calculateTotalPowerDraw(components: {
    cpu: PCComponent | null;
    motherboard: PCComponent | null;
    rams: SlotBasedComponentSnapshot[];
    gpus: SlotBasedComponentSnapshot[];
    ssds: SSDComponentSnapshot[];
    hdds: SlotBasedComponentSnapshot[];
    cooling: PCComponent | null;
    fans: SlotBasedComponentSnapshot[];
    optical: PCComponent | null;
  }): Promise<number> {
    let total = 0;

    // CPU TDP
    if (components.cpu) {
      const cpuSpec = components.cpu.specifications as CPUSpecifications;
      total += cpuSpec.tdp || 0;
    }

    // GPUs - sum all GPU TDPs
    for (const gpuSnapshot of components.gpus) {
      const gpu = await this.reconstructComponent(gpuSnapshot);
      if (gpu) {
        const gpuSpec = gpu.specifications as GPUSpecifications;
        total += gpuSpec.tdp || 0;
      }
    }

    // Motherboard (typical ~80W)
    if (components.motherboard) {
      total += 80;
    }

    // RAM (~5W per stick)
    total += components.rams.length * 5;

    // NVMe SSDs (~8W each)
    const nvmeCount = components.ssds.filter(ssd => ssd.slotType === 'nvme').length;
    total += nvmeCount * 8;

    // SATA SSDs (~5W each)
    const sataCount = components.ssds.filter(ssd => ssd.slotType === 'sata').length;
    total += sataCount * 5;

    // HDDs (~10W each for 3.5", ~5W for 2.5")
    for (const hddSnapshot of components.hdds) {
      const hdd = await this.reconstructComponent(hddSnapshot);
      if (hdd) {
        const hddSpec = hdd.specifications as HDDSpecifications;
        if (hddSpec.formFactor === '3.5 inch') {
          total += 10;
        } else {
          total += 5;
        }
      }
    }

    // Cooling
    if (components.cooling) {
      const coolingSpec = components.cooling.specifications as CoolingSpecifications;
      if (coolingSpec.coolingType === 'AIO Liquid') {
        total += 30; // AIO pump + fans
      } else {
        total += 20; // Air cooling fans
      }
    }

    // Case fans (~5W each)
    total += components.fans.length * 5;

    // Optical drive (~25W when active, ~5W idle - use idle for estimate)
    if (components.optical) {
      total += 5;
    }

    return total;
  }

  /**
   * Suggest alternative motherboards compatible with CPU socket
   */
  private async getSuggestedMotherboards(cpuSocket: string): Promise<PCComponent[]> {
    return await this.componentRepo.findCompatible('motherboard', 'socket', cpuSocket, 5);
  }

  /**
   * Suggest alternative cases that fit GPU length
   */
  private async getSuggestedCases(minGpuLength: number): Promise<PCComponent[]> {
    const cases = await this.componentRepo.findByType('case', { isActive: true });

    return cases
      .filter((c) => {
        const spec = c.specifications as CaseSpecifications;
        return spec.maxGpuLength >= minGpuLength;
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
  }

  /**
   * Suggest alternative PSUs with sufficient wattage
   */
  private async getSuggestedPSUs(minWattage: number): Promise<PCComponent[]> {
    const psus = await this.componentRepo.findByType('psu', { isActive: true });

    return psus
      .filter((p) => {
        const spec = p.specifications as PSUSpecifications;
        return spec.wattage >= minWattage;
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
  }

  /**
   * Validate if a component can be added to the current configuration (pre-add validation)
   * This simulates adding the component and checks for compatibility issues
   */
  async validateComponentSelection(
    component: PCComponent,
    existingComponents: ComponentsSnapshot
  ): Promise<{ isCompatible: boolean; errors: ValidationError[]; warnings: ValidationError[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Get existing components for validation
    const motherboard = existingComponents.motherboard
      ? await this.reconstructComponent(existingComponents.motherboard)
      : null;
    const cpu = existingComponents.cpu
      ? await this.reconstructComponent(existingComponents.cpu)
      : null;
    const pcCase = existingComponents.case
      ? await this.reconstructComponent(existingComponents.case)
      : null;
    const psu = existingComponents.psu
      ? await this.reconstructComponent(existingComponents.psu)
      : null;
    const cooling = existingComponents.cooling
      ? await this.reconstructComponent(existingComponents.cooling)
      : null;

    // Multi-select arrays
    const rams = existingComponents.rams || [];
    const gpus = existingComponents.gpus || [];
    const ssds = existingComponents.ssds || [];
    const hdds = existingComponents.hdds || [];
    const fans = existingComponents.fans || [];

    const componentType = component.componentType;

    switch (componentType) {
      case 'cpu':
        // Validate CPU against existing motherboard
        if (motherboard) {
          const result = await this.validateCPUMotherboard(component, motherboard);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        // Validate CPU against existing cooling
        if (cooling) {
          const result = await this.validateCoolingCPU(cooling, component);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        break;

      case 'motherboard':
        // Validate motherboard against existing CPU
        if (cpu) {
          const result = await this.validateCPUMotherboard(cpu, component);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        // Validate motherboard against existing RAMs
        for (const ramSnapshot of rams) {
          const ram = await this.reconstructComponent(ramSnapshot);
          if (ram) {
            const result = await this.validateMotherboardRAM(component, ram);
            if (result.error) errors.push(result.error);
            if (result.warning) warnings.push(result.warning);
          }
        }
        break;

      case 'ram':
        // Check if user already has RAM selected - must add same model for compatibility
        if (rams.length > 0) {
          const existingRamId = rams[0].id;
          if (component.id !== existingRamId) {
            // Get the name of the existing RAM for the error message
            const existingRamName = rams[0].name_en || 'the selected RAM';
            errors.push({
              type: 'ram_mixed_kits',
              severity: 'error',
              message_en: `You can only add more of the same RAM kit for optimal compatibility. Please select "${existingRamName}" or remove existing RAM first.`,
              message_sv: `Du kan endast lägga till fler av samma RAM-kit för optimal kompatibilitet. Välj "${existingRamName}" eller ta bort befintligt RAM först.`,
              affectedComponents: [existingRamId, component.id],
              timestamp: new Date(),
            });
            // Return early - no need to check other validations if mixing kits
            break;
          }
        }

        // Validate RAM against existing motherboard (type compatibility)
        if (motherboard) {
          const result = await this.validateMotherboardRAM(motherboard, component);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);

          // Check slot limits with the new RAM added
          const moboSpec = motherboard.specifications as MotherboardSpecifications;
          const maxSlots = moboSpec.ramSlots || 4;
          const newRamSpec = component.specifications as any;
          const newSticksCount = newRamSpec?.sticks || 1;

          // Count existing sticks
          const existingSticksUsed = rams.reduce((acc, ram) => {
            const ramSpec = ram.specifications as any;
            return acc + (ramSpec?.sticks || 1);
          }, 0);

          const totalSticksAfterAdd = existingSticksUsed + newSticksCount;

          if (totalSticksAfterAdd > maxSlots) {
            errors.push({
              type: 'ram_slot_limit',
              severity: 'error',
              message_en: `Adding this RAM kit (${newSticksCount} sticks) would exceed the motherboard's ${maxSlots} RAM slots. Currently using ${existingSticksUsed} slots, would need ${totalSticksAfterAdd} slots.`,
              message_sv: `Att lägga till detta RAM-kit (${newSticksCount} minnen) skulle överskrida moderkortets ${maxSlots} RAM-platser. Använder för närvarande ${existingSticksUsed} platser, skulle behöva ${totalSticksAfterAdd} platser.`,
              affectedComponents: [motherboard.id, component.id],
              timestamp: new Date(),
            });
          }
        }
        break;

      case 'gpu':
        // Validate GPU against existing case
        if (pcCase) {
          const result = await this.validateGPUCase(component, pcCase);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        // Validate GPU slot limits
        if (motherboard) {
          const moboSpec = motherboard.specifications as MotherboardSpecifications;
          const maxSlots = moboSpec.pciSlots || 2;
          const newGpuSpec = component.specifications as GPUSpecifications;
          const newGpuSlots = newGpuSpec.pciSlots || 2;

          // Calculate existing PCI slots used
          let existingSlotsUsed = 0;
          for (const gpuSnapshot of gpus) {
            const gpu = await this.reconstructComponent(gpuSnapshot);
            if (gpu) {
              const gpuSpec = gpu.specifications as GPUSpecifications;
              existingSlotsUsed += gpuSpec.pciSlots || 2;
            }
          }

          const totalSlotsAfterAdd = existingSlotsUsed + newGpuSlots;

          if (totalSlotsAfterAdd > maxSlots) {
            errors.push({
              type: 'gpu_slot_limit',
              severity: 'error',
              message_en: `Adding this GPU would exceed the motherboard's ${maxSlots} PCI x16 slots. Currently using ${existingSlotsUsed} slots, this GPU requires ${newGpuSlots} slots.`,
              message_sv: `Att lägga till denna GPU skulle överskrida moderkortets ${maxSlots} PCI x16-platser. Använder för närvarande ${existingSlotsUsed} platser, denna GPU kräver ${newGpuSlots} platser.`,
              affectedComponents: [motherboard.id, component.id],
              timestamp: new Date(),
            });
          }
        }
        break;

      case 'ssd':
        // Validate SSD against motherboard
        if (motherboard) {
          const ssdSpec = component.specifications as SSDSpecifications;
          const moboSpec = motherboard.specifications as MotherboardSpecifications;

          // Check if NVMe SSD but motherboard doesn't support
          if (ssdSpec.ssdType === 'NVMe' && !moboSpec.hasNVMe) {
            errors.push({
              type: 'ssd_motherboard',
              severity: 'error',
              message_en: `This motherboard does not support NVMe storage. Please select a SATA SSD or a different motherboard with NVMe support.`,
              message_sv: `Detta moderkort stöder inte NVMe-lagring. Välj en SATA SSD eller ett annat moderkort med NVMe-stöd.`,
              affectedComponents: [component.id, motherboard.id],
              timestamp: new Date(),
            });
          }

          // Check slot limits
          if (ssdSpec.ssdType === 'NVMe') {
            const nvmeUsed = ssds.filter(s => s.slotType === 'nvme').length;
            const maxNvme = moboSpec.nvmeSlots || 0;
            if (nvmeUsed >= maxNvme) {
              errors.push({
                type: 'ssd_nvme_slot_limit',
                severity: 'error',
                message_en: `All ${maxNvme} NVMe M.2 slot(s) are already in use. Please remove an NVMe SSD first or select a SATA SSD.`,
                message_sv: `Alla ${maxNvme} NVMe M.2-plats(er) används redan. Ta bort en NVMe SSD först eller välj en SATA SSD.`,
                affectedComponents: [motherboard.id, component.id],
                timestamp: new Date(),
              });
            }
          } else {
            // SATA SSD - check combined SATA usage
            const sataSSDs = ssds.filter(s => s.slotType === 'sata').length;
            const totalSataUsed = sataSSDs + hdds.length;
            const maxSata = moboSpec.sataSlots || 4;
            if (totalSataUsed >= maxSata) {
              errors.push({
                type: 'sata_slot_limit',
                severity: 'error',
                message_en: `All ${maxSata} SATA ports are already in use. Please remove a SATA device first.`,
                message_sv: `Alla ${maxSata} SATA-portar används redan. Ta bort en SATA-enhet först.`,
                affectedComponents: [motherboard.id, component.id],
                timestamp: new Date(),
              });
            }
          }
        }
        break;

      case 'hdd':
        // Validate HDD against motherboard SATA slots
        if (motherboard) {
          const moboSpec = motherboard.specifications as MotherboardSpecifications;
          const sataSSDs = ssds.filter(s => s.slotType === 'sata').length;
          const totalSataUsed = sataSSDs + hdds.length;
          const maxSata = moboSpec.sataSlots || 4;

          if (totalSataUsed >= maxSata) {
            errors.push({
              type: 'sata_slot_limit',
              severity: 'error',
              message_en: `All ${maxSata} SATA ports are already in use. Please remove a SATA device first.`,
              message_sv: `Alla ${maxSata} SATA-portar används redan. Ta bort en SATA-enhet först.`,
              affectedComponents: [motherboard.id, component.id],
              timestamp: new Date(),
            });
          }
        }
        break;

      case 'psu':
        // PSU validation against total power draw (would need to calculate)
        // For now, we rely on post-add validation
        break;

      case 'case':
        // Validate case against existing GPUs
        for (const gpuSnapshot of gpus) {
          const gpu = await this.reconstructComponent(gpuSnapshot);
          if (gpu) {
            const result = await this.validateGPUCase(gpu, component);
            if (result.error) errors.push(result.error);
            if (result.warning) warnings.push(result.warning);
          }
        }
        // Validate case against existing cooling
        if (cooling) {
          const result = await this.validateCoolingCase(cooling, component);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        break;

      case 'cooling':
        // Validate cooling against existing CPU
        if (cpu) {
          const result = await this.validateCoolingCPU(component, cpu);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        // Validate cooling against existing case
        if (pcCase) {
          const result = await this.validateCoolingCase(component, pcCase);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        break;

      case 'fan':
        // Validate fan slot limits against case
        if (pcCase) {
          const caseSpec = pcCase.specifications as CaseSpecifications;
          const maxFans = caseSpec.fanSlots || 6;

          if (fans.length >= maxFans) {
            errors.push({
              type: 'fan_slot_limit',
              severity: 'error',
              message_en: `All ${maxFans} fan mounting positions are already in use. Please remove a fan first.`,
              message_sv: `Alla ${maxFans} fläktmonteringspositioner används redan. Ta bort en fläkt först.`,
              affectedComponents: [pcCase.id, component.id],
              timestamp: new Date(),
            });
          }
        }
        break;

      case 'optical':
        // Validate optical drive against case
        if (pcCase) {
          const result = await this.validateOpticalCase(component, pcCase);
          if (result.error) errors.push(result.error);
          if (result.warning) warnings.push(result.warning);
        }
        break;

      // os - no validation needed
      default:
        break;
    }

    return {
      isCompatible: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Suggest alternatives for any incompatible component
   */
  async suggestAlternatives(
    incompatibleComponent: PCComponent,
    existingComponents: ComponentsSnapshot
  ): Promise<PCComponent[]> {
    const componentType = incompatibleComponent.componentType;

    switch (componentType) {
      case 'motherboard':
        if (existingComponents.cpu) {
          const cpu = await this.reconstructComponent(existingComponents.cpu);
          if (cpu) {
            const cpuSpec = cpu.specifications as CPUSpecifications;
            return await this.getSuggestedMotherboards(cpuSpec.socket);
          }
        }
        break;

      case 'case':
        // Find max GPU length from all selected GPUs
        if (existingComponents.gpus && existingComponents.gpus.length > 0) {
          let maxGpuLength = 0;
          for (const gpuSnapshot of existingComponents.gpus) {
            const gpu = await this.reconstructComponent(gpuSnapshot);
            if (gpu) {
              const gpuSpec = gpu.specifications as GPUSpecifications;
              if (gpuSpec.length > maxGpuLength) {
                maxGpuLength = gpuSpec.length;
              }
            }
          }
          if (maxGpuLength > 0) {
            return await this.getSuggestedCases(maxGpuLength);
          }
        }
        break;

      case 'psu': {
        // Calculate required wattage from all components
        const allComponents = {
          cpu: existingComponents.cpu
            ? await this.reconstructComponent(existingComponents.cpu)
            : null,
          motherboard: existingComponents.motherboard
            ? await this.reconstructComponent(existingComponents.motherboard)
            : null,
          rams: existingComponents.rams || [],
          gpus: existingComponents.gpus || [],
          ssds: existingComponents.ssds || [],
          hdds: existingComponents.hdds || [],
          cooling: existingComponents.cooling
            ? await this.reconstructComponent(existingComponents.cooling)
            : null,
          fans: existingComponents.fans || [],
          optical: existingComponents.optical
            ? await this.reconstructComponent(existingComponents.optical)
            : null,
        };

        const totalDraw = await this.calculateTotalPowerDraw(allComponents);
        const recommendedWattage = totalDraw * 1.2;

        return await this.getSuggestedPSUs(recommendedWattage);
      }
    }

    // Default: return similar components sorted by price
    return await this.componentRepo.findByType(componentType, { isActive: true });
  }
}

export default PCCompatibilityService;
