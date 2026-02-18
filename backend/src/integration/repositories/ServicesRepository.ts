import { Op } from 'sequelize';
import { BaseDAO } from '../dao/BaseDAO';
import Service from '../../models/sequelize/Service';
import ServiceCategory from '../../models/sequelize/ServiceCategory';

export class ServicesRepository extends BaseDAO<Service> {
  constructor() {
    super(Service);
  }

  /**
   * Find all services (for admin - includes inactive)
   */
  async findAllServices(
    limit?: number,
    offset?: number,
    category?: string
  ): Promise<{ services: Service[]; total: number }> {
    const where: any = {};

    if (category) {
      where.category = category;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { services: rows, total: count };
  }

  /**
   * Find all active services
   */
  async findActive(
    limit?: number,
    offset?: number,
    category?: string
  ): Promise<{ services: Service[]; total: number }> {
    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { services: rows, total: count };
  }

  /**
   * Find service by ID (only if active)
   */
  async findActiveById(id: string): Promise<Service | null> {
    return await this.model.findOne({
      where: {
        id,
        isActive: true,
      },
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
    });
  }

  /**
   * Find services by IDs (bulk)
   */
  async findByIds(ids: string[]): Promise<Service[]> {
    return await this.model.findAll({
      where: {
        id: ids,
        isActive: true,
      },
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
    });
  }

  /**
   * Find services by category ID
   */
  async findByCategoryId(serviceCategoryId: string): Promise<Service[]> {
    return await this.model.findAll({
      where: {
        serviceCategoryId,
        isActive: true,
      },
      include: [{ model: ServiceCategory, as: 'serviceCategory' }],
      order: [['price', 'ASC']],
    });
  }

  /**
   * Toggle service active status
   */
  async toggleActive(id: string): Promise<Service | null> {
    const service = await this.findById(id);
    if (!service) return null;

    service.isActive = !service.isActive;
    await service.save();
    return service;
  }

  /**
   * Clear isPopular on all services in a category except the given one
   */
  async clearPopularInCategory(serviceCategoryId: string, excludeId: string): Promise<void> {
    await this.model.update(
      { isPopular: false } as any,
      { where: { serviceCategoryId, id: { [Op.ne]: excludeId } } }
    );
  }

  /**
   * Update service price
   */
  async updatePrice(id: string, price: number): Promise<void> {
    await this.model.update({ price }, { where: { id } });
  }
}

export default ServicesRepository;
