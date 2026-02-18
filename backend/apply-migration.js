/**
 * Quick script to apply the serviceDescription column migration
 * Run with: node apply-migration.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function applyMigration() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: console.log,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'OrderItems'
      AND column_name = 'serviceDescription';
    `);

    if (results.length > 0) {
      console.log('✓ Column serviceDescription already exists in OrderItems table');
    } else {
      console.log('Adding serviceDescription column to OrderItems table...');

      await sequelize.query(`
        ALTER TABLE "OrderItems"
        ADD COLUMN "serviceDescription" TEXT;
      `);

      console.log('✓ Column serviceDescription added successfully!');
    }

    // Show sample data
    console.log('\nChecking OrderItems structure:');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'OrderItems'
      ORDER BY ordinal_position;
    `);

    console.table(columns);

    await sequelize.close();
    console.log('\n✓ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
