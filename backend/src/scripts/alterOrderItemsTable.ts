/**
 * Script to alter OrderItems table for PC Configuration support
 * Run with: npx ts-node src/scripts/alterOrderItemsTable.ts
 */

import sequelize from '../config/database';

async function alterOrderItemsTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    console.log('\n1. Making serviceId nullable...');
    await sequelize.query(`
      ALTER TABLE "OrderItems"
      ALTER COLUMN "serviceId" DROP NOT NULL;
    `);
    console.log('   Done.');

    console.log('\n2. Checking if pcConfigurationId column exists...');
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'OrderItems' AND column_name = 'pcConfigurationId';
    `);

    if ((results as any[]).length === 0) {
      console.log('   Column does not exist, adding it...');
      await sequelize.query(`
        ALTER TABLE "OrderItems"
        ADD COLUMN "pcConfigurationId" UUID REFERENCES "PCConfigurations"("id") ON DELETE RESTRICT;
      `);
      console.log('   Column added.');

      console.log('\n3. Creating index on pcConfigurationId...');
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS "order_items_pc_configuration_id" ON "OrderItems" ("pcConfigurationId");
      `);
      console.log('   Index created.');
    } else {
      console.log('   Column already exists, skipping.');
    }

    console.log('\n✓ OrderItems table updated successfully for PC Configuration support.');
    process.exit(0);
  } catch (error) {
    console.error('Error altering table:', error);
    process.exit(1);
  }
}

alterOrderItemsTable();
