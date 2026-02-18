/**
 * Migration script to add buildServiceSnapshot JSON column to PCConfigurations table
 * This stores the selected build service option details for pre-configured PCs
 */
import sequelize from '../config/database';

async function addBuildServiceSnapshot(): Promise<void> {
  try {
    console.log('🔧 Adding buildServiceSnapshot column to PCConfigurations table...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'PCConfigurations' AND column_name = 'buildServiceSnapshot';
    `);

    if (Array.isArray(results) && results.length > 0) {
      console.log('ℹ️ buildServiceSnapshot column already exists, skipping migration');
      process.exit(0);
    }

    // Add the buildServiceSnapshot column as JSON type
    await sequelize.query(`
      ALTER TABLE "PCConfigurations"
      ADD COLUMN "buildServiceSnapshot" JSON;
    `);

    console.log('✅ Successfully added buildServiceSnapshot column');
    console.log('\n🎉 Migration complete! Build service details can now be stored.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

addBuildServiceSnapshot();
