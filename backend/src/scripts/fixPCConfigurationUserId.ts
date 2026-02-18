/**
 * Fix script to allow NULL userId in PCConfigurations table
 * This is needed for pre-configured PCs (admin-created PCs without a user)
 */
import sequelize from '../config/database';

async function fixPCConfigurationUserId(): Promise<void> {
  try {
    console.log('🔧 Fixing PCConfigurations userId column to allow NULL...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Alter the column to allow NULL
    await sequelize.query(`
      ALTER TABLE "PCConfigurations"
      ALTER COLUMN "userId" DROP NOT NULL;
    `);

    console.log('✅ Successfully altered userId column to allow NULL values');
    console.log('\n🎉 Fix complete! Pre-configured PCs can now be created without a userId.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing column:', error);
    process.exit(1);
  }
}

fixPCConfigurationUserId();
