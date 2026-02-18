import PCCompatibilityRule, {
  RuleType,
  RuleOperator,
  RuleSeverity,
  PCCompatibilityRuleAttributes
} from '../models/sequelize/PCCompatibilityRule';
import sequelize from '../config/database';

// Type for seed data (without id and timestamps)
type CompatibilityRuleSeed = Omit<PCCompatibilityRuleAttributes, 'id' | 'createdAt' | 'updatedAt'>;

const compatibilityRules: CompatibilityRuleSeed[] = [
  // 1. CPU ↔ Motherboard: Socket compatibility
  {
    ruleType: 'cpu_motherboard' as RuleType,
    componentType1: 'cpu',
    componentType2: 'motherboard',
    rule: {
      field1: 'specifications.socket',
      field2: 'specifications.socket',
      operator: 'equals' as RuleOperator,
    },
    errorMessage_en: 'CPU socket {cpu.socket} is not compatible with motherboard socket {motherboard.socket}. Please select a motherboard with matching socket type.',
    errorMessage_sv: 'CPU-sockel {cpu.socket} är inte kompatibel med moderkortsockel {motherboard.socket}. Välj ett moderkort med matchande sockeltyp.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 2. Motherboard ↔ RAM: Type compatibility (DDR4/DDR5)
  {
    ruleType: 'motherboard_ram' as RuleType,
    componentType1: 'motherboard',
    componentType2: 'ram',
    rule: {
      field1: 'specifications.ramType',
      field2: 'specifications.ramType',
      operator: 'equals' as RuleOperator,
    },
    errorMessage_en: 'RAM type {ram.ramType} is not compatible with motherboard RAM type {motherboard.ramType}. Please select {motherboard.ramType} memory modules.',
    errorMessage_sv: 'RAM-typ {ram.ramType} är inte kompatibel med moderkortets RAM-typ {motherboard.ramType}. Välj {motherboard.ramType} minnesmoduler.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 3. Motherboard ↔ RAM: Speed warning (non-blocking)
  {
    ruleType: 'motherboard_ram' as RuleType,
    componentType1: 'motherboard',
    componentType2: 'ram',
    rule: {
      field1: 'specifications.speed',
      field2: 'specifications.maxRamSpeed',
      operator: 'lte' as RuleOperator,
    },
    errorMessage_en: 'RAM speed ({ram.speed}MHz) exceeds motherboard maximum ({motherboard.maxRamSpeed}MHz). RAM will run at reduced speed ({motherboard.maxRamSpeed}MHz).',
    errorMessage_sv: 'RAM-hastighet ({ram.speed}MHz) överskrider moderkortets maximum ({motherboard.maxRamSpeed}MHz). RAM kommer köras vid reducerad hastighet ({motherboard.maxRamSpeed}MHz).',
    severity: 'warning' as RuleSeverity,
    isActive: true,
  },

  // 4. GPU ↔ Case: Physical clearance
  {
    ruleType: 'gpu_case' as RuleType,
    componentType1: 'gpu',
    componentType2: 'case',
    rule: {
      field1: 'specifications.length',
      field2: 'specifications.maxGpuLength',
      operator: 'lte' as RuleOperator,
    },
    errorMessage_en: 'GPU length ({gpu.length}mm) exceeds case maximum ({case.maxGpuLength}mm). Please select a larger case or a smaller GPU.',
    errorMessage_sv: 'GPU-längd ({gpu.length}mm) överskrider chassi maximum ({case.maxGpuLength}mm). Välj ett större chassi eller ett mindre grafikkort.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 5. PSU ↔ Power: Insufficient wattage (critical error)
  {
    ruleType: 'psu_power' as RuleType,
    componentType1: 'psu',
    componentType2: 'system',
    rule: {
      field1: 'specifications.wattage',
      field2: 'totalPowerDraw',
      operator: 'gte' as RuleOperator,
    },
    errorMessage_en: 'PSU wattage ({psu.wattage}W) is insufficient for system power draw ({totalPowerDraw}W). Please select a PSU with at least {recommendedWattage}W capacity.',
    errorMessage_sv: 'PSU-effekt ({psu.wattage}W) är otillräcklig för systemets strömförbrukning ({totalPowerDraw}W). Välj en PSU med minst {recommendedWattage}W kapacitet.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 6. PSU ↔ Power: Marginal headroom (warning)
  {
    ruleType: 'psu_power' as RuleType,
    componentType1: 'psu',
    componentType2: 'system',
    rule: {
      field1: 'specifications.wattage',
      field2: 'recommendedWattage',
      operator: 'gte' as RuleOperator,
    },
    errorMessage_en: 'PSU wattage ({psu.wattage}W) provides minimal headroom for system power draw ({totalPowerDraw}W). We recommend at least {recommendedWattage}W for optimal efficiency and future upgrades.',
    errorMessage_sv: 'PSU-effekt ({psu.wattage}W) ger minimalt utrymme för systemets strömförbrukning ({totalPowerDraw}W). Vi rekommenderar minst {recommendedWattage}W för optimal effektivitet och framtida uppgraderingar.',
    severity: 'warning' as RuleSeverity,
    isActive: true,
  },

  // 7. Storage ↔ Motherboard: NVMe support
  {
    ruleType: 'storage_motherboard' as RuleType,
    componentType1: 'storage',
    componentType2: 'motherboard',
    rule: {
      field1: 'specifications.storageType',
      field2: 'specifications.hasNVMe',
      operator: 'custom' as RuleOperator,
      customValidator: 'nvmeSupport',
    },
    errorMessage_en: 'This motherboard does not support NVMe storage. Please select a SATA SSD/HDD or choose a motherboard with NVMe support.',
    errorMessage_sv: 'Detta moderkort stöder inte NVMe-lagring. Välj en SATA SSD/HDD eller välj ett moderkort med NVMe-stöd.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 8. Storage ↔ Motherboard: NVMe slot count warning
  {
    ruleType: 'storage_motherboard' as RuleType,
    componentType1: 'storage',
    componentType2: 'motherboard',
    rule: {
      field1: 'nvmeDriveCount',
      field2: 'specifications.nvmeSlots',
      operator: 'lte' as RuleOperator,
    },
    errorMessage_en: 'You have selected {nvmeDriveCount} NVMe drives, but the motherboard only has {motherboard.nvmeSlots} NVMe slots. Please reduce NVMe drives or select a different motherboard.',
    errorMessage_sv: 'Du har valt {nvmeDriveCount} NVMe-enheter, men moderkortet har bara {motherboard.nvmeSlots} NVMe-platser. Minska antalet NVMe-enheter eller välj ett annat moderkort.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 9. Cooling ↔ CPU: Socket compatibility
  {
    ruleType: 'cooling_cpu' as RuleType,
    componentType1: 'cooling',
    componentType2: 'cpu',
    rule: {
      field1: 'specifications.socket',
      field2: 'specifications.socket',
      operator: 'contains' as RuleOperator,
    },
    errorMessage_en: 'This CPU cooler does not support {cpu.socket} socket. Please select a cooler compatible with {cpu.socket}.',
    errorMessage_sv: 'Denna CPU-kylare stöder inte {cpu.socket}-sockel. Välj en kylare kompatibel med {cpu.socket}.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 10. Cooling ↔ CPU: TDP warning
  {
    ruleType: 'cooling_cpu' as RuleType,
    componentType1: 'cooling',
    componentType2: 'cpu',
    rule: {
      field1: 'specifications.maxTdp',
      field2: 'specifications.tdp',
      operator: 'gte' as RuleOperator,
    },
    errorMessage_en: 'CPU TDP ({cpu.tdp}W) exceeds cooler maximum TDP rating ({cooling.maxTdp}W). This may result in inadequate cooling and thermal throttling. Consider a more powerful cooling solution.',
    errorMessage_sv: 'CPU TDP ({cpu.tdp}W) överskrider kylarens maximala TDP-klassificering ({cooling.maxTdp}W). Detta kan resultera i otillräcklig kylning och termisk begränsning. Överväg en kraftfullare kyllösning.',
    severity: 'warning' as RuleSeverity,
    isActive: true,
  },

  // 11. Motherboard ↔ Case: Form factor compatibility
  {
    ruleType: 'gpu_case' as RuleType,
    componentType1: 'motherboard',
    componentType2: 'case',
    rule: {
      field1: 'specifications.formFactor',
      field2: 'specifications.formFactor',
      operator: 'contains' as RuleOperator,
    },
    errorMessage_en: 'Motherboard form factor ({motherboard.formFactor}) is not compatible with case form factors ({case.formFactor}). Please select a compatible case or motherboard.',
    errorMessage_sv: 'Moderkortets formfaktor ({motherboard.formFactor}) är inte kompatibel med chassiets formfaktorer ({case.formFactor}). Välj ett kompatibelt chassi eller moderkort.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 12. GPU ↔ Motherboard: PCIe slot requirement
  {
    ruleType: 'gpu_case' as RuleType,
    componentType1: 'gpu',
    componentType2: 'motherboard',
    rule: {
      field1: 'specifications.pciSlots',
      field2: 'specifications.pciSlots',
      operator: 'gte' as RuleOperator,
    },
    errorMessage_en: 'GPU requires {gpu.pciSlots} PCIe slots, but motherboard only has {motherboard.pciSlots} available. Please select a motherboard with sufficient PCIe slots.',
    errorMessage_sv: 'GPU kräver {gpu.pciSlots} PCIe-platser, men moderkortet har bara {motherboard.pciSlots} tillgängliga. Välj ett moderkort med tillräckligt många PCIe-platser.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 13. RAM ↔ Motherboard: Slot count
  {
    ruleType: 'motherboard_ram' as RuleType,
    componentType1: 'ram',
    componentType2: 'motherboard',
    rule: {
      field1: 'ramStickCount',
      field2: 'specifications.ramSlots',
      operator: 'lte' as RuleOperator,
    },
    errorMessage_en: 'You have selected {ramStickCount} RAM sticks, but the motherboard only has {motherboard.ramSlots} RAM slots. Please reduce RAM quantity or select a motherboard with more slots.',
    errorMessage_sv: 'Du har valt {ramStickCount} RAM-moduler, men moderkortet har bara {motherboard.ramSlots} RAM-platser. Minska RAM-antalet eller välj ett moderkort med fler platser.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 14. Cooling ↔ Case: Radiator clearance (for AIO liquid coolers)
  {
    ruleType: 'cooling_cpu' as RuleType,
    componentType1: 'cooling',
    componentType2: 'case',
    rule: {
      field1: 'specifications.radiatorSize',
      field2: 'specifications.maxRadiatorSize',
      operator: 'lte' as RuleOperator,
    },
    errorMessage_en: 'AIO radiator size ({cooling.radiatorSize}mm) exceeds case maximum ({case.maxRadiatorSize}mm). Please select a larger case or a smaller AIO cooler.',
    errorMessage_sv: 'AIO-kylarens radiatorstorlek ({cooling.radiatorSize}mm) överskrider chassiets maximum ({case.maxRadiatorSize}mm). Välj ett större chassi eller en mindre AIO-kylare.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 15. Cooling ↔ Case: Air cooler height clearance
  {
    ruleType: 'cooling_cpu' as RuleType,
    componentType1: 'cooling',
    componentType2: 'case',
    rule: {
      field1: 'specifications.height',
      field2: 'specifications.maxCpuCoolerHeight',
      operator: 'lte' as RuleOperator,
      description: 'Air cooler height must not exceed case CPU cooler clearance',
    },
    errorMessage_en: 'CPU cooler height ({cooling.height}mm) exceeds case maximum clearance ({case.maxCpuCoolerHeight}mm). Please select a lower-profile cooler or a larger case.',
    errorMessage_sv: 'CPU-kylarens höjd ({cooling.height}mm) överskrider chassiets maximala utrymme ({case.maxCpuCoolerHeight}mm). Välj en lägre kylare eller ett större chassi.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },

  // 16. PSU ↔ Case: PSU form factor compatibility
  {
    ruleType: 'psu_power' as RuleType,
    componentType1: 'psu',
    componentType2: 'case',
    rule: {
      field1: 'specifications.formFactor',
      field2: 'specifications.psuFormFactor',
      operator: 'equals' as RuleOperator,
    },
    errorMessage_en: 'PSU form factor ({psu.formFactor}) is not compatible with case PSU mount ({case.psuFormFactor}). Please select a compatible PSU or case.',
    errorMessage_sv: 'PSU-formfaktor ({psu.formFactor}) är inte kompatibel med chassiets PSU-fäste ({case.psuFormFactor}). Välj en kompatibel PSU eller ett kompatibelt chassi.',
    severity: 'error' as RuleSeverity,
    isActive: true,
  },
];

async function seedCompatibilityRules() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database tables
    await sequelize.sync({ alter: true });

    console.log('\n🗑️  Clearing existing compatibility rules...');
    await PCCompatibilityRule.destroy({ where: {}, truncate: true });

    console.log('📋 Seeding compatibility rules...\n');

    let errorCount = 0;
    let warningCount = 0;

    for (const ruleData of compatibilityRules) {
      const rule = await PCCompatibilityRule.create(ruleData);

      if (rule.severity === 'error') {
        errorCount++;
        console.log(`  ❌ [ERROR] ${rule.ruleType}: ${rule.errorMessage_en.substring(0, 80)}...`);
      } else {
        warningCount++;
        console.log(`  ⚠️  [WARNING] ${rule.ruleType}: ${rule.errorMessage_en.substring(0, 80)}...`);
      }
    }

    console.log(`\n✅ Successfully seeded ${compatibilityRules.length} compatibility rules`);
    console.log(`   - ${errorCount} blocking errors`);
    console.log(`   - ${warningCount} non-blocking warnings`);
    console.log('\n📊 Rules by type:');

    const rulesByType = compatibilityRules.reduce((acc, rule) => {
      acc[rule.ruleType] = (acc[rule.ruleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(rulesByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} rules`);
    });

    console.log('\n🎉 Compatibility rules seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding compatibility rules:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedCompatibilityRules()
  .then(() => {
    console.log('\n✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
