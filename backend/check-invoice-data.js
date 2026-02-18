/**
 * Check if orders have service descriptions
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

async function checkData() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();

    // Check OrderItems with their descriptions
    const [items] = await sequelize.query(`
      SELECT
        oi.id,
        oi."serviceName",
        oi."serviceDescription",
        oi."createdAt",
        o."orderNumber"
      FROM "OrderItems" oi
      JOIN "Orders" o ON o.id = oi."orderId"
      ORDER BY oi."createdAt" DESC
      LIMIT 10;
    `);

    console.log('\nRecent OrderItems with descriptions:');
    console.table(items.map(item => ({
      orderNumber: item.orderNumber,
      serviceName: item.serviceName,
      hasDescription: item.serviceDescription ? 'Yes' : 'No',
      descriptionLength: item.serviceDescription ? item.serviceDescription.length : 0,
      createdAt: item.createdAt.toISOString().split('T')[0]
    })));

    // Check if any items are missing descriptions
    const [missingCount] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "OrderItems"
      WHERE "serviceDescription" IS NULL;
    `);

    console.log(`\nOrderItems without descriptions: ${missingCount[0].count}`);

    // Show a sample description if available
    const [sampleItem] = await sequelize.query(`
      SELECT "serviceName", "serviceDescription"
      FROM "OrderItems"
      WHERE "serviceDescription" IS NOT NULL
      LIMIT 1;
    `);

    if (sampleItem.length > 0) {
      console.log('\nSample service with description:');
      console.log(`Name: ${sampleItem[0].serviceName}`);
      console.log(`Description: ${sampleItem[0].serviceDescription.substring(0, 100)}...`);
    } else {
      console.log('\n⚠️  No OrderItems have descriptions yet. New orders will include descriptions.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkData();
