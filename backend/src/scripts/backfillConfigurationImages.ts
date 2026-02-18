/**
 * Backfill imageUrl for existing PC Configuration component snapshots
 *
 * This script updates existing configurations to include imageUrl from the PCComponent table
 * Run with: npx ts-node src/scripts/backfillConfigurationImages.ts
 */

import sequelize from '../config/database';
import PCConfiguration from '../models/sequelize/PCConfiguration';
import PCComponent from '../models/sequelize/PCComponent';

async function backfillConfigurationImages() {
  try {
    console.log('Starting backfill of configuration images...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Get all configurations
    const configurations = await PCConfiguration.findAll();
    console.log(`Found ${configurations.length} configurations to process\n`);

    let updatedCount = 0;
    let componentUpdates = 0;

    for (const config of configurations) {
      const components = config.components;
      if (!components || Object.keys(components).length === 0) {
        continue;
      }

      let configModified = false;
      const updatedComponents = { ...components };

      // Process single components
      const singleComponentTypes = ['cpu', 'motherboard', 'psu', 'case', 'cooling', 'optical', 'os'];
      for (const type of singleComponentTypes) {
        const comp = (updatedComponents as any)[type];
        if (comp && comp.id && !comp.imageUrl) {
          // Look up the component to get its imageUrl
          const dbComponent = await PCComponent.findByPk(comp.id);
          if (dbComponent && dbComponent.imageUrl) {
            comp.imageUrl = dbComponent.imageUrl;
            configModified = true;
            componentUpdates++;
            console.log(`  Updated ${type}: ${comp.name_en} with image`);
          }
        }
      }

      // Process array components
      const arrayComponentTypes = ['rams', 'gpus', 'ssds', 'hdds', 'fans'];
      for (const type of arrayComponentTypes) {
        const compArray = (updatedComponents as any)[type];
        if (Array.isArray(compArray)) {
          for (const comp of compArray) {
            if (comp && comp.id && !comp.imageUrl) {
              const dbComponent = await PCComponent.findByPk(comp.id);
              if (dbComponent && dbComponent.imageUrl) {
                comp.imageUrl = dbComponent.imageUrl;
                configModified = true;
                componentUpdates++;
                console.log(`  Updated ${type.slice(0, -1)}: ${comp.name_en} with image`);
              }
            }
          }
        }
      }

      if (configModified) {
        await config.update({ components: updatedComponents });
        updatedCount++;
        console.log(`✓ Updated configuration: ${config.name_en || config.id}\n`);
      }
    }

    console.log('\n========================================');
    console.log(`Backfill complete!`);
    console.log(`  Configurations updated: ${updatedCount}`);
    console.log(`  Component images added: ${componentUpdates}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

backfillConfigurationImages();
