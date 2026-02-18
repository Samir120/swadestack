import * as path from 'path';
import { execSync } from 'child_process';
import sequelize from '../config/database';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║   PC Configuration System - Master Seed Script                ║');
console.log('║   Seeds: Components, Compatibility Rules, Build Services      ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function runSeedScript(scriptName: string, description: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Running: ${description}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    const scriptPath = path.join(__dirname, scriptName);
    execSync(`ts-node "${scriptPath}"`, { stdio: 'inherit' });
    console.log(`\n✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${description} failed:`, error);
    return false;
  }
}

async function masterSeed() {
  const startTime = Date.now();

  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Track success/failure
    const results = {
      components: false,
      compatibilityRules: false,
      buildServices: false,
    };

    // Seed PC Components (CPUs, Motherboards, RAM, GPU, Storage, PSU, Case, Cooling)
    results.components = await runSeedScript(
      'seedPCComponents.ts',
      'PC Components Seed (118 components across 12 types)'
    );

    if (!results.components) {
      console.log('\n⚠️  PC Components seed failed. Continuing with other seeds...\n');
    }

    // Seed Compatibility Rules
    results.compatibilityRules = await runSeedScript(
      'seedPCCompatibilityRules.ts',
      'PC Compatibility Rules Seed (16 validation rules)'
    );

    if (!results.compatibilityRules) {
      console.log('\n⚠️  Compatibility Rules seed failed. Continuing with other seeds...\n');
    }

    // Seed Build Service Options
    results.buildServices = await runSeedScript(
      'seedPCBuildServiceOptions.ts',
      'PC Build Service Options Seed (5 service options)'
    );

    if (!results.buildServices) {
      console.log('\n⚠️  Build Service Options seed failed.\n');
    }

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                    SEED SUMMARY                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log(`📦 PC Components:        ${results.components ? '✅ Success' : '❌ Failed'}`);
    console.log(`📋 Compatibility Rules:  ${results.compatibilityRules ? '✅ Success' : '❌ Failed'}`);
    console.log(`🔧 Build Services:       ${results.buildServices ? '✅ Success' : '❌ Failed'}`);

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    console.log(`\n📊 Success Rate: ${successCount}/${totalCount} (${((successCount / totalCount) * 100).toFixed(0)}%)`);
    console.log(`⏱️  Total Duration: ${duration} seconds`);

    if (successCount === totalCount) {
      console.log('\n🎉 All seed scripts completed successfully!');
      console.log('\n📌 Next Steps:');
      console.log('   1. Start the backend server: cd backend && npm run dev');
      console.log('   2. Test API endpoints using Postman or Insomnia');
      console.log('   3. Verify data in PostgreSQL database');
      console.log('   4. Begin frontend implementation (Redux slices, PC Builder UI)');
      console.log('\n💡 API Base URL: http://localhost:5000/api');
      console.log('   - GET /api/pc-components?type=cpu');
      console.log('   - GET /api/pc-build-services');
      console.log('   - POST /api/pc-configurations (requires authentication)');
    } else {
      console.log('\n⚠️  Some seed scripts failed. Please check the error logs above.');
      console.log('   You may need to:');
      console.log('   - Verify database connection settings in .env');
      console.log('   - Ensure PostgreSQL is running');
      console.log('   - Check for schema conflicts or missing migrations');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Master seed script encountered an error:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run the master seed
masterSeed()
  .then(() => {
    console.log('✨ Master seed script finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Master seed script failed:', error);
    process.exit(1);
  });
