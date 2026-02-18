import { BaseDAO } from '../dao/BaseDAO';
import ServiceCategory from '../../models/sequelize/ServiceCategory';

export class ServiceCategoryRepository extends BaseDAO<ServiceCategory> {
  constructor() {
    super(ServiceCategory);
  }

  /**
   * Find all active categories ordered by displayOrder
   */
  async findAllActive(): Promise<ServiceCategory[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
    });
  }

  /**
   * Find all categories ordered by displayOrder (admin)
   */
  async findAllOrdered(): Promise<ServiceCategory[]> {
    return await this.model.findAll({
      order: [['displayOrder', 'ASC']],
    });
  }

  /**
   * Update display order for a category
   */
  async updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
    await this.model.update({ displayOrder }, { where: { id } as any });
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<ServiceCategory | null> {
    const category = await this.findById(id);
    if (!category) return null;

    category.isActive = !category.isActive;
    await category.save();
    return category;
  }
}

export default ServiceCategoryRepository;
