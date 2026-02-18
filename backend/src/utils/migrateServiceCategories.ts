import { QueryTypes } from 'sequelize';
import { sequelize } from '../models/sequelize';
import ServiceCategory from '../models/sequelize/ServiceCategory';

/**
 * One-time migration helper: converts existing category strings on Services
 * into ServiceCategory entities and updates the FK reference.
 * Only runs if there are services with a category string but no serviceCategoryId.
 */
export async function migrateServiceCategories(): Promise<void> {
  try {
    // Check if serviceCategoryId column exists yet (it may not on first run before sync)
    const tableDesc = await sequelize.getQueryInterface().describeTable('Services').catch(() => null);
    if (!tableDesc || !('serviceCategoryId' in tableDesc)) {
      console.log('[migrateServiceCategories] serviceCategoryId column not yet created, skipping.');
      return;
    }

    // Find distinct category strings that haven't been migrated
    const results = await sequelize.query<{ category: string }>(
      `SELECT DISTINCT category FROM "Services" WHERE category IS NOT NULL AND category != '' AND "serviceCategoryId" IS NULL`,
      { type: QueryTypes.SELECT }
    );

    if (results.length === 0) {
      console.log('[migrateServiceCategories] No categories to migrate.');
      return;
    }

    console.log(`[migrateServiceCategories] Found ${results.length} categories to migrate: ${results.map(r => r.category).join(', ')}`);

    for (const row of results) {
      // Check if a ServiceCategory with this name already exists
      let serviceCategory = await ServiceCategory.findOne({
        where: { name_en: row.category },
      });

      if (!serviceCategory) {
        serviceCategory = await ServiceCategory.create({
          name_en: row.category,
          name_sv: row.category,
          displayOrder: 0,
          isActive: true,
        });
        console.log(`[migrateServiceCategories] Created ServiceCategory: "${row.category}" (${serviceCategory.id})`);
      }

      // Update services with this category string to use the FK
      const [updateCount] = await sequelize.query(
        `UPDATE "Services" SET "serviceCategoryId" = :categoryId WHERE category = :categoryName AND "serviceCategoryId" IS NULL`,
        {
          replacements: { categoryId: serviceCategory.id, categoryName: row.category },
          type: QueryTypes.UPDATE,
        }
      );

      console.log(`[migrateServiceCategories] Updated ${updateCount} services for category "${row.category}"`);
    }

    console.log('[migrateServiceCategories] Migration complete.');
  } catch (error) {
    console.error('[migrateServiceCategories] Error during migration:', error);
  }
}
