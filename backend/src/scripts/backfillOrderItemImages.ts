/**
 * Backfill imageUrl for existing Order Item PC Configuration snapshots
 *
 * This script updates existing order items to include imageUrl from the PCComponent table
 * Run with: npx ts-node src/scripts/backfillOrderItemImages.ts
 */

import sequelize from '../config/database';
import OrderItem from '../models/sequelize/OrderItem';
import PCComponent from '../models/sequelize/PCComponent';

async function backfillOrderItemImages() {
  try {
    console.log('Starting backfill of order item images...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Get all order items that are PC configurations
    const orderItems = await OrderItem.findAll({
      where: {
        serviceName: 'Custom PC Configuration',
      },
    });

    console.log(`Found ${orderItems.length} PC configuration order items to process\n`);

    let updatedCount = 0;
    let componentUpdates = 0;

    for (const orderItem of orderItems) {
      if (!orderItem.serviceDescription) {
        continue;
      }

      try {
        const configData = JSON.parse(orderItem.serviceDescription);
        if (!configData.components) {
          continue;
        }

        let modified = false;
        const components = configData.components;

        // Process single components
        const singleComponentTypes = ['cpu', 'motherboard', 'psu', 'case', 'cooling', 'optical', 'os'];
        for (const type of singleComponentTypes) {
          const comp = components[type];
          if (comp && comp.id && !comp.imageUrl) {
            const dbComponent = await PCComponent.findByPk(comp.id);
            if (dbComponent && dbComponent.imageUrl) {
              comp.imageUrl = dbComponent.imageUrl;
              modified = true;
              componentUpdates++;
              console.log(`  Updated ${type}: ${comp.name_en} with image`);
            }
          }
        }

        // Process array components
        const arrayComponentTypes = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
        for (const type of arrayComponentTypes) {
          const compArray = components[type];
          if (Array.isArray(compArray)) {
            for (const comp of compArray) {
              if (comp && comp.id && !comp.imageUrl) {
                const dbComponent = await PCComponent.findByPk(comp.id);
                if (dbComponent && dbComponent.imageUrl) {
                  comp.imageUrl = dbComponent.imageUrl;
                  modified = true;
                  componentUpdates++;
                  console.log(`  Updated ${type.slice(0, -1)}: ${comp.name_en} with image`);
                }
              }
            }
          }
        }

        if (modified) {
          await orderItem.update({
            serviceDescription: JSON.stringify(configData),
          });
          updatedCount++;
          console.log(`✓ Updated order item: ${orderItem.id}\n`);
        }
      } catch (e) {
        console.warn(`  Skipping order item ${orderItem.id} - invalid JSON`);
      }
    }

    console.log('\n========================================');
    console.log(`Backfill complete!`);
    console.log(`  Order items updated: ${updatedCount}`);
    console.log(`  Component images added: ${componentUpdates}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

backfillOrderItemImages();
