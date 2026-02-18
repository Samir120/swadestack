import sequelize from '../config/database';
import PCComponent from '../models/sequelize/PCComponent';
import { Op } from 'sequelize';

/**
 * One-time script: Clear dummy image URLs from PC components.
 *
 * Sets imageUrl to NULL for every row whose current imageUrl contains
 * "example.com". This allows the frontend fallback (emoji per component
 * type) to kick in instead of rendering a broken image.
 *
 * Usage:  npx ts-node src/scripts/clearDummyImageUrls.ts
 */

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const [rowCount] = await PCComponent.update(
      { imageUrl: null } as any,
      { where: { imageUrl: { [Op.like]: '%example.com%' } } }
    );

    console.log(`Updated ${rowCount} component(s) — imageUrl set to NULL.`);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
