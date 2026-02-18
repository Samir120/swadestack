/**
 * Migration script to add imageUrls JSON column to PCConfigurations table
 * This supports multiple images per pre-configured PC
 */
import sequelize from '../config/database';

async function addPCConfigurationImageUrls(): Promise<void> {
  try {
    console.log('🔧 Adding imageUrls column to PCConfigurations table...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'PCConfigurations' AND column_name = 'imageUrls';
    `);

    if (Array.isArray(results) && results.length > 0) {
      console.log('ℹ️ imageUrls column already exists, skipping migration');
      process.exit(0);
    }

    // Add the imageUrls column as JSON type with default empty array
    await sequelize.query(`
      ALTER TABLE "PCConfigurations"
      ADD COLUMN "imageUrls" JSON DEFAULT '[]'::json;
    `);

    console.log('✅ Successfully added imageUrls column');

    // Migrate existing imageUrl values to imageUrls array
    await sequelize.query(`
      UPDATE "PCConfigurations"
      SET "imageUrls" = CASE
        WHEN "imageUrl" IS NOT NULL AND "imageUrl" != ''
        THEN json_build_array("imageUrl")
        ELSE '[]'::json
      END
      WHERE "imageUrls" IS NULL OR "imageUrls" = '[]'::json;
    `);

    console.log('✅ Migrated existing imageUrl values to imageUrls array');
    console.log('\n🎉 Migration complete! Multiple images are now supported.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

addPCConfigurationImageUrls();
