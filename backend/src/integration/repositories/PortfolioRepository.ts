import { BaseDAO } from '../dao/BaseDAO';
import PortfolioItem, { PortfolioItemAttributes } from '../../models/sequelize/PortfolioItem';
import { Op } from 'sequelize';

export class PortfolioRepository extends BaseDAO<PortfolioItem> {
  constructor() {
    super(PortfolioItem);
  }

  /**
   * Find all published portfolio items
   */
  async findPublished(
    limit?: number,
    offset?: number,
    category?: string
  ): Promise<{ items: PortfolioItem[]; total: number }> {
    const where: any = { isPublished: true };
    
    if (category) {
      where.category = category;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['featured', 'DESC'],
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit: limit || 50,
      offset: offset || 0,
    });

    return { items: rows, total: count };
  }

  /**
   * Find ALL portfolio items (admin only - includes unpublished)
   */
  async findAllPaginated(
    limit?: number,
    offset?: number,
    category?: string
  ): Promise<{ items: PortfolioItem[]; total: number }> {
    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      order: [
        ['featured', 'DESC'],
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit: limit || 100,
      offset: offset || 0,
    });

    return { items: rows, total: count };
  }

  /**
   * Find featured portfolio items
   */
  async findFeatured(limit: number = 6): Promise<PortfolioItem[]> {
    return await this.model.findAll({
      where: {
        featured: true,
        isPublished: true,
      },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });
  }

  /**
   * Find portfolio items by category
   */
  async findByCategory(category: string): Promise<PortfolioItem[]> {
    return await this.model.findAll({
      where: {
        category,
        isPublished: true,
      },
      order: [['order', 'ASC']],
    });
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const items = await this.model.findAll({
      attributes: ['category'],
      where: { isPublished: true },
      group: ['category'],
    });
    
    return items.map(item => item.category);
  }

  /**
   * Update portfolio item order
   */
  async updateOrder(id: string, order: number): Promise<void> {
    await this.model.update({ order }, { where: { id } });
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<PortfolioItem | null> {
    const item = await this.findById(id);
    if (!item) return null;

    item.featured = !item.featured;
    await item.save();
    return item;
  }
}

export default PortfolioRepository;
