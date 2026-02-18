import PCBuildServiceOption, {
  PriceType,
  PCBuildServiceOptionAttributes
} from '../models/sequelize/PCBuildServiceOption';
import sequelize from '../config/database';

// Type for seed data (without id and timestamps)
type BuildServiceOptionSeed = Omit<PCBuildServiceOptionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

const buildServiceOptions: BuildServiceOptionSeed[] = [
  // 1. DIY - No build service (Default)
  {
    name_en: 'DIY - Build It Yourself',
    name_sv: 'Gör-det-själv - Bygg själv',
    desc_en: 'We will ship all components to you separately. You will be responsible for assembling the PC yourself. Great option if you enjoy building PCs or want to save on service costs.',
    desc_sv: 'Vi skickar alla komponenter till dig separat. Du ansvarar för att montera datorn själv. Ett bra alternativ om du tycker om att bygga datorer eller vill spara på servicekostnader.',
    priceType: 'fixed' as PriceType,
    amount: 0,
    estimatedBuildTime_en: 'N/A - Self assembly',
    estimatedBuildTime_sv: 'N/A - Egen montering',
    warrantyInfo_en: 'Component warranties from individual manufacturers apply (typically 2-3 years). Assembly-related issues are not covered.',
    warrantyInfo_sv: 'Komponentgarantier från enskilda tillverkare gäller (vanligtvis 2-3 år). Monteringsrelaterade problem täcks inte.',
    isActive: true,
    isDefault: true, // Default option
  },

  // 2. Standard Build Service - Fixed price
  {
    name_en: 'Standard Build Service',
    name_sv: 'Standard byggservice',
    desc_en: 'Our technicians will professionally assemble your custom PC with cable management, install Windows 11, and perform stress testing to ensure stability. Includes 1-year assembly warranty.',
    desc_sv: 'Våra tekniker kommer att professionellt montera din anpassade dator med kabelhantering, installera Windows 11 och utföra stresstestning för att säkerställa stabilitet. Inkluderar 1 års monteringsgaranti.',
    priceType: 'fixed' as PriceType,
    amount: 2500,
    estimatedBuildTime_en: '3-5 business days',
    estimatedBuildTime_sv: '3-5 arbetsdagar',
    warrantyInfo_en: 'Component warranties from manufacturers (2-3 years) + 1-year assembly warranty covering build quality, cable management, and stability issues.',
    warrantyInfo_sv: 'Komponentgarantier från tillverkare (2-3 år) + 1 års monteringsgaranti som täcker byggkvalitet, kabelhantering och stabilitetsproblem.',
    isActive: true,
    isDefault: false,
  },

  // 3. Premium Build Service - Fixed price
  {
    name_en: 'Premium Build Service',
    name_sv: 'Premium byggservice',
    desc_en: 'Premium assembly with custom cable sleeving, RGB lighting configuration, BIOS optimization, overclocking (if applicable), extensive stress testing (24hrs), and delivery with protective packaging. Includes 2-year assembly warranty and priority support.',
    desc_sv: 'Premiummontage med anpassad kabelhölje, RGB-belysningskonfiguration, BIOS-optimering, överklockning (om tillämpligt), omfattande stresstestning (24 timmar) och leverans med skyddande förpackning. Inkluderar 2 års monteringsgaranti och prioriterad support.',
    priceType: 'fixed' as PriceType,
    amount: 4999,
    estimatedBuildTime_en: '5-7 business days',
    estimatedBuildTime_sv: '5-7 arbetsdagar',
    warrantyInfo_en: 'Component warranties from manufacturers (2-3 years) + 2-year premium assembly warranty covering build quality, overclocking stability, and aesthetic customization. Priority RMA service included.',
    warrantyInfo_sv: 'Komponentgarantier från tillverkare (2-3 år) + 2 års premium monteringsgaranti som täcker byggkvalitet, överklockning stabilitet och estetisk anpassning. Prioriterad RMA-service ingår.',
    isActive: true,
    isDefault: false,
  },

  // 4. Percentage-Based Build Service (Alternative pricing model)
  {
    name_en: 'Percentage Build Service (10%)',
    name_sv: 'Procentuell byggservice (10%)',
    desc_en: 'Professional PC assembly with a service charge calculated as 10% of the total component cost. Includes Windows 11 installation, stress testing, and 1-year assembly warranty. Ideal for high-end builds where fixed pricing may not be cost-effective.',
    desc_sv: 'Professionell datormontering med en serviceavgift beräknad som 10% av den totala komponentkostnaden. Inkluderar Windows 11-installation, stresstestning och 1 års monteringsgaranti. Perfekt för high-end-byggen där fast prissättning kanske inte är kostnadseffektiv.',
    priceType: 'percentage' as PriceType,
    amount: 10, // 10% of component total
    estimatedBuildTime_en: '3-5 business days',
    estimatedBuildTime_sv: '3-5 arbetsdagar',
    warrantyInfo_en: 'Component warranties from manufacturers (2-3 years) + 1-year assembly warranty covering build quality and stability issues.',
    warrantyInfo_sv: 'Komponentgarantier från tillverkare (2-3 år) + 1 års monteringsgaranti som täcker byggkvalitet och stabilitetsproblem.',
    isActive: false, // Disabled by default, admin can enable if needed
    isDefault: false,
  },

  // 5. Express Build Service - Fixed price (rush orders)
  {
    name_en: 'Express Build Service',
    name_sv: 'Express byggservice',
    desc_en: 'Rush assembly service with priority queue. Your PC will be assembled within 24-48 hours and shipped immediately. Includes standard cable management, Windows 11 installation, and basic stress testing. Perfect for urgent builds.',
    desc_sv: 'Snabbmonteringsservice med prioritetskö. Din dator kommer att monteras inom 24-48 timmar och skickas omedelbart. Inkluderar standard kabelhantering, Windows 11-installation och grundläggande stresstestning. Perfekt för brådskande byggen.',
    priceType: 'fixed' as PriceType,
    amount: 3999,
    estimatedBuildTime_en: '1-2 business days',
    estimatedBuildTime_sv: '1-2 arbetsdagar',
    warrantyInfo_en: 'Component warranties from manufacturers (2-3 years) + 1-year assembly warranty covering build quality and stability issues.',
    warrantyInfo_sv: 'Komponentgarantier från tillverkare (2-3 år) + 1 års monteringsgaranti som täcker byggkvalitet och stabilitetsproblem.',
    isActive: true,
    isDefault: false,
  },
];

async function seedBuildServiceOptions() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync database tables
    await sequelize.sync({ alter: true });

    console.log('\n🗑️  Clearing existing build service options...');
    await PCBuildServiceOption.destroy({ where: {}, truncate: true });

    console.log('🔧 Seeding build service options...\n');

    let fixedCount = 0;
    let percentageCount = 0;
    let activeCount = 0;

    for (const optionData of buildServiceOptions) {
      const option = await PCBuildServiceOption.create(optionData);

      const priceDisplay = option.priceType === 'fixed'
        ? `${option.amount} SEK`
        : `${option.amount}%`;

      const statusBadge = option.isActive ? '✅' : '⏸️ ';
      const defaultBadge = option.isDefault ? ' [DEFAULT]' : '';

      console.log(`  ${statusBadge} ${option.name_en} - ${priceDisplay}${defaultBadge}`);
      console.log(`     ${(option.desc_en || '').substring(0, 100)}...`);
      console.log(`     Build time: ${option.estimatedBuildTime_en || 'N/A'}\n`);

      if (option.priceType === 'fixed') fixedCount++;
      else percentageCount++;

      if (option.isActive) activeCount++;
    }

    console.log(`✅ Successfully seeded ${buildServiceOptions.length} build service options`);
    console.log(`   - ${fixedCount} fixed-price options`);
    console.log(`   - ${percentageCount} percentage-based options`);
    console.log(`   - ${activeCount} active options`);
    console.log(`   - ${buildServiceOptions.length - activeCount} inactive options`);

    // Display price comparison table
    console.log('\n💰 Price Comparison (for 25,000 SEK component total):');
    console.log('┌─────────────────────────────┬──────────────┬───────────────┐');
    console.log('│ Service Option              │ Price Type   │ Service Cost  │');
    console.log('├─────────────────────────────┼──────────────┼───────────────┤');

    for (const option of buildServiceOptions.filter(o => o.isActive)) {
      const serviceCost = option.priceType === 'fixed'
        ? option.amount
        : (25000 * option.amount) / 100;

      const priceTypeDisplay = option.priceType === 'fixed' ? 'Fixed      ' : `${option.amount}%        `;
      const name = option.name_en.padEnd(27);
      const cost = `${serviceCost.toLocaleString('sv-SE')} SEK`.padStart(13);

      console.log(`│ ${name} │ ${priceTypeDisplay} │ ${cost} │`);
    }

    console.log('└─────────────────────────────┴──────────────┴───────────────┘');

    console.log('\n🎉 Build service options seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding build service options:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedBuildServiceOptions()
  .then(() => {
    console.log('\n✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
