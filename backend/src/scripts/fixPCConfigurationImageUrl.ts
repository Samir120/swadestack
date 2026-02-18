/**
 * Fix script to change imageUrl column from VARCHAR(500) to TEXT
 * This is needed to support base64-encoded images
 */
import sequelize from '../config/database';

async function fixPCConfigurationImageUrl(): Promise<void> {
  try {
    console.log('🔧 Fixing PCConfigurations imageUrl column to TEXT type...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Alter the column type to TEXT
    await sequelize.query(`
      ALTER TABLE "PCConfigurations"
      ALTER COLUMN "imageUrl" TYPE TEXT;
    `);

    console.log('✅ Successfully altered imageUrl column to TEXT type');
    console.log('\n🎉 Fix complete! Base64 images can now be stored in imageUrl.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing column:', error);
    process.exit(1);
  }
}

fixPCConfigurationImageUrl();
