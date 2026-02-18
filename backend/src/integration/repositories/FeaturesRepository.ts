import { BaseDAO } from '../dao/BaseDAO';
import Feature from '../../models/sequelize/Feature';

export class FeaturesRepository extends BaseDAO<Feature> {
  constructor() {
    super(Feature);
  }

  async findActive(): Promise<Feature[]> {
    return await this.model.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC']],
    });
  }

  async findAllFeatures(): Promise<Feature[]> {
    return await this.model.findAll({
      order: [['displayOrder', 'ASC']],
    });
  }

  async toggleActive(id: string): Promise<Feature | null> {
    const item = await this.findById(id);
    if (!item) return null;

    item.isActive = !item.isActive;
    await item.save();
    return item;
  }

  async updateOrder(id: string, displayOrder: number): Promise<void> {
    await this.model.update({ displayOrder }, { where: { id } as any });
  }
}

export default FeaturesRepository;
